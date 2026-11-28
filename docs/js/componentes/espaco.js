/* =========================================================================
   js/componentes/espaco.js — Sistema de eixos x, y, z em SVG (3D)
   Usado pelos laboratórios de Geometria Analítica no espaço (lição 9 em diante).

   O espaço é desenhado em projeção ortográfica: a "câmera" gira em torno
   do eixo z (azimute) e fica um pouco acima do plano xy (elevação).
   Como a vista pode girar, o desenho é feito por uma função que o
   componente chama de novo a cada giro:

     const espaco = criarEspaco3D(document.getElementById('meu-svg'), {
       aoGirar: (azimute) => { ... },     // opcional: avisa quando a vista gira
     });
     espaco.definirAlcance(6);              // eixos de −6 a 6
     espaco.definirDesenho((e) => {
       e.seta([0, 0, 0], [2, 1, 3], 'vetor-u');          // seta da origem até (2, 1, 3)
       e.rotuloSeta('u', [0, 0, 0], [2, 1, 3], 'rotulo-vetor vetor-u');
       e.linha([2, 1, 3], [2, 1, 0], 'linha-chamada');
       e.ponto([2, 1, 3], 0.2, 'ponto-a');
       e.texto('A', [2, 1, 3], 'rotulo-ponto');
       e.poligono([[0,0,0], [2,0,0], [2,1,0]], 'regiao-paralelogramo');
     });
     espaco.girar(45);                       // azimute em graus
     espaco.vistaPadrao();

   Pontos são listas [x, y, z] em coordenadas MATEMÁTICAS (z para cima).
   O aluno também gira a vista arrastando o desenho ou com as setas do teclado.

   Índice
   1. Estado e criação de elementos SVG
   2. Projeção
   3. Fundo: chão quadriculado, eixos e números
   4. Funções de desenho
   5. Redesenho e giro
   6. Arrastar e teclado
   ========================================================================= */

'use strict';

function criarEspaco3D(svg, opcoes) {
  opcoes = opcoes || {};
  const AZIMUTE_PADRAO = 30;    // graus: eixo x vem para a esquerda, y vai para a direita
  const ELEVACAO_PADRAO = 22;   // graus acima do plano xy
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* -----------------------------------------------------------------------
     1. ESTADO E CRIAÇÃO DE ELEMENTOS SVG
     ----------------------------------------------------------------------- */
  let alcance = opcoes.alcance || 5;   // eixos de −alcance a +alcance
  let azimute = AZIMUTE_PADRAO;
  let elevacao = ELEVACAO_PADRAO;
  let escala = 1;
  let desenho = null;

  function criar(tag, atributos, pai) {
    const elemento = document.createElementNS(SVG_NS, tag);
    Object.keys(atributos).forEach((nome) => elemento.setAttribute(nome, atributos[nome]));
    pai.appendChild(elemento);
    return elemento;
  }

  function criarTexto(conteudo, atributos, pai) {
    const elemento = criar('text', atributos, pai);
    elemento.textContent = conteudo;
    return elemento;
  }

  const fundo = criar('g', { class: 'plano-fundo' }, svg);
  let camada = criar('g', { class: 'plano-camada' }, svg);


  /* -----------------------------------------------------------------------
     2. PROJEÇÃO
     [x, y, z] → [X, Y] do SVG (Y para baixo).
     ----------------------------------------------------------------------- */
  function projetar(p) {
    const t = azimute * Math.PI / 180;
    const f = elevacao * Math.PI / 180;
    const horizontal = -p[0] * Math.sin(t) + p[1] * Math.cos(t);
    const profundidade = p[0] * Math.cos(t) + p[1] * Math.sin(t);  // quanto vem na direção de quem olha
    const vertical = p[2] * Math.cos(f) - profundidade * Math.sin(f);
    return [horizontal, -vertical];
  }

  const pontosSvg = (lista) => lista.map((p) => projetar(p).join(',')).join(' ');


  /* -----------------------------------------------------------------------
     3. FUNDO
     ----------------------------------------------------------------------- */
  function desenharFundo() {
    while (fundo.firstChild) fundo.removeChild(fundo.firstChild);

    // Tudo com |p| ≤ alcance cabe na tela, qualquer que seja o giro.
    const meia = alcance + 1.3;
    svg.setAttribute('viewBox', (-meia) + ' ' + (-meia) + ' ' + 2 * meia + ' ' + 2 * meia);
    escala = meia / 11;   // mesma referência do plano 2D (limite 10 → meia 11)
    svg.style.setProperty('--escala-plano', escala);

    // Chão (plano xy) quadriculado, recortado num disco de raio "alcance"
    const n = Math.floor(alcance);
    for (let i = -n; i <= n; i++) {
      if (i === 0) continue;
      const m = Math.sqrt(alcance * alcance - i * i);
      [[[i, -m, 0], [i, m, 0]], [[-m, i, 0], [m, i, 0]]].forEach(([a, b]) => {
        const A = projetar(a), B = projetar(b);
        criar('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'plano-grade' }, fundo);
      });
    }

    // Eixos: parte negativa tracejada, parte positiva cheia com o nome na ponta
    const O = projetar([0, 0, 0]);
    const passo = alcance <= 7 ? 1 : (alcance <= 14 ? 2 : 5);
    ['x', 'y', 'z'].forEach((nome, k) => {
      const direcao = [0, 0, 0];
      direcao[k] = 1;
      const em = (t) => projetar(direcao.map((d) => d * t));

      const N = em(-alcance), P = em(alcance);
      criar('line', { x1: O[0], y1: O[1], x2: N[0], y2: N[1], class: 'espaco-eixo-negativo' }, fundo);
      criar('line', { x1: O[0], y1: O[1], x2: P[0], y2: P[1], class: 'plano-eixo' }, fundo);

      // nome do eixo um pouco além da ponta
      const R = em(alcance + 0.75 * escala);
      criarTexto(nome, { x: R[0], y: R[1] + 0.25 * escala, class: 'plano-rotulo plano-nome-eixo', 'text-anchor': 'middle' }, fundo);

      // marquinhas e números na parte positiva
      for (let t = passo; t < alcance; t += passo) {
        const Q = em(t);
        criar('circle', { cx: Q[0], cy: Q[1], r: 0.07 * escala, class: 'espaco-marca' }, fundo);
        criarTexto(formatarNumero(t), {
          x: Q[0] - 0.3 * escala, y: Q[1] + 0.6 * escala,
          class: 'plano-rotulo espaco-numero', 'text-anchor': 'end',
        }, fundo);
      }
    });
    criarTexto('O', { x: O[0] - 0.3 * escala, y: O[1] + 0.7 * escala, class: 'plano-rotulo', 'text-anchor': 'end' }, fundo);
  }


  /* -----------------------------------------------------------------------
     4. FUNÇÕES DE DESENHO (pontos [x, y, z])
     ----------------------------------------------------------------------- */
  function limpar() {
    camada.remove();
    camada = criar('g', { class: 'plano-camada' }, svg);
  }

  function linha(p, q, classe) {
    const A = projetar(p), B = projetar(q);
    return criar('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: classe }, camada);
  }

  function poligonal(pontos, classe) {
    return criar('polyline', { points: pontosSvg(pontos), class: classe }, camada);
  }

  function poligono(pontos, classe) {
    return criar('polygon', { points: pontosSvg(pontos), class: classe }, camada);
  }

  function ponto(p, raio, classe) {
    const A = projetar(p);
    return criar('circle', { cx: A[0], cy: A[1], r: raio * escala, class: classe }, camada);
  }

  /** Texto perto do ponto p; dx e dy deslocam na TELA (em quadradinhos, y para cima). */
  function texto(conteudo, p, classe, ancora, dx, dy) {
    const A = projetar(p);
    return criarTexto(conteudo, {
      x: A[0] + (dx || 0) * escala, y: A[1] - (dy || 0) * escala,
      class: classe, 'text-anchor': ancora || 'start',
    }, camada);
  }

  /**
   * Seta de p até q. A ponta é desenhada já na tela (2D), então fica com o
   * mesmo tamanho em qualquer giro. Vetor nulo vira um pontinho.
   */
  function seta(p, q, classe) {
    const A = projetar(p), B = projetar(q);
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const comprimento = Math.hypot(dx, dy);
    const comprimento3d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);

    if (comprimento3d < 1e-9) {
      return criar('circle', { cx: A[0], cy: A[1], r: 0.18 * escala, class: 'seta-ponta ' + classe }, camada);
    }
    if (comprimento < 1e-6) {
      // apontando direto para quem olha: só a ponta, como um ponto
      return criar('circle', { cx: B[0], cy: B[1], r: 0.25 * escala, class: 'seta-ponta ' + classe }, camada);
    }

    const ux = dx / comprimento, uy = dy / comprimento;
    const tamanho = Math.min(0.65 * escala, comprimento * 0.5);
    const largura = tamanho * 0.5;
    const bx = B[0] - ux * tamanho, by = B[1] - uy * tamanho;

    criar('line', { x1: A[0], y1: A[1], x2: bx, y2: by, class: 'seta-linha ' + classe }, camada);
    const pontas = [[B[0], B[1]], [bx - uy * largura, by + ux * largura], [bx + uy * largura, by - ux * largura]];
    return criar('polygon', { points: pontas.map((c) => c.join(',')).join(' '), class: 'seta-ponta ' + classe }, camada);
  }

  /** Nome logo depois da ponta da seta de p até q (na direção da seta, na tela). */
  function rotuloSeta(conteudo, p, q, classe) {
    const A = projetar(p), B = projetar(q);
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const comprimento = Math.hypot(dx, dy) || 1;
    const x = B[0] + (dx / comprimento) * 0.75 * escala;
    const y = B[1] + (dy / comprimento) * 0.75 * escala + 0.25 * escala;
    return criarTexto(conteudo, { x: x, y: y, class: classe, 'text-anchor': 'middle' }, camada);
  }


  /* -----------------------------------------------------------------------
     5. REDESENHO E GIRO
     ----------------------------------------------------------------------- */
  const api = { limpar, linha, poligonal, poligono, ponto, texto, seta, rotuloSeta };

  function redesenhar() {
    desenharFundo();
    limpar();
    if (desenho) desenho(api);
  }

  function definirDesenho(funcao) {
    desenho = funcao;
    redesenhar();
  }

  /** Muda o tamanho dos eixos (vale a partir do próximo redesenho). */
  function definirAlcance(valor) {
    alcance = Math.max(2, valor);
  }

  /** Normaliza o ângulo para −180..180. */
  const normalizar = (g) => ((((g + 180) % 360) + 360) % 360) - 180;

  function girar(novoAzimute, novaElevacao) {
    azimute = normalizar(novoAzimute);
    if (novaElevacao !== undefined) elevacao = Math.max(-10, Math.min(80, novaElevacao));
    redesenhar();
    if (opcoes.aoGirar) opcoes.aoGirar(Math.round(azimute), Math.round(elevacao));
  }

  function vistaPadrao() {
    girar(AZIMUTE_PADRAO, ELEVACAO_PADRAO);
  }


  /* -----------------------------------------------------------------------
     6. ARRASTAR E TECLADO
     Arrastar para os lados gira em torno do eixo z; para cima e para baixo
     muda a elevação. No celular o arraste vertical continua rolando a página
     (touch-action: pan-y no CSS), então lá só o giro horizontal funciona.
     ----------------------------------------------------------------------- */
  let arrastando = null;

  svg.addEventListener('pointerdown', (evento) => {
    arrastando = { x: evento.clientX, y: evento.clientY, azimute, elevacao };
    svg.setPointerCapture(evento.pointerId);
    svg.classList.add('arrastando');
  });

  svg.addEventListener('pointermove', (evento) => {
    if (!arrastando) return;
    const largura = svg.getBoundingClientRect().width || 300;
    const graus = 360 / largura;   // arrastar a largura toda = uma volta
    girar(
      arrastando.azimute - (evento.clientX - arrastando.x) * graus,
      arrastando.elevacao + (evento.clientY - arrastando.y) * graus * 0.6
    );
  });

  function soltar() {
    arrastando = null;
    svg.classList.remove('arrastando');
  }
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);

  svg.addEventListener('keydown', (evento) => {
    const passos = { ArrowLeft: [15, 0], ArrowRight: [-15, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] };
    const passo = passos[evento.key];
    if (!passo) return;
    evento.preventDefault();
    girar(azimute + passo[0], elevacao + passo[1]);
  });

  redesenhar();

  return {
    redesenhar, definirDesenho, definirAlcance, girar, vistaPadrao, projetar,
    get azimute() { return azimute; },
    get elevacao() { return elevacao; },
  };
}
