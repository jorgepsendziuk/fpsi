# 🚀 Como Rodar o Projeto FPSI Localmente

> **Primeira instância (Supabase novo + deploy):** use o guia dedicado [IMPLANTACAO.md](./IMPLANTACAO.md).  
> Este documento foca em **desenvolvimento** e troubleshooting no dia a dia.

## 📋 **Pré-requisitos**
- **Node.js**: ≥ 20.0.0
- **npm**: ≥ 10.0.0  
- **Git**: Para clonar o projeto

## 🛠️ **Comandos Principais**

### **1. Desenvolvimento**
```bash
npm run dev
```
- **Acesso**: http://localhost:3000
- **Hot Reload**: Ativado (mudanças aparecem automaticamente)
- **Porta padrão**: 3000
- O script `dev` usa **Next.js** (Webpack; sem Turbopack) e **telemetria desativada** (`NEXT_TELEMETRY_DISABLED=1`) para evitar atrasos. Na **primeira vez** depois de `dev:fresh` ou `clean:next`, pode levar **1–3 minutos** até aparecer "Ready" — não interrompa; teste abrindo http://localhost:3000 no navegador enquanto isso. Para Turbopack: `npm run dev:turbo`. Para Refine Devtools: `npm run dev:refine`.

### **2. Build de Produção**
```bash
npm run build
```
- Testa se o projeto pode ser deployado
- Gera arquivos otimizados na pasta `.next`

### **3. Preview de Produção**
```bash
npm run build && npm run start
```
- Simula o ambiente de produção localmente
- **Acesso**: http://localhost:3000

### **4. Linting e Tipos**
```bash
npm run lint          # Verificar erros de código
npm run type-check     # Verificar erros de TypeScript
```

## 🌐 **URLs de Acesso Local**

### **Páginas Principais**
- **Home**: http://localhost:3000
- **Diagnóstico**: http://localhost:3000/diagnostico
- **Programas**: http://localhost:3000/programas
- **Login**: http://localhost:3000/login

### **Funcionalidades Específicas**
- **Programa específico**: http://localhost:3000/programas/[id]
- **Diagnóstico detalhado**: http://localhost:3000/programas/[id]/diagnostico
- **Responsabilidades**: http://localhost:3000/programas/[id]/responsabilidades

## 🔧 **Configurações de Desenvolvimento**

### **Variáveis de Ambiente**
O arquivo `.env.local` fica na **raiz do projeto** (mesma pasta do `package.json`). Se não existir, crie:

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase
```

Ou crie manualmente `.env.local` com:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
# Obrigatório para: gestão de usuários, convites e cadastro por e-mail
# Onde obter: Supabase Dashboard → Project Settings → API → service_role (secret)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### **Migrações Supabase**
O projeto usa Supabase CLI com migrações em `supabase/migrations/`. A cadeia começa em `20240101000000_baseline_core_schema.sql` (schema base) e inclui o catálogo PPSI 2.0.

Em um **projeto Supabase novo e vazio**:
```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Detalhes, Auth e primeiro programa: [IMPLANTACAO.md](./IMPLANTACAO.md).  
Comparação de schema: [SCHEMA_COMPARISON.md](./SCHEMA_COMPARISON.md).

**Auth e papéis:** A identidade do usuário vem do Supabase Auth; papéis e permissões por programa vêm das tabelas `programa_users` e `profiles`. Ver seção "Autenticação e autorização" no [README do projeto](../../../README.md).

### **Login com Google (OAuth)**

Guia completo (produção + local, URLs e erros comuns): **[LOGIN_SOCIAL_GOOGLE.md](./LOGIN_SOCIAL_GOOGLE.md)**

Resumo:

1. **Supabase** → Authentication → Providers → ative **Google** (obrigatório — hoje desligado no remoto retorna `provider is not enabled`).
2. **Google Cloud** → OAuth 2.0 → redirect URI: `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`
3. **Supabase** → URL Configuration → Redirect URLs: `https://www.fpsi.com.br/auth/callback`, `http://localhost:3000/auth/callback`
4. **Site URL:** `https://www.fpsi.com.br` (apex `fpsi.com.br` redireciona para www)

### **Portas Alternativas**
Se a porta 3000 estiver ocupada, use a 3001:
```bash
npm run dev:3001
# Acesso: http://localhost:3001
```
Ou passe a porta na hora: `npm run dev -- --port 3002` (acesso: http://localhost:3002).

## 🧪 **Como Testar as Alterações Recentes**

### **1. Índices de Maturidade Decimais**
- Acesse qualquer programa em http://localhost:3000/programas
- Veja os chips de maturidade mostrando `0.85` ao invés de `85%`

### **2. Chips Compactos na Árvore**
- Vá para http://localhost:3000/programas/1/diagnostico
- No menu árvore lateral, os chips só mostram o score (ex: `0.75`)

### **3. Medidas Sem Accordion**
- Selecione uma medida específica na árvore
- A medida aparece diretamente, sem accordion para expandir

### **4. Controles Sem Auto-load**
- Controles não carregam medidas automaticamente
- Medidas só aparecem quando selecionadas

## 🐛 **Troubleshooting**

### **Problema: "Cadastro por e-mail requer SUPABASE_SERVICE_ROLE_KEY"**
A opção **Cadastrar (enviar e-mail para definir senha)** usa a API Admin do Supabase e exige `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`.

1. Abra o **Supabase Dashboard** → seu projeto → **Project Settings** → **API**
2. Em **Project API keys**, copie a chave **service_role** (secret, não a anon)
3. Adicione no `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...sua_chave_aqui
   ```
4. Reinicie o servidor (`npm run dev`)

⚠️ **Nunca** exponha a `service_role` no frontend ou em repositórios públicos.

### **Problema: Porta Ocupada**
```bash
# Matar processo na porta 3000
npx kill-port 3000
npm run dev
```

### **Problema: Dependências Desatualizadas**
```bash
npm install
npm run dev
```

### **Problema: Cache de Build**
```bash
rm -rf .next
npm run dev
```

### **Problema: TypeScript Errors**
```bash
npm run type-check
# Ver erros específicos e corrigir
```

### **Problema: Travando em "refine dev"**
O comando `refine dev` do Refine CLI pode travar porque:
1. **Update notifier** tenta checar atualizações na rede e pode demorar ou travar.
2. **Refine Devtools** sobe um servidor extra (porta 5001) antes do Next.
3. **Saída em pipe** em alguns terminais/IDEs pode bloquear.

**Solução:** O script `npm run dev` já usa **Next.js direto** (`next dev`), então deve subir sem travar. Use sempre:
```bash
npm run dev
```
Se precisar do Refine Devtools (servidor na porta 5001), use:
```bash
npm run dev:refine
```
Com variáveis que reduzem travamento: `REFINE_NO_TELEMETRY=true` e `UPDATE_NOTIFIER_IS_DISABLED=true`. Para desativar só o devtools: `npm run dev:refine -- --devtools false`.

### **Problema: Terminal fica em branco (não sai de "next dev")**
O `npm run dev` roda mas não aparece "Ready" nem compilação. Causa comum: cache `.next` corrompido.

**Soluções (testar na ordem):**
1. **Limpar cache e subir de novo:**  
   `npm run dev:fresh`  
   (apaga a pasta `.next` e roda `npm run dev`).
2. Se continuar em branco: feche o terminal, apague a pasta `.next` manualmente (`rm -rf .next`), abra outro terminal e rode `npm run dev`.

### **Corrupção no Next.js (quando nada mais funcionar)**
Se o dev trava em "Starting...", dá erros estranhos ou o terminal fica em branco, pode ser cache ou dependências corrompidas. Seguir **na ordem**:

| Passo | Ação | Comando / O que fazer |
|-------|------|------------------------|
| **1** | Apagar cache do Next | `npm run dev:fresh` ou `npm run clean:next` e depois `npm run dev`. Dar tempo para o `.next` ser recriado. |
| **2** | Reinstalar dependências | `npm run clean:reinstall` (apaga `node_modules` e roda `npm install`). Depois `npm run dev`. |
| **3** | Limpar cache do npm | `npm run clean:cache`. Depois tentar `npm run dev` de novo. |
| **4** | Não sincronizar cache na nuvem | iCloud/OneDrive/Dropbox não devem sincronizar `.next`, `node_modules` nem `dist`. O `.gitignore` já ignora `.next` e `node_modules`. |
| **5** | Atualizar Node.js | Instalar a versão LTS mais recente em [nodejs.org](https://nodejs.org). O projeto pede Node ≥20 e &lt;23. |
| **6** | Testar Next canary | Se nada resolver: `npm install next@canary` e depois `npm run dev` (versão diária com correções ainda não no estável). |

Sempre **fechar o terminal** (Ctrl+C) antes de apagar `.next` ou `node_modules`, e abrir um terminal novo para rodar os comandos.

## 📱 **Testes em Diferentes Dispositivos**

### **Desktop**
- Chrome: http://localhost:3000
- Firefox: http://localhost:3000
- Safari: http://localhost:3000

### **Mobile (mesmo Wi-Fi)**
- Descubra seu IP local: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Acesse: http://[SEU_IP]:3000
- Exemplo: http://192.168.1.100:3000

## ⚡ **Dicas de Performance**

### **Hot Reload Rápido**
- Mantenha apenas arquivos necessários abertos
- Use `npm run dev` ao invés de `npm start`

### **Debug no Browser**
- **DevTools**: F12
- **React DevTools**: Extensão recomendada
- **Console**: Ver logs de debug

## 📊 **Monitoramento Local**

### **Ver Logs Detalhados**
```bash
npm run dev -- --turbo  # Modo turbo para desenvolvimento
```

### **Análise de Bundle**
```bash
npm run build
npm run analyze  # Se disponível
```

## 🔄 **Workflow de Desenvolvimento**

1. **Inicie o servidor**: `npm run dev`
2. **Abra o browser**: http://localhost:3000
3. **Faça alterações**: Arquivos salvam automaticamente
4. **Teste mudanças**: Browser atualiza automaticamente
5. **Build final**: `npm run build` antes do deploy

## 📝 **Notas Importantes**

- ✅ **Hot Reload** funciona para React components
- ✅ **CSS/SCSS** atualiza automaticamente  
- ✅ **API routes** reiniciam automaticamente
- ⚠️ **Variáveis de ambiente** precisam de restart
- ⚠️ **next.config.js** mudanças precisam de restart

## 🎯 **Status Atual**

- ✅ Build funcionando (Exit Code 0)
- ✅ Todas as alterações implementadas
- ✅ Pronto para desenvolvimento local
- ✅ Pronto para deploy em produção

**O projeto está 100% funcional para desenvolvimento local!** 🚀