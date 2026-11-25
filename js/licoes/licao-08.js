/* =========================================================================
   js/licoes/licao-08.js — Laboratório da Lição 8: Sistemas lineares
   Cada equação a·x + b·y = c vira uma reta no plano. Mostra a forma
   matricial A·X = B, a regra de Cramer passo a passo, a classificação
   (SPD, SPI, SI) e a verificação da solução.

   Índice
   1. Elementos
   2. Leitura
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
  const svg = document.getElementById('l8-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 10 });
  const nomes = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'];
  const campos = {};
  nomes.forEach((nome) => { campos[nome] = document.getElementById('l8-' + nome); });
  const resultados = document.getElementById('l8-resultados');
  const botoesExemplo = Array.from(document.querySelectorAll('[data-l8-exemplo]'));

  const fr = formatarFracao;
  const p = (x) => (x < 0 ? '(' + fr(x) + ')' : fr(x));


  /* =======================================================================
     2. LEITURA
     ======================================================================= */
  function lerCoeficientes() {
    const valores = {};
    let validos = true;
    nomes.forEach((nome) => {
      const v = lerNumero(campos[nome].value);
      const invalido = Number.isNaN(v) || Math.abs(v) > 100;
      campos[nome].classList.toggle('erro', invalido);
      if (invalido) validos = false;
      valores[nome] = v;
    });
    return validos ? valores : null;
  }

  /** "2x − 3y = 4", escrita do jeito "bonito". */
  function textoEquacao(a, b, c) {
    const termos = [];
    if (a !== 0) termos.push({ v: a, t: 'x' });
    if (b !== 0) termos.push({ v: b, t: 'y' });
    let texto = termos.map((termo, i) => {
      const abs = Math.abs(termo.v);
      const numero = abs === 1 ? '' : fr(abs);
      if (i === 0) return (termo.v < 0 ? '−' : '') + numero + termo.t;
      return (termo.v < 0 ? ' − ' : ' + ') + numero + termo.t;
    }).join('');
    return (texto || '0') + ' = ' + fr(c);
  }


  /* =======================================================================
     3. DESENHO
     ======================================================================= */
  function desenhar(k, sol) {
    plano.limpar();
    plano.reta(k.a1, k.b1, k.c1, 'reta reta-principal');
    plano.reta(k.a2, k.b2, k.c2, 'reta reta-secundaria');
    if (sol.tipo === 'SPD' && plano.cabe(sol.x, sol.y)) {
      plano.ponto(sol.x, sol.y, 0.32, 'ponto ponto-solucao');
      const aDireita = sol.x <= 4;
      plano.texto(formatarPonto(sol.x, sol.y), sol.x + (aDireita ? 0.5 : -0.5), sol.y + 0.5,
        'rotulo-ponto', aDireita ? 'start' : 'end');
    }
  }


  /* =======================================================================
     4. RESULTADOS (contas passo a passo)
     ======================================================================= */
  const ETIQUETAS = {
    SPD: '<span class="etiqueta etiqueta-verde">SPD · retas concorrentes: uma única solução</span>',
    SPI: '<span class="etiqueta etiqueta-azul">SPI · retas coincidentes: infinitas soluções</span>',
    SI: '<span class="etiqueta etiqueta-ambar">SI · retas paralelas: nenhuma solução</span>',
  };

  function montarResultados(k, sol) {
    const A = [[k.a1, k.b1], [k.a2, k.b2]];
    let html = `
      <div class="lab-resultado">
        <span class="lab-rotulo">Forma matricial A · X = B</span>
        <div class="formula">${htmlMatriz(A)} · ${htmlMatriz([['x'], ['y']], { formatar: (t) => t })} = ${htmlMatriz([[k.c1], [k.c2]])}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Regra de Cramer</span>
        <div class="formula">D = ${fr(k.a1)}·${p(k.b2)} − ${p(k.b1)}·${p(k.a2)} = ${fr(sol.D)}</div>
        <div class="formula">D<sub>x</sub> = ${fr(k.c1)}·${p(k.b2)} − ${p(k.b1)}·${p(k.c2)} = ${fr(sol.Dx)}</div>
        <div class="formula">D<sub>y</sub> = ${fr(k.a1)}·${p(k.c2)} − ${p(k.c1)}·${p(k.a2)} = ${fr(sol.Dy)}</div>
      </div>`;

    if (sol.tipo === 'SPD') {
      const conferir1 = k.a1 * sol.x + k.b1 * sol.y;
      const conferir2 = k.a2 * sol.x + k.b2 * sol.y;
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-verde">Solução</span>
          <div class="formula">x = D<sub>x</sub> / D = ${fr(sol.Dx)} / ${p(sol.D)} = ${fr(sol.x)} &nbsp;&nbsp; y = D<sub>y</sub> / D = ${fr(sol.Dy)} / ${p(sol.D)} = ${fr(sol.y)}</div>
          <p>${ETIQUETAS.SPD}</p>
        </div>
        <div class="lab-resultado">
          <span class="lab-rotulo">Verificação</span>
          Equação 1: ${fr(k.a1)}·${p(sol.x)} + ${p(k.b1)}·${p(sol.y)} = ${fr(conferir1)} ${quaseIgual(conferir1, k.c1) ? '✓' : '✗'}<br>
          Equação 2: ${fr(k.a2)}·${p(sol.x)} + ${p(k.b2)}·${p(sol.y)} = ${fr(conferir2)} ${quaseIgual(conferir2, k.c2) ? '✓' : '✗'}
          ${plano.cabe(sol.x, sol.y) ? '' : '<p class="lab-dica">O ponto de encontro ficou fora da área visível do plano.</p>'}
        </div>`;
    } else {
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">Classificação</span>
          D = 0, então não há solução única.
          ${sol.tipo === 'SPI'
            ? 'Como D<sub>x</sub> = D<sub>y</sub> = 0, as equações descrevem a mesma reta.'
            : 'Como D<sub>x</sub> ou D<sub>y</sub> é diferente de zero, as retas são paralelas e distintas.'}
          <p>${ETIQUETAS[sol.tipo]}</p>
        </div>`;
    }
    return html;
  }


  /* =======================================================================
     5. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const k = lerCoeficientes();
    if (!k) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">Use números entre −100 e 100 nos coeficientes.</p>';
      return;
    }
    const sol = resolverSistema2x2(k.a1, k.b1, k.c1, k.a2, k.b2, k.c2);
    desenhar(k, sol);
    resultados.innerHTML = `
      <div class="lab-resultado">
        <span class="lab-rotulo">Sistema</span>
        <span class="texto-reta-1">${textoEquacao(k.a1, k.b1, k.c1)}</span> &nbsp;e&nbsp;
        <span class="texto-reta-2">${textoEquacao(k.a2, k.b2, k.c2)}</span>
      </div>` + montarResultados(k, sol);
  }


  /* =======================================================================
     6. EVENTOS
     ======================================================================= */
  nomes.forEach((nome) => campos[nome].addEventListener('input', atualizar));

  botoesExemplo.forEach((botao) => {
    botao.addEventListener('click', () => {
      const valores = botao.dataset.l8Exemplo.split(',');
      nomes.forEach((nome, i) => { campos[nome].value = valores[i]; });
      atualizar();
    });
  });

  atualizar();
})();
