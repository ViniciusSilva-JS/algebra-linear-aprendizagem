/* =========================================================================
   js/licoes/ga-11.js — Geometria Analítica, Lição 11: Retas e planos no espaço
   Lê um plano ax + by + cz + d = 0, uma reta (ponto A e diretor v) e um
   ponto P, e:
     1. desenha no espaço 3D (js/componentes/espaco.js) um pedaço do plano
        com o vetor normal, a reta, o ponto onde ela fura o plano, e o
        segmento de P até o pé da perpendicular;
     2. escreve a equação do plano e as paramétricas da reta, decide a
        posição relativa (concorrente, paralela ou contida), acha o ponto de
        interseção e o ângulo, e calcula a distância de P ao plano.

   Índice
   1. Elementos
   2. Textos
   3. Leitura dos campos
   4. Cálculos
   5. Desenho
   6. Resultados
   7. Atualização geral
   8. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g11-espaco');
  if (!svg) return;

  const pegar = (id) => document.getElementById('g11-' + id);
  const campos = {
    plano: ['a', 'b', 'c', 'd'].map(pegar),
    A: ['ax', 'ay', 'az'].map(pegar),
    v: ['vx', 'vy', 'vz'].map(pegar),
    P: ['px', 'py', 'pz'].map(pegar),
  };
  const todosOsCampos = [...campos.plano, ...campos.A, ...campos.v, ...campos.P];

  const giro = pegar('giro');
  const giroValor = pegar('giro-valor');
  const btnVista = pegar('vista');
  const chkNormal = pegar('normal');
  const chkReta = pegar('reta');
  const chkPonto = pegar('ponto');
  const btnSortear = pegar('sortear');
  const botoesExemplo = Array.from(document.querySelectorAll('[data-g11-exemplo]'));
  const resultados = pegar('resultados');

  const espaco = criarEspaco3D(svg, {
    aoGirar: (azimute) => {
      giro.value = azimute;
      giroValor.textContent = formatarNumero(azimute) + '°';
    },
  });


  /* =======================================================================
     2. TEXTOS
     ======================================================================= */
  const VET = (nome) => '<span class="vet">' + nome + '</span>';
  const lista = (v) => [v.x, v.y, v.z];
  const terna = (v) => formatarTerna(v.x, v.y, v.z);
  const p = formatarComParenteses;
  const zero = (x) => Math.abs(x) < 1e-9;

  /** Número "bonito": fração simples (2/3) ou decimal. */
  const ff = (x) => formatarFracao(x);

  /** Ponto com frações quando der: (7/3, 7/3, 1/3); senão decimais com ";". */
  function ternaBonita(v) {
    const partes = lista(v).map(ff);
    const temDecimal = partes.some((t) => t.includes(','));
    return '(' + partes.join(temDecimal ? '; ' : ', ') + ')';
  }

  /** Um termo com sinal: (2, 'x', true) → "2x"; (−1, 'y') → " − y"; (−3, '') → " − 3". */
  function termo(coef, variavel, primeiro) {
    if (zero(coef)) return '';
    const sinal = coef < 0 ? (primeiro ? '−' : ' − ') : (primeiro ? '' : ' + ');
    const valor = Math.abs(coef);
    let numero = variavel && quaseIgual(valor, 1) ? '' : ff(valor);
    if (variavel && numero.includes('/')) numero = '(' + numero + ')';
    return sinal + numero + variavel;
  }

  /** Fator na frente de um vetor: 2 → "2·", −1/2 → "(−1/2)·". */
  const fator = (x) => {
    const f = ff(x);
    return (x < 0 || f.includes('/') ? '(' + f + ')' : f) + '·';
  };

  /** "2x − y + 2z − 3 = 0" */
  function equacaoPlano(pl) {
    let txt = '';
    [[pl.a, 'x'], [pl.b, 'y'], [pl.c, 'z'], [pl.d, '']].forEach(([c, v]) => { txt += termo(c, v, txt === ''); });
    return (txt || '0') + ' = 0';
  }

  /** "x = 1 + 2t", "y = t", "z = 3" */
  function parametrica(nome, inicio, passo) {
    let txt = termo(inicio, '', true) + termo(passo, 't', zero(inicio));
    return nome + ' = ' + (txt || '0');
  }

  /** "√9 = 3", "√14 ≈ 3,74", "√18 = 3√2 ≈ 4,24". */
  function raizComValor(q) {
    const r = Math.sqrt(q);
    if (quaseIgual(r, Math.round(r))) return '√' + formatarNumero(q) + ' = ' + formatarNumero(Math.round(r));
    if (!quaseIgual(q, Math.round(q))) {
      return '√' + formatarNumero(q) + (quaseIgual(r * 100, Math.round(r * 100)) ? ' = ' : ' ≈ ') + formatarNumero(r);
    }
    const simples = textoRaiz(q);
    return '√' + formatarNumero(q) + (simples.startsWith('√') ? '' : ' = ' + simples) + ' ≈ ' + formatarNumero(r);
  }

  /** Módulo curto para ir dentro de contas: "3", "√14", "3√2". */
  const moduloCurto = (q) => textoRaiz(q);

  /** Fração ou decimal com "=" ou "≈" na frente. */
  function igualA(x) {
    const f = ff(x);
    return (f.includes(',') ? ' ≈ ' : ' = ') + f;
  }


  /* =======================================================================
     3. LEITURA DOS CAMPOS
     ======================================================================= */
  function ler(lista, limite, nome) {
    const valores = lista.map((campo) => lerNumero(campo.value));
    if (valores.some((v) => !Number.isFinite(v))) return { erro: 'Preencha ' + nome + ' com números.' };
    if (valores.some((v, i) => Math.abs(v) > (typeof limite === 'number' ? limite : limite[i]))) {
      return { erro: 'Os valores de ' + nome + ' passaram do limite (veja a dica abaixo dos campos).' };
    }
    return { valores };
  }

  function lerTudo() {
    const plano = ler(campos.plano, [6, 6, 6, 20], 'a, b, c e d');
    const A = ler(campos.A, 5, 'o ponto A');
    const v = ler(campos.v, 5, 'o diretor v');
    const P = ler(campos.P, 5, 'o ponto P');
    const comErro = [plano, A, v, P].find((x) => x.erro);
    if (comErro) return { erro: comErro.erro };

    const vetor = (vals) => ({ x: vals[0], y: vals[1], z: vals[2] });
    const [a, b, c, d] = plano.valores;
    const dados = { plano: { a, b, c, d }, n: { x: a, y: b, z: c }, A: vetor(A.valores), v: vetor(v.valores), P: vetor(P.valores) };
    if (a === 0 && b === 0 && c === 0) return { erro: 'a, b e c não podem ser todos zero: (a, b, c) é o vetor normal do plano.' };
    if (modulo3(dados.v) === 0) return { erro: 'O diretor v não pode ser o vetor nulo: ele dá a direção da reta.' };
    return dados;
  }


  /* =======================================================================
     4. CÁLCULOS
     ======================================================================= */
  function calcular({ plano, n, A, v, P }) {
    const nn = produtoEscalar3(n, n);
    const r = { nn };

    // distância de P e pé da perpendicular
    r.valorP = produtoEscalar3(n, P) + plano.d;
    r.distP = Math.abs(r.valorP) / Math.sqrt(nn);
    r.pe = subtrairVetores3(P, multiplicarPorEscalar3(r.valorP / nn, n));

    // reta × plano
    r.nv = produtoEscalar3(n, v);
    r.nA = produtoEscalar3(n, A) + plano.d;
    if (!zero(r.nv)) {
      r.posicao = 'concorrente';
      r.t = -r.nA / r.nv;
      r.I = somarVetores3(A, multiplicarPorEscalar3(r.t, v));
      r.anguloReta = Math.asin(Math.min(1, Math.abs(r.nv) / Math.sqrt(nn * produtoEscalar3(v, v))));
    } else {
      r.posicao = zero(r.nA) ? 'contida' : 'paralela';
      r.distReta = Math.abs(r.nA) / Math.sqrt(nn);
    }
    return r;
  }


  /* =======================================================================
     5. DESENHO
     ======================================================================= */
  const tamanho = (a) => Math.hypot(...a);
  const mais = (a, b) => a.map((c, i) => c + b[i]);
  const vezes = (k, a) => a.map((c) => k * c);

  function desenhar(dados, r) {
    const { n, A, v, P } = dados;
    const pn = lista(n), pA = lista(A), pv = lista(v), pP = lista(P), pPe = lista(r.pe);

    // O espaço cresce para caber o que importa (pontos muito distantes ficam de fora).
    const importantes = [pPe, pA, mais(pA, pv)];
    if (chkPonto.checked) importantes.push(pP);
    if (r.I && tamanho(lista(r.I)) <= 15) importantes.push(lista(r.I));
    const alcance = Math.max(5, Math.min(16, Math.ceil(Math.max(...importantes.map(tamanho)) + 1)));
    espaco.definirAlcance(alcance);

    // Base do plano: dois vetores unitários perpendiculares à normal.
    const nh = vezes(1 / tamanho(pn), pn);
    const auxiliar = Math.abs(nh[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const cruz = (x, y) => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
    const e1 = (() => { const c = cruz(nh, auxiliar); return vezes(1 / tamanho(c), c); })();
    const e2 = cruz(nh, e1);
    const centro = pPe;   // o pedaço do plano fica em volta do pé da perpendicular de P
    const s = alcance * 0.55;
    const noPlano = (i, j) => mais(centro, mais(vezes(i, e1), vezes(j, e2)));

    espaco.definirDesenho((e) => {
      // pedaço quadrado do plano, com uma gradezinha
      e.poligono([noPlano(-s, -s), noPlano(s, -s), noPlano(s, s), noPlano(-s, s)], 'regiao-plano');
      for (let k = -1; k <= 1; k++) {
        const t = (k * s) / 2;
        e.linha(noPlano(t, -s), noPlano(t, s), 'grade-plano');
        e.linha(noPlano(-s, t), noPlano(s, t), 'grade-plano');
      }

      if (chkNormal.checked) {
        const base = noPlano(-s * 0.6, s * 0.6);
        e.seta(base, mais(base, vezes(Math.min(2, alcance * 0.3), nh)), 'vetor-r');
        e.rotuloSeta('n', base, mais(base, vezes(Math.min(2, alcance * 0.3), nh)), 'rotulo-vetor vetor-r');
      }

      if (chkReta.checked) {
        // trecho da reta dentro da esfera de raio "alcance": |A + t·v|² = R²
        const vv = produtoEscalar3(v, v), Av = produtoEscalar3(A, v), AA = produtoEscalar3(A, A);
        const delta = Av * Av - vv * (AA - alcance * alcance);
        if (delta > 0) {
          const t1 = (-Av - Math.sqrt(delta)) / vv, t2 = (-Av + Math.sqrt(delta)) / vv;
          e.linha(mais(pA, vezes(t1, pv)), mais(pA, vezes(t2, pv)), 'reta-espaco');
        }
        e.seta(pA, mais(pA, pv), 'vetor-v');
        e.rotuloSeta('v', pA, mais(pA, pv), 'rotulo-vetor vetor-v');
        e.ponto(pA, 0.22, 'ponto-b');
        e.texto('A', pA, 'rotulo-ponto', 'end', -0.35, 0.3);
        if (r.I && tamanho(lista(r.I)) <= alcance + 0.5) {
          e.ponto(lista(r.I), 0.28, 'ponto-solucao');
          e.texto('I', lista(r.I), 'rotulo-ponto', 'start', 0.4, 0.3);
        }
      }

      if (chkPonto.checked) {
        if (!zero(r.distP)) e.linha(pP, pPe, 'segmento-distancia');
        e.ponto(pPe, 0.18, 'ponto-solucao');
        e.ponto(pP, 0.24, 'ponto-a');
        e.texto('P', pP, 'rotulo-ponto', 'start', 0.4, 0.3);
        if (!zero(r.distP)) e.texto('P′', pPe, 'rotulo-ponto', 'start', 0.4, -0.7);
      }
    });
  }


  /* =======================================================================
     6. RESULTADOS
     ======================================================================= */
  function cartaoObjetos(dados, r) {
    const { plano, A, v } = dados;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. O plano e a reta</span>
        <div class="formula">π: ${equacaoPlano(plano)} &nbsp;&nbsp; normal ${VET('n')} = ${terna(dados.n)}, |${VET('n')}| = ${raizComValor(r.nn)}</div>
        <div class="formula">r: ${parametrica('x', A.x, v.x)}, &nbsp; ${parametrica('y', A.y, v.y)}, &nbsp; ${parametrica('z', A.z, v.z)}</div>
      </div>`;
  }

  function cartaoPosicao(dados, r) {
    const { n, A, v, plano } = dados;
    const produto = (a, b) => lista(a).map((c, i) => p(c) + '·' + p(lista(b)[i])).join(' + ');
    const nv = `<div class="formula">${VET('n')} · ${VET('v')} = ${produto(n, v)} = <strong>${formatarNumero(r.nv)}</strong></div>`;
    const nA = `${produto(n, A)} + ${p(plano.d)} = ${formatarNumero(r.nA)}`;

    if (r.posicao === 'concorrente') {
      const graus = radianosParaGraus(r.anguloReta);
      const anguloExato = quaseIgual(graus, Math.round(graus), 1e-6);
      return `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">2. Reta × plano: concorrentes</span>
          ${nv}
          <p>Como ${VET('n')} · ${VET('v')} ≠ 0, a reta <strong>fura</strong> o plano. Substituindo as paramétricas na equação:</p>
          <div class="formula">${termo(r.nA, '', true) || '0'}${termo(r.nv, 't', zero(r.nA))} = 0 &nbsp;⇒&nbsp; t = ${ff(r.t)}</div>
          <div class="formula">I = A + ${fator(r.t)}${VET('v')} = <strong>${ternaBonita(r.I)}</strong></div>
          <p>Ângulo entre a reta e o plano: sen θ = |${formatarNumero(r.nv)}| / (|${VET('n')}|·|${VET('v')}|)
            ⇒ θ ${anguloExato ? '=' : '≈'} <strong>${formatarNumero(graus)}°</strong>${quaseIgual(graus, 90, 1e-6) ? ' (a reta é perpendicular ao plano)' : ''}.</p>
          <p class="lab-dica">O número ${formatarNumero(r.nA)} é o que A "sobra" na equação: n·A + d = ${nA}.</p>
        </div>`;
    }
    const teste = `<p>${VET('n')} · ${VET('v')} = 0: a reta é paralela ao plano <em>ou</em> está contida nele. Testando o ponto A na equação:
      ${nA}.</p>`;
    if (r.posicao === 'contida') {
      return `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">2. Reta × plano: contida</span>
          ${nv}${teste}
          <p>A satisfaz a equação, então <strong>a reta inteira está contida no plano</strong>.</p>
        </div>`;
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">2. Reta × plano: paralelos</span>
        ${nv}${teste}
        <p>A não satisfaz a equação: a reta é <strong>paralela</strong> ao plano e nunca o toca.
          A distância entre eles é |${formatarNumero(r.nA)}| / ${moduloCurto(r.nn)}${igualA(r.distReta)}.</p>
      </div>`;
  }

  function cartaoDistancia(dados, r) {
    const { plano, P } = dados;
    const subst = `${p(plano.a)}·${p(P.x)} + ${p(plano.b)}·${p(P.y)} + ${p(plano.c)}·${p(P.z)} + ${p(plano.d)}`;
    const conclusao = zero(r.distP)
      ? '<p>A distância é zero: <strong>P está no plano</strong>.</p>'
      : `<div class="formula">Pé da perpendicular: P′ = P − ${fator(r.valorP / r.nn)}${VET('n')} = <strong>${ternaBonita(r.pe)}</strong></div>`;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Distância de P${terna(P)} ao plano</span>
        <div class="formula">d = |${subst}| / ${moduloCurto(r.nn)} = |${formatarNumero(r.valorP)}| / ${moduloCurto(r.nn)}${igualA(r.distP)}</div>
        ${conclusao}
      </div>`;
  }


  /* =======================================================================
     7. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const dados = lerTudo();
    if (dados.erro) {
      espaco.definirDesenho(null);
      resultados.innerHTML = '<p class="erro">' + dados.erro + '</p>';
      return;
    }
    const r = calcular(dados);
    desenhar(dados, r);
    resultados.innerHTML = cartaoObjetos(dados, r) + cartaoPosicao(dados, r) + cartaoDistancia(dados, r);
  }

  function preencher(valores) {
    todosOsCampos.forEach((campo, i) => { campo.value = valores[i]; });
    atualizar();
  }


  /* =======================================================================
     8. EVENTOS
     ======================================================================= */
  todosOsCampos.forEach((campo) => campo.addEventListener('input', atualizar));
  [chkNormal, chkReta, chkPonto].forEach((chk) => chk.addEventListener('change', atualizar));

  giro.addEventListener('input', () => espaco.girar(Number(giro.value)));
  btnVista.addEventListener('click', () => espaco.vistaPadrao());

  botoesExemplo.forEach((btn) => {
    btn.addEventListener('click', () => preencher(btn.dataset.g11Exemplo.split(',').map(Number)));
  });

  // Sorteia um plano que passa por um ponto inteiro perto da origem, uma reta e um ponto P.
  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    let a, b, c;
    do { a = inteiro(-2, 2); b = inteiro(-2, 2); c = inteiro(-2, 2); } while (a === 0 && b === 0 && c === 0);
    const Q = [inteiro(-2, 2), inteiro(-2, 2), inteiro(-2, 2)];
    const d = -(a * Q[0] + b * Q[1] + c * Q[2]);
    const A = [inteiro(-3, 3), inteiro(-3, 3), inteiro(-3, 3)];
    let v;
    do { v = [inteiro(-2, 2), inteiro(-2, 2), inteiro(-2, 2)]; } while (v.every((x) => x === 0));
    const P = [inteiro(-3, 3), inteiro(-3, 3), inteiro(-3, 3)];
    preencher([a, b, c, d, ...A, ...v, ...P]);
  });

  atualizar();
})();
