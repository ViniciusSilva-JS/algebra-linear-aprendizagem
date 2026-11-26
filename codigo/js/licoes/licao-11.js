/* =========================================================================
   js/licoes/licao-11.js — Laboratório da Lição 11: Autovalores e autovetores
   O aluno gira o vetor v e vê A·v; quando os dois ficam na mesma reta,
   v é um autovetor. Mostra o círculo de raio 2 e a sua imagem por A, as
   retas dos autovetores e as contas: polinômio característico, Bhaskara,
   autovetores de cada λ e conferência pelo traço e pelo determinante.

   Índice
   1. Elementos e estado
   2. Modelos prontos
   3. Vetor v e teste de autovetor
   4. Desenho
   5. Resultados (contas)
   6. Atualização geral
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS E ESTADO
     ======================================================================= */
  const svg = document.getElementById('l11-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 6 });
  const seletorModelo = document.getElementById('l11-modelo');
  const entradaAngulo = document.getElementById('l11-angulo');
  const valorAngulo = document.getElementById('l11-angulo-valor');
  const status = document.getElementById('l11-status');
  const caixaRetas = document.getElementById('l11-retas');
  const caixaCirculo = document.getElementById('l11-circulo');
  const resultados = document.getElementById('l11-resultados');

  const editor = criarEditorMatriz(document.getElementById('l11-a'), {
    nome: 'A', linhas: 2, colunas: 2, valores: [[2, 1], [1, 2]], aoMudar: aoEditar,
  });

  const RAIO = 2;               // tamanho do vetor v (e raio do círculo)
  const TOLERANCIA = 0.012;     // seno do ângulo entre v e A·v (≈ 0,7°)
  const INDICES = ['₁', '₂'];

  let matrizAtual = [[2, 1], [1, 2]];

  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));


  /* =======================================================================
     2. MODELOS PRONTOS
     ======================================================================= */
  const MODELOS = {
    exemplo: [[2, 1], [1, 2]],
    triangular: [[3, 1], [0, 2]],
    inverte: [[1, 2], [2, 1]],
    reflexao: [[1, 0], [0, -1]],
    projecao: [[1, 0], [0, 0]],
    escala: [[2, 0], [0, 2]],
    cisalhamento: [[1, 1], [0, 1]],
    rotacao: [[0, -1], [1, 0]],
  };

  function aplicarModelo() {
    const modelo = MODELOS[seletorModelo.value];
    if (!modelo) return;
    matrizAtual = modelo.map((linha) => linha.slice());
    editor.definir(matrizAtual);
  }

  /** Polinômio λ² − (traço)λ + det escrito do jeito "bonito". */
  function formatarPolinomio(traco, det) {
    let texto = 'λ²';
    if (!quaseIgual(traco, 0)) {
      texto += (traco > 0 ? ' − ' : ' + ') + coeficiente(Math.abs(traco)) + 'λ';
    }
    if (!quaseIgual(det, 0)) {
      texto += (det > 0 ? ' + ' : ' − ') + fr(Math.abs(det));
    }
    return texto;
  }


  /* =======================================================================
     3. VETOR v E TESTE DE AUTOVETOR
     ======================================================================= */
  function vetorV() {
    const t = Number(entradaAngulo.value) * Math.PI / 180;
    const limpo = (x) => (Math.abs(x) < 1e-12 ? 0 : x);
    return { x: limpo(RAIO * Math.cos(t)), y: limpo(RAIO * Math.sin(t)) };
  }

  /**
   * v está na mesma reta que A·v? Devolve o λ (ou null).
   * Se o λ medido estiver perto de um autovalor exato, devolve o exato.
   */
  function testarAutovetor(A, v, autovalores) {
    const av = aplicarMatriz(A, v);
    const tamanhoAv = Math.hypot(av.x, av.y);
    let lambda;
    if (tamanhoAv < 1e-9) {
      lambda = 0; // A·v = 0 = 0·v
    } else {
      const seno = Math.abs(v.x * av.y - v.y * av.x) / (RAIO * tamanhoAv);
      if (seno > TOLERANCIA) return null;
      lambda = produtoEscalar(v, av) / (RAIO * RAIO);
    }
    const exato = autovalores.find((l) => Math.abs(l - lambda) < 0.05);
    return exato !== undefined ? exato : lambda;
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function pontosDoCirculo(M) {
    const pontos = [];
    for (let k = 0; k <= 96; k++) {
      const t = (k / 96) * 2 * Math.PI;
      const q = aplicarMatriz(M, { x: RAIO * Math.cos(t), y: RAIO * Math.sin(t) });
      pontos.push([q.x, q.y]);
    }
    return pontos;
  }

  function desenharRetasAutovetores(A, info) {
    const distancia = plano.limite - 0.9;
    info.valores.forEach((lambda) => {
      const v = autovetor2x2(A, lambda);
      if (!v) return; // A = λI: todas as retas servem, não desenhamos nenhuma
      plano.reta(v.y, -v.x, 0, 'reta reta-autovetor');
      const tamanho = Math.hypot(v.x, v.y);
      const sx = (v.x / tamanho) * distancia;
      const sy = (v.y / tamanho) * distancia;
      plano.texto('λ = ' + fr(lambda), sx, sy + 0.35, 'rotulo-autovalor', 'middle');
    });
  }

  function desenhar(A, info, v, lambdaEncontrado) {
    plano.limpar();
    if (caixaCirculo.checked) {
      plano.poligonal(pontosDoCirculo([[1, 0], [0, 1]]), 'circulo-original');
      plano.poligonal(pontosDoCirculo(A), 'circulo-imagem');
    }
    if (caixaRetas.checked) desenharRetasAutovetores(A, info);

    const av = aplicarMatriz(A, v);
    if (lambdaEncontrado !== null) {
      plano.reta(v.y, -v.x, 0, 'reta reta-autovetor encontrada');
    }
    plano.seta(0, 0, av.x, av.y, 'vetor-v');
    plano.seta(0, 0, v.x, v.y, 'vetor-u');
    plano.rotuloSeta('v', 0, 0, v.x, v.y, 'rotulo-vetor vetor-u');
    plano.rotuloSeta('A·v', 0, 0, av.x, av.y, 'rotulo-vetor rotulo-base vetor-v');
  }


  /* =======================================================================
     5. RESULTADOS (contas)
     ======================================================================= */
  function blocoVetorAtual(A, v, lambda) {
    const av = aplicarMatriz(A, v);
    const mensagem = lambda === null
      ? '<span class="etiqueta etiqueta-ambar">A·v saiu da reta de v · ainda não é autovetor</span>'
      : '<span class="etiqueta etiqueta-verde">Autovetor! A·v = ' + fr(lambda) + '·v</span>';
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">Seu vetor agora</span>
        <div class="formula">v = ${formatarPonto(v.x, v.y)} &nbsp;→&nbsp; A·v = ${formatarPonto(av.x, av.y)}</div>
        <p>${mensagem}</p>
      </div>`;
  }

  function blocoPolinomio(A, info) {
    const [[a, b], [c, d]] = A;
    const matrizLambda = [[fr(a) + ' − λ', fr(b)], [fr(c), fr(d) + ' − λ']];
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Polinômio característico: det(A − λI) = 0</span>
        <div class="formula">det ${htmlMatriz(matrizLambda, { formatar: (t) => t })}
          = (${fr(a)} − λ)(${fr(d)} − λ) − ${p(b)}·${p(c)}
          = ${formatarPolinomio(info.traco, info.det)} = 0</div>
        <p class="lab-dica">Traço = ${fr(a)} + ${p(d)} = ${fr(info.traco)} &nbsp;·&nbsp; det = ${fr(a)}·${p(d)} − ${p(b)}·${p(c)} = ${fr(info.det)}</p>
      </div>`;
  }

  function blocoBhaskara(info) {
    const { traco, det, delta, valores } = info;
    let conclusao;
    if (delta > 0) {
      conclusao = `
        <div class="formula">√Δ = ${formatarRaiz(delta)} &nbsp;⇒&nbsp; λ = (${fr(traco)} ± √Δ) / 2</div>
        <p>λ₁ = <strong>${fr(valores[0])}</strong> &nbsp;e&nbsp; λ₂ = <strong>${fr(valores[1])}</strong>
        <span class="etiqueta etiqueta-verde">Δ &gt; 0 · dois autovalores reais</span></p>`;
    } else if (delta === 0) {
      conclusao = `
        <div class="formula">λ = ${fr(traco)} / 2 = ${fr(valores[0])}</div>
        <p><span class="etiqueta etiqueta-azul">Δ = 0 · um autovalor duplo</span></p>`;
    } else {
      const real = fr(traco / 2);
      const imaginaria = formatarNumero(Math.sqrt(-delta) / 2);
      conclusao = `
        <p><span class="etiqueta etiqueta-ambar">Δ &lt; 0 · nenhum autovalor real</span></p>
        <p>Nenhum vetor continua na mesma reta: a matriz gira todos eles. (As raízes são os números
        complexos ${real} ± ${imaginaria}i, que ficam fora desta trilha.)</p>`;
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">2. Resolvendo por Bhaskara</span>
        <div class="formula">Δ = ${p(traco)}² − 4·${p(det)} = ${fr(delta)}</div>
        ${conclusao}
      </div>`;
  }

  function blocoAutovetores(A, info) {
    if (info.valores.length === 0) return '';

    const itens = info.valores.map((lambda, k) => {
      const nome = 'λ' + (info.valores.length > 1 ? INDICES[k] : '');
      const M = [[A[0][0] - lambda, A[0][1]], [A[1][0], A[1][1] - lambda]];
      const v = autovetor2x2(A, lambda);
      if (!v) {
        return `<li class="passo-gauss"><span class="passo-gauss-descricao">${nome} = ${fr(lambda)}</span>
          <span>A − ${p(lambda)}I = ${htmlMatriz(M)}: é a matriz nula, então <strong>todo vetor v ≠ 0 é autovetor</strong>
          (A só multiplica tudo por ${fr(lambda)}).</span></li>`;
      }
      // equação da primeira linha não nula de A − λI
      let linha = (Math.abs(M[0][0]) > 1e-9 || Math.abs(M[0][1]) > 1e-9) ? M[0] : M[1];
      // Números minúsculos (ex.: 0,001) apareceriam como "0x + 0y = 0":
      // dividimos a equação pelo maior coeficiente (a reta continua a mesma).
      const maior = Math.max(Math.abs(linha[0]), Math.abs(linha[1]));
      if (maior < 0.01) linha = [linha[0] / maior, linha[1] / maior];
      const av = aplicarMatriz(A, v);
      return `<li class="passo-gauss"><span class="passo-gauss-descricao">${nome} = ${fr(lambda)}</span>
        <span>A − ${p(lambda)}I = ${htmlMatriz(M)} → ${formatarEquacaoGeral(linha[0], linha[1], 0)}
        → <strong class="texto-autovetor">v = ${formatarPonto(v.x, v.y)}</strong>
        &nbsp;·&nbsp; conferindo: A·v = ${formatarPonto(av.x, av.y)} = ${fr(lambda)}·v ✓</span></li>`;
    }).join('');

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Autovetores: resolver (A − λI)·v = 0</span>
        <ol class="lista-passos-gauss">${itens}</ol>
      </div>`;
  }

  function blocoConferencia(info) {
    const { traco, det, valores } = info;
    if (valores.length === 0) return '';
    const [l1, l2] = valores.length === 2 ? valores : [valores[0], valores[0]];
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">4. Conferindo pelos atalhos</span>
        <div class="formula">λ₁ + λ₂ = ${fr(l1)} + ${p(l2)} = ${fr(l1 + l2)} = traço ${quaseIgual(l1 + l2, traco, 1e-6) ? '✓' : '✗'}
          &nbsp;&nbsp; λ₁ · λ₂ = ${fr(l1)}·${p(l2)} = ${fr(l1 * l2)} = det ${quaseIgual(l1 * l2, det, 1e-6) ? '✓' : '✗'}</div>
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    valorAngulo.textContent = entradaAngulo.value + '°';
    if (!matrizAtual) {
      plano.limpar();
      status.textContent = '';
      resultados.innerHTML = '<p class="erro">Preencha todos os elementos com números (ex.: −2, 1,5 ou 1/2).</p>';
      return;
    }

    const A = matrizAtual;
    const info = autovalores2x2(A);
    const v = vetorV();
    const lambda = testarAutovetor(A, v, info.valores);

    desenhar(A, info, v, lambda);
    status.innerHTML = lambda === null
      ? 'Gire v (ou clique no plano) até A·v ficar na mesma reta que v.'
      : '<strong class="texto-autovetor">Achou! v é autovetor com λ = ' + fr(lambda) + '.</strong>';

    resultados.innerHTML =
      blocoVetorAtual(A, v, lambda) +
      blocoPolinomio(A, info) +
      blocoBhaskara(info) +
      blocoAutovetores(A, info) +
      blocoConferencia(info);
  }

  /** O aluno digitou na matriz: vira "personalizada". */
  function aoEditar() {
    matrizAtual = editor.ler();
    seletorModelo.value = 'personalizada';
    atualizar();
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  seletorModelo.addEventListener('change', () => { aplicarModelo(); atualizar(); });
  entradaAngulo.addEventListener('input', atualizar);
  caixaRetas.addEventListener('change', atualizar);
  caixaCirculo.addEventListener('change', atualizar);

  // Clique no plano: aponta v para o ponto clicado.
  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    if (x === 0 && y === 0) return;
    const graus = Math.round(radianosParaGraus(Math.atan2(y, x)));
    entradaAngulo.value = (graus + 360) % 360;
    atualizar();
  });

  atualizar();
})();
