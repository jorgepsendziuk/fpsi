-- ============================================
-- FPSI - Sistema de Gerenciamento de Usuários
-- Depende de: programa (já existe no Supabase)
-- ============================================

CREATE TABLE IF NOT EXISTS programa_users (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analista',
    permissions JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'accepted',
    invited_by VARCHAR(255),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT programa_users_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT programa_users_unique_user_programa UNIQUE (programa_id, user_id),
    CONSTRAINT programa_users_role_check CHECK (role IN ('admin', 'coordenador', 'analista', 'consultor', 'auditor')),
    CONSTRAINT programa_users_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

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
    CONSTRAINT programa_invites_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT programa_invites_role_check CHECK (role IN ('admin', 'coordenador', 'analista', 'consultor', 'auditor')),
    CONSTRAINT programa_invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    CONSTRAINT programa_invites_unique_pending UNIQUE (programa_id, email, status) DEFERRABLE INITIALLY DEFERRED
);

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
    CONSTRAINT user_activities_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT user_activities_action_check CHECK (action IN ('create', 'update', 'delete', 'view', 'approve', 'reject', 'invite', 'login', 'logout'))
);

CREATE INDEX IF NOT EXISTS idx_programa_users_programa_id ON programa_users(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_users_user_id ON programa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_programa_users_role ON programa_users(role);
CREATE INDEX IF NOT EXISTS idx_programa_users_status ON programa_users(status);

CREATE INDEX IF NOT EXISTS idx_programa_invites_programa_id ON programa_invites(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_invites_email ON programa_invites(email);
CREATE INDEX IF NOT EXISTS idx_programa_invites_token ON programa_invites(token);
CREATE INDEX IF NOT EXISTS idx_programa_invites_status ON programa_invites(status);
CREATE INDEX IF NOT EXISTS idx_programa_invites_expires_at ON programa_invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_programa_id ON user_activities(programa_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_programa_users_updated_at ON programa_users;
CREATE TRIGGER update_programa_users_updated_at
    BEFORE UPDATE ON programa_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_programa_invites_updated_at ON programa_invites;
CREATE TRIGGER update_programa_invites_updated_at
    BEFORE UPDATE ON programa_invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
