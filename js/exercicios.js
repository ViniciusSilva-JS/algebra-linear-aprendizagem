/* =========================================================================
   js/exercicios.js — Correção automática dos exercícios
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
     </ol>
   </div>

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

  // Ao editar um campo, tira a cor verde/vermelha dele.
  bloco.addEventListener('input', (evento) => {
    evento.target.classList.remove('acerto', 'erro');
  });
}


/* =========================================================================
   2. CORREÇÃO DE UM CAMPO
   Devolve 'certo', 'errado' ou 'vazio'.
   ========================================================================= */
function corrigirCampo(campo) {
  const esperado = campo.dataset.resposta;
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


/* =========================================================================
   3. CORREÇÃO DE UM EXERCÍCIO
   Pinta cada campo e escreve o feedback. Devolve true se estiver certo.
   ========================================================================= */
function corrigirExercicio(exercicio) {
  const campos = Array.from(exercicio.querySelectorAll('[data-resposta]'));
  const feedback = exercicio.querySelector('.feedback');

  let algumVazio = false;
  let tudoCerto = true;

  campos.forEach((campo) => {
    const resultado = corrigirCampo(campo);
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
    feedback.textContent = 'Preencha a resposta antes de verificar.';
    feedback.classList.add('erro');
  } else {
    const dica = exercicio.dataset.dica;
    feedback.textContent = dica ? 'Ainda não. Dica: ' + dica : 'Ainda não. Tente de novo.';
    feedback.classList.add('erro');
  }
  feedback.hidden = false;

  exercicio.classList.toggle('correto', tudoCerto);
  return tudoCerto;
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
    const campo = primeiroErrado && primeiroErrado.querySelector('[data-resposta]');
    if (campo) campo.focus();
  }
  resumo.hidden = false;
}


/* =========================================================================
   5. INICIALIZAÇÃO
   ========================================================================= */
document.querySelectorAll('.exercicios[data-licao]').forEach(prepararBlocoDeExercicios);
