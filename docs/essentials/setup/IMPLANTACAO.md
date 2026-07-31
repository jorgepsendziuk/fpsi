# Implantação do FPSI (nova instância)

Guia para colocar o FPSI no ar em um **projeto Supabase novo** + app Next.js (local ou Vercel).

Para o dia a dia de desenvolvimento, veja [COMO_RODAR_LOCALMENTE.md](./COMO_RODAR_LOCALMENTE.md).

## Visão geral

| Etapa | O que faz |
|-------|-----------|
| 1 | Criar projeto no Supabase |
| 2 | Aplicar migrações (`supabase db push`) |
| 3 | Configurar Auth (e-mail / Google) |
| 4 | Variáveis de ambiente no app |
| 5 | Primeiro usuário e primeiro programa |
| 6 | Deploy (opcional) |

As migrações em `supabase/migrations/` partem de um **schema base** (`20240101000000_baseline_core_schema.sql`) e evoluem até o catálogo PPSI 2.0, portal do titular, políticas, ROPA, etc.

## 1. Pré-requisitos

- **Node.js** ≥ 20, **npm** ≥ 10
- Conta [Supabase](https://supabase.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli): `brew install supabase/tap/supabase` (macOS)
- Para dump/restore avançado: Docker Desktop (opcional)

## 2. Supabase — projeto novo

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Anote em **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Aplicar o banco

Na raiz do repositório:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Isso aplica, em ordem:

1. Schema base (programa, diagnóstico, catálogo vazio)
2. Usuários, perfis, ROPA, RIPD, portal, políticas, catálogo PPSI 2.0 (27 controles, 210 medidas), etc.

**Projeto vazio:** use só `db push`. Não importe dumps antigos antes das migrações.

**Projeto legado** (schema criado fora das migrações): compare com [SCHEMA_COMPARISON.md](./SCHEMA_COMPARISON.md) antes de `db push`. Se o remoto já tinha migrações aplicadas antes da baseline `20240101000000`, o CLI pode pedir:

```bash
supabase db push --include-all
```

A baseline usa `IF NOT EXISTS` e é segura em banco já populado; serve sobretudo para **instâncias novas**.

### Verificar catálogo PPSI

No SQL Editor do Supabase:

```sql
SELECT count(*) FROM public.controle;   -- esperado: 27 (+ domínio AIGP se migração posterior aplicada)
SELECT count(*) FROM public.medida;    -- esperado: 210+
SELECT count(*) FROM public.diagnostico; -- esperado: 3 (Estrutura, Segurança, Privacidade) ou 4 com AIGP
```

## 3. Autenticação

Em **Authentication → Providers**:

- **Email**: ative sign-up / magic link conforme sua política.
- **Google** (opcional): credenciais OAuth no Google Cloud + redirect URL do Supabase. **Guia:** [LOGIN_SOCIAL_GOOGLE.md](./LOGIN_SOCIAL_GOOGLE.md)

Em **Authentication → URL Configuration**:

| Campo | Produção FPSI |
|-------|----------------|
| Site URL | `https://www.fpsi.com.br` |
| Redirect URLs | `https://www.fpsi.com.br/auth/callback`, `https://fpsi.com.br/auth/callback`, `http://localhost:3000/auth/callback` |

Alinhar `NEXT_PUBLIC_APP_URL` na Vercel (`https://www.fpsi.com.br` — domínio canônico; apex redireciona para www).

## 4. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha pelo menos:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://fpsi.com.br
```

| Variável | Obrigatória | Uso |
|----------|-------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Cliente Supabase (browser e server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave pública anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim* | Cadastro por e-mail, convites, admin API |
| `NEXT_PUBLIC_APP_URL` | Recomendada | Links em convites, PDFs, OAuth |
| `OPENAI_API_KEY` | Não | Sugestões de IA no mapeamento |
| `RESEND_API_KEY` | Não | E-mails ao DPO |
| `FPSI_ADMIN_EMAILS` | Não | Admin global por e-mail |

\*Sem service role, login manual no Supabase Auth ainda funciona; cadastro/convites pela UI não.

## 5. Rodar o app

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 → **Cadastrar** ou **Login**.

### Primeiro programa

1. Faça login.
2. Crie um programa em **Programas** (nome, slug do portal se solicitado).
3. Em **Programas → [id] → Usuários**, associe seu usuário como **admin** (ou use convite).

Se não vir programas após cadastro, confira RLS e a tabela `programa_users` no Supabase.

### Admin global (opcional)

Defina `FPSI_ADMIN_EMAILS=seu@email.com` para rotas admin que checam essa lista.

## 6. Deploy (Vercel ou similar)

1. Conecte o repositório.
2. Mesmas variáveis de `.env.example` no painel do host.
3. `NEXT_PUBLIC_APP_URL` = URL de produção.
4. Atualize **Site URL** e redirects no Supabase Auth.

Build:

```bash
npm run build
npm run start
```

## 7. Supabase local (opcional)

Com Docker:

```bash
supabase start
supabase db reset   # aplica migrações + seed.sql (vazio por padrão)
```

Use as URLs/chaves exibidas pelo CLI no `.env.local`.

## Migrações e seeds de demo

Várias migrações com prefixo `seed_` ou `pinovara_` inserem dados de **demonstração** para IDs de programa fixos. Em instância nova ficam inofensivas (no-op se o programa não existir).

Para demo limpa, crie seu programa pela UI; ignore seeds específicos de produção.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `relation "programa" does not exist` | Rode `supabase db push` no projeto linkado |
| `Variável de ambiente obrigatória ausente` | Copie `.env.example` → `.env.local` |
| Cadastro exige service role | Adicione `SUPABASE_SERVICE_ROLE_KEY` |
| Catálogo vazio | Confirme migração `20260327120000_ppsi20_catalogo_controles_medidas.sql` |
| OAuth redirect errado | Alinhe Supabase Auth URLs com `NEXT_PUBLIC_APP_URL` |

## Referências

- [README do projeto](../../../README.md)
- [Dumps e backup](../../../database/README_DUMP.md)
- [Comparação de schema](./SCHEMA_COMPARISON.md)
