/* =========================================================================
   js/licoes/ga-12.js — Geometria Analítica, Lição 12: Aplicação com dados reais
   Distância entre capitais brasileiras pelo globo, com os dados do IBGE:
     1. converte latitude e longitude (graus, minutos, segundos) para decimal
        e depois para um vetor do espaço, P = R·(cos φ cos λ, cos φ sen λ, sen φ);
     2. acha o ângulo central pelo produto escalar e as distâncias pelo arco
        (R·θ) e pela corda (|P − Q|), comparando com a distância oficial
        quando uma das cidades é Brasília;
     3. acha o plano da rota (normal û × v̂) e a distância de uma terceira
        cidade até ele;
     4. desenha o globo (js/componentes/espaco.js) com os vetores, o arco e a corda.

   Fonte dos dados: IBGE, Anuário Estatístico do Brasil, Tabela 1.1.1.2 –
   Localização geográfica, altitude e distância a Brasília, segundo os
   Municípios das Capitais – 2025. Coordenadas no datum SIRGAS2000; distância
   em linha reta pelo modelo elipsoidal; distância rodoviária do DNIT.

   Índice
   1. Dados
   2. Elementos
   3. Contas
   4. Textos
   5. Desenho
   6. Resultados
   7. Atualização geral
   8. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. DADOS (copiados da tabela do IBGE, na mesma ordem)
     [nome, UF, latitude, longitude, km em linha reta até Brasília, km pela estrada]
     A latitude de Maceió aparece na tabela como −90°39'35.65", um erro de
     digitação (latitude não passa de 90°); usamos −09°39'35.65", que bate
     com a distância oficial até Brasília.
     ======================================================================= */
  const CAPITAIS = [
    ['Porto Velho', 'RO', '-08°44\'57.75"', '-63°54\'38.25"', 1905.639, 2589],
    ['Rio Branco', 'AC', '-09°58\'20.64"', '-67°48\'36.36"', 2252.224, 3123],
    ['Manaus', 'AM', '-03°05\'31.76"', '-60°03\'37.58"', 1934.925, 3490],
    ['Boa Vista', 'RR', '+02°49\'16.26"', '-60°40\'22.74"', 2491.911, 4275],
    ['Belém', 'PA', '-01°27\'19.38"', '-48°30\'18.52"', 1586.200, 2120],
    ['Macapá', 'AP', '+00°02\'26.67"', '-51°03\'26.55"', 1784.176, null],
    ['Palmas', 'TO', '-10°11\'04.20"', '-48°20\'01.32"', 621.229, 973],
    ['São Luís', 'MA', '-02°31\'38.62"', '-44°18\'21.93"', 1518.566, 2157],
    ['Teresina', 'PI', '-05°05\'27.99"', '-42°48\'41.81"', 1307.451, 1789],
    ['Fortaleza', 'CE', '-03°43\'31.47"', '-38°31\'25.01"', 1683.753, 2285],
    ['Natal', 'RN', '-05°49\'48.45"', '-35°12\'46.14"', 1770.374, 2507],
    ['João Pessoa', 'PB', '-07°10\'07.50"', '-34°51\'49.58"', 1711.523, 2230],
    ['Recife', 'PE', '-08°03\'47.39"', '-34°52\'16.10"', 1656.072, 2220],
    ['Maceió', 'AL', '-09°39\'35.65"', '-35°44\'26.20"', 1484.261, 2013, 'corrigida'],
    ['Aracaju', 'SE', '-10°56\'39.91"', '-37°04\'08.50"', 1290.012, 1748],
    ['Salvador', 'BA', '-12°58\'27.12"', '-38°30\'44.64"', 1059.810, 1531],
    ['Belo Horizonte', 'MG', '-19°55\'25.32"', '-43°56\'10.68"', 622.103, 716],
    ['Vitória', 'ES', '-20°19\'16.32"', '-40°20\'21.48"', 945.390, 1238],
    ['Rio de Janeiro', 'RJ', '-22°54\'39.96"', '-43°12\'20.52"', 930.628, 1148],
    ['São Paulo', 'SP', '-23°32\'51.78"', '-46°38\'15.52"', 869.665, 1015],
    ['Curitiba', 'PR', '-25°24\'47.87"', '-49°16\'04.47"', 1075.415, 1366],
    ['Florianópolis', 'SC', '-27°35\'51.00"', '-48°32\'58.92"', 1309.739, 1673],
    ['Porto Alegre', 'RS', '-30°01\'41.43"', '-51°13\'42.91"', 1613.540, 2027],
    ['Campo Grande', 'MS', '-20°27\'45.36"', '-54°36\'30.96"', 877.810, 1134],
    ['Cuiabá', 'MT', '-15°34\'03.48"', '-56°04\'30.01"', 875.808, 1133],
    ['Goiânia', 'GO', '-16°40\'48.82"', '-49°15\'23.23"', 174.954, 209],
    ['Brasília', 'DF', '-15°47\'03.48"', '-47°54\'29.16"', null, null],
  ];
  const BRASILIA = CAPITAIS.findIndex((c) => c[0] === 'Brasília');
  const R = 6371;          // raio médio da Terra, em km
  const ESCALA = 1 / 1000; // o desenho usa milhares de km


  /* =======================================================================
     2. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g12-espaco');
  if (!svg) return;

  const selA = document.getElementById('g12-cidade-a');
  const selB = document.getElementById('g12-cidade-b');
  const selC = document.getElementById('g12-cidade-c');
  const giro = document.getElementById('g12-giro');
  const giroValor = document.getElementById('g12-giro-valor');
  const btnVista = document.getElementById('g12-vista');
  const btnTrocar = document.getElementById('g12-trocar');
  const chkCorda = document.getElementById('g12-corda');
  const chkCirculo = document.getElementById('g12-circulo');
  const chkTodas = document.getElementById('g12-todas');
  const resultados = document.getElementById('g12-resultados');

  const AZIMUTE_BRASIL = -10;   // vista oblíqua: o Brasil de frente, mas os vetores ainda aparecem
  const ELEVACAO_BRASIL = 10;

  const espaco = criarEspaco3D(svg, {
    aoGirar: (azimute) => {
      giro.value = azimute;
      giroValor.textContent = formatarNumero(azimute) + '°';
    },
  });
  espaco.definirAlcance(7);


  /* =======================================================================
     3. CONTAS
     ======================================================================= */
  /** "-15°47'03.48"" → { graus: 15, minutos: 47, segundos: 3.48, sinal: −1, valor: −15.7843 } */
  function lerGMS(texto) {
    const m = /([+-])(\d+)°(\d+)'([\d.]+)"/.exec(texto);
    const sinal = m[1] === '-' ? -1 : 1;
    const graus = Number(m[2]), minutos = Number(m[3]), segundos = Number(m[4]);
    return { sinal, graus, minutos, segundos, valor: sinal * (graus + minutos / 60 + segundos / 3600) };
  }

  const RAD = Math.PI / 180;

  /** Cidade pronta para as contas: decimais, vetor unitário û e ponto P (km). */
  function cidade(i) {
    const [nome, uf, latTxt, lonTxt, reta, estrada, corrigida] = CAPITAIS[i];
    const lat = lerGMS(latTxt), lon = lerGMS(lonTxt);
    const f = lat.valor * RAD, l = lon.valor * RAD;
    const u = { x: Math.cos(f) * Math.cos(l), y: Math.cos(f) * Math.sin(l), z: Math.sin(f) };
    return { i, nome, uf, latTxt, lonTxt, lat, lon, u, P: multiplicarPorEscalar3(R, u), reta, estrada, corrigida: !!corrigida };
  }

  const TODAS = CAPITAIS.map((_, i) => cidade(i));


  /* =======================================================================
     4. TEXTOS
     ======================================================================= */
  const VET = (nome) => '<span class="vet">' + nome + '</span>';
  const n4 = (x) => formatarNumero(x, 4);
  const terna4 = (v) => '(' + [v.x, v.y, v.z].map(n4).join('; ') + ')';
  const km = (x, casas) => formatarNumero(x, casas === undefined ? 1 : casas).replace(/\./g, ' ');
  const ternaKm = (v) => '(' + [v.x, v.y, v.z].map((c) => km(c, 0)).join('; ') + ')';
  const p4 = (x) => (x < 0 ? '(' + n4(x) + ')' : n4(x));

  /** "−(15 + 47/60 + 3,48/3600) = −15,7843°" */
  function contaDecimal(g) {
    const dentro = g.graus + ' + ' + g.minutos + '/60 + ' + formatarNumero(g.segundos) + '/3600';
    return (g.sinal < 0 ? '−(' + dentro + ')' : dentro) + ' = ' + n4(g.valor) + '°';
  }

  const rotulo = (c) => c.nome + ' (' + c.uf + ')';


  /* =======================================================================
     5. DESENHO
     ======================================================================= */
  const lista = (v) => [v.x, v.y, v.z];
  const vezes = (k, a) => a.map((c) => k * c);
  const RD = R * ESCALA;   // raio no desenho

  /** Ponto da esfera (no desenho) para latitude e longitude em graus. */
  const naEsfera = (latG, lonG) => {
    const f = latG * RAD, l = lonG * RAD;
    return [RD * Math.cos(f) * Math.cos(l), RD * Math.cos(f) * Math.sin(l), RD * Math.sin(f)];
  };

  /** Interpolação esférica entre dois vetores unitários (pontos do arco do círculo máximo). */
  function arco(ua, ub, raio, passos) {
    const a = lista(ua), b = lista(ub);
    const cosT = Math.max(-1, Math.min(1, produtoEscalar3(ua, ub)));
    const t = Math.acos(cosT);
    if (t < 1e-9) return [vezes(raio, a)];
    const pts = [];
    for (let k = 0; k <= passos; k++) {
      const s = (k / passos) * t;
      const ca = Math.sin(t - s) / Math.sin(t), cb = Math.sin(s) / Math.sin(t);
      pts.push(a.map((c, i) => raio * (ca * c + cb * b[i])));
    }
    return pts;
  }

  function desenhar(A, B, C) {
    // Esta função é chamada de novo a cada giro, então a vista é lida aqui dentro.
    espaco.definirDesenho((e) => {
      // Direção de quem olha, para esconder o que fica atrás do globo.
      const t = espaco.azimute * RAD, f = espaco.elevacao * RAD;
      const olho = [Math.cos(t) * Math.cos(f), Math.sin(t) * Math.cos(f), Math.sin(f)];
      const horizontal = [-Math.sin(t), Math.cos(t), 0];
      const vertical = [-Math.cos(t) * Math.sin(f), -Math.sin(t) * Math.sin(f), Math.cos(f)];
      const visivel = (p) => p[0] * olho[0] + p[1] * olho[1] + p[2] * olho[2] >= -1e-9;

      /** Desenha só os trechos visíveis de uma curva sobre a esfera. */
      function curva(pontos, classe) {
        let trecho = [];
        pontos.forEach((p) => {
          if (visivel(p)) { trecho.push(p); return; }
          if (trecho.length > 1) e.poligonal(trecho, classe);
          trecho = [];
        });
        if (trecho.length > 1) e.poligonal(trecho, classe);
      }

      // contorno do globo: o círculo perpendicular à direção do olhar
      const contorno = [];
      for (let k = 0; k <= 96; k++) {
        const a = (k / 96) * 2 * Math.PI;
        contorno.push(horizontal.map((h, i) => RD * (Math.cos(a) * h + Math.sin(a) * vertical[i])));
      }
      e.poligono(contorno, 'globo');

      // paralelos e meridianos a cada 30°
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = [];
        for (let lon = -180; lon <= 180; lon += 4) pts.push(naEsfera(lat, lon));
        curva(pts, lat === 0 ? 'globo-grade globo-equador' : 'globo-grade');
      }
      for (let lon = -180; lon < 180; lon += 30) {
        const pts = [];
        for (let lat = -90; lat <= 90; lat += 4) pts.push(naEsfera(lat, lon));
        curva(pts, 'globo-grade');
      }

      // todas as capitais
      if (chkTodas.checked) {
        TODAS.forEach((c) => {
          const p = vezes(RD, lista(c.u));
          if (visivel(p)) e.ponto(p, 0.09, 'capital-ponto');
        });
      }

      // círculo máximo inteiro
      if (chkCirculo.checked && A.i !== B.i) {
        const n = produtoVetorial3(A.u, B.u);
        const mn = modulo3(n);
        if (mn > 1e-9) {
          // completa a volta: de A até B, depois até −A, −B e de volta a A
          const negA = multiplicarPorEscalar3(-1, A.u), negB = multiplicarPorEscalar3(-1, B.u);
          const volta = [...arco(A.u, B.u, RD, 30), ...arco(B.u, negA, RD, 60), ...arco(negA, negB, RD, 30), ...arco(negB, A.u, RD, 60)];
          curva(volta, 'circulo-maximo');
        }
      }

      // vetores do centro até as cidades
      const pA = vezes(RD, lista(A.u)), pB = vezes(RD, lista(B.u));
      e.seta([0, 0, 0], pA, 'vetor-u');
      e.seta([0, 0, 0], pB, 'vetor-v');

      if (A.i !== B.i) {
        // ângulo central perto do centro
        e.poligonal(arco(A.u, B.u, 1.6, 20), 'arco-angulo');
        const meio = arco(A.u, B.u, 2.1, 2)[1];
        e.texto('θ', meio, 'rotulo-angulo', 'middle', 0, -0.2);
        // rota pela superfície e corda
        e.poligonal(arco(A.u, B.u, RD, 40), 'rota-arco');
        if (chkCorda.checked) e.linha(pA, pB, 'segmento-distancia');
      }

      // terceira cidade
      if (C) {
        const pC = vezes(RD, lista(C.u));
        e.ponto(pC, 0.16, 'ponto-solucao');
        e.texto(C.nome, pC, 'rotulo-ponto', 'start', 0.3, -0.6);
      }

      e.ponto(pA, 0.17, 'ponto-a');
      e.ponto(pB, 0.17, 'ponto-b');
      e.texto(A.nome, pA, 'rotulo-ponto', 'end', -0.3, 0.3);
      if (A.i !== B.i) e.texto(B.nome, pB, 'rotulo-ponto', 'start', 0.3, 0.3);
    });
  }


  /* =======================================================================
     6. RESULTADOS
     ======================================================================= */
  function linhaCidade(c, nomeVetor, classe) {
    const aviso = c.corrigida ? ' <span class="lab-dica">(latitude corrigida: na tabela aparece −90°)</span>' : '';
    return `
      <p><strong class="${classe}">${rotulo(c)}</strong>${aviso}</p>
      <ul>
        <li>latitude ${c.latTxt.replace('-', '−')}: φ = ${contaDecimal(c.lat)}</li>
        <li>longitude ${c.lonTxt.replace('-', '−')}: λ = ${contaDecimal(c.lon)}</li>
        <li>${VET(nomeVetor)} = (cos φ·cos λ, cos φ·sen λ, sen φ) ≈ ${terna4(c.u)} &nbsp;⇒&nbsp; P = R·${VET(nomeVetor)} ≈ ${ternaKm(c.P)} km</li>
      </ul>`;
  }

  function cartaoCoordenadas(A, B, C) {
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Passos 1 e 2. Coordenadas e vetores</span>
        ${linhaCidade(A, 'û', 'texto-cidade-a')}
        ${linhaCidade(B, 'v̂', 'texto-cidade-b')}
        ${C ? linhaCidade(C, 'ĉ', 'texto-cidade-c') : ''}
      </div>`;
  }

  function cartaoAngulo(A, B, theta, cosT) {
    const produtos = ['x', 'y', 'z'].map((k) => p4(A.u[k]) + '·' + p4(B.u[k])).join(' + ');
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">Passo 3. Ângulo central</span>
        <div class="formula">cos θ = ${VET('û')} · ${VET('v̂')} ≈ ${produtos} ≈ ${formatarNumero(cosT, 6)}</div>
        <div class="formula">θ ≈ <strong>${formatarNumero(theta / RAD, 3)}°</strong> ≈ ${formatarNumero(theta, 5)} rad</div>
      </div>`;
  }

  function cartaoDistancias(A, B, theta) {
    const s = R * theta;
    const corda = distancia3(A.P, B.P);
    let oficial = '';
    const outra = A.i === BRASILIA ? B : (B.i === BRASILIA ? A : null);
    if (outra) {
      const erro = ((s - outra.reta) / outra.reta) * 100;
      oficial = `
        <p>Comparando com o IBGE (${rotulo(outra)} até Brasília):</p>
        <ul>
          <li>em linha reta (elipsoide): <strong>${km(outra.reta, 3)} km</strong>; nossa esfera deu ${km(s)} km,
            diferença de <strong>${formatarNumero(erro)}%</strong>${outra.corrigida ? ' (só bate porque corrigimos a latitude de Maceió)' : ''}.</li>
          ${outra.estrada
            ? `<li>pela estrada (DNIT): <strong>${km(outra.estrada, 0)} km</strong>. Fator de rodeio:
               ${km(outra.estrada, 0)} / ${km(outra.reta, 3)} ≈ <strong>${formatarNumero(outra.estrada / outra.reta)}</strong>
               (a estrada é ${formatarNumero((outra.estrada / outra.reta - 1) * 100, 0)}% mais longa).</li>`
            : '<li>pela estrada: a tabela do IBGE não traz esse valor para Macapá (o acesso por terra depende da travessia do rio Amazonas).</li>'}
        </ul>`;
    } else {
      oficial = '<p class="lab-dica">O IBGE só publica as distâncias até Brasília. Escolha Brasília como uma das cidades para comparar.</p>';
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">Passo 4. Distâncias</span>
        <div class="formula">Pela superfície: s = R·θ ≈ 6 371 · ${formatarNumero(theta, 5)} ≈ <strong>${km(s)} km</strong></div>
        <div class="formula">Pelo túnel: |P − Q| = 2R·sen(θ/2) ≈ <strong>${km(corda)} km</strong> (${km(s - corda)} km a menos)</div>
        ${oficial}
      </div>`;
  }

  function cartaoPlano(A, B, C) {
    const n = produtoVetorial3(A.u, B.u);
    const mn = modulo3(n);
    if (mn < 1e-9) {
      return `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">Passo 5. Plano da rota</span>
          <p>${VET('û')} × ${VET('v̂')} = ${VET('0')}: as cidades coincidem (ou são opostas), e o plano não fica determinado.</p>
        </div>`;
    }
    const eq = [[n.x, 'x'], [n.y, 'y'], [n.z, 'z']]
      .map(([c, v], k) => (k === 0 ? (c < 0 ? '−' : '') : (c < 0 ? ' − ' : ' + ')) + n4(Math.abs(c)) + v).join('');
    let terceira = '';
    if (C) {
      const d = (R * Math.abs(produtoEscalar3(n, C.u))) / mn;
      terceira = `
        <div class="formula">d(${C.nome}, plano) = R·|${VET('n')} · ${VET('ĉ')}| / |${VET('n')}| ≈ 6 371 · ${n4(Math.abs(produtoEscalar3(n, C.u)))} / ${n4(mn)} ≈ <strong>${km(d)} km</strong></div>
        <p>${d < 50 ? C.nome + ' fica praticamente <strong>no caminho</strong> da rota mais curta (ou no prolongamento dela).'
          : C.nome + ' fica a cerca de ' + km(d, 0) + ' km do círculo máximo da rota: um avião indo direto de ' + A.nome + ' a ' + B.nome + ' não passaria por cima dela.'}</p>`;
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">Passo 5. Plano da rota</span>
        <div class="formula">${VET('n')} = ${VET('û')} × ${VET('v̂')} ≈ ${terna4(n)}, &nbsp; |${VET('n')}| ≈ ${n4(mn)} = sen θ</div>
        <div class="formula">Plano pelo centro da Terra: ${eq} = 0</div>
        ${terceira || '<p class="lab-dica">Escolha uma cidade C para ver a distância dela até esse plano.</p>'}
      </div>`;
  }


  /* =======================================================================
     7. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const A = TODAS[Number(selA.value)];
    const B = TODAS[Number(selB.value)];
    const C = selC.value === '' ? null : TODAS[Number(selC.value)];

    desenhar(A, B, C);

    if (A.i === B.i) {
      resultados.innerHTML = cartaoCoordenadas(A, B, null) +
        '<p class="erro">Escolha duas cidades diferentes para calcular a distância.</p>';
      return;
    }
    const cosT = Math.max(-1, Math.min(1, produtoEscalar3(A.u, B.u)));
    const theta = Math.acos(cosT);
    resultados.innerHTML =
      cartaoCoordenadas(A, B, C) +
      cartaoAngulo(A, B, theta, cosT) +
      cartaoDistancias(A, B, theta) +
      cartaoPlano(A, B, C);
  }


  /* =======================================================================
     8. EVENTOS
     ======================================================================= */
  [selA, selB, selC].forEach((sel) => sel.addEventListener('change', atualizar));
  [chkCorda, chkCirculo, chkTodas].forEach((chk) => chk.addEventListener('change', atualizar));

  giro.addEventListener('input', () => espaco.girar(Number(giro.value)));
  btnVista.addEventListener('click', () => espaco.girar(AZIMUTE_BRASIL, ELEVACAO_BRASIL));

  btnTrocar.addEventListener('click', () => {
    const a = selA.value;
    selA.value = selB.value;
    selB.value = a;
    atualizar();
  });

  espaco.girar(AZIMUTE_BRASIL, ELEVACAO_BRASIL);
  atualizar();
})();
