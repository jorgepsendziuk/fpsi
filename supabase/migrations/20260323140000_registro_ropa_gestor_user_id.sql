-- Gestor responsável do ROPA vinculado a usuário do programa (auth / profiles)
ALTER TABLE public.registro_ropa
  ADD COLUMN IF NOT EXISTS gestor_responsavel_user_id TEXT;

COMMENT ON COLUMN public.registro_ropa.gestor_responsavel_user_id IS 'UUID do usuário (profiles.user_id) membro aceito do programa; gestor_responsavel texto pode espelhar nome para PDF';
