# Projeto aplicado — gestão do FPSI

Documento vivo, reconstruído retrospectivamente com as ferramentas de um TCC de gestão ágil (Canvas, CSD, POEMS, personas, SMART, backlog, sprints). Serve para decidir o foco — não para inventar um passado de sprints de duas semanas.

**Período:** 2024–2026 · **Atualizado:** 2026-08-28  
**Superfície no sistema:** [/gestao](/gestao)  
**Pesquisa de origem:** [CONTEXTO_PESQUISA_ORIGEM.md](CONTEXTO_PESQUISA_ORIGEM.md)

---

## Sumário

1. [Canvas do projeto aplicado](#1-canvas-do-projeto-aplicado)
   - 1.1 [Desafio](#11-desafio)
     - 1.1.1 [Análise de contexto](#111-análise-de-contexto)
       - 1.1.1.1 [Matriz CSD](#1111-matriz-csd)
       - 1.1.1.2 [Observação POEMS](#1112-observação-do-tipo-poems)
     - 1.1.2 [Personas](#112-personas)
     - 1.1.3 [Benefícios e justificativas](#113-benefícios-e-justificativas)
     - 1.1.4 [Hipóteses](#114-hipóteses)
   - 1.2 [Solução](#12-solução)
     - 1.2.1 [Objetivo SMART](#121-objetivo-smart)
     - 1.2.2 [Premissas e restrições](#122-premissas-e-restrições)
     - 1.2.3 [Backlog de produto](#123-backlog-de-produto)
2. [Área de experimentação](#2-área-de-experimentação)
   - 2.1 [Sprint 1](#21-sprint-1--núcleo-metodológico)
   - 2.2 [Sprint 2](#22-sprint-2--o-programa-além-do-questionário)
   - 2.3 [Sprint 3](#23-sprint-3--superfície-pública-e-programa-completo)
   - 2.4 [Sprint 4 (atual)](#24-sprint-4--foco-e-validação-atual)
3. [Direcionamento: o que absorver do mercado comercial e o que recusar](#3-direcionamento)

---

## 1. Canvas do projeto aplicado

Leitura **atual** do negócio. A proposta de valor no centro é o antídoto à tentação de virar “escritório + plataforma”.

| Bloco | Conteúdo |
| --- | --- |
| **Parceiros-chave** | Professores e turmas CDPO/LGPD (já há convite para apresentar); comunidade de software livre; órgãos que possam implantar o código; GeoApps; referenciais públicos (PPSI 2.0, ANPD, LGPD) como fonte, não como endosso. |
| **Atividades-chave** | Manter o catálogo e o ciclo do programa; expor o produto a especialistas; contar a jornada em linguagem de resultado **sem esconder módulos**; operar demo, docs e a primeira implantação real. |
| **Proposta de valor** | Implantar e gerir o Programa de Privacidade e Segurança da Informação num único ambiente. Alternativa open source à planilha oficial do PPSI 2.0. O trabalho do DPO fica no sistema — não numa caixa-preta chamada “plataforma”. |
| **Relacionamento** | Autoatendimento (demo, cadastro, GitHub). Relação de pares com especialistas, não de vendedor. Futuro: implantação assistida e PaaS, sem substituir o produto por horas jurídicas. |
| **Segmentos** | Usuário: DPO, TI/SI, consultor (João). Formador: professora/curso CDPO (ainda não abordado de frente). Operador público: gestor de órgão. Comprador: diretor que hoje compraria um pacote “compliance + plataforma”. |
| **Recursos-chave** | Código e catálogo (210 medidas); dois anos de ciclo real do programa; pesquisa de origem e artigo; demo e portal do titular. |
| **Canais** | fpsi.com.br + demo; evento/aula da professora (canal quente, não usado); artigo, GitHub, LinkedIn. Não: anúncio de “segurança jurídica” sem mostrar o sistema. |
| **Custos** | Tempo do autor; infra; **risco de continuar polindo sem contato com o público especializado**. |
| **Receitas** | Hoje: nenhuma (estudo / software livre). Caminho natural: PaaS, implantação, capacitação para turmas CDPO. Fora de escopo: vender parecer jurídico e esconder o software. |

---

## 1.1 Desafio

Depois de dois anos, o desafio deixou de ser “existe sistema?”. Passou a ser: **para quem isto é a ferramenta certa, e o que não devemos virar** — em especial diante de ofertas comerciais que vendem assessoria e mencionam a plataforma de passagem.

### 1.1.1 Análise de contexto

O FPSI nasceu da pesquisa com praticantes de CDPO/BR: a planilha oficial do Governo é o método certo na tecnologia errada. Em paralelo, o mercado privado de “compliance” aprendeu a vender **instituição** (banca, certificação, SLA) e a tratar o software como acessório. Os dois mundos não são o mesmo produto, embora ambos citem LGPD.

O público especializado (formadores, DPOs, gestores de órgão) ainda não foi abordado de frente. Há um convite implícito — a professora do curso de LGPD mencionou duas vezes o “sistema de LGPD” e sinalizou apresentação em evento. Esse recorte é incompleto (o FPSI é o **programa**, não um checklist da lei), mas é o recorte que o público já usa. Ignorá-lo é o risco real de falhar tarde.

#### 1.1.1.1 Matriz CSD

**Certezas**

- A planilha oficial do PPSI é boa para validar medidas e calcular maturidade, e ruim para trabalho distribuído, acessibilidade e software livre.
- DPOs recém-formados saem do curso com teoria e sem ferramenta prática alinhada ao framework brasileiro.
- Há um mercado comercial que vende assessoria jurídica e menciona “a plataforma” de passagem — o produto deles é a hora do advogado.
- O FPSI já cobre o ciclo operacional (governança, diagnóstico, plano, políticas, ROPA/RIPD, titulares, riscos, auditoria, AIGP).
- A professora do curso de LGPD mencionou duas vezes o sistema e sinalizou apresentação — o público especializado já existe, só não foi abordado.

**Suposições**

- Especialistas preferem ver o produto e o método a um discurso de “segurança jurídica com tecnologia de ponta”.
- Uma camada de comunicação de resultado (jornada de implantação, porquê, para quem) aumenta adoção sem diluir a identidade técnica.
- O wedge correto é “PPSI que não é Excel”, não “canal de denúncias + escritório”.
- Apresentar agora valida mais do que mais seis meses de features.
- Usuário (DPO) e comprador (diretor) precisam de mensagens diferentes sobre o mesmo sistema.

**Dúvidas**

- O especialista aponta gaps e adota mesmo assim, ou espera “produto acabado”?
- O primeiro cliente real é órgão público, consultor ou turma de formação?
- PaaS + open source convive, ou um dos dois vira o centro?
- Vale uma camada comercial (SLA, implantação) sem parecer escritório de advocacia?
- Lei 14.457 / canal de denúncias é adjacência útil ou diluição?

#### 1.1.1.2 Observação do tipo POEMS

| Dimensão | O que se observa |
| --- | --- |
| **People** | João (DPO recém-certificado); professora/formadora de CDPO; gestor de TI em órgão preso à planilha; diretora que compraria “compliance + plataforma” sem abrir o sistema. |
| **Objects** | Planilha Excel do PPSI 2.0; políticas PDF, ROPA, RIPD, evidências; dashboard de maturidade; portal do titular; site institucional que fala de “plataforma” sem telas. |
| **Environment** | Órgão com comitê; empresa média com DPO externo; sala de aula / evento online de LGPD; escritório de advocacia vendendo conformidade como serviço. |
| **Messages** | “Você está fazendo um sistema de LGPD” (recorte da professora); “plataforma” como palavra vazia; “software livre alinhado ao PPSI” (o que o FPSI pode provar); medo (assédio, fraude, multa) versus rotina (evidência, prazo, responsável). |
| **Services** | Diagnóstico e plano de trabalho; assessoria jurídica full service; canal de denúncias Lei 14.457 (outro produto); consultoria de DPO; PaaS/implantação do FPSI (ainda não empacotado). |

### 1.1.2 Personas

**João — DPO / consultor (persona original)**  
TI de origem, formação recente de DPO, teoria sem prática. Testou ferramentas comerciais heterogêneas e a planilha do governo. Quer um roteiro que também seja sistema de trabalho. Não quer outra caixa-preta. O produto já foi desenhado para ele.

**Ana — Professora / formadora CDPO (público ainda não abordado)**  
Cita na aula que um aluno “está fazendo um sistema de LGPD” e já pediu apresentação. Precisa de objeto concreto para a turma. Quer sistema que se possa abrir, clicar e criticar; história honesta, não pitch. Não quer propaganda de escritório nem produto que esconde telas. O medo de “falhar tarde” aponta para ela.

**Carlos — Gestor de TI em órgão público**  
Precisa implantar o PPSI de verdade, com vários departamentos. Excel não aguenta o comitê. Quer software livre alinhado ao guia, multi-usuário, relatório apresentável. Não quer depender de escritório privado para “operar a plataforma”. Melhor fit institucional do open source; ainda sem caso documentado.

**Helena — Diretora (compradora de pacote jurídico + plataforma)**  
Quer proteger o negócio e não quer gerir software. Compra confiança institucional. Não distingue canal de denúncias de programa de privacidade. A comunicação pode falar a língua dela (resultado, prazo, evidência); **o produto não deve ser redesenhado para ela** — isso é o caminho da assessoria opaca.

### 1.1.3 Benefícios e justificativas

- **DPO e equipe:** um ambiente só para o ciclo do programa. Substitui a planilha sem abandonar o método oficial.
- **Formador e turma:** objeto pedagógico real — demo, código aberto, catálogo visível.
- **Órgão e empresa:** colaboração, trilha de auditoria, portal do titular. Conformidade como operação, não como teatro.
- **O próprio projeto:** documentar a gestão reduz o risco de dois anos de construção sem tese de foco.

### 1.1.4 Hipóteses

| ID | Enunciado | Como testar | Critério | Status |
| --- | --- | --- | --- | --- |
| H1 | Apresentar no canal da professora gera feedback utilizável em 30 dias — não “fracasso público”. | Aceitar o convite; demo do ciclo (não tour de 40 telas); 5 conversas. | ≥5 especialistas usam a demo ou enviam crítica concreta; nenhuma crítica central é “faltou parecer jurídico”. | A testar |
| H2 | Especialistas criticam UX/catálogo/onboarding, não a ausência de canal de denúncias ou de escritório. | Pergunta: “o que falta para você usar isto na próxima semana?” | Se 14.457/advocacia não aparecer no topo, o wedge técnico se confirma. | A testar |
| H3 | Jornada de implantação em linguagem de resultado aumenta entendimento do comprador sem esconder o produto. | Ajustar landing/sobre com processo visível, mantendo módulos e demo. | Pessoas descrevem o FPSI como “programa”, não só como “sistema de LGPD” ou “plataforma”. | Em curso |
| H4 | Copiar o modelo assessoria-na-frente / software-opaco destrói a vantagem de dois anos e não acelera adoção entre especialistas. | Não executar esse modelo; observar o que Ana/João pedem. | Demanda dominante por ver o sistema — não por SLA jurídico. | Em curso |
| H5 | Gestão do projeto visível (página `/gestao`) aumenta credibilidade mais do que um site institucional genérico. | Usar `/gestao` na apresentação. | Pelo menos um formador ou aluno usa o canvas/backlog como referência. | A testar |

---

## 1.2 Solução

### 1.2.1 Objetivo SMART

**Até 30/11/2026, apresentar o FPSI a especialistas (aula ou evento), obter feedback documentado de pelo menos cinco praticantes e decidir, por escrito, o recorte de foco dos 90 dias seguintes — sem abrir frente de canal de denúncias nem de escritório jurídico.**

| Critério | |
| --- | --- |
| Específico | Validar com formadores e praticantes de LGPD/CDPO/PPSI e decidir o wedge com evidência. |
| Mensurável | 1 apresentação + 5 conversas documentadas + decisão escrita do wedge. |
| Atingível | O produto já opera o ciclo; o convite já existe; a demo já está no ar. |
| Relevante | Dois anos sem esse contato é o verdadeiro risco de falhar tarde. |
| Temporal | 30 de novembro de 2026. |

### 1.2.2 Premissas e restrições

**Premissas:** âncora LGPD + PPSI 2.0 (AIGP é extensão); código aberto (PaaS é camada); usuário-núcleo é quem opera o programa; comunicação de resultado não esconde telas.

**Restrições:** um autor, tempo finito; sem apagar dados de produção; não se apresentar como produto oficial do governo/ANPD/IAPP; não competir com banca no terreno da hora jurídica.

### 1.2.3 Backlog de produto

| ID | Item | Status | Pri. | Persona |
| --- | --- | --- | --- | --- |
| B01 | Ciclo PPSI no sistema (diagnóstico, maturidade, plano) | Feito | P0 | João |
| B02 | Multi-usuário, papéis e trilha de auditoria | Feito | P0 | Carlos |
| B03 | Políticas, ROPA, RIPD, incidentes, portal do titular | Feito | P0 | João |
| B04 | Riscos, AIGP, IA, demo e landing | Feito | P1 | Todas |
| B05 | Documentação de gestão (este canvas) | Agora | P0 | Ana |
| B06 | Apresentar a especialistas (professora / evento) | Agora | P0 | Ana |
| B07 | Roteiro de demo de 12 minutos (ciclo, não catálogo) | Agora | P0 | Ana |
| B08 | Jornada de implantação na comunicação (sem esconder o produto) | Seguinte | P1 | Helena |
| B09 | Kit para turma CDPO | Seguinte | P1 | Ana |
| B10 | Primeira implantação acompanhada | Seguinte | P1 | Carlos |
| B11 | Empacotar PaaS / onboarding | Depois | P2 | Carlos |
| B12 | Canal de denúncias Lei 14.457 como produto-pai | **Não fazer** | P2 | Helena |
| B13 | Reposicionar como escritório + plataforma opaca | **Não fazer** | P2 | Helena |

---

## 2. Área de experimentação

Sprints 1–3 são **macrociclos** reconstruídos a partir do que o produto já é. A Sprint 4 é a atual.

### 2.1 Sprint 1 — Núcleo metodológico

**Objetivo:** provar que o framework oficial cabe numa aplicação web colaborativa, sem perder o cálculo de maturidade.

**Planejamento:** pesquisa CDPO/BR (CSD e POEMS originais); persona João; escopo cadastros, controles/medidas, INCC, relatório, plano.

**Execução:** diagnóstico PPSI na web; maturidade alinhada à ferramenta oficial; plano derivado de gaps; programa como unidade.

**Resultados:** há um sistema que reproduz o roteiro oficial. A tese “Excel é o método certo na tecnologia errada” ficou demonstrável.

**Lições:** método primeiro; pesquisa pequena já evitou um GRC genérico.

### 2.2 Sprint 2 — O programa além do questionário

**Objetivo:** cobrir a rotina do DPO que a planilha não cobre.

**Planejamento:** mapear arts. 18, 37, 38, 41; multi-usuário como requisito de órgão/consultoria.

**Execução:** políticas; mapeamento/ROPA/RIPD/incidentes; portal e pedidos; convites, papéis, histórico.

**Resultados:** o produto deixou de ser “ferramenta de diagnóstico”. Surgiu o risco de amplitude — muitos módulos, pouca narrativa única. O recorte da professora (“sistema de LGPD”) é sintoma disso.

**Lições:** completude dificulta a frase única; colaboração (papéis + auditoria) ataca a dor da planilha melhor do que mais um questionário.

### 2.3 Sprint 3 — Superfície pública e programa completo

**Objetivo:** tornar o sistema apresentável e cobrir riscos, IA e a face pública.

**Execução:** riscos 5×5; AIGP; landing, demo, artigo, Sobre; selo, portal, auditoria externa.

**Resultados:** há o que mostrar a um especialista sem desculpa. A comunicação ainda é mais técnica do que a do mercado de assessoria — ativo, se houver processo visível por cima. O medo de divulgar ficou desproporcional ao estado do produto.

**Lições:** o gargalo agora é contato com Ana, não mais um módulo. Sites que escondem a plataforma existem porque o software não é o negócio. O nosso é. Mostrar telas é o moat.

### 2.4 Sprint 4 — Foco e validação (atual)

**Objetivo:** o SMART acima.

**Planejamento / execução:** este documento; hipóteses H1–H5; lista explícita do que não fazer; página `/gestao`.

**Próximo resultado a evidenciar:** a apresentação, não mais um módulo.

---

## 3. Direcionamento

Há no mercado um tipo de oferta já consolidado: assessoria jurídica vendendo gestão de riscos e canal de denúncias (Lei 14.457/2022), com uma “plataforma” mencionada de passagem. O software é veículo; o produto é a assessoria.

### Absorver (gramática)

1. **Falar com quem compra, não só com quem opera.** O DPO precisa das telas; o diretor precisa da jornada.
2. **Processo visível com tempo.** Diagnóstico → proposta → implementação → acompanhamento. O FPSI já tem o ciclo; falta desenhá-lo como implantação.
3. **CTA para o especialista.** Esse tipo de oferta costuma repetir “falar com um especialista”. Nós já temos o especialista pedindo para ver o sistema. O CTA é demonstrar, não agendar parecer.
4. **Bloco “por que escolher” honesto.** Alinhado ao PPSI, código aberto, o programa inteiro no mesmo ambiente. Sem claim de marketing sem evidência.

### Recusar (modelo)

1. **Produto invisível.** Chamar de “plataforma” e não mostrar o trabalho é o oposto do moat.
2. **O negócio ser a banca.** Não há uma banca consolidada aqui — há dois anos de sistema. Competir em hora jurídica é escolher o campo onde o escritório ganha.
3. **Medo como proposta de valor.** Assédio, fraude, Lei 14.457 são outro produto. O FPSI é o sistema operacional do programa de privacidade.
4. **Claims sem evidência.** “Criptografia de ponta a ponta”, “24h SLA”, “100% LGPD” sem demonstração. João e Ana punem isso.

### Veredito

Absorver a gramática (jornada, comprador, porquê). Recusar o modelo (escritório na frente, software opaco, 14.457 no centro). A forma final do FPSI **não** é uma assessoria com software de fachada — é o contrário: o programa visível, operável, ensinável.

**Wedge:** *O sistema operacional do programa de privacidade — alinhado ao PPSI, aberto, usável por quem faz o trabalho.*

**Isto não é:** canal de denúncias + banca; GRC genérico “LGPD-ready”; só a planilha no navegador.

### 90 dias

1. Marcar e realizar a apresentação com a professora / evento.
2. Demo de 12 minutos: governança → diagnóstico → plano → evidência/portal.
3. Cinco conversas com praticantes; atualizar a CSD com o que ouvir.
4. Só então decidir PaaS vs. kit de formação vs. implantação em órgão.

### Sobre o medo de falhar tarde

Falhar tarde não é mostrar o sistema agora. É continuar desenvolvendo em silêncio até o mercado (ou a turma) adotar outra coisa — inclusive uma “plataforma” que ninguém vê. O convite da professora é o experimento mais barato dos últimos dois anos.
