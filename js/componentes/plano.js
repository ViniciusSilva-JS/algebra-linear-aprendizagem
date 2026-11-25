/* =========================================================================
   js/componentes/plano.js — Plano cartesiano em SVG reaproveitável
   Usado pelos laboratórios de todas as lições.

   Uso:
     const plano = criarPlanoCartesiano(document.getElementById('meu-svg'));
     plano.limpar();                              // apaga o desenho anterior
     plano.seta(0, 0, 3, 2, 'vetor-u');           // seta da origem até (3, 2)
     plano.rotuloSeta('u', 0, 0, 3, 2, 'rotulo-vetor vetor-u'); // nome na ponta
     plano.ponto(1, 2, 0.3, 'ponto-a');           // ponto (1, 2)
     plano.texto('A', 1.4, 2.4, 'rotulo-ponto');  // texto em (1,4; 2,4)
     plano.linha(0, 0, 3, 2, 'segmento');
     plano.poligonal([[0,0], [3,0], [3,2]], 'cateto');
     plano.arco(0, 0, 1.2, 0, Math.PI / 4, 'arco-angulo'); // arco de 0° a 45°
     const p = plano.pontoDoClique(evento);       // {x, y} inteiros

   Todas as coordenadas são MATEMÁTICAS (y para cima). A conversão para o
   SVG (onde y aponta para baixo) é feita aqui dentro.

   Índice
   1. Criação de elementos SVG
   2. Fundo: grade, eixos e números
   3. Funções de desenho
   4. Clique no plano
   ========================================================================= */

'use strict';

const PLANO_SVG_NS = 'http://www.w3.org/2000/svg';

function criarPlanoCartesiano(svg, opcoes) {
  opcoes = opcoes || {};
  const limite = opcoes.limite || 10;          // o plano vai de −limite a +limite
  const passoRotulos = opcoes.passoRotulos || 2;

  // A origem fica no centro; sobra 1 unidade de margem para os números.
  const lado = 2 * limite + 2;
  svg.setAttribute('viewBox', (-limite - 1) + ' ' + (-limite - 1) + ' ' + lado + ' ' + lado);


  /* -----------------------------------------------------------------------
     1. CRIAÇÃO DE ELEMENTOS SVG
     ----------------------------------------------------------------------- */
  function criar(tag, atributos, pai) {
    const elemento = document.createElementNS(PLANO_SVG_NS, tag);
    Object.keys(atributos).forEach((nome) => elemento.setAttribute(nome, atributos[nome]));
    pai.appendChild(elemento);
    return elemento;
  }

  function criarTexto(conteudo, atributos, pai) {
    const elemento = criar('text', atributos, pai);
    elemento.textContent = conteudo;
    return elemento;
  }


  /* -----------------------------------------------------------------------
     2. FUNDO (desenhado uma única vez)
     ----------------------------------------------------------------------- */
  const fundo = criar('g', { class: 'plano-fundo' }, svg);

  for (let i = -limite; i <= limite; i++) {
    const classe = i === 0 ? 'plano-eixo' : 'plano-grade';
    criar('line', { x1: i, y1: -limite, x2: i, y2: limite, class: classe }, fundo); // vertical
    criar('line', { x1: -limite, y1: i, x2: limite, y2: i, class: classe }, fundo); // horizontal

    if (i !== 0 && i % passoRotulos === 0) {
      criarTexto(formatarNumero(i), { x: i, y: 0.85, class: 'plano-rotulo', 'text-anchor': 'middle' }, fundo);
      criarTexto(formatarNumero(i), { x: -0.35, y: -i + 0.2, class: 'plano-rotulo', 'text-anchor': 'end' }, fundo);
    }
  }

  criarTexto('x', { x: limite + 0.55, y: -0.35, class: 'plano-rotulo plano-nome-eixo', 'text-anchor': 'middle' }, fundo);
  criarTexto('y', { x: 0.45, y: -limite - 0.4, class: 'plano-rotulo plano-nome-eixo' }, fundo);
  criarTexto('O', { x: -0.35, y: 0.85, class: 'plano-rotulo', 'text-anchor': 'end' }, fundo);

  // Camada dos desenhos que mudam (apagada a cada limpar()).
  let camada = criar('g', { class: 'plano-camada' }, svg);


  /* -----------------------------------------------------------------------
     3. FUNÇÕES DE DESENHO (coordenadas matemáticas)
     ----------------------------------------------------------------------- */
  function limpar() {
    camada.remove();
    camada = criar('g', { class: 'plano-camada' }, svg);
  }

  function linha(x1, y1, x2, y2, classe) {
    return criar('line', { x1: x1, y1: -y1, x2: x2, y2: -y2, class: classe }, camada);
  }

  /** Linha com vários pontos: [[x1, y1], [x2, y2], ...]. */
  function poligonal(pontos, classe) {
    const texto = pontos.map((p) => p[0] + ',' + (-p[1])).join(' ');
    return criar('polyline', { points: texto, class: classe }, camada);
  }

  /** Polígono fechado (para regiões preenchidas, ex.: paralelogramo). */
  function poligono(pontos, classe) {
    const texto = pontos.map((p) => p[0] + ',' + (-p[1])).join(' ');
    return criar('polygon', { points: texto, class: classe }, camada);
  }

  function ponto(x, y, raio, classe) {
    return criar('circle', { cx: x, cy: -y, r: raio, class: classe }, camada);
  }

  /** ancora: 'start' (padrão), 'middle' ou 'end'. */
  function texto(conteudo, x, y, classe, ancora) {
    return criarTexto(conteudo, { x: x, y: -y, class: classe, 'text-anchor': ancora || 'start' }, camada);
  }

  /**
   * Seta de (x1, y1) até (x2, y2): uma linha + um triângulo na ponta.
   * A classe define a cor (ex.: 'vetor-u'). Vetor nulo vira um pontinho.
   */
  function seta(x1, y1, x2, y2, classe) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const comprimento = Math.hypot(dx, dy);

    if (comprimento < 1e-9) {
      return ponto(x1, y1, 0.18, 'seta-ponta ' + classe);
    }

    // direção unitária da seta
    const ux = dx / comprimento;
    const uy = dy / comprimento;

    // tamanho da ponta (menor em setas muito curtas)
    const tamanho = Math.min(0.65, comprimento * 0.5);
    const largura = tamanho * 0.5;

    // base da ponta: recua "tamanho" a partir da ponta
    const bx = x2 - ux * tamanho;
    const by = y2 - uy * tamanho;

    linha(x1, y1, bx, by, 'seta-linha ' + classe);
    return poligono([
      [x2, y2],
      [bx - uy * largura, by + ux * largura],
      [bx + uy * largura, by - ux * largura],
    ], 'seta-ponta ' + classe);
  }

  /**
   * Escreve um texto logo depois da ponta de uma seta de (x1, y1) a (x2, y2),
   * afastado 0,7 unidade na direção da seta. Ex.: o nome do vetor.
   */
  function rotuloSeta(conteudo, x1, y1, x2, y2, classe) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const comprimento = Math.hypot(dx, dy);
    if (comprimento < 1e-9) return null;
    const tx = x2 + (dx / comprimento) * 0.7;
    const ty = y2 + (dy / comprimento) * 0.7 - 0.2;
    return texto(conteudo, tx, ty, classe, 'middle');
  }

  /**
   * Arco de circunferência com centro (cx, cy), indo do ângulo `inicio`
   * até o ângulo `fim` (em radianos, medidos a partir do eixo x, no sentido
   * anti-horário). Usado para marcar o ângulo entre dois vetores.
   */
  function arco(cx, cy, raio, inicio, fim, classe) {
    const passos = Math.max(8, Math.ceil(Math.abs(fim - inicio) * 20));
    const pontos = [];
    for (let i = 0; i <= passos; i++) {
      const a = inicio + (fim - inicio) * (i / passos);
      pontos.push([cx + raio * Math.cos(a), cy + raio * Math.sin(a)]);
    }
    return poligonal(pontos, classe);
  }


  /* -----------------------------------------------------------------------
     4. CLIQUE NO PLANO
     Converte a posição do mouse/dedo no ponto inteiro mais próximo.
     ----------------------------------------------------------------------- */
  function pontoDoClique(evento) {
    const p = svg.createSVGPoint();
    p.x = evento.clientX;
    p.y = evento.clientY;
    const local = p.matrixTransform(svg.getScreenCTM().inverse());

    const limitar = (v) => Math.max(-limite, Math.min(limite, v));
    return {
      x: limitar(Math.round(local.x)),
      y: limitar(Math.round(-local.y)), // desfaz a inversão do eixo y
    };
  }

  /** O ponto (x, y) cabe na área visível? */
  function cabe(x, y) {
    return Math.abs(x) <= limite && Math.abs(y) <= limite;
  }

  return { limite, limpar, linha, poligonal, poligono, ponto, texto, seta, rotuloSeta, arco, pontoDoClique, cabe };
}
