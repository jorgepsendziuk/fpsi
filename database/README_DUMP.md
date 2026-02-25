# Dump do banco Supabase

## Via Supabase CLI (recomendado)

1. **Docker Desktop** precisa estar **rodando** (o CLI usa uma imagem para executar `pg_dump`).
2. Projeto deve estar **linkado**: `supabase link` (se ainda não fez).
3. Rodar o dump:

```bash
# Dump completo (schema + data) no projeto linkado
supabase db dump -f database/supabase_dump_$(date +%Y%m%d_%H%M).sql
```

Ou use o script:

```bash
./database/dump.sh
```

### Opções úteis

- **Só schema (sem dados):**  
  `supabase db dump -f database/schema_only.sql -s public`
- **Só dados:**  
  `supabase db dump --data-only -f database/data_only.sql`
- **Banco local (Supabase local rodando):**  
  `supabase db dump --local -f database/local_dump.sql`
- **Usar connection string (ex.: direto do Dashboard):**  
  `supabase db dump --db-url "postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres" -f database/dump.sql`  
  (A URL deve ser percent-encoded; no Dashboard: Project Settings → Database → Connection string, “URI”.)

## Sem Docker (pg_dump direto)

Se tiver `pg_dump` instalado (ex.: `brew install libpq`) e a **connection string direta** do projeto (Session mode, porta 5432):

```bash
pg_dump "$DATABASE_URL" -f database/manual_dump.sql
```

A connection string direta está em: Supabase Dashboard → Project Settings → Database → Connection string → **Direct connection** (porta 5432).
