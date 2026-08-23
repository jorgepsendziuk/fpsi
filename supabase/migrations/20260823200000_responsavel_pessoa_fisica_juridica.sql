-- Encarregado (DPO) pode ser pessoa natural ou jurídica (Res. CD/ANPD nº 18/2024, art. 12).
-- Pessoa jurídica: divulgar nome empresarial + pessoa natural responsável perante ANPD e titulares.

ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS tipo_pessoa text NOT NULL DEFAULT 'pessoa_natural';

ALTER TABLE public.responsavel
  DROP CONSTRAINT IF EXISTS responsavel_tipo_pessoa_check;

ALTER TABLE public.responsavel
  ADD CONSTRAINT responsavel_tipo_pessoa_check
  CHECK (tipo_pessoa IN ('pessoa_natural', 'pessoa_juridica'));

ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS empresa_id integer REFERENCES public.empresa (id) ON DELETE SET NULL;

ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS cnpj text;

ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS razao_social text;

ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS pessoa_natural_responsavel_nome text;

ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS pessoa_natural_responsavel_email text;

COMMENT ON COLUMN public.responsavel.tipo_pessoa IS
  'pessoa_natural (Anexo I) ou pessoa_juridica (Anexo II / DPO as a Service)';
COMMENT ON COLUMN public.responsavel.empresa_id IS
  'Empresa do cadastro do usuário usada para atuar como encarregado pessoa jurídica';
COMMENT ON COLUMN public.responsavel.cnpj IS
  'CNPJ do encarregado pessoa jurídica (divulgação pública)';
COMMENT ON COLUMN public.responsavel.razao_social IS
  'Nome empresarial ou título do estabelecimento do encarregado PJ';
COMMENT ON COLUMN public.responsavel.pessoa_natural_responsavel_nome IS
  'Pessoa natural que representa a PJ junto à ANPD e aos titulares (art. 12)';
COMMENT ON COLUMN public.responsavel.pessoa_natural_responsavel_email IS
  'E-mail da pessoa natural responsável quando o encarregado é PJ';

CREATE INDEX IF NOT EXISTS idx_responsavel_empresa_id
  ON public.responsavel (empresa_id)
  WHERE empresa_id IS NOT NULL;
