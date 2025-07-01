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
    CONSTRAINT programa_invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    CONSTRAINT programa_invites_unique_pending UNIQUE (programa_id, email, status) DEFERRABLE INITIALLY DEFERRED
);

-- 3. Tabela para log de atividades dos usuários (opcional, mas recomendada)
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    programa_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_activities_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT user_activities_action_check CHECK (action IN ('create', 'update', 'delete', 'view', 'approve', 'reject', 'invite', 'login', 'logout'))
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para programa_users
CREATE INDEX IF NOT EXISTS idx_programa_users_programa_id ON programa_users(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_users_user_id ON programa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_programa_users_role ON programa_users(role);
CREATE INDEX IF NOT EXISTS idx_programa_users_status ON programa_users(status);

-- Índices para programa_invites
CREATE INDEX IF NOT EXISTS idx_programa_invites_programa_id ON programa_invites(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_invites_email ON programa_invites(email);
CREATE INDEX IF NOT EXISTS idx_programa_invites_token ON programa_invites(token);
CREATE INDEX IF NOT EXISTS idx_programa_invites_status ON programa_invites(status);
CREATE INDEX IF NOT EXISTS idx_programa_invites_expires_at ON programa_invites(expires_at);

-- Índices para user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_programa_id ON user_activities(programa_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_programa_users_updated_at 
    BEFORE UPDATE ON programa_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programa_invites_updated_at 
    BEFORE UPDATE ON programa_invites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir um usuário admin inicial para o primeiro programa (descomente se necessário)
-- IMPORTANTE: Substitua 'seu-email@empresa.com' pelo seu email real
/*
INSERT INTO programa_users (programa_id, user_id, role, permissions, status, created_at, accepted_at)
VALUES (
    1, -- ID do primeiro programa (ajuste conforme necessário)
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
*/

-- ============================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- ============================================

-- Query para verificar se as tabelas foram criadas corretamente
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('programa_users', 'programa_invites', 'user_activities')
ORDER BY table_name;

-- Query para verificar as colunas da tabela programa_users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'programa_users'
ORDER BY ordinal_position;