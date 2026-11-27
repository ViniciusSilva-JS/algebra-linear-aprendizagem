/* =========================================================================
   js/licoes/ga-06.js — Geometria Analítica, Lição 6: Elipse
   Desenha a elipse de centro (h, k) com semieixos sx (na direção x) e sy
   (na direção y), os eixos, os vértices, os focos e um ponto P que anda
   pela curva, mostrando que d(P, F₁) + d(P, F₂) = 2a. Opcional: o
   triângulo retângulo de lados b, c e a (hipotenusa).

   O maior semieixo é o a e o menor é o b, então o eixo maior fica onde o
   usuário puser o semieixo maior. Com sx = sy a curva é uma circunferência.

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
  const svg = document.getElementById('g6-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 9 });
  const LIMITE_CENTRO = 5;
  const SEMIEIXO_MAX = 8;

  const campos = {
    h: document.getElementById('g6-h'),
    k: document.getElementById('g6-k'),
    sx: document.getElementById('g6-sx'),
    sy: document.getElementById('g6-sy'),
  };
  const controleT = document.getElementById('g6-t');
  const saidaT = document.getElementById('g6-t-valor');
  const caixaTriangulo = document.getElementById('g6-triangulo');
  const btnSortear = document.getElementById('g6-sortear');
  const resultados = document.getElementById('g6-resultados');

  const fr = (x) => formatarNumero(limpo(x));
  const p = formatarComParenteses;

  function limpo(v) {
    return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v;
  }

  /** "(x − 2)²", "(y + 1)²" ou "x²". */
  function quadrado(variavel, centro) {
    if (quaseIgual(centro, 0)) return variavel + '²';
    return '(' + variavel + (centro > 0 ? ' − ' : ' + ') + fr(Math.abs(centro)) + ')²';
  }

  /** c = √(a² − b²) como texto: "4" (exato) ou "√7". */
  function raizTexto(quadradoValor) {
    const r = Math.sqrt(quadradoValor);
    if (quaseIgual(r, Math.round(r), 1e-9)) return fr(Math.round(r));
    return '√' + fr(quadradoValor);
  }

  /** "h ± c" como coordenada: "4", "2 − √7", "−√7". */
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

  function lerElipse() {
    const h = lerCampo(campos.h, -LIMITE_CENTRO, LIMITE_CENTRO);
    const k = lerCampo(campos.k, -LIMITE_CENTRO, LIMITE_CENTRO);
    const sx = lerCampo(campos.sx, 0.5, SEMIEIXO_MAX);
    const sy = lerCampo(campos.sy, 0.5, SEMIEIXO_MAX);
    if (h === null || k === null) return { erro: 'O centro precisa ter h e k de −' + LIMITE_CENTRO + ' a ' + LIMITE_CENTRO + '.' };
    if (sx === null || sy === null) return { erro: 'Os semieixos precisam ser positivos e no máximo ' + SEMIEIXO_MAX + '.' };

    const horizontal = sx >= sy;
    const a = Math.max(sx, sy);
    const b = Math.min(sx, sy);
    const c2 = limpo(a * a - b * b);
    return { h, k, sx, sy, a, b, c2, c: Math.sqrt(c2), horizontal };
  }


  /* =======================================================================
     3. GEOMETRIA
     ======================================================================= */
  function pontoNoAngulo(el, graus) {
    const t = (graus * Math.PI) / 180;
    return { x: limpo(el.h + el.sx * Math.cos(t)), y: limpo(el.k + el.sy * Math.sin(t)) };
  }

  /** Focos F₁ (lado negativo) e F₂ (lado positivo) do eixo maior. */
  function focos(el) {
    const { h, k, c, horizontal } = el;
    return horizontal
      ? [{ x: h - c, y: k }, { x: h + c, y: k }]
      : [{ x: h, y: k - c }, { x: h, y: k + c }];
  }

  const distancia = (A, B) => Math.hypot(A.x - B.x, A.y - B.y);


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function rotular(texto, x, y, dx, dy, ancora) {
    if (plano.cabe(x, y)) plano.texto(texto, x + dx, y + dy, 'rotulo-ponto', ancora);
  }

  function desenhar(el, graus) {
    plano.limpar();
    const { h, k, sx, sy, b, c, horizontal } = el;
    const [F1, F2] = focos(el);

    // eixos da elipse
    plano.linha(h - sx, k, h + sx, k, 'cateto');
    plano.linha(h, k - sy, h, k + sy, 'cateto');

    // triângulo b, c, a: centro, foco F₂ e a ponta do eixo menor
    if (caixaTriangulo.checked && c > 1e-9) {
      const B = horizontal ? { x: h, y: k + b } : { x: h + b, y: k };
      plano.poligono([[h, k], [F2.x, F2.y], [B.x, B.y]], 'regiao-paralelogramo');
      plano.linha(B.x, B.y, F2.x, F2.y, 'lado-a');
      const meio = (P, Q) => ({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });
      const mA = meio(B, F2), mB = meio({ x: h, y: k }, B), mC = meio({ x: h, y: k }, F2);
      if (horizontal) {
        plano.texto('a', mA.x + 0.3, mA.y + 0.3, 'rotulo-cateto', 'start');
        plano.texto('b', mB.x - 0.3, mB.y, 'rotulo-cateto', 'end');
        plano.texto('c', mC.x, mC.y - 0.7, 'rotulo-cateto', 'middle');
      } else {
        plano.texto('a', mA.x + 0.3, mA.y + 0.3, 'rotulo-cateto', 'start');
        plano.texto('b', mB.x, mB.y - 0.7, 'rotulo-cateto', 'middle');
        plano.texto('c', mC.x - 0.3, mC.y, 'rotulo-cateto', 'end');
      }
    }

    // a curva (fechada)
    const pts = [];
    for (let g = 0; g <= 360; g += 3) {
      const q = pontoNoAngulo(el, g);
      pts.push([q.x, q.y]);
    }
    plano.poligonal(pts, 'elipse');

    // P ligado aos dois focos
    const P = pontoNoAngulo(el, graus);
    plano.linha(P.x, P.y, F1.x, F1.y, 'reta reta-perpendicular');
    plano.linha(P.x, P.y, F2.x, F2.y, 'distancia-diretriz');

    // vértices (eixo maior) e pontas do eixo menor
    [[h - sx, k], [h + sx, k], [h, k - sy], [h, k + sy]].forEach(([x, y]) => {
      if (plano.cabe(x, y)) plano.ponto(x, y, 0.16, 'ponto ponto-b');
    });

    plano.ponto(h, k, 0.2, 'ponto ponto-m');
    rotular('O', h, k, -0.35, -0.7, 'end');

    if (c > 1e-9) {
      [F1, F2].forEach((F, i) => {
        if (!plano.cabe(F.x, F.y)) return;
        plano.ponto(F.x, F.y, 0.24, 'ponto ponto-solucao');
        const dx = horizontal ? 0 : 0.4, dy = horizontal ? -0.8 : 0;
        plano.texto('F' + (i + 1), F.x + dx, F.y + dy, 'rotulo-ponto', horizontal ? 'middle' : 'start');
      });
    }

    if (plano.cabe(P.x, P.y)) {
      plano.ponto(P.x, P.y, 0.26, 'ponto ponto-a');
      const fora = { x: P.x - h, y: P.y - k };
      const n = Math.hypot(fora.x, fora.y) || 1;
      plano.texto('P', P.x + (fora.x / n) * 0.6, P.y + (fora.y / n) * 0.6 - 0.2, 'rotulo-ponto', fora.x < 0 ? 'end' : 'start');
    }
  }


  /* =======================================================================
     5. RESULTADOS (contas passo a passo)
     ======================================================================= */
  function montarResultados(el, graus) {
    const { h, k, sx, sy, a, b, c2, c, horizontal } = el;
    const [F1, F2] = focos(el);
    const P = pontoNoAngulo(el, graus);
    const circunferencia = quaseIgual(sx, sy);

    // 1. equações
    const reduzida = quadrado('x', h) + '/' + fr(sx * sx) + ' + ' + quadrado('y', k) + '/' + fr(sy * sy) + ' = 1';
    let A = sy * sy, C = sx * sx;
    let D = -2 * A * h, E = -2 * C * k, G = A * h * h + C * k * k - A * C;
    // Coeficientes inteiros com fator comum (ex.: circunferência 16x² + 16y² − 256) são simplificados.
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
    const geral = termo(A, 'x²', true) + termo(C, 'y²') + termo(D, 'x') + termo(E, 'y') + termo(G, '') + ' = 0';

    // 2. elementos
    const cExato = quaseIgual(c, Math.round(c), 1e-9);
    const cTexto = raizTexto(c2);
    const cAprox = cExato ? '' : ' ≈ ' + formatarNumero(c);
    const fTexto = (s) => horizontal
      ? '(' + coordenada(h, s, c, cTexto, cExato) + ', ' + fr(k) + ')'
      : '(' + fr(h) + ', ' + coordenada(k, s, c, cTexto, cExato) + ')';
    const vertices = horizontal
      ? formatarPonto(h - a, k) + ' e ' + formatarPonto(h + a, k)
      : formatarPonto(h, k - a) + ' e ' + formatarPonto(h, k + a);
    const menores = horizontal
      ? formatarPonto(h, k - b) + ' e ' + formatarPonto(h, k + b)
      : formatarPonto(h - b, k) + ' e ' + formatarPonto(h + b, k);
    const e = c / a;
    const eTexto = cExato
      ? formatarFracao(e) + (formatarFracao(e) === formatarNumero(e) ? '' : ' = ' + formatarNumero(e))
      : cTexto + '/' + fr(a) + ' ≈ ' + formatarNumero(e);

    const elementos = circunferencia ? `
        <ul>
          <li>Os dois semieixos são iguais (${fr(a)}): é uma <strong>circunferência</strong> de centro ${formatarPonto(h, k)} e raio ${fr(a)}.</li>
          <li>c² = a² − b² = 0: os dois focos se juntam no centro, e a excentricidade é <strong>e = 0</strong>.</li>
        </ul>` : `
        <ul>
          <li>Centro O${formatarPonto(h, k)}; eixo maior <strong>${horizontal ? 'horizontal' : 'vertical'}</strong> (o maior denominador, ${fr(a * a)}, está sob o ${horizontal ? 'x' : 'y'}).</li>
          <li>a = ${fr(a)} e b = ${fr(b)}: eixo maior 2a = ${fr(2 * a)}, eixo menor 2b = ${fr(2 * b)}.</li>
          <li>c² = a² − b² = ${fr(a * a)} − ${fr(b * b)} = ${fr(c2)}, então <strong>c = ${cTexto}${cAprox}</strong>.</li>
          <li>Focos <strong>F₁${fTexto(-1)}</strong> e <strong>F₂${fTexto(1)}</strong>.</li>
          <li>Vértices do eixo maior ${vertices}; pontas do eixo menor ${menores}.</li>
          <li>Excentricidade e = c/a = <strong>${eTexto}</strong>${e < 0.3 ? ' (quase uma circunferência)' : e > 0.85 ? ' (bem achatada)' : ''}.</li>
        </ul>`;

    // 3. definição no ponto P
    const d1 = distancia(P, F1), d2 = distancia(P, F2);
    const d1r = Math.round(d1 * 100) / 100;
    const d2r = limpo(Math.round((2 * a - d1r) * 100) / 100);
    const exato = (d) => quaseIgual(d, Math.round(d), 1e-9);
    const dTexto = (d, r) => exato(d) ? fr(Math.round(d)) : '≈ ' + formatarNumero(r);
    const Ptexto = formatarPonto(Math.round(P.x * 100) / 100, Math.round(P.y * 100) / 100);

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Equação</span>
        <div class="formula">Reduzida: <strong>${reduzida}</strong></div>
        <div class="formula">Geral (tirando os denominadores e desenvolvendo): ${geral}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">2. Elementos</span>
        ${elementos}
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Conferindo a definição no ponto P${Ptexto}</span>
        <div class="formula">d(P, F₁) ${exato(d1) ? '= ' : ''}${dTexto(d1, d1r)} &nbsp;&nbsp; d(P, F₂) ${exato(d2) ? '= ' : ''}${dTexto(d2, d2r)}</div>
        <div class="formula">d(P, F₁) + d(P, F₂) = <strong>${fr(2 * a)} = 2a</strong> ✓</div>
        <p>${circunferencia
          ? 'Na circunferência os dois focos coincidem com o centro: cada distância é o raio, e a soma é o diâmetro.'
          : 'Mova P: as duas distâncias mudam, mas a soma é sempre ' + fr(2 * a) + ', o comprimento do "fio".'}</p>
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const graus = lerNumero(controleT.value);
    saidaT.textContent = formatarNumero(graus) + '°';
    const el = lerElipse();
    if (el.erro) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">' + el.erro + '</p>';
      return;
    }
    desenhar(el, graus);
    resultados.innerHTML = montarResultados(el, graus);
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  controleT.addEventListener('input', atualizar);
  caixaTriangulo.addEventListener('change', atualizar);

  // Clique: leva P para o ponto da elipse na direção clicada (a partir do centro).
  svg.addEventListener('click', (evento) => {
    const el = lerElipse();
    if (el.erro) return;
    const { x, y } = plano.pontoDoClique(evento);
    if (quaseIgual(x, el.h) && quaseIgual(y, el.k)) return;
    let graus = (Math.atan2((y - el.k) / el.sy, (x - el.h) / el.sx) * 180) / Math.PI;
    if (graus < 0) graus += 360;
    controleT.value = String(Math.round(graus / 5) * 5 % 360);
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    campos.h.value = inteiro(-2, 2);
    campos.k.value = inteiro(-2, 2);
    const s1 = inteiro(2, 6);
    let s2;
    do { s2 = inteiro(1, 6); } while (s2 === s1);
    campos.sx.value = s1;
    campos.sy.value = s2;
    controleT.value = inteiro(0, 23) * 15;
    atualizar();
  });

  atualizar();
})();
