-- ============================================
-- EXECUTE ESTE SCRIPT NO SEU SUPABASE
-- ============================================

-- 1. Criar tabela de usuários do programa
CREATE TABLE programa_users (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES programa(id),
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analista',
    permissions JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(programa_id, user_id)
);

-- 2. Criar tabela de convites
CREATE TABLE programa_invites (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES programa(id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT
);

-- 3. IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo seu email real
-- Este comando criará você como admin do programa ID 1
INSERT INTO programa_users (programa_id, user_id, role, permissions) 
VALUES (
    1,
    'jimxxx@gmail.com', -- MUDE AQUI!
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
    }'
);

-- 4. Verificar se funcionou
SELECT * FROM programa_users;