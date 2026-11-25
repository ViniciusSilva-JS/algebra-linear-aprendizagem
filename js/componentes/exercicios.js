/* =========================================================================
   js/componentes/exercicios.js — Correção automática dos exercícios
   Funciona para QUALQUER lição, só com marcações no HTML:

   <div class="exercicios" data-licao="1">
     <ol class="lista-exercicios">
       <li class="exercicio" data-dica="Texto de ajuda se errar">
         <p>Enunciado</p>
         <div class="resposta">
           <input type="text" data-resposta="5">          ← número
           <input type="text" data-resposta="2.5"
                  data-tolerancia="0.01">                 ← aceita ±0,01
           <select data-resposta="2">…</select>           ← opção
         </div>
       </li>
       <li class="exercicio" data-dica="Dica geral">       ← múltipla escolha
         <p>Enunciado</p>
         <div class="alternativas" data-resposta="b">
           <label class="alternativa">
             <input type="radio" name="ex1" value="a"
                    data-explicacao="Por que 25 está errada"> 25
           </label>
           <label class="alternativa">
             <input type="radio" name="ex1" value="b"
                    data-explicacao="Por que 5 está certa"> 5
           </label>
         </div>
       </li>
     </ol>
   </div>

   - Múltipla escolha com data-explicacao em cada alternativa:
     • errou → mostra a explicação da alternativa escolhida (por que está
       errada), sem revelar a certa;
     • acertou → abre o quadro "Por que cada alternativa?" com a
       explicação de TODAS as alternativas.
   - Sem explicação na alternativa, usa a data-dica geral do exercício.

   - Um exercício está certo quando TODOS os seus campos estão certos.
   - Acertando todos, chama concluirLicao(n) (do js/app.js).

   Índice
   1. Preparação dos blocos de exercícios
   2. Correção de um campo
   3. Correção de um exercício
   4. Correção do bloco inteiro
   5. Inicialização
   ========================================================================= */

'use strict';

const TOLERANCIA_PADRAO = 0.01; // aceita pequenos arredondamentos (ex.: 3,61 para √13)


/* =========================================================================
   1. PREPARAÇÃO
   Cria (via JS) o botão "Verificar respostas", a área de resumo e o
   parágrafo de feedback de cada exercício.
   ========================================================================= */
function prepararBlocoDeExercicios(bloco) {
  const exercicios = Array.from(bloco.querySelectorAll('.exercicio'));
  if (exercicios.length === 0) return;

  const numeroLicao = Number(bloco.dataset.licao);

  // Um parágrafo de feedback (escondido) em cada exercício.
  exercicios.forEach((exercicio) => {
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.hidden = true;
    feedback.setAttribute('aria-live', 'polite');
    exercicio.append(feedback);
  });

  // Botão de verificar + resumo do resultado.
  const acoes = document.createElement('div');
  acoes.className = 'exercicios-acoes';

  const btnVerificar = document.createElement('button');
  btnVerificar.type = 'button';
  btnVerificar.className = 'btn';
  btnVerificar.textContent = 'Verificar respostas';

  const resumo = document.createElement('p');
  resumo.className = 'resumo-exercicios';
  resumo.hidden = true;
  resumo.setAttribute('aria-live', 'polite');

  acoes.append(btnVerificar);
  bloco.append(acoes, resumo);

  const verificar = () => corrigirBloco(bloco, exercicios, resumo, numeroLicao);
  btnVerificar.addEventListener('click', verificar);

  // Enter dentro de um campo também verifica.
  bloco.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' && evento.target.matches('input')) {
      evento.preventDefault();
      verificar();
    }
  });

  // Ao editar um campo ou trocar de alternativa, tira a cor verde/vermelha.
  bloco.addEventListener('input', (evento) => {
    evento.target.classList.remove('acerto', 'erro');
    const grupo = evento.target.closest('.alternativas');
    if (grupo) limparAlternativas(grupo);

    // Mudou a resposta: esconde o feedback e a explicação até verificar de novo.
    const exercicio = evento.target.closest('.exercicio');
    if (exercicio) {
      exercicio.classList.remove('correto');
      const feedback = exercicio.querySelector('.feedback');
      if (feedback) feedback.hidden = true;
      atualizarExplicacaoCompleta(exercicio, false);
    }
  });
}


/* =========================================================================
   2. CORREÇÃO DE UM CAMPO
   Devolve 'certo', 'errado' ou 'vazio'.
   ========================================================================= */
function corrigirCampo(campo) {
  const esperado = campo.dataset.resposta;

  // Múltipla escolha: compara a alternativa marcada.
  if (campo.classList.contains('alternativas')) {
    const marcada = campo.querySelector('input[type="radio"]:checked');
    if (!marcada) return 'vazio';
    return marcada.value === esperado ? 'certo' : 'errado';
  }

  const valor = campo.value.trim();

  if (valor === '') return 'vazio';

  // <select>: compara o valor da opção escolhida.
  if (campo.tagName === 'SELECT') {
    return valor === esperado ? 'certo' : 'errado';
  }

  // Campos numéricos: compara com tolerância.
  const digitado = lerNumero(valor);
  const correto = lerNumero(esperado);
  if (Number.isNaN(digitado)) return 'errado';

  const tolerancia = campo.dataset.tolerancia !== undefined
    ? lerNumero(campo.dataset.tolerancia)
    : TOLERANCIA_PADRAO;

  return quaseIgual(digitado, correto, tolerancia) ? 'certo' : 'errado';
}


/** Tira as marcas de certa/errada de todas as alternativas de um grupo. */
function limparAlternativas(grupo) {
  grupo.querySelectorAll('.alternativa').forEach((alternativa) => {
    alternativa.classList.remove('certa', 'errada');
  });
}


/* =========================================================================
   3. CORREÇÃO DE UM EXERCÍCIO
   Pinta cada campo e escreve o feedback. Devolve true se estiver certo.
   ========================================================================= */
function corrigirExercicio(exercicio) {
  const campos = Array.from(exercicio.querySelectorAll('[data-resposta]'));
  const feedback = exercicio.querySelector('.feedback');

  let algumVazio = false;
  let tudoCerto = true;
  let explicacaoDoErro = null; // explicação da alternativa errada escolhida

  campos.forEach((campo) => {
    const resultado = corrigirCampo(campo);

    // Múltipla escolha: pinta só a alternativa marcada.
    if (campo.classList.contains('alternativas')) {
      const marcada = campo.querySelector('input[type="radio"]:checked');
      limparAlternativas(campo);
      if (marcada) {
        marcada.closest('.alternativa').classList.add(resultado === 'certo' ? 'certa' : 'errada');
        if (resultado === 'errado') {
          explicacaoDoErro = marcada.dataset.explicacao || marcada.dataset.dica || null;
        }
      }
      if (resultado === 'vazio') algumVazio = true;
      if (resultado !== 'certo') tudoCerto = false;
      return;
    }

    campo.classList.remove('acerto', 'erro');

    if (resultado === 'vazio') {
      algumVazio = true;
      tudoCerto = false;
    } else if (resultado === 'certo') {
      campo.classList.add('acerto');
    } else {
      campo.classList.add('erro');
      tudoCerto = false;
    }
  });

  // Mensagem do exercício
  feedback.classList.remove('acerto', 'erro');
  if (tudoCerto) {
    feedback.textContent = 'Correto!';
    feedback.classList.add('acerto');
  } else if (algumVazio) {
    feedback.textContent = 'Responda este exercício antes de verificar.';
    feedback.classList.add('erro');
  } else if (explicacaoDoErro) {
    feedback.textContent = 'Ainda não. ' + explicacaoDoErro;
    feedback.classList.add('erro');
  } else {
    const dica = exercicio.dataset.dica;
    feedback.textContent = dica ? 'Ainda não. Dica: ' + dica : 'Ainda não. Tente de novo.';
    feedback.classList.add('erro');
  }
  feedback.hidden = false;

  // Explicação completa: só aparece depois de acertar.
  atualizarExplicacaoCompleta(exercicio, tudoCerto);

  exercicio.classList.toggle('correto', tudoCerto);
  return tudoCerto;
}

/**
 * Cria (ou remove) o quadro "Por que cada alternativa?" com a explicação
 * de todas as alternativas do exercício: ✓ na certa e ✕ nas erradas.
 */
function atualizarExplicacaoCompleta(exercicio, mostrar) {
  const antigo = exercicio.querySelector('.explicacao');
  if (antigo) antigo.remove();
  if (!mostrar) return;

  const grupos = exercicio.querySelectorAll('.alternativas');
  if (grupos.length === 0) return;

  const quadro = document.createElement('details');
  quadro.className = 'explicacao';
  quadro.open = true;

  const titulo = document.createElement('summary');
  titulo.textContent = 'Por que cada alternativa?';
  quadro.append(titulo);

  const lista = document.createElement('ul');
  lista.className = 'explicacao-lista';

  grupos.forEach((grupo) => {
    const certa = grupo.dataset.resposta;
    const opcoes = Array.from(grupo.querySelectorAll('.alternativa'));

    opcoes.forEach((rotulo, indice) => {
      const radio = rotulo.querySelector('input[type="radio"]');
      if (!radio || !radio.dataset.explicacao) return;

      const ehCerta = radio.value === certa;
      const letra = String.fromCharCode(97 + indice); // 0 → "a", 1 → "b"...

      const item = document.createElement('li');
      item.className = ehCerta ? 'explicacao-certa' : 'explicacao-errada';

      // Cabeçalho: "✓ b) <conteúdo da alternativa> — correta".
      // O conteúdo é COPIADO da alternativa (sem o botão de opção), para que
      // matrizes e outras marcações apareçam iguais às do exercício.
      const cabecalho = document.createElement('strong');
      cabecalho.append((ehCerta ? '✓ ' : '✕ ') + letra + ') ');
      Array.from(rotulo.childNodes).forEach((no) => {
        if (no !== radio) cabecalho.append(no.cloneNode(true));
      });
      cabecalho.append(ehCerta ? ' — correta' : ' — errada');

      const texto = document.createElement('span');
      texto.textContent = radio.dataset.explicacao;

      item.append(cabecalho, texto);
      lista.append(item);
    });
  });

  if (lista.children.length === 0) return;
  quadro.append(lista);
  exercicio.append(quadro);
}


/* =========================================================================
   4. CORREÇÃO DO BLOCO INTEIRO
   ========================================================================= */
function corrigirBloco(bloco, exercicios, resumo, numeroLicao) {
  const acertos = exercicios.filter(corrigirExercicio).length;
  const total = exercicios.length;

  resumo.classList.remove('acerto', 'erro');

  if (acertos === total) {
    resumo.textContent = 'Você acertou todos os ' + total + ' exercícios!' +
      (numeroLicao < 12 ? ' A próxima lição está liberada.' : '');
    resumo.classList.add('acerto');
    if (typeof concluirLicao === 'function') {
      concluirLicao(numeroLicao);
    }
  } else {
    resumo.textContent = 'Você acertou ' + acertos + ' de ' + total +
      '. Corrija os que estão em vermelho e verifique de novo.';
    resumo.classList.add('erro');

    // Leva o aluno até o primeiro exercício errado.
    const primeiroErrado = exercicios.find((e) => !e.classList.contains('correto'));
    const campo = primeiroErrado &&
      (primeiroErrado.querySelector('input:checked') || primeiroErrado.querySelector('input, select'));
    if (campo) campo.focus();
  }
  resumo.hidden = false;
}


/* =========================================================================
   5. INICIALIZAÇÃO
   ========================================================================= */
document.querySelectorAll('.exercicios[data-licao]').forEach(prepararBlocoDeExercicios);
