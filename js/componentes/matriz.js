/* =========================================================================
   js/componentes/matriz.js — Matrizes na tela (editar e exibir)
   Usado pelos laboratórios das lições de matrizes.

   Uso:
     // Editor (campos para o aluno digitar)
     const editorA = criarEditorMatriz(document.getElementById('l5-a'), {
       nome: 'A', linhas: 2, colunas: 2, valores: [[1, 2], [3, 4]],
       aoMudar: atualizar,               // chamada a cada digitação
     });
     editorA.ler();                      // [[1, 2], [3, 4]] ou null se inválida
     editorA.redimensionar(3, 3);        // mantém o que já foi digitado
     editorA.definir([[0, 1], [1, 0]]);  // troca todos os valores
     editorA.destacar([[0, 1]]);         // realça o elemento a₁₂

     // Exibição (só leitura), como HTML
     htmlMatriz([[1, 2], [3, 4]], { clicavel: true, selecionada: [0, 1] });

     nomeElemento('a', 0, 1)             // "a₁₂"

   Índice
   1. Nomes dos elementos (índices subscritos)
   2. Exibição de uma matriz
   3. Editor de matriz
   ========================================================================= */

'use strict';


/* =========================================================================
   1. NOMES DOS ELEMENTOS
   ========================================================================= */
const SUBSCRITOS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Número em subscrito: 12 → "₁₂". */
function subscrito(numero) {
  return String(numero).split('').map((d) => SUBSCRITOS[Number(d)] || d).join('');
}

/** Nome do elemento na linha i e coluna j (índices a partir de 0): a₁₂. */
function nomeElemento(letra, i, j) {
  return letra + subscrito(i + 1) + subscrito(j + 1);
}


/* =========================================================================
   2. EXIBIÇÃO DE UMA MATRIZ
   Marcação gerada (a mesma usada à mão no index.html):
     <span class="matriz"><span class="matriz-grade" style="--colunas: 2">
       <span class="matriz-el">1</span><span class="matriz-el">2</span>
       <span class="matriz-el">3</span><span class="matriz-el">4</span>
     </span></span>
   opcoes:
     formatar     função para mostrar os números (padrão: formatarFracao)
     clicavel     true → cada elemento vira um botão (data-i, data-j)
     selecionada  [i, j] do botão marcado como selecionado
     destacar     lista de [i, j] para realçar (ex.: [[0,0], [0,1]])
     classe       classe extra no contêiner (ex.: 'matriz-r')
   ========================================================================= */
function htmlMatriz(M, opcoes) {
  opcoes = opcoes || {};
  const formatar = opcoes.formatar || formatarFracao;
  const destacar = opcoes.destacar || [];
  const estaDestacado = (i, j) => destacar.some((c) => c[0] === i && c[1] === j);

  // Feita só com <span> (grade CSS), para poder ficar dentro de parágrafos.
  let html = '<span class="matriz ' + (opcoes.classe || '') + '">' +
    '<span class="matriz-grade" style="--colunas: ' + M[0].length + '">';
  M.forEach((linha, i) => {
    linha.forEach((valor, j) => {
      const classes = 'matriz-el' + (estaDestacado(i, j) ? ' destaque' : '');
      const texto = formatar(valor);
      if (opcoes.clicavel) {
        const sel = opcoes.selecionada && opcoes.selecionada[0] === i && opcoes.selecionada[1] === j;
        html += '<span class="' + classes + '"><button type="button" class="matriz-celula' + (sel ? ' selecionada' : '') +
          '" data-i="' + i + '" data-j="' + j + '" aria-label="Elemento da linha ' + (i + 1) +
          ', coluna ' + (j + 1) + ': ' + texto + '">' + texto + '</button></span>';
      } else {
        html += '<span class="' + classes + '">' + texto + '</span>';
      }
    });
  });
  return html + '</span></span>';
}


/* =========================================================================
   3. EDITOR DE MATRIZ
   Campos de texto (aceitam "−2", "1,5" e "1/2"), um por elemento.
   ========================================================================= */
function criarEditorMatriz(container, opcoes) {
  const nome = opcoes.nome || 'A';
  const letra = nome.toLowerCase();
  let linhas = opcoes.linhas || 2;
  let colunas = opcoes.colunas || 2;
  // guardamos o TEXTO digitado, para não perder nada ao redimensionar
  let textos = (opcoes.valores || []).map((linha) => linha.map(String));

  function desenhar() {
    let html = '<span class="matriz matriz-editor ' + (opcoes.classe || '') + '"><table>';
    for (let i = 0; i < linhas; i++) {
      html += '<tr>';
      for (let j = 0; j < colunas; j++) {
        const valor = textos[i] && textos[i][j] !== undefined ? textos[i][j] : '0';
        html += '<td><input type="text" inputmode="decimal" data-i="' + i + '" data-j="' + j +
          '" value="' + valor.replace(/"/g, '') + '" aria-label="' + nomeElemento(letra, i, j) +
          ' da matriz ' + nome + '"></td>';
      }
      html += '</tr>';
    }
    container.innerHTML = html + '</table></span>';
  }

  /** Copia o que está nos campos para `textos`. */
  function guardar() {
    container.querySelectorAll('input').forEach((campo) => {
      const i = Number(campo.dataset.i);
      const j = Number(campo.dataset.j);
      if (!textos[i]) textos[i] = [];
      textos[i][j] = campo.value;
    });
  }

  /** Lê a matriz como números; devolve null (e marca em vermelho) se houver erro. */
  function ler() {
    guardar();
    let valida = true;
    const M = criarMatriz(linhas, colunas, () => 0);
    container.querySelectorAll('input').forEach((campo) => {
      const valor = lerNumero(campo.value);
      const invalido = Number.isNaN(valor);
      campo.classList.toggle('erro', invalido);
      if (invalido) valida = false;
      else M[Number(campo.dataset.i)][Number(campo.dataset.j)] = valor;
    });
    return valida ? M : null;
  }

  function redimensionar(novasLinhas, novasColunas) {
    guardar();
    linhas = novasLinhas;
    colunas = novasColunas;
    desenhar();
  }

  function definir(valores) {
    textos = valores.map((linha) => linha.map((v) => formatarFracao(v).replace('−', '-')));
    linhas = valores.length;
    colunas = valores[0].length;
    desenhar();
  }

  /** Realça os elementos indicados (lista de [i, j]); lista vazia apaga o realce. */
  function destacar(celulas) {
    container.querySelectorAll('input').forEach((campo) => {
      const i = Number(campo.dataset.i);
      const j = Number(campo.dataset.j);
      campo.classList.toggle('destaque', celulas.some((c) => c[0] === i && c[1] === j));
    });
  }

  container.addEventListener('input', () => {
    guardar();
    if (opcoes.aoMudar) opcoes.aoMudar();
  });

  desenhar();

  return {
    ler,
    redimensionar,
    definir,
    destacar,
    get linhas() { return linhas; },
    get colunas() { return colunas; },
  };
}
