/* =========================================================================
   js/licoes/ga-04.js — Geometria Analítica, Lição 4: Posições relativas com a circunferência
   Três modos, sempre "distância contra raio":
   - ponto: d(P, C) comparado com r (dentro / sobre / fora);
   - reta: distância do centro à reta (secante / tangente / externa),
     com os pontos de encontro e o comprimento da corda;
   - duas circunferências: distância entre centros contra r₁ + r₂ e |r₁ − r₂|,
     com os pontos de encontro.

   Índice
   1. Elementos
   2. Leitura dos campos
   3. Desenho comum
   4. Modo ponto
   5. Modo reta
   6. Modo duas circunferências
   7. Atualização geral
   8. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g4-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 9 });
  const LIMITE_CENTRO = 8;
  const LIMITE_RAIO = 8;
  const LIMITE_COEF = 30;
  const TOL = 1e-9;

  const campos = {
    xc: document.getElementById('g4-xc'), yc: document.getElementById('g4-yc'), r: document.getElementById('g4-r'),
    px: document.getElementById('g4-px'), py: document.getElementById('g4-py'),
    a: document.getElementById('g4-a'), b: document.getElementById('g4-b'), c: document.getElementById('g4-c'),
    x2: document.getElementById('g4-x2'), y2: document.getElementById('g4-y2'), r2: document.getElementById('g4-r2'),
  };
  const radiosModo = Array.from(document.querySelectorAll('input[name="g4-modo"]'));
  const grupos = {
    ponto: document.getElementById('g4-campo-ponto'),
    reta: document.getElementById('g4-campo-reta'),
    duas: document.getElementById('g4-campo-c2'),
  };
  const dica = document.getElementById('g4-dica');
  const btnSortear = document.getElementById('g4-sortear');
  const resultados = document.getElementById('g4-resultados');

  const fr = formatarFracao;
  const p = formatarComParenteses;
  const n2 = (x) => formatarNumero(x);

  function modoAtual() {
    const marcado = radiosModo.find((r) => r.checked);
    return marcado ? marcado.value : 'ponto';
  }

  /** Comparação com tolerância: −1 (menor), 0 (igual), 1 (maior). */
  function comparar(x, y) {
    if (Math.abs(x - y) < 1e-7) return 0;
    return x < y ? -1 : 1;
  }

  /** "√13 ≈ 3,61", "√25 = 5" ou "5" quando já é exato. */
  function raizTexto(quadrado) {
    const raiz = Math.sqrt(quadrado);
    if (quaseIgual(raiz, Math.round(raiz))) return '√' + fr(quadrado) + ' = ' + fr(Math.round(raiz));
    return '√' + n2(quadrado) + ' ≈ ' + n2(raiz);
  }


  /* =======================================================================
     2. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCampo(campo, minimo, maximo) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || valor < minimo || valor > maximo;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerCircunferencia(cx, cy, cr) {
    const x = lerCampo(cx, -LIMITE_CENTRO, LIMITE_CENTRO);
    const y = lerCampo(cy, -LIMITE_CENTRO, LIMITE_CENTRO);
    const r = lerCampo(cr, 0, LIMITE_RAIO);
    if (x === null || y === null || r === null) return null;
    if (r === 0) { cr.classList.add('erro'); return null; }
    return { x, y, r };
  }


  /* =======================================================================
     3. DESENHO COMUM
     ======================================================================= */
  function desenharCircunferencia(C, nome, classe) {
    plano.arco(C.x, C.y, C.r, 0, 2 * Math.PI, 'circunferencia ' + classe);
    if (plano.cabe(C.x, C.y)) {
      plano.ponto(C.x, C.y, 0.24, 'ponto ' + (classe ? 'ponto-b' : 'ponto-m'));
      plano.texto(nome, C.x - 0.35, C.y + 0.4, 'rotulo-ponto', 'end');
    }
  }

  function desenharPonto(P, nome, classe) {
    if (!plano.cabe(P.x, P.y)) return;
    plano.ponto(P.x, P.y, 0.24, 'ponto ' + classe);
    if (nome) plano.texto(nome, P.x + 0.35, P.y + 0.4, 'rotulo-ponto', 'start');
  }

  function segmentoDistancia(P, Q, rotulo) {
    plano.linha(P.x, P.y, Q.x, Q.y, 'reta reta-perpendicular');
    if (rotulo) plano.texto(rotulo, (P.x + Q.x) / 2 + 0.3, (P.y + Q.y) / 2 + 0.3, 'rotulo-cateto', 'start');
  }

  /** Tira o "ruído" de arredondamento: 2,9999999 vira 3. */
  function limpo(v) {
    return Math.abs(v - Math.round(v)) < 1e-7 ? Math.round(v) : v;
  }

  function listaPontos(pontos) {
    return pontos.map((q) => formatarPonto(limpo(q.x), limpo(q.y))).join(" e ");
  }


  /* =======================================================================
     4. MODO PONTO
     ======================================================================= */
  function modoPonto(C) {
    const px = lerCampo(campos.px, -plano.limite, plano.limite);
    const py = lerCampo(campos.py, -plano.limite, plano.limite);
    if (px === null || py === null) return erro('As coordenadas de P vão de −' + plano.limite + ' a ' + plano.limite + '.');
    const P = { x: px, y: py };
    const soma = (P.x - C.x) ** 2 + (P.y - C.y) ** 2;
    const r2 = C.r * C.r;
    const pos = comparar(soma, r2);

    plano.limpar();
    desenharCircunferencia(C, 'C', '');
    if (soma > TOL) segmentoDistancia(C, P, 'd');
    desenharPonto(P, 'P', 'ponto-a');

    const etiqueta = [
      '<span class="etiqueta etiqueta-verde">Dentro</span> d &lt; r: P está no interior do círculo.',
      '<span class="etiqueta etiqueta-azul">Sobre</span> d = r: P é um ponto da circunferência.',
      '<span class="etiqueta etiqueta-ambar">Fora</span> d &gt; r: P está fora do círculo.',
    ][pos + 1];

    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Substituindo P na equação</span>
        <div class="formula">(x − x<sub>C</sub>)² + (y − y<sub>C</sub>)² = (${fr(P.x)} − ${p(C.x)})² + (${fr(P.y)} − ${p(C.y)})² = ${fr((P.x - C.x) ** 2)} + ${fr((P.y - C.y) ** 2)} = ${fr(soma)}</div>
        <div class="formula">r² = ${p(C.r)}² = ${fr(r2)} &nbsp;→&nbsp; ${fr(soma)} ${['&lt;', '=', '&gt;'][pos + 1]} ${fr(r2)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Conclusão</span>
        <p>d(P, C) = ${raizTexto(soma)} e r = ${fr(C.r)}.</p>
        <p>${etiqueta}</p>
        ${pos !== 0 && soma > TOL ? `<p class="lab-dica">Ponto da circunferência mais perto de P: a ${n2(Math.abs(Math.sqrt(soma) - C.r))} dele; o mais longe: a ${n2(Math.sqrt(soma) + C.r)}.</p>` : ''}
      </div>`;
  }


  /* =======================================================================
     5. MODO RETA
     ======================================================================= */
  function modoReta(C) {
    const a = lerCampo(campos.a, -LIMITE_COEF, LIMITE_COEF);
    const b = lerCampo(campos.b, -LIMITE_COEF, LIMITE_COEF);
    const c = lerCampo(campos.c, -LIMITE_COEF, LIMITE_COEF);
    if (a === null || b === null || c === null) return erro('Use coeficientes de −' + LIMITE_COEF + ' a ' + LIMITE_COEF + '.');
    if (a === 0 && b === 0) {
      campos.a.classList.add('erro'); campos.b.classList.add('erro');
      return erro('Com a = 0 e b = 0 não existe reta. Mude a ou b.');
    }
    const N = a * a + b * b;
    const v = a * C.x + b * C.y + c;
    const d = Math.abs(v) / Math.sqrt(N);
    const H = { x: C.x - (v / N) * a, y: C.y - (v / N) * b };   // pé da perpendicular
    const pos = comparar(d, C.r);
    const u = { x: -b / Math.sqrt(N), y: a / Math.sqrt(N) };     // direção da reta (unitária)

    let pontos = [];
    if (pos === 0) pontos = [H];
    if (pos < 0) {
      const t = Math.sqrt(C.r * C.r - d * d);
      pontos = [{ x: H.x + t * u.x, y: H.y + t * u.y }, { x: H.x - t * u.x, y: H.y - t * u.y }];
    }

    plano.limpar();
    desenharCircunferencia(C, 'C', '');
    plano.reta(a, b, -c, 'reta reta-secundaria');
    if (d > TOL) segmentoDistancia(C, H, 'd');
    pontos.forEach((q, i) => desenharPonto(q, pontos.length === 1 ? 'T' : (i === 0 ? 'P₁' : 'P₂'), 'ponto-solucao'));

    const conclusoes = [
      `<span class="etiqueta etiqueta-verde">Secante</span> d &lt; r: a reta corta a circunferência em dois pontos, ${listaPontos(pontos)}.`,
      `<span class="etiqueta etiqueta-azul">Tangente</span> d = r: a reta encosta em um único ponto, T = ${listaPontos(pontos)}, perpendicular ao raio.`,
      '<span class="etiqueta etiqueta-ambar">Externa</span> d &gt; r: a reta passa longe, sem pontos em comum.',
    ];
    const corda = pos < 0
      ? `<p>Comprimento da corda: 2·√(r² − d²) = 2·√(${fr(C.r * C.r)} − ${n2(d * d)}) ≈ <strong>${n2(2 * Math.sqrt(C.r * C.r - d * d))}</strong>.
         H = ${formatarPonto(limpo(H.x), limpo(H.y))} é o meio da corda.</p>`
      : '';

    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Distância do centro à reta</span>
        <div class="formula">r: ${formatarEquacaoGeral(a, b, c)} &nbsp;e&nbsp; C${formatarPonto(C.x, C.y)}</div>
        <div class="formula">d = |${fr(a)}·${p(C.x)} + ${p(b)}·${p(C.y)} + ${p(c)}| / √(${fr(a)}² + ${p(b)}²) = |${fr(v)}| / ${raizTexto(N).split(" ")[0]} ${quaseIgual(d, Math.round(d)) ? "=" : "≈"} <strong>${n2(d)}</strong></div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Comparando com o raio r = ${fr(C.r)}</span>
        <p>${conclusoes[pos + 1]}</p>
        ${corda}
      </div>`;
  }


  /* =======================================================================
     6. MODO DUAS CIRCUNFERÊNCIAS
     ======================================================================= */
  function modoDuas(C1) {
    const C2 = lerCircunferencia(campos.x2, campos.y2, campos.r2);
    if (!C2) return erro('Na segunda circunferência, use centro de −' + LIMITE_CENTRO + ' a ' + LIMITE_CENTRO + ' e raio de 0,5 a ' + LIMITE_RAIO + '.');

    const dx = C2.x - C1.x, dy = C2.y - C1.y;
    const d2 = dx * dx + dy * dy;
    const d = Math.sqrt(d2);
    const soma = C1.r + C2.r;
    const dif = Math.abs(C1.r - C2.r);

    let tipo, pontos = [];
    if (d < TOL) {
      tipo = quaseIgual(C1.r, C2.r)
        ? '<span class="etiqueta etiqueta-azul">Coincidentes</span> mesmo centro e mesmo raio: são a mesma circunferência.'
        : '<span class="etiqueta etiqueta-azul">Concêntricas</span> mesmo centro e raios diferentes: uma dentro da outra, sem pontos em comum.';
    } else {
      const ps = comparar(d, soma), pd = comparar(d, dif);
      if (ps > 0) tipo = `<span class="etiqueta etiqueta-ambar">Externas</span> d &gt; r₁ + r₂ = ${fr(soma)}: uma fora da outra, sem pontos em comum.`;
      else if (ps === 0) tipo = `<span class="etiqueta etiqueta-azul">Tangentes externas</span> d = r₁ + r₂ = ${fr(soma)}: encostam por fora em um ponto.`;
      else if (pd > 0) tipo = `<span class="etiqueta etiqueta-verde">Secantes</span> ${fr(dif)} = |r₁ − r₂| &lt; d &lt; r₁ + r₂ = ${fr(soma)}: cortam-se em dois pontos.`;
      else if (pd === 0) tipo = `<span class="etiqueta etiqueta-azul">Tangentes internas</span> d = |r₁ − r₂| = ${fr(dif)}: encostam por dentro em um ponto.`;
      else tipo = `<span class="etiqueta etiqueta-ambar">Uma dentro da outra</span> d &lt; |r₁ − r₂| = ${fr(dif)}: a menor fica solta dentro da maior.`;

      if (ps <= 0 && pd >= 0) {
        // a = distância de C1 até a reta que liga os pontos de encontro
        const aDist = (C1.r * C1.r - C2.r * C2.r + d2) / (2 * d);
        const h = Math.sqrt(Math.max(0, C1.r * C1.r - aDist * aDist));
        const M = { x: C1.x + (aDist * dx) / d, y: C1.y + (aDist * dy) / d };
        pontos = h < 1e-6 ? [M] : [{ x: M.x - (h * dy) / d, y: M.y + (h * dx) / d }, { x: M.x + (h * dy) / d, y: M.y - (h * dx) / d }];
      }
    }

    plano.limpar();
    desenharCircunferencia(C1, 'C₁', '');
    desenharCircunferencia(C2, 'C₂', 'segunda');
    if (d > TOL) segmentoDistancia(C1, C2, 'd');
    pontos.forEach((q) => desenharPonto(q, '', 'ponto-solucao'));

    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Distância entre os centros</span>
        <div class="formula">d = √((${fr(C2.x)} − ${p(C1.x)})² + (${fr(C2.y)} − ${p(C1.y)})²) = ${raizTexto(d2)}</div>
        <div class="formula">r₁ + r₂ = ${fr(C1.r)} + ${fr(C2.r)} = ${fr(soma)} &nbsp;&nbsp;|&nbsp;&nbsp; |r₁ − r₂| = ${fr(dif)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Posição</span>
        <p>${tipo}</p>
        ${pontos.length ? `<p>Ponto${pontos.length > 1 ? 's' : ''} em comum: <strong>${listaPontos(pontos)}</strong>.</p>` : ''}
      </div>`;
  }


  /* =======================================================================
     7. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function erro(texto) {
    plano.limpar();
    resultados.innerHTML = '<p class="erro">' + texto + '</p>';
  }

  const DICAS = {
    ponto: 'Clique no plano para mover o ponto P.',
    reta: 'Clique no plano para mover o centro da circunferência.',
    duas: 'Clique no plano para mover o centro da segunda circunferência.',
  };

  function atualizar() {
    const modo = modoAtual();
    Object.keys(grupos).forEach((m) => { grupos[m].hidden = m !== modo; });
    dica.textContent = DICAS[modo];

    const C = lerCircunferencia(campos.xc, campos.yc, campos.r);
    if (!C) return erro('Na circunferência, use centro de −' + LIMITE_CENTRO + ' a ' + LIMITE_CENTRO + ' e raio de 0,5 a ' + LIMITE_RAIO + '.');

    if (modo === 'reta') modoReta(C);
    else if (modo === 'duas') modoDuas(C);
    else modoPonto(C);
  }


  /* =======================================================================
     8. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  radiosModo.forEach((r) => r.addEventListener('change', atualizar));

  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    const modo = modoAtual();
    const limitar = (v) => Math.max(-LIMITE_CENTRO, Math.min(LIMITE_CENTRO, v));
    if (modo === 'ponto') { campos.px.value = x; campos.py.value = y; }
    else if (modo === 'reta') { campos.xc.value = limitar(x); campos.yc.value = limitar(y); }
    else { campos.x2.value = limitar(x); campos.y2.value = limitar(y); }
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    campos.xc.value = inteiro(-3, 3); campos.yc.value = inteiro(-3, 3); campos.r.value = inteiro(2, 5);
    const modo = modoAtual();
    if (modo === 'ponto') { campos.px.value = inteiro(-8, 8); campos.py.value = inteiro(-8, 8); }
    if (modo === 'reta') {
      let a, b;
      do { a = inteiro(-4, 4); b = inteiro(-4, 4); } while (a === 0 && b === 0);
      campos.a.value = a; campos.b.value = b; campos.c.value = inteiro(-15, 15);
    }
    if (modo === 'duas') { campos.x2.value = inteiro(-6, 6); campos.y2.value = inteiro(-6, 6); campos.r2.value = inteiro(1, 5); }
    atualizar();
  });

  atualizar();
})();
