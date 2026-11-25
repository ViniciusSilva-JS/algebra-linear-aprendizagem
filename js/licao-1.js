/* =========================================================================
   js/licao-1.js — Laboratório da Lição 1: Plano cartesiano e pontos
   Desenha um plano cartesiano em SVG com os pontos A e B, o segmento AB,
   os catetos Δx e Δy e o ponto médio M, e mostra as contas passo a passo.

   Índice
   1. Elementos e configurações
   2. Ajudantes de SVG
   3. Desenho do fundo (grade, eixos e números)
   4. Leitura dos pontos
   5. Desenho dos pontos e resultados
   6. Eventos (campos, clique no plano, sorteio)
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS E CONFIGURAÇÕES
     ======================================================================= */
  const svg = document.getElementById('l1-plano');
  if (!svg) return; // lição não está na página

  const campos = {
    ax: document.getElementById('l1-ax'),
    ay: document.getElementById('l1-ay'),
    bx: document.getElementById('l1-bx'),
    by: document.getElementById('l1-by'),
  };
  const resultados = document.getElementById('l1-resultados');
  const dicaClique = document.getElementById('l1-dica-clique');
  const btnSortear = document.getElementById('l1-sortear');

  const LIMITE = 10;           // o plano vai de −10 a 10 nos dois eixos
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let proximoClique = 'A';     // qual ponto o próximo clique no plano move

  /*
    Sistema de coordenadas do SVG:
    viewBox="-11 -11 22 22" → o centro do SVG é a origem.
    No SVG o eixo y aponta para BAIXO, por isso desenhamos sempre em (x, −y).
  */


  /* =======================================================================
     2. AJUDANTES DE SVG
     ======================================================================= */

  /** Cria um elemento SVG com atributos e o coloca dentro de `pai`. */
  function criarSvg(tag, atributos, pai) {
    const elemento = document.createElementNS(SVG_NS, tag);
    Object.keys(atributos).forEach((nome) => elemento.setAttribute(nome, atributos[nome]));
    if (pai) pai.appendChild(elemento);
    return elemento;
  }

  /** Cria um texto SVG. */
  function criarTexto(conteudo, atributos, pai) {
    const texto = criarSvg('text', atributos, pai);
    texto.textContent = conteudo;
    return texto;
  }


  /* =======================================================================
     3. DESENHO DO FUNDO (feito uma vez só)
     ======================================================================= */
  function desenharFundo() {
    const fundo = criarSvg('g', { class: 'plano-fundo' }, svg);

    for (let i = -LIMITE; i <= LIMITE; i++) {
      const classe = i === 0 ? 'plano-eixo' : 'plano-grade';
      // linha vertical (x = i) e horizontal (y = i)
      criarSvg('line', { x1: i, y1: -LIMITE, x2: i, y2: LIMITE, class: classe }, fundo);
      criarSvg('line', { x1: -LIMITE, y1: i, x2: LIMITE, y2: i, class: classe }, fundo);

      // números nos eixos, de 2 em 2
      if (i !== 0 && i % 2 === 0) {
        criarTexto(formatarNumero(i), { x: i, y: 0.85, class: 'plano-rotulo', 'text-anchor': 'middle' }, fundo);
        criarTexto(formatarNumero(i), { x: -0.35, y: -i + 0.2, class: 'plano-rotulo', 'text-anchor': 'end' }, fundo);
      }
    }

    // nomes dos eixos e da origem
    criarTexto('x', { x: 10.55, y: -0.35, class: 'plano-rotulo plano-nome-eixo', 'text-anchor': 'middle' }, fundo);
    criarTexto('y', { x: 0.45, y: -10.4, class: 'plano-rotulo plano-nome-eixo' }, fundo);
    criarTexto('O', { x: -0.35, y: 0.85, class: 'plano-rotulo', 'text-anchor': 'end' }, fundo);
  }

  // Camada redesenhada a cada mudança (pontos, segmento, catetos).
  let camada = null;


  /* =======================================================================
     4. LEITURA DOS PONTOS
     ======================================================================= */

  /** Lê um campo; devolve null se o valor for inválido ou fora do plano. */
  function lerCoordenada(campo) {
    const valor = lerNumero(campo.value);
    if (Number.isNaN(valor) || valor < -LIMITE || valor > LIMITE) return null;
    return valor;
  }

  function lerPontos() {
    const ax = lerCoordenada(campos.ax);
    const ay = lerCoordenada(campos.ay);
    const bx = lerCoordenada(campos.bx);
    const by = lerCoordenada(campos.by);

    // marca em vermelho os campos inválidos
    [['ax', ax], ['ay', ay], ['bx', bx], ['by', by]].forEach(([nome, valor]) => {
      campos[nome].classList.toggle('erro', valor === null);
    });

    if ([ax, ay, bx, by].includes(null)) return null;
    return { A: { x: ax, y: ay }, B: { x: bx, y: by } };
  }


  /* =======================================================================
     5. DESENHO DOS PONTOS E RESULTADOS
     ======================================================================= */

  /** Desenha um ponto com rótulo, ex.: "A(1, 2)". */
  function desenharPonto(ponto, nome, classe) {
    criarSvg('circle', { cx: ponto.x, cy: -ponto.y, r: 0.32, class: 'ponto ' + classe }, camada);

    // rótulo do lado que tiver mais espaço
    const aDireita = ponto.x <= 5;
    criarTexto(nome + formatarPonto(ponto.x, ponto.y), {
      x: ponto.x + (aDireita ? 0.5 : -0.5),
      y: -ponto.y - 0.5,
      class: 'rotulo-ponto',
      'text-anchor': aDireita ? 'start' : 'end',
    }, camada);
  }

  function atualizar() {
    // apaga o desenho anterior
    if (camada) camada.remove();
    camada = criarSvg('g', { class: 'plano-camada' }, svg);

    const pontos = lerPontos();
    if (!pontos) {
      resultados.innerHTML =
        '<p class="erro">Use números de −10 a 10 nas coordenadas.</p>';
      return;
    }

    const { A, B } = pontos;
    const M = pontoMedio(A.x, A.y, B.x, B.y);
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const d = distancia(A.x, A.y, B.x, B.y);

    // --- desenho ---
    if (dx !== 0 && dy !== 0) {
      // catetos do triângulo retângulo (tracejados)
      criarSvg('polyline', {
        points: A.x + ',' + (-A.y) + ' ' + B.x + ',' + (-A.y) + ' ' + B.x + ',' + (-B.y),
        class: 'cateto',
      }, camada);
      criarTexto('Δx', { x: (A.x + B.x) / 2, y: -A.y + (dy > 0 ? 0.8 : -0.4), class: 'rotulo-cateto', 'text-anchor': 'middle' }, camada);
      criarTexto('Δy', { x: B.x + (dx > 0 ? 0.3 : -0.3), y: -(A.y + B.y) / 2, class: 'rotulo-cateto', 'text-anchor': dx > 0 ? 'start' : 'end' }, camada);
    }
    criarSvg('line', { x1: A.x, y1: -A.y, x2: B.x, y2: -B.y, class: 'segmento' }, camada);
    criarSvg('circle', { cx: M.x, cy: -M.y, r: 0.22, class: 'ponto ponto-m' }, camada);
    desenharPonto(A, 'A', 'ponto-a');
    desenharPonto(B, 'B', 'ponto-b');

    // --- contas passo a passo ---
    const f = formatarNumero;
    const p = formatarComParenteses;
    const soma = dx * dx + dy * dy;
    const raizExata = Number.isInteger(d);
    const textoDistancia = soma === 0
      ? '0 (os pontos são iguais)'
      : '√' + f(soma) + (raizExata ? ' = ' : ' ≈ ') + f(d);

    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">Ponto A</span>
        A${formatarPonto(A.x, A.y)} está ${quadrante(A.x, A.y).nome}.
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">Ponto B</span>
        B${formatarPonto(B.x, B.y)} está ${quadrante(B.x, B.y).nome}.
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Diferenças</span>
        Δx = ${f(B.x)} − ${p(A.x)} = ${f(dx)} &nbsp;e&nbsp; Δy = ${f(B.y)} − ${p(A.y)} = ${f(dy)}
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Distância</span>
        <div class="formula">d(A, B) = √(${p(dx)}² + ${p(dy)}²) = ${textoDistancia}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Ponto médio</span>
        <div class="formula">M = ( (${f(A.x)} + ${p(B.x)}) / 2 , (${f(A.y)} + ${p(B.y)}) / 2 ) = ${formatarPonto(M.x, M.y)}</div>
      </div>
    `;
  }


  /* =======================================================================
     6. EVENTOS
     ======================================================================= */

  // Digitar nos campos redesenha na hora.
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));

  // Clique no plano: posiciona A ou B (alternando) no ponto inteiro mais próximo.
  svg.addEventListener('click', (evento) => {
    const ponto = svg.createSVGPoint();
    ponto.x = evento.clientX;
    ponto.y = evento.clientY;
    const local = ponto.matrixTransform(svg.getScreenCTM().inverse());

    const limitar = (v) => Math.max(-LIMITE, Math.min(LIMITE, v));
    const x = limitar(Math.round(local.x));
    const y = limitar(Math.round(-local.y)); // desfaz a inversão do eixo y

    if (proximoClique === 'A') {
      campos.ax.value = x;
      campos.ay.value = y;
      proximoClique = 'B';
    } else {
      campos.bx.value = x;
      campos.by.value = y;
      proximoClique = 'A';
    }
    dicaClique.innerHTML = 'Próximo clique no plano move o ponto <strong>' + proximoClique + '</strong>.';
    atualizar();
  });

  // Sorteia dois pontos inteiros diferentes entre −9 e 9.
  btnSortear.addEventListener('click', () => {
    const sortear = () => Math.floor(Math.random() * 19) - 9;
    let ax, ay, bx, by;
    do {
      ax = sortear(); ay = sortear(); bx = sortear(); by = sortear();
    } while (ax === bx && ay === by);

    campos.ax.value = ax;
    campos.ay.value = ay;
    campos.bx.value = bx;
    campos.by.value = by;
    atualizar();
  });

  // Desenho inicial
  desenharFundo();
  atualizar();
})();
