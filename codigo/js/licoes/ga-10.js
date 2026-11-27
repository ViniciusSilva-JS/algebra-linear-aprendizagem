/* =========================================================================
   js/licoes/ga-10.js — Geometria Analítica, Lição 10: Produto vetorial e misto
   Lê os vetores u, v e w e:
     1. desenha no espaço 3D (js/componentes/espaco.js) u, v, o produto
        vetorial u × v (com a marca de ângulo reto), o paralelogramo de u e v
        e o paralelepípedo de u, v e w;
     2. calcula u × v pelo determinante, confere a perpendicularidade, a área
        do paralelogramo e do triângulo, e o produto misto (volume,
        tetraedro, coplanaridade e orientação), mostrando as contas.

   Índice
   1. Elementos
   2. Textos
   3. Leitura dos campos
   4. Desenho
   5. Resultados
   6. Atualização geral
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g10-espaco');
  if (!svg) return;

  const LIMITE = 5;   // componentes de −5 a 5
  const NOMES = ['u', 'v', 'w'];
  const campos = {};
  NOMES.forEach((n) => {
    campos[n] = ['x', 'y', 'z'].map((c) => document.getElementById('g10-' + n + c));
  });
  const todosOsCampos = NOMES.flatMap((n) => campos[n]);

  const giro = document.getElementById('g10-giro');
  const giroValor = document.getElementById('g10-giro-valor');
  const btnVista = document.getElementById('g10-vista');
  const chkVetorial = document.getElementById('g10-vetorial');
  const chkParalelogramo = document.getElementById('g10-paralelogramo');
  const chkSolido = document.getElementById('g10-solido');
  const btnSortear = document.getElementById('g10-sortear');
  const botoesExemplo = Array.from(document.querySelectorAll('[data-g10-exemplo]'));
  const resultados = document.getElementById('g10-resultados');

  const espaco = criarEspaco3D(svg, {
    aoGirar: (azimute) => {
      giro.value = azimute;
      giroValor.textContent = formatarNumero(azimute) + '°';
    },
  });


  /* =======================================================================
     2. TEXTOS
     ======================================================================= */
  const VET = (nome) => '<span class="vet">' + nome + '</span>';
  const UxV = VET('u') + ' × ' + VET('v');
  const terna = (v) => formatarTerna(v.x, v.y, v.z);
  const lista = (v) => [v.x, v.y, v.z];
  const p = formatarComParenteses;

  /** "√9 = 3", "√14 ≈ 3,74", "√18 = 3√2 ≈ 4,24". */
  function raizComValor(q) {
    const r = Math.sqrt(q);
    if (quaseIgual(r, Math.round(r))) return '√' + formatarNumero(q) + ' = ' + formatarNumero(Math.round(r));
    if (!quaseIgual(q, Math.round(q))) return '√' + formatarNumero(q) + ' ≈ ' + formatarNumero(r);
    const simples = textoRaiz(q);
    return '√' + formatarNumero(q) + (simples.startsWith('√') ? '' : ' = ' + simples) + ' ≈ ' + formatarNumero(r);
  }

  /** Metade de √q escrita de forma curta: "7/2", "√14/2 ≈ 1,87", "3√5/2 ≈ 3,35". */
  function metadeDaRaiz(q) {
    const r = Math.sqrt(q);
    if (quaseIgual(r, Math.round(r))) {
      const f = formatarFracao(Math.round(r) / 2);
      return f + (f.includes('/') ? ' = ' + formatarNumero(r / 2) : '');
    }
    if (!quaseIgual(q, Math.round(q))) return '≈ ' + formatarNumero(r / 2);
    return textoRaizSobre(Math.round(q), 2) + ' ≈ ' + formatarNumero(r / 2);
  }

  /** "2² + (−1)² + 2²" (negativos e decimais entre parênteses). */
  const somaDeQuadrados = (v) => lista(v)
    .map((c) => (c < 0 || !Number.isInteger(c) ? '(' + formatarNumero(c) + ')' : formatarNumero(c)) + '²')
    .join(' + ');

  /** Matriz 3×3 que aceita textos (i, j, k) além de números. */
  const matriz = (linhas) => htmlMatriz(linhas, {
    formatar: (x) => (typeof x === 'string' ? x : formatarNumero(x)),
  });


  /* =======================================================================
     3. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerVetor(nome) {
    const valores = campos[nome].map((campo) => lerNumero(campo.value));
    if (valores.some((v) => !Number.isFinite(v))) {
      return { erro: 'Preencha as três componentes de ' + nome + ' com números.' };
    }
    if (valores.some((v) => Math.abs(v) > LIMITE)) {
      return { erro: 'Use componentes de −' + LIMITE + ' a ' + LIMITE + ' em ' + nome + '.' };
    }
    return { x: valores[0], y: valores[1], z: valores[2] };
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  const O = [0, 0, 0];
  const mais = (...vetores) => [0, 1, 2].map((i) => vetores.reduce((s, v) => s + v[i], 0));
  const vezes = (k, a) => a.map((c) => k * c);
  const tamanho = (a) => Math.hypot(...a);

  function desenhar(u, v, w) {
    const pu = lista(u), pv = lista(v), pw = lista(w);
    const pn = lista(produtoVetorial3(u, v));
    const puv = mais(pu, pv);

    // O espaço cresce para caber tudo o que está desenhado.
    const pontos = [pu, pv];
    if (chkVetorial.checked) pontos.push(pn);
    if (chkParalelogramo.checked) pontos.push(puv);
    if (chkSolido.checked) pontos.push(pw, mais(pu, pv, pw), mais(pu, pw), mais(pv, pw));
    espaco.definirAlcance(Math.max(5, Math.ceil(Math.max(...pontos.map(tamanho)) + 0.5)));

    espaco.definirDesenho((e) => {
      if (chkSolido.checked) {
        const puw = mais(pu, pw), pvw = mais(pv, pw), ptudo = mais(pu, pv, pw);
        e.poligono([pw, puw, ptudo, pvw], 'regiao-solido');
        [[pu, puv], [pv, puv], [pu, puw], [pw, puw], [pv, pvw], [pw, pvw],
          [puv, ptudo], [puw, ptudo], [pvw, ptudo]].forEach(([a, b]) => e.linha(a, b, 'aresta-solido'));
        e.seta(O, pw, 'vetor-w');
        e.rotuloSeta('w', O, pw, 'rotulo-vetor vetor-w');
      }

      if (chkParalelogramo.checked) {
        e.poligono([O, pu, puv, pv], 'regiao-paralelogramo');
        e.linha(pu, puv, 'linha-chamada vetor-v');
        e.linha(pv, puv, 'linha-chamada vetor-u');
      }

      if (chkVetorial.checked && tamanho(pn) > 1e-9) {
        // marca de ângulo reto entre u e u × v, na origem
        if (tamanho(pu) > 1e-9) {
          const a = 0.5;
          const du = vezes(a / tamanho(pu), pu), dn = vezes(a / tamanho(pn), pn);
          e.poligonal([du, mais(du, dn), dn], 'arco-angulo');
        }
        e.seta(O, pn, 'vetor-r');
        e.rotuloSeta('u × v', O, pn, 'rotulo-vetor vetor-r');
      }

      e.seta(O, pu, 'vetor-u');
      e.seta(O, pv, 'vetor-v');
      e.rotuloSeta('u', O, pu, 'rotulo-vetor vetor-u');
      e.rotuloSeta('v', O, pv, 'rotulo-vetor vetor-v');
    });
  }


  /* =======================================================================
     5. RESULTADOS
     ======================================================================= */
  function cartaoVetorial(u, v, n) {
    const ci = `(${p(u.y)}·${p(v.z)} − ${p(u.z)}·${p(v.y)})<strong>i</strong>`;
    const cj = `(${p(u.x)}·${p(v.z)} − ${p(u.z)}·${p(v.x)})<strong>j</strong>`;
    const ck = `(${p(u.x)}·${p(v.y)} − ${p(u.y)}·${p(v.x)})<strong>k</strong>`;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Produto vetorial</span>
        <div class="formula">${UxV} = det ${matriz([['i', 'j', 'k'], lista(u), lista(v)])}</div>
        <div class="formula">= ${ci} − ${cj} + ${ck}</div>
        <div class="formula">${UxV} = <strong>${terna(n)}</strong></div>
      </div>`;
  }

  function cartaoPerpendicular(u, v, n) {
    if (modulo3(n) < 1e-12) {
      return `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-a">2. Perpendicularidade</span>
          <p>${UxV} é o <strong>vetor nulo</strong>: u e v são paralelos (ou um deles é nulo). Eles não formam um
          paralelogramo, e não existe uma única direção perpendicular aos dois.</p>
        </div>`;
    }
    const produto = (a, b) => lista(a).map((c, i) => p(c) + '·' + p(lista(b)[i])).join(' + ');
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">2. Perpendicular a u e a v</span>
        <div class="formula">(${UxV}) · ${VET('u')} = ${produto(n, u)} = ${formatarNumero(produtoEscalar3(n, u))} ✓</div>
        <div class="formula">(${UxV}) · ${VET('v')} = ${produto(n, v)} = ${formatarNumero(produtoEscalar3(n, v))} ✓</div>
      </div>`;
  }

  function cartaoArea(u, v, n) {
    const qn = produtoEscalar3(n, n);
    const mu = modulo3(u), mv = modulo3(v);
    let angulo = '';
    if (mu > 0 && mv > 0) {
      const seno = Math.min(1, Math.sqrt(qn) / (mu * mv));
      const theta = anguloEntre3(u, v);
      angulo = `<p>Confere com |${VET('u')}|·|${VET('v')}|·sen θ: sen θ = ${formatarNumero(Math.sqrt(qn))} / (${formatarNumero(mu)} · ${formatarNumero(mv)})
        ≈ ${formatarNumero(seno, 3)}, com θ ≈ ${formatarNumero(radianosParaGraus(theta))}° entre u e v.</p>`;
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Área</span>
        <div class="formula">Paralelogramo: |${UxV}| = √(${somaDeQuadrados(n)}) = ${raizComValor(qn)}</div>
        <div class="formula">Triângulo (metade): ${qn === 0 ? '0' : metadeDaRaiz(qn)}</div>
        ${angulo}
      </div>`;
  }

  function cartaoMisto(u, v, w, n) {
    const misto = produtoEscalar3(n, w);
    const vol = Math.abs(misto);
    const conta = lista(n).map((c, i) => p(c) + '·' + p(lista(w)[i])).join(' + ');
    let conclusao;
    if (quaseIgual(misto, 0)) {
      conclusao = '[u, v, w] = 0: os três vetores são <strong>coplanares</strong> (o paralelepípedo fica achatado, volume zero).';
    } else {
      const tetra = formatarFracao(vol / 6);
      conclusao = `Volume do paralelepípedo = |${formatarNumero(misto)}| = <strong>${formatarNumero(vol)}</strong>.
        Volume do tetraedro = ${formatarNumero(vol)}/6${tetra === formatarNumero(vol) + '/6' ? '' : ' = <strong>' + tetra + '</strong>'}${tetra.includes('/') ? ' ≈ ' + formatarNumero(vol / 6) : ''}.<br>
        ${misto > 0
          ? 'Sinal <strong>positivo</strong>: u, v, w seguem a regra da mão direita (como i, j, k).'
          : 'Sinal <strong>negativo</strong>: u, v, w estão na ordem "da mão esquerda". Trocando dois deles de lugar, o sinal muda.'}`;
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">4. Produto misto e volume</span>
        <div class="formula">[${VET('u')}, ${VET('v')}, ${VET('w')}] = det ${matriz([lista(u), lista(v), lista(w)])}
          = (${UxV}) · ${VET('w')}</div>
        <div class="formula">= ${conta} = <strong>${formatarNumero(misto)}</strong></div>
        <p>${conclusao}</p>
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const vetores = NOMES.map(lerVetor);
    const comErro = vetores.find((v) => v.erro);
    if (comErro) {
      espaco.definirDesenho(null);
      resultados.innerHTML = '<p class="erro">' + comErro.erro + '</p>';
      return;
    }

    const [u, v, w] = vetores;
    const n = produtoVetorial3(u, v);
    desenhar(u, v, w);
    resultados.innerHTML =
      cartaoVetorial(u, v, n) +
      cartaoPerpendicular(u, v, n) +
      cartaoArea(u, v, n) +
      cartaoMisto(u, v, w, n);
  }

  function preencher(valores) {
    todosOsCampos.forEach((campo, i) => { campo.value = valores[i]; });
    atualizar();
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  todosOsCampos.forEach((campo) => campo.addEventListener('input', atualizar));
  [chkVetorial, chkParalelogramo, chkSolido].forEach((chk) => chk.addEventListener('change', atualizar));

  giro.addEventListener('input', () => espaco.girar(Number(giro.value)));
  btnVista.addEventListener('click', () => espaco.vistaPadrao());

  botoesExemplo.forEach((btn) => {
    btn.addEventListener('click', () => preencher(btn.dataset.g10Exemplo.split(',').map(Number)));
  });

  // Sorteia três vetores inteiros pequenos (u e v nunca paralelos, para haver paralelogramo).
  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const sortear = () => ({ x: inteiro(-3, 3), y: inteiro(-3, 3), z: inteiro(-3, 3) });
    let u, v;
    do {
      u = sortear();
      v = sortear();
    } while (modulo3(produtoVetorial3(u, v)) === 0);
    const w = sortear();
    preencher([...lista(u), ...lista(v), ...lista(w)]);
  });

  atualizar();
})();
