# Comparação Schema: Documentação vs Supabase

O **Supabase é a fonte de verdade** para o schema do sistema que já estava em produção. Use este documento para unificar a documentação local com o que está implementado no Supabase.

## 1. Tabelas documentadas no repositório

Com base em `database/*.sql`, docs e uso no código:

| Tabela | Origem | Uso no código |
|--------|--------|---------------|
| `programa` | Core (Supabase) | dataService, ProgramSummaryContent |
| `diagnostico` | Core | dataService, relatório |
| `controle` | Core | dataService, relatório |
| `medida` | Core | dataService, relatório |
| `programa_controle` | Core | optimizedDataService |
| `programa_medida` | Core | dataService, optimizedDataService |
| `responsavel` | Core | dataService, responsabilidades |
| `orgao` | Core | dataService |
| `programa_users` | database/user_management_tables.sql | API users, invites |
| `programa_invites` | database/user_management_tables.sql | API invites |
| `user_activities` | database/user_management_tables.sql | (opcional) |
| `cargo` | database/cargo_departamento.sql | API cargos, perfil |
| `departamento` | database/cargo_departamento.sql | API departamentos, perfil |
| `profiles` | database/profiles.sql | API profiles |

## 2. Migrações Supabase CLI

As migrações em `supabase/migrations/` aplicam as alterações novas:

- `20240218000001_cargo_departamento.sql` — cargo, departamento
- `20240218000002_profiles.sql` — profiles (depende de cargo/departamento)
- `20240218000003_user_management.sql` — programa_users, programa_invites, user_activities (depende de programa)

**Aplicar via CLI:**
```bash
supabase db push
```

Ou em projeto local:
```bash
supabase db reset
```

## 3. Como comparar com o Supabase

### 3.1 Dump do schema atual do Supabase

Com o projeto linkado:

```bash
supabase link
supabase db dump --schema public -f supabase_schema.sql
```

Ou via conexão direta (se tiver a connection string):

```bash
pg_dump -h db.xxx.supabase.co -U postgres -d postgres --schema-only -f supabase_schema.sql
```

### 3.2 Comparar

- Abra `supabase_schema.sql`
- Compare com o que está em `database/*.sql` e `supabase/migrations/`
- Se houver diferenças, **priorize o schema do Supabase** para o sistema já em produção
- Atualize `database/*.sql` e/ou docs para refletir o que está no Supabase

### 3.3 Diferenças comuns

- Colunas novas no Supabase que não estão nos scripts locais
- Constraints ou índices diferentes
- Tabelas criadas manualmente no Supabase que não têm migração

## 4. Documentação de schema

Arquivos que descrevem schema/tabelas:

- `docs/guides/ADMIN_GUIDE.md` — programa_users, programa_invites (estrutura simplificada)
- `database/cargo_departamento.sql`
- `database/profiles.sql`
- `database/user_management_tables.sql`
- `database/QUICK_SETUP.sql` — setup rápido (schema mais simples)
- `database/CREATE_USER_TABLES.sql` — variante de user tables

## 5. Checklist de unificação

- [ ] Dump do schema do Supabase gerado
- [ ] Schema dump comparado com `database/` e `supabase/migrations/`
- [ ] `database/*.sql` ajustados para coincidir com o Supabase (quando Supabase é a verdade)
- [ ] `docs/guides/ADMIN_GUIDE.md` atualizado com estrutura correta
- [ ] Migrações novas aplicadas sem conflitos
