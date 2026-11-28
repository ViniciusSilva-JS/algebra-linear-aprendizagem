/* =========================================================================
   js/licoes/licao-12.js — Laboratório da Lição 12: Aplicação com dados reais
   Ajusta uma reta ou uma parábola à população do Brasil nos censos do IBGE
   (1940–2022) por mínimos quadrados. Mostra as matrizes A e b, as equações
   normais Aᵀ·A·x = Aᵀ·b resolvidas por Gauss-Jordan, o gráfico com a curva e
   os resíduos, o R², uma previsão e um teste escondendo o censo de 2022.

   Fonte dos dados: IBGE, Censos Demográficos. SIDRA, tabela 1286
   (População, 1940 a 2010) e tabela 4709 (População residente, 2022).

   Índice
   1. Dados
   2. Elementos e estado
   3. Formatação
   4. Gráfico (SVG)
   5. Dica ao passar o mouse
   6. Resultados (contas e análise)
   7. Atualização geral
   8. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. DADOS
     ======================================================================= */
  const CENSOS = [
    { ano: 1940, populacao: 41236315 },
    { ano: 1950, populacao: 51944397 },
    { ano: 1960, populacao: 70992343 },
    { ano: 1970, populacao: 94508583 },
    { ano: 1980, populacao: 121150573 },
    { ano: 1991, populacao: 146917459 },
    { ano: 2000, populacao: 169590693 },
    { ano: 2010, populacao: 190755799 },
    { ano: 2022, populacao: 203080756 },
  ];
  const ANO_BASE = 1940;
  const anoParaT = (ano) => (ano - ANO_BASE) / 10;       // décadas desde 1940
  const milhoes = (pessoas) => pessoas / 1e6;


  /* =======================================================================
     2. ELEMENTOS E ESTADO
     ======================================================================= */
  const svg = document.getElementById('l12-grafico');
  if (!svg) return;

  const radiosModelo = Array.from(document.querySelectorAll('input[name="l12-modelo"]'));
  const entradaAno = document.getElementById('l12-ano');
  const caixaResiduos = document.getElementById('l12-residuos');
  const caixaValidar = document.getElementById('l12-validar');
  const dica = document.getElementById('l12-dica');
  const resultados = document.getElementById('l12-resultados');

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const LARGURA = 640;
  const ALTURA = 380;
  const MARGEM = { esquerda: 52, direita: 18, topo: 22, base: 36 };


  /* =======================================================================
     3. FORMATAÇÃO
     ======================================================================= */
  const n2 = (x) => formatarNumero(x, 2);
  const n4 = (x) => formatarNumero(x, 4);
  const comSinal = (x) => (x >= 0 ? '+' : '') + n2(x);
  // sempre 2 casas (para a tabela ficar alinhada): 2.8 → "2,80"
  const fixo2 = (x) => (Math.abs(x) < 0.005 ? 0 : x)
    .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('-', '−');
  const fixo2Sinal = (x) => (x >= 0 ? '+' : '') + fixo2(x);

  /** P(t) = c₀ + c₁·t + c₂·t², com os sinais no lugar certo. */
  function formatarModelo(coefs, casas) {
    const potencias = ['', '·t', '·t²'];
    return 'P(t) = ' + coefs.map((c, k) => {
      const valor = formatarNumero(Math.abs(c), casas) + potencias[k];
      if (k === 0) return (c < 0 ? '−' : '') + valor;
      return (c < 0 ? ' − ' : ' + ') + valor;
    }).join('');
  }

  function grauAtual() {
    const marcado = radiosModelo.find((r) => r.checked);
    return marcado ? Number(marcado.value) : 1;
  }

  function anoPrevisao() {
    const ano = Math.round(lerNumero(entradaAno.value));
    if (!Number.isFinite(ano)) return null;
    return Math.min(2100, Math.max(1940, ano));
  }


  /* =======================================================================
     4. GRÁFICO (SVG)
     ======================================================================= */
  function criar(tag, atributos, pai) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(atributos).forEach((k) => el.setAttribute(k, atributos[k]));
    (pai || svg).appendChild(el);
    return el;
  }

  function texto(conteudo, atributos, pai) {
    const el = criar('text', atributos, pai);
    el.textContent = conteudo;
    return el;
  }

  /** Escalas: ano → x em pixels; milhões → y em pixels. */
  function criarEscalas(anoMax, yMax) {
    const x0 = MARGEM.esquerda;
    const x1 = LARGURA - MARGEM.direita;
    const y0 = ALTURA - MARGEM.base;
    const y1 = MARGEM.topo;
    const anoMin = 1935;
    return {
      anoMin: anoMin, anoMax: anoMax, yMax: yMax,
      x: (ano) => x0 + ((ano - anoMin) / (anoMax - anoMin)) * (x1 - x0),
      y: (valor) => y0 - (valor / yMax) * (y0 - y1),
      x0: x0, x1: x1, y0: y0, y1: y1,
    };
  }

  function desenharEixos(e) {
    const passoY = e.yMax <= 300 ? 50 : 100;
    for (let v = 0; v <= e.yMax + 1e-9; v += passoY) {
      criar('line', { x1: e.x0, x2: e.x1, y1: e.y(v), y2: e.y(v), class: v === 0 ? 'grafico-base' : 'grafico-grade' });
      texto(formatarNumero(v), { x: e.x0 - 8, y: e.y(v) + 4, class: 'grafico-rotulo', 'text-anchor': 'end' });
    }
    texto('milhões', { x: e.x0 - 8, y: e.y1 - 8, class: 'grafico-rotulo', 'text-anchor': 'end' });

    const passoX = e.anoMax - e.anoMin > 110 ? 40 : 20;
    for (let ano = 1940; ano <= e.anoMax; ano += passoX) {
      criar('line', { x1: e.x(ano), x2: e.x(ano), y1: e.y0, y2: e.y0 + 5, class: 'grafico-base' });
      texto(String(ano), { x: e.x(ano), y: e.y0 + 20, class: 'grafico-rotulo', 'text-anchor': 'middle' });
    }
  }

  function caminho(ajuste, anoIni, anoFim, e) {
    const pontos = [];
    const passos = Math.max(2, Math.round((anoFim - anoIni) / 1.5));
    for (let k = 0; k <= passos; k++) {
      const ano = anoIni + (anoFim - anoIni) * (k / passos);
      pontos.push(e.x(ano).toFixed(1) + ',' + e.y(ajuste.avaliar(anoParaT(ano))).toFixed(1));
    }
    return pontos.join(' ');
  }

  function desenharGrafico(ajuste, usados, previsao) {
    svg.innerHTML = '';

    // limites: até o ano da previsão (com folga) e até o maior valor mostrado
    const ultimoAno = CENSOS[CENSOS.length - 1].ano;
    const anoMax = Math.max(2030, previsao ? previsao.ano + 5 : 0);
    let maior = Math.max.apply(null, CENSOS.map((c) => milhoes(c.populacao)));
    for (let ano = 1940; ano <= anoMax; ano += 2) maior = Math.max(maior, ajuste.avaliar(anoParaT(ano)));
    const yMax = Math.min(1000, Math.ceil((maior * 1.08) / 50) * 50);
    const e = criarEscalas(anoMax, yMax);

    desenharEixos(e);

    // recorte: a curva não passa da área do gráfico
    const defs = criar('defs', {});
    const recorte = criar('clipPath', { id: 'l12-recorte' }, defs);
    criar('rect', { x: e.x0, y: e.y1, width: e.x1 - e.x0, height: e.y0 - e.y1 }, recorte);
    const area = criar('g', { 'clip-path': 'url(#l12-recorte)' });

    // curva: cheia onde há dados, tracejada na extrapolação
    criar('polyline', { points: caminho(ajuste, 1940, ultimoAno, e), class: 'grafico-curva' }, area);
    criar('polyline', { points: caminho(ajuste, ultimoAno, anoMax, e), class: 'grafico-curva extrapolacao' }, area);

    // resíduos: segmento vertical do ponto até a curva
    if (caixaResiduos.checked) {
      CENSOS.forEach((c) => {
        const previsto = ajuste.avaliar(anoParaT(c.ano));
        criar('line', {
          x1: e.x(c.ano), x2: e.x(c.ano), y1: e.y(milhoes(c.populacao)), y2: e.y(previsto),
          class: 'grafico-residuo',
        }, area);
      });
    }

    // pontos dos censos (o escondido fica vazado)
    CENSOS.forEach((c) => {
      const usado = usados.includes(c);
      criar('circle', {
        cx: e.x(c.ano), cy: e.y(milhoes(c.populacao)), r: 5,
        class: 'grafico-ponto' + (usado ? '' : ' escondido'),
      });
    });

    // previsão: losango
    if (previsao && previsao.valor >= 0 && previsao.valor <= yMax) {
      const px = e.x(previsao.ano);
      const py = e.y(previsao.valor);
      criar('polygon', {
        points: [[px, py - 7], [px + 7, py], [px, py + 7], [px - 7, py]].map((q) => q.join(',')).join(' '),
        class: 'grafico-previsao',
      });
      texto(previsao.ano + ': ' + n2(previsao.valor) + ' mi', {
        x: px - 10, y: py - 12, class: 'grafico-rotulo grafico-rotulo-forte', 'text-anchor': 'end',
      });
    }

    // alvos invisíveis (maiores que os pontos) para a dica do mouse/teclado
    CENSOS.forEach((c) => {
      const alvo = criar('circle', {
        cx: e.x(c.ano), cy: e.y(milhoes(c.populacao)), r: 14,
        class: 'grafico-alvo', tabindex: 0,
        'aria-label': 'Censo ' + c.ano + ': ' + n2(milhoes(c.populacao)) + ' milhões',
      });
      alvo.addEventListener('mouseenter', () => mostrarDica(c, ajuste, usados, alvo));
      alvo.addEventListener('focus', () => mostrarDica(c, ajuste, usados, alvo));
      alvo.addEventListener('mouseleave', esconderDica);
      alvo.addEventListener('blur', esconderDica);
    });
  }


  /* =======================================================================
     5. DICA AO PASSAR O MOUSE
     ======================================================================= */
  function mostrarDica(censo, ajuste, usados, alvo) {
    const real = milhoes(censo.populacao);
    const previsto = ajuste.avaliar(anoParaT(censo.ano));
    dica.innerHTML =
      '<strong>Censo ' + censo.ano + '</strong>' + (usados.includes(censo) ? '' : ' (escondido)') + '<br>' +
      'Real: ' + censo.populacao.toLocaleString('pt-BR') + ' pessoas<br>' +
      'Modelo: ' + n2(previsto) + ' mi · erro: ' + comSinal(real - previsto) + ' mi';
    dica.hidden = false;

    // posiciona perto do ponto, convertendo coordenadas do SVG em pixels
    const caixa = svg.getBoundingClientRect();
    const escala = caixa.width / LARGURA;
    const cx = Number(alvo.getAttribute('cx')) * escala;
    const cy = Number(alvo.getAttribute('cy')) * escala;
    const largura = dica.offsetWidth;
    const esquerda = Math.min(Math.max(0, cx - largura / 2), caixa.width - largura);
    dica.style.left = esquerda + 'px';
    dica.style.top = Math.max(0, cy - dica.offsetHeight - 14) + 'px';
  }

  function esconderDica() {
    dica.hidden = true;
  }


  /* =======================================================================
     6. RESULTADOS (contas e análise)
     ======================================================================= */
  function blocoMatrizes(ajuste, usados, grau) {
    const colunas = grau === 1 ? 'uma coluna de 1s e uma de t' : 'colunas de 1s, de t e de t²';
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. As matrizes do problema (A·x = b)</span>
        <p>Uma linha por censo usado (${usados.length} linhas); A tem ${colunas}, e b tem a população em milhões.</p>
        <div class="formula formula-rolagem">
          A = ${htmlMatriz(ajuste.A, { formatar: (v) => formatarNumero(v, 2) })}
          &nbsp; b = ${htmlMatriz(ajuste.b, { formatar: n2 })}
        </div>
      </div>`;
  }

  function blocoNormais(ajuste, grau) {
    const somas = grau === 1
      ? '<p class="lab-dica">Aᵀ·A = [n, Σt; Σt, Σt²] e Aᵀ·b = [ΣP; Σt·P]: são só somas feitas a partir da tabela.</p>'
      : '<p class="lab-dica">Aᵀ·A reúne as somas n, Σt, Σt², Σt³ e Σt⁴; Aᵀ·b reúne ΣP, Σt·P e Σt²·P.</p>';
    const itens = ajuste.passos.map((passo, k) => `
      <li class="passo-gauss">
        <span class="passo-gauss-descricao">${k === 0 ? '' : k + '. '}${passo.descricao}</span>
        ${htmlMatriz(passo.matriz, { separarColuna: grau + 1, formatar: n4 })}
      </li>`).join('');
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">2. Equações normais: Aᵀ·A·x = Aᵀ·b</span>
        <div class="formula">Aᵀ·A = ${htmlMatriz(ajuste.AtA, { formatar: n2 })} &nbsp;&nbsp; Aᵀ·b = ${htmlMatriz(ajuste.Atb, { formatar: n2 })}</div>
        ${somas}
      </div>
      <details class="lab-resultado passos-gauss">
        <summary class="lab-rotulo lab-rotulo-m">3. (Aᵀ·A)⁻¹ por Gauss-Jordan (${ajuste.passos.length - 1} operações)</summary>
        <ol class="lista-passos-gauss">${itens}</ol>
      </details>
      <div class="lab-resultado">
        <span class="lab-rotulo">4. Solução: x = (Aᵀ·A)⁻¹·Aᵀ·b</span>
        <div class="formula">${htmlMatriz(ajuste.inversa, { formatar: (v) => formatarNumero(v, 5) })} · ${htmlMatriz(ajuste.Atb, { formatar: n2 })}
          = ${htmlMatriz(ajuste.coeficientes.map((c) => [c]), { formatar: n4, classe: 'matriz-resultado' })}</div>
        <div class="formula"><strong>${formatarModelo(ajuste.coeficientes, 3)}</strong> &nbsp;(milhões; t = (ano − 1940) / 10)</div>
      </div>`;
  }

  function blocoTabela(ajuste) {
    const linhas = CENSOS.map((c) => {
      const real = milhoes(c.populacao);
      const previsto = ajuste.avaliar(anoParaT(c.ano));
      const usado = ajuste.usados.includes(c);
      return `<tr${usado ? '' : ' class="linha-escondida"'}>
        <td>${c.ano}${usado ? '' : ' (escondido)'}</td><td>${formatarNumero(anoParaT(c.ano), 1)}</td>
        <td>${fixo2(real)}</td><td>${fixo2(previsto)}</td><td>${fixo2Sinal(real - previsto)}</td></tr>`;
    }).join('');
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo">5. Dados, modelo e erros (em milhões)</span>
        <div class="tabela-rolagem">
          <table class="tabela tabela-numeros">
            <thead><tr><th>Censo</th><th>t</th><th>Real</th><th>Modelo</th><th>Erro</th></tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
        <div class="formula">SQ<sub>res</sub> = ${n2(ajuste.sqRes)} &nbsp;·&nbsp; SQ<sub>tot</sub> = ${n2(ajuste.sqTot)} &nbsp;·&nbsp;
          R² = 1 − ${n2(ajuste.sqRes)} / ${n2(ajuste.sqTot)} = <strong>${n4(ajuste.r2)}</strong></div>
      </div>`;
  }

  function blocoPrevisao(ajuste, previsao, escondido) {
    let html = '';
    if (previsao) {
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-verde">6. Previsão</span>
          <div class="formula">t = (${previsao.ano} − 1940) / 10 = ${formatarNumero(previsao.t, 1)} &nbsp;⇒&nbsp;
            P(${formatarNumero(previsao.t, 1)}) = <strong>${n2(previsao.valor)} milhões</strong></div>
          ${previsao.ano > 2022 + 20 ? '<p class="lab-dica">Atenção: este ano está longe dos dados. Quanto maior a distância, menos confiável é a extrapolação.</p>' : ''}
        </div>`;
    }
    if (escondido) {
      const real = milhoes(escondido.populacao);
      const previsto = ajuste.avaliar(anoParaT(escondido.ano));
      const erroPct = ((previsto - real) / real) * 100;
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-b">Teste com o censo escondido (${escondido.ano})</span>
          O modelo, sem ver esse censo, previu <strong>${n2(previsto)} milhões</strong>; o IBGE contou
          <strong>${n2(real)} milhões</strong>. Erro de ${comSinal(previsto - real)} milhões
          (${formatarNumero(erroPct, 1)}% ${erroPct >= 0 ? 'acima' : 'abaixo'} do real).
        </div>`;
    }
    return html;
  }

  /** O que o modelo escolhido supõe sobre o ritmo de crescimento. */
  function textoRitmo(ajuste, grau) {
    if (grau === 1) {
      return 'A reta supõe um ritmo constante (' + n2(ajuste.coeficientes[1]) +
        ' milhões por década), então não consegue acompanhar essa mudança.';
    }
    const c2 = ajuste.coeficientes[2];
    return 'Na parábola, c₂ = ' + n4(c2) + (c2 < 0
      ? ' é negativo: o ritmo de crescimento diminui com o tempo, como nos dados.'
      : ' é positivo: o modelo supõe um ritmo que aumenta com o tempo.');
  }

  /** Comentários calculados a partir dos números (não são texto fixo). */
  function blocoAnalise(ajuste, grau) {
    const sinais = ajuste.residuos.map((r) => (r >= 0 ? '+' : '−'));
    let blocos = 1;
    for (let i = 1; i < sinais.length; i++) if (sinais[i] !== sinais[i - 1]) blocos++;
    // com sinais ao acaso, esperaríamos cerca de (n + 1) / 2 blocos; poucos blocos = padrão
    const temPadrao = blocos <= Math.floor(sinais.length / 2);

    // crescimento por década entre censos consecutivos
    const ritmos = [];
    for (let i = 1; i < CENSOS.length; i++) {
      const a = CENSOS[i - 1];
      const b = CENSOS[i];
      ritmos.push({ de: a.ano, ate: b.ano, valor: milhoes(b.populacao - a.populacao) / ((b.ano - a.ano) / 10) });
    }
    const maior = ritmos.reduce((m, r) => (r.valor > m.valor ? r : m));
    const ultimo = ritmos[ritmos.length - 1];

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">Análise</span>
        <p>Sinais dos erros, censo a censo: <strong>${sinais.join(' ')}</strong>.
        ${temPadrao
          ? 'Eles formam blocos, não se alternam ao acaso: sinal de que ' + (grau === 1 ? 'uma reta não acompanha a curvatura dos dados. Experimente a parábola.' : 'ainda há uma tendência que o modelo não capta.')
          : 'Eles se alternam sem um padrão forte, o que indica que a forma do modelo acompanha bem os dados.'}</p>
        <p>O ritmo de crescimento mudou: foi de ${n2(maior.valor)} milhões por década (${maior.de}–${maior.ate}, o maior)
        para ${n2(ultimo.valor)} milhões por década (${ultimo.de}–${ultimo.ate}). ${textoRitmo(ajuste, grau)}</p>
      </div>`;
  }


  /* =======================================================================
     7. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    esconderDica();
    const grau = grauAtual();
    const escondido = caixaValidar.checked ? CENSOS[CENSOS.length - 1] : null;
    const usados = CENSOS.filter((c) => c !== escondido);

    const ajuste = minimosQuadrados(
      usados.map((c) => anoParaT(c.ano)),
      usados.map((c) => milhoes(c.populacao)),
      grau,
    );
    if (!ajuste) {
      svg.innerHTML = '';
      resultados.innerHTML = '<p class="erro">Não foi possível resolver as equações normais.</p>';
      return;
    }
    ajuste.usados = usados;

    const ano = anoPrevisao();
    const previsao = ano === null ? null : { ano: ano, t: anoParaT(ano), valor: ajuste.avaliar(anoParaT(ano)) };

    desenharGrafico(ajuste, usados, previsao);
    resultados.innerHTML =
      blocoMatrizes(ajuste, usados, grau) +
      blocoNormais(ajuste, grau) +
      blocoTabela(ajuste) +
      blocoPrevisao(ajuste, previsao, escondido) +
      blocoAnalise(ajuste, grau);
  }


  /* =======================================================================
     8. EVENTOS
     ======================================================================= */
  radiosModelo.forEach((r) => r.addEventListener('change', atualizar));
  entradaAno.addEventListener('input', atualizar);
  caixaResiduos.addEventListener('change', atualizar);
  caixaValidar.addEventListener('change', atualizar);

  atualizar();
})();
