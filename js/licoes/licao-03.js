/* =========================================================================
   js/licoes/licao-03.js — Laboratório da Lição 3: Produto escalar e ângulo
   Desenha os vetores u e v, marca o ângulo θ entre eles (arco, ou um
   quadradinho quando é reto) e, se pedido, a projeção de u sobre v.
   Mostra o produto escalar, o cosseno, o ângulo e o tipo de ângulo.
   O plano vem do js/componentes/plano.js e as contas do js/utils/matematica.js.

   Índice
   1. Elementos
   2. Leitura dos valores
   3. Desenho
   4. Resultados (contas passo a passo)
   5. Atualização geral
   6. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('l3-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 10 });

  const campos = {
    ux: document.getElementById('l3-ux'),
    uy: document.getElementById('l3-uy'),
    vx: document.getElementById('l3-vx'),
    vy: document.getElementById('l3-vy'),
  };
  const caixaProjecao = document.getElementById('l3-projecao');
  const resultados = document.getElementById('l3-resultados');
  const dicaClique = document.getElementById('l3-dica-clique');
  const btnSortear = document.getElementById('l3-sortear');

  let proximoClique = 'u';

  const TOLERANCIA = 1e-9; // para decidir se o produto escalar é zero


  /* =======================================================================
     2. LEITURA DOS VALORES
     ======================================================================= */
  function lerCampo(campo) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || Math.abs(valor) > plano.limite;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerVetores() {
    const ux = lerCampo(campos.ux);
    const uy = lerCampo(campos.uy);
    const vx = lerCampo(campos.vx);
    const vy = lerCampo(campos.vy);
    if ([ux, uy, vx, vy].includes(null)) return null;
    return { u: { x: ux, y: uy }, v: { x: vx, y: vy } };
  }


  /* =======================================================================
     3. DESENHO
     ======================================================================= */

  /** Marca o ângulo entre u e v: arco + "θ", ou quadradinho se for reto. */
  function desenharAngulo(u, v) {
    const tamanhoU = modulo(u);
    const tamanhoV = modulo(v);
    if (tamanhoU === 0 || tamanhoV === 0) return;

    // raio do arco: menor em vetores curtos, para não passar da ponta
    const raio = Math.min(1.3, 0.6 * Math.min(tamanhoU, tamanhoV));

    if (Math.abs(produtoEscalar(u, v)) < TOLERANCIA) {
      // ângulo reto: quadradinho no canto
      const lado = Math.min(0.8, raio);
      const a = { x: (u.x / tamanhoU) * lado, y: (u.y / tamanhoU) * lado };
      const b = { x: (v.x / tamanhoV) * lado, y: (v.y / tamanhoV) * lado };
      plano.poligonal([[a.x, a.y], [a.x + b.x, a.y + b.y], [b.x, b.y]], 'arco-angulo');
      return;
    }

    // direção de cada vetor (ângulo com o eixo x)
    const inicio = Math.atan2(u.y, u.x);
    let diferenca = Math.atan2(v.y, v.x) - inicio;
    // leva a diferença para o intervalo (−π, π]: o arco vai pelo lado menor
    while (diferenca > Math.PI) diferenca -= 2 * Math.PI;
    while (diferenca <= -Math.PI) diferenca += 2 * Math.PI;

    plano.arco(0, 0, raio, inicio, inicio + diferenca, 'arco-angulo');

    // "θ" na bissetriz do ângulo, um pouco para fora do arco
    const meio = inicio + diferenca / 2;
    const distancia = raio + 0.6;
    plano.texto('θ', Math.cos(meio) * distancia, Math.sin(meio) * distancia - 0.2, 'rotulo-angulo', 'middle');
  }

  /** Projeção de u sobre v: vetor roxo + linha tracejada perpendicular. */
  function desenharProjecao(u, v) {
    const proj = projecao(u, v);
    if (!proj) return;
    plano.linha(u.x, u.y, proj.x, proj.y, 'cateto');
    plano.seta(0, 0, proj.x, proj.y, 'vetor-r vetor-largo');

    // O rótulo "proj" vai no MEIO da seta, afastado para o lado oposto ao de u
    // (a ponta da projeção costuma ficar perto da ponta de v e os nomes se sobreporiam).
    const tamanhoV = modulo(v);
    let normal = { x: -v.y / tamanhoV, y: v.x / tamanhoV }; // perpendicular a v
    if (produtoEscalar(normal, u) > 0) normal = { x: -normal.x, y: -normal.y };
    plano.texto('proj', proj.x / 2 + normal.x * 0.8, proj.y / 2 + normal.y * 0.8 - 0.2, 'rotulo-vetor vetor-r', 'middle');
  }

  function desenhar(u, v) {
    plano.limpar();
    if (caixaProjecao.checked) desenharProjecao(u, v);
    desenharAngulo(u, v);
    plano.seta(0, 0, u.x, u.y, 'vetor-u');
    plano.seta(0, 0, v.x, v.y, 'vetor-v');
    plano.rotuloSeta('u', 0, 0, u.x, u.y, 'rotulo-vetor vetor-u');
    plano.rotuloSeta('v', 0, 0, v.x, v.y, 'rotulo-vetor vetor-v');
  }


  /* =======================================================================
     4. RESULTADOS (contas passo a passo)
     ======================================================================= */
  const f = formatarNumero;
  const p = formatarComParenteses;
  const vet = (nome) => '<span class="vet">' + nome + '</span>';

  /** Etiqueta colorida com o tipo de ângulo. */
  function tipoDeAngulo(produto, graus) {
    if (quaseIgual(graus, 0, 1e-6)) return '<span class="etiqueta etiqueta-verde">0° · mesmo sentido (paralelos)</span>';
    if (quaseIgual(graus, 180, 1e-6)) return '<span class="etiqueta etiqueta-ambar">180° · sentidos opostos (paralelos)</span>';
    if (Math.abs(produto) < TOLERANCIA) return '<span class="etiqueta etiqueta-azul">Reto · perpendiculares</span>';
    if (produto > 0) return '<span class="etiqueta etiqueta-verde">Agudo · u · v &gt; 0</span>';
    return '<span class="etiqueta etiqueta-ambar">Obtuso · u · v &lt; 0</span>';
  }

  function montarResultados(u, v) {
    const produto = produtoEscalar(u, v);
    const quadradoU = produtoEscalar(u, u);
    const quadradoV = produtoEscalar(v, v);

    let html = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Produto escalar</span>
        <div class="formula">${vet('u')} · ${vet('v')} = ${f(u.x)}·${p(v.x)} + ${f(u.y)}·${p(v.y)} = ${f(u.x * v.x)} + ${p(u.y * v.y)} = ${f(produto)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Módulos</span>
        |${vet('u')}| = ${formatarRaiz(quadradoU)} &nbsp;e&nbsp; |${vet('v')}| = ${formatarRaiz(quadradoV)}
      </div>`;

    const angulo = anguloEntre(u, v);
    if (angulo === null) {
      html += '<p class="lab-dica">O ângulo não está definido porque um dos vetores é nulo (0, 0).</p>';
      return html;
    }

    // |u|·|v| = √(|u|²·|v|²): mostra "√221", ou só o número se a raiz for exata
    const produtoQuadrados = quadradoU * quadradoV;
    const raizExata = Math.round(Math.sqrt(produtoQuadrados));
    const denominador = quaseIgual(raizExata * raizExata, produtoQuadrados)
      ? f(raizExata)
      : '√' + f(produtoQuadrados);

    const cosseno = produto / (modulo(u) * modulo(v));
    const graus = radianosParaGraus(angulo);

    html += `
      <div class="lab-resultado">
        <span class="lab-rotulo">Ângulo</span>
        <div class="formula">cos θ = ${f(produto)} / (|${vet('u')}| · |${vet('v')}|) = ${f(produto)} / ${denominador} ≈ ${f(cosseno, 3)}</div>
        <div class="formula">θ ≈ ${f(graus)}°</div>
        <p>${tipoDeAngulo(produto, graus)}</p>
      </div>`;

    if (caixaProjecao.checked) {
      const proj = projecao(u, v);
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">Projeção de u sobre v</span>
          <div class="formula">proj = (${f(produto)} / ${f(quadradoV)}) · ${formatarPonto(v.x, v.y)} ≈ ${formatarPonto(proj.x, proj.y)}</div>
        </div>`;
    }

    return html;
  }


  /* =======================================================================
     5. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const vetores = lerVetores();
    if (!vetores) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">Use componentes de −10 a 10.</p>';
      return;
    }
    desenhar(vetores.u, vetores.v);
    resultados.innerHTML = montarResultados(vetores.u, vetores.v);
    dicaClique.innerHTML = 'Próximo clique no plano move a ponta de <strong>' + proximoClique + '</strong>.';
  }


  /* =======================================================================
     6. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  caixaProjecao.addEventListener('change', atualizar);

  // Clique no plano: move a ponta de u ou de v, alternando.
  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    if (proximoClique === 'u') {
      campos.ux.value = x;
      campos.uy.value = y;
      proximoClique = 'v';
    } else {
      campos.vx.value = x;
      campos.vy.value = y;
      proximoClique = 'u';
    }
    atualizar();
  });

  // Sorteia vetores não nulos com componentes inteiras entre −7 e 7.
  btnSortear.addEventListener('click', () => {
    const sortear = () => Math.floor(Math.random() * 15) - 7;
    let ux, uy, vx, vy;
    do { ux = sortear(); uy = sortear(); } while (ux === 0 && uy === 0);
    do { vx = sortear(); vy = sortear(); } while (vx === 0 && vy === 0);
    campos.ux.value = ux;
    campos.uy.value = uy;
    campos.vx.value = vx;
    campos.vy.value = vy;
    atualizar();
  });

  atualizar(); // desenho inicial
})();
