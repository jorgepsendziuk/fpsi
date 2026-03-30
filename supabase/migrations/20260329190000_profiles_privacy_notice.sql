-- Aceite de aviso de privacidade da plataforma FPSI (versão auditável)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_notice_version_accepted TEXT,
  ADD COLUMN IF NOT EXISTS privacy_notice_accepted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.privacy_notice_version_accepted IS 'Identificador da versão do aviso de privacidade aceita pelo usuário (ex.: data ISO curta)';
COMMENT ON COLUMN public.profiles.privacy_notice_accepted_at IS 'Data/hora UTC em que o usuário aceitou o aviso da versão indicada';
