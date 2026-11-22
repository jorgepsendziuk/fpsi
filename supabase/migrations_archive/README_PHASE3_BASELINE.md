# Fase 3 — baseline schema-only (NÃO executar em produção sem ensaio)

**Status:** travada até validação em banco vazio / branch isolada.

## Objetivo

Separar o **schema** dos **INSERTs de catálogo** nas migrations antigas, para que:

- `supabase db push` em banco novo crie apenas a estrutura da Ferramenta.
- `npm run install:fpsi` (sem flags) carregue `publico`, `ppsi-2.0`, `governanca-ia` e `framework`, como hoje.
- Flags `-public`, `-ia`, `-framework`, `-ppsi` omitam pacotes na instalação nova **sem DELETE** em bases existentes.

## Produção existente

1. Gerar dump só de schema a partir do banco migrado.
2. Arquivar migrations com INSERT de catálogo em `supabase/migrations_archive/` (não apagar do histórico git).
3. `supabase migration repair` para marcar o baseline novo como já aplicado — **sem** reexecutar INSERTs em cima dos dados.
4. Validar que programas, `programa_medida`, evidências e políticas permanecem.

## Critérios de aceite (ensaio)

- Sem flags: login, programa, diagnóstico com eixos atuais, site em `/`.
- Com `-public`: `/` → `/login`; portal do titular `/[slug]` ativo.
- Com `-ia`: eixo 4 ausente apenas se o catálogo não foi importado; flags não apagam respostas antigas.

Não executar este corte sem checklist assinado e backup.