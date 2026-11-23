# Mapa: dependências do Supabase (saída gradual)

Objetivo do Jorge: **sem Supabase Auth na UI** e **sem Vercel**; banco Postgres pode permanecer no Supabase Hosted ou migrar para Cloud SQL depois.

## Já alterado (Google)

| Área | Antes | Agora |
|------|--------|--------|
| Login Google | `signInWithOAuth` + `/auth/callback` Supabase | `/api/auth/google` + cookie `fpsi_session` |
| `check` Refine | só `supabase.auth.getUser()` | + `/api/auth/session` e cookie no server |

## Ainda acoplado ao Supabase

### Auth e sessão

- E-mail/senha: `signInWithPassword`, `signUp`, recuperação de senha
- `src/app/auth/callback/route.ts` (OAuth legado Supabase)
- Middleware: `updateSession` + cookies `*-auth-token`
- ~70 rotas `app/api/**` com `createSupabaseServerClient().auth.getUser()`
- `lib/authz/*`, convites, cadastro usuários

### Dados

- `@refinedev/supabase` data provider
- `dataService.ts`, quase todo CRUD via `supabase-js` + **RLS** com JWT do Auth
- `SUPABASE_SERVICE_ROLE_KEY` em scripts/admin

### Config / deploy

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Migrations em `supabase/migrations/`
- Vercel: deploy automático em `main` (parar quando domínio apontar só ao Cloud Run)

## Caminho para sair de vez (não implementado)

1. **Auth:** sessions FPSI para todos os métodos; tabela `sessions` ou JWT; substituir `getUser()` por helper `getFpsiUser(request)`.
2. **Dados:** PostgREST próprio, Prisma/Drizzle + Cloud SQL, ou Supabase só como Postgres (sem Auth/Realtime).
3. **RLS:** replicar em app layer ou policies com role de conexão fixa + filtros no servidor.
4. **Storage:** GCS em vez de Supabase Storage (se usado).
5. **Edge:** remover `@supabase/ssr` do middleware quando Auth estiver 100% FPSI.