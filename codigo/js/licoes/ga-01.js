/* =========================================================================
   js/licoes/ga-01.js — Geometria Analítica, Lição 1: Ângulo e distância entre retas
   Desenha a reta r: a·x + b·y + c = 0, o ponto P e o caminho mais curto
   de P até r (pé da perpendicular H). Com a reta s ligada, mostra o
   ângulo entre r e s, o ponto de encontro ou, se forem paralelas, a
   distância entre elas. Todas as contas aparecem passo a passo.

   Índice
   1. Elementos
   2. Leitura dos campos
   3. Contas
   4. Desenho
   5. Resultados (contas passo a passo)
   6. Atualização geral
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g1-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 8 });
  const LIMITE_COEF = 20;

  const campos = {
    a1: document.getElementById('g1-a1'),
    b1: document.getElementById('g1-b1'),
    c1: document.getElementById('g1-c1'),
    px: document.getElementById('g1-px'),
    py: document.getElementById('g1-py'),
    a2: document.getElementById('g1-a2'),
    b2: document.getElementById('g1-b2'),
    c2: document.getElementById('g1-c2'),
  };
  const caixaS = document.getElementById('g1-mostrar-s');
  const campoS = document.getElementById('g1-campo-s');
  const btnSortear = document.getElementById('g1-sortear');
  const resultados = document.getElementById('g1-resultados');

  const fr = formatarFracao;
  const p = formatarComParenteses;


  /* =======================================================================
     2. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCampo(campo, limite) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || Math.abs(valor) > limite;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  /** Lê uma reta; devolve { reta } , { erro: 'campo' } ou { erro: 'nula' }. */
  function lerReta(ca, cb, cc) {
    const a = lerCampo(ca, LIMITE_COEF);
    const b = lerCampo(cb, LIMITE_COEF);
    const c = lerCampo(cc, LIMITE_COEF);
    if (a === null || b === null || c === null) return { erro: 'campo' };
    if (a === 0 && b === 0) {
      ca.classList.add('erro');
      cb.classList.add('erro');
      return { erro: 'nula' };
    }
    return { reta: { a, b, c } };
  }


  /* =======================================================================
     3. CONTAS
     ======================================================================= */
  /** Valor de a·x + b·y + c no ponto (o sinal diz o lado da reta). */
  function substituir(reta, P) {
    return reta.a * P.x + reta.b * P.y + reta.c;
  }

  function normaQuadrada(reta) {
    return reta.a * reta.a + reta.b * reta.b;
  }

  /** Pé da perpendicular: H = P − k·n, com k = (a·x₀ + b·y₀ + c) / (a² + b²). */
  function peDaPerpendicular(reta, P) {
    const k = substituir(reta, P) / normaQuadrada(reta);
    return { k, H: { x: P.x - k * reta.a, y: P.y - k * reta.b } };
  }

  /** "|v| / √N" escrito do jeito mais simples possível. */
  function textoDivisaoPorRaiz(numerador, N) {
    const raiz = Math.sqrt(N);
    if (quaseIgual(raiz, Math.round(raiz))) {
      return fr(numerador) + ' / ' + fr(raiz) + ' = <strong>' + fr(numerador / raiz) + '</strong>';
    }
    return fr(numerador) + ' / √' + fr(N) + ' ≈ <strong>' + formatarNumero(numerador / raiz) + '</strong>';
  }

  function graus(radianos) {
    return radianosParaGraus(radianos);
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function desenharPonto(P, nome, classe) {
    plano.ponto(P.x, P.y, 0.28, 'ponto ' + classe);
    const aDireita = P.x <= 4;
    plano.texto(nome, P.x + (aDireita ? 0.45 : -0.45), P.y + 0.45, 'rotulo-ponto', aDireita ? 'start' : 'end');
  }

  /** Quadradinho de ângulo reto em V, entre as direções d1 e d2. */
  function marcarAnguloReto(V, d1, d2) {
    const t1 = Math.hypot(d1.x, d1.y);
    const t2 = Math.hypot(d2.x, d2.y);
    const lado = 0.5;
    const u = { x: (d1.x / t1) * lado, y: (d1.y / t1) * lado };
    const w = { x: (d2.x / t2) * lado, y: (d2.y / t2) * lado };
    plano.poligonal([[V.x + u.x, V.y + u.y], [V.x + u.x + w.x, V.y + u.y + w.y], [V.x + w.x, V.y + w.y]], 'arco-angulo');
  }

  /** Nome da reta perto da borda do desenho, num ponto que esteja visível. */
  function rotularReta(reta, nome, classe) {
    const L = plano.limite - 0.8;
    const candidatos = [];
    if (reta.b !== 0) {
      [L, -L].forEach((x) => candidatos.push({ x, y: -(reta.a * x + reta.c) / reta.b }));
    }
    if (reta.a !== 0) {
      [L, -L].forEach((y) => candidatos.push({ x: -(reta.b * y + reta.c) / reta.a, y }));
    }
    const ponto = candidatos.find((q) => Math.abs(q.x) <= L && Math.abs(q.y) <= L);
    if (ponto) plano.texto(nome, ponto.x + 0.3, ponto.y + 0.35, 'rotulo-ponto ' + classe, 'start');
  }

  function desenhar(r, P, s) {
    plano.limpar();

    plano.reta(r.a, r.b, -r.c, 'reta reta-principal');
    rotularReta(r, 'r', 'texto-reta-1');

    if (s) {
      plano.reta(s.a, s.b, -s.c, 'reta reta-secundaria');
      rotularReta(s, 's', 'texto-reta-2');

      const det = r.a * s.b - s.a * r.b;
      if (!quaseIgual(det, 0)) {
        // ponto de encontro (Cramer) e arco do ângulo agudo
        const I = { x: (r.b * s.c - s.b * r.c) / det, y: (s.a * r.c - r.a * s.c) / det };
        if (plano.cabe(I.x, I.y)) {
          const d1 = { x: -r.b, y: r.a };
          let d2 = { x: -s.b, y: s.a };
          if (d1.x * d2.x + d1.y * d2.y < 0) d2 = { x: -d2.x, y: -d2.y }; // pega o ângulo agudo
          if (quaseIgual(r.a * s.a + r.b * s.b, 0)) {
            marcarAnguloReto(I, d1, d2);
          } else {
            const a1 = Math.atan2(d1.y, d1.x);
            let dif = Math.atan2(d2.y, d2.x) - a1;
            while (dif > Math.PI) dif -= 2 * Math.PI;
            while (dif < -Math.PI) dif += 2 * Math.PI;
            plano.arco(I.x, I.y, 1.1, a1, a1 + dif, 'arco-angulo');
            const meio = a1 + dif / 2;
            plano.texto('θ', I.x + 1.7 * Math.cos(meio), I.y + 1.7 * Math.sin(meio) - 0.25, 'rotulo-angulo', 'middle');
          }
          desenharPonto(I, 'I', 'ponto-solucao');
        }
      } else {
        // paralelas: segmento entre elas, partindo do pé da perpendicular de P em r
        const { H } = peDaPerpendicular(r, P);
        const { H: H2 } = peDaPerpendicular(s, H);
        if (Math.hypot(H.x - H2.x, H.y - H2.y) > 1e-9) plano.linha(H.x, H.y, H2.x, H2.y, 'cateto');
      }
    }

    // caminho mais curto de P até r
    const { H } = peDaPerpendicular(r, P);
    const d = Math.hypot(P.x - H.x, P.y - H.y);
    if (d > 1e-9) {
      plano.linha(P.x, P.y, H.x, H.y, 'reta reta-perpendicular');
      marcarAnguloReto(H, { x: -r.b, y: r.a }, { x: P.x - H.x, y: P.y - H.y });
      plano.texto('d', (P.x + H.x) / 2 + 0.3, (P.y + H.y) / 2 + 0.3, 'rotulo-cateto', 'start');
      if (plano.cabe(H.x, H.y)) desenharPonto(H, 'H', 'ponto-m');
    }
    desenharPonto(P, 'P', 'ponto-a');
  }


  /* =======================================================================
     5. RESULTADOS (contas passo a passo)
     ======================================================================= */
  function blocoReta(nome, reta, classeRotulo) {
    const N = normaQuadrada(reta);
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo ${classeRotulo}">Reta ${nome}</span>
        <div class="formula">${nome}: ${formatarEquacaoGeral(reta.a, reta.b, reta.c)}</div>
        Vetor normal <span class="vet">n</span> = (${fr(reta.a)}, ${fr(reta.b)}) &nbsp;·&nbsp;
        |<span class="vet">n</span>| = √(${p(reta.a)}² + ${p(reta.b)}²) = ${formatarRaiz(N)}
      </div>`;
  }

  function blocoDistancia(r, P) {
    const v = substituir(r, P);
    const N = normaQuadrada(r);
    let lado;
    if (quaseIgual(v, 0)) lado = '<span class="etiqueta etiqueta-verde">P está sobre a reta r: d = 0</span>';
    else if (v > 0) lado = 'O valor antes do módulo é <strong>positivo</strong>: P fica do lado para onde <span class="vet">n</span> aponta.';
    else lado = 'O valor antes do módulo é <strong>negativo</strong>: P fica do lado oposto ao que <span class="vet">n</span> aponta.';

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">Distância de P até r</span>
        <div class="formula">d = |a·x₀ + b·y₀ + c| / √(a² + b²)</div>
        <div class="formula">d = |${fr(r.a)}·${p(P.x)} + ${p(r.b)}·${p(P.y)} + ${p(r.c)}| / √${fr(N)} = |${fr(v)}| / √${fr(N)}</div>
        <div class="formula">d = ${textoDivisaoPorRaiz(Math.abs(v), N)}</div>
        <p>${lado}</p>
      </div>`;
  }

  function blocoPe(r, P) {
    const v = substituir(r, P);
    if (quaseIgual(v, 0)) return '';
    const N = normaQuadrada(r);
    const { k, H } = peDaPerpendicular(r, P);
    // k escrito igual nas duas linhas (fração entre parênteses se precisar)
    const kTexto = fr(k);
    const kFator = (k < 0 || kTexto.includes('/')) ? '(' + kTexto + ')' : kTexto;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Ponto mais perto (pé da perpendicular H)</span>
        <div class="formula">k = (a·x₀ + b·y₀ + c) / (a² + b²) = ${fr(v)} / ${fr(N)} = ${kTexto}</div>
        <div class="formula">H = P − k·<span class="vet">n</span> = ${formatarPonto(P.x, P.y)} − ${kFator}·(${fr(r.a)}, ${fr(r.b)}) = <strong>${formatarPonto(H.x, H.y)}</strong></div>
        Conferindo: substituindo H em r dá ${fr(substituir(r, H))} ✓
      </div>`;
  }

  function blocoAngulo(r, s) {
    const N1 = normaQuadrada(r);
    const N2 = normaQuadrada(s);
    const escalar = r.a * s.a + r.b * s.b;
    const det = r.a * s.b - s.a * r.b;

    let html = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">Ângulo entre r e s</span>
        <div class="formula">n₁ · n₂ = ${fr(r.a)}·${p(s.a)} + ${p(r.b)}·${p(s.b)} = ${fr(escalar)}</div>
        <div class="formula">cos θ = |n₁ · n₂| / (|n₁|·|n₂|) = |${fr(escalar)}| / (√${fr(N1)} · √${fr(N2)})`;

    if (quaseIgual(det, 0)) {
      // normais paralelos: retas paralelas ou coincidentes
      const t = r.a !== 0 ? r.a / s.a : r.b / s.b; // r tem o normal de s vezes t
      const c2 = s.c * t;
      html += ` = 1 &nbsp;→&nbsp; <strong>θ = 0°</strong></div>`;
      if (quaseIgual(c2, r.c)) {
        html += `<p><span class="etiqueta etiqueta-azul">Coincidentes</span> s é a própria reta r multiplicada por ${fr(1 / t)}.</p></div>`;
        return html;
      }
      const N = N1;
      const multiplica = quaseIgual(t, 1) ? '' :
        `<div class="formula">Multiplicando s por ${fr(t)} para ficar com o mesmo normal de r: ${formatarEquacaoGeral(r.a, r.b, c2)}</div>`;
      html += `<p><span class="etiqueta etiqueta-azul">Paralelas</span> nunca se encontram. A distância entre elas:</p>
        ${multiplica}
        <div class="formula">d(r, s) = |c₁ − c₂| / √(a² + b²) = |${fr(r.c)} − ${p(c2)}| / √${fr(N)} = ${textoDivisaoPorRaiz(Math.abs(r.c - c2), N)}</div>
      </div>`;
      return html;
    }

    const cos = Math.min(1, Math.abs(escalar) / Math.sqrt(N1 * N2));
    const theta = graus(Math.acos(cos));
    html += ` ≈ ${formatarNumero(cos, 4)} &nbsp;→&nbsp; <strong>θ ≈ ${formatarNumero(theta, 1)}°</strong></div>`;
    if (quaseIgual(escalar, 0)) html += `<p><span class="etiqueta etiqueta-verde">Perpendiculares</span> n₁ · n₂ = 0, então θ = 90°.</p>`;

    const I = { x: (r.b * s.c - s.b * r.c) / det, y: (s.a * r.c - r.a * s.c) / det };
    html += `
        <p>Ponto de encontro I (resolvendo o sistema das duas equações): <strong>I = ${formatarPonto(I.x, I.y)}</strong>${plano.cabe(I.x, I.y) ? '' : ' (fora da área do desenho)'}.</p>
      </div>`;
    return html;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    campoS.disabled = !caixaS.checked;

    const lidaR = lerReta(campos.a1, campos.b1, campos.c1);
    const px = lerCampo(campos.px, plano.limite);
    const py = lerCampo(campos.py, plano.limite);
    const lidaS = caixaS.checked ? lerReta(campos.a2, campos.b2, campos.c2) : { reta: null };

    const erros = [];
    if (lidaR.erro === 'nula' || lidaS.erro === 'nula') erros.push('Com a = 0 e b = 0 não existe reta (a equação vira só "c = 0"). Mude a ou b.');
    if (lidaR.erro === 'campo' || lidaS.erro === 'campo') erros.push('Use coeficientes de −' + LIMITE_COEF + ' a ' + LIMITE_COEF + '.');
    if (px === null || py === null) erros.push('As coordenadas de P vão de −' + plano.limite + ' a ' + plano.limite + '.');

    if (erros.length) {
      plano.limpar();
      resultados.innerHTML = erros.map((e) => '<p class="erro">' + e + '</p>').join('');
      return;
    }

    const r = lidaR.reta;
    const s = lidaS.reta;
    const P = { x: px, y: py };

    desenhar(r, P, s);
    resultados.innerHTML =
      blocoReta('r', r, 'lab-rotulo-m') +
      blocoDistancia(r, P) +
      blocoPe(r, P) +
      (s ? blocoReta('s', s, 'lab-rotulo-b') + blocoAngulo(r, s) : '');
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  caixaS.addEventListener('change', atualizar);

  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    campos.px.value = x;
    campos.py.value = y;
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const sortearReta = () => {
      let a, b;
      do { a = inteiro(-5, 5); b = inteiro(-5, 5); } while (a === 0 && b === 0);
      return { a, b, c: inteiro(-8, 8) };
    };
    const r = sortearReta();
    const s = sortearReta();
    campos.a1.value = r.a; campos.b1.value = r.b; campos.c1.value = r.c;
    campos.a2.value = s.a; campos.b2.value = s.b; campos.c2.value = s.c;
    campos.px.value = inteiro(-6, 6);
    campos.py.value = inteiro(-6, 6);
    atualizar();
  });

  atualizar();
})();
