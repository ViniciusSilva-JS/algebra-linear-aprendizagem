/* =========================================================================
   js/licao-1.js — Laboratório da Lição 1: Plano cartesiano e pontos
   Mostra os pontos A e B, o segmento AB, os catetos Δx e Δy e o ponto
   médio M, com as contas passo a passo. O plano vem do js/plano.js.

   Índice
   1. Elementos
   2. Leitura dos pontos
   3. Desenho e resultados
   4. Eventos (campos, clique no plano, sorteio)
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('l1-plano');
  if (!svg) return; // lição não está na página

  const plano = criarPlanoCartesiano(svg, { limite: 10 });

  const campos = {
    ax: document.getElementById('l1-ax'),
    ay: document.getElementById('l1-ay'),
    bx: document.getElementById('l1-bx'),
    by: document.getElementById('l1-by'),
  };
  const resultados = document.getElementById('l1-resultados');
  const dicaClique = document.getElementById('l1-dica-clique');
  const btnSortear = document.getElementById('l1-sortear');

  let proximoClique = 'A'; // qual ponto o próximo clique no plano move


  /* =======================================================================
     2. LEITURA DOS PONTOS
     ======================================================================= */

  /** Lê um campo; devolve null se o valor for inválido ou fora do plano. */
  function lerCoordenada(campo) {
    const valor = lerNumero(campo.value);
    if (Number.isNaN(valor) || Math.abs(valor) > plano.limite) return null;
    return valor;
  }

  function lerPontos() {
    const valores = {};
    let tudoValido = true;

    Object.keys(campos).forEach((nome) => {
      valores[nome] = lerCoordenada(campos[nome]);
      const invalido = valores[nome] === null;
      campos[nome].classList.toggle('erro', invalido); // marca em vermelho
      if (invalido) tudoValido = false;
    });

    if (!tudoValido) return null;
    return {
      A: { x: valores.ax, y: valores.ay },
      B: { x: valores.bx, y: valores.by },
    };
  }


  /* =======================================================================
     3. DESENHO E RESULTADOS
     ======================================================================= */

  /** Desenha um ponto com rótulo, ex.: "A(1, 2)", do lado com mais espaço. */
  function desenharPonto(ponto, nome, classe) {
    plano.ponto(ponto.x, ponto.y, 0.32, 'ponto ' + classe);
    const aDireita = ponto.x <= 5;
    plano.texto(
      nome + formatarPonto(ponto.x, ponto.y),
      ponto.x + (aDireita ? 0.5 : -0.5),
      ponto.y + 0.5,
      'rotulo-ponto',
      aDireita ? 'start' : 'end'
    );
  }

  function atualizar() {
    plano.limpar();

    const pontos = lerPontos();
    if (!pontos) {
      resultados.innerHTML = '<p class="erro">Use números de −10 a 10 nas coordenadas.</p>';
      return;
    }

    const { A, B } = pontos;
    const M = pontoMedio(A.x, A.y, B.x, B.y);
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    // --- desenho ---
    if (dx !== 0 && dy !== 0) {
      // catetos do triângulo retângulo (tracejados)
      plano.poligonal([[A.x, A.y], [B.x, A.y], [B.x, B.y]], 'cateto');
      plano.texto('Δx', (A.x + B.x) / 2, A.y + (dy > 0 ? -0.8 : 0.4), 'rotulo-cateto', 'middle');
      plano.texto('Δy', B.x + (dx > 0 ? 0.3 : -0.3), (A.y + B.y) / 2, 'rotulo-cateto', dx > 0 ? 'start' : 'end');
    }
    plano.linha(A.x, A.y, B.x, B.y, 'segmento');
    plano.ponto(M.x, M.y, 0.22, 'ponto ponto-m');
    desenharPonto(A, 'A', 'ponto-a');
    desenharPonto(B, 'B', 'ponto-b');

    // --- contas passo a passo ---
    const f = formatarNumero;
    const p = formatarComParenteses;
    const soma = dx * dx + dy * dy;
    const textoDistancia = soma === 0 ? '0 (os pontos são iguais)' : formatarRaiz(soma);

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
     4. EVENTOS
     ======================================================================= */

  // Digitar nos campos redesenha na hora.
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));

  // Clique no plano: posiciona A ou B, alternando.
  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);

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

  atualizar(); // desenho inicial
})();
