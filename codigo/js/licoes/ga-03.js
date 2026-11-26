/* =========================================================================
   js/licoes/ga-03.js — Geometria Analítica, Lição 3: Circunferência
   Dois caminhos:
   - "Centro e raio": monta a equação reduzida e a desenvolve até a geral;
   - "Equação geral": completa os quadrados e descobre centro e raio
     (ou mostra que a equação é só um ponto, ou nenhum ponto).
   Clicar no plano move o centro.

   Índice
   1. Elementos
   2. Formatação das equações
   3. Leitura dos campos
   4. Desenho
   5. Resultados (contas passo a passo)
   6. Atualização geral
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g3-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 10 });
  const LIMITE_CENTRO = 10;
  const LIMITE_RAIO = 10;
  const LIMITE_DE = 40;    // D e E (centro até ±20)
  const LIMITE_F = 250;    // F = a² + b² − r² pode ser grande com o centro longe

  const campos = {
    a: document.getElementById('g3-a'),
    b: document.getElementById('g3-b'),
    r: document.getElementById('g3-r'),
    d: document.getElementById('g3-d'),
    e: document.getElementById('g3-e'),
    f: document.getElementById('g3-f'),
  };
  const radiosModo = Array.from(document.querySelectorAll('input[name="g3-modo"]'));
  const campoCentro = document.getElementById('g3-campo-centro');
  const campoGeral = document.getElementById('g3-campo-geral');
  const caixaExtremos = document.getElementById('g3-extremos');
  const btnSortear = document.getElementById('g3-sortear');
  const resultados = document.getElementById('g3-resultados');

  const fr = formatarFracao;
  /** Número com parênteses se for negativo ou fração: "(−3)", "(3/2)", "4". */
  function p(x) {
    const texto = fr(x);
    return x < 0 || texto.includes('/') ? '(' + texto + ')' : texto;
  }

  /** "√16 = 4", "√(25/4) = 5/2" ou "√13 ≈ 3,61". */
  function raizTexto(k) {
    const r = Math.sqrt(k);
    const dentro = fr(k).includes('/') ? '(' + fr(k) + ')' : fr(k);
    const exata = !fr(r).includes(',');
    return '√' + dentro + (exata ? ' = ' + fr(r) : ' ≈ ' + formatarNumero(r));
  }

  function modoAtual() {
    const marcado = radiosModo.find((r) => r.checked);
    return marcado ? marcado.value : 'centro';
  }


  /* =======================================================================
     2. FORMATAÇÃO DAS EQUAÇÕES
     ======================================================================= */
  /** " + 4x", " − x", " − 9" (vazio se o coeficiente for zero). */
  function termo(c, variavel) {
    if (quaseIgual(c, 0)) return '';
    const sinal = c < 0 ? ' − ' : ' + ';
    const numero = fr(Math.abs(c));
    return sinal + (variavel && numero === '1' ? '' : numero) + variavel;
  }

  /** "(x − 3)²", "(y + 2)²" ou "x²" — o centro entra com o sinal trocado. */
  function quadrado(variavel, centro) {
    if (quaseIgual(centro, 0)) return variavel + '²';
    return '(' + variavel + (centro > 0 ? ' − ' : ' + ') + fr(Math.abs(centro)) + ')²';
  }

  /** (x − c)² desenvolvido: "x² − 4x + 4". */
  function desenvolvido(variavel, centro) {
    if (quaseIgual(centro, 0)) return variavel + '²';
    return variavel + '²' + termo(-2 * centro, variavel) + termo(centro * centro, '');
  }

  function equacaoGeral(D, E, F) {
    return 'x² + y²' + termo(D, 'x') + termo(E, 'y') + termo(F, '') + ' = 0';
  }

  function equacaoReduzida(a, b, k) {
    return quadrado('x', a) + ' + ' + quadrado('y', b) + ' = ' + fr(k);
  }


  /* =======================================================================
     3. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCampo(campo, minimo, maximo) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || valor < minimo || valor > maximo;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  /**
   * Devolve { a, b, k } com k = r² (pode ser zero ou negativo no modo geral),
   * mais D, E, F, ou { erro: 'texto' }.
   */
  function lerCircunferencia() {
    if (modoAtual() === 'centro') {
      const a = lerCampo(campos.a, -LIMITE_CENTRO, LIMITE_CENTRO);
      const b = lerCampo(campos.b, -LIMITE_CENTRO, LIMITE_CENTRO);
      const r = lerCampo(campos.r, 0, LIMITE_RAIO);
      if (a === null || b === null) return { erro: 'O centro precisa ter a e b de −' + LIMITE_CENTRO + ' a ' + LIMITE_CENTRO + '.' };
      if (r === null) return { erro: 'O raio vai de 0,5 a ' + LIMITE_RAIO + '.' };
      if (r === 0) {
        campos.r.classList.add('erro');
        return { erro: 'Com raio 0 não há circunferência, só o ponto do centro. Use um raio positivo.' };
      }
      const k = r * r;
      return { a, b, k, D: -2 * a, E: -2 * b, F: a * a + b * b - k };
    }
    const D = lerCampo(campos.d, -LIMITE_DE, LIMITE_DE);
    const E = lerCampo(campos.e, -LIMITE_DE, LIMITE_DE);
    const F = lerCampo(campos.f, -LIMITE_F, LIMITE_F);
    if (D === null || E === null || F === null) return { erro: 'Use D e E de −' + LIMITE_DE + ' a ' + LIMITE_DE + ', e F de −' + LIMITE_F + ' a ' + LIMITE_F + '.' };
    const a = -D / 2;
    const b = -E / 2;
    let k = a * a + b * b - F;
    if (quaseIgual(k, 0)) k = 0;
    return { a, b, k, D, E, F };
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function desenhar(c) {
    plano.limpar();
    const { a, b, k } = c;

    if (k > 0) {
      const r = Math.sqrt(k);
      plano.arco(a, b, r, 0, 2 * Math.PI, 'circunferencia');

      // raio: do centro até o ponto mais à direita
      plano.linha(a, b, a + r, b, 'reta reta-perpendicular');
      plano.texto('r', a + r / 2, b + 0.35, 'rotulo-cateto', 'middle');

      if (caixaExtremos.checked) {
        [[a + r, b, 'start', 0.3, -0.6], [a - r, b, 'end', -0.3, -0.6],
         [a, b + r, 'start', 0.3, 0.35], [a, b - r, 'start', 0.3, -0.75]].forEach(([x, y, ancora, dx, dy]) => {
          if (!plano.cabe(x, y)) return;
          plano.ponto(x, y, 0.2, 'ponto ponto-m');
          plano.texto(formatarPonto(x, y), x + dx, y + dy, 'rotulo-cateto', ancora);
        });
      }
    }

    if (k >= 0 && plano.cabe(a, b)) {
      plano.ponto(a, b, 0.28, 'ponto ponto-a');
      plano.texto('C', a - 0.4, b + 0.45, 'rotulo-ponto', 'end');
    }
  }


  /* =======================================================================
     5. RESULTADOS (contas passo a passo)
     ======================================================================= */
  function blocoCentroERaio(c) {
    const { a, b, k, D, E, F } = c;
    const r = Math.sqrt(k);
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">1. Equação reduzida</span>
        <div class="formula">(x − a)² + (y − b)² = r² &nbsp;→&nbsp; <strong>${equacaoReduzida(a, b, k)}</strong></div>
        Centro C${formatarPonto(a, b)} e raio ${fr(r)}, então r² = ${p(r)}² = ${fr(k)}.
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">2. Desenvolvendo os quadrados</span>
        <div class="formula">${quadrado('x', a)} = ${desenvolvido('x', a)}</div>
        <div class="formula">${quadrado('y', b)} = ${desenvolvido('y', b)}</div>
        <div class="formula">${desenvolvido('x', a)} + ${desenvolvido('y', b)} − ${fr(k)} = 0</div>
        <div class="formula">Equação geral: <strong>${equacaoGeral(D, E, F)}</strong></div>
        D = −2a = ${fr(D)}, &nbsp;E = −2b = ${fr(E)} &nbsp;e&nbsp; F = a² + b² − r² = ${fr(a * a)} + ${fr(b * b)} − ${fr(k)} = ${fr(F)}.
      </div>
      ${blocoConferir(c)}`;
  }

  function blocoGeral(c) {
    const { a, b, k, D, E, F } = c;
    const px = (D / 2) * (D / 2);
    const py = (E / 2) * (E / 2);

    const linhaX = quaseIgual(D, 0)
      ? 'Não há termo em x: x² já é um quadrado (o centro tem a = 0).'
      : `x² ${termo(D, 'x').trim()} = ${quadrado('x', a)} − ${fr(px)} &nbsp;&nbsp;<span class="lab-dica">(metade de ${p(D)} é ${fr(D / 2)}, e ${p(D / 2)}² = ${fr(px)})</span>`;
    const linhaY = quaseIgual(E, 0)
      ? 'Não há termo em y: y² já é um quadrado (o centro tem b = 0).'
      : `y² ${termo(E, 'y').trim()} = ${quadrado('y', b)} − ${fr(py)} &nbsp;&nbsp;<span class="lab-dica">(metade de ${p(E)} é ${fr(E / 2)}, e ${p(E / 2)}² = ${fr(py)})</span>`;

    let conclusao;
    if (k > 0) {
      conclusao = `<p><span class="etiqueta etiqueta-verde">Circunferência</span> centro <strong>C${formatarPonto(a, b)}</strong> e raio
        <strong>r = ${raizTexto(k)}</strong>${plano.cabe(a, b) ? '' : ' (o centro fica fora da área do desenho)'}.</p>`;
    } else if (k === 0) {
      conclusao = `<p><span class="etiqueta etiqueta-azul">Um único ponto</span> o lado direito deu 0. Só o ponto
        ${formatarPonto(a, b)} satisfaz a equação (uma "circunferência de raio zero").</p>`;
    } else {
      conclusao = `<p class="erro">O lado direito deu ${fr(k)}, que é negativo. Uma soma de quadrados nunca é negativa:
        <strong>nenhum ponto</strong> satisfaz essa equação, não há o que desenhar.</p>`;
    }

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">1. Equação dada</span>
        <div class="formula">${equacaoGeral(D, E, F)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">2. Completando os quadrados</span>
        <div class="formula">${linhaX}</div>
        <div class="formula">${linhaY}</div>
        <div class="formula">${quadrado('x', a)}${quaseIgual(px, 0) ? '' : ' − ' + fr(px)} + ${quadrado('y', b)}${quaseIgual(py, 0) ? '' : ' − ' + fr(py)}${termo(F, '')} = 0</div>
        <div class="formula"><strong>${equacaoReduzida(a, b, k)}</strong></div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Conclusão</span>
        ${conclusao}
        <p class="lab-dica">Atalho: a = −D/2 = ${fr(a)}, &nbsp;b = −E/2 = ${fr(b)}, &nbsp;r² = a² + b² − F = ${fr(a * a)} + ${fr(b * b)} − ${p(F)} = ${fr(k)}.</p>
      </div>
      ${k > 0 ? blocoConferir(c) : ''}`;
  }

  /** Substitui o ponto mais à direita na equação geral para mostrar que dá 0. */
  function blocoConferir(c) {
    const { a, b, k, D, E, F } = c;
    const x = a + Math.sqrt(k);
    const y = b;
    const valor = x * x + y * y + D * x + E * y + F;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">Conferindo um ponto</span>
        O ponto mais à direita, ${formatarPonto(x, y)}, fica a uma distância r do centro. Na equação geral:
        <div class="formula">${p(x)}² + ${p(y)}² + ${p(D)}·${p(x)} + ${p(E)}·${p(y)} + ${p(F)} = ${fr(quaseIgual(valor, 0) ? 0 : valor)} ✓</div>
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const geral = modoAtual() === 'geral';
    campoCentro.disabled = geral;
    campoGeral.disabled = !geral;
    campoCentro.classList.toggle('inativo', geral);
    campoGeral.classList.toggle('inativo', !geral);

    const c = lerCircunferencia();
    if (c.erro) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">' + c.erro + '</p>';
      return;
    }
    desenhar(c);
    resultados.innerHTML = geral ? blocoGeral(c) : blocoCentroERaio(c);
  }

  /** Mantém os dois grupos de campos descrevendo a mesma circunferência. */
  function sincronizar(c) {
    if (!c || c.erro) return;
    campos.d.value = arredondarCampo(c.D);
    campos.e.value = arredondarCampo(c.E);
    campos.f.value = arredondarCampo(c.F);
    if (c.k > 0) {
      campos.a.value = arredondarCampo(c.a);
      campos.b.value = arredondarCampo(c.b);
      campos.r.value = arredondarCampo(Math.sqrt(c.k));
    }
  }

  function arredondarCampo(v) {
    return String(Math.round(v * 1000) / 1000);
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  caixaExtremos.addEventListener('change', atualizar);

  // Ao trocar de modo, os campos do outro modo recebem a mesma circunferência.
  radiosModo.forEach((r) => r.addEventListener('change', () => {
    const antes = r.value === 'geral' ? 'centro' : 'geral';
    radiosModo.forEach((x) => { x.checked = x.value === antes; });
    sincronizar(lerCircunferencia());
    radiosModo.forEach((x) => { x.checked = x === r; });
    atualizar();
  }));

  // Clique no plano: move o centro, mantendo o raio.
  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    const c = lerCircunferencia();
    const k = !c.erro && c.k > 0 ? c.k : 9;
    campos.a.value = x;
    campos.b.value = y;
    campos.r.value = arredondarCampo(Math.sqrt(k));
    sincronizar({ a: x, b: y, k, D: -2 * x, E: -2 * y, F: x * x + y * y - k });
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const a = inteiro(-5, 5);
    const b = inteiro(-5, 5);
    const r = inteiro(1, 5);
    let k = r * r;
    // No modo geral, de vez em quando sorteia uma equação sem pontos.
    if (modoAtual() === 'geral' && Math.random() < 0.2) k = -inteiro(1, 9);
    const c = { a, b, k, D: -2 * a, E: -2 * b, F: a * a + b * b - k };
    if (k > 0) {
      campos.a.value = a; campos.b.value = b; campos.r.value = r;
    }
    campos.d.value = c.D; campos.e.value = c.E; campos.f.value = c.F;
    atualizar();
  });

  atualizar();
})();
