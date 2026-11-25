/* =========================================================================
   js/licoes/licao-09.js — Laboratório da Lição 9: Matriz inversa
   Calcula a inversa por Gauss-Jordan mostrando cada operação de linha
   sobre [A | I], confere A · A⁻¹ = I e, no 2×2, mostra também a fórmula.
   Se det A = 0, explica por que não existe inversa.

   Índice
   1. Elementos
   2. Partes do resultado
   3. Atualização geral
   4. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const cont2 = document.getElementById('l9-a2');
  if (!cont2) return;

  const cont3 = document.getElementById('l9-a3');
  const radiosTamanho = Array.from(document.querySelectorAll('input[name="l9-tamanho"]'));
  const resultados = document.getElementById('l9-resultados');
  const btnSortear = document.getElementById('l9-sortear');
  const btnSingular = document.getElementById('l9-singular');

  const editor2 = criarEditorMatriz(cont2, { nome: 'A', linhas: 2, colunas: 2, valores: [[2, 1], [1, 3]], aoMudar: atualizar });
  const editor3 = criarEditorMatriz(cont3, { nome: 'A', linhas: 3, colunas: 3, valores: [[1, 2, 0], [0, 1, 1], [1, 0, 2]], aoMudar: atualizar });

  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));

  function tamanhoAtual() {
    const marcado = radiosTamanho.find((r) => r.checked);
    return marcado ? Number(marcado.value) : 2;
  }

  function editorAtual() {
    return tamanhoAtual() === 2 ? editor2 : editor3;
  }


  /* =======================================================================
     2. PARTES DO RESULTADO
     ======================================================================= */

  /** Fórmula do 2×2: (1/det) · [d −b; −c a]. */
  function blocoFormula2x2(A, det) {
    const [[a, b], [c, d]] = A;
    const adjunta = [[d, -b], [-c, a]];
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">Pela fórmula do 2×2</span>
        <div class="formula">A⁻¹ = (1 / ${p(det)}) · ${htmlMatriz(adjunta)} = ${htmlMatriz(multiplicarMatrizPorEscalar(1 / det, adjunta))}</div>
      </div>`;
  }

  /** Lista dos passos de Gauss-Jordan, cada um com a matriz aumentada. */
  function blocoPassos(passos, n) {
    const itens = passos.map((passo, k) => `
      <li class="passo-gauss">
        <span class="passo-gauss-descricao">${k === 0 ? '' : k + '. '}${passo.descricao}</span>
        ${htmlMatriz(passo.matriz, { separarColuna: n })}
      </li>`).join('');
    return `
      <details class="lab-resultado passos-gauss" open>
        <summary class="lab-rotulo lab-rotulo-m">Gauss-Jordan: [A | I] → [I | A⁻¹] &nbsp;(${passos.length - 1} ${passos.length - 1 === 1 ? 'operação' : 'operações'})</summary>
        <ol class="lista-passos-gauss">${itens}</ol>
      </details>`;
  }


  /* =======================================================================
     3. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const n = tamanhoAtual();
    cont2.hidden = n !== 2;
    cont3.hidden = n !== 3;

    const A = editorAtual().ler();
    if (!A) {
      resultados.innerHTML = '<p class="erro">Preencha todos os elementos com números (ex.: −2, 1,5 ou 1/2).</p>';
      return;
    }

    const det = determinante(A);
    let html = `
      <div class="lab-resultado">
        <span class="lab-rotulo">1. Existe inversa?</span>
        det A = ${fr(det)} &nbsp;
        ${det === 0
          ? '<span class="etiqueta etiqueta-ambar">det = 0 · A NÃO tem inversa</span>'
          : '<span class="etiqueta etiqueta-verde">det ≠ 0 · A tem inversa</span>'}
      </div>`;

    const { inversa, passos } = inversaComPassos(A);

    if (!inversa || det === 0) {
      html += blocoPassos(passos, n);
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">Por que não deu?</span>
          Em algum momento uma coluna ficou sem pivô (só zeros onde precisaríamos de um número diferente de zero),
          então o lado esquerdo nunca vira I. Isso acontece exatamente quando det A = 0: as linhas são
          dependentes (uma é combinação das outras) e a matriz "achata" o espaço, perdendo informação que
          não pode ser recuperada.
        </div>`;
      resultados.innerHTML = html;
      return;
    }

    if (n === 2) html += blocoFormula2x2(A, det);
    html += blocoPassos(passos, n);

    const conferencia = multiplicarMatrizes(A, inversa);
    const ehIdentidade = conferencia.every((linha, i) => linha.every((v, j) => quaseIgual(v, i === j ? 1 : 0, 1e-9)));
    html += `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Resultado</span>
        <div class="formula">A⁻¹ = ${htmlMatriz(inversa, { classe: 'matriz-resultado' })}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">3. Conferindo: A · A⁻¹</span>
        <div class="formula">${htmlMatriz(A)} · ${htmlMatriz(inversa)} = ${htmlMatriz(conferencia)} ${ehIdentidade ? '= I ✓' : '✗'}</div>
      </div>`;

    resultados.innerHTML = html;
  }


  /* =======================================================================
     4. EVENTOS
     ======================================================================= */
  radiosTamanho.forEach((r) => r.addEventListener('change', atualizar));

  btnSortear.addEventListener('click', () => {
    const n = tamanhoAtual();
    let M;
    // sorteia até achar uma matriz invertível com determinante "pequeno"
    // (para a inversa ter frações simples)
    do {
      M = criarMatriz(n, n, () => Math.floor(Math.random() * 9) - 4);
    } while (determinante(M) === 0 || Math.abs(determinante(M)) > 12);
    editorAtual().definir(M);
    atualizar();
  });

  btnSingular.addEventListener('click', () => {
    const n = tamanhoAtual();
    // 2ª linha = 2 × 1ª linha (e, no 3×3, 3ª = 1ª + 2ª): determinante zero
    editorAtual().definir(n === 2 ? [[1, 3], [2, 6]] : [[1, 2, 1], [0, 1, 3], [1, 3, 4]]);
    atualizar();
  });

  atualizar();
})();
