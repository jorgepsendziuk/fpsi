-- Adiciona flag is_system_admin em profiles para controle de acesso à área admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_profiles_is_system_admin ON profiles(is_system_admin) WHERE is_system_admin = true;
COMMENT ON COLUMN profiles.is_system_admin IS 'Se true, usuário tem acesso à área de administração do sistema (/admin)';
