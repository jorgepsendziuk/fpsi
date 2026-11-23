# Login Google — backend FPSI (sem Supabase Auth)

## Fluxo

1. `/login` → **Entrar com Google** → `GET /api/auth/google?next=/dashboard`
2. Redirect para Google OAuth (`accounts.google.com`)
3. Google → `GET /api/auth/google/callback` no **mesmo host** (Cloud Run ou domínio)
4. Cookie `fpsi_session` (JWT) + redirect para `next`

## Google Cloud — OAuth client (Web)

| Campo | Valor |
|-------|--------|
| **Authorized JavaScript origins** | `https://fpsi-fr4rheon2q-rj.a.run.app`, `https://www.fpsi.com.br`, `http://localhost:3000` |
| **Authorized redirect URIs** | `https://fpsi-fr4rheon2q-rj.a.run.app/api/auth/google/callback`, `https://www.fpsi.com.br/api/auth/google/callback`, `http://localhost:3000/api/auth/google/callback` |

Não use mais `https://<ref>.supabase.co/auth/v1/callback` para o login Google do FPSI.

## Variáveis

| Variável | Obrigatória |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Sim |
| `GOOGLE_CLIENT_SECRET` | Sim |
| `FPSI_SESSION_SECRET` | Sim (≥ 16 chars) |
| `AUTH_PUBLIC_BASE_URL` | Opcional (força origem se proxy alterar host) |

Cloud Run (Secret Manager): adicionar as três primeiras ao serviço `fpsi`.

## Limitação atual

A UI autentica via cookie FPSI, mas **APIs e RLS** ainda usam sessão Supabase (`auth.getUser()`). Usuário só com Google FPSI entra no shell; chamadas que exigem JWT Supabase podem falhar até migração de authz.