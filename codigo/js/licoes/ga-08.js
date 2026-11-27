/* =========================================================================
   js/licoes/ga-08.js — Geometria Analítica, Lição 8: Reconhecendo cônicas
   Recebe os coeficientes de Ax² + Cy² + Dx + Ey + F = 0 e:
     1. aplica a regra dos quadrados (sinal de A·C) para achar o tipo provável;
     2. completa os quadrados e chega à equação reduzida;
     3. conclui o tipo de verdade (inclusive os casos degenerados: ponto,
        nenhum ponto, duas retas) e desenha a curva com centro/vértice e focos.

   Índice
   1. Elementos
   2. Textos (frações, termos, quadrados)
   3. Leitura dos campos
   4. Análise da equação
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
  const svg = document.getElementById('g8-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 9 });
  const L = 30; // "infinito" para desenhar retas e ramos (o SVG corta o resto)

  const campos = {
    A: document.getElementById('g8-A'),
    C: document.getElementById('g8-C'),
    D: document.getElementById('g8-D'),
    E: document.getElementById('g8-E'),
    F: document.getElementById('g8-F'),
  };
  const LIMITES = { A: 100, C: 100, D: 100, E: 100, F: 200 };
  const saidaEquacao = document.getElementById('g8-equacao');
  const btnSortear = document.getElementById('g8-sortear');
  const botoesExemplo = Array.from(document.querySelectorAll('[data-g8-exemplo]'));
  const resultados = document.getElementById('g8-resultados');


  /* =======================================================================
     2. TEXTOS
     ======================================================================= */
  function limpo(v) {
    const r = Math.round(v);
    if (Math.abs(v - r) < 1e-9) return r === 0 ? 0 : r;
    return v;
  }
  const ff = (x) => formatarFracao(limpo(x));
  const zero = (x) => Math.abs(x) < 1e-12;

  /** Um termo com sinal: (3, 'x', true) → "3x"; (−1, 'y²') → " − y²"; (5, '') → " + 5". */
  function termo(coef, v, primeiro) {
    if (zero(coef)) return '';
    const sinal = coef < 0 ? (primeiro ? '−' : ' − ') : (primeiro ? '' : ' + ');
    const txt = ff(Math.abs(coef));
    const num = v && txt === '1' ? '' : (v && txt.includes('/') ? '(' + txt + ')' : txt);
    return sinal + num + v;
  }

  /** Junta termos [coef, variável]; se todos forem zero, devolve "0". */
  function expressao(termos) {
    let txt = '';
    termos.forEach(([c, v]) => { txt += termo(c, v, txt === ''); });
    return txt || '0';
  }

  /** "(x − 2)" ou "x" (parênteses só quando há deslocamento). */
  function fator(variavel, centro) {
    if (zero(centro)) return variavel;
    return '(' + variavel + (centro > 0 ? ' − ' : ' + ') + ff(Math.abs(centro)) + ')';
  }
  const quadrado = (variavel, centro) => fator(variavel, centro) + '²';

  /** "y − 1" ou "y" (sem parênteses, para o lado esquerdo de uma reta). */
  function ladoEsquerdo(variavel, centro) {
    if (zero(centro)) return variavel;
    return variavel + (centro > 0 ? ' − ' : ' + ') + ff(Math.abs(centro));
  }

  /** Coeficiente na frente de um parêntese: 1 → "", −1 → "−", 4 → "4". */
  const coefFrente = (c) => coeficiente(limpo(c));

  /** "4(x² − 4x)" ou "4x²" quando não há termo de 1º grau. */
  function grupo(Q, variavel, linear) {
    if (zero(linear)) return coefFrente(Q) + variavel + '²';
    const dentro = variavel + '²' + termo(linear / Q, variavel);
    return coefFrente(Q) === '' ? dentro : coefFrente(Q) + '(' + dentro + ')';
  }

  /** Denominador: "9", ou "(25/2)" quando é fração. */
  const den = (v) => (ff(v).includes('/') ? '(' + ff(v) + ')' : ff(v));

  /** Número na frente de uma variável: 1 → "", 1/2 → "(1/2)", 3 → "3·". */
  const multiplica = (v) => (ff(v) === '1' ? '' : (ff(v).includes('/') ? '(' + ff(v) + ')' : ff(v) + '·'));

  /** "Dividindo por 36: " (ou só o resto, quando o divisor é 1). */
  const dividindo = (v, resto) => (quaseIgual(v, 1)
    ? (resto ? resto.charAt(0).toUpperCase() + resto.slice(1) + ': ' : '')
    : 'Dividindo por ' + ff(v) + (resto ? ' e ' + resto : '') + ': ');

  /** Junta dois blocos de texto com o sinal certo: "4(...)" e "−9(...)" → "4(...) − 9(...)". */
  function juntar(a, b) {
    return b.startsWith('−') ? a + ' − ' + b.slice(1) : a + ' + ' + b;
  }

  /** Soma de números escrita por extenso: [−61, 16, 81] → "−61 + 16 + 81". */
  function soma(valores) {
    const usados = valores.filter((v) => !zero(v));
    if (!usados.length) return '0';
    return usados.map((v, i) => termo(v, '', i === 0)).join('');
  }

  /** "√13 ≈ 3,61", "5", "√(25/4) = 5/2"... */
  function raiz(v) {
    const r = Math.sqrt(v);
    if (quaseIgual(r * 1, Math.round(r), 1e-9)) return formatarNumero(Math.round(r));
    if (quaseIgual(v, Math.round(v), 1e-9)) return textoRaiz(v) + ' ≈ ' + formatarNumero(r);
    const fr = formatarFracao(r);
    if (fr.includes('/')) return fr;
    return '√(' + ff(v) + ') ≈ ' + formatarNumero(r);
  }

  const ponto = (x, y) => formatarPonto(Math.round(x * 100) / 100, Math.round(y * 100) / 100);

  /** Coordenada "h ± c" com c possivelmente irracional. */
  function maisMenos(centro, sinal, c2) {
    const c = Math.sqrt(c2);
    if (quaseIgual(c, Math.round(c), 1e-9) || !quaseIgual(c2, Math.round(c2), 1e-9) || !Number.isInteger(limpo(centro))) {
      return formatarNumero(centro + sinal * c);
    }
    const ct = textoRaiz(c2);
    if (zero(centro)) return (sinal < 0 ? '−' : '') + ct;
    return ff(centro) + (sinal < 0 ? ' − ' : ' + ') + ct;
  }
  function pontoFoco(horizontal, h, k, sinal, c2) {
    return horizontal
      ? '(' + maisMenos(h, sinal, c2) + '; ' + formatarNumero(k) + ')'
      : '(' + formatarNumero(h) + '; ' + maisMenos(k, sinal, c2) + ')';
  }


  /* =======================================================================
     3. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCoeficientes() {
    const valores = {};
    let erro = null;
    Object.entries(campos).forEach(([nome, campo]) => {
      const v = lerNumero(campo.value);
      const invalido = Number.isNaN(v) || Math.abs(v) > LIMITES[nome];
      campo.classList.toggle('erro', invalido);
      if (invalido && !erro) erro = 'O coeficiente ' + nome + ' precisa ser um número de −' + LIMITES[nome] + ' a ' + LIMITES[nome] + '.';
      valores[nome] = v;
    });
    return erro ? { erro } : valores;
  }

  function equacaoGeral({ A, C, D, E, F }) {
    return expressao([[A, 'x²'], [C, 'y²'], [D, 'x'], [E, 'y'], [F, '']]) + ' = 0';
  }


  /* =======================================================================
     4. ANÁLISE DA EQUAÇÃO
     Devolve { provavel, regra, passos[], tipo, degenerada, elementos[], desenho }.
     ======================================================================= */
  function analisar({ A, C, D, E, F }) {
    const r = { passos: [], elementos: [], degenerada: false, desenho: { forma: 'vazio' } };

    // 1. regra dos quadrados
    if (zero(A) && zero(C)) {
      r.provavel = 'nenhuma cônica';
      r.regra = 'A = C = 0: não há x² nem y², então a equação é de 1º grau.';
    } else if (!zero(A) && !zero(C) && quaseIgual(A, C)) {
      r.provavel = 'circunferência';
      r.regra = 'A = C = ' + ff(A) + ': coeficientes de x² e y² iguais.';
    } else if (A * C > 0) {
      r.provavel = 'elipse';
      r.regra = 'A·C = ' + formatarComParenteses(limpo(A)) + '·' + formatarComParenteses(limpo(C)) + ' = ' + ff(A * C) + ' &gt; 0, com A ≠ C: mesmo sinal.';
    } else if (A * C < 0) {
      r.provavel = 'hipérbole';
      r.regra = 'A·C = ' + formatarComParenteses(limpo(A)) + '·' + formatarComParenteses(limpo(C)) + ' = ' + ff(A * C) + ' &lt; 0: sinais opostos.';
    } else {
      r.provavel = 'parábola';
      r.regra = 'A·C = 0: só ' + (zero(C) ? 'x²' : 'y²') + ' aparece.';
    }

    // 2. completando os quadrados
    if (zero(A) && zero(C)) return analisarReta(r, D, E, F);
    if (zero(C)) return analisarParabola(r, { Q: A, Lq: D, Lo: E, F, sq: 'x', ot: 'y' });
    if (zero(A)) return analisarParabola(r, { Q: C, Lq: E, Lo: D, F, sq: 'y', ot: 'x' });
    return analisarCentrada(r, { A, C, D, E, F });
  }

  /** A = C = 0: sobra Dx + Ey + F = 0. */
  function analisarReta(r, D, E, F) {
    if (zero(D) && zero(E)) {
      r.passos.push('Sobra só ' + ff(F) + ' = 0.');
      r.tipo = zero(F) ? 'todos os pontos do plano (0 = 0)' : 'nenhum ponto';
      r.degenerada = true;
      return r;
    }
    r.passos.push('Sobra ' + expressao([[D, 'x'], [E, 'y'], [F, '']]) + ' = 0, que é a equação geral de uma reta.');
    r.tipo = 'uma reta (não é cônica)';
    r.degenerada = true;
    r.desenho = { forma: 'retas', retas: [[D, E, -F]] };
    return r;
  }

  /** Circunferência, elipse ou hipérbole (A e C diferentes de 0). */
  function analisarCentrada(r, { A, C, D, E, F }) {
    const h = limpo(-D / (2 * A));
    const k = limpo(-E / (2 * C));
    const R = limpo(A * h * h + C * k * k - F);

    r.passos.push(juntar(grupo(A, 'x', D), grupo(C, 'y', E)) + ' = ' + ff(-F));
    r.passos.push(
      juntar(coefFrente(A) + quadrado('x', h), coefFrente(C) + quadrado('y', k)) +
      ' = ' + soma([-F, A * h * h, C * k * k]) + (zero(A * h * h) && zero(C * k * k) ? '' : ' = ' + ff(R))
    );
    r.desenho = { forma: 'vazio', h, k };

    if (A * C > 0) {
      // circunferência ou elipse
      if (zero(R)) {
        r.tipo = 'um só ponto: ' + formatarPonto(h, k);
        r.degenerada = true;
        r.passos.push('O lado direito é 0, e uma soma de quadrados (com o mesmo sinal) só zera quando os dois são 0.');
        r.desenho = { forma: 'ponto', h, k };
        return r;
      }
      if (R / A < 0) {
        r.tipo = 'nenhum ponto';
        r.degenerada = true;
        r.passos.push('Os dois lados têm sinais incompatíveis: ' + (A > 0 ? 'a esquerda nunca é negativa e a direita é ' + ff(R) : 'a esquerda nunca é positiva e a direita é ' + ff(R)) + '.');
        return r;
      }
      const ax2 = limpo(R / A), ay2 = limpo(R / C);
      if (quaseIgual(A, C)) {
        r.passos.push(dividindo(A) + '<strong>' + quadrado('x', h) + ' + ' + quadrado('y', k) + ' = ' + ff(ax2) + '</strong>');
        r.tipo = 'circunferência';
        r.elementos.push('Centro ' + ponto(h, k) + '.');
        r.elementos.push('r² = ' + ff(ax2) + ', então o raio é <strong>r = ' + raiz(ax2) + '</strong>.');
        r.elementos.push('Excentricidade e = 0.');
        r.desenho = { forma: 'elipse', h, k, sx: Math.sqrt(ax2), sy: Math.sqrt(ay2), circulo: true, focos: [] };
        return r;
      }
      r.passos.push(dividindo(R) + '<strong>' + quadrado('x', h) + '/' + den(ax2) + ' + ' + quadrado('y', k) + '/' + den(ay2) + ' = 1</strong>');
      const horizontal = ax2 > ay2;
      const a2 = Math.max(ax2, ay2), b2 = Math.min(ax2, ay2), c2 = limpo(a2 - b2);
      r.tipo = 'elipse';
      r.elementos.push('Centro ' + ponto(h, k) + '; eixo maior <strong>' + (horizontal ? 'horizontal' : 'vertical') + '</strong> (o maior denominador está sob ' + (horizontal ? 'x' : 'y') + ').');
      r.elementos.push('a² = ' + ff(a2) + ' e b² = ' + ff(b2) + ': a = ' + raiz(a2) + ', b = ' + raiz(b2) + '.');
      r.elementos.push('c² = a² − b² = ' + ff(c2) + ', c = ' + raiz(c2) + '. Focos ' + pontoFoco(horizontal, h, k, -1, c2) + ' e ' + pontoFoco(horizontal, h, k, 1, c2) + '.');
      r.elementos.push('Excentricidade e = c/a ≈ ' + formatarNumero(Math.sqrt(c2 / a2)) + ' (entre 0 e 1).');
      const c = Math.sqrt(c2);
      r.desenho = {
        forma: 'elipse', h, k, sx: Math.sqrt(ax2), sy: Math.sqrt(ay2),
        focos: horizontal ? [[h - c, k], [h + c, k]] : [[h, k - c], [h, k + c]],
      };
      return r;
    }

    // hipérbole
    if (zero(R)) {
      const m2 = limpo(-A / C);
      const m = Math.sqrt(m2);
      const mTxt = raiz(m2).split(' ≈')[0];
      r.passos.push('O lado direito é 0: ' + coefFrente(A) + quadrado('x', h) + ' = ' + coefFrente(-C) + quadrado('y', k) +
        ' ⇒ ' + quadrado('y', k) + ' = ' + multiplica(m2) + quadrado('x', h) + '.');
      r.tipo = 'duas retas concorrentes';
      r.degenerada = true;
      r.elementos.push('Tirando a raiz: <strong>' + ladoEsquerdo('y', k) + ' = ±' + (mTxt === '1' ? '' : (mTxt.includes('/') ? '(' + mTxt + ')' : mTxt)) + fator('x', h) + '</strong>' + (mTxt.startsWith('√') ? ' (inclinação ≈ ±' + formatarNumero(m) + ')' : '') + '.');
      r.elementos.push('As retas se cruzam em ' + ponto(h, k) + ': são as "assíntotas" de uma hipérbole que encostou nelas.');
      r.desenho = { forma: 'retas', h, k, retas: [[-m, 1, k - m * h], [m, 1, k + m * h]] };
      return r;
    }
    const horizontal = R / A > 0;
    const a2 = limpo(horizontal ? R / A : R / C);
    const b2 = limpo(horizontal ? -R / C : -R / A);
    const c2 = limpo(a2 + b2);
    const positivo = horizontal ? quadrado('x', h) : quadrado('y', k);
    const negativo = horizontal ? quadrado('y', k) : quadrado('x', h);
    r.passos.push(dividindo(R, 'pondo o termo positivo na frente') + '<strong>' + positivo + '/' + den(a2) + ' − ' + negativo + '/' + den(b2) + ' = 1</strong>');
    r.tipo = 'hipérbole';
    const a = Math.sqrt(a2), b = Math.sqrt(b2), c = Math.sqrt(c2);
    const inc = horizontal ? b / a : a / b;
    const incTxt = formatarFracao(inc);
    r.elementos.push('Centro ' + ponto(h, k) + '; eixo real <strong>' + (horizontal ? 'horizontal' : 'vertical') + '</strong> (o termo positivo é o de ' + (horizontal ? 'x' : 'y') + ').');
    r.elementos.push('a² = ' + ff(a2) + ' e b² = ' + ff(b2) + ': a = ' + raiz(a2) + ', b = ' + raiz(b2) + '.');
    r.elementos.push('c² = a² + b² = ' + ff(c2) + ', c = ' + raiz(c2) + '. Focos ' + pontoFoco(horizontal, h, k, -1, c2) + ' e ' + pontoFoco(horizontal, h, k, 1, c2) + '.');
    r.elementos.push('Assíntotas: ' + ladoEsquerdo('y', k) + ' = ±' + (incTxt === '1' ? '' : (incTxt.includes('/') ? '(' + incTxt + ')' : incTxt)) + fator('x', h) + '.');
    r.elementos.push('Excentricidade e = c/a ≈ ' + formatarNumero(c / a) + ' (maior que 1).');
    r.desenho = {
      forma: 'hiperbole', h, k, a, b, horizontal,
      focos: horizontal ? [[h - c, k], [h + c, k]] : [[h, k - c], [h, k + c]],
    };
    return r;
  }

  /**
   * Parábola (só um quadrado). Q·sq² + Lq·sq + Lo·ot + F = 0,
   * onde sq é a variável ao quadrado e ot a outra.
   */
  function analisarParabola(r, { Q, Lq, Lo, F, sq, ot }) {
    const c0 = limpo(-Lq / (2 * Q));     // coordenada do eixo (em sq)
    const sobra = limpo(Q * c0 * c0 - F); // Q(sq − c0)² = −Lo·ot + sobra
    const vertice = (s, o) => (sq === 'x' ? [s, o] : [o, s]);

    r.passos.push(grupo(Q, sq, Lq) + ' = ' + expressao([[-Lo, ot], [-F, '']]));
    r.passos.push(coefFrente(Q) + quadrado(sq, c0) + ' = ' + expressao([[-Lo, ot], [sobra, '']]) +
      (zero(Q * c0 * c0) ? '' : ' &nbsp;(somando ' + ff(Q * c0 * c0) + ' dos dois lados)'));

    if (zero(Lo)) {
      // não há o termo de 1º grau da outra variável: retas paralelas, uma reta ou nada
      const S = limpo(sobra / Q);
      if (!quaseIgual(Q, 1)) r.passos.push(dividindo(Q) + quadrado(sq, c0) + ' = ' + ff(S));
      r.degenerada = true;
      if (S < 0) {
        r.tipo = 'nenhum ponto';
        r.passos.push('Um quadrado não pode ser negativo.');
        return r;
      }
      if (zero(S)) {
        r.tipo = 'uma reta (contada duas vezes)';
        r.elementos.push('<strong>' + sq + ' = ' + ff(c0) + '</strong>.');
        r.desenho = { forma: 'retas', retas: [sq === 'x' ? [1, 0, c0] : [0, 1, c0]] };
        return r;
      }
      const s = Math.sqrt(S);
      const sTxt = raiz(S).split(' ≈')[0];
      r.tipo = 'duas retas paralelas';
      r.elementos.push(ladoEsquerdo(sq, c0) + ' = ±' + sTxt + ' ⇒ <strong>' + sq + ' = ' + formatarNumero(c0 - s) + '</strong> e <strong>' + sq + ' = ' + formatarNumero(c0 + s) + '</strong>.');
      r.desenho = {
        forma: 'retas',
        retas: sq === 'x' ? [[1, 0, c0 - s], [1, 0, c0 + s]] : [[0, 1, c0 - s], [0, 1, c0 + s]],
      };
      return r;
    }

    const quatroP = limpo(-Lo / Q);
    const v0 = limpo(sobra / Lo);
    const p = limpo(quatroP / 4);
    r.passos.push(dividindo(Q, 'pondo ' + ff(quatroP) + ' em evidência') + '<strong>' + quadrado(sq, c0) + ' = ' +
      ff(quatroP) + '·' + fator(ot, v0) + '</strong>');
    r.tipo = 'parábola';
    const [vx, vy] = vertice(c0, v0);
    const [fx, fy] = vertice(c0, v0 + p);
    const sentido = sq === 'x' ? (p > 0 ? 'para cima' : 'para baixo') : (p > 0 ? 'para a direita' : 'para a esquerda');
    r.elementos.push('Vértice ' + ponto(vx, vy) + '; eixo de simetria ' + sq + ' = ' + ff(c0) + ' (' + (sq === 'x' ? 'vertical' : 'horizontal') + '), abre ' + sentido + '.');
    r.elementos.push('4p = ' + ff(quatroP) + ', então p = ' + ff(p) + '.');
    r.elementos.push('Foco ' + ponto(fx, fy) + ' e diretriz ' + ot + ' = ' + ff(v0 - p) + '.');
    r.elementos.push('Excentricidade e = 1.');
    r.desenho = { forma: 'parabola', sq, c0, v0, p, foco: [fx, fy], vertice: [vx, vy] };
    return r;
  }


  /* =======================================================================
     5. DESENHO
     ======================================================================= */
  function desenhar(d) {
    plano.limpar();

    if (d.forma === 'elipse') {
      const pts = [];
      for (let t = 0; t <= 2 * Math.PI + 0.001; t += 0.03) pts.push([d.h + d.sx * Math.cos(t), d.k + d.sy * Math.sin(t)]);
      plano.poligonal(pts, d.circulo ? 'circunferencia' : 'elipse');
    }

    if (d.forma === 'hiperbole') {
      const mapa = (u, w) => (d.horizontal ? [d.h + u, d.k + w] : [d.h + w, d.k + u]);
      [1, -1].forEach((s) => {
        const A = mapa(-L, -s * L * d.b / d.a), B = mapa(L, s * L * d.b / d.a);
        plano.linha(A[0], A[1], B[0], B[1], 'assintota');
      });
      [1, -1].forEach((s) => {
        const pts = [];
        for (let t = -4; t <= 4.0001; t += 0.04) {
          const q = mapa(s * d.a * Math.cosh(t), d.b * Math.sinh(t));
          if (Math.abs(q[0]) < L && Math.abs(q[1]) < L) pts.push(q);
        }
        plano.poligonal(pts, 'hiperbole');
      });
    }

    if (d.forma === 'parabola') {
      const pts = [];
      for (let s = -L; s <= L; s += 0.05) {
        const o = d.v0 + (s - d.c0) * (s - d.c0) / (4 * d.p);
        if (Math.abs(o) < L) pts.push(d.sq === 'x' ? [s, o] : [o, s]);
      }
      plano.poligonal(pts, 'parabola');
      // diretriz
      if (d.sq === 'x') plano.reta(0, 1, d.v0 - d.p, 'assintota');
      else plano.reta(1, 0, d.v0 - d.p, 'assintota');
      const [vx, vy] = d.vertice;
      if (plano.cabe(vx, vy)) plano.ponto(vx, vy, 0.2, 'ponto ponto-m');
      const [fx, fy] = d.foco;
      if (plano.cabe(fx, fy)) {
        plano.ponto(fx, fy, 0.24, 'ponto ponto-solucao');
        plano.texto('F', fx + 0.4, fy + 0.4, 'rotulo-ponto', 'start');
      }
    }

    if (d.forma === 'retas') {
      d.retas.forEach(([a, b, c]) => plano.reta(a, b, c, 'hiperbole'));
    }

    if (d.forma === 'ponto') {
      plano.ponto(d.h, d.k, 0.3, 'ponto ponto-solucao');
    }

    // centro e focos (elipse, circunferência, hipérbole)
    if ((d.forma === 'elipse' || d.forma === 'hiperbole') && plano.cabe(d.h, d.k)) {
      plano.ponto(d.h, d.k, 0.2, 'ponto ponto-m');
      plano.texto('O', d.h - 0.35, d.k - 0.7, 'rotulo-ponto', 'end');
    }
    (d.focos || []).forEach(([x, y], i) => {
      if (!plano.cabe(x, y)) return;
      plano.ponto(x, y, 0.24, 'ponto ponto-solucao');
      plano.texto('F' + (i + 1), x + 0.3, y - 0.8, 'rotulo-ponto', 'middle');
    });
  }


  /* =======================================================================
     6. RESULTADOS
     ======================================================================= */
  function montarResultados(r) {
    const confere = r.tipo === r.provavel;
    const conclusao = r.degenerada
      ? 'A regra apontava <strong>' + r.provavel + '</strong>, mas a equação representa <strong>' + r.tipo + '</strong>: é um caso degenerado.'
      : 'É mesmo uma <strong>' + r.tipo + '</strong>' + (confere ? ', como a regra dos quadrados indicava ✓' : '') + '.';

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Regra dos quadrados</span>
        <p>${r.regra}</p>
        <div class="formula">Tipo provável: <strong>${r.provavel}</strong></div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">2. Completando os quadrados</span>
        ${r.passos.map((p) => '<div class="formula">' + p + '</div>').join('')}
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">3. Conclusão</span>
        <p>${conclusao}</p>
        ${r.elementos.length ? '<ul>' + r.elementos.map((e) => '<li>' + e + '</li>').join('') + '</ul>' : ''}
      </div>`;
  }


  /* =======================================================================
     7. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const coefs = lerCoeficientes();
    if (coefs.erro) {
      plano.limpar();
      saidaEquacao.textContent = '';
      resultados.innerHTML = '<p class="erro">' + coefs.erro + '</p>';
      return;
    }
    saidaEquacao.innerHTML = 'Equação: <strong>' + equacaoGeral(coefs) + '</strong>';
    const r = analisar(coefs);
    desenhar(r.desenho);
    resultados.innerHTML = montarResultados(r);
  }

  function preencher(A, C, D, E, F) {
    campos.A.value = A; campos.C.value = C; campos.D.value = D; campos.E.value = E; campos.F.value = F;
    atualizar();
  }


  /* =======================================================================
     8. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));

  botoesExemplo.forEach((btn) => {
    btn.addEventListener('click', () => preencher(...btn.dataset.g8Exemplo.split(',').map(Number)));
  });

  // Sorteia uma cônica com centro/vértice inteiro e coeficientes inteiros
  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const h = inteiro(-2, 2), k = inteiro(-2, 2);
    let a = inteiro(1, 4), b = inteiro(1, 4);
    let A, C, D, E, F;
    switch (inteiro(0, 3)) {
      case 0: // circunferência (x − h)² + (y − k)² = a²
        A = 1; C = 1; D = -2 * h; E = -2 * k; F = h * h + k * k - a * a;
        break;
      case 1: // elipse b²(x − h)² + a²(y − k)² = a²b², com a ≠ b
        if (a === b) b = a === 4 ? 3 : a + 1;
        A = b * b; C = a * a; D = -2 * b * b * h; E = -2 * a * a * k; F = b * b * h * h + a * a * k * k - a * a * b * b;
        break;
      case 2: // hipérbole, eixo real horizontal ou vertical
        if (Math.random() < 0.5) {
          A = b * b; C = -a * a; D = -2 * b * b * h; E = 2 * a * a * k; F = b * b * h * h - a * a * k * k - a * a * b * b;
        } else {
          A = -a * a; C = b * b; D = 2 * a * a * h; E = -2 * b * b * k; F = b * b * k * k - a * a * h * h - a * a * b * b;
        }
        break;
      default: { // parábola (x − h)² = q(y − k) ou (y − k)² = q(x − h)
        const q = inteiro(1, 6) * (Math.random() < 0.5 ? -1 : 1);
        if (Math.random() < 0.5) {
          A = 1; C = 0; D = -2 * h; E = -q; F = h * h + q * k;
        } else {
          A = 0; C = 1; E = -2 * k; D = -q; F = k * k + q * h;
        }
      }
    }
    // simplifica pelo mdc e, às vezes, troca todos os sinais (o tipo não muda)
    const m = [A, C, D, E, F].reduce((x, y) => mdc(x, y));
    const sinal = Math.random() < 0.3 ? -1 : 1;
    const ajusta = (v) => limpo((sinal * v) / (m || 1));
    preencher(ajusta(A), ajusta(C), ajusta(D), ajusta(E), ajusta(F));
  });

  atualizar();
})();
