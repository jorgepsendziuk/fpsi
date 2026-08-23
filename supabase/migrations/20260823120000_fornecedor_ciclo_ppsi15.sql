-- Ciclo de vida do fornecedor (PPSI Controle 15 / ISO 27002 5.19–5.23).

ALTER TABLE public.programa_fornecedor
  ADD COLUMN IF NOT EXISTS criticidade text NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS data_ultima_avaliacao date,
  ADD COLUMN IF NOT EXISTS data_proxima_revisao date,
  ADD COLUMN IF NOT EXISTS possui_clausulas_lgpd boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS encerrado_em date,
  ADD COLUMN IF NOT EXISTS due_diligence jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'programa_fornecedor_criticidade_chk'
  ) THEN
    ALTER TABLE public.programa_fornecedor
      ADD CONSTRAINT programa_fornecedor_criticidade_chk
      CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica'));
  END IF;
END $$;

COMMENT ON COLUMN public.programa_fornecedor.criticidade IS
  'Impacto potencial (PPSI 15 / ISO 5.19 classificação).';
COMMENT ON COLUMN public.programa_fornecedor.data_proxima_revisao IS
  'Revisão periódica — no máximo anual.';
COMMENT ON COLUMN public.programa_fornecedor.possui_clausulas_lgpd IS
  'Contrato com cláusulas LGPD/SI (art. 39 / medida 15.4).';
COMMENT ON COLUMN public.programa_fornecedor.due_diligence IS
  'IDs do checklist de due diligence concluídos.';
