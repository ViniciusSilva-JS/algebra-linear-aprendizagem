/* =========================================================================
   js/licoes/licao-05.js — Laboratório da Lição 5: Matrizes
   Editores das matrizes A e B, operação escolhida (A + B, A − B, k·A, Aᵀ)
   e o resultado com elementos clicáveis: ao clicar, mostra a conta daquele
   elemento e realça, em A e B, os elementos usados.
   Matrizes: js/componentes/matriz.js · contas: js/utils/matematica.js

   Índice
   1. Elementos
   2. Leitura
   3. Conta de um elemento do resultado
   4. Atualização geral
   5. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const contA = document.getElementById('l5-a');
  if (!contA) return;

  const seletorLinhas = document.getElementById('l5-linhas');
  const seletorColunas = document.getElementById('l5-colunas');
  const campoK = document.getElementById('l5-k');
  const grupoK = document.getElementById('l5-grupo-k');
  const blocoB = document.getElementById('l5-bloco-b');
  const radiosOperacao = Array.from(document.querySelectorAll('input[name="l5-operacao"]'));
  const resultados = document.getElementById('l5-resultados');
  const btnSortear = document.getElementById('l5-sortear');

  const editorA = criarEditorMatriz(contA, {
    nome: 'A', linhas: 2, colunas: 3, valores: [[1, 4, -2], [0, 3, 5]], aoMudar: atualizar,
  });
  const editorB = criarEditorMatriz(document.getElementById('l5-b'), {
    nome: 'B', linhas: 2, colunas: 3, valores: [[2, -1, 0], [6, 1, -3]], aoMudar: atualizar,
  });

  let selecionada = [0, 0]; // elemento do resultado cuja conta é mostrada


  /* =======================================================================
     2. LEITURA
     ======================================================================= */
  function operacaoAtual() {
    const marcado = radiosOperacao.find((r) => r.checked);
    return marcado ? marcado.value : 'soma';
  }

  function lerK() {
    const k = lerNumero(campoK.value);
    campoK.classList.toggle('erro', Number.isNaN(k));
    return k;
  }


  /* =======================================================================
     3. CONTA DE UM ELEMENTO DO RESULTADO
     Devolve { texto, emA, emB }: a conta e os elementos usados de A e B.
     ======================================================================= */
  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));

  function contaDoElemento(operacao, A, B, k, i, j, valor) {
    const c = nomeElemento('c', i, j);
    const a = nomeElemento('a', i, j);
    const b = nomeElemento('b', i, j);
    switch (operacao) {
      case 'soma':
        return { texto: `${c} = ${a} + ${b} = ${fr(A[i][j])} + ${p(B[i][j])} = ${fr(valor)}`, emA: [[i, j]], emB: [[i, j]] };
      case 'subtracao':
        return { texto: `${c} = ${a} − ${b} = ${fr(A[i][j])} − ${p(B[i][j])} = ${fr(valor)}`, emA: [[i, j]], emB: [[i, j]] };
      case 'escalar':
        return { texto: `${c} = k · ${a} = ${fr(k)} · ${p(A[i][j])} = ${fr(valor)}`, emA: [[i, j]], emB: [] };
      default: {
        // transposta: o elemento (i, j) de Aᵀ é o elemento (j, i) de A
        const aji = nomeElemento('a', j, i);
        return { texto: `(Aᵀ)${subscrito(i + 1)}${subscrito(j + 1)} = ${aji} = ${fr(valor)} &nbsp;(linha e coluna trocadas)`, emA: [[j, i]], emB: [] };
      }
    }
  }


  /* =======================================================================
     4. ATUALIZAÇÃO GERAL
     ======================================================================= */
  const NOMES = { soma: 'A + B', subtracao: 'A − B', escalar: 'k · A', transposta: 'Aᵀ' };

  function atualizar() {
    const operacao = operacaoAtual();
    const usaB = operacao === 'soma' || operacao === 'subtracao';
    blocoB.hidden = !usaB;
    grupoK.hidden = operacao !== 'escalar';

    const A = editorA.ler();
    const B = usaB ? editorB.ler() : null;
    const k = operacao === 'escalar' ? lerK() : 1;
    if (!A || (usaB && !B) || Number.isNaN(k)) {
      editorA.destacar([]);
      editorB.destacar([]);
      resultados.innerHTML = '<p class="erro">Preencha todos os elementos com números (ex.: −2, 1,5 ou 1/2).</p>';
      return;
    }

    let R;
    if (operacao === 'soma') R = somarMatrizes(A, B);
    else if (operacao === 'subtracao') R = subtrairMatrizes(A, B);
    else if (operacao === 'escalar') R = multiplicarMatrizPorEscalar(k, A);
    else R = transposta(A);

    // a seleção precisa caber no resultado (a transposta muda a ordem)
    selecionada = [Math.min(selecionada[0], R.length - 1), Math.min(selecionada[1], R[0].length - 1)];
    const [i, j] = selecionada;
    const conta = contaDoElemento(operacao, A, B, k, i, j, R[i][j]);
    editorA.destacar(conta.emA);
    editorB.destacar(conta.emB);

    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Resultado: ${NOMES[operacao]} &nbsp;(ordem ${ordemMatriz(R)})</span>
        <div class="formula">${NOMES[operacao]} = ${htmlMatriz(R, { clicavel: true, selecionada: selecionada, classe: 'matriz-resultado' })}</div>
        <p class="lab-dica">Clique em um elemento do resultado para ver a conta. Os elementos usados ficam realçados nas matrizes acima.</p>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Conta do elemento selecionado</span>
        <div class="formula">${conta.texto}</div>
      </div>`;
  }


  /* =======================================================================
     5. EVENTOS
     ======================================================================= */
  function mudarTamanho() {
    const l = Number(seletorLinhas.value);
    const c = Number(seletorColunas.value);
    editorA.redimensionar(l, c);
    editorB.redimensionar(l, c);
    atualizar();
  }
  seletorLinhas.addEventListener('change', mudarTamanho);
  seletorColunas.addEventListener('change', mudarTamanho);
  campoK.addEventListener('input', atualizar);
  radiosOperacao.forEach((r) => r.addEventListener('change', atualizar));

  // Clique num elemento do resultado
  resultados.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.matriz-celula');
    if (!botao) return;
    selecionada = [Number(botao.dataset.i), Number(botao.dataset.j)];
    atualizar();
    // devolve o foco ao botão recriado (navegação por teclado)
    const novo = resultados.querySelector('.matriz-celula.selecionada');
    if (novo) novo.focus();
  });

  btnSortear.addEventListener('click', () => {
    const l = editorA.linhas;
    const c = editorA.colunas;
    const sortear = () => criarMatriz(l, c, () => Math.floor(Math.random() * 13) - 6);
    editorA.definir(sortear());
    editorB.definir(sortear());
    atualizar();
  });

  atualizar();
})();
