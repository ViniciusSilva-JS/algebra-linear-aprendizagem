/* =========================================================================
   js/licoes/licao-04.js — Laboratório da Lição 4: Retas no plano
   Desenha a reta que passa por A e B, o "degrau" Δx/Δy, os pontos onde
   ela corta os eixos e (opcional) a perpendicular por A. Mostra o
   coeficiente angular, o linear e as equações reduzida e geral.

   Índice
   1. Elementos
   2. Leitura dos pontos
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
  const svg = document.getElementById('l4-plano');
  if (!svg) return;

  const plano = criarPlanoCartesiano(svg, { limite: 10 });

  const campos = {
    ax: document.getElementById('l4-ax'),
    ay: document.getElementById('l4-ay'),
    bx: document.getElementById('l4-bx'),
    by: document.getElementById('l4-by'),
  };
  const caixaPerpendicular = document.getElementById('l4-perpendicular');
  const resultados = document.getElementById('l4-resultados');
  const dicaClique = document.getElementById('l4-dica-clique');
  const btnSortear = document.getElementById('l4-sortear');

  let proximoClique = 'A';


  /* =======================================================================
     2. LEITURA DOS PONTOS
     ======================================================================= */
  function lerCampo(campo) {
    const valor = lerNumero(campo.value);
    const invalido = Number.isNaN(valor) || Math.abs(valor) > plano.limite;
    campo.classList.toggle('erro', invalido);
    return invalido ? null : valor;
  }

  function lerPontos() {
    const ax = lerCampo(campos.ax);
    const ay = lerCampo(campos.ay);
    const bx = lerCampo(campos.bx);
    const by = lerCampo(campos.by);
    if ([ax, ay, bx, by].includes(null)) return null;
    return { A: { x: ax, y: ay }, B: { x: bx, y: by } };
  }


  /* =======================================================================
     3. DESENHO
     ======================================================================= */
  function desenharPonto(ponto, nome, classe) {
    plano.ponto(ponto.x, ponto.y, 0.3, 'ponto ' + classe);
    const aDireita = ponto.x <= 5;
    plano.texto(nome, ponto.x + (aDireita ? 0.45 : -0.45), ponto.y + 0.45, 'rotulo-ponto', aDireita ? 'start' : 'end');
  }

  /** Quadradinho de ângulo reto no ponto P, entre as direções d1 e d2. */
  function marcarAnguloReto(P, d1, d2) {
    const t1 = Math.hypot(d1.x, d1.y);
    const t2 = Math.hypot(d2.x, d2.y);
    const lado = 0.6;
    const a = { x: P.x + (d1.x / t1) * lado, y: P.y + (d1.y / t1) * lado };
    const b = { x: P.x + (d2.x / t2) * lado, y: P.y + (d2.y / t2) * lado };
    plano.poligonal([[a.x, a.y], [a.x + b.x - P.x, a.y + b.y - P.y], [b.x, b.y]], 'arco-angulo');
  }

  function desenhar(A, B, reta) {
    plano.limpar();
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    // a reta: a·x + b·y + c = 0  →  a·x + b·y = −c
    plano.reta(reta.a, reta.b, -reta.c, 'reta reta-principal');

    // perpendicular por A: direção (dx, dy) vira a normal → dx·x + dy·y = dx·xA + dy·yA
    if (caixaPerpendicular.checked) {
      plano.reta(dx, dy, dx * A.x + dy * A.y, 'reta reta-perpendicular');
      marcarAnguloReto(A, { x: dx, y: dy }, { x: -dy, y: dx });
    }

    // degrau Δx / Δy
    if (dx !== 0 && dy !== 0) {
      plano.poligonal([[A.x, A.y], [B.x, A.y], [B.x, B.y]], 'cateto');
      plano.texto('Δx', (A.x + B.x) / 2, A.y + (dy > 0 ? -0.8 : 0.4), 'rotulo-cateto', 'middle');
      plano.texto('Δy', B.x + (dx > 0 ? 0.3 : -0.3), (A.y + B.y) / 2, 'rotulo-cateto', dx > 0 ? 'start' : 'end');
    }

    // cortes nos eixos
    if (reta.m !== null) {
      if (plano.cabe(0, reta.n)) plano.ponto(0, reta.n, 0.2, 'ponto ponto-m');
      if (!quaseIgual(reta.m, 0)) {
        const xCorte = -reta.n / reta.m;
        if (plano.cabe(xCorte, 0)) plano.ponto(xCorte, 0, 0.2, 'ponto ponto-m');
      }
    } else if (plano.cabe(A.x, 0)) {
      plano.ponto(A.x, 0, 0.2, 'ponto ponto-m');
    }

    desenharPonto(A, 'A', 'ponto-a');
    desenharPonto(B, 'B', 'ponto-b');
  }


  /* =======================================================================
     4. RESULTADOS (contas passo a passo)
     ======================================================================= */
  const fr = formatarFracao;
  const p = formatarComParenteses;

  function tipoDeReta(reta) {
    if (reta.m === null) return '<span class="etiqueta etiqueta-azul">Vertical · m não existe</span>';
    if (quaseIgual(reta.m, 0)) return '<span class="etiqueta etiqueta-azul">Horizontal · m = 0</span>';
    if (reta.m > 0) return '<span class="etiqueta etiqueta-verde">Crescente · m &gt; 0</span>';
    return '<span class="etiqueta etiqueta-ambar">Decrescente · m &lt; 0</span>';
  }

  function textoCortes(reta, A) {
    if (reta.m === null) return 'Corta o eixo x em (' + fr(A.x) + ', 0) e nunca corta o eixo y (a menos que seja o próprio eixo).';
    const eixoY = 'eixo y em (0, ' + fr(reta.n) + ')';
    if (quaseIgual(reta.m, 0)) {
      return 'Corta o ' + eixoY + (quaseIgual(reta.n, 0) ? ' (é o próprio eixo x).' : ' e nunca corta o eixo x (é paralela a ele).');
    }
    return 'Corta o ' + eixoY + ' e o eixo x em (' + fr(-reta.n / reta.m) + ', 0), fazendo y = 0.';
  }

  function textoPerpendicular(reta, A) {
    if (reta.m === null) return 'A reta é vertical, então a perpendicular por A é horizontal: <strong>y = ' + fr(A.y) + '</strong>.';
    if (quaseIgual(reta.m, 0)) return 'A reta é horizontal, então a perpendicular por A é vertical: <strong>x = ' + fr(A.x) + '</strong>.';
    const mPerp = -1 / reta.m;
    const nPerp = A.y - mPerp * A.x;
    return 'm⊥ = −1 / m = −1 / ' + p(reta.m) + ' = ' + fr(mPerp) + ' &nbsp;⇒&nbsp; <strong>' + formatarEquacaoReduzida(mPerp, nPerp) + '</strong>';
  }

  function montarResultados(A, B, reta) {
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    let html = `
      <div class="lab-resultado">
        <span class="lab-rotulo">Degrau</span>
        Δx = ${fr(B.x)} − ${p(A.x)} = ${fr(dx)} &nbsp;e&nbsp; Δy = ${fr(B.y)} − ${p(A.y)} = ${fr(dy)}
      </div>`;

    if (reta.m === null) {
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">Coeficiente angular</span>
          <div class="formula">m = Δy / Δx = ${fr(dy)} / 0 &nbsp;→&nbsp; não existe (divisão por zero)</div>
          <p>${tipoDeReta(reta)}</p>
        </div>
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">Equações</span>
          <div class="formula">x = ${fr(A.x)} &nbsp;&nbsp;|&nbsp;&nbsp; ${formatarEquacaoGeral(reta.a, reta.b, reta.c)}</div>
        </div>`;
    } else {
      const graus = radianosParaGraus(Math.atan(reta.m));
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">Coeficiente angular</span>
          <div class="formula">m = Δy / Δx = ${fr(dy)} / ${p(dx)} = ${fr(reta.m)} &nbsp;&nbsp;(θ ≈ ${formatarNumero(graus)}°)</div>
          <p>${tipoDeReta(reta)}</p>
        </div>
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">Coeficiente linear</span>
          <div class="formula">b = y<sub>A</sub> − m·x<sub>A</sub> = ${fr(A.y)} − ${p(reta.m)}·${p(A.x)} = ${fr(reta.n)}</div>
        </div>
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-m">Equações</span>
          <div class="formula">Reduzida: ${formatarEquacaoReduzida(reta.m, reta.n)}</div>
          <div class="formula">Geral: ${formatarEquacaoGeral(reta.a, reta.b, reta.c)}</div>
        </div>`;
    }

    html += `
      <div class="lab-resultado">
        <span class="lab-rotulo">Cortes nos eixos</span>
        ${textoCortes(reta, A)}
      </div>`;

    if (caixaPerpendicular.checked) {
      html += `
        <div class="lab-resultado">
          <span class="lab-rotulo lab-rotulo-verde">Perpendicular por A</span>
          ${textoPerpendicular(reta, A)}
        </div>`;
    }
    return html;
  }


  /* =======================================================================
     5. ATUALIZAÇÃO GERAL
     ======================================================================= */
  function atualizar() {
    dicaClique.innerHTML = 'Próximo clique no plano move o ponto <strong>' + proximoClique + '</strong>.';
    const pontos = lerPontos();
    if (!pontos) {
      plano.limpar();
      resultados.innerHTML = '<p class="erro">Use coordenadas de −10 a 10.</p>';
      return;
    }
    const { A, B } = pontos;
    if (A.x === B.x && A.y === B.y) {
      plano.limpar();
      desenharPonto(A, 'A = B', 'ponto-a');
      resultados.innerHTML = '<p class="erro">A e B são o mesmo ponto: por um único ponto passam infinitas retas. Escolha pontos diferentes.</p>';
      return;
    }
    const reta = retaPorDoisPontos(A, B);
    desenhar(A, B, reta);
    resultados.innerHTML = montarResultados(A, B, reta);
  }


  /* =======================================================================
     6. EVENTOS
     ======================================================================= */
  Object.values(campos).forEach((campo) => campo.addEventListener('input', atualizar));
  caixaPerpendicular.addEventListener('change', atualizar);

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
    atualizar();
  });

  btnSortear.addEventListener('click', () => {
    const sortear = () => Math.floor(Math.random() * 17) - 8;
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

  atualizar();
})();
