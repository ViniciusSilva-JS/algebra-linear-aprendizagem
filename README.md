# Trilha de Aprendizagem — Álgebra Linear e Geometria Analítica

Um site de estudo que ensina **Álgebra Linear** e **Geometria Analítica** em duas trilhas de
**12 lições** cada. Toda lição segue o mesmo caminho: o aluno **lê a teoria**, **experimenta** num
laboratório interativo e **pratica** com exercícios corrigidos na hora. As duas trilhas terminam com
um problema resolvido com **dados reais do IBGE**.

**Para abrir:** dê dois cliques em `codigo/index.html`. Não precisa instalar nada, nem de internet,
nem de servidor.

---

## Sumário

1. [A proposta](#1-a-proposta)
2. [Como o aluno usa o site](#2-como-o-aluno-usa-o-site)
3. [O conteúdo das duas trilhas](#3-o-conteúdo-das-duas-trilhas)
4. [As aplicações com dados reais](#4-as-aplicações-com-dados-reais)
5. [Como o código funciona](#5-como-o-código-funciona)
6. [Decisões de projeto](#6-decisões-de-projeto)
7. [Como foi testado](#7-como-foi-testado)
8. [Estrutura de pastas](#8-estrutura-de-pastas)
9. [Para quem for continuar o projeto](#9-para-quem-for-continuar-o-projeto)

---

## 1. A proposta

Ler uma fórmula não basta para entendê-la. O projeto tenta resolver três dificuldades comuns de quem
estuda estas matérias:

| Dificuldade | O que o site faz |
|---|---|
| A fórmula parece "mágica", sem significado | Cada lição explica **de onde a fórmula vem** e mostra um exemplo resolvido passo a passo. |
| É difícil "ver" o que um vetor, uma matriz ou uma cônica fazem | O **laboratório** desenha tudo na hora. O aluno muda um número e vê a figura e as contas mudarem juntas. |
| Errar um exercício não ensina nada se não se sabe *por que* errou | **Toda alternativa errada tem uma explicação** do engano que leva a ela, sem entregar a resposta certa. |

Também tomamos três decisões pedagógicas:

- **Trilha em ordem, com liberdade quando o aluno quiser.** No modo *Seguir a trilha*, cada lição só
  abre depois que o aluno acerta os exercícios da anterior, porque o conteúdo de uma lição é usado
  nas seguintes. No modo *Escolher a lição*, todas ficam abertas, para quem quer revisar um assunto
  específico.
- **Três níveis de exercício.** *Básico*, para aplicar a fórmula direto. *Intermediário*, para usar a
  fórmula em duas etapas ou "ao contrário". *Avançado*, para juntar ideias e cair em armadilhas comuns.
  São 6 exercícios por nível em cada lição.
- **Matemática com dados de verdade.** A última lição de cada trilha mostra que o conteúdo serve para
  resolver um problema real, com dados oficiais.

---

## 2. Como o aluno usa o site

```
 Tela inicial                       Lição                                   Progresso
┌─────────────────────────┐        ┌──────────────────────────────────┐    ┌─────────────────┐
│ Matéria: AL  ou  GA      │        │ 1. TEORIA      lê e vê exemplos   │    │ ✓ lição marcada │
│ Modo: trilha ou livre    │  ───▶  │ 2. LABORATÓRIO mexe e observa     │──▶ │ próxima liberada│
│ Nível: básico/int./avan. │        │ 3. EXERCÍCIOS  acerta todos       │    │ (modo trilha)   │
└─────────────────────────┘        └──────────────────────────────────┘    └─────────────────┘
```

1. Na tela inicial o aluno escolhe a **matéria**, o **modo** e o **nível**.
2. Na lição, ele estuda a teoria, usa o laboratório e responde aos exercícios do nível escolhido.
3. Ao clicar em **Verificar**, cada resposta fica verde ou vermelha. Quem erra lê o motivo do engano.
   Quem acerta tudo vê a explicação de **todas** as alternativas e conclui a lição.
4. O progresso fica salvo no navegador. Ao voltar outro dia, o aluno continua de onde parou.

Outros recursos: **tema escuro**, layout para **celular**, navegação pelo teclado e leitores de tela,
e os botões *voltar/avançar* do navegador funcionando entre as lições.

---

## 3. O conteúdo das duas trilhas

### Trilha de Álgebra Linear

| # | Lição | No laboratório, o aluno… |
|---|---|---|
| 1 | Plano cartesiano e pontos | posiciona pontos e vê quadrante, distância e ponto médio |
| 2 | Vetores no plano | soma vetores e multiplica por escalar, arrastando as setas |
| 3 | Produto escalar e ângulo | gira os vetores e vê o ângulo e o produto escalar mudarem juntos |
| 4 | Retas no plano | escolhe dois pontos e vê a inclinação e as equações da reta |
| 5 | Matrizes | opera com matrizes e clica num elemento para ver de onde ele veio |
| 6 | Multiplicação de matrizes | vê a "linha vezes coluna" realçada e confere que A·B ≠ B·A |
| 7 | Determinantes | vê o determinante como a **área** do paralelogramo das colunas |
| 8 | Sistemas lineares | vê as duas equações como duas retas e a solução no cruzamento |
| 9 | Matriz inversa | acompanha o método de Gauss-Jordan passo a passo |
| 10 | Transformações lineares | vê uma matriz deformar o plano (rotação, reflexão, cisalhamento…) |
| 11 | Autovalores e autovetores | "caça" o vetor que a matriz só estica, sem mudar a direção |
| 12 | **Aplicação com dados reais** | ajusta uma reta ou parábola à população dos censos do IBGE |

### Trilha de Geometria Analítica

| # | Lição | No laboratório, o aluno… |
|---|---|---|
| 1 | Ângulo e distância entre retas | vê o caminho mais curto de um ponto até uma reta |
| 2 | Área de triângulo e alinhamento | calcula áreas pelo determinante e testa se três pontos estão alinhados |
| 3 | Circunferência | vai da equação ao desenho (completando quadrados) e vice-versa |
| 4 | Posições relativas com a circunferência | compara distância com raio: secante, tangente ou externa |
| 5 | Parábola | move um ponto e confere que ele fica à mesma distância do foco e da diretriz |
| 6 | Elipse | confere que a soma das distâncias aos dois focos não muda |
| 7 | Hipérbole | confere que a diferença das distâncias aos focos não muda |
| 8 | Reconhecendo cônicas | digita uma equação geral e descobre qual cônica ela é |
| 9 | Vetores no espaço | gira um desenho 3D com vetores, módulo, ângulo e ângulos diretores |
| 10 | Produto vetorial e misto | vê u × v perpendicular ao paralelogramo e o volume do paralelepípedo |
| 11 | Retas e planos no espaço | vê onde uma reta fura um plano e a distância de um ponto ao plano |
| 12 | **Aplicação com dados reais** | calcula a distância entre capitais pelo globo |

No total são **24 lições**, **431 exercícios** e mais de **1 700 explicações** de alternativas.

---

## 4. As aplicações com dados reais

### Álgebra Linear: a população do Brasil (mínimos quadrados)

Com os **censos do IBGE de 1940 a 2022**, o aluno quer uma reta ou parábola que "passe pelos pontos".
São 9 equações e só 2 ou 3 incógnitas, então o sistema não tem solução exata. O laboratório monta as
matrizes, resolve as **equações normais** (Aᵀ·A·x = Aᵀ·b) usando a inversa da lição 9 e mostra o erro
do modelo. Também dá para esconder um censo e ver se o modelo o "prevê".

> Fonte: IBGE, Censos Demográficos, sistema SIDRA (tabelas 1286 e 4709).

### Geometria Analítica: distância entre capitais (vetores no espaço)

Usando a latitude e a longitude das 27 capitais, o laboratório resolve o problema com as lições 9, 10 e 11:

1. converte graus, minutos e segundos para graus decimais;
2. transforma cada cidade num **vetor** P = R·(cos φ·cos λ, cos φ·sen λ, sen φ), com R = 6 371 km;
3. acha o **ângulo central** pelo produto escalar;
4. calcula a distância pela superfície (arco R·θ) e pelo "túnel" (corda |P − Q|);
5. acha o **plano da rota** mais curta com o produto vetorial e mede se uma terceira cidade fica no caminho.

O resultado é comparado com a distância oficial: o modelo da esfera fica **a menos de 0,6%** do valor do
IBGE para todas as capitais.

**Um erro encontrado na fonte oficial.** Na tabela do IBGE, a latitude de Maceió aparece como
−90°39'35.65", o que é impossível (−90° já é o Polo Sul). O valor certo é −09°39'35.65". Com a correção,
a distância calculada bate com a do próprio IBGE (diferença de 0,01%). A lição usa isso para mostrar que
**conferir os dados também faz parte do trabalho**.

> Fonte: IBGE, Anuário Estatístico do Brasil 2025, Tabela 1.1.1.2 – Localização geográfica, altitude e
> distância a Brasília, segundo os Municípios das Capitais.

---

## 5. Como o código funciona

O site é feito só com **HTML, CSS e JavaScript**, sem bibliotecas. Ele tem cerca de 22 mil linhas,
organizadas em camadas. Cada camada usa apenas as que vêm antes dela.

```
┌───────────────────────────────────────────────────────────────────────┐
│ index.html   O CONTEÚDO: texto de todas as lições, campos e exercícios   │
├───────────────────────────────────────────────────────────────────────┤
│ css/         A APARÊNCIA: cores, layout, tema escuro, versão de celular  │
├───────────────────────────────────────────────────────────────────────┤
│ js/utils/matematica.js      AS CONTAS (módulo, determinante, inversa…)   │
│ js/componentes/             AS PEÇAS reaproveitáveis:                    │
│     plano.js   plano cartesiano     espaco.js  desenho 3D que gira       │
│     matriz.js  matrizes             exercicios.js  correção automática   │
│ js/app.js                   O "MAESTRO": navegação, desbloqueio, progresso│
│ js/licoes/*.js              UM ARQUIVO POR LABORATÓRIO (24 arquivos)     │
└───────────────────────────────────────────────────────────────────────┘
```

### 5.1 Uma página só

Todas as 24 lições estão dentro do `index.html`, cada uma numa `<section>`. O `app.js` mostra uma
lição e esconde as outras, conforme o endereço da página: `index.html#licao-3` é a lição 3 de Álgebra
Linear, e `#ga-5` é a lição 5 de Geometria Analítica. Por isso os botões voltar/avançar do navegador
funcionam e cada lição tem um link próprio.

### 5.2 As contas ficam separadas do desenho

Toda conta matemática fica em `matematica.js`, em funções pequenas e reaproveitáveis, por exemplo:

```js
produtoEscalar3(u, v)    // x₁·x₂ + y₁·y₂ + z₁·z₂
produtoVetorial3(u, v)   // (y₁z₂ − z₁y₂, z₁x₂ − x₁z₂, x₁y₂ − y₁x₂)
inversaComPassos(A)      // Gauss-Jordan, guardando cada passo para mostrar ao aluno
```

Assim a mesma função serve a várias lições. O produto vetorial, por exemplo, é usado nas lições 10, 11
e 12 de Geometria Analítica.

### 5.3 O que acontece quando o aluno mexe num laboratório

Cada laboratório (arquivo em `js/licoes/`) segue sempre o mesmo ciclo:

```
 aluno digita ou clica ──▶ ler os campos ──▶ validar ──▶ calcular ──▶ desenhar ──▶ escrever as contas
                                               │
                                               └── valor inválido? mostra uma mensagem e não desenha
```

Exemplo real, da lição 9 de Geometria Analítica (resumido):

```js
function atualizar() {
  const u = lerVetor('u');                 // lê os 3 campos de u
  const v = lerVetor('v');
  if (u.erro || v.erro) { mostrarErro(); return; }   // ex.: campo vazio ou fora do limite
  desenhar(u, v);                          // setas no espaço 3D
  resultados.innerHTML = cartaoModulos(u, v) + cartaoAngulo(u, v) + /* … */;
}
campos.forEach((campo) => campo.addEventListener('input', atualizar));   // a cada tecla
```

Os resultados mostram **a conta inteira**, não só a resposta. Por exemplo:
`|u| = √(2² + 2² + 1²) = √9 = 3`. Assim o aluno vê o processo, como no caderno.

### 5.4 Os desenhos

- **Plano cartesiano (`plano.js`)**: desenha em SVG (imagem vetorial, nítida em qualquer tamanho) com as
  coordenadas matemáticas normais (y para cima). O componente converte para as coordenadas da tela.
- **Espaço 3D (`espaco.js`)**: não usa nenhuma biblioteca 3D. Cada ponto (x, y, z) é **projetado** na
  tela com trigonometria, a partir dos ângulos de giro da "câmera" (azimute t e elevação f):

  ```
  horizontal = −x·sen t + y·cos t
  vertical   =  z·cos f − (x·cos t + y·sen t)·sen f
  ```

  Arrastar com o mouse muda esses dois ângulos e o desenho é refeito. É a própria Geometria Analítica
  sendo usada para desenhar a Geometria Analítica.

### 5.5 Exercícios corrigidos automaticamente

Os exercícios **não precisam de código próprio**. Eles são escritos só em HTML, e o `exercicios.js` lê
as marcações para saber a resposta e as explicações:

```html
<li class="exercicio" data-nivel="intermediario">
  <p>Qual é o módulo de v = (2, −3, 6)?</p>
  <div class="alternativas" data-resposta="b">
    <label><input type="radio" value="a" data-explicacao="Somou as componentes…"> 5</label>
    <label><input type="radio" value="b" data-explicacao="√(4 + 9 + 36) = 7."> 7</label>
    …
  </div>
</li>
```

- `data-resposta` diz qual é a alternativa certa;
- `data-explicacao` diz, em cada alternativa, o porquê do acerto ou do engano;
- `data-nivel` diz em qual nível o exercício aparece.

Para criar um exercício novo basta escrever o HTML, sem mexer em nenhuma linha de JavaScript.

### 5.6 Desbloqueio e progresso (`app.js`)

- As lições concluídas ficam salvas no **`localStorage`** do navegador (por exemplo, `[1, 2, 3]`). Por
  isso o progresso continua lá ao fechar e abrir a página.
- A regra de desbloqueio fica numa função só:

  ```js
  function estaLiberada(trilha, n) {
    if (modoAtual === 'livre') return true;            // modo "Escolher a lição": tudo aberto
    return n === 1 || concluidas[trilha].has(n - 1);   // modo trilha: a anterior precisa estar feita
  }
  ```

- Se o aluno tentar "pular" uma lição digitando o endereço (`#licao-9`), o `app.js` bloqueia e mostra
  um aviso.
- Se o `localStorage` estiver bloqueado (modo anônimo) ou com dados estranhos, o site continua
  funcionando normalmente; só não lembra o progresso.

---

## 6. Decisões de projeto

| Decisão | Por quê |
|---|---|
| **Sem bibliotecas nem frameworks** | Abre em qualquer computador com dois cliques, funciona sem internet, e todo o código pode ser lido e entendido. |
| **Um arquivo por laboratório** | Cada lição é independente: dá para corrigir uma sem risco de quebrar outra. |
| **Contas em funções separadas** | A mesma função (ex.: determinante) serve a várias lições e é fácil de testar. |
| **Exercícios só em HTML** | Criar ou corrigir um exercício não exige programar. |
| **Tudo em português** | Nomes de funções, variáveis e comentários em português, para facilitar a leitura. |
| **Padrão brasileiro de números** | Vírgula decimal e ponto e vírgula entre coordenadas decimais: (2,5; 4). |
| **Acessibilidade** | Funciona pelo teclado e com leitores de tela (rótulos, `aria-live`, foco), com contraste nos dois temas. |
| **Celular primeiro** | Testado em telas de 320 px de largura, sem rolagem lateral. |

---

## 7. Como foi testado

O site foi testado num navegador real (Chromium), automaticamente, com **mais de 10 000 casos**:

| Teste | O que foi verificado |
|---|---|
| Carregamento | As 24 lições abrem sem nenhum erro de JavaScript. |
| Exercícios | Nos 3 níveis das 24 lições: tudo em branco, tudo errado ou 5 de 6 certos **não** conclui a lição; 6 de 6 conclui. |
| Entradas inválidas | Mais de 4 000 valores "maliciosos" nos campos (texto, números enormes, divisão por zero, código HTML): nenhum resultado "NaN" e nenhuma injeção de código. |
| Combinações extremas | Todos os campos no mínimo e no máximo e combinações aleatórias, clicando em todos os botões. |
| Navegação | Endereços inválidos, tentativa de pular lições, dados salvos corrompidos e armazenamento bloqueado. |
| Celular | Todas as telas em 320, 375 e 768 px de largura. |
| Dados do IBGE | As 729 combinações de capitais, conferindo a diferença com as distâncias oficiais. |

As contas de todos os exercícios também foram refeitas uma a uma.

---

## 8. Estrutura de pastas

```
codigo/
  index.html                 a página: conteúdo de todas as lições
  css/
    base.css                 cores, fontes e espaçamentos (variáveis), tema claro/escuro
    layout.css               tela inicial, menu de lições, grade da página
    componentes.css          botões, campos, fórmulas, tabelas, matrizes
    exercicios.css           alternativas e quadro de explicações
    laboratorio.css          laboratórios, plano cartesiano e espaço 3D
  js/
    utils/matematica.js      todas as contas e a formatação de números
    componentes/
      plano.js               plano cartesiano em SVG
      espaco.js              espaço 3D em SVG que gira com o mouse
      matriz.js              editor e exibição de matrizes
      exercicios.js          correção automática dos exercícios e níveis
    app.js                   navegação, modos, desbloqueio, progresso e tema
    licoes/
      licao-01.js … licao-12.js    laboratórios de Álgebra Linear
      ga-01.js    … ga-12.js       laboratórios de Geometria Analítica
README.md                    este documento
```

A **ordem dos `<script>`** no fim do `index.html` importa: `matematica.js` → componentes → `app.js` →
lições, porque cada arquivo usa funções dos anteriores.

---

## 9. Para quem for continuar o projeto

### Criar uma lição nova

1. **HTML:** copie a `<section>` de uma lição parecida no `index.html` e troque o conteúdo. Cada lição
   tem três blocos: `<div class="teoria">`, `<div class="laboratorio">` e `<div class="exercicios">`.
   Em Geometria Analítica, a seção leva `data-trilha="ga"`.
2. **Menu:** acrescente um item na lista da trilha (`#trilha-lista` ou `#trilha-lista-ga`).
3. **Laboratório:** crie o arquivo em `js/licoes/` (`licao-NN.js` ou `ga-NN.js`, com dois dígitos)
   seguindo o ciclo *ler → validar → calcular → desenhar → escrever* da seção 5.3, e inclua o `<script>`
   no fim do `index.html`.
4. **Exercícios:** escreva 6 por nível no formato da seção 5.5.

O `app.js` conta as lições pelo próprio HTML, então nenhum número precisa ser mudado no código.

### Combinados do código

- **Ids com prefixo por lição** (`l3-…` em Álgebra Linear, `g3-…` em Geometria Analítica), para não
  haver nomes repetidos entre as lições.
- **Contas reaproveitáveis** vão para `matematica.js`; o que só uma lição usa fica no arquivo dela.
- **Toda alternativa tem `data-explicacao`**, em texto puro (sem tags; use caracteres como x², a₁₂).
  As erradas explicam o engano **sem revelar a resposta certa**, e a certa mostra a conta completa.
- **Números** sempre com `formatarNumero` e `formatarPonto` (padrão brasileiro).
- **Cores** sempre por variável (`var(--cor-…)`), para funcionarem nos dois temas.
- **Estilos de celular** ficam no bloco *RESPONSIVO* no fim de cada arquivo CSS.
