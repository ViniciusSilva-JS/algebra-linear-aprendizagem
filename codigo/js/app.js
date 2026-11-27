/* =========================================================================
   Álgebra Linear — Trilha de Aprendizagem
   js/app.js — Navegação, trilhas, desbloqueio de lições, progresso, nível e tema

   O site tem DUAS trilhas, cada uma com o seu progresso:
   - Álgebra Linear      → seções  id="licao-N"  (hash #licao-N)
   - Geometria Analítica → seções  id="ga-N" data-trilha="ga"  (hash #ga-N)
   A matéria escolhida na tela inicial decide qual trilha aparece na
   navegação. O nível escolhido decide quais exercícios aparecem
   (ver js/componentes/exercicios.js). O modo decide como as lições abrem:
   - "trilha": em ordem, cada lição libera a próxima;
   - "livre":  todas abertas, o aluno escolhe qual ver (o progresso
               continua sendo marcado).

   Índice
   1.  Configurações
   2.  Elementos da página
   3.  Estado (o que o sistema "lembra" enquanto está aberto)
   4.  Armazenamento (localStorage com try/catch)
   5.  Regras da trilha (liberada / concluída)
   6.  Navegação por hash (#inicio, #licao-1, #ga-1 ...)
   7.  Atualização da interface (nav, lições, progresso)
   8.  concluirLicao(numero, trilha) e recomeçar
   9.  Rodapé de cada lição (botões criados pelo JS)
   10. Menu no celular
   11. Aviso flutuante
   12. Matéria, modo e nível
   13. Tema claro / escuro
   14. Eventos
   15. Inicialização
   ========================================================================= */

'use strict';


/* =========================================================================
   1. CONFIGURAÇÕES
   ========================================================================= */
const TRILHAS = {
  al: {
    nome: 'Álgebra Linear',
    materia: 'algebra-linear',            // value do rádio na tela inicial
    prefixo: 'licao',                     // hash e id: #licao-3
    chave: 'trilha-alga:concluidas',      // progresso no localStorage
  },
  ga: {
    nome: 'Geometria Analítica',
    materia: 'geometria-analitica',
    prefixo: 'ga',
    chave: 'trilha-alga:concluidas-ga',
  },
};
const NIVEIS = ['basico', 'intermediario', 'avancado'];
const MODOS = ['trilha', 'livre'];

const CHAVE_MATERIA = 'trilha-alga:materia';
const CHAVE_MODO = 'trilha-alga:modo';
const CHAVE_NIVEL = 'trilha-alga:nivel';
const CHAVE_TEMA = 'trilha-alga:tema';
const TEMPO_AVISO = 3500; // quanto tempo (ms) o aviso fica na tela
const SUFIXO_TITULO = ' — Trilha de Aprendizagem'; // "Geometria Analítica — Trilha de Aprendizagem"


/* =========================================================================
   2. ELEMENTOS DA PÁGINA
   ========================================================================= */
const raiz = document.documentElement; // a tag <html>

const secaoConfiguracao = document.getElementById('configuracao');
const formConfiguracao = document.getElementById('form-configuracao');
const btnComecar = document.getElementById('btn-comecar');
const radiosMateria = Array.from(document.querySelectorAll('input[name="materia"]'));
const radiosNivel = Array.from(document.querySelectorAll('input[name="nivel"]'));
const radiosModo = Array.from(document.querySelectorAll('input[name="modo"]'));
const campoLicao = document.getElementById('campo-licao');       // "Qual lição?" (modo livre)
const selectLicao = document.getElementById('escolha-licao');
const dicaModo = document.getElementById('dica-modo');

const nav = document.getElementById('trilha');
const tituloNav = nav.querySelector('.trilha-titulo');
const btnMenu = document.getElementById('btn-menu');
const textoMenu = btnMenu.querySelector('.trilha-toggle-texto');
const listasTrilha = Array.from(document.querySelectorAll('.trilha-lista'));
const itensTrilha = Array.from(document.querySelectorAll('.trilha-item'));

const conteudo = document.getElementById('conteudo');
const secaoInicio = document.getElementById('inicio');
const secoesLicao = Array.from(document.querySelectorAll('.licao'));

const caixaProgresso = document.getElementById('progresso');
const barraProgresso = document.getElementById('progresso-barra');
const textoProgresso = document.getElementById('progresso-texto');
const btnRecomecar = document.getElementById('btn-recomecar');

const tituloMateria = document.getElementById('titulo-materia'); // nome da matéria no cabeçalho
const cabecalho = document.getElementById('cabecalho');
const btnEscolher = document.getElementById('btn-escolher');     // "Trocar matéria ou nível"
const btnTema = document.getElementById('btn-tema');
const aviso = document.getElementById('aviso');

/** Trilha de um elemento: data-trilha="ga" ou, sem o atributo, Álgebra Linear. */
function trilhaDe(elemento) {
  const t = elemento.closest('[data-trilha]');
  return t && TRILHAS[t.dataset.trilha] ? t.dataset.trilha : 'al';
}

/** Seção de cada lição: secoes.al[3] é a lição 3 de Álgebra Linear. */
const secoes = { al: {}, ga: {} };
secoesLicao.forEach((secao) => {
  secoes[trilhaDe(secao)][Number(secao.dataset.licao)] = secao;
});

/** Quantas lições a trilha tem (contadas no próprio HTML). */
function totalDeLicoes(trilha) {
  return Object.keys(secoes[trilha]).length;
}


/* =========================================================================
   3. ESTADO
   ========================================================================= */
const concluidas = { al: new Set(), ga: new Set() }; // ex.: concluidas.al = {1, 2}
let trilhaAtual = 'al';                       // trilha mostrada na navegação
let telaAtual = { trilha: 'al', n: 0 };       // n = 0 → tela inicial
let nivelAtual = 'basico';
let modoAtual = 'trilha';                     // 'trilha' (em ordem) ou 'livre'
let primeiraTela = true;   // na 1ª exibição não movemos o foco do teclado
let timerAviso = null;     // controla o sumiço automático do aviso


/* =========================================================================
   4. ARMAZENAMENTO
   O localStorage pode falhar (modo privado, cookies bloqueados etc.).
   Por isso toda leitura e gravação fica dentro de try/catch: se falhar,
   o sistema continua funcionando, só não lembra o progresso depois.
   ========================================================================= */

/** Lê um texto do localStorage. Devolve null se não existir ou se falhar. */
function lerStorage(chave) {
  try {
    return localStorage.getItem(chave);
  } catch (erro) {
    return null;
  }
}

/** Grava um texto no localStorage. Se valor for null, apaga a chave. */
function gravarStorage(chave, valor) {
  try {
    if (valor === null) {
      localStorage.removeItem(chave);
    } else {
      localStorage.setItem(chave, valor);
    }
  } catch (erro) {
    // Sem localStorage: ignoramos e seguimos normalmente.
  }
}

/** Carrega as lições concluídas de uma trilha, aceitando só números válidos. */
function carregarProgresso(trilha) {
  const texto = lerStorage(TRILHAS[trilha].chave);
  if (!texto) return new Set();

  try {
    const lista = JSON.parse(texto);
    if (!Array.isArray(lista)) return new Set();
    return new Set(lista.filter((n) => ehNumeroDeLicao(trilha, n)));
  } catch (erro) {
    return new Set(); // texto corrompido: começa do zero
  }
}

/** Salva as lições concluídas como uma lista em ordem, ex.: "[1,2,3]". */
function salvarProgresso(trilha) {
  const lista = Array.from(concluidas[trilha]).sort((a, b) => a - b);
  gravarStorage(TRILHAS[trilha].chave, JSON.stringify(lista));
}


/* =========================================================================
   5. REGRAS DA TRILHA
   ========================================================================= */

/** Confere se n é o número de uma lição que existe na trilha. */
function ehNumeroDeLicao(trilha, n) {
  return Number.isInteger(n) && n >= 1 && n <= totalDeLicoes(trilha);
}

/**
 * No modo livre, todas as lições estão liberadas.
 * No modo trilha, a lição 1 está sempre liberada; as outras, só se a anterior foi concluída.
 */
function estaLiberada(trilha, n) {
  if (modoAtual === 'livre') return true;
  return n === 1 || concluidas[trilha].has(n - 1);
}

function estaNoModoLivre() {
  return modoAtual === 'livre';
}

function estaConcluida(trilha, n) {
  return concluidas[trilha].has(n);
}

/** É a última lição da trilha? (usado pelos exercícios na mensagem final) */
function ehUltimaLicao(trilha, n) {
  return n === totalDeLicoes(trilha);
}

/** Primeira lição ainda não concluída (para o botão "Começar/Continuar"). */
function proximaLicaoParaEstudar(trilha) {
  const total = totalDeLicoes(trilha);
  for (let n = 1; n <= total; n++) {
    if (!estaConcluida(trilha, n)) return n;
  }
  return total; // tudo concluído: abre a última
}

/** Título de uma lição, lido do próprio HTML (ex.: "3. Produto escalar e ângulo"). */
function tituloDaLicao(trilha, n) {
  const secao = secoes[trilha][n];
  const titulo = secao && secao.querySelector('.licao-titulo');
  return titulo ? titulo.textContent.trim() : 'Lição ' + n;
}


/* =========================================================================
   6. NAVEGAÇÃO POR HASH
   A tela atual fica na URL (ex.: index.html#licao-3 ou #ga-2). Assim:
   - o botão voltar/avançar do navegador funciona;
   - um link direto abre a lição certa.
   ========================================================================= */

/** Monta o hash de uma tela: n = 0 → "#inicio", ('ga', 2) → "#ga-2". */
function hashDaTela(trilha, n) {
  return n === 0 ? '#inicio' : '#' + TRILHAS[trilha].prefixo + '-' + n;
}

/** Converte "licao-3", "#ga-2" ou "inicio" em { trilha, n }. */
function telaDoTexto(texto) {
  const limpo = String(texto).replace(/^#/, '');
  const encontrado = /^([a-z]+)-(\d+)$/.exec(limpo);
  if (encontrado) {
    const trilha = Object.keys(TRILHAS).find((t) => TRILHAS[t].prefixo === encontrado[1]);
    const n = Number(encontrado[2]);
    if (trilha && ehNumeroDeLicao(trilha, n)) return { trilha, n };
  }
  return { trilha: trilhaAtual, n: 0 }; // vazio ou desconhecido → tela inicial
}

function telaDoHash() {
  return telaDoTexto(decodeURIComponent(window.location.hash.slice(1)));
}

/**
 * Pedido para ir a uma tela (clique na nav, botões etc.).
 * Se a lição estiver bloqueada, mostra o aviso e não sai do lugar.
 */
function irPara(trilha, n) {
  if (n !== 0 && !estaLiberada(trilha, n)) {
    mostrarAviso('Conclua a lição anterior primeiro');
    return;
  }

  if (window.location.hash === hashDaTela(trilha, n)) {
    // Já estamos nesse hash (o evento hashchange não dispararia): só mostra.
    mostrarTela(trilha, n);
  } else {
    // Muda a URL; o evento "hashchange" chama aoMudarHash() em seguida.
    window.location.hash = hashDaTela(trilha, n);
  }
}

/** Chamado quando o hash muda (clique, voltar/avançar, link direto). */
function aoMudarHash() {
  const { trilha, n } = telaDoHash();

  if (n !== 0 && !estaLiberada(trilha, n)) {
    // Ex.: link direto para #licao-5 sem ter feito a 4.
    mostrarAviso('Conclua a lição anterior primeiro');
    // Volta para a tela de antes, a não ser que ela também tenha ficado
    // bloqueada (ex.: trocou do modo livre para o modo trilha): aí, o início.
    const volta = telaAtual.n !== 0 && !estaLiberada(telaAtual.trilha, telaAtual.n)
      ? { trilha: telaAtual.trilha, n: 0 }
      : telaAtual;
    // Troca a URL de volta SEM criar uma nova entrada no histórico.
    history.replaceState(null, '', hashDaTela(volta.trilha, volta.n));
    mostrarTela(volta.trilha, volta.n);
    return;
  }

  mostrarTela(trilha, n);
}

/** Mostra uma tela e esconde todas as outras. */
function mostrarTela(trilha, n) {
  telaAtual = { trilha, n };

  // Abrindo uma lição da outra matéria (ex.: link direto), a navegação acompanha.
  if (n !== 0 && trilha !== trilhaAtual) escolherMateria(trilha);

  // Tela inicial e escolha de matéria/nível só aparecem no início.
  secaoInicio.hidden = n !== 0;
  secaoConfiguracao.hidden = n !== 0;

  // Dentro das lições, o botão do cabeçalho leva de volta à escolha.
  btnEscolher.hidden = n === 0;
  cabecalho.classList.toggle('com-escolha', n !== 0);

  // Mostra apenas a lição escolhida.
  const atual = n === 0 ? null : secoes[trilha][n];
  secoesLicao.forEach((secao) => {
    secao.hidden = secao !== atual;
  });

  // Título da aba do navegador.
  document.title = n === 0
    ? TRILHAS[trilhaAtual].nome + SUFIXO_TITULO
    : tituloDaLicao(trilha, n) + ' — ' + TRILHAS[trilha].nome;

  atualizarNav();
  fecharMenu();

  // Volta para o topo da página.
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Acessibilidade: leva o foco do teclado/leitor de tela para o título
  // da nova tela (menos na primeira carga da página).
  if (!primeiraTela) {
    const titulo = (atual || secaoInicio).querySelector('h2');
    if (titulo) {
      titulo.setAttribute('tabindex', '-1');
      titulo.focus({ preventScroll: true });
    }
  }
  primeiraTela = false;
}


/* =========================================================================
   7. ATUALIZAÇÃO DA INTERFACE
   ========================================================================= */

/** Atualiza tudo que depende do progresso. */
function atualizarTudo() {
  atualizarNav();
  atualizarRodapesDasLicoes();
  atualizarProgresso();
}

/** Mostra a lista da trilha escolhida e aplica .ativa, .concluida e .bloqueada. */
function atualizarNav() {
  listasTrilha.forEach((lista) => {
    const daTrilha = trilhaDe(lista) === trilhaAtual;
    lista.hidden = !daTrilha;
    if (daTrilha) btnMenu.setAttribute('aria-controls', lista.id);
  });
  tituloNav.textContent = 'Trilha: ' + TRILHAS[trilhaAtual].nome;

  // Cabeçalho e título da aba mostram a matéria escolhida.
  if (tituloMateria) tituloMateria.textContent = TRILHAS[trilhaAtual].nome;
  if (telaAtual.n === 0) document.title = TRILHAS[trilhaAtual].nome + SUFIXO_TITULO;
  nav.setAttribute('aria-label', 'Trilha de lições de ' + TRILHAS[trilhaAtual].nome);

  itensTrilha.forEach((item) => {
    const trilha = trilhaDe(item);
    const n = Number(item.dataset.licao);
    const link = item.querySelector('.trilha-link');
    const ativa = trilha === telaAtual.trilha && n === telaAtual.n;
    const bloqueada = !estaLiberada(trilha, n);

    item.classList.toggle('ativa', ativa);
    item.classList.toggle('concluida', estaConcluida(trilha, n));
    item.classList.toggle('bloqueada', bloqueada);

    // Informações para leitores de tela.
    if (ativa) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
    if (bloqueada) {
      link.setAttribute('aria-disabled', 'true');
      link.title = 'Bloqueada: conclua a lição anterior';
    } else {
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
    }
  });

  // Texto do botão do menu no celular mostra onde o aluno está.
  textoMenu.textContent = telaAtual.n === 0
    ? 'Trilha: ' + TRILHAS[trilhaAtual].nome
    : 'Lição ' + tituloDaLicao(telaAtual.trilha, telaAtual.n);
}

/** Barra de progresso e texto "X de 12 lições concluídas" da tela inicial. */
function atualizarProgresso() {
  const total = totalDeLicoes(trilhaAtual);
  const feitas = concluidas[trilhaAtual].size;
  const porcentagem = total ? Math.round((feitas / total) * 100) : 0;
  const frase = feitas + ' de ' + total + ' lições concluídas em ' + TRILHAS[trilhaAtual].nome;

  barraProgresso.style.width = porcentagem + '%';
  caixaProgresso.setAttribute('aria-valuemax', String(total));
  caixaProgresso.setAttribute('aria-valuenow', String(feitas));
  caixaProgresso.setAttribute('aria-valuetext', frase);
  textoProgresso.textContent = frase;

  // Sem progresso, não há o que apagar.
  btnRecomecar.disabled = feitas === 0;

  // O botão do formulário muda de texto conforme o modo e se o aluno já começou.
  if (modoAtual === 'livre') {
    btnComecar.textContent = 'Abrir lição';
  } else {
    btnComecar.textContent = feitas === 0 ? 'Começar trilha' : 'Continuar trilha';
  }
  atualizarEscolhaDeLicao();
}

/**
 * Lista "Qual lição?" do modo livre: as lições da matéria escolhida, com ✓ nas
 * concluídas. Mantém a lição que o aluno já tinha escolhido; se não houver,
 * sugere a primeira ainda não concluída.
 */
function atualizarEscolhaDeLicao() {
  const anterior = Number(selectLicao.value);
  const total = totalDeLicoes(trilhaAtual);
  const escolhida = selectLicao.dataset.trilha === trilhaAtual && ehNumeroDeLicao(trilhaAtual, anterior)
    ? anterior
    : proximaLicaoParaEstudar(trilhaAtual);

  selectLicao.textContent = '';
  for (let n = 1; n <= total; n++) {
    const opcao = document.createElement('option');
    opcao.value = String(n);
    opcao.textContent = tituloDaLicao(trilhaAtual, n) + (estaConcluida(trilhaAtual, n) ? ' ✓' : '');
    opcao.selected = n === escolhida;
    selectLicao.append(opcao);
  }
  selectLicao.dataset.trilha = trilhaAtual;
}


/* =========================================================================
   8. CONCLUIR LIÇÃO E RECOMEÇAR
   ========================================================================= */

/**
 * Marca a lição como concluída e libera a próxima.
 * Chamada pelos exercícios quando o aluno acerta tudo.
 * Devolve true se deu certo e false se a lição não pôde ser concluída.
 */
function concluirLicao(numero, trilha) {
  const t = TRILHAS[trilha] ? trilha : 'al';
  const n = Number(numero);

  if (!ehNumeroDeLicao(t, n)) return false;
  if (!estaLiberada(t, n)) {
    mostrarAviso('Conclua a lição anterior primeiro');
    return false;
  }

  const eraNova = !concluidas[t].has(n);
  concluidas[t].add(n);
  salvarProgresso(t);
  atualizarTudo();

  if (eraNova) {
    let mensagem;
    if (concluidas[t].size === totalDeLicoes(t)) {
      mensagem = 'Parabéns! Você concluiu todas as lições de ' + TRILHAS[t].nome + '.';
    } else if (modoAtual === 'livre' || ehUltimaLicao(t, n)) {
      // No modo livre não existe "liberar a próxima": todas já estão abertas.
      mensagem = 'Lição ' + n + ' concluída!';
    } else {
      mensagem = 'Lição ' + n + ' concluída! A lição ' + (n + 1) + ' foi liberada.';
    }
    mostrarAviso(mensagem, 'acerto');
  }
  return true;
}

/** Apaga o progresso da trilha escolhida (depois de confirmar) e volta ao início. */
function recomecarTrilha() {
  const nome = TRILHAS[trilhaAtual].nome;
  const confirmou = window.confirm(
    'Tem certeza que deseja recomeçar a trilha de ' + nome + '?\n' +
    'Todo o seu progresso nela será apagado.'
  );
  if (!confirmou) return;

  concluidas[trilhaAtual].clear();
  gravarStorage(TRILHAS[trilhaAtual].chave, null);
  atualizarTudo();
  irPara(trilhaAtual, 0);
  mostrarAviso('Progresso apagado. Bons estudos!', 'acerto');
}

// Deixa as funções acessíveis para os outros arquivos (exercícios).
window.concluirLicao = concluirLicao;
window.ehUltimaLicao = ehUltimaLicao;
window.estaNoModoLivre = estaNoModoLivre;


/* =========================================================================
   9. RODAPÉ DE CADA LIÇÃO
   Criados aqui (e não no HTML) para não repetir o mesmo código em cada lição.
   Cada lição ganha:
   - botão "Marcar como concluída" (só nas lições ainda sem exercícios);
   - "◀ Lição anterior" (na lição 1: "◀ Início");
   - "Próxima lição ▶" (menos na última).
   O destino fica em data-ir, no mesmo formato do hash ("licao-3", "ga-2", "inicio").
   ========================================================================= */

/** Cria um <button> com texto e classes. */
function criarBotao(texto, classes) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = classes;
  botao.textContent = texto;
  return botao;
}

function criarRodapesDasLicoes() {
  secoesLicao.forEach((secao) => {
    const trilha = trilhaDe(secao);
    const n = Number(secao.dataset.licao);

    const rodape = document.createElement('div');
    rodape.className = 'licao-rodape';

    // Botão de concluir: só nas lições que ainda não têm exercícios
    // (.exercicio). Nas outras, quem conclui é o js/componentes/exercicios.js.
    if (!secao.querySelector('.exercicio')) {
      const btnConcluir = criarBotao('Marcar como concluída', 'btn btn-concluir');
      btnConcluir.dataset.concluir = trilha + ':' + n;
      rodape.append(btnConcluir);
    }

    // Navegação entre lições
    const navegacao = document.createElement('div');
    navegacao.className = 'licao-navegacao';

    const btnAnterior = criarBotao(
      n === 1 ? '◀ Início' : '◀ Lição anterior',
      'btn-secundario btn-anterior'
    );
    btnAnterior.dataset.ir = hashDaTela(trilha, n - 1).slice(1);
    navegacao.append(btnAnterior);

    if (!ehUltimaLicao(trilha, n)) {
      const btnProxima = criarBotao('Próxima lição ▶', 'btn-secundario btn-proxima');
      btnProxima.dataset.ir = hashDaTela(trilha, n + 1).slice(1);
      navegacao.append(btnProxima);
    }

    rodape.append(navegacao);
    secao.append(rodape);
  });
}

/** Atualiza o estado dos botões do rodapé conforme o progresso. */
function atualizarRodapesDasLicoes() {
  secoesLicao.forEach((secao) => {
    const trilha = trilhaDe(secao);
    const n = Number(secao.dataset.licao);

    const btnConcluir = secao.querySelector('.btn-concluir');
    if (btnConcluir) {
      const feita = estaConcluida(trilha, n);
      btnConcluir.disabled = feita;
      btnConcluir.textContent = feita ? '✓ Lição concluída' : 'Marcar como concluída';
    }

    const btnProxima = secao.querySelector('.btn-proxima');
    if (btnProxima) {
      const liberada = estaLiberada(trilha, n + 1);
      // Não usamos "disabled" para que o clique ainda mostre o aviso.
      btnProxima.setAttribute('aria-disabled', String(!liberada));
      btnProxima.textContent = liberada ? 'Próxima lição ▶' : 'Próxima lição 🔒';
    }
  });
}


/* =========================================================================
   10. MENU NO CELULAR
   No celular a lista de lições fica recolhida atrás do botão #btn-menu.
   No desktop o botão fica escondido pelo CSS e isto não tem efeito visível.
   ========================================================================= */
function abrirMenu() {
  nav.classList.add('aberta');
  btnMenu.setAttribute('aria-expanded', 'true');
}

function fecharMenu() {
  nav.classList.remove('aberta');
  btnMenu.setAttribute('aria-expanded', 'false');
}

function alternarMenu() {
  if (nav.classList.contains('aberta')) {
    fecharMenu();
  } else {
    abrirMenu();
  }
}


/* =========================================================================
   11. AVISO FLUTUANTE
   tipo: 'erro' (padrão, vermelho) ou 'acerto' (verde) — usa as classes
   .erro e .acerto do CSS.
   ========================================================================= */
function mostrarAviso(texto, tipo) {
  const classe = tipo === 'acerto' ? 'acerto' : 'erro';

  aviso.textContent = texto;
  aviso.classList.remove('acerto', 'erro');
  aviso.classList.add(classe);
  aviso.hidden = false;

  // Reinicia o cronômetro se já havia um aviso na tela.
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => {
    aviso.hidden = true;
  }, TEMPO_AVISO);
}


/* =========================================================================
   12. MATÉRIA, MODO E NÍVEL
   - Matéria: troca a trilha da navegação e do progresso.
   - Modo: "trilha" (lições em ordem) ou "livre" (todas abertas).
   - Nível: troca os exercícios que aparecem (exercicios.js).
   As três escolhas ficam salvas para a próxima visita.
   ========================================================================= */
const DICAS_MODO = {
  trilha: 'As lições são liberadas em ordem: acerte os exercícios de uma para abrir a próxima.',
  livre: 'Todas as lições ficam abertas: escolha qual quer ver. As que você concluir continuam marcadas com ✓.',
};

function escolherModo(modo) {
  if (!MODOS.includes(modo)) modo = 'trilha';
  modoAtual = modo;
  raiz.dataset.modo = modo;
  radiosModo.forEach((r) => { r.checked = r.value === modo; });
  campoLicao.hidden = modo !== 'livre';
  dicaModo.textContent = DICAS_MODO[modo];
  gravarStorage(CHAVE_MODO, modo);
  atualizarTudo();
}

function escolherMateria(trilha) {
  if (!TRILHAS[trilha]) return;
  trilhaAtual = trilha;
  radiosMateria.forEach((r) => { r.checked = r.value === TRILHAS[trilha].materia; });
  gravarStorage(CHAVE_MATERIA, trilha);
  atualizarTudo();
}

function escolherNivel(nivel) {
  if (!NIVEIS.includes(nivel)) nivel = 'basico';
  nivelAtual = nivel;
  raiz.dataset.nivel = nivel;
  radiosNivel.forEach((r) => { r.checked = r.value === nivel; });
  gravarStorage(CHAVE_NIVEL, nivel);
  if (typeof aplicarNivelExercicios === 'function') aplicarNivelExercicios(nivel);
}

function iniciarEscolhas() {
  const materiaSalva = lerStorage(CHAVE_MATERIA);
  trilhaAtual = TRILHAS[materiaSalva] ? materiaSalva : 'al';
  radiosMateria.forEach((r) => { r.checked = r.value === TRILHAS[trilhaAtual].materia; });
  escolherNivel(lerStorage(CHAVE_NIVEL));
  escolherModo(lerStorage(CHAVE_MODO));
}


/* =========================================================================
   13. TEMA CLARO / ESCURO
   - Sem escolha salva: segue o sistema (o <html> fica sem data-theme).
   - Ao clicar no botão: grava "light" ou "dark" no data-theme e no
     localStorage.
   ========================================================================= */
const midiaEscura = window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

/** Tema que está aparecendo agora: 'light' ou 'dark'. */
function temaAtual() {
  const escolhido = raiz.getAttribute('data-theme');
  if (escolhido === 'light' || escolhido === 'dark') return escolhido;
  return midiaEscura && midiaEscura.matches ? 'dark' : 'light';
}

/** O botão mostra para qual tema ele vai mudar. */
function atualizarBotaoTema() {
  const escuro = temaAtual() === 'dark';
  btnTema.textContent = escuro ? '☀️ Modo claro' : '🌙 Modo escuro';
  btnTema.setAttribute('aria-label', escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
}

function alternarTema() {
  const novo = temaAtual() === 'dark' ? 'light' : 'dark';
  raiz.setAttribute('data-theme', novo);
  gravarStorage(CHAVE_TEMA, novo);
  atualizarBotaoTema();
}

function iniciarTema() {
  const salvo = lerStorage(CHAVE_TEMA);
  if (salvo === 'light' || salvo === 'dark') {
    raiz.setAttribute('data-theme', salvo);
  }
  atualizarBotaoTema();

  // Se o aluno ainda não escolheu e o sistema mudar de tema, o botão acompanha.
  if (midiaEscura && midiaEscura.addEventListener) {
    midiaEscura.addEventListener('change', atualizarBotaoTema);
  }
}


/* =========================================================================
   14. EVENTOS
   ========================================================================= */
function registrarEventos() {
  // Voltar/avançar do navegador e mudanças de hash.
  window.addEventListener('hashchange', aoMudarHash);

  // Cliques na trilha (um único "ouvinte" para todos os links).
  nav.addEventListener('click', (evento) => {
    const link = evento.target.closest('.trilha-link');
    if (!link) return;
    evento.preventDefault(); // quem decide se pode abrir é o irPara()
    const item = link.closest('.trilha-item');
    irPara(trilhaDe(item), Number(item.dataset.licao));
  });

  // Botão do menu (celular).
  btnMenu.addEventListener('click', alternarMenu);

  // Tecla Esc fecha o menu.
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && nav.classList.contains('aberta')) {
      fecharMenu();
      btnMenu.focus();
    }
  });

  // Botões dentro das lições: anterior/próxima e concluir.
  conteudo.addEventListener('click', (evento) => {
    const botaoIr = evento.target.closest('[data-ir]');
    if (botaoIr) {
      const destino = telaDoTexto(botaoIr.dataset.ir);
      irPara(destino.trilha, destino.n);
      return;
    }
    const botaoConcluir = evento.target.closest('[data-concluir]');
    if (botaoConcluir) {
      const [trilha, n] = botaoConcluir.dataset.concluir.split(':');
      concluirLicao(Number(n), trilha);
    }
  });

  // Matéria e nível: valem na hora, mesmo antes de clicar em "Começar".
  radiosMateria.forEach((r) => r.addEventListener('change', () => {
    const trilha = Object.keys(TRILHAS).find((t) => TRILHAS[t].materia === r.value);
    escolherMateria(trilha);
  }));
  radiosNivel.forEach((r) => r.addEventListener('change', () => escolherNivel(r.value)));
  radiosModo.forEach((r) => r.addEventListener('change', () => escolherModo(r.value)));

  // "Começar/Continuar trilha" abre a próxima lição; no modo livre, "Abrir lição"
  // abre a lição escolhida na lista. Tudo sem recarregar a página.
  formConfiguracao.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const n = modoAtual === 'livre' ? Number(selectLicao.value) : proximaLicaoParaEstudar(trilhaAtual);
    irPara(trilhaAtual, ehNumeroDeLicao(trilhaAtual, n) ? n : 1);
  });

  btnRecomecar.addEventListener('click', recomecarTrilha);
  btnTema.addEventListener('click', alternarTema);

  // "Trocar matéria, modo ou nível": volta para a tela inicial, onde fica a escolha.
  btnEscolher.addEventListener('click', () => irPara(trilhaAtual, 0));
}


/* =========================================================================
   15. INICIALIZAÇÃO
   ========================================================================= */
function iniciar() {
  iniciarTema();
  Object.keys(TRILHAS).forEach((t) => { concluidas[t] = carregarProgresso(t); });
  iniciarEscolhas();
  criarRodapesDasLicoes();
  registrarEventos();
  atualizarTudo();
  aoMudarHash(); // abre a tela indicada na URL (ou o início)
}

iniciar();
