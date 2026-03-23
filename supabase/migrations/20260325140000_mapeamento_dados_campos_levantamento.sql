-- Campos de levantamento para primeira linha (escolhas + texto opcional). Depende de 20260325120000_mapeamento_dados_ropa.sql
ALTER TABLE public.mapeamento_dados
  ADD COLUMN IF NOT EXISTS setor_area VARCHAR(64),
  ADD COLUMN IF NOT EXISTS setor_outro TEXT,
  ADD COLUMN IF NOT EXISTS finalidade_categoria VARCHAR(64),
  ADD COLUMN IF NOT EXISTS finalidade_detalhe TEXT,
  ADD COLUMN IF NOT EXISTS meios_armazenamento JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS meios_outro TEXT,
  ADD COLUMN IF NOT EXISTS tipos_dados JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tipos_outro TEXT,
  ADD COLUMN IF NOT EXISTS fluxo_compartilhamento VARCHAR(64),
  ADD COLUMN IF NOT EXISTS compartilhamento_detalhe TEXT,
  ADD COLUMN IF NOT EXISTS categoria_titular VARCHAR(64),
  ADD COLUMN IF NOT EXISTS titular_outro TEXT,
  ADD COLUMN IF NOT EXISTS transferencia_internacional VARCHAR(16);

COMMENT ON COLUMN public.mapeamento_dados.setor_area IS 'Chave do setor (lista fixa na aplicação)';
COMMENT ON COLUMN public.mapeamento_dados.finalidade_categoria IS 'Finalidade em linguagem de negócio (lista fixa)';
COMMENT ON COLUMN public.mapeamento_dados.meios_armazenamento IS 'Onde os dados aparecem: array de chaves';
COMMENT ON COLUMN public.mapeamento_dados.tipos_dados IS 'Categorias simples de dados: array de chaves';
COMMENT ON COLUMN public.mapeamento_dados.fluxo_compartilhamento IS 'Quem mais recebe/usa os dados';
COMMENT ON COLUMN public.mapeamento_dados.transferencia_internacional IS 'sim | nao | nao_sei';
