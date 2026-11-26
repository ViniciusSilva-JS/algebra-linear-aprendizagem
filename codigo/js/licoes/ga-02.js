/* =========================================================================
   js/licoes/ga-02.js — Geometria Analítica, Lição 2: Área de triângulo e alinhamento
   Dois modos:
   - Triângulo: determinante 3×3 por Sarrus (conferido pelo 2×2 dos vetores
     AB e AC), área = |D|/2, sentido de giro e, se D = 0, a reta dos pontos;
   - Polígono: cada clique acrescenta um vértice; área pela fórmula do cadarço.

   Índice
   1. Elementos e estado
   2. Leitura dos campos
   3. Contas
   4. Desenho
   5. Resultados (contas passo a passo)
   6. Atualização geral
   7. Eventos
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ELEMENTOS E ESTADO
     ======================================================================= */
  const svg = document.getElementById('g2-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 8 });
  const MAX_VERTICES = 10;
  const POLIGONO_INICIAL = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 3 }, { x: 1, y: 4 }];

  const campos = {
    ax: document.getElementById('g2-ax'), ay: document.getElementById('g2-ay'),
    bx: document.getElementById('g2-bx'), by: document.getElementById('g2-by'),
    cx: document.getElementById('g2-cx'), cy: document.getElementById('g2-cy'),
  };
  const radiosModo = Array.from(document.querySelectorAll('input[name="g2-modo"]'));
  const controlesTriangulo = document.getElementById('g2-controles-triangulo');
  const controlesPoligono = document.getElementById('g2-controles-poligono');
  const btnAlinhar = document.getElementById('g2-alinhar');
  const btnDesfazer = document.getElementById('g2-desfazer');
  const btnLimpar = document.getElementById('g2-limpar');
  const btnSortear = document.getElementById('g2-sortear');
  const dica = document.getElementById('g2-dica');
  const resultados = document.getElementById('g2-resultados');

  let vertices = POLIGONO_INICIAL.map((v) => ({ ...v }));
  let proximoClique = 'A';

  const fr = formatarFracao;
  const p = formatarComParenteses;

  /** Área como fração e decimal quando não for inteira: "29/2 = 14,5". */
  function areaTexto(v) {
    const texto = fr(v);
    return texto.includes("/") ? texto + " = " + formatarNumero(v) : texto;
  }

  function modoAtual() {
    const marcado = radiosModo.find((r) => r.checked);
    return marcado ? marcado.value : 'triangulo';
  }


  /* =======================================================================
     2. LEITURA DOS CAMPOS
     ======================================================================= */
  function lerCampo(campo) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || Math.abs(valor) > plano.limite;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerTriangulo() {
    const v = {};
    for (const nome of Object.keys(campos)) {
      v[nome] = lerCampo(campos[nome]);
      if (v[nome] === null) return null;
    }
    return { A: { x: v.ax, y: v.ay }, B: { x: v.bx, y: v.by }, C: { x: v.cx, y: v.cy } };
  }


  /* =======================================================================
     3. CONTAS
     ======================================================================= */
  /** D = det(AB, AC): o dobro da área "com sinal". */
  function determinante(A, B, C) {
    return (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
  }

  function iguais(P, Q) {
    return quaseIgual(P.x, Q.x) && quaseIgual(P.y, Q.y);
  }

  /** Termos da fórmula do cadarço: xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ (voltando ao primeiro). */
  function termosCadarco(lista) {
    return lista.map((P, i) => {
      const Q = lista[(i + 1) % lista.length];
      return { P, Q, valor: P.x * Q.y - Q.x * P.y };
    });
  }

  /** Os segmentos PQ e RS se cruzam (ou se sobrepõem)? */
  function segmentosSeCruzam(P, Q, R, S) {
    const o = (a, b, c) => Math.sign(determinante(a, b, c));
    const noSegmento = (a, b, c) => Math.min(a.x, b.x) <= c.x && c.x <= Math.max(a.x, b.x) &&
      Math.min(a.y, b.y) <= c.y && c.y <= Math.max(a.y, b.y);
    const o1 = o(P, Q, R), o2 = o(P, Q, S), o3 = o(R, S, P), o4 = o(R, S, Q);
    if (o1 !== o2 && o3 !== o4) return true;
    return (o1 === 0 && noSegmento(P, Q, R)) || (o2 === 0 && noSegmento(P, Q, S)) ||
      (o3 === 0 && noSegmento(R, S, P)) || (o4 === 0 && noSegmento(R, S, Q));
  }

  /** Algum par de lados NÃO vizinhos se cruza? */
  function ladosSeCruzam(lista) {
    const n = lista.length;
    if (n < 4) return false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const vizinhos = j === i + 1 || (i === 0 && j === n - 1);
        if (vizinhos) continue;
        if (segmentosSeCruzam(lista[i], lista[(i + 1) % n], lista[j], lista[(j + 1) % n])) return true;
      }
    }
    return false;
  }


  /* =======================================================================
     4. DESENHO
     ======================================================================= */
  function desenharPonto(P, nome, classe) {
    plano.ponto(P.x, P.y, 0.26, 'ponto ' + classe);
    const aDireita = P.x <= 4;
    plano.texto(nome, P.x + (aDireita ? 0.4 : -0.4), P.y + 0.4, 'rotulo-ponto', aDireita ? 'start' : 'end');
  }

  /** Setinhas no meio de cada lado, mostrando o sentido A → B → C → A. */
  function desenharGiro(lista, classe) {
    lista.forEach((P, i) => {
      const Q = lista[(i + 1) % lista.length];
      const dx = Q.x - P.x, dy = Q.y - P.y;
      const t = Math.hypot(dx, dy);
      if (t < 1.2) return;
      const mx = (P.x + Q.x) / 2, my = (P.y + Q.y) / 2;
      const ux = (dx / t) * 0.45, uy = (dy / t) * 0.45;
      plano.seta(mx - ux, my - uy, mx + ux, my + uy, 'giro ' + classe);
    });
  }

  function desenharTriangulo(A, B, C, D) {
    plano.limpar();
    if (quaseIgual(D, 0)) {
      const distintos = [A, B, C].filter((P, i, l) => l.findIndex((Q) => iguais(P, Q)) === i);
      if (distintos.length >= 2) {
        const r = retaPorDoisPontos(distintos[0], distintos[1]);
        plano.reta(r.a, r.b, -r.c, 'reta reta-principal');
      }
    } else {
      const classe = D < 0 ? 'negativa' : '';
      plano.poligono([[A.x, A.y], [B.x, B.y], [C.x, C.y]], 'regiao-det ' + classe);
      desenharGiro([A, B, C], classe);
    }
    desenharPonto(A, 'A', 'ponto-a');
    desenharPonto(B, 'B', 'ponto-b');
    desenharPonto(C, 'C', 'ponto-m');
  }

  function desenharPoligono(lista, soma) {
    plano.limpar();
    const pts = lista.map((P) => [P.x, P.y]);
    if (lista.length >= 3) {
      const classe = soma < 0 ? 'negativa' : '';
      plano.poligono(pts, 'regiao-det ' + classe);
      if (!quaseIgual(soma, 0)) desenharGiro(lista, classe);
    } else if (lista.length === 2) {
      plano.linha(pts[0][0], pts[0][1], pts[1][0], pts[1][1], 'segmento');
    }
    lista.forEach((P, i) => desenharPonto(P, 'P' + (i + 1), 'ponto-a'));
  }


  /* =======================================================================
     5. RESULTADOS (contas passo a passo)
     ======================================================================= */
  function blocosTriangulo(A, B, C, D) {
    const M = [[A.x, A.y, 1], [B.x, B.y, 1], [C.x, C.y, 1]];
    const d1 = A.x * B.y, d2 = A.y * C.x, d3 = B.x * C.y;
    const s1 = B.y * C.x, s2 = A.x * C.y, s3 = A.y * B.x;
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const AC = { x: C.x - A.x, y: C.y - A.y };

    let html = `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Determinante por Sarrus</span>
        <p>D = det ${htmlMatriz(M)}</p>
        <div class="formula">descem: ${p(A.x)}·${p(B.y)}·1 + ${p(A.y)}·1·${p(C.x)} + 1·${p(B.x)}·${p(C.y)} = ${fr(d1)} + ${p(d2)} + ${p(d3)} = ${fr(d1 + d2 + d3)}</div>
        <div class="formula">sobem: 1·${p(B.y)}·${p(C.x)} + ${p(A.x)}·1·${p(C.y)} + ${p(A.y)}·${p(B.x)}·1 = ${fr(s1)} + ${p(s2)} + ${p(s3)} = ${fr(s1 + s2 + s3)}</div>
        <div class="formula">D = ${fr(d1 + d2 + d3)} − ${p(s1 + s2 + s3)} = <strong>${fr(D)}</strong></div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo">Conferindo com os vetores-lado</span>
        <span class="vet">AB</span> = ${formatarPonto(AB.x, AB.y)} e <span class="vet">AC</span> = ${formatarPonto(AC.x, AC.y)}
        <div class="formula">det(<span class="vet">AB</span>, <span class="vet">AC</span>) = ${p(AB.x)}·${p(AC.y)} − ${p(AB.y)}·${p(AC.x)} = ${fr(D)} ✓</div>
      </div>`;

    if (quaseIgual(D, 0)) {
      const distintos = [A, B, C].filter((P, i, l) => l.findIndex((Q) => iguais(P, Q)) === i);
      if (distintos.length === 1) {
        html += `<div class="lab-resultado"><p class="erro">Os três pontos são o mesmo: não há triângulo nem reta definida. Mova algum deles.</p></div>`;
      } else {
        const r = retaPorDoisPontos(distintos[0], distintos[1]);
        html += `
          <div class="lab-resultado">
            <span class="lab-rotulo lab-rotulo-verde">2. Pontos alinhados</span>
            <p><span class="etiqueta etiqueta-verde">D = 0</span> o "triângulo" tem área zero: os três pontos estão na mesma reta${distintos.length === 2 ? ' (dois deles coincidem)' : ''}.</p>
            <div class="formula">Reta: ${formatarEquacaoGeral(r.a, r.b, r.c)}</div>
          </div>`;
      }
      return html;
    }

    const sentido = D > 0
      ? '<span class="etiqueta etiqueta-azul">Anti-horário</span> D &gt; 0: indo de A para B e depois para C, o giro é no sentido anti-horário.'
      : '<span class="etiqueta etiqueta-ambar">Horário</span> D &lt; 0: indo de A para B e depois para C, o giro é no sentido horário. Trocando dois vértices, o sinal inverte.';
    html += `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Área</span>
        <div class="formula">Área = |D| / 2 = |${fr(D)}| / 2 = <strong>${areaTexto(Math.abs(D) / 2)}</strong></div>
        <p>${sentido}</p>
      </div>`;
    return html;
  }

  function blocosPoligono(lista) {
    if (lista.length < 3) {
      return `<p class="lab-dica">O polígono tem ${lista.length} vértice${lista.length === 1 ? '' : 's'}. Clique no plano para acrescentar ${3 - lista.length === 1 ? 'mais 1' : 'pelo menos mais ' + (3 - lista.length)}: são necessários 3.</p>`;
    }
    const termos = termosCadarco(lista);
    const soma = termos.reduce((s, t) => s + t.valor, 0);
    const linhas = termos.map((t, i) => {
      const j = (i + 1) % lista.length;
      return `<tr><td>P${i + 1} → P${j + 1}</td><td>${p(t.P.x)}·${p(t.Q.y)} − ${p(t.Q.x)}·${p(t.P.y)}</td><td>${fr(t.valor)}</td></tr>`;
    }).join('');

    let aviso = '';
    if (ladosSeCruzam(lista)) {
      aviso = `<p class="erro">Atenção: alguns lados se cruzam. Com os vértices fora de ordem, a fórmula soma e subtrai pedaços,
        e o resultado <strong>não</strong> é a área da figura desenhada. Desfaça e dê a volta na figura em ordem.</p>`;
    } else if (quaseIgual(soma, 0)) {
      aviso = '<p class="erro">A soma deu 0: todos os vértices estão alinhados, não há região.</p>';
    }

    return `
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-m">1. Fórmula do cadarço (${lista.length} vértices)</span>
        <div class="tabela-rolagem">
          <table class="tabela tabela-numeros">
            <thead><tr><th>Lado</th><th>xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ</th><th>Valor</th></tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
        <div class="formula">Soma = ${termos.map((t) => p(t.valor)).join(' + ')} = ${fr(soma)}</div>
      </div>
      <div class="lab-resultado">
        <span class="lab-rotulo lab-rotulo-verde">2. Área</span>
        <div class="formula">Área = |${fr(soma)}| / 2 = <strong>${areaTexto(Math.abs(soma) / 2)}</strong></div>
        ${quaseIgual(soma, 0) ? '' : `<p>Sentido dos vértices: <strong>${soma > 0 ? 'anti-horário' : 'horário'}</strong> (o sinal da soma, como o de D no triângulo).</p>`}
        ${aviso}
      </div>`;
  }


  /* =======================================================================
     6. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    const poligono = modoAtual() === 'poligono';
    controlesTriangulo.hidden = poligono;
    controlesPoligono.hidden = !poligono;

    if (poligono) {
      dica.textContent = vertices.length >= MAX_VERTICES
        ? 'Limite de ' + MAX_VERTICES + ' vértices: desfaça ou limpe para acrescentar outros.'
        : vertices.length + ' vértice' + (vertices.length === 1 ? '' : 's') + '. O próximo clique acrescenta P' + (vertices.length + 1) + '.';
      const soma = vertices.length >= 3 ? termosCadarco(vertices).reduce((s, t) => s + t.valor, 0) : 0;
      desenharPoligono(vertices, soma);
      resultados.innerHTML = blocosPoligono(vertices);
      return;
    }

    dica.innerHTML = 'Próximo clique no plano move o ponto <strong>' + proximoClique + '</strong>.';
    const t = lerTriangulo();
    if (!t) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">Use coordenadas de −' + plano.limite + ' a ' + plano.limite + '.</p>';
      return;
    }
    const D = determinante(t.A, t.B, t.C);
    desenharTriangulo(t.A, t.B, t.C, D);
    resultados.innerHTML = blocosTriangulo(t.A, t.B, t.C, D);
  }


  /* =======================================================================
     7. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  radiosModo.forEach((r) => r.addEventListener('change', atualizar));

  svg.addEventListener('click', (evento) => {
    const { x, y } = plano.pontoDoClique(evento);
    if (modoAtual() === 'poligono') {
      const ultimo = vertices[vertices.length - 1];
      if (vertices.length < MAX_VERTICES && !(ultimo && ultimo.x === x && ultimo.y === y)) vertices.push({ x, y });
    } else {
      const ordem = ['A', 'B', 'C'];
      const nome = proximoClique.toLowerCase();
      campos[nome + 'x'].value = x;
      campos[nome + 'y'].value = y;
      proximoClique = ordem[(ordem.indexOf(proximoClique) + 1) % 3];
    }
    atualizar();
  });

  // Coloca C sobre a reta AB, num ponto de coordenadas inteiras que caiba no plano.
  btnAlinhar.addEventListener('click', () => {
    const t = lerTriangulo();
    if (!t) return;
    const { A, B } = t;
    if (iguais(A, B)) {
      dica.textContent = 'A e B são o mesmo ponto: qualquer C fica alinhado com eles.';
      return;
    }
    const candidatos = [2, -1, 3, -2, 0.5, 1.5, -0.5];
    const C = candidatos
      .map((k) => ({ x: A.x + k * (B.x - A.x), y: A.y + k * (B.y - A.y) }))
      .find((P) => Number.isInteger(P.x) && Number.isInteger(P.y) && plano.cabe(P.x, P.y) && !iguais(P, A) && !iguais(P, B));
    if (!C) {
      dica.textContent = 'Não achei um ponto inteiro da reta AB dentro do plano. Aproxime A e B.';
      return;
    }
    campos.cx.value = C.x;
    campos.cy.value = C.y;
    atualizar();
  });

  btnDesfazer.addEventListener('click', () => { vertices.pop(); atualizar(); });
  btnLimpar.addEventListener('click', () => { vertices = []; atualizar(); });

  btnSortear.addEventListener('click', () => {
    const inteiro = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    if (modoAtual() === 'poligono') {
      // polígono convexo: pontos em volta de um centro, em ordem de ângulo
      const n = inteiro(4, 6);
      const lista = [];
      for (let i = 0; i < n; i++) {
        const angulo = (2 * Math.PI * i) / n + (Math.random() - 0.5) * 0.6;
        const raio = inteiro(4, 7);
        const P = { x: Math.round(raio * Math.cos(angulo)), y: Math.round(raio * Math.sin(angulo)) };
        if (!lista.some((Q) => iguais(P, Q))) lista.push(P);
      }
      vertices = lista;
    } else {
      let A, B, C;
      do {
        A = { x: inteiro(-6, 6), y: inteiro(-6, 6) };
        B = { x: inteiro(-6, 6), y: inteiro(-6, 6) };
        C = { x: inteiro(-6, 6), y: inteiro(-6, 6) };
      } while (quaseIgual(determinante(A, B, C), 0));
      campos.ax.value = A.x; campos.ay.value = A.y;
      campos.bx.value = B.x; campos.by.value = B.y;
      campos.cx.value = C.x; campos.cy.value = C.y;
    }
    atualizar();
  });

  atualizar();
})();
