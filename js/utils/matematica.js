/* =========================================================================
   js/utils/matematica.js — Funções de matemática e formatação
   Reaproveitadas pelos laboratórios e exercícios de todas as lições.

   Índice
   1. Leitura e formatação de números
   2. Geometria analítica no plano
   3. Vetores no plano
   4. Produto escalar e ângulo
   5. Frações e equações de reta
   6. Matrizes
   ========================================================================= */

'use strict';


/* =========================================================================
   1. LEITURA E FORMATAÇÃO DE NÚMEROS
   ========================================================================= */

/**
 * Converte o que o aluno digitou em número.
 * Aceita: "5", "-3", "2,5", "2.5", "−4" (sinal de menos tipográfico) e
 * frações como "1/2" ou "-3/4".
 * Devolve NaN se o texto não for um número válido.
 */
function lerNumero(texto) {
  let t = String(texto === undefined || texto === null ? '' : texto)
    .trim()
    .replace(/\s+/g, '')       // tira espaços
    .replace(/[−–]/g, '-')     // sinais de menos "bonitos" → "-"
    .replace(',', '.');        // vírgula decimal → ponto

  if (t === '') return NaN;

  // Fração: a/b
  const fracao = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(t);
  if (fracao) {
    const denominador = Number(fracao[2]);
    return denominador === 0 ? NaN : Number(fracao[1]) / denominador;
  }

  // Número comum (inteiro ou decimal)
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  return Number(t);
}

/**
 * Formata um número no padrão brasileiro, com até `casas` decimais.
 * Ex.: 2.5 → "2,5"   |   -3 → "−3"   |   3.14159 → "3,14"
 */
function formatarNumero(x, casas) {
  if (casas === undefined) casas = 2;
  if (!Number.isFinite(x)) return '—';

  const fator = Math.pow(10, casas);
  let arredondado = Math.round(x * fator) / fator;
  if (Object.is(arredondado, -0)) arredondado = 0; // evita mostrar "−0"

  return arredondado
    .toLocaleString('pt-BR', { maximumFractionDigits: casas })
    .replace('-', '−');
}

/** Número entre parênteses quando negativo: -2 → "(−2)". Útil nas contas. */
function formatarComParenteses(x) {
  const texto = formatarNumero(x);
  return x < 0 ? '(' + texto + ')' : texto;
}

/**
 * Formata um par ordenado. Se houver decimais, usa ";" como separador
 * (no Brasil a vírgula já é usada nos decimais): (2,5; 4).
 */
function formatarPonto(x, y) {
  const temDecimal = !Number.isInteger(x) || !Number.isInteger(y);
  const separador = temDecimal ? '; ' : ', ';
  return '(' + formatarNumero(x) + separador + formatarNumero(y) + ')';
}

/**
 * Mostra a raiz quadrada de um número já com o resultado:
 * 25 → "√25 = 5"   |   10 → "√10 ≈ 3,16"   |   0 → "0"
 */
function formatarRaiz(valorDentro) {
  if (valorDentro === 0) return '0';
  const raiz = Math.sqrt(valorDentro);
  const exata = quaseIgual(raiz, Math.round(raiz));
  return '√' + formatarNumero(valorDentro) + (exata ? ' = ' : ' ≈ ') + formatarNumero(raiz);
}

/** Compara dois números com uma tolerância (para respostas decimais). */
function quaseIgual(a, b, tolerancia) {
  if (tolerancia === undefined) tolerancia = 1e-9;
  return Math.abs(a - b) <= tolerancia;
}


/* =========================================================================
   2. GEOMETRIA ANALÍTICA NO PLANO
   ========================================================================= */

/**
 * Onde o ponto (x, y) está.
 * Devolve { codigo, nome }, em que codigo é '1', '2', '3', '4',
 * 'eixo-x', 'eixo-y' ou 'origem'.
 */
function quadrante(x, y) {
  if (x === 0 && y === 0) return { codigo: 'origem', nome: 'na origem' };
  if (y === 0) return { codigo: 'eixo-x', nome: 'sobre o eixo x' };
  if (x === 0) return { codigo: 'eixo-y', nome: 'sobre o eixo y' };
  if (x > 0 && y > 0) return { codigo: '1', nome: 'no 1º quadrante' };
  if (x < 0 && y > 0) return { codigo: '2', nome: 'no 2º quadrante' };
  if (x < 0 && y < 0) return { codigo: '3', nome: 'no 3º quadrante' };
  return { codigo: '4', nome: 'no 4º quadrante' };
}

/** Distância entre (x1, y1) e (x2, y2): √[(x2 − x1)² + (y2 − y1)²]. */
function distancia(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Ponto médio entre (x1, y1) e (x2, y2). */
function pontoMedio(x1, y1, x2, y2) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}


/* =========================================================================
   3. VETORES NO PLANO
   Um vetor é representado como { x, y } (suas componentes).
   ========================================================================= */

/** Módulo (tamanho) do vetor: √(x² + y²). */
function modulo(v) {
  return Math.hypot(v.x, v.y);
}

function somarVetores(u, v) {
  return { x: u.x + v.x, y: u.y + v.y };
}

function subtrairVetores(u, v) {
  return { x: u.x - v.x, y: u.y - v.y };
}

function multiplicarPorEscalar(k, v) {
  return { x: k * v.x, y: k * v.y };
}

/** Vetor que vai do ponto A até o ponto B: B − A. */
function vetorEntrePontos(A, B) {
  return { x: B.x - A.x, y: B.y - A.y };
}


/* =========================================================================
   4. PRODUTO ESCALAR E ÂNGULO
   ========================================================================= */

/** Produto escalar: u · v = x₁·x₂ + y₁·y₂ (o resultado é um NÚMERO). */
function produtoEscalar(u, v) {
  return u.x * v.x + u.y * v.y;
}

/**
 * Ângulo entre u e v, em radianos (de 0 a π).
 * Devolve null se algum dos vetores for nulo (ângulo indefinido).
 */
function anguloEntre(u, v) {
  const produtoModulos = modulo(u) * modulo(v);
  if (produtoModulos === 0) return null;
  // limita entre −1 e 1 para evitar erros de arredondamento no acos
  const cosseno = Math.max(-1, Math.min(1, produtoEscalar(u, v) / produtoModulos));
  return Math.acos(cosseno);
}

function radianosParaGraus(radianos) {
  return radianos * 180 / Math.PI;
}

/** Projeção ortogonal de u sobre v: (u·v / |v|²) · v. Null se v for nulo. */
function projecao(u, v) {
  const quadradoModuloV = produtoEscalar(v, v);
  if (quadradoModuloV === 0) return null;
  return multiplicarPorEscalar(produtoEscalar(u, v) / quadradoModuloV, v);
}


/* =========================================================================
   5. FRAÇÕES E EQUAÇÕES DE RETA
   ========================================================================= */

/** Máximo divisor comum de dois inteiros (sempre positivo). */
function mdc(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { const resto = a % b; a = b; b = resto; }
  return a;
}

/**
 * Mostra um número como fração quando ele é uma fração "simples"
 * (denominador até 100). Ex.: 0.5 → "1/2" | -1.6666… → "−5/3" | 3 → "3".
 * Se não for uma fração simples, mostra o decimal.
 */
function formatarFracao(x) {
  if (!Number.isFinite(x)) return '—';
  if (quaseIgual(x, Math.round(x), 1e-9)) return formatarNumero(Math.round(x));
  for (let d = 2; d <= 100; d++) {
    const n = x * d;
    if (quaseIgual(n, Math.round(n), 1e-9)) {
      return (x < 0 ? '−' : '') + Math.abs(Math.round(n)) + '/' + d;
    }
  }
  return formatarNumero(x);
}

/**
 * Coeficiente pronto para ficar na frente de uma variável:
 * 1 → "" | −1 → "−" | 2 → "2" | 0.5 → "(1/2)".
 */
function coeficiente(c) {
  if (quaseIgual(c, 1)) return '';
  if (quaseIgual(c, -1)) return '−';
  const texto = formatarFracao(c);
  return texto.includes('/') ? '(' + texto + ')' : texto;
}

/** Equação reduzida da reta: y = mx + b, escrita do jeito "bonito". */
function formatarEquacaoReduzida(m, b) {
  let texto = 'y = ';
  const temX = !quaseIgual(m, 0);
  if (temX) texto += coeficiente(m) + 'x';
  if (!temX) return texto + formatarFracao(b);
  if (quaseIgual(b, 0)) return texto;
  return texto + (b > 0 ? ' + ' : ' − ') + formatarFracao(Math.abs(b));
}

/**
 * Reta que passa por A e B, na forma geral a·x + b·y + c = 0 com
 * coeficientes inteiros simplificados (para pontos de coordenadas inteiras).
 * Devolve também m (coef. angular) e n (coef. linear); m = null se vertical.
 */
function retaPorDoisPontos(A, B) {
  let a = A.y - B.y;
  let b = B.x - A.x;
  let c = A.x * B.y - B.x * A.y;
  const inteiros = [a, b, c].every((v) => Number.isInteger(v));
  if (inteiros) {
    const divisor = mdc(mdc(a, b), c) || 1;
    a /= divisor; b /= divisor; c /= divisor;
  }
  // deixa o primeiro coeficiente não nulo positivo
  if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; c = -c; }
  const vertical = quaseIgual(b, 0);
  return {
    a: a, b: b, c: c,
    m: vertical ? null : -a / b,
    n: vertical ? null : -c / b,
  };
}

/** Equação geral "ax + by + c = 0", escrita do jeito "bonito". */
function formatarEquacaoGeral(a, b, c) {
  const termos = [];
  if (!quaseIgual(a, 0)) termos.push({ valor: a, texto: 'x' });
  if (!quaseIgual(b, 0)) termos.push({ valor: b, texto: 'y' });
  if (!quaseIgual(c, 0)) termos.push({ valor: c, texto: '' });
  let saida = '';
  termos.forEach((t, i) => {
    const abs = Math.abs(t.valor);
    const numero = t.texto && quaseIgual(abs, 1) ? '' : formatarFracao(abs);
    if (i === 0) saida += (t.valor < 0 ? '−' : '') + numero + t.texto;
    else saida += (t.valor < 0 ? ' − ' : ' + ') + numero + t.texto;
  });
  return (saida || '0') + ' = 0';
}


/* =========================================================================
   6. MATRIZES
   Uma matriz é um array de linhas: [[1, 2, 3], [4, 5, 6]] é 2×3.
   ========================================================================= */

/** Cria uma matriz linhas×colunas com valor(i, j) (índices começando em 0). */
function criarMatriz(linhas, colunas, valor) {
  const M = [];
  for (let i = 0; i < linhas; i++) {
    M.push([]);
    for (let j = 0; j < colunas; j++) M[i].push(valor(i, j));
  }
  return M;
}

/** Ordem da matriz como texto: "2×3". */
function ordemMatriz(M) {
  return M.length + '×' + M[0].length;
}

function somarMatrizes(A, B) {
  return criarMatriz(A.length, A[0].length, (i, j) => A[i][j] + B[i][j]);
}

function subtrairMatrizes(A, B) {
  return criarMatriz(A.length, A[0].length, (i, j) => A[i][j] - B[i][j]);
}

function multiplicarMatrizPorEscalar(k, A) {
  return criarMatriz(A.length, A[0].length, (i, j) => k * A[i][j]);
}

/** Transposta: as linhas viram colunas. */
function transposta(A) {
  return criarMatriz(A[0].length, A.length, (i, j) => A[j][i]);
}

/** Matriz identidade n×n (1 na diagonal principal, 0 no resto). */
function identidade(n) {
  return criarMatriz(n, n, (i, j) => (i === j ? 1 : 0));
}

/**
 * Produto A·B (exige colunas de A = linhas de B).
 * c[i][j] = linha i de A "produto escalar" coluna j de B.
 * Devolve null se as ordens não permitirem a multiplicação.
 */
function multiplicarMatrizes(A, B) {
  if (A[0].length !== B.length) return null;
  return criarMatriz(A.length, B[0].length, (i, j) => {
    let soma = 0;
    for (let k = 0; k < B.length; k++) soma += A[i][k] * B[k][j];
    return soma;
  });
}
