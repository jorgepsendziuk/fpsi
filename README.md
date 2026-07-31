# FPSI — Framework de Privacidade e Segurança da Informação

**Implante e gerencie, em um único ambiente, o Programa de Privacidade e Segurança da Informação da sua organização.**

Diagnóstico de maturidade, plano de trabalho, políticas, mapeamento de dados, ROPA, atendimento aos titulares, evidências, indicadores e assistência por IA — alinhados à **LGPD**, ao **PPSI 2.0** do Governo Federal e a práticas de **governança de IA (AIGP)**.

Alternativa em **software livre** à ferramenta oficial em planilha Excel: multi-usuário, sem dependência de software proprietário e adaptável à realidade de cada organização.

**Produção:** [fpsi.com.br](https://fpsi.com.br) (canônico: `www.fpsi.com.br`) · **Demo:** [fpsi.com.br/demo/login](https://fpsi.com.br/demo/login)

## Para quem é

- **DPOs** (Encarregados pelo Tratamento de Dados Pessoais)
- **Gestores de TI e de Segurança da Informação**
- Comitês de privacidade, auditores e consultores
- Órgãos públicos e empresas que conduzem o PPSI / programa de privacidade

## O que o produto cobre

| Área | Capacidade |
|------|------------|
| **Diagnóstico** | Maturidade PPSI (Estrutura, Segurança, Privacidade) e domínio **AIGP / Governança de IA**; controles, medidas, evidências e relatório |
| **Plano de trabalho** | Ações, prazos, responsáveis e acompanhamento |
| **Políticas e documentos** | Editor de políticas (PGSI, PGP, SI e demais modelos), versionamento e PDF |
| **Tratamento de dados** | Mapeamento, **ROPA**, **RIPD/AIPD**, incidentes |
| **Titulares** | Portal público por slug (`/sua-org`), pedidos dos titulares, reportes, contato e documentos legais |
| **Riscos** | Matriz 5×5, risco residual e mitigação |
| **Governança** | Estrutura de responsabilidades, papéis LGPD, dashboard operacional e histórico/auditoria |
| **IA assistida** | Sugestões no mapeamento de dados (com revisão humana) |
| **Referências** | Consulta in-app à LGPD e ao catálogo AIGP |

Há também uma camada visual opcional — o **Escritório de governança** — como interface alternativa ao painel do programa.

## Superfícies principais

- **Landing** (`/`) — apresentação do produto e entrada na demo
- **Demo** (`/demo/login`) — ambiente explorável sem cadastro (edição na UI; persistência restrita)
- **Cadastro / login** (`/register`, `/login`)
- **Área autenticada** — dashboard, programas e administração de catálogo
- **Portal do titular** (`/[slug]`) — canal público por organização

## Origem do projeto

O projeto nasceu de uma pesquisa com profissionais da área (incl. formação CDPO/BR), que identificou a eficiência da ferramenta oficial em Excel para validação de medidas e nível de maturidade, mas também suas limitações: acessibilidade, trabalho distribuído e dependência de software proprietário. Esta implementação usa tecnologias modernas para oferecer um software de referência em **modelo open source**, permitindo colaboração da comunidade, implantação em órgãos públicos e empresas, e até oferta como PaaS (Privacy as a Service).

**Documentação da pesquisa e do contexto regulatório:** [docs/essentials/CONTEXTO_PESQUISA_ORIGEM.md](docs/essentials/CONTEXTO_PESQUISA_ORIGEM.md)

## Implantação rápida

Passo a passo completo: **[docs/essentials/setup/IMPLANTACAO.md](docs/essentials/setup/IMPLANTACAO.md)**  
Assistente interativo no app (após `npm run dev`): **[http://localhost:3000/setup](http://localhost:3000/setup)**

### Resumo (nova instância)

```bash
git clone https://github.com/SEU_ORG/fpsi.git && cd fpsi
npm install
cp .env.example .env.local   # preencher chaves do Supabase

supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push             # schema base + todas as migrações (incl. catálogo PPSI 2.0)

npm run dev                  # http://localhost:3000 — assistente: /setup
```

### Variáveis de ambiente

Copie [`.env.example`](.env.example) para `.env.local` (dev) ou configure no painel do deploy.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim* | Cadastro por e-mail, convites, API admin |
| `NEXT_PUBLIC_APP_URL` | Recomendada | URL pública do app (links e OAuth) |
| `OPENAI_API_KEY` | Não | IA no mapeamento de dados |
| `RESEND_API_KEY` | Não | E-mails transacionais |
| `FPSI_ADMIN_EMAILS` | Não | E-mails com acesso admin global |

\*Sem a service role, login manual ainda funciona; fluxos de cadastro/convite pela UI exigem essa chave.

O app **não** embute mais credenciais Supabase no código — tudo vem das variáveis acima.

### Banco de dados

- Migrações versionadas em [`supabase/migrations/`](supabase/migrations/)
- A primeira migração (`20240101000000_baseline_core_schema.sql`) cria o schema legado (programa, diagnóstico, respostas)
- Migrações seguintes adicionam usuários, ROPA, portal, políticas e o **catálogo PPSI 2.0** (210 medidas)
- Comando: `supabase db push` em projeto Supabase **novo e vazio**

Backups e dumps: [database/README_DUMP.md](database/README_DUMP.md)

## Desenvolvimento local

- **Setup e troubleshooting:** [docs/essentials/setup/COMO_RODAR_LOCALMENTE.md](docs/essentials/setup/COMO_RODAR_LOCALMENTE.md)
- **Documentação geral:** [docs/README.md](docs/README.md)
- **PRD (escopo do produto):** [docs/essentials/requirements/PRD.md](docs/essentials/requirements/PRD.md)

## Tecnologias

- Next.js, React, TypeScript
- Supabase (autenticação e banco de dados)
- Material-UI / Refine
- Deploy em Vercel

## Autenticação e autorização

- **Identidade:** Supabase Auth (`auth.users`, sessão em cookies). Login por e-mail/senha ou OAuth.
- **Papéis por programa:** `admin`, `coordenador`, `analista`, `consultor`, `auditor` — via `programa_users`, com permissões granulares (ver, editar, aprovar, publicar, etc.).
- **Convites:** fluxo de aceite em `/auth/aceitar-convite`.

## Licença

Código aberto. Consulte o repositório e a pasta `docs/` para mais informações.
