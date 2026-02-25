# Contexto e pesquisa de origem do FPSI

Este documento reúne a pesquisa e o contexto regulatório que deram origem a esta aplicação. Serve de referência para alinhamento das funcionalidades com as expectativas originais e para divulgação da ferramenta.

---

## 1. Contexto regulatório

### 1.1 LGPD

A Lei Geral de Proteção de Dados Pessoais (LGPD), sancionada no Brasil em agosto de 2018 e em vigor desde setembro de 2020, é um marco regulatório que estabelece diretrizes rigorosas para a coleta, armazenamento, tratamento e compartilhamento de dados pessoais. Inspirada no Regulamento Geral de Proteção de Dados (GDPR) da União Europeia, a LGPD busca garantir a privacidade e a proteção dos dados dos cidadãos, impondo obrigações às empresas e organizações que lidam com essas informações.

### 1.2 PPSI e Framework (FPSI)

Em 30 de março de 2023, foi publicada pelo Ministério da Gestão e da Inovação em Serviços Públicos a portaria que estabelece o **Programa de Privacidade e Segurança da Informação (PPSI)** e institui o **Framework de Privacidade e Segurança da Informação** (que já havia sido lançado em novembro de 2022).

O Framework de Privacidade e Segurança da Informação (FPSI) é baseado nos principais frameworks de privacidade e segurança, como CIS, NIST e ISO/IEC. O documento disponibiliza **31 controles** de segurança e privacidade a serem implementados pelas repartições públicas, além de ferramentas para auxiliar no diagnóstico e melhoria de seu nível de segurança.

Além de ser normativo para o setor público, a **Autoridade Nacional de Proteção de Dados (ANPD)** utiliza as diretrizes já elaboradas para o setor público como referência, então o setor privado também pode se favorecer de processos de adequação.

---

## 2. Ferramenta oficial (planilha Excel)

Atualmente o framework é distribuído no site do Governo Federal no formato de uma planilha Excel chamada *Ferramenta do Framework de Privacidade e Segurança da Informação* — atualmente na **versão (ciclo) 2** — acompanhada de um manual de implementação.

A ferramenta disponibilizada baseia-se em uma pasta de trabalho no formato Excel (XLSX) com as seguintes planilhas temáticas:

- **CADASTROS**: planilha de cadastro do órgão ou instituição, encarregados, gestores e responsáveis por departamento.
- **CONTROLE 0 - ESTRUTURAÇÃO BÁSICA DE GESTÃO EM PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO**: questionário com medidas para o diagnóstico estrutural da gestão em privacidade e segurança da informação, descrição das medidas e campo de respostas das medidas.
- **CONTROLES 1 A 18 - SEGURANÇA DA INFORMAÇÃO**: questionário com medidas para o diagnóstico de segurança da informação, descrição das medidas, campo de respostas das medidas, justificativas, observações e nível de maturidade dos controles.
- **CONTROLES 19 A 31 – PRIVACIDADE**: questionário com medidas para o diagnóstico de privacidade, descrição das medidas, campo de respostas das medidas, justificativas, observações e nível de maturidade dos controles.
- **RELATÓRIO DE TODOS OS CONTROLES**: quadro resumido com os indicadores e nível de maturidade dos controles.
- **PLANO DE TRABALHO**: ações prioritárias baseadas nas respostas das medidas, seus responsáveis e departamentos, observações, previsão de início e fim e status do plano de ação e das medidas.

A interface da ferramenta é apresentada como um sistema com botões com ações, campos calculados, caixas de seleção, entre outros elementos gráficos análogos a um sistema de informação dentro de uma planilha. As planilhas são dinâmicas e com várias funcionalidades, através de fórmulas que quantificam as respostas às medidas dos questionários e qualificam a maturidade dos controles, exibindo relatórios com valores pré-formatados e alterando as ações dos planos de trabalho.

---

## 3. Pesquisa com usuários

Uma pesquisa foi conduzida na forma de conversa com três pessoas conhecidas (dois ex-alunos e uma professora de um curso de **ENCARREGADO DE PROTEÇÃO DE DADOS - CDPO/BR**) que estão envolvidas profissionalmente na área de privacidade e segurança da informação, a fim de conhecer melhor os anseios e angústias de possíveis usuários do sistema pelo ponto de vista de diferentes níveis de experiência na área. A partir da conversa foi montada a **Matriz CSD** e o **diagrama de observação do tipo POEMS**.

### 3.1 Público-alvo

O público-alvo do sistema é formado por profissionais que estejam envolvidos em um programa de privacidade e segurança de uma empresa, projeto, órgão ou instituição, incluindo principalmente:

- **Encarregados pelo Tratamento de Dados Pessoais (DPO)**: profissional interno ou externo a uma organização, responsável por garantir a conformidade com os regulamentos globais de privacidade de dados e fazer a mediação entre a empresa, os titulares dos dados pessoais (funcionários, fornecedores e clientes) e o próprio governo (por meio da ANPD).
- **Gestores de Tecnologia da Informação e de Segurança da Informação**: responsáveis por garantir a proteção dos dados pessoais e evitar possíveis penalidades legais, cumprindo todas as exigências da LGPD, desde a escolha das tecnologias até a divulgação da cultura de segurança.

### 3.2 Persona: João

O usuário que atua de forma ativa em um programa de privacidade e segurança é o Encarregado pelo Tratamento de Dados Pessoais (DPO), aqui exemplificado como **João**.

João é um profissional da área de tecnologia da informação que se especializou na área de gestão e recentemente foi incentivado por seus contratantes a buscar formação na área de privacidade e segurança de dados, a fim de assumir o papel de Encarregado de Dados (DPO) em seus projetos. João tem experiência em diversas áreas da informática, incluindo programação, capacitação, gestão de banco de dados e segurança de dados, e sabe que durante o tratamento de dados pessoais por setores de uma organização surgem vários riscos de violações de segurança e privacidade.

Após concluir a formação de DPO, João se sente com conhecimento teórico, mas **sem experiência prática** para iniciar um programa de privacidade e segurança na empresa em que presta serviço e em outras empresas como consultor independente. As ferramentas comerciais de privacidade testadas por ele **diferem muito** entre as funções oferecidas, enquanto a ferramenta disponibilizada pelo governo oferece um **roteiro básico de forma gratuita**, mas com **pouca praticidade** e oferta de ferramentas de gestão do programa.

### 3.3 Conclusões da pesquisa

Foi percebida a dificuldade em iniciar um programa de governança em privacidade e segurança de dados sem o uso de uma ferramenta para guiar o processo, que possui muitos itens a serem observados. Nesta questão a ferramenta fornecida pelo governo se mostrou **eficiente em simplificar a validação das medidas e medir o nível de maturidade** de um programa.

---

## 4. Problemas da planilha oficial

Apesar da eficiência na avaliação dos controles, a ferramenta possui **limitações** devido à tecnologia utilizada (planilha no formato Excel):

- **Acessibilidade**: interface de planilha com limitações de acessibilidade.
- **Trabalho distribuído**: os dados ficam armazenados em um arquivo no computador de um usuário, dificultando o trabalho entre vários usuários.
- **Disponibilidade**: dependência de um único arquivo local.
- **Software proprietário**: dependência de Microsoft Office para edição da planilha com total compatibilidade.

As principais soluções comerciais existentes para a gestão de um programa de governança em privacidade são **pagas**, sem alternativas gratuitas para implementação em órgãos públicos ou pequenas empresas. Além disso, as soluções existentes **não seguem o padrão de conformidade do Framework do PPSI** nem **permitem modificação no código**, a fim de adaptar a metodologia à realidade de uma organização.

---

## 5. Proposta: implementação open source

Propõe-se, portanto, desenvolver uma **implementação da Ferramenta do Framework do PPSI** utilizando tecnologias modernas, escaláveis e de fácil absorção pelo mercado, como **React**, **Node.js** e plataformas de armazenamento como **Supabase**, com o objetivo de fornecer um **software de referência** em privacidade e segurança da informação no **modelo de distribuição open source**.

A justificativa da abertura do código é para:

- Permitir a **colaboração da comunidade** em novas versões do framework.
- Facilitar a **implantação do framework** em órgãos públicos, empresas, consultores independentes.
- Permitir até plataformas de serviço de **PaaS (Privacy as a Service)**.

---

## Referências

- Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei nº 13.709/2018
- Portaria que estabelece o PPSI e o Framework (Ministério da Gestão e da Inovação em Serviços Públicos)
- Ferramenta oficial do Framework (planilha Excel, ciclo 2) — site do Governo Federal
- ANPD — Autoridade Nacional de Proteção de Dados
