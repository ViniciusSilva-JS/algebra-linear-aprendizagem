/* =========================================================================
   js/licoes/licao-02.js — Laboratório da Lição 2: Vetores no plano
   Desenha os vetores u e v saindo da origem e o resultado da operação
   escolhida (u + v, u − v ou k · u), com as contas passo a passo.
   O plano vem do js/componentes/plano.js e as contas do js/utils/matematica.js.

   Índice
   1. Elementos
   2. Leitura dos valores
   3. Desenho (uma função para cada operação)
   4. Resultados (contas passo a passo)
   5. Atualização geral
   6. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('l2-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 10 });

  const campos = {
    ux: document.getElementById('l2-ux'),
    uy: document.getElementById('l2-uy'),
    vx: document.getElementById('l2-vx'),
    vy: document.getElementById('l2-vy'),
    k: document.getElementById('l2-k'),
  };
  const radiosOperacao = Array.from(document.querySelectorAll('input[name="l2-operacao"]'));
  const grupoV = campos.vx.closest('fieldset');
  const grupoK = campos.k.closest('fieldset');
  const resultados = document.getElementById('l2-resultados');
  const dicaClique = document.getElementById('l2-dica-clique');
  const btnSortear = document.getElementById('l2-sortear');

  let proximoClique = 'u'; // qual vetor o próximo clique move


  /* =======================================================================
     2. LEITURA DOS VALORES
     ======================================================================= */
  function operacaoAtual() {
    const marcado = radiosOperacao.find((r) => r.checked);
    return marcado ? marcado.value : 'soma';
  }

  /** Lê um campo; devolve null (e marca em vermelho) se for inválido. */
  function lerCampo(campo, limite) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || Math.abs(valor) > limite;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerValores() {
    const ux = lerCampo(campos.ux, 10);
    const uy = lerCampo(campos.uy, 10);
    const vx = lerCampo(campos.vx, 10);
    const vy = lerCampo(campos.vy, 10);
    const k = lerCampo(campos.k, 5);
    if ([ux, uy, vx, vy, k].includes(null)) return null;
    return { u: { x: ux, y: uy }, v: { x: vx, y: vy }, k: k };
  }


  /* =======================================================================
     3. DESENHO
     ======================================================================= */

  /** Escreve o nome do vetor logo depois da ponta da seta. */
  function rotularVetor(nome, origem, vetor, classe) {
    const tamanho = modulo(vetor);
    if (tamanho < 1e-9) return;
    const fimX = origem.x + vetor.x;
    const fimY = origem.y + vetor.y;
    // afasta o texto 0,7 unidade na direção da seta
    const tx = fimX + (vetor.x / tamanho) * 0.7;
    const ty = fimY + (vetor.y / tamanho) * 0.7 - 0.2;
    plano.texto(nome, tx, ty, 'rotulo-vetor ' + classe, 'middle');
  }

  /** Seta que começa em `origem` e tem as componentes de `vetor`. */
  function desenharVetor(origem, vetor, classe) {
    plano.seta(origem.x, origem.y, origem.x + vetor.x, origem.y + vetor.y, classe);
  }

  const O = { x: 0, y: 0 };

  function desenharSoma(u, v) {
    const r = somarVetores(u, v);
    // paralelogramo de fundo e cópias tracejadas (regra ponta com cauda)
    plano.poligono([[0, 0], [u.x, u.y], [r.x, r.y], [v.x, v.y]], 'regiao-paralelogramo');
    desenharVetor(u, v, 'vetor-v tracejado');
    desenharVetor(v, u, 'vetor-u tracejado');
    desenharVetor(O, r, 'vetor-r');
    desenharVetor(O, u, 'vetor-u');
    desenharVetor(O, v, 'vetor-v');
    rotularVetor('u', O, u, 'vetor-u');
    rotularVetor('v', O, v, 'vetor-v');
    rotularVetor('u + v', O, r, 'vetor-r');
  }

  function desenharSubtracao(u, v) {
    const r = subtrairVetores(u, v);
    const menosV = multiplicarPorEscalar(-1, v);
    // −v colado na ponta de u, e o resultado também ligando a ponta de v à de u
    desenharVetor(u, menosV, 'vetor-v tracejado');
    desenharVetor(v, r, 'vetor-r tracejado');
    desenharVetor(O, r, 'vetor-r');
    desenharVetor(O, u, 'vetor-u');
    desenharVetor(O, v, 'vetor-v');
    rotularVetor('u', O, u, 'vetor-u');
    rotularVetor('v', O, v, 'vetor-v');
    rotularVetor('−v', u, menosV, 'vetor-v');
    rotularVetor('u − v', O, r, 'vetor-r');
  }

  function desenharEscalar(u, k) {
    const r = multiplicarPorEscalar(k, u);
    desenharVetor(O, r, 'vetor-r vetor-largo'); // por baixo, mais grosso
    desenharVetor(O, u, 'vetor-u');
    rotularVetor('u', O, u, 'vetor-u');
    rotularVetor(formatarNumero(k) + 'u', O, r, 'vetor-r');
  }


  /* =======================================================================
     4. RESULTADOS (contas passo a passo)
     ======================================================================= */
  const f = formatarNumero;
  const p = formatarComParenteses;
  const vet = (nome) => '<span class="vet">' + nome + '</span>';

  /** "|v| = √(3² + 1²) = √10 ≈ 3,16" */
  function textoModulo(nome, v) {
    return '|' + nome + '| = √(' + p(v.x) + '² + ' + p(v.y) + '²) = ' + formatarRaiz(v.x * v.x + v.y * v.y);
  }

  function blocoVetor(nome, v, classeRotulo) {
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo ${classeRotulo}">Vetor ${nome}</span>
        ${vet(nome)} = ${formatarPonto(v.x, v.y)} &nbsp;·&nbsp; ${textoModulo(vet(nome), v)}
      </div>`;
  }

  function avisoForaDaTela(r) {
    return plano.cabe(r.x, r.y)
      ? ''
      : '<p class="lab-dica">A ponta do resultado ficou fora da área visível do plano.</p>';
  }

  function resultadosSoma(u, v) {
    const r = somarVetores(u, v);
    return blocoVetor('u', u, 'lab-rotulo-a') + blocoVetor('v', v, 'lab-rotulo-b') + `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Soma</span>
        <div class="formula">${vet('u')} + ${vet('v')} = (${f(u.x)} + ${p(v.x)} , ${f(u.y)} + ${p(v.y)}) = ${formatarPonto(r.x, r.y)}</div>
        <div class="formula">${textoModulo(vet('u') + ' + ' + vet('v'), r)}</div>
        ${avisoForaDaTela(r)}
      </div>`;
  }

  function resultadosSubtracao(u, v) {
    const r = subtrairVetores(u, v);
    return blocoVetor('u', u, 'lab-rotulo-a') + blocoVetor('v', v, 'lab-rotulo-b') + `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Subtração</span>
        <div class="formula">${vet('u')} − ${vet('v')} = (${f(u.x)} − ${p(v.x)} , ${f(u.y)} − ${p(v.y)}) = ${formatarPonto(r.x, r.y)}</div>
        <div class="formula">${textoModulo(vet('u') + ' − ' + vet('v'), r)}</div>
        ${avisoForaDaTela(r)}
      </div>`;
  }

  function resultadosEscalar(u, k) {
    const r = multiplicarPorEscalar(k, u);
    const moduloU = modulo(u);

    let sentido;
    if (k === 0 || moduloU === 0) sentido = 'O resultado é o vetor nulo (0, 0).';
    else if (k > 0) sentido = 'Como k é positivo, o sentido é o mesmo de ' + vet('u') + '.';
    else sentido = 'Como k é negativo, o sentido é oposto ao de ' + vet('u') + '.';

    let tamanho = '';
    if (k !== 0 && moduloU !== 0) {
      const absK = Math.abs(k);
      if (absK > 1) tamanho = ' O módulo aumentou ' + f(absK) + ' vezes.';
      else if (absK < 1) tamanho = ' O módulo diminuiu (ficou ' + f(absK) + ' do original).';
      else tamanho = ' O módulo continua o mesmo.';
    }

    // Com k decimal (ex.: 1,5) usamos ";" para não confundir com a vírgula decimal.
    const sep = Number.isInteger(k) ? ' , ' : ' ; ';

    return blocoVetor('u', u, 'lab-rotulo-a') + `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">Multiplicação por k = ${f(k)}</span>
        <div class="formula">${f(k)} · ${vet('u')} = (${f(k)} · ${p(u.x)}${sep}${f(k)} · ${p(u.y)}) = ${formatarPonto(r.x, r.y)}</div>
        <div class="formula">|${f(k)} · ${vet('u')}| = |${f(k)}| · |${vet('u')}| ≈ ${f(Math.abs(k))} · ${f(moduloU)} ≈ ${f(modulo(r))}</div>
        <p class="lab-dica">${sentido}${tamanho}</p>
        ${avisoForaDaTela(r)}
      </div>`;
  }


  /* =======================================================================
     5. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    plano.limpar();

    const operacao = operacaoAtual();

    // Apaga visualmente os campos que a operação não usa.
    grupoV.classList.toggle('inativo', operacao === 'escalar');
    grupoK.classList.toggle('inativo', operacao !== 'escalar');

    const valores = lerValores();
    if (!valores) {
      resultados.innerHTML = '<p class="erro">Use componentes de −10 a 10 e k entre −5 e 5.</p>';
      return;
    }

    const { u, v, k } = valores;
    if (operacao === 'soma') {
      desenharSoma(u, v);
      resultados.innerHTML = resultadosSoma(u, v);
    } else if (operacao === 'subtracao') {
      desenharSubtracao(u, v);
      resultados.innerHTML = resultadosSubtracao(u, v);
    } else {
      desenharEscalar(u, k);
      resultados.innerHTML = resultadosEscalar(u, k);
    }

    atualizarDicaClique();
  }

  function atualizarDicaClique() {
    // Na multiplicação por k só existe o vetor u.
    if (operacaoAtual() === 'escalar') proximoClique = 'u';
    dicaClique.innerHTML = 'Próximo clique no plano move a ponta de <strong>' + proximoClique + '</strong>.';
  }


  /* =======================================================================
     6. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  radiosOperacao.forEach((radio) => radio.addEventListener('change', atualizar));

  // Clique no plano: move a ponta de u ou de v, alternando.
  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    if (proximoClique === 'u') {
      campos.ux.value = x;
      campos.uy.value = y;
      if (operacaoAtual() !== 'escalar') proximoClique = 'v';
    } else {
      campos.vx.value = x;
      campos.vy.value = y;
      proximoClique = 'u';
    }
    atualizar();
  });

  // Sorteia vetores com componentes inteiras entre −6 e 6 (não nulos).
  btnSortear.addEventListener('click', () => {
    const sortear = () => Math.floor(Math.random() * 13) - 6;
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
