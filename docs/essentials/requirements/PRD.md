# Product Requirements Document (PRD) — FPSI

## 1. Visão Geral do Sistema

### 1.1 Descrição

O **FPSI** (Framework de Privacidade e Segurança da Informação) é a implementação web para **implantar e gerenciar, em um único ambiente, o Programa de Privacidade e Segurança da Informação** da organização.

Não se limita a um questionário de conformidade: cobre diagnóstico de maturidade, plano de trabalho, políticas, mapeamento de dados, ROPA, RIPD, portal e atendimento aos titulares, evidências, indicadores, gestão de riscos e assistência por IA — alinhados à **LGPD**, ao **PPSI 2.0** e a práticas de **governança de IA (AIGP)**.

É alternativa em software livre à ferramenta oficial em planilha Excel: multi-usuário, auditável e adaptável a órgãos públicos e empresas.

### 1.2 Objetivos Principais

- Concentrar o ciclo do programa de privacidade e segurança em um só sistema
- Diagnosticar maturidade (PPSI + AIGP) com controles, medidas e evidências
- Produzir e versionar políticas e documentos do programa e do portal
- Registrar tratamentos de dados (mapeamento, ROPA, RIPD/AIPD) e incidentes
- Oferecer canal público aos titulares (pedidos, reportes, documentos legais)
- Priorizar plano de trabalho e riscos com responsáveis e prazos
- Permitir trabalho colaborativo com papéis e auditoria
- Assistir tarefas repetitivas (ex.: sugestões de mapeamento) com revisão humana

### 1.3 Público-Alvo

- Encarregados de Proteção de Dados (DPO)
- Gestores de Segurança da Informação e de TI
- Equipes de conformidade e privacidade
- Comitês de Proteção de Dados Pessoais
- Auditores e consultores
- Órgãos públicos e empresas que adotam o PPSI

### 1.4 Posicionamento (comunicação)

**Evitar:** “Uma ferramenta para diagnóstico da LGPD.”

**Preferir:**

> Implante e gerencie, em um único ambiente, o Programa de Privacidade e Segurança da Informação da sua organização.

> Diagnóstico de maturidade, plano de trabalho, políticas, mapeamento de dados, ROPA, atendimento aos titulares, evidências, indicadores e assistência por IA.

### 1.5 Superfícies do produto

| Superfície | Função |
|------------|--------|
| Landing (`/`) | Apresentação e conversão para demo / cadastro |
| Demo (`/demo/login`) | Exploração sem cadastro (persistência restrita) |
| Auth (`/login`, `/register`, convites) | Conta e onboarding |
| Área autenticada | Dashboard, programas, admin de catálogo, referências |
| Portal público (`/[slug]`) | Titulares: pedidos, reportes, contato, docs legais |
| Institucional | `/sobre`, `/divulgacao`, `/artigo`, `/privacidade` |

---

## 2. Requisitos Funcionais

### 2.1 Programa e visão operacional

- Criar e gerenciar programas (identificação da organização, slug do portal)
- Dashboard com KPIs, pendências e calendário
- Navegação por módulos do programa
- Camada visual opcional: Escritório de governança

### 2.2 Diagnóstico de maturidade (PPSI + AIGP)

- Avaliar domínios PPSI: Estrutura de Governança, Segurança, Privacidade
- Avaliar domínio AIGP / Governança de IA
- Registrar nível de implementação (INCC), medidas e evidências
- Atribuir responsáveis
- Calcular índices de maturidade e gerar relatório

### 2.3 Plano de trabalho

- Criar ações a partir de gaps do diagnóstico ou manualmente
- Definir prazos, responsáveis e status
- Acompanhar evolução das ações

### 2.4 Políticas e documentos

- Manter catálogo de modelos (PGSI, PGP, políticas de SI, documentos do portal, etc.)
- Editar conteúdo por seção, versionar e exportar PDF
- Publicar documentos associados ao portal do titular quando aplicável

### 2.5 Tratamento de dados e conformidade LGPD

- **Mapeamento de dados** (ativos, fluxos, bases)
- **ROPA** (registro das atividades de tratamento)
- **RIPD / AIPD**
- **Incidentes** de segurança / privacidade
- Assistência por IA no mapeamento (sugestões; decisão humana)

### 2.6 Titulares e canais públicos

- Portal por slug da organização
- Pedidos dos titulares: envio e consulta
- Reportes e contato
- Documentos legais públicos (política de privacidade, aviso, cookies, declaração de segurança, termo de uso)

### 2.7 Gestão de riscos

- Matriz de riscos (impacto × probabilidade)
- Risco residual e ações de mitigação
- Ligação com controles / plano de trabalho quando aplicável

### 2.8 Estrutura de governança e responsáveis

- Papéis LGPD (controlador, operador, encarregado)
- Cadastro de responsáveis, departamentos e vínculos
- Associação a controles, medidas e ações

### 2.9 Usuários, permissões e auditoria

- Convites e multi-usuário por programa
- Papéis: admin, coordenador, analista, consultor, auditor
- Permissões granulares (ver / editar / aprovar / publicar / excluir por domínio)
- Histórico de atividades do programa

### 2.10 Administração de catálogo (global)

- Modelos de políticas, controles, medidas, diagnósticos
- Cargos, departamentos e configurações de plataforma
- Referências consultáveis: LGPD e AIGP

### 2.11 Relatórios e indicadores

- Relatório de diagnóstico
- Exportação (PDF e formatos suportados)
- Indicadores de maturidade e evolução no tempo
- Painéis operacionais no dashboard

### 2.12 Modo demonstração

- Entrada pública em `/demo/login` sem cadastro prévio
- Programa demo explorável com dados realistas
- Edição na interface permitida; persistência bloqueada ou restrita onde definido
- CTA claro para criar conta / próprio programa (landing e fluxos de conversão)

---

## 3. Requisitos Não Funcionais

### 3.1 Performance

- Tempo de resposta adequado para uso interativo em escritório
- Suporte a múltiplos usuários concorrentes por programa
- Otimização de consultas e cache onde necessário

### 3.2 Segurança

- Autenticação via Supabase Auth
- Autorização por programa e permissões granulares
- Proteção de rotas autenticadas vs. portal público
- Logs de auditoria de ações relevantes
- Separação clara entre dados do programa e superfície pública do titular

### 3.3 Usabilidade

- Interface responsiva (desktop e mobile)
- Temas claro / escuro
- Navegação por módulos do programa
- Feedback visual de ações e estados de salvamento
- Demo como caminho de descoberta do produto

### 3.4 Disponibilidade e operação

- Deploy contínuo (Vercel)
- Backup e recuperação via infraestrutura Supabase
- Monitoramento básico da aplicação

### 3.5 Acessibilidade e abertura

- Código open source
- Documentação em `docs/` para implantação e contribuição
- Catálogo de medidas alinhado ao framework oficial (PPSI) e extensões (AIGP)

---

## 4. Restrições de Negócio

### 4.1 Conformidade

- Alinhamento com LGPD e roteiro PPSI 2.0
- Referência a boas práticas AIGP / normas externas (ISO, NIST, etc.) como apoio, sem substituir assessoria jurídica
- Rastreabilidade de avaliações, evidências e alterações relevantes

### 4.2 Processos

- Fluxos de revisão / aprovação onde o papel exigir
- Gestão de responsáveis e prazos
- Versionamento de políticas e documentos
- Histórico de alterações e auditoria

### 4.3 Integrações

- APIs internas (portal, convites, IA de mapeamento)
- Exportação de documentos e relatórios
- Extensibilidade futura (PaaS / integrações externas) sem acoplar o núcleo ao Excel

---

## 5. Restrições Técnicas

### 5.1 Infraestrutura

- Node.js conforme `engines` do `package.json` (faixa 20.x–22.x)
- Next.js (App Router) + React 19 + TypeScript
- Supabase (Auth + Postgres + SSR)
- Material-UI / Refine na interface
- Deploy tipicamente em Vercel

### 5.2 Desenvolvimento

- TypeScript e padrões do repositório
- Migrations Supabase versionadas
- Testes conforme guias em `docs/essentials/testing/`
- Versionamento Git

### 5.3 Segurança técnica

- Sessão e cookies via Supabase SSR
- RLS / políticas de acesso no banco onde aplicável
- Validação server-side em APIs sensíveis (ex.: IA, portal)
- Controle de sessão e proteção de rotas

---

## 6. Métricas de Sucesso

### 6.1 Produto e adoção

- Visitantes da demo que exploram os módulos principais
- Conversão demo → cadastro / criação de programa
- Programas ativos com diagnóstico iniciado e plano de trabalho em uso
- Uso do portal do titular (pedidos / documentos publicados)

### 6.2 Operação do programa (valor percebido)

- Evolução dos índices de maturidade no tempo
- Cobertura de medidas com evidência
- Políticas publicadas / versionadas
- ROPA e mapeamento preenchidos
- Tempo de resposta a pedidos de titulares e a incidentes registrados

### 6.3 Qualidade técnica

- Disponibilidade do ambiente de produção
- Taxa de erro de API e build
- Tempo de deploy aceitável no fluxo Vercel

### 6.4 Usabilidade (metas)

- Caminho guiado na demo (primeiro clique claro)
- Dados demo visualmente completos (não “ambiente vazio”)
- CTA persistente para criar o próprio programa

---

## 7. Escopo fora / não objetivos

- Substituir assessoria jurídica ou decisão regulatória automática
- Certificação formal ISO/LGPD emitida pelo produto
- Persistência ilimitada no modo demo (o demo é vitrine, não tenant definitivo)
- Cobrir todos os frameworks internacionais com a mesma profundidade do PPSI (referências externas são apoio)

---

## 8. Documentação relacionada

- [README do repositório](../../../README.md) — visão pública e setup
- [FRD](./FRD.md) — requisitos funcionais detalhados (evoluir junto com este PRD)
- [TRD](./TRD.md) — referência técnica
- [Contexto da pesquisa de origem](../CONTEXTO_PESQUISA_ORIGEM.md)
- [Governança de IA / AIGP](../../aigp/GOVERNANCA_IA_AIGP.md)
- [Escritório de governança](../features/OFFICE_RPG_GOVERNANCA.md)
