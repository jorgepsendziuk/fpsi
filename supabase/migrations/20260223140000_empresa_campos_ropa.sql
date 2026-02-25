-- ============================================
-- FPSI - Campos da empresa para ROPA (informações de contato)
-- Organização já é nome_fantasia/razao_social; CNPJ já existe.
-- Adiciona: endereço, atividade principal, gestor responsável, e-mail, telefone.
-- ============================================

ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS atividade_principal text;
ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS gestor_responsavel varchar(255);
ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS email varchar(255);
ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS telefone varchar(50);

COMMENT ON COLUMN public.empresa.endereco IS 'Endereço da empresa/orgão (para ROPA e documentos)';
COMMENT ON COLUMN public.empresa.atividade_principal IS 'Principal atividade (para ROPA - Modelo ANPD)';
COMMENT ON COLUMN public.empresa.gestor_responsavel IS 'Gestor responsável (para ROPA)';
COMMENT ON COLUMN public.empresa.email IS 'E-mail de contato (para ROPA)';
COMMENT ON COLUMN public.empresa.telefone IS 'Telefone de contato (para ROPA)';
