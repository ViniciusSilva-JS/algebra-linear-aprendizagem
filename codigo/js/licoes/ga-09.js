/* =========================================================================
   js/licoes/ga-09.js — Geometria Analítica, Lição 9: Vetores no espaço
   Lê os vetores u e v (três componentes cada) e:
     1. desenha os dois no espaço 3D (js/componentes/espaco.js), com as
        linhas até o chão e os eixos, u + v e v − u opcionais;
     2. calcula módulos, distância entre as pontas, soma e vetor unitário,
        produto escalar, ângulo e ângulos diretores, mostrando as contas.

   Índice
   1. Elementos
   2. Textos
   3. Leitura dos campos
   4. Desenho
   5. Resultados
   6. Atualização geral
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS
     ======================================================================= */
  const svg = document.getElementById('g9-espaco');
  if (!svg) return;

  const LIMITE = 6;   // componentes de −6 a 6
  const campos = {
    u: ['ux', 'uy', 'uz'].map((id) => document.getElementById('g9-' + id)),
    v: ['vx', 'vy', 'vz'].map((id) => document.getElementById('g9-' + id)),
  };
  const giro = document.getElementById('g9-giro');
  const giroValor = document.getElementById('g9-giro-valor');
  const btnVista = document.getElementById('g9-vista');
  const chkChamadas = document.getElementById('g9-chamadas');
  const chkSoma = document.getElementById('g9-soma');
  const chkDiferenca = document.getElementById('g9-diferenca');
  const btnSortear = document.getElementById('g9-sortear');
  const botoesExemplo = Array.from(document.querySelectorAll('[data-g9-exemplo]'));
  const resultados = document.getElementById('g9-resultados');

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
  const terna = (v) => formatarTerna(v.x, v.y, v.z);
  const lista = (v) => [v.x, v.y, v.z];

  /** "√9 = 3", "√14 ≈ 3,74" ou "√18 = 3√2 ≈ 4,24" (quadrado inteiro); decimal se não for. */
  function raizComValor(q) {
    const r = Math.sqrt(q);
    if (quaseIgual(r, Math.round(r))) return '√' + formatarNumero(q) + ' = ' + formatarNumero(Math.round(r));
    if (!quaseIgual(q, Math.round(q))) {
      const exata = quaseIgual(r * 100, Math.round(r * 100));   // ex.: √2,25 = 1,5
      return '√' + formatarNumero(q) + (exata ? ' = ' : ' ≈ ') + formatarNumero(r);
    }
    const simples = textoRaiz(q);
    const meio = simples.startsWith('√') ? '' : ' = ' + simples;
    return '√' + formatarNumero(q) + meio + ' ≈ ' + formatarNumero(r);
  }

  /** Módulo "curto" para usar dentro de outras contas: "3", "√14", "3√2". */
  function moduloCurto(q) {
    return quaseIgual(q, Math.round(q)) ? textoRaiz(Math.round(q)) : formatarNumero(Math.sqrt(q));
  }

  /** "2² + (−1)² + (1,5)²": negativos e decimais entre parênteses. */
  const somaDeQuadrados = (v) => lista(v)
    .map((c) => (c < 0 || !Number.isInteger(c) ? '(' + formatarNumero(c) + ')' : formatarNumero(c)) + '²')
    .join(' + ');

  /** "2·0 + 2·3 + 1·4" */
  const somaDeProdutos = (u, v) => lista(u).map((c, i) => formatarComParenteses(c) + '·' + formatarComParenteses(lista(v)[i])).join(' + ');

  /** Fração quando der (2/3), senão decimal com 3 casas. */
  function fracaoOuDecimal(x) {
    const f = formatarFracao(x);
    return f.includes('/') || quaseIgual(x, Math.round(x)) ? f : formatarNumero(x, 3);
  }

  /** Divide cada componente pelo módulo: "(2/3, 2/3, 1/3)" ou "(0,535; 0,267; 0,802)". */
  function unitarioTexto(v, m) {
    const partes = lista(v).map((c) => fracaoOuDecimal(c / m));
    const temDecimal = partes.some((p) => p.includes(','));
    return '(' + partes.join(temDecimal ? '; ' : ', ') + ')';
  }

  const graus = (rad) => formatarNumero(radianosParaGraus(rad)) + '°';


  /* =======================================================================
     3. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerVetor(nome) {
    const valores = campos[nome].map((campo) => lerNumero(campo.value));
    if (valores.some((v) => !Number.isFinite(v))) {
      return { erro: 'Preencha as três componentes de ' + nome + ' com números.' };
    }
    if (valores.some((v) => Math.abs(v) > LIMITE)) {
      return { erro: 'Use componentes de −' + LIMITE + ' a ' + LIMITE + ' em ' + nome + '.' };
    }
    return { x: valores[0], y: valores[1], z: valores[2] };
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  const ORIGEM = [0, 0, 0];

  /** Linhas tracejadas da ponta P até o chão (x, y, 0) e de lá até os eixos x e y. */
  function chamadas(e, p, classe) {
    const [x, y, z] = p;
    const chao = [x, y, 0];
    if (z !== 0) e.linha(p, chao, 'linha-chamada ' + classe);
    if (x !== 0 && y !== 0) {
      e.linha(chao, [x, 0, 0], 'linha-chamada ' + classe);
      e.linha(chao, [0, y, 0], 'linha-chamada ' + classe);
    }
    if (z !== 0 && (x !== 0 || y !== 0)) e.ponto(chao, 0.12, 'seta-ponta ' + classe);
  }

  function desenhar(u, v) {
    const pu = lista(u), pv = lista(v);
    const soma = somarVetores3(u, v);
    const ps = lista(soma);

    // O espaço cresce para caber tudo o que está desenhado.
    const pontos = [pu, pv];
    if (chkSoma.checked) pontos.push(ps);
    const maior = Math.max(...pontos.map((p) => Math.hypot(...p)));
    espaco.definirAlcance(Math.max(5, Math.ceil(maior + 0.5)));

    espaco.definirDesenho((e) => {
      if (chkChamadas.checked) {
        chamadas(e, pu, 'vetor-u');
        chamadas(e, pv, 'vetor-v');
      }

      if (chkSoma.checked) {
        e.poligono([ORIGEM, pu, ps, pv], 'regiao-paralelogramo');
        e.seta(pu, ps, 'vetor-v tracejado');
        e.seta(pv, ps, 'vetor-u tracejado');
        e.seta(ORIGEM, ps, 'vetor-r');
        e.rotuloSeta('u + v', ORIGEM, ps, 'rotulo-vetor vetor-r');
      }

      if (chkDiferenca.checked) {
        e.seta(pu, pv, 'vetor-d');
        const meio = pu.map((c, i) => (c + pv[i]) / 2);
        e.texto('v − u', meio, 'rotulo-vetor vetor-d', 'start', 0.3, 0.3);
      }

      e.seta(ORIGEM, pu, 'vetor-u');
      e.seta(ORIGEM, pv, 'vetor-v');
      e.rotuloSeta('u', ORIGEM, pu, 'rotulo-vetor vetor-u');
      e.rotuloSeta('v', ORIGEM, pv, 'rotulo-vetor vetor-v');
    });
  }


  /* =======================================================================
     5. RESULTADOS
     ======================================================================= */
  function cartaoModulos(u, v, qu, qv) {
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">1. Módulos</span>
        <div class="formula">|${VET('u')}| = √(${somaDeQuadrados(u)}) = ${raizComValor(qu)}</div>
        <div class="formula">|${VET('v')}| = √(${somaDeQuadrados(v)}) = ${raizComValor(qv)}</div>
      </div>`;
  }

  function cartaoDistancia(u, v) {
    const d = subtrairVetores3(v, u);
    const qd = produtoEscalar3(d, d);
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Distância entre as pontas</span>
        <p>As pontas são os pontos ${terna(u)} e ${terna(v)}. A distância entre eles é o módulo de ${VET('v')} − ${VET('u')}:</p>
        <div class="formula">${VET('v')} − ${VET('u')} = ${terna(d)}</div>
        <div class="formula">d = √(${somaDeQuadrados(d)}) = ${raizComValor(qd)}</div>
      </div>`;
  }

  function cartaoSomaUnitario(u, v, qu) {
    const s = somarVetores3(u, v);
    const unitario = qu === 0
      ? '<p>' + VET('u') + ' é o vetor nulo: não tem direção, então não existe vetor unitário.</p>'
      : `<div class="formula">${VET('u')} / |${VET('u')}| = ${terna(u)} / ${moduloCurto(qu)} = ${unitarioTexto(u, Math.sqrt(qu))}</div>`;
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">3. Soma e vetor unitário</span>
        <div class="formula">${VET('u')} + ${VET('v')} = ${terna(u)} + ${terna(v)} = ${terna(s)}</div>
        ${unitario}
      </div>`;
  }

  function cartaoAngulo(u, v, qu, qv) {
    const pe = produtoEscalar3(u, v);
    let conclusao;
    if (qu === 0 || qv === 0) {
      conclusao = '<p>Com um vetor nulo o ângulo não está definido (o nulo não tem direção).</p>';
    } else {
      const cosseno = Math.max(-1, Math.min(1, pe / Math.sqrt(qu * qv)));
      const theta = Math.acos(cosseno);
      let tipo;
      if (quaseIgual(pe, 0)) tipo = 'u · v = 0: os vetores são <strong>ortogonais</strong> ✓';
      else if (quaseIgual(cosseno, 1, 1e-9)) tipo = 'mesma direção e mesmo sentido (um é múltiplo positivo do outro)';
      else if (quaseIgual(cosseno, -1, 1e-9)) tipo = 'mesma direção e sentidos <strong>opostos</strong> (um é múltiplo negativo do outro)';
      else if (pe > 0) tipo = 'u · v &gt; 0: ângulo <strong>agudo</strong>';
      else tipo = 'u · v &lt; 0: ângulo <strong>obtuso</strong>';
      const cosTxt = fracaoOuDecimal(cosseno);
      conclusao = `
        <div class="formula">cos θ = ${formatarNumero(pe)} / (${moduloCurto(qu)} · ${moduloCurto(qv)})${cosTxt.includes(',') ? ' ≈ ' : ' = '}${cosTxt}</div>
        <div class="formula">θ ${quaseIgual(radianosParaGraus(theta), Math.round(radianosParaGraus(theta)), 1e-6) ? '=' : '≈'} <strong>${graus(theta)}</strong></div>
        <p>${tipo}.</p>`;
    }
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-b">4. Produto escalar e ângulo</span>
        <div class="formula">${VET('u')} · ${VET('v')} = ${somaDeProdutos(u, v)} = <strong>${formatarNumero(pe)}</strong></div>
        ${conclusao}
      </div>`;
  }

  function cartaoDiretores(u, qu) {
    if (qu === 0) return '';
    const m = Math.sqrt(qu);
    const mc = moduloCurto(qu);
    const linhas = [['α', 'x', u.x], ['β', 'y', u.y], ['γ', 'z', u.z]].map(([letra, eixo, c]) => {
      const cosTxt = fracaoOuDecimal(c / m);
      return `<li>cos ${letra} = ${formatarNumero(c)} / ${mc}${cosTxt.includes(',') ? ' ≈ ' : ' = '}${cosTxt} ⇒ ${letra} ≈ ${graus(Math.acos(c / m))} (com o eixo ${eixo})</li>`;
    });
    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-a">5. Ângulos diretores de ${VET('u')}</span>
        <ul>${linhas.join('')}</ul>
        <p>Conferindo: cos²α + cos²β + cos²γ = (${lista(u).map((c) => formatarNumero(c * c)).join(' + ')}) / ${formatarNumero(qu)} = 1 ✓</p>
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const u = lerVetor('u');
    const v = lerVetor('v');
    const erro = u.erro || v.erro;
    if (erro) {
      espaco.definirDesenho(null);
      resultados.innerHTML = '<p class="erro">' + erro + '</p>';
      return;
    }

    desenhar(u, v);
    const qu = produtoEscalar3(u, u);
    const qv = produtoEscalar3(v, v);
    resultados.innerHTML =
      cartaoModulos(u, v, qu, qv) +
      cartaoDistancia(u, v) +
      cartaoSomaUnitario(u, v, qu) +
      cartaoAngulo(u, v, qu, qv) +
      cartaoDiretores(u, qu);
  }

  function preencher(valores) {
    [...campos.u, ...campos.v].forEach((campo, i) => { campo.value = valores[i]; });
    atualizar();
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  [...campos.u, ...campos.v].forEach((campo) => campo.addEventListener('input', atualizar));
  [chkChamadas, chkSoma, chkDiferenca].forEach((chk) => chk.addEventListener('change', atualizar));

  giro.addEventListener('input', () => espaco.girar(Number(giro.value)));
  btnVista.addEventListener('click', () => espaco.vistaPadrao());

  botoesExemplo.forEach((btn) => {
    btn.addEventListener('click', () => preencher(btn.dataset.g9Exemplo.split(',').map(Number)));
  });

  // Sorteia dois vetores inteiros; às vezes força v ortogonal a u, para aparecer o caso de 90°.
  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const sortear = () => [inteiro(-4, 4), inteiro(-4, 4), inteiro(-4, 4)];
    let u = sortear();
    while (u.every((c) => c === 0)) u = sortear();
    let v = sortear();
    if (Math.random() < 0.3) {
      // v ortogonal a u: troca duas componentes de lugar e inverte o sinal de uma
      const [a, b, c] = u;
      const opcoes = [[b, -a, 0], [0, c, -b], [c, 0, -a]].filter((w) => w.some((x) => x !== 0));
      v = opcoes[inteiro(0, opcoes.length - 1)];
    }
    preencher([...u, ...v]);
  });

  atualizar();
})();
