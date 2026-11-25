/* =========================================================================
   Álgebra Linear — Trilha de Aprendizagem
   js/app.js — Navegação, desbloqueio de lições, progresso e tema

   Índice
   1.  Configurações
   2.  Elementos da página
   3.  Estado (o que o sistema "lembra" enquanto está aberto)
   4.  Armazenamento (localStorage com try/catch)
   5.  Regras da trilha (liberada / concluída)
   6.  Navegação por hash (#inicio, #licao-1 ... #licao-12)
   7.  Atualização da interface (nav, lições, progresso)
   8.  concluirLicao(numero) e recomeçar
   9.  Rodapé de cada lição (botões criados pelo JS)
   10. Menu no celular
   11. Aviso flutuante
   12. Tema claro / escuro
   13. Eventos
   14. Inicialização
   ========================================================================= */

'use strict';


/* =========================================================================
   1. CONFIGURAÇÕES
   ========================================================================= */
const TOTAL_LICOES = 12;
const CHAVE_CONCLUIDAS = 'trilha-alga:concluidas'; // chave do progresso no localStorage
const CHAVE_TEMA = 'trilha-alga:tema';             // chave do tema no localStorage
const TEMPO_AVISO = 3500;                          // quanto tempo (ms) o aviso fica na tela
const TITULO_ORIGINAL = document.title;


/* =========================================================================
   2. ELEMENTOS DA PÁGINA
   ========================================================================= */
const raiz = document.documentElement; // a tag <html>

const secaoConfiguracao = document.getElementById('configuracao');
const formConfiguracao = document.getElementById('form-configuracao');
const btnComecar = document.getElementById('btn-comecar');

const nav = document.getElementById('trilha');
const btnMenu = document.getElementById('btn-menu');
const textoMenu = btnMenu.querySelector('.trilha-toggle-texto');
const itensTrilha = Array.from(document.querySelectorAll('.trilha-item'));

const conteudo = document.getElementById('conteudo');
const secaoInicio = document.getElementById('inicio');
const secoesLicao = Array.from(document.querySelectorAll('.licao'));

const caixaProgresso = document.getElementById('progresso');
const barraProgresso = document.getElementById('progresso-barra');
const textoProgresso = document.getElementById('progresso-texto');
const btnRecomecar = document.getElementById('btn-recomecar');

const btnTema = document.getElementById('btn-tema');
const aviso = document.getElementById('aviso');


/* =========================================================================
   3. ESTADO
   ========================================================================= */
let concluidas = new Set();  // números das lições concluídas, ex.: {1, 2}
let telaAtual = 0;           // 0 = tela inicial; 1 a 12 = número da lição
let primeiraTela = true;     // na 1ª exibição não movemos o foco do teclado
let timerAviso = null;       // controla o sumiço automático do aviso


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

/** Carrega as lições concluídas, aceitando só números válidos (1 a 12). */
function carregarProgresso() {
  const texto = lerStorage(CHAVE_CONCLUIDAS);
  if (!texto) return new Set();

  try {
    const lista = JSON.parse(texto);
    if (!Array.isArray(lista)) return new Set();
    return new Set(lista.filter(ehNumeroDeLicao));
  } catch (erro) {
    return new Set(); // texto corrompido: começa do zero
  }
}

/** Salva as lições concluídas como uma lista em ordem, ex.: "[1,2,3]". */
function salvarProgresso() {
  const lista = Array.from(concluidas).sort((a, b) => a - b);
  gravarStorage(CHAVE_CONCLUIDAS, JSON.stringify(lista));
}


/* =========================================================================
   5. REGRAS DA TRILHA
   ========================================================================= */

/** Confere se n é um número inteiro de 1 a 12. */
function ehNumeroDeLicao(n) {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_LICOES;
}

/** A lição 1 está sempre liberada; as outras, só se a anterior foi concluída. */
function estaLiberada(n) {
  return n === 1 || concluidas.has(n - 1);
}

function estaConcluida(n) {
  return concluidas.has(n);
}

/** Primeira lição ainda não concluída (para o botão "Começar/Continuar"). */
function proximaLicaoParaEstudar() {
  for (let n = 1; n <= TOTAL_LICOES; n++) {
    if (!estaConcluida(n)) return n;
  }
  return TOTAL_LICOES; // tudo concluído: abre a última
}

/** Título de uma lição, lido do próprio HTML (ex.: "3. Produto escalar e ângulo"). */
function tituloDaLicao(n) {
  const secao = secoesLicao.find((s) => Number(s.dataset.licao) === n);
  const titulo = secao && secao.querySelector('.licao-titulo');
  return titulo ? titulo.textContent.trim() : 'Lição ' + n;
}


/* =========================================================================
   6. NAVEGAÇÃO POR HASH
   A tela atual fica na URL (ex.: index.html#licao-3). Assim:
   - o botão voltar/avançar do navegador funciona;
   - um link direto abre a lição certa.
   ========================================================================= */

/** Monta o hash de uma tela: 0 → "#inicio", 3 → "#licao-3". */
function hashDaTela(n) {
  return n === 0 ? '#inicio' : '#licao-' + n;
}

/** Lê o hash da URL e devolve o número da tela (0 = início). */
function telaDoHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1)); // tira o "#"
  const encontrado = /^licao-(\d+)$/.exec(hash);
  if (encontrado) {
    const n = Number(encontrado[1]);
    if (ehNumeroDeLicao(n)) return n;
  }
  return 0; // hash vazio ou desconhecido → tela inicial
}

/**
 * Pedido para ir a uma tela (clique na nav, botões etc.).
 * Se a lição estiver bloqueada, mostra o aviso e não sai do lugar.
 */
function irPara(n) {
  if (n !== 0 && !estaLiberada(n)) {
    mostrarAviso('Conclua a lição anterior primeiro');
    return;
  }

  if (window.location.hash === hashDaTela(n)) {
    // Já estamos nesse hash (o evento hashchange não dispararia): só mostra.
    mostrarTela(n);
  } else {
    // Muda a URL; o evento "hashchange" chama aoMudarHash() em seguida.
    window.location.hash = hashDaTela(n);
  }
}

/** Chamado quando o hash muda (clique, voltar/avançar, link direto). */
function aoMudarHash() {
  const n = telaDoHash();

  if (n !== 0 && !estaLiberada(n)) {
    // Ex.: link direto para #licao-5 sem ter feito a 4.
    mostrarAviso('Conclua a lição anterior primeiro');
    // Troca a URL de volta SEM criar uma nova entrada no histórico.
    history.replaceState(null, '', hashDaTela(telaAtual));
    mostrarTela(telaAtual);
    return;
  }

  mostrarTela(n);
}

/** Mostra uma tela e esconde todas as outras. */
function mostrarTela(n) {
  telaAtual = n;

  // Tela inicial e escolha de matéria/nível só aparecem no início.
  secaoInicio.hidden = n !== 0;
  secaoConfiguracao.hidden = n !== 0;

  // Mostra apenas a lição escolhida.
  secoesLicao.forEach((secao) => {
    secao.hidden = Number(secao.dataset.licao) !== n;
  });

  // Título da aba do navegador.
  document.title = n === 0 ? TITULO_ORIGINAL : tituloDaLicao(n) + ' — Álgebra Linear';

  atualizarNav();
  fecharMenu();

  // Volta para o topo da página.
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Acessibilidade: leva o foco do teclado/leitor de tela para o título
  // da nova tela (menos na primeira carga da página).
  if (!primeiraTela) {
    const secao = n === 0 ? secaoInicio : secoesLicao[n - 1];
    const titulo = secao.querySelector('h2');
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

/** Aplica .ativa, .concluida e .bloqueada em cada item da trilha. */
function atualizarNav() {
  itensTrilha.forEach((item) => {
    const n = Number(item.dataset.licao);
    const link = item.querySelector('.trilha-link');
    const ativa = n === telaAtual;
    const bloqueada = !estaLiberada(n);

    item.classList.toggle('ativa', ativa);
    item.classList.toggle('concluida', estaConcluida(n));
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
  textoMenu.textContent = telaAtual === 0
    ? 'Trilha de lições'
    : 'Lição ' + tituloDaLicao(telaAtual);
}

/** Barra de progresso e texto "X de 12 lições concluídas" da tela inicial. */
function atualizarProgresso() {
  const total = concluidas.size;
  const porcentagem = Math.round((total / TOTAL_LICOES) * 100);
  const frase = total + ' de ' + TOTAL_LICOES + ' lições concluídas';

  barraProgresso.style.width = porcentagem + '%';
  caixaProgresso.setAttribute('aria-valuenow', String(total));
  caixaProgresso.setAttribute('aria-valuetext', frase);
  textoProgresso.textContent = frase;

  // Sem progresso, não há o que apagar.
  btnRecomecar.disabled = total === 0;

  // O botão do formulário muda de texto se o aluno já começou.
  btnComecar.textContent = total === 0 ? 'Começar trilha' : 'Continuar trilha';
}


/* =========================================================================
   8. CONCLUIR LIÇÃO E RECOMEÇAR
   ========================================================================= */

/**
 * Marca a lição como concluída e libera a próxima.
 * Depois será chamada pelos exercícios quando o aluno acertar tudo.
 * Devolve true se deu certo e false se a lição não pôde ser concluída.
 */
function concluirLicao(numero) {
  const n = Number(numero);

  if (!ehNumeroDeLicao(n)) return false;
  if (!estaLiberada(n)) {
    mostrarAviso('Conclua a lição anterior primeiro');
    return false;
  }

  const eraNova = !concluidas.has(n);
  concluidas.add(n);
  salvarProgresso();
  atualizarTudo();

  if (eraNova) {
    const mensagem = n < TOTAL_LICOES
      ? 'Lição ' + n + ' concluída! A lição ' + (n + 1) + ' foi liberada.'
      : 'Parabéns! Você concluiu toda a trilha.';
    mostrarAviso(mensagem, 'acerto');
  }
  return true;
}

/** Apaga todo o progresso (depois de pedir confirmação) e volta ao início. */
function recomecarTrilha() {
  const confirmou = window.confirm(
    'Tem certeza que deseja recomeçar a trilha?\n' +
    'Todo o seu progresso será apagado.'
  );
  if (!confirmou) return;

  concluidas.clear();
  gravarStorage(CHAVE_CONCLUIDAS, null);
  atualizarTudo();
  irPara(0);
  mostrarAviso('Progresso apagado. Bons estudos!', 'acerto');
}

// Deixa a função acessível para os próximos arquivos/etapas.
window.concluirLicao = concluirLicao;


/* =========================================================================
   9. RODAPÉ DE CADA LIÇÃO
   Criados aqui (e não no HTML) para não repetir o mesmo código 12 vezes.
   Cada lição ganha:
   - botão PROVISÓRIO "Marcar como concluída" (depois vira os exercícios);
   - "◀ Lição anterior" (na lição 1: "◀ Início");
   - "Próxima lição ▶" (menos na última).
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
    const n = Number(secao.dataset.licao);

    const rodape = document.createElement('div');
    rodape.className = 'licao-rodape';

    // Botão provisório de concluir
    const btnConcluir = criarBotao('Marcar como concluída', 'btn btn-concluir');
    btnConcluir.dataset.concluir = String(n);

    // Navegação entre lições
    const navegacao = document.createElement('div');
    navegacao.className = 'licao-navegacao';

    const btnAnterior = criarBotao(
      n === 1 ? '◀ Início' : '◀ Lição anterior',
      'btn-secundario btn-anterior'
    );
    btnAnterior.dataset.ir = String(n - 1); // 0 = tela inicial
    navegacao.append(btnAnterior);

    if (n < TOTAL_LICOES) {
      const btnProxima = criarBotao('Próxima lição ▶', 'btn-secundario btn-proxima');
      btnProxima.dataset.ir = String(n + 1);
      navegacao.append(btnProxima);
    }

    rodape.append(btnConcluir, navegacao);
    secao.append(rodape);
  });
}

/** Atualiza o estado dos botões do rodapé conforme o progresso. */
function atualizarRodapesDasLicoes() {
  secoesLicao.forEach((secao) => {
    const n = Number(secao.dataset.licao);

    const btnConcluir = secao.querySelector('.btn-concluir');
    if (btnConcluir) {
      const feita = estaConcluida(n);
      btnConcluir.disabled = feita;
      btnConcluir.textContent = feita ? '✓ Lição concluída' : 'Marcar como concluída';
    }

    const btnProxima = secao.querySelector('.btn-proxima');
    if (btnProxima) {
      const liberada = estaLiberada(n + 1);
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
   12. TEMA CLARO / ESCURO
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
   13. EVENTOS
   ========================================================================= */
function registrarEventos() {
  // Voltar/avançar do navegador e mudanças de hash.
  window.addEventListener('hashchange', aoMudarHash);

  // Cliques na trilha (um único "ouvinte" para todos os links).
  nav.addEventListener('click', (evento) => {
    const link = evento.target.closest('.trilha-link');
    if (!link) return;
    evento.preventDefault(); // quem decide se pode abrir é o irPara()
    irPara(Number(link.closest('.trilha-item').dataset.licao));
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
      irPara(Number(botaoIr.dataset.ir));
      return;
    }
    const botaoConcluir = evento.target.closest('[data-concluir]');
    if (botaoConcluir) {
      concluirLicao(Number(botaoConcluir.dataset.concluir));
    }
  });

  // "Começar/Continuar trilha": abre a próxima lição sem recarregar a página.
  formConfiguracao.addEventListener('submit', (evento) => {
    evento.preventDefault();
    irPara(proximaLicaoParaEstudar());
  });

  btnRecomecar.addEventListener('click', recomecarTrilha);
  btnTema.addEventListener('click', alternarTema);
}


/* =========================================================================
   14. INICIALIZAÇÃO
   ========================================================================= */
function iniciar() {
  iniciarTema();
  concluidas = carregarProgresso();
  criarRodapesDasLicoes();
  registrarEventos();
  atualizarTudo();
  aoMudarHash(); // abre a tela indicada na URL (ou o início)
}

iniciar();
