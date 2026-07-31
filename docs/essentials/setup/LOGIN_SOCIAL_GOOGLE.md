# Login social (Google) — FPSI

Guia para configurar **Entrar com Google** em produção (`fpsi.com.br`) e em desenvolvimento local.

## Como o fluxo funciona no código

1. Usuário clica **Entrar com Google** em `/login`.
2. O app chama Supabase `signInWithOAuth` com:
   ```
   redirectTo = {origem atual}/auth/callback?next=/dashboard
   ```
   A origem é `window.location.origin` (ex.: `https://www.fpsi.com.br` — o domínio canônico redireciona apex → www).
3. Supabase redireciona ao Google e volta para **`/auth/callback`** no app.
4. A rota `src/app/auth/callback/route.ts` troca o `code` por sessão (cookies) e redireciona para `/dashboard` (ou `?next=`).

Rotas `/auth/*` e `/login` **não passam** pelo middleware de sessão, para o callback completar antes do layout protegido.

---

## Checklist — produção (remoto)

### 1. Supabase — ativar Google

1. [Supabase Dashboard](https://supabase.com/dashboard) → projeto **bqujcsrfblsnvloibmcm** (ou o seu).
2. **Authentication** → **Providers** → **Google** → **Enable**.
3. Deixe em branco Client ID/Secret por enquanto (passo 2 abaixo).

> **Status verificado (jul/2026):** com o provider desligado, a API responde  
> `Unsupported provider: provider is not enabled` — o botão na UI existe, mas o login social **não funciona** até ativar.

### 2. Google Cloud — credenciais OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → projeto → **APIs & Services** → **Credentials**.
2. **Create Credentials** → **OAuth client ID** → tipo **Web application**.
3. **Authorized JavaScript origins:**
   - `https://www.fpsi.com.br`
   - `https://fpsi.com.br` (opcional; redireciona para www)
   - `http://localhost:3000` (dev)
4. **Authorized redirect URIs** (callback do **Supabase**, não do FPSI):
   ```
   https://bqujcsrfblsnvloibmcm.supabase.co/auth/v1/callback
   ```
   Substitua pelo `project-ref` do seu projeto se for outro.
5. Copie **Client ID** e **Client Secret** para o Supabase (passo 1).

### 3. Supabase — URLs de redirect do app

**Authentication** → **URL Configuration**:

| Campo | Valor recomendado |
|-------|-------------------|
| **Site URL** | `https://www.fpsi.com.br` |
| **Redirect URLs** (adicione todas) | `https://www.fpsi.com.br/auth/callback` |
| | `https://fpsi.com.br/auth/callback` |
| | `http://localhost:3000/auth/callback` |
| | `https://*.vercel.app/auth/callback` (previews, opcional) |

O Supabase só aceita redirecionar de volta para URLs desta lista. O path **`/auth/callback`** é obrigatório — é onde o FPSI troca o code por sessão.

### 4. Vercel — variável de ambiente

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://www.fpsi.com.br` |

Usada em e-mails, convites e PDFs. O OAuth no browser usa o host atual (`www`), mas convites devem apontar para o domínio canônico.

**Redeploy** após alterar variáveis.

### 5. Testar

1. Abra `https://www.fpsi.com.br/login` (ou `https://fpsi.com.br/login` — deve ir para www).
2. **Entrar com Google** → tela de conta Google → volta para `/dashboard`.
3. Se falhar, a URL fica `/login?error=oauth` com mensagem.

---

## Desenvolvimento local

1. Mesmo provider Google no Supabase (pode usar as mesmas credenciais).
2. Inclua `http://localhost:3000/auth/callback` nas Redirect URLs do Supabase.
3. No `.env.local`, **não** force `NEXT_PUBLIC_APP_URL=https://fpsi.com.br` se quiser testar OAuth local — use `http://localhost:3000` ou omita (o browser usa a origem atual).

---

## Erros comuns

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| Página em branco no Supabase / `provider is not enabled` | Google desligado no Supabase | Ativar provider + credenciais |
| `redirect_uri_mismatch` no Google | URI errada no Google Cloud | Usar `https://<ref>.supabase.co/auth/v1/callback` |
| Volta ao login com `error=oauth` | URL de callback não permitida no Supabase | Adicionar `https://www.fpsi.com.br/auth/callback` |
| Volta com `error=auth` | Falha ao trocar `code` por sessão | Conferir cookies, domínio www vs apex, rede |
| OAuth ok mas cai na home | Sessão não persistiu | Verificar middleware e cookies Supabase SSR |

---

## Referências no repositório

- Callback: `src/app/auth/callback/route.ts`
- Início OAuth: `src/providers/auth-provider/auth-provider.client.ts`
- UI login: `src/app/login/page.tsx`
- Dev local (resumo): [COMO_RODAR_LOCALMENTE.md](./COMO_RODAR_LOCALMENTE.md)
- Implantação: [IMPLANTACAO.md](./IMPLANTACAO.md)
