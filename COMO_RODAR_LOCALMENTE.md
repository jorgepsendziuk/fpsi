# 🚀 Como Rodar o Projeto FPSI Localmente

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
Verifique se o arquivo `.env.local` existe com:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### **Portas Alternativas**
Se a porta 3000 estiver ocupada:
```bash
npm run dev -- --port 3001
# Acesso: http://localhost:3001
```

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