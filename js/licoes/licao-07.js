/* =========================================================================
   js/licoes/licao-07.js — Laboratório da Lição 7: Determinantes
   Modo 2×2: as colunas de A viram os vetores u e v, desenhados com o
   paralelogramo de área |det A| e o quadrado unitário de referência.
   Modo 3×3: regra de Sarrus passo a passo (colunas repetidas e diagonais).

   Índice
   1. Elementos
   2. Modo 2×2 (desenho + contas)
   3. Modo 3×3 (Sarrus)
   4. Atualização geral
   5. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('l7-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 10 });
  const area = document.getElementById('l7-area');
  const cont2 = document.getElementById('l7-a2');
  const cont3 = document.getElementById('l7-a3');
  const dica = document.getElementById('l7-dica');
  const radiosTamanho = Array.from(document.querySelectorAll('input[name="l7-tamanho"]'));
  const resultados = document.getElementById('l7-resultados');
  const btnSortear = document.getElementById('l7-sortear');

  const editor2 = criarEditorMatriz(cont2, { nome: 'A', linhas: 2, colunas: 2, valores: [[2, -1], [1, 2]], aoMudar: atualizar });
  const editor3 = criarEditorMatriz(cont3, { nome: 'A', linhas: 3, colunas: 3, valores: [[1, 2, 3], [0, 1, 4], [5, 6, 0]], aoMudar: atualizar });

  let proximoClique = 'u';

  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));

  function tamanhoAtual() {
    const marcado = radiosTamanho.find((r) => r.checked);
    return marcado ? Number(marcado.value) : 2;
  }


  /* =======================================================================
     2. MODO 2×2
     ======================================================================= */
  function desenhar2x2(A, det) {
    plano.limpar();
    const u = { x: A[0][0], y: A[1][0] }; // 1ª coluna
    const v = { x: A[0][1], y: A[1][1] }; // 2ª coluna

    // quadrado unitário (área 1) como referência
    plano.poligono([[0, 0], [1, 0], [1, 1], [0, 1]], 'quadrado-unitario');

    // paralelogramo formado por u e v (âmbar quando det < 0)
    plano.poligono([[0, 0], [u.x, u.y], [u.x + v.x, u.y + v.y], [v.x, v.y]],
      'regiao-det' + (det < 0 ? ' negativa' : ''));

    plano.seta(0, 0, u.x, u.y, 'vetor-u');
    plano.seta(0, 0, v.x, v.y, 'vetor-v');
    plano.rotuloSeta('u', 0, 0, u.x, u.y, 'rotulo-vetor vetor-u');
    plano.rotuloSeta('v', 0, 0, v.x, v.y, 'rotulo-vetor vetor-v');

    // área escrita no centro do paralelogramo
    if (det !== 0) {
      plano.texto('área ' + formatarNumero(Math.abs(det)), (u.x + v.x) / 2, (u.y + v.y) / 2 - 0.2, 'rotulo-area', 'middle');
    }
  }

  function etiquetaOrientacao(det) {
    if (det === 0) return '<span class="etiqueta etiqueta-ambar">det = 0 · colunas paralelas: área zero, sem inversa</span>';
    if (det > 0) return '<span class="etiqueta etiqueta-verde">det &gt; 0 · mantém a orientação (de u para v gira no sentido anti-horário)</span>';
    return '<span class="etiqueta etiqueta-azul">det &lt; 0 · inverte a orientação (a matriz "espelha" o plano)</span>';
  }

  function resultados2x2(A, det) {
    const [[a, b], [c, d]] = A;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Determinante</span>
        <div class="formula">det A = a·d − b·c = ${fr(a)}·${p(d)} − ${p(b)}·${p(c)} = ${fr(a * d)} − ${p(b * c)} = ${fr(det)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Área do paralelogramo</span>
        |det A| = ${fr(Math.abs(det))} &nbsp;(o quadradinho tracejado tem área 1, para comparar)
        <p>${etiquetaOrientacao(det)}</p>
      </div>`;
  }


  /* =======================================================================
     3. MODO 3×3 (Sarrus)
     ======================================================================= */

  /** Matriz com as duas primeiras colunas repetidas (as repetidas ficam apagadas). */
  function htmlMatrizEstendida(A) {
    let html = '<span class="matriz matriz-resultado"><span class="matriz-grade" style="--colunas: 5">';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        html += '<span class="matriz-el' + (j >= 3 ? ' repetida' : '') + '">' + fr(A[i][j % 3]) + '</span>';
      }
    }
    return html + '</span></span>';
  }

  function textoDiagonais(lista) {
    const produtos = lista.map((d) => d.fatores.map(p).join('·')).join(' + ');
    const valores = lista.map((d) => p(d.produto)).join(' + ');
    return produtos + ' = ' + valores;
  }

  function resultados3x3(A) {
    const s = sarrus(A);
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">1. Repita as duas primeiras colunas</span>
        <div class="formula">${htmlMatrizEstendida(A)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Diagonais que descem ↘</span>
        <div class="formula">${textoDiagonais(s.descendentes)} = ${fr(s.somaDescendentes)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">3. Diagonais que sobem ↗</span>
        <div class="formula">${textoDiagonais(s.ascendentes)} = ${fr(s.somaAscendentes)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">4. Determinante</span>
        <div class="formula">det A = ${fr(s.somaDescendentes)} − ${p(s.somaAscendentes)} = ${fr(s.det)}</div>
        ${s.det === 0 ? '<p><span class="etiqueta etiqueta-ambar">det = 0 · a matriz não tem inversa</span></p>' : ''}
      </div>`;
  }


  /* =======================================================================
     4. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const n = tamanhoAtual();
    svg.toggleAttribute('hidden', n !== 2); // em SVG, "hidden" só funciona como atributo
    area.classList.toggle('sem-plano', n !== 2);
    cont2.hidden = n !== 2;
    cont3.hidden = n !== 3;
    dica.hidden = n !== 2;

    const A = (n === 2 ? editor2 : editor3).ler();
    if (!A) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">Preencha todos os elementos com números (ex.: −2, 1,5 ou 1/2).</p>';
      return;
    }

    if (n === 2) {
      const det = determinante(A);
      desenhar2x2(A, det);
      resultados.innerHTML = resultados2x2(A, det);
      dica.innerHTML = '1ª coluna = vetor <strong>u</strong>, 2ª coluna = vetor <strong>v</strong>. Clique no plano para mover a ponta de <strong>' + proximoClique + '</strong>.';
    } else {
      resultados.innerHTML = resultados3x3(A);
    }
  }


  /* =======================================================================
     5. EVENTOS
     ======================================================================= */
  radiosTamanho.forEach((r) => r.addEventListener('change', atualizar));

  // Clique no plano: move a ponta de u (1ª coluna) ou de v (2ª coluna).
  svg.addEventListener('click', (evento) => {
    const A = editor2.ler();
    if (!A) return;
    const { x, y } = plano.pontoDoClique(evento);
    if (proximoClique === 'u') {
      A[0][0] = x; A[1][0] = y;
      proximoClique = 'v';
    } else {
      A[0][1] = x; A[1][1] = y;
      proximoClique = 'u';
    }
    editor2.definir(A);
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const n = tamanhoAtual();
    const limite = n === 2 ? 5 : 4;
    const M = criarMatriz(n, n, () => Math.floor(Math.random() * (2 * limite + 1)) - limite);
    (n === 2 ? editor2 : editor3).definir(M);
    atualizar();
  });

  atualizar();
})();
