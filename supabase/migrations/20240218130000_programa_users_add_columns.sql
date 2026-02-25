-- Adiciona colunas que podem faltar em programa_users (tabela criada por QUICK_SETUP ou versão antiga)
ALTER TABLE programa_users ADD COLUMN IF NOT EXISTS invited_by VARCHAR(255);
ALTER TABLE programa_users ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE programa_users ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
