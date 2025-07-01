-- ============================================
-- FPSI - Sistema de Gerenciamento de Usuários
-- Script de criação das tabelas necessárias
-- ============================================

-- 1. Tabela para usuários do programa
CREATE TABLE IF NOT EXISTS programa_users (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    user_id VARCHAR(255) NOT NULL, -- Email ou ID do usuário do Supabase Auth
    role VARCHAR(50) NOT NULL DEFAULT 'analista',
    permissions JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'accepted',
    invited_by VARCHAR(255),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT programa_users_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT programa_users_unique_user_programa UNIQUE (programa_id, user_id),
    CONSTRAINT programa_users_role_check CHECK (role IN ('admin', 'coordenador', 'analista', 'consultor', 'auditor')),
    CONSTRAINT programa_users_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

-- 2. Tabela para convites pendentes
CREATE TABLE IF NOT EXISTS programa_invites (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analista',
    permissions JSONB NOT NULL DEFAULT '{}',
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    invited_by VARCHAR(255) NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT programa_invites_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT programa_invites_role_check CHECK (role IN ('admin', 'coordenador', 'analista', 'consultor', 'auditor')),
    CONSTRAINT programa_invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_programa_users_programa_id ON programa_users(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_users_user_id ON programa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_programa_invites_programa_id ON programa_invites(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_invites_token ON programa_invites(token);

-- 4. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_programa_users_updated_at 
    BEFORE UPDATE ON programa_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Inserir usuário admin inicial (SUBSTITUA o email!)
INSERT INTO programa_users (programa_id, user_id, role, permissions, status, created_at, accepted_at)
VALUES (
    1, -- ID do primeiro programa
    'seu-email@empresa.com', -- SUBSTITUA pelo seu email
    'admin',
    '{
        "can_view_diagnosticos": true,
        "can_edit_diagnosticos": true,
        "can_create_diagnosticos": true,
        "can_delete_diagnosticos": true,
        "can_view_medidas": true,
        "can_edit_medidas": true,
        "can_approve_medidas": true,
        "can_view_planos": true,
        "can_edit_planos": true,
        "can_approve_planos": true,
        "can_view_politicas": true,
        "can_edit_politicas": true,
        "can_publish_politicas": true,
        "can_view_relatorios": true,
        "can_export_relatorios": true,
        "can_share_relatorios": true,
        "can_view_users": true,
        "can_invite_users": true,
        "can_remove_users": true,
        "can_change_roles": true,
        "can_view_programa": true,
        "can_edit_programa": true,
        "can_delete_programa": true
    }',
    'accepted',
    NOW(),
    NOW()
) ON CONFLICT (programa_id, user_id) DO NOTHING;