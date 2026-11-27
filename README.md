# Trilha de Aprendizagem — Álgebra Linear e Geometria Analítica

Projeto Final de Álgebra Linear e Geometria Analítica (AP2) · Engenharia de Software · UNICATÓLICA RN · 2026.2

Site para **aprender Álgebra Linear e Geometria Analítica** em duas trilhas de 12 lições, cada uma com
**teoria**, um **laboratório interativo** e **exercícios corrigidos na hora**. As duas trilhas terminam
com um problema resolvido com **dados reais do IBGE**.

---

## 1. Problema e objetivo

Quem começa a estudar estas matérias costuma achar o conteúdo abstrato:

- O que um vetor, uma matriz ou um determinante **significam** de verdade? → **laboratório que desenha tudo**
- De onde vem cada fórmula? → **teoria com a dedução e um exemplo resolvido**
- Por que errei este exercício? → **toda alternativa errada explica o engano**
- Para que serve isso fora da sala? → **aplicações com dados oficiais do IBGE**

O objetivo é **ensinar cada conteúdo de forma simples e visual**: o aluno lê o conceito, muda os números
no laboratório e vê **a figura e a conta passo a passo** mudarem juntas. Depois, pratica em três níveis de
dificuldade.

## 2. Como usar

1. Na tela inicial, escolha a **matéria** (Álgebra Linear ou Geometria Analítica).
2. Escolha o **modo**: *Seguir a trilha* (as lições abrem em ordem, uma libera a próxima) ou
   *Escolher a lição* (todas abertas, para revisar um assunto).
3. Escolha o **nível** dos exercícios: Básico, Intermediário ou Avançado.
4. Em cada lição, leia a **teoria**, mexa no **laboratório** (digite valores, clique no plano, arraste o
   desenho 3D) e use os **exemplos prontos**.
5. Responda aos **exercícios** e clique em **Verificar**. Acertando todos, a lição fica marcada com ✓.

O progresso fica salvo no navegador. Também há **tema escuro** e versão para **celular**.

## 3. Como rodar

Não é necessário instalar nada, nem ter internet.

1. `git clone https://github.com/ViniciusSilva-JS/algebra-linear-aprendizagem.git`
2. Abra o arquivo `codigo/index.html` no navegador (dois cliques), ou use o **Live Server** do VS Code.

## 4. As duas trilhas

O conteúdo segue o material da disciplina. Os exemplos abaixo são os **valores que já vêm preenchidos** em
cada laboratório.

### Álgebra Linear

| Lição | O que o laboratório faz | Exemplo do laboratório | Justificativa matemática |
|---|---|---|---|
| 1. Plano cartesiano e pontos | Quadrante, distância e ponto médio; clique no plano para mover os pontos. | A(−3, −1) e B(4, 3) | d = √(7² + 4²) = √65 ≈ **8,06**; M = **(0,5; 1)** |
| 2. Vetores no plano | Soma, subtração e multiplicação por escalar, com as setas desenhadas. | u = (3, 1), v = (1, 3) | u + v = **(4, 4)**, \|u + v\| = √32 ≈ 5,66 |
| 3. Produto escalar e ângulo | Produto escalar, ângulo e tipo de ângulo. | u = (4, 1), v = (2, 3) | u·v = 8 + 3 = 11; cos θ = 11/√221 → θ ≈ **42,27°** (agudo) |
| 4. Retas no plano | Reta por dois pontos: inclinação, equações e cortes nos eixos. | A(−1, −1), B(3, 7) | m = 8/4 = 2 → **y = 2x + 1** |
| 5. Matrizes | Soma, subtração, escalar e transposta; clique num elemento para ver a conta. | A + B (2×3) | c₁₁ = a₁₁ + b₁₁ = 1 + 2 = **3** |
| 6. Multiplicação de matrizes | Linha × coluna realçada; mostra que A·B ≠ B·A. | A = [[2, 1], [0, 3]], B = [[1, 4], [2, −1]] | A·B = **[[4, 7], [6, −3]]** |
| 7. Determinantes | No 2×2, o determinante é a área do paralelogramo das colunas; no 3×3, Sarrus. | A = [[2, −1], [1, 2]] | det A = 2·2 − (−1)·1 = **5** = área |
| 8. Sistemas lineares | Duas equações viram duas retas; Cramer e classificação (SPD, SPI, SI). | 2x + y = 4 e x − 3y = −5 | D = −7, Dx = −7, Dy = −14 → **x = 1, y = 2** |
| 9. Matriz inversa | Gauss-Jordan passo a passo e conferência A·A⁻¹ = I. | A = [[2, 1], [1, 3]] | det = 5 → A⁻¹ = **[[3/5, −1/5], [−1/5, 2/5]]** |
| 10. Transformações lineares | A matriz deforma o plano (rotação, reflexão, cisalhamento…). | Rotação de 45° | T(i) = (0,71; 0,71); det = 1 → **área não muda** |
| 11. Autovalores e autovetores | Gire v e procure quando A·v fica na mesma reta de v. | A = [[2, 1], [1, 2]] | λ² − 4λ + 3 = 0 → **λ₁ = 3, λ₂ = 1** |
| 12. Aplicação com dados reais | Ajusta reta ou parábola aos censos do IBGE (mínimos quadrados). | Censos de 1940 a 2022, reta | Aᵀ·A·x = Aᵀ·b → população prevista em 2030 ≈ **228,14 milhões** |

### Geometria Analítica

| Lição | O que o laboratório faz | Exemplo do laboratório | Justificativa matemática |
|---|---|---|---|
| 1. Ângulo e distância entre retas | Distância de ponto a reta, pé da perpendicular e ângulo entre retas. | r: 3x + 4y − 5 = 0, P(3, 4) | d = \|9 + 16 − 5\| / 5 = **4** |
| 2. Área de triângulo e alinhamento | Determinante por Sarrus, área e orientação; testa se 3 pontos estão alinhados. | A(1, 1), B(5, 2), C(3, 6) | D = 35 − 17 = 18 → área = **9** |
| 3. Circunferência | Da equação reduzida para a geral e vice-versa (completando quadrados). | Centro (2, −1), raio 3 | **x² + y² − 4x + 2y − 4 = 0** |
| 4. Posições relativas com a circunferência | Compara a distância com o raio (ponto, reta ou outra circunferência). | x² + y² = 25 e P(3, 4) | 9 + 16 = 25 = r² → P **está na circunferência** |
| 5. Parábola | Foco, diretriz e um ponto P que confirma a definição. | Vértice (0, 0), c = 2 | **x² = 8y**, foco (0, 2), diretriz y = −2 |
| 6. Elipse | Focos e a soma das distâncias, que não muda. | Semieixos 5 e 3 | c² = 25 − 9 = 16 → focos **(±4, 0)** |
| 7. Hipérbole | Focos, assíntotas e a diferença das distâncias, que não muda. | a = 4, b = 3 | c² = 16 + 9 = 25 → focos (±5, 0), assíntotas **y = ±(3/4)x** |
| 8. Reconhecendo cônicas | Dada Ax² + Cy² + Dx + Ey + F = 0, descobre qual cônica é, inclusive os casos degenerados. | 4x² + 9y² − 16x + 54y + 61 = 0 | A·C > 0 e A ≠ C → **elipse** de centro (2, −3) |
| 9. Vetores no espaço | Desenho 3D que gira com o mouse; módulos, ângulo e ângulos diretores. | u = (2, 2, 1), v = (0, 3, 4) | u·v = 10, \|u\| = 3, \|v\| = 5 → cos θ = 2/3, θ ≈ **48,19°** |
| 10. Produto vetorial e misto | u × v perpendicular ao paralelogramo e o paralelepípedo de u, v e w. | u = (2, 1, 0), v = (1, 3, 0), w = (1, 1, 3) | u × v = (0, 0, 5) → área **5**; (u × v)·w = **15** = volume |
| 11. Retas e planos no espaço | Onde a reta fura o plano e a distância de um ponto ao plano. | π: 2x − y + 2z − 3 = 0; reta por (0, 1, −1) com v = (1, 1, 1); P(1, 2, 3) | 3t − 6 = 0 → t = 2 → **I = (2, 3, 1)**; d(P, π) = 3/3 = **1** |
| 12. Aplicação com dados reais | Distância entre capitais pelo globo, com vetores no espaço. | Brasília e São Paulo | cos θ = û·v̂ ≈ 0,9906 → arco R·θ ≈ **873,4 km** (IBGE: 869,665 km) |

### Os dados reais

- **Álgebra Linear — população do Brasil:** IBGE, Censos Demográficos, sistema SIDRA (tabelas 1286 e 4709).
- **Geometria Analítica — capitais:** IBGE, Anuário Estatístico do Brasil 2025, Tabela 1.1.1.2
  (latitude, longitude e distância a Brasília). O modelo da esfera fica **a menos de 0,6%** da distância
  oficial em todas as 26 capitais.
- **Erro encontrado na fonte:** a tabela do IBGE mostra a latitude de Maceió como −90°39'35.65", o que é
  impossível (−90° é o Polo Sul). Usamos −09°39'35.65", e com isso a distância calculada bate com a do
  próprio IBGE (diferença de 0,01%). A lição usa isso para mostrar que conferir os dados faz parte do trabalho.

## 5. Arquitetura

```
codigo/index.html            página única: tela inicial, menu e o conteúdo das 24 lições
codigo/css/
  base.css                   cores, fontes e espaços (variáveis) e tema claro/escuro
  layout.css                 tela inicial, menu de lições e grade da página
  componentes.css            botões, campos, fórmulas, tabelas e matrizes
  exercicios.css             alternativas e quadro de explicações
  laboratorio.css            laboratórios, plano cartesiano e espaço 3D

codigo/js/
  utils/matematica.js        todas as contas: módulo, produto escalar e vetorial, determinante, inversa...
  componentes/plano.js       desenha o plano cartesiano (SVG)
  componentes/espaco.js      desenha o espaço 3D que gira com o mouse (SVG, sem biblioteca)
  componentes/matriz.js      editor e exibição de matrizes
  componentes/exercicios.js  corrige os exercícios lendo o próprio HTML e filtra por nível
  app.js                     troca de lição, modos (trilha/livre), desbloqueio, progresso e tema
  licoes/licao-01.js ... licao-12.js    laboratórios de Álgebra Linear (um arquivo por lição)
  licoes/ga-01.js    ... ga-12.js       laboratórios de Geometria Analítica
```

**Fluxo:** o aluno digita ou clica (entrada) → o JavaScript lê, valida e calcula (processamento) → a tela
mostra o desenho, o resultado e a **conta passo a passo** (saída). Valor inválido gera uma mensagem, sem
travar a página.

**Como as peças se conectam:**

- As **contas** ficam em `matematica.js` e são reaproveitadas. Por exemplo, `produtoVetorial3` é usado nas
  lições 10, 11 e 12 de Geometria Analítica.
- O **3D** é feito com trigonometria: cada ponto (x, y, z) é projetado na tela pelos ângulos de giro da
  "câmera". Arrastar o desenho muda esses ângulos.
- Os **exercícios não têm código próprio**: o `exercicios.js` lê no HTML a resposta certa
  (`data-resposta`), a explicação de cada alternativa (`data-explicacao`) e o nível (`data-nivel`).
- O **desbloqueio** está numa única função do `app.js` (`estaLiberada`). O progresso é salvo no
  `localStorage` do navegador.

**Para editar:** o texto das lições e os exercícios ficam no `index.html`, cada lição na sua `<section>`
(`id="licao-3"` ou `id="ga-3"`). Os ids de cada laboratório começam com `l3-` (Álgebra Linear) ou `g3-`
(Geometria Analítica). A conta de um laboratório fica no arquivo da lição em `js/licoes/`.

## 6. Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML, CSS e JavaScript | Página, visual, cálculos e correção dos exercícios |
| SVG | Plano cartesiano, desenhos 3D e o globo |
| localStorage | Guardar o progresso, o modo, o nível e o tema |

Nenhuma biblioteca externa: o site funciona sem internet.

## 7. Testes

Cada linha foi testada no navegador (Chromium), e todos os resultados bateram com o esperado. O "Esperado"
foi calculado à mão.

| Lição | Entrada | Esperado | Obtido |
|---|---|---|---|
| AL 1 | A(−3, −1), B(4, 3) | d = √65 ≈ 8,06; M = (0,5; 1) | d = √65 ≈ 8,06; M = (0,5; 1) ✅ |
| AL 3 | u = (4, 1), v = (2, 3) | u·v = 11, θ ≈ 42,27°, agudo | u·v = 11, θ ≈ 42,27°, agudo ✅ |
| AL 4 | A(−1, −1), B(3, 7) | y = 2x + 1 | y = 2x + 1; geral 2x − y + 1 = 0 ✅ |
| AL 6 | [[2, 1], [0, 3]] · [[1, 4], [2, −1]] | [[4, 7], [6, −3]] | [[4, 7], [6, −3]] ✅ |
| AL 7 | [[2, −1], [1, 2]] | det = 5 | det = 5, área 5 ✅ |
| AL 8 | 2x + y = 4 e x − 3y = −5 | x = 1, y = 2 (SPD) | x = 1, y = 2, SPD ✅ |
| AL 8 | x + y = 2 e 2x + 2y = 5 | Sem solução (SI) | D = 0, retas paralelas, SI ✅ |
| AL 9 | [[2, 1], [1, 3]] | [[3/5, −1/5], [−1/5, 2/5]] | [[3/5, −1/5], [−1/5, 2/5]] ✅ |
| AL 9 | [[1, 2], [2, 4]] (inválido) | Mensagem: não tem inversa | "det = 0 · A NÃO tem inversa" ✅ |
| AL 11 | [[2, 1], [1, 2]] | λ = 3 e λ = 1 | λ₁ = 3 e λ₂ = 1 ✅ |
| AL 12 | Censos 1940–2022, reta, ano 2030 | ≈ 228,14 milhões | P(9) = 228,14 milhões ✅ |
| GA 1 | 3x + 4y − 5 = 0, P(3, 4) | d = 4 | d = 4 ✅ |
| GA 2 | A(1, 1), B(5, 2), C(3, 6) | Área = 9 | D = 18, área = 9 ✅ |
| GA 3 | Centro (2, −1), raio 3 | x² + y² − 4x + 2y − 4 = 0 | x² + y² − 4x + 2y − 4 = 0 ✅ |
| GA 5 | Vértice (0, 0), c = 2 | x² = 8y, foco (0, 2) | x² = 8y, foco (0, 2), diretriz y = −2 ✅ |
| GA 7 | a = 4, b = 3 | Focos (±5, 0), assíntotas ±3/4 | Focos (±5, 0), y = ±(3/4)x ✅ |
| GA 8 | 4x² + 9y² − 16x + 54y + 61 = 0 | Elipse de centro (2, −3) | Elipse de centro (2, −3) ✅ |
| GA 9 | u = (2, 2, 1), v = (0, 3, 4) | θ ≈ 48,19° | cos θ = 2/3, θ ≈ 48,19° ✅ |
| GA 9 | Componente x de u = 9 (inválido) | Mensagem de erro | "Use componentes de −6 a 6 em u." ✅ |
| GA 10 | u = (2, 1, 0), v = (1, 3, 0), w = (1, 1, 3) | u × v = (0, 0, 5), volume 15 | (0, 0, 5), área 5, volume 15 ✅ |
| GA 10 | u e v paralelos | u × v = 0 | "vetor nulo: u e v são paralelos" ✅ |
| GA 11 | π: 2x − y + 2z − 3 = 0, reta (t, 1 + t, −1 + t), P(1, 2, 3) | I = (2, 3, 1), d = 1 | I = (2, 3, 1), d = 1 ✅ |
| GA 11 | a = b = c = 0 (inválido) | Mensagem de erro | "a, b e c não podem ser todos zero" ✅ |
| GA 12 | Brasília e São Paulo | ≈ 873 km (IBGE 869,665) | 873,4 km, diferença 0,43% ✅ |
| GA 12 | Maceió (latitude corrigida) | ≈ 1 484 km | 1 484,3 km, diferença 0,01% ✅ |
| Todas | Modo trilha: abrir a lição 5 sem ter feito a 4 | Bloqueia com aviso | "Conclua a lição anterior primeiro" ✅ |
| Todas | Exercícios: 5 de 6 certos | Não conclui a lição | Não concluiu; 6 de 6 concluiu ✅ |

Também foram feitos **testes automáticos com mais de 10 000 casos**:

- as 24 lições abertas sem nenhum erro de JavaScript;
- os exercícios dos 3 níveis das 24 lições;
- mais de 4 000 entradas inválidas nos campos (texto, números enormes, divisão por zero, código HTML), sem nenhum resultado "NaN" e sem injeção de código;
- as 729 combinações de capitais da lição 12;
- endereços inválidos e dados salvos corrompidos;
- as telas em 320, 375 e 768 px de largura (celular e tablet), sem rolagem lateral.

## 8. Registro de uso de IA

O projeto usou o **Claude Code (Claude Opus 5.5)** no VS Code. Todo código gerado foi revisado e testado
antes de ser usado.

> **Principais ajudas da IA**
>
> - **Testes:** o Claude me ajudou a testar o código com várias entradas diferentes e a tentar quebrá-lo,
>   com testes automáticos no navegador usando entradas inválidas, valores extremos, cliques fora de ordem
>   e telas de celular. Os problemas encontrados foram corrigidos.
> - **Documentação:** o Claude ficou responsável por otimizar a documentação, melhorando e simplificando
>   este README para que a professora entenda com facilidade o que o projeto faz e como ele foi pensado.

A tabela abaixo registra cada pedido feito à IA ao longo do projeto.

| # | Objetivo | Incitar | Resultado | Ajustes | Validação humana |
|---|---|---|---|---|---|
| 1 | Lição 8 de GA | "faça essa parte" (print da lição 8 bloqueada) | A lição já existia; ela só estava bloqueada porque a 7 não tinha sido concluída. README atualizado. | — | Conferi parte por parte no próprio sistema |
| 2 | Lição 9 de GA | "faça esse agora" (print de *Vetores no espaço*) | Lição completa e componente 3D (`espaco.js`) que gira com o mouse | Exibição de raízes e decimais corrigida | Conferi parte por parte no próprio sistema |
| 3 | Lição 10 de GA | "faça esse aqui" (print de *Produto vetorial e misto*) | Lição com produto vetorial, área e volume em 3D | Exemplo "coplanares" corrigido (passava do limite) | Conferi parte por parte no próprio sistema |
| 4 | Lição 11 de GA | "crie esse" (print de *Retas e planos no espaço*) | Lição com reta, plano, interseção e distância | Formatação de frações e sinais nas contas | Conferi parte por parte no próprio sistema |
| 5 | Lição 12 de GA | "faça a lição 12 agora" | Distância entre capitais com os dados do IBGE | Erro de latitude de Maceió na tabela oficial identificado e corrigido | Conferi parte por parte no próprio sistema |
| 6 | Modos de estudo | "quero que você dê a opção do usuário escolher de seguir pela trilha ou escolher [...]" | Modos *Seguir a trilha* e *Escolher a lição* | Proteção contra link para lição bloqueada | Conferi parte por parte no próprio sistema |
| 7 | Varredura de testes | "faça vários testes para ver se o sistema está funcionando perfeitamente, tente quebrar o código" | Mais de 10 000 testes automáticos no navegador | Lista de lições estreita, nomes de cidades sobrepostos e reta curta corrigidos | Conferi parte por parte no próprio sistema |
| 8 | Documentação | "melhore essa documentação [...] para a professora entender facilmente o que eu quis fazer" | README reescrito | — | Conferi parte por parte no próprio sistema |
| 9 | Documentação final | "eu quero esse padrão no readme.md" (prints do README de CDI) | Este README | — | Conferi parte por parte no próprio sistema |

Na coluna **Validação humana** está como cada resultado foi conferido: abri o próprio sistema e conferi
parte por parte (teoria, laboratório e exercícios). As lições anteriores (Álgebra Linear 1 a 12 e Geometria Analítica 1 a 7) foram
feitas em sessões anteriores e podem ser acrescentadas aqui da mesma forma.

## 9. Integrantes

| Nome | Parte |
|---|---|
| Marcos Vinicius da Silva Lima | Todo o projeto: HTML, CSS, JavaScript e documentação |
