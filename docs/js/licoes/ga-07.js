/* =========================================================================
   js/licoes/ga-07.js — Geometria Analítica, Lição 7: Hipérbole
   Desenha a hipérbole de centro (h, k), semieixo real a e imaginário b,
   com eixo real horizontal ou vertical: os dois ramos, os focos, os
   vértices, o retângulo 2a × 2b e as assíntotas, e um ponto P que anda
   por um ramo, mostrando que |d(P, F₁) − d(P, F₂)| = 2a.

   Como na lição 5, as contas usam coordenadas "da hipérbole":
   u = ao longo do eixo real, w = perpendicular a ele. O ponto do
   parâmetro t é u = ±a·cosh t, w = b·senh t (o sinal escolhe o ramo).
   A função mapa(u, w) converte para (x, y) do plano.

   Índice
   1. Elementos
   2. Leitura dos campos
   3. Geometria
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
  const svg = document.getElementById('g7-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 9 });
  const LIMITE_CENTRO = 5;
  const SEMIEIXO_MAX = 6;
  const T_MAX = 2;

  const campos = {
    h: document.getElementById('g7-h'),
    k: document.getElementById('g7-k'),
    a: document.getElementById('g7-a'),
    b: document.getElementById('g7-b'),
  };
  const radiosEixo = Array.from(document.querySelectorAll('input[name="g7-eixo"]'));
  const controleT = document.getElementById('g7-t');
  const saidaT = document.getElementById('g7-t-valor');
  const caixaRamo = document.getElementById('g7-ramo');
  const caixaRetangulo = document.getElementById('g7-retangulo');
  const btnSortear = document.getElementById('g7-sortear');
  const resultados = document.getElementById('g7-resultados');

  function limpo(v) {
    return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v;
  }
  const fr = (x) => formatarNumero(limpo(x));

  function eixoHorizontal() {
    const marcado = radiosEixo.find((r) => r.checked);
    return !marcado || marcado.value === 'horizontal';
  }

  /** "(x − 2)²", "(y + 1)²" ou "x²". */
  function quadrado(variavel, centro) {
    return fator(variavel, centro) + '²';
  }

  /** "(x − 2)" ou "x" (com parênteses só quando há deslocamento). */
  function fator(variavel, centro) {
    if (quaseIgual(centro, 0)) return variavel;
    return '(' + variavel + (centro > 0 ? ' − ' : ' + ') + fr(Math.abs(centro)) + ')';
  }

  /** "y − 1" ou "y" (lado esquerdo das assíntotas). */
  function ladoEsquerdo(centro) {
    if (quaseIgual(centro, 0)) return 'y';
    return 'y' + (centro > 0 ? ' − ' : ' + ') + fr(Math.abs(centro));
  }

  /** "h ± c" como coordenada: "5", "1 − √13", "−√13". */
  function coordenada(centro, sinal, c, cTexto, exato) {
    if (exato) return fr(centro + sinal * c);
    if (quaseIgual(centro, 0)) return (sinal < 0 ? '−' : '') + cTexto;
    return fr(centro) + (sinal < 0 ? ' − ' : ' + ') + cTexto;
  }


  /* =======================================================================
     2. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCampo(campo, min, max) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || valor < min || valor > max;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerHiperbole() {
    const h = lerCampo(campos.h, -LIMITE_CENTRO, LIMITE_CENTRO);
    const k = lerCampo(campos.k, -LIMITE_CENTRO, LIMITE_CENTRO);
    const a = lerCampo(campos.a, 0.5, SEMIEIXO_MAX);
    const b = lerCampo(campos.b, 0.5, SEMIEIXO_MAX);
    if (h === null || k === null) return { erro: 'O centro precisa ter h e k de −' + LIMITE_CENTRO + ' a ' + LIMITE_CENTRO + '.' };
    if (a === null || b === null) return { erro: 'Os semieixos a e b precisam ser positivos e no máximo ' + SEMIEIXO_MAX + '.' };
    const c2 = limpo(a * a + b * b);
    return { h, k, a, b, c2, c: Math.sqrt(c2), horizontal: eixoHorizontal() };
  }


  /* =======================================================================
     3. GEOMETRIA
     ======================================================================= */
  /** Converte (u ao longo do eixo real, w perpendicular) em (x, y). */
  function mapa(hip, u, w) {
    return hip.horizontal ? { x: hip.h + u, y: hip.k + w } : { x: hip.h + w, y: hip.k + u };
  }

  function pontoDoRamo(hip, t, ramo) {
    const q = mapa(hip, ramo * hip.a * Math.cosh(t), hip.b * Math.sinh(t));
    return { x: limpo(q.x), y: limpo(q.y) };
  }

  const distancia = (A, B) => Math.hypot(A.x - B.x, A.y - B.y);


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function desenhar(hip, t, ramo) {
    plano.limpar();
    const { h, k, a, b, c } = hip;
    const F1 = mapa(hip, -c, 0), F2 = mapa(hip, c, 0);
    const L = 30;

    // eixos (real e imaginário)
    const r1 = mapa(hip, -L, 0), r2 = mapa(hip, L, 0);
    plano.linha(r1.x, r1.y, r2.x, r2.y, 'cateto');

    // retângulo 2a × 2b e assíntotas (as diagonais prolongadas)
    if (caixaRetangulo.checked) {
      const cantos = [[a, b], [-a, b], [-a, -b], [a, -b]].map(([u, w]) => mapa(hip, u, w));
      plano.poligono(cantos.map((q) => [q.x, q.y]), 'retangulo-assintotas');
      [1, -1].forEach((s) => {
        const A = mapa(hip, -L, -s * L * b / a), B = mapa(hip, L, s * L * b / a);
        plano.linha(A.x, A.y, B.x, B.y, 'assintota');
      });
      const B1 = mapa(hip, 0, b), B2 = mapa(hip, 0, -b);
      [B1, B2].forEach((q) => { if (plano.cabe(q.x, q.y)) plano.ponto(q.x, q.y, 0.13, 'ponto ponto-b'); });
    }

    // os dois ramos
    [1, -1].forEach((s) => {
      const pts = [];
      for (let tt = -4; tt <= 4.0001; tt += 0.04) {
        const q = mapa(hip, s * a * Math.cosh(tt), b * Math.sinh(tt));
        if (Math.abs(q.x) < L && Math.abs(q.y) < L) pts.push([q.x, q.y]);
      }
      plano.poligonal(pts, 'hiperbole');
    });

    // P ligado aos dois focos
    const P = pontoDoRamo(hip, t, ramo);
    plano.linha(P.x, P.y, F1.x, F1.y, 'reta reta-perpendicular');
    plano.linha(P.x, P.y, F2.x, F2.y, 'distancia-diretriz');

    // vértices, centro, focos e P
    [mapa(hip, -a, 0), mapa(hip, a, 0)].forEach((q) => {
      if (plano.cabe(q.x, q.y)) plano.ponto(q.x, q.y, 0.17, 'ponto ponto-b');
    });
    plano.ponto(h, k, 0.2, 'ponto ponto-m');
    if (plano.cabe(h, k)) plano.texto('O', h - 0.35, k - 0.7, 'rotulo-ponto', 'end');

    [F1, F2].forEach((F, i) => {
      if (!plano.cabe(F.x, F.y)) return;
      plano.ponto(F.x, F.y, 0.24, 'ponto ponto-solucao');
      const dx = hip.horizontal ? 0 : 0.4, dy = hip.horizontal ? -0.8 : 0;
      plano.texto('F' + (i + 1), F.x + dx, F.y + dy, 'rotulo-ponto', hip.horizontal ? 'middle' : 'start');
    });

    if (plano.cabe(P.x, P.y)) {
      plano.ponto(P.x, P.y, 0.26, 'ponto ponto-a');
      plano.texto('P', P.x + 0.4, P.y + 0.4, 'rotulo-ponto', 'start');
    }
  }


  /* =======================================================================
     5. RESULTADOS (contas passo a passo)
     ======================================================================= */
  function montarResultados(hip, t, ramo) {
    const { h, k, a, b, c2, c, horizontal } = hip;
    const F1 = mapa(hip, -c, 0), F2 = mapa(hip, c, 0);
    const P = pontoDoRamo(hip, t, ramo);

    // 1. equações
    const positivo = horizontal ? quadrado('x', h) : quadrado('y', k);
    const negativo = horizontal ? quadrado('y', k) : quadrado('x', h);
    const reduzida = positivo + '/' + fr(a * a) + ' − ' + negativo + '/' + fr(b * b) + ' = 1';

    // b²·(positivo) − a²·(negativo) = a²b², desenvolvido
    let A, C, D, E, G;
    if (horizontal) {
      A = b * b; C = -a * a; D = -2 * b * b * h; E = 2 * a * a * k; G = b * b * h * h - a * a * k * k - a * a * b * b;
    } else {
      A = -a * a; C = b * b; D = 2 * a * a * h; E = -2 * b * b * k; G = b * b * k * k - a * a * h * h - a * a * b * b;
    }
    const coefs = [A, C, D, E, G].map(limpo);
    if (coefs.every(Number.isInteger)) {
      const mdc = (x, y) => (y === 0 ? Math.abs(x) : mdc(y, x % y));
      const m = coefs.reduce(mdc);
      if (m > 1) [A, C, D, E, G] = coefs.map((v) => v / m);
    }
    const termo = (coef, v, primeiro) => {
      if (quaseIgual(coef, 0)) return '';
      const sinal = coef < 0 ? (primeiro ? '−' : ' − ') : (primeiro ? '' : ' + ');
      const num = v && fr(Math.abs(coef)) === '1' ? '' : fr(Math.abs(coef));
      return sinal + num + v;
    };
    // o termo positivo vem primeiro: 9x² − 16y² … ou 16y² − 9x² …
    const quadrados = horizontal ? termo(A, 'x²', true) + termo(C, 'y²') : termo(C, 'y²', true) + termo(A, 'x²');
    const geral = quadrados + termo(D, 'x') + termo(E, 'y') + termo(G, '') + ' = 0';

    // 2. elementos
    const cExato = quaseIgual(c, Math.round(c), 1e-9);
    const cTexto = textoRaiz(c2);
    const fTexto = (s) => horizontal
      ? '(' + coordenada(h, s, c, cTexto, cExato) + ', ' + fr(k) + ')'
      : '(' + fr(h) + ', ' + coordenada(k, s, c, cTexto, cExato) + ')';
    const vertices = horizontal
      ? formatarPonto(h - a, k) + ' e ' + formatarPonto(h + a, k)
      : formatarPonto(h, k - a) + ' e ' + formatarPonto(h, k + a);
    const inclinacao = horizontal ? b / a : a / b;
    const incTexto = formatarFracao(inclinacao);
    const assintotas = ladoEsquerdo(k) + ' = ±' + (incTexto === '1' ? '' : (incTexto.includes('/') ? '(' + incTexto + ')' : incTexto)) + fator('x', h);
    const e = c / a;
    const eTexto = cExato
      ? formatarFracao(e) + (formatarFracao(e) === formatarNumero(e) ? '' : ' ≈ ' + formatarNumero(e))
      : textoRaizSobre(c2, a) + ' ≈ ' + formatarNumero(e);
    const equilatera = quaseIgual(a, b);

    // 3. definição no ponto P (a distância maior é a menor + 2a)
    const d1 = distancia(P, F1), d2 = distancia(P, F2);
    const perto = Math.min(d1, d2);
    const pertoR = Math.round(perto * 100) / 100;
    const longeR = limpo(Math.round((pertoR + 2 * a) * 100) / 100);
    const exato = quaseIgual(perto, Math.round(perto), 1e-9);
    const texto = (v) => (exato ? '= ' + fr(Math.round(v)) : '≈ ' + formatarNumero(v));
    const [t1, t2] = d1 <= d2 ? [texto(exato ? perto : pertoR), texto(exato ? perto + 2 * a : longeR)]
      : [texto(exato ? perto + 2 * a : longeR), texto(exato ? perto : pertoR)];
    const Ptexto = formatarPonto(Math.round(P.x * 100) / 100, Math.round(P.y * 100) / 100);

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Equação</span>
        <div class="formula">Reduzida: <strong>${reduzida}</strong></div>
        <div class="formula">Geral (tirando os denominadores e desenvolvendo): ${geral}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">2. Elementos</span>
        <ul>
          <li>Centro O${formatarPonto(h, k)}; eixo real <strong>${horizontal ? 'horizontal' : 'vertical'}</strong> (o termo positivo é o de ${horizontal ? 'x' : 'y'}).</li>
          <li>a = ${fr(a)} e b = ${fr(b)}: eixo real 2a = ${fr(2 * a)}, eixo imaginário 2b = ${fr(2 * b)}.</li>
          <li>c² = a² + b² = ${fr(a * a)} + ${fr(b * b)} = ${fr(c2)}, então <strong>c = ${cTexto}${cExato ? '' : ' ≈ ' + formatarNumero(c)}</strong>.</li>
          <li>Focos <strong>F₁${fTexto(-1)}</strong> e <strong>F₂${fTexto(1)}</strong>; vértices ${vertices}.</li>
          <li>Assíntotas: <strong>${assintotas}</strong> (inclinação ${horizontal ? 'b/a' : 'a/b'} = ${incTexto}).</li>
          <li>Excentricidade e = c/a = <strong>${eTexto}</strong>${equilatera ? ' (hipérbole equilátera: a = b e assíntotas perpendiculares)' : ''}.</li>
        </ul>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Conferindo a definição no ponto P${Ptexto}</span>
        <div class="formula">d(P, F₁) ${t1} &nbsp;&nbsp; d(P, F₂) ${t2}</div>
        <div class="formula">| d(P, F₁) − d(P, F₂) | = <strong>${fr(2 * a)} = 2a</strong> ✓</div>
        <p>P está no ramo mais perto de F${d1 <= d2 ? '₁' : '₂'}. Mova P ou troque de ramo: as distâncias mudam, mas a diferença é sempre ${fr(2 * a)}.</p>
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const t = lerNumero(controleT.value);
    saidaT.textContent = formatarNumero(t);
    const ramo = caixaRamo.checked ? -1 : 1;
    const hip = lerHiperbole();
    if (hip.erro) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">' + hip.erro + '</p>';
      return;
    }
    desenhar(hip, t, ramo);
    resultados.innerHTML = montarResultados(hip, t, ramo);
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  radiosEixo.forEach((r) => r.addEventListener('change', atualizar));
  controleT.addEventListener('input', atualizar);
  caixaRamo.addEventListener('change', atualizar);
  caixaRetangulo.addEventListener('change', atualizar);

  // Clique: escolhe o ramo pelo lado do centro e leva P à mesma "altura" (w) clicada.
  svg.addEventListener('click', (evento) => {
    const hip = lerHiperbole();
    if (hip.erro) return;
    const { x, y } = plano.pontoDoClique(evento);
    const u = hip.horizontal ? x - hip.h : y - hip.k;
    const w = hip.horizontal ? y - hip.k : x - hip.h;
    caixaRamo.checked = u < 0;
    const t = Math.asinh(w / hip.b);
    controleT.value = String(Math.max(-T_MAX, Math.min(T_MAX, Math.round(t * 10) / 10)));
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    radiosEixo.forEach((r) => { r.checked = false; });
    radiosEixo[inteiro(0, 1)].checked = true;
    campos.h.value = inteiro(-2, 2);
    campos.k.value = inteiro(-2, 2);
    campos.a.value = inteiro(1, 4);
    campos.b.value = inteiro(1, 4);
    controleT.value = inteiro(-15, 15) / 10;
    caixaRamo.checked = Math.random() < 0.5;
    atualizar();
  });

  atualizar();
})();
