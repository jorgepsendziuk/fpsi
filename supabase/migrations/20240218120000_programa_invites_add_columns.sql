-- Adiciona colunas que podem faltar em programa_invites (tabela criada por QUICK_SETUP ou versão antiga)
ALTER TABLE programa_invites ADD COLUMN IF NOT EXISTS invited_by VARCHAR(255);
ALTER TABLE programa_invites ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE programa_invites ADD COLUMN IF NOT EXISTS declined_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE programa_invites ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE programa_invites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
