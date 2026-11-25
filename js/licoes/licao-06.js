/* =========================================================================
   js/licoes/licao-06.js — Laboratório da Lição 6: Multiplicação de matrizes
   Editores de A (m×n) e B (n×p), produto com elementos clicáveis: ao
   clicar em c_ij, a linha i da 1ª matriz e a coluna j da 2ª ficam
   realçadas e a conta "linha · coluna" aparece. O botão "Trocar a ordem"
   calcula B·A para mostrar que o produto não é comutativo.
   Matrizes: js/componentes/matriz.js · contas: js/utils/matematica.js

   Índice
   1. Elementos
   2. Conta de um elemento (linha · coluna)
   3. Atualização geral
   4. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const contA = document.getElementById('l6-a');
  if (!contA) return;

  const seletorM = document.getElementById('l6-m');
  const seletorN = document.getElementById('l6-n');
  const seletorP = document.getElementById('l6-p');
  const btnTrocar = document.getElementById('l6-trocar');
  const btnSortear = document.getElementById('l6-sortear');
  const resultados = document.getElementById('l6-resultados');

  const editorA = criarEditorMatriz(contA, {
    nome: 'A', linhas: 2, colunas: 2, valores: [[2, 1], [0, 3]], aoMudar: atualizar,
  });
  const editorB = criarEditorMatriz(document.getElementById('l6-b'), {
    nome: 'B', linhas: 2, colunas: 2, valores: [[1, 4], [2, -1]], aoMudar: atualizar,
  });

  let invertida = false;     // false: A·B | true: B·A
  let selecionada = [0, 0];


  /* =======================================================================
     2. CONTA DE UM ELEMENTO (linha i da esquerda · coluna j da direita)
     ======================================================================= */
  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));

  function contaDoElemento(E, D, nomeE, nomeD, i, j) {
    const produtos = [];
    const valores = [];
    let soma = 0;
    for (let k = 0; k < D.length; k++) {
      produtos.push(fr(E[i][k]) + '·' + p(D[k][j]));
      valores.push(E[i][k] * D[k][j]);
      soma += E[i][k] * D[k][j];
    }
    const parcelas = valores.map((v, k) => (k === 0 ? fr(v) : (v < 0 ? ' − ' + fr(-v) : ' + ' + fr(v)))).join('');
    return nomeElemento('c', i, j) + ' = (linha ' + (i + 1) + ' de ' + nomeE + ') · (coluna ' + (j + 1) + ' de ' + nomeD + ') = ' +
      produtos.join(' + ') + (valores.length > 1 ? ' = ' + parcelas : '') + ' = ' + fr(soma);
  }

  /** Lista de [i, j] de uma linha inteira ou de uma coluna inteira. */
  const linhaInteira = (i, colunas) => Array.from({ length: colunas }, (_, k) => [i, k]);
  const colunaInteira = (j, linhas) => Array.from({ length: linhas }, (_, k) => [k, j]);


  /* =======================================================================
     3. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const A = editorA.ler();
    const B = editorB.ler();
    if (!A || !B) {
      editorA.destacar([]);
      editorB.destacar([]);
      resultados.innerHTML = '<p class="erro">Preencha todos os elementos com números (ex.: −2, 1,5 ou 1/2).</p>';
      return;
    }

    // E = matriz da esquerda, D = da direita
    const E = invertida ? B : A;
    const D = invertida ? A : B;
    const nomeE = invertida ? 'B' : 'A';
    const nomeD = invertida ? 'A' : 'B';
    const editorE = invertida ? editorB : editorA;
    const editorD = invertida ? editorA : editorB;
    const ordem = `${nomeE} (${ordemMatriz(E)}) · ${nomeD} (${ordemMatriz(D)})`;

    const C = multiplicarMatrizes(E, D);
    if (!C) {
      editorA.destacar([]);
      editorB.destacar([]);
      resultados.innerHTML = `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">${nomeE} · ${nomeD}</span>
          <p class="erro">${ordem}: não dá para multiplicar! ${nomeE} tem ${E[0].length} coluna(s), mas ${nomeD} tem ${D.length} linha(s).
          Cada linha de ${nomeE} precisa ter o mesmo tamanho de cada coluna de ${nomeD}.</p>
        </div>`;
      return;
    }

    selecionada = [Math.min(selecionada[0], C.length - 1), Math.min(selecionada[1], C[0].length - 1)];
    const [i, j] = selecionada;
    editorE.destacar(linhaInteira(i, E[0].length));
    editorD.destacar(colunaInteira(j, D.length));

    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">${nomeE} · ${nomeD} &nbsp;—&nbsp; ${ordem} = ordem ${ordemMatriz(C)}</span>
        <div class="formula">${nomeE} · ${nomeD} = ${htmlMatriz(C, { clicavel: true, selecionada: selecionada, classe: 'matriz-resultado' })}</div>
        <p class="lab-dica">Clique em um elemento do resultado. A linha de ${nomeE} e a coluna de ${nomeD} usadas ficam realçadas acima.</p>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Linha · coluna</span>
        <div class="formula">${contaDoElemento(E, D, nomeE, nomeD, i, j)}</div>
      </div>`;
  }


  /* =======================================================================
     4. EVENTOS
     ======================================================================= */
  function mudarTamanho() {
    const m = Number(seletorM.value);
    const n = Number(seletorN.value);
    const pp = Number(seletorP.value);
    editorA.redimensionar(m, n);
    editorB.redimensionar(n, pp);
    atualizar();
  }
  [seletorM, seletorN, seletorP].forEach((s) => s.addEventListener('change', mudarTamanho));

  btnTrocar.addEventListener('click', () => {
    invertida = !invertida;
    btnTrocar.setAttribute('aria-pressed', String(invertida));
    btnTrocar.textContent = invertida ? '⇄ Voltar para A · B' : '⇄ Trocar a ordem (B · A)';
    atualizar();
  });

  resultados.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.matriz-celula');
    if (!botao) return;
    selecionada = [Number(botao.dataset.i), Number(botao.dataset.j)];
    atualizar();
    const novo = resultados.querySelector('.matriz-celula.selecionada');
    if (novo) novo.focus();
  });

  btnSortear.addEventListener('click', () => {
    const sortear = (l, c) => criarMatriz(l, c, () => Math.floor(Math.random() * 11) - 5);
    editorA.definir(sortear(editorA.linhas, editorA.colunas));
    editorB.definir(sortear(editorB.linhas, editorB.colunas));
    atualizar();
  });

  atualizar();
})();
