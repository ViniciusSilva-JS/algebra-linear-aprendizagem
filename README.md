# Álgebra Linear — Trilha de Aprendizagem

Site de estudo de Álgebra Linear e Geometria Analítica em 12 lições sequenciais.
Cada lição tem **Teoria**, **Laboratório** (interativo) e **Exercícios** (múltipla
escolha). Acertar todos os exercícios libera a próxima lição.

HTML, CSS e JavaScript puros, sem bibliotecas e sem servidor: basta abrir o
`index.html` no navegador.

## Estrutura

```
index.html                  Página única: cabeçalho, trilha e o conteúdo das 12 lições
css/
  base.css                  Variáveis (cores, fontes, espaços), tema claro/escuro, reset, tipografia
  layout.css                Cabeçalho, trilha (nav), grade da página, cartões das lições, rodapé
  componentes.css           Botões, campos, mensagens, aviso, fórmula, notação de vetor, progresso, tabela
  exercicios.css            Lista de exercícios, alternativas e quadro de explicações
  laboratorio.css           Área do laboratório, plano cartesiano em SVG, setas de vetores
js/
  utils/
    matematica.js           Funções de cálculo e formatação (lerNumero, formatarNumero, modulo...)
  componentes/
    plano.js                Plano cartesiano em SVG reaproveitável (criarPlanoCartesiano)
    matriz.js               Editor e exibição de matrizes (criarEditorMatriz, htmlMatriz)
    exercicios.js           Correção automática dos exercícios (lê o HTML, não precisa de JS por lição)
  app.js                    Navegação por hash, desbloqueio de lições, progresso salvo e tema
  licoes/
    licao-01.js             Laboratório da Lição 1 (só o que é específico da lição)
    licao-02.js             Laboratório da Lição 2
    licao-03.js             Laboratório da Lição 3
    licao-04.js             Laboratório da Lição 4
    licao-05.js             Laboratório da Lição 5
    licao-06.js             Laboratório da Lição 6
    licao-07.js             Laboratório da Lição 7
    licao-08.js             Laboratório da Lição 8
```

**A ordem dos `<link>` e `<script>` no `index.html` importa:** os estilos vão do
mais geral ao mais específico, e cada script usa funções dos anteriores
(utils → componentes → app → lições).

## Padrão para criar uma nova lição

Exemplo para a lição 3. Troque o número conforme a lição.

### 1. HTML — dentro de `<section id="licao-3">` no `index.html`

```html
<div class="teoria">
  <h3>Tópico</h3>
  <p>Explicação…</p>
  <div class="formula">fórmula</div>
  <div class="exemplo">
    <p class="exemplo-titulo">Exemplo</p>
    <p>Exemplo resolvido…</p>
  </div>
</div>

<div class="laboratorio">
  <h3>Título do laboratório</h3>
  <div class="lab-area">
    <svg id="l3-plano" class="plano-cartesiano" role="img" aria-label="…"></svg>
    <div class="lab-controles">…campos com ids l3-…</div>
  </div>
  <div id="l3-resultados" class="lab-resultados" aria-live="polite"></div>
</div>

<div class="exercicios" data-licao="3">
  <h3>Pratique</h3>
  <ol class="lista-exercicios">
    <li class="exercicio">
      <p>Enunciado</p>
      <div class="alternativas" role="radiogroup" aria-label="Exercício 1" data-resposta="b">
        <label class="alternativa"><input type="radio" name="l3-ex1" value="a"
          data-explicacao="Por que esta alternativa está errada (qual engano leva a ela)."> resposta A</label>
        <label class="alternativa"><input type="radio" name="l3-ex1" value="b"
          data-explicacao="Por que esta é a correta, com a conta completa."> resposta B</label>
        …
      </div>
    </li>
  </ol>
</div>
```

### 2. JavaScript — criar `js/licoes/licao-03.js`

```js
(function () {
  'use strict';
  const svg = document.getElementById('l3-plano');
  if (!svg) return;
  const plano = criarPlanoCartesiano(svg, { limite: 10 });
  // ler campos → plano.limpar() → desenhar → escrever as contas em #l3-resultados
})();
```

E adicionar no fim do `index.html`, depois da lição anterior:

```html
<script src="js/licoes/licao-03.js"></script>
```

### 3. CSS (só se precisar)

Coloque estilos novos no arquivo do assunto (`laboratorio.css`, `exercicios.css`,
`componentes.css`…), sempre usando as variáveis do `base.css`, e os ajustes de
celular no bloco **RESPONSIVO** do fim do mesmo arquivo.

## Convenções

- **Nomes em português**, com código e comentários em português.
- **Ids por lição** com prefixo `lN-` (`l3-plano`, `l3-ex1`…), para não colidir.
- **Arquivos de lição com dois dígitos** (`licao-03.js`, `licao-10.js`), para ficarem em ordem.
- **Funções de matemática** reaproveitáveis vão em `js/utils/matematica.js`; o que
  só uma lição usa fica no arquivo da lição.
- **Exercícios** de múltipla escolha com 4 alternativas, e **toda alternativa** com
  `data-explicacao`. As erradas mostram o erro comum que leva a elas.
- **Números no padrão brasileiro**: vírgula decimal e `;` separando coordenadas
  decimais, como em `(2,5; 4)`. Use `formatarNumero` e `formatarPonto`.
- **Cores** sempre por variável (`var(--cor-…)`), para funcionar nos temas claro e escuro.
- **Matrizes no HTML** usam a marcação de grade (nunca `<table>` dentro de `<p>`, que é
  HTML inválido): `<span class="matriz"><span class="matriz-grade" style="--colunas: 2">`
  com um `<span class="matriz-el">` por elemento. Use `matriz-inline` para matrizes no
  meio do texto. No JavaScript, gere com `htmlMatriz()`.
