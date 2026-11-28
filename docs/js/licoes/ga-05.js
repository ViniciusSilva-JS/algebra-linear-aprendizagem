/* =========================================================================
   js/licoes/ga-05.js — Geometria Analítica, Lição 5: Parábola
   Desenha a parábola de vértice (h, k) e parâmetro c (distância do vértice
   ao foco, com sinal), o foco, a diretriz, o eixo e um ponto P que anda
   pela curva, mostrando que d(P, F) = d(P, diretriz). Opcional: raios
   paralelos ao eixo refletindo para o foco.

   Para servir aos dois eixos, as contas usam coordenadas "da parábola":
   u = ao longo do eixo, w = perpendicular a ele, com u = w² / (4c).
   A função mapa(u, w) converte para (x, y) do plano.

   Índice
   1. Elementos
   2. Leitura dos campos
   3. Geometria (mapa, foco, diretriz)
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
  const svg = document.getElementById('g5-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 9 });
  const LIMITE_VERTICE = 6;
  const LIMITE_C = 5;

  const campos = {
    h: document.getElementById('g5-h'),
    k: document.getElementById('g5-k'),
    c: document.getElementById('g5-c'),
  };
  const radiosEixo = Array.from(document.querySelectorAll('input[name="g5-eixo"]'));
  const controleS = document.getElementById('g5-s');
  const saidaS = document.getElementById('g5-s-valor');
  const caixaRaios = document.getElementById('g5-raios');
  const btnSortear = document.getElementById('g5-sortear');
  const resultados = document.getElementById('g5-resultados');

  // Nesta lição os valores são inteiros ou "meios" (c em passos de 0,5): decimais leem melhor.
  const fr = (x) => formatarNumero(Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x);
  const p = formatarComParenteses;
  const n2 = (x) => formatarNumero(x);

  function eixoVertical() {
    const marcado = radiosEixo.find((r) => r.checked);
    return !marcado || marcado.value === 'vertical';
  }

  /** "(x − 2)²", "(y + 1)²" ou "x²". */
  function quadrado(variavel, centro) {
    if (quaseIgual(centro, 0)) return variavel + '²';
    return fator(variavel, centro) + '²';
  }

  /** "(y − 2)", "(x + 1)" ou só "y". */
  function fator(variavel, centro) {
    if (quaseIgual(centro, 0)) return variavel;
    return '(' + variavel + (centro > 0 ? ' − ' : ' + ') + fr(Math.abs(centro)) + ')';
  }

  /** "√20 ≈ 4,47" ou "4" (quando exato). */
  function distanciaTexto(quadradoDist) {
    const d = Math.sqrt(quadradoDist);
    if (quaseIgual(d, Math.round(d), 1e-9)) return fr(Math.round(d));
    return '√' + n2(quadradoDist) + ' ≈ ' + n2(d);
  }


  /* =======================================================================
     2. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCampo(campo, limite) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || Math.abs(valor) > limite;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerParabola() {
    const h = lerCampo(campos.h, LIMITE_VERTICE);
    const k = lerCampo(campos.k, LIMITE_VERTICE);
    const c = lerCampo(campos.c, LIMITE_C);
    if (h === null || k === null) return { erro: 'O vértice precisa ter h e k de −' + LIMITE_VERTICE + ' a ' + LIMITE_VERTICE + '.' };
    if (c === null) return { erro: 'Use c de −' + LIMITE_C + ' a ' + LIMITE_C + '.' };
    if (c === 0) {
      campos.c.classList.add('erro');
      return { erro: 'Com c = 0 o foco cai em cima do vértice e da diretriz: não existe parábola. Use c ≠ 0.' };
    }
    return { h, k, c, vertical: eixoVertical() };
  }


  /* =======================================================================
     3. GEOMETRIA
     ======================================================================= */
  /** Converte (u ao longo do eixo, w perpendicular) em (x, y). */
  function mapa(par, u, w) {
    return par.vertical ? { x: par.h + w, y: par.k + u } : { x: par.h + u, y: par.k + w };
  }

  /** Ponto da parábola na posição w. */
  function pontoDaParabola(par, w) {
    return mapa(par, (w * w) / (4 * par.c), w);
  }

  function limpo(v) {
    return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v;
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function desenhar(par, s) {
    plano.limpar();
    const { h, k, c, vertical } = par;
    const F = mapa(par, c, 0);
    const L = 30;

    // eixo de simetria e diretriz
    const eixoA = mapa(par, -L, 0), eixoB = mapa(par, L, 0);
    plano.linha(eixoA.x, eixoA.y, eixoB.x, eixoB.y, 'cateto');
    if (vertical) plano.reta(0, 1, k - c, 'reta reta-secundaria');
    else plano.reta(1, 0, h - c, 'reta reta-secundaria');
    const rotD = mapa(par, -c, 7.5);
    if (plano.cabe(rotD.x, rotD.y)) plano.texto('diretriz', rotD.x + 0.2, rotD.y + 0.3, 'rotulo-cateto', 'start');

    // a curva
    const pts = [];
    for (let w = -14; w <= 14.0001; w += 0.1) {
      const u = (w * w) / (4 * c);
      if (Math.abs(u) > L) continue;
      const q = mapa(par, u, w);
      pts.push([q.x, q.y]);
    }
    plano.poligonal(pts, 'parabola');

    // raios paralelos ao eixo refletindo para o foco
    if (caixaRaios.checked) {
      [-4.5, -3, -1.5, 1.5, 3, 4.5].forEach((w) => {
        const P = pontoDaParabola(par, w);
        const longe = mapa(par, Math.sign(c) * L, w);
        plano.linha(longe.x, longe.y, P.x, P.y, 'raio-luz');
        plano.linha(P.x, P.y, F.x, F.y, 'raio-luz');
      });
    }

    // P, as duas distâncias e o pé na diretriz
    const P = pontoDaParabola(par, s);
    const D = mapa(par, -c, s);
    plano.linha(P.x, P.y, F.x, F.y, 'reta reta-perpendicular');
    plano.linha(P.x, P.y, D.x, D.y, 'distancia-diretriz');
    if (plano.cabe(D.x, D.y)) plano.ponto(D.x, D.y, 0.18, 'ponto ponto-b');

    const V = { x: h, y: k };
    plano.ponto(V.x, V.y, 0.22, 'ponto ponto-m');
    plano.texto('V', V.x - 0.35, V.y - 0.7, 'rotulo-ponto', 'end');
    if (plano.cabe(F.x, F.y)) {
      plano.ponto(F.x, F.y, 0.26, 'ponto ponto-solucao');
      plano.texto('F', F.x + 0.35, F.y + 0.35, 'rotulo-ponto', 'start');
    }
    if (plano.cabe(P.x, P.y)) {
      plano.ponto(P.x, P.y, 0.26, 'ponto ponto-a');
      plano.texto('P', P.x + 0.35, P.y + 0.4, 'rotulo-ponto', 'start');
    }
  }


  /* =======================================================================
     5. RESULTADOS (contas passo a passo)
     ======================================================================= */
  function montarResultados(par, s) {
    const { h, k, c, vertical } = par;
    const F = mapa(par, c, 0);
    const P = pontoDaParabola(par, s);
    const px = limpo(P.x), py = limpo(P.y);

    const reduzida = (vertical ? quadrado('x', h) : quadrado('y', k)) + ' = ' + fr(4 * c) + '·' +
      (vertical ? fator('y', k) : fator('x', h));

    const abre = vertical ? (c > 0 ? 'para cima' : 'para baixo') : (c > 0 ? 'para a direita' : 'para a esquerda');
    const diretriz = vertical ? 'y = ' + fr(k - c) : 'x = ' + fr(h - c);
    const eixo = vertical ? 'x = ' + fr(h) : 'y = ' + fr(k);

    // definição: d(P, F) e d(P, diretriz)
    const dPF2 = (px - F.x) ** 2 + (py - F.y) ** 2;
    const dPd = vertical ? Math.abs(py - (k - c)) : Math.abs(px - (h - c));
    const contaDiretriz = vertical
      ? `|y<sub>P</sub> − ${p(k - c)}| = |${fr(py)} − ${p(k - c)}| = ${n2(dPd)}`
      : `|x<sub>P</sub> − ${p(h - c)}| = |${fr(px)} − ${p(h - c)}| = ${n2(dPd)}`;

    // equação geral (desenvolvendo)
    const D = vertical ? -2 * h : -4 * c;
    const E = vertical ? -4 * c : -2 * k;
    const G = vertical ? h * h + 4 * c * k : k * k + 4 * c * h;
    const termo = (coef, v) => quaseIgual(coef, 0) ? '' : (coef < 0 ? ' − ' : ' + ') + (v && fr(Math.abs(coef)) === '1' ? '' : fr(Math.abs(coef))) + v;
    const geral = (vertical ? 'x²' : 'y²') + termo(D, 'x') + termo(E, 'y') + termo(G, '') + ' = 0';

    const funcao = vertical ? `
      <div class="lab-resultado">
        <span class="lab-rotulo">Como gráfico de função</span>
        Isolando y: y = ${formatarFracao(1 / (4 * c))}·${quadrado('x', h)}${termo(k, '')}.
        O coeficiente a = 1/(4c) = ${formatarFracao(1 / (4 * c))}: quanto menor |c|, mais "fechada" a parábola.
      </div>` : '';

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Equação</span>
        <div class="formula">Reduzida: <strong>${reduzida}</strong> &nbsp;&nbsp;(4c = 4·${p(c)} = ${fr(4 * c)})</div>
        <div class="formula">Geral (desenvolvendo): ${geral}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">2. Elementos</span>
        <ul>
          <li>Vértice V${formatarPonto(h, k)}; eixo de simetria ${eixo}.</li>
          <li>Foco <strong>F${formatarPonto(limpo(F.x), limpo(F.y))}</strong> e diretriz <strong>${diretriz}</strong>, cada um a |c| = ${fr(Math.abs(c))} do vértice.</li>
          <li>Abre <strong>${abre}</strong> (eixo ${vertical ? 'vertical' : 'horizontal'}, c ${c > 0 ? '&gt;' : '&lt;'} 0).</li>
          <li>Corda que passa pelo foco, perpendicular ao eixo: |4c| = ${fr(Math.abs(4 * c))}.</li>
        </ul>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Conferindo a definição no ponto P${formatarPonto(px, py)}</span>
        <div class="formula">d(P, F) = √((${fr(px)} − ${p(limpo(F.x))})² + (${fr(py)} − ${p(limpo(F.y))})²) = ${distanciaTexto(dPF2)}</div>
        <div class="formula">d(P, diretriz) = ${contaDiretriz}</div>
        <p>As duas distâncias são iguais ✓ (em qualquer posição de P).</p>
      </div>
      ${funcao}`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const s = lerNumero(controleS.value);
    saidaS.textContent = formatarNumero(s);
    const par = lerParabola();
    if (par.erro) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">' + par.erro + '</p>';
      return;
    }
    desenhar(par, s);
    resultados.innerHTML = montarResultados(par, s);
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  radiosEixo.forEach((r) => r.addEventListener('change', atualizar));
  controleS.addEventListener('input', atualizar);
  caixaRaios.addEventListener('change', atualizar);

  // Clique: leva P até a altura (eixo horizontal) ou à abscissa (eixo vertical) clicada.
  svg.addEventListener('click', (evento) => {
    const par = lerParabola();
    if (par.erro) return;
    const { x, y } = plano.pontoDoClique(evento);
    const s = par.vertical ? x - par.h : y - par.k;
    controleS.value = String(Math.max(-8, Math.min(8, s)));
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    radiosEixo.forEach((r) => { r.checked = false; });
    radiosEixo[inteiro(0, 1)].checked = true;
    campos.h.value = inteiro(-3, 3);
    campos.k.value = inteiro(-3, 3);
    let c;
    do { c = inteiro(-6, 6) / 2; } while (c === 0);
    campos.c.value = c;
    controleS.value = inteiro(-8, 8);
    atualizar();
  });

  atualizar();
})();
