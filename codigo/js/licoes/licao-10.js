/* =========================================================================
   js/licoes/licao-10.js — Laboratório da Lição 10: Transformações lineares
   Aplica a matriz A à letra F, ao quadrado unitário e à grade do plano.
   As colunas de A aparecem como as setas T(i) e T(j). Há modelos prontos
   (rotação com ângulo, reflexões, cisalhamento…), animação de I até A e
   clique no plano para mover T(i) e T(j).

   Índice
   1. Elementos e estado
   2. Modelos prontos
   3. Desenho
   4. Resultados (contas)
   5. Atualização geral
   6. Animação
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS E ESTADO
     ======================================================================= */
  const svg = document.getElementById('l10-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 6 });
  const seletorModelo = document.getElementById('l10-modelo');
  const campoAngulo = document.getElementById('l10-angulo-campo');
  const entradaAngulo = document.getElementById('l10-angulo');
  const valorAngulo = document.getElementById('l10-angulo-valor');
  const dica = document.getElementById('l10-dica');
  const caixaGrade = document.getElementById('l10-grade');
  const btnAnimar = document.getElementById('l10-animar');
  const resultados = document.getElementById('l10-resultados');

  const editor = criarEditorMatriz(document.getElementById('l10-a'), {
    nome: 'A', linhas: 2, colunas: 2, valores: [[1, 0], [0, 1]], aoMudar: aoEditar,
  });

  // Letra F: não tem simetria, então reflexões e rotações ficam visíveis.
  const FIGURA_F = [
    [0, 0], [0.6, 0], [0.6, 1.2], [1.5, 1.2], [1.5, 1.8], [0.6, 1.8],
    [0.6, 2.4], [2, 2.4], [2, 3], [0, 3],
  ];
  const AREA_F = 0.6 * 3 + 1.4 * 0.6 + 0.9 * 0.6; // haste + barra de cima + barra do meio
  const PONTO_EXEMPLO = { x: 2, y: 3 };           // canto superior direito do F

  // Matriz em uso, guardada com todas as casas decimais (o editor mostra só 2).
  let matrizAtual = null;
  let proximoClique = 'i';
  let animacao = null;

  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));


  /* =======================================================================
     2. MODELOS PRONTOS
     ======================================================================= */
  const MODELOS = {
    identidade: () => [[1, 0], [0, 1]],
    escala: () => [[2, 0], [0, 2]],
    esticar: () => [[2, 0], [0, 1]],
    'reflexao-x': () => [[1, 0], [0, -1]],
    'reflexao-y': () => [[-1, 0], [0, 1]],
    'reflexao-yx': () => [[0, 1], [1, 0]],
    rotacao: () => matrizRotacao(Number(entradaAngulo.value)),
    cisalhamento: () => [[1, 1], [0, 1]],
    projecao: () => [[1, 0], [0, 0]],
  };

  /** Aplica o modelo escolhido no seletor (se não for "personalizada"). */
  function aplicarModelo() {
    const modelo = seletorModelo.value;
    campoAngulo.hidden = modelo !== 'rotacao';
    valorAngulo.textContent = formatarNumero(Number(entradaAngulo.value)) + '°';
    if (!MODELOS[modelo]) return;
    matrizAtual = MODELOS[modelo]();
    editor.definir(matrizAtual);
  }

  /** Descreve em palavras o que a matriz faz. */
  function descrever(A) {
    const [[a, b], [c, d]] = A;
    const ig = (x, y) => quaseIgual(x, y, 1e-9);
    const det = a * d - b * c;

    if (ig(a, 1) && ig(b, 0) && ig(c, 0) && ig(d, 1)) return 'Identidade: nada se move.';
    if (ig(det, 0)) return 'Achatamento: todo o plano cai sobre uma reta (ou um ponto). A área vira zero e não dá para desfazer.';

    // colunas de tamanho 1 e perpendiculares: rotação ou reflexão
    const ortogonal = ig(a * a + c * c, 1) && ig(b * b + d * d, 1) && ig(a * b + c * d, 0);
    if (ortogonal) {
      const graus = radianosParaGraus(Math.atan2(c, a));
      if (det > 0) return 'Rotação de ' + formatarNumero(graus, 1) + '° em torno da origem: forma e área ficam iguais.';
      return 'Reflexão na reta pela origem com inclinação de ' + formatarNumero(graus / 2, 1) + '°: a figura é espelhada, sem mudar de tamanho.';
    }

    if (ig(b, 0) && ig(c, 0)) {
      if (ig(a, d)) return 'Escala por ' + fr(a) + ': a figura muda de tamanho sem deformar' + (a < 0 ? ' (e gira 180°, porque k é negativo).' : '.');
      return 'Escala diferente em cada eixo: ×' + fr(a) + ' na horizontal e ×' + fr(d) + ' na vertical.';
    }
    if (ig(a, 1) && ig(d, 1) && (ig(b, 0) || ig(c, 0))) {
      return 'Cisalhamento ' + (ig(c, 0) ? 'horizontal' : 'vertical') + ': a figura inclina como um baralho empurrado de lado, e a área não muda.';
    }
    return 'Transformação geral: combina mudanças de tamanho, inclinação e giro.';
  }


  /* =======================================================================
     3. DESENHO
     ======================================================================= */
  function transformar(pontos, M) {
    return pontos.map(([x, y]) => {
      const q = aplicarMatriz(M, { x: x, y: y });
      return [q.x, q.y];
    });
  }

  /** Grade transformada: as imagens das retas x = k e y = k. */
  function desenharGrade(M) {
    const L = 40; // bem além da borda: o recorte do plano apaga o excesso
    for (let k = -plano.limite; k <= plano.limite; k++) {
      const v1 = aplicarMatriz(M, { x: k, y: -L });
      const v2 = aplicarMatriz(M, { x: k, y: L });
      const h1 = aplicarMatriz(M, { x: -L, y: k });
      const h2 = aplicarMatriz(M, { x: L, y: k });
      const classe = 'grade-transformada' + (k === 0 ? ' eixo' : '');
      plano.linha(v1.x, v1.y, v2.x, v2.y, classe);
      plano.linha(h1.x, h1.y, h2.x, h2.y, classe);
    }
  }

  function desenhar(M) {
    plano.limpar();
    if (caixaGrade.checked) desenharGrade(M);

    // quadrado unitário: tracejado (original) e sua imagem
    plano.poligono([[0, 0], [1, 0], [1, 1], [0, 1]], 'quadrado-unitario');
    plano.poligono(transformar([[0, 0], [1, 0], [1, 1], [0, 1]], M), 'regiao-det');

    // letra F: original tracejada e transformada
    plano.poligono(FIGURA_F, 'figura-original');
    plano.poligono(transformar(FIGURA_F, M), 'figura-transformada');

    // colunas da matriz = imagens de i e j
    const ti = { x: M[0][0], y: M[1][0] };
    const tj = { x: M[0][1], y: M[1][1] };
    plano.seta(0, 0, ti.x, ti.y, 'vetor-u');
    plano.seta(0, 0, tj.x, tj.y, 'vetor-v');
    plano.rotuloSeta('T(i)', 0, 0, ti.x, ti.y, 'rotulo-vetor rotulo-base vetor-u');
    plano.rotuloSeta('T(j)', 0, 0, tj.x, tj.y, 'rotulo-vetor rotulo-base vetor-v');
  }


  /* =======================================================================
     4. RESULTADOS (contas)
     ======================================================================= */
  function etiquetaDet(det) {
    if (quaseIgual(det, 0, 1e-9)) return '<span class="etiqueta etiqueta-ambar">det = 0 · o plano foi achatado: A não tem inversa</span>';
    if (det > 0) return '<span class="etiqueta etiqueta-verde">det &gt; 0 · mantém a orientação</span>';
    return '<span class="etiqueta etiqueta-azul">det &lt; 0 · espelha a figura (inverte a orientação)</span>';
  }

  function blocoInversa(A, det) {
    if (quaseIgual(det, 0, 1e-9)) {
      return `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">4. Dá para desfazer?</span>
          Não. Pontos diferentes foram parar no mesmo lugar, então não existe uma matriz que traga cada um de volta.
        </div>`;
    }
    const [[a, b], [c, d]] = A;
    const inversa = multiplicarMatrizPorEscalar(1 / det, [[d, -b], [-c, a]]);
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">4. Para desfazer: a inversa</span>
        <div class="formula">A⁻¹ = (1 / ${p(det)}) · ${htmlMatriz([[d, -b], [-c, a]])} = ${htmlMatriz(inversa)}</div>
      </div>`;
  }

  function montarResultados(A) {
    const [[a, b], [c, d]] = A;
    const det = a * d - b * c;
    const { x, y } = PONTO_EXEMPLO;
    const q = aplicarMatriz(A, PONTO_EXEMPLO);
    const fig = transformar(FIGURA_F, A);
    const visivel = fig.every(([fx, fy]) => plano.cabe(fx, fy));
    // fração simples aparece exata; outros decimais (ex.: cos 45°) aparecem com 2 casas
    const arredondada = A.some((linha) => linha.some((v) => fr(v).indexOf(',') >= 0));

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">O que esta matriz faz</span>
        ${descrever(A)}
        ${arredondada ? '<p class="lab-dica">Os números aparecem arredondados para 2 casas, mas as contas usam o valor exato (por isso 0,71·0,71 + 0,71·0,71 dá 1, e não 1,0082).</p>' : ''}
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">1. Para onde vão os vetores da base</span>
        <div class="formula">
          T(i) = A·${htmlMatriz([[1], [0]])} = 1ª coluna = ${htmlMatriz([[a], [c]], { classe: 'texto-u' })}
          &nbsp;&nbsp;
          T(j) = A·${htmlMatriz([[0], [1]])} = 2ª coluna = ${htmlMatriz([[b], [d]], { classe: 'texto-v' })}
        </div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">2. Um ponto passo a passo: o canto ${formatarPonto(x, y)} do F</span>
        <div class="formula">
          ${htmlMatriz(A)} · ${htmlMatriz([[x], [y]])}
          = <span class="matriz"><span class="matriz-grade" style="--colunas: 1"><span class="matriz-el">${fr(a)}·${x} + ${p(b)}·${y}</span><span class="matriz-el">${fr(c)}·${x} + ${p(d)}·${y}</span></span></span>
          = ${htmlMatriz([[q.x], [q.y]], { classe: 'matriz-resultado' })}
        </div>
        ${visivel ? '' : '<p class="lab-dica">Parte da figura transformada saiu da área visível do plano.</p>'}
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">3. Área e orientação</span>
        <div class="formula">det A = ${fr(a)}·${p(d)} − ${p(b)}·${p(c)} = ${fr(det)}</div>
        <p>
          Área do F: ${formatarNumero(AREA_F)} → depois da transformação:
          |${fr(det)}| · ${formatarNumero(AREA_F)} = <strong>${formatarNumero(Math.abs(det) * AREA_F)}</strong>
        </p>
        <p>${etiquetaDet(det)}</p>
      </div>
      ${blocoInversa(A, det)}`;
  }


  /* =======================================================================
     5. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    pararAnimacao();
    if (!matrizAtual) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">Preencha todos os elementos com números (ex.: −2, 1,5 ou 1/2).</p>';
      return;
    }
    desenhar(matrizAtual);
    resultados.innerHTML = montarResultados(matrizAtual);
    dica.innerHTML = 'Clique no plano para mover a ponta de <strong>T(' + proximoClique + ')</strong>.';
  }

  /** O aluno digitou na matriz: vira "personalizada". */
  function aoEditar() {
    matrizAtual = editor.ler();
    seletorModelo.value = 'personalizada';
    campoAngulo.hidden = true;
    atualizar();
  }


  /* =======================================================================
     6. ANIMAÇÃO
     Vai da identidade (t = 0) até A (t = 1). Na rotação, anima o ângulo,
     para a figura girar sem encolher no meio do caminho.
     ======================================================================= */
  function matrizNoInstante(t) {
    if (seletorModelo.value === 'rotacao') {
      return matrizRotacao(Number(entradaAngulo.value) * t);
    }
    return matrizAtual.map((linha, i) => linha.map((v, j) => (1 - t) * (i === j ? 1 : 0) + t * v));
  }

  function pararAnimacao() {
    if (animacao) cancelAnimationFrame(animacao);
    animacao = null;
  }

  function animar() {
    if (!matrizAtual) return;
    pararAnimacao();
    const reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzir) { desenhar(matrizAtual); return; }

    const duracao = 1500;
    const inicio = performance.now();
    function quadro(agora) {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = t * t * (3 - 2 * t); // começa e termina devagar
      desenhar(matrizNoInstante(suave));
      animacao = t < 1 ? requestAnimationFrame(quadro) : null;
    }
    animacao = requestAnimationFrame(quadro);
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  seletorModelo.addEventListener('change', () => { aplicarModelo(); atualizar(); });

  entradaAngulo.addEventListener('input', () => {
    seletorModelo.value = 'rotacao';
    aplicarModelo();
    atualizar();
  });

  caixaGrade.addEventListener('change', atualizar);
  btnAnimar.addEventListener('click', animar);

  // Clique no plano: move a ponta de T(i) (1ª coluna) ou de T(j) (2ª coluna).
  svg.addEventListener('click', (evento) => {
    if (!matrizAtual) return;
    const { x, y } = plano.pontoDoClique(evento);
    const A = matrizAtual.map((linha) => linha.slice());
    if (proximoClique === 'i') {
      A[0][0] = x; A[1][0] = y;
      proximoClique = 'j';
    } else {
      A[0][1] = x; A[1][1] = y;
      proximoClique = 'i';
    }
    matrizAtual = A;
    editor.definir(A);
    seletorModelo.value = 'personalizada';
    campoAngulo.hidden = true;
    atualizar();
  });

  aplicarModelo();
  atualizar();
})();
