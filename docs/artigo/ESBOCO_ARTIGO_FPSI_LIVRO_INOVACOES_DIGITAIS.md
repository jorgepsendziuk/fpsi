# Esboço do Artigo para o Livro "Inovações Digitais: Governança Algorítmica, Privacidade e Segurança Pública"

**Chamada:** 04/11/2025 a 10/04/2026 | **Prazo de submissão:** 10 de abril de 2026

---

## Metadados (folha de rosto)

- **Título em português:** Implementação open source do Framework de Privacidade e Segurança da Informação: ferramenta para compliance digital e governança de dados no setor público
- **Título em inglês:** Open source implementation of the Privacy and Information Security Framework: a tool for digital compliance and data governance in the public sector
- **Autores:** [Nome(s), Titulação, Profissão, E-mail]
- **Palavras-chave (PT):** LGPD; Framework PPSI; privacidade; segurança da informação; software livre; compliance digital; setor público
- **Palavras-chave (EN):** LGPD; PPSI Framework; privacy; information security; open source; digital compliance; public sector

---

## Sumário

1. Introdução  
2. Marco regulatório: LGPD, PPSI e o Framework FPSI  
3. Limitações da ferramenta oficial e demanda por alternativas  
4. Pesquisa com usuários e definição do problema  
5. Proposta: implementação open source  
6. Funcionalidades e arquitetura do sistema  
7. Casos de uso e aplicação prática  
8. Considerações sobre governança, auditoria e accountability  
9. Conclusão  
10. Referências  

---

## 1. Introdução (rascunho)

A intensificação da transformação digital e a entrada em vigor da Lei Geral de Proteção de Dados Pessoais (LGPD) impulsionaram a necessidade de ferramentas que auxiliem organizações — especialmente órgãos públicos — a implementar programas de privacidade e segurança da informação. Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos estabeleceu o Programa de Privacidade e Segurança da Informação (PPSI) e o Framework de Privacidade e Segurança da Informação (FPSI), disponibilizando uma ferramenta oficial em planilha Excel para diagnóstico e acompanhamento de controles.

Apesar da eficácia metodológica da ferramenta oficial, sua dependência de planilha eletrônica impõe limitações de acessibilidade, trabalho colaborativo e interoperabilidade. Este artigo apresenta uma implementação open source do Framework FPSI, desenvolvida com tecnologias web modernas, que visa suprir essas lacunas e oferecer uma alternativa gratuita e adaptável para órgãos públicos, empresas e consultores.

O texto está organizado em nove seções. Após esta introdução, o marco regulatório é apresentado na seção 2. A seção 3 discute as limitações da ferramenta oficial. A seção 4 descreve a pesquisa com usuários que fundamentou o projeto. A seção 5 apresenta a proposta de implementação open source. A seção 6 detalha as funcionalidades e a arquitetura do sistema. A seção 7 aborda casos de uso e aplicação prática. A seção 8 trata de governança, auditoria e accountability. Por fim, a seção 9 conclui o artigo.

---

## 2. Marco regulatório: LGPD, PPSI e o Framework FPSI (rascunho)

### 2.1 LGPD

A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), em vigor desde setembro de 2020, estabelece diretrizes para o tratamento de dados pessoais no Brasil. Inspirada no GDPR europeu, a LGPD impõe obrigações às organizações que coletam, armazenam e compartilham dados pessoais, incluindo a designação de Encarregado pelo Tratamento de Dados Pessoais (DPO), o registro das operações de tratamento (ROPA, art. 37) e a adoção de medidas de segurança técnicas e organizacionais.

### 2.2 PPSI e Framework FPSI

Em 30 de março de 2023, foi publicada a portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o Framework de Privacidade e Segurança da Informação. O Framework é baseado em referenciais como CIS, NIST e ISO/IEC e oferece 31 controles de segurança e privacidade a serem implementados pelas repartições públicas. A Autoridade Nacional de Proteção de Dados (ANPD) utiliza as diretrizes do setor público como referência, de modo que o setor privado também pode se beneficiar da adequação ao Framework.

### 2.3 Ferramenta oficial

A ferramenta oficial do Framework é distribuída em formato Excel (ciclo 2) e inclui cadastros, questionários de diagnóstico (Controle 0, Controles 1–18 de segurança, Controles 19–31 de privacidade), relatório de controles e plano de trabalho. A interface utiliza fórmulas para calcular níveis de maturidade e gerar ações prioritárias.

---

## 3. Limitações da ferramenta oficial e demanda por alternativas (rascunho)

A ferramenta oficial, embora eficiente na avaliação de controles e no cálculo de maturidade, apresenta limitações decorrentes do uso de planilha eletrônica:

- **Acessibilidade:** interface de planilha com restrições para usuários com necessidades especiais.
- **Trabalho distribuído:** os dados ficam em um arquivo local, dificultando a colaboração entre múltiplos usuários.
- **Disponibilidade:** dependência de um único arquivo e risco de perda ou inconsistência.
- **Software proprietário:** dependência de Microsoft Office para edição com total compatibilidade.

As soluções comerciais de gestão de privacidade são pagas e, em geral, não seguem o padrão do Framework PPSI nem permitem adaptação do código à realidade de cada organização.

---

## 4. Pesquisa com usuários e definição do problema (rascunho)

Foi realizada uma pesquisa qualitativa com três profissionais da área de privacidade e segurança da informação (dois ex-alunos e uma professora do curso CDPO/BR), com o objetivo de identificar anseios e dificuldades de possíveis usuários.

**Público-alvo:** DPOs, gestores de TI e de segurança da informação.

**Persona:** João, DPO com formação recente, sente-se com conhecimento teórico mas sem experiência prática para iniciar um programa. As ferramentas comerciais diferem muito entre si; a ferramenta oficial oferece roteiro gratuito, mas com pouca praticidade e gestão.

**Conclusão:** A ferramenta oficial é eficiente para validação de medidas e medição de maturidade, mas há demanda por uma solução que combine o roteiro do Framework com praticidade, trabalho colaborativo e independência de software proprietário.

---

## 5. Proposta: implementação open source (rascunho)

Propõe-se desenvolver uma implementação web do Framework FPSI utilizando tecnologias modernas (React, Next.js, Supabase), em modelo open source, com os seguintes objetivos:

- Permitir colaboração da comunidade em novas versões.
- Facilitar a implantação em órgãos públicos, empresas e consultores.
- Permitir oferta como PaaS (Privacy as a Service).
- Garantir adaptabilidade do código à realidade de cada organização.

---

## 6. Funcionalidades e arquitetura do sistema (rascunho)

### 6.1 Módulos principais

- **Diagnóstico de maturidade:** árvore diagnóstico → controle → medida; respostas e justificativas; níveis INCC (0–5); dashboard de maturidade; 31 controles alinhados ao Framework oficial.
- **Plano de trabalho:** ações prioritárias, responsáveis, datas, status, orçamento, riscos; dashboard executivo.
- **Políticas:** editor de políticas (incluindo política de proteção de dados), exportação em PDF.
- **ROPA:** registro das operações de tratamento (art. 37 LGPD); campos para finalidade, base legal, categorias de dados, compartilhamento, retenção, medidas de segurança.
- **Responsáveis:** cadastro e atribuição de responsáveis por controles e departamentos.
- **Auditoria:** trilha de auditoria (quem fez o quê, quando), alinhada ao Controle 8 do Framework e ao art. 37 da LGPD.

### 6.2 Arquitetura técnica

- **Frontend:** Next.js 15, React 19, TypeScript, Material-UI.
- **Backend:** Supabase (autenticação, banco de dados PostgreSQL, APIs).
- **Cálculo de maturidade:** implementação da fórmula oficial (iMC, iSeg, iPriv) com níveis de implementação e capacidade (INCC).

### 6.3 Multi-cliente

O conceito de "programa" permite que um consultor gerencie vários clientes na mesma ferramenta.

---

## 7. Casos de uso e aplicação prática (rascunho)

### 7.1 Projeto PINOVARA

O FPSI é utilizado no projeto PINOVARA (parceria INCRA/UFBA), que envolve coleta de dados socioeconômicos e ambientais em assentamentos e territórios quilombolas. O sistema apoia o programa de privacidade, o ROPA e a adequação à LGPD em contexto de política pública.

### 7.2 Rotina do DPO

O sistema cobre etapas centrais da rotina do DPO em consultoria: levantamento e governança, diagnóstico de maturidade, plano de trabalho, implementação e acompanhamento. Itens como ROPA, gestão de direitos dos titulares e RIPD estão em desenvolvimento ou planejamento.

---

## 8. Considerações sobre governança, auditoria e accountability (rascunho)

O sistema implementa trilha de auditoria (logs de atividades) que registra ações dos usuários no programa, em conformidade com o Controle 8 do Framework (gestão de log de auditoria) e com exigências de rastreabilidade do art. 37 da LGPD. A abertura do código permite auditoria independente da implementação e contribui para a transparência e a accountability na governança de dados.

---

## 9. Conclusão (rascunho)

A implementação open source do Framework FPSI oferece uma alternativa à ferramenta oficial em Excel, combinando o roteiro metodológico do PPSI com trabalho colaborativo, independência de software proprietário e adaptabilidade. O sistema já cobre diagnóstico de maturidade, plano de trabalho, políticas, ROPA e trilha de auditoria, atendendo a necessidades centrais de DPOs e gestores de segurança no setor público e privado.

A abertura do código permite que a comunidade contribua com melhorias e que organizações adaptem a ferramenta às suas realidades, reforçando o papel do software livre na promoção da privacidade e da segurança da informação.

---

## 10. Referências (a completar em ABNT)

- BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD).
- BRASIL. Portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI). Ministério da Gestão e da Inovação em Serviços Públicos, 30 de março de 2023.
- Ferramenta oficial do Framework de Privacidade e Segurança da Informação (planilha Excel, ciclo 2). Governo Federal.
- Documentação do projeto FPSI: docs/essentials/CONTEXTO_PESQUISA_ORIGEM.md, docs/essentials/ROTINA_DPO_E_GAPS.md, docs/pinovara/PROGRAMA_PRIVACIDADE.md.

---

## Próximos passos

1. [ ] Completar os rascunhos de cada seção com argumentação e citações.
2. [ ] Incluir resumo em português (200–300 palavras) e em inglês.
3. [ ] Ajustar formatação conforme edital (Times New Roman 12, margens, espaçamento 1,5, ABNT).
4. [ ] Revisar correção linguística.
5. [ ] Verificar conformidade com normas do edital.
6. [ ] Enviar até 10/04/2026 em .doc/.docx.
