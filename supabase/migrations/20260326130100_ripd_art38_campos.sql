-- RIPD — campos adicionais art. 38 LGPD (inciso IV e governança)

ALTER TABLE ripd
  ADD COLUMN IF NOT EXISTS riscos_tratamento TEXT,
  ADD COLUMN IF NOT EXISTS nivel_risco VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tipos_risco JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS categorias_dados_chaves JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS base_legal_predominante VARCHAR(80),
  ADD COLUMN IF NOT EXISTS parecer_dpo TEXT,
  ADD COLUMN IF NOT EXISTS parecer_dpo_status VARCHAR(30),
  ADD COLUMN IF NOT EXISTS decisao_controlador VARCHAR(40);

ALTER TABLE ripd DROP CONSTRAINT IF EXISTS ripd_nivel_risco_check;
ALTER TABLE ripd ADD CONSTRAINT ripd_nivel_risco_check CHECK (
  nivel_risco IS NULL OR nivel_risco IN ('baixo', 'medio', 'alto', 'muito_alto')
);

ALTER TABLE ripd DROP CONSTRAINT IF EXISTS ripd_parecer_dpo_status_check;
ALTER TABLE ripd ADD CONSTRAINT ripd_parecer_dpo_status_check CHECK (
  parecer_dpo_status IS NULL OR parecer_dpo_status IN ('conforme', 'ressalvas', 'divergente')
);

ALTER TABLE ripd DROP CONSTRAINT IF EXISTS ripd_decisao_controlador_check;
ALTER TABLE ripd ADD CONSTRAINT ripd_decisao_controlador_check CHECK (
  decisao_controlador IS NULL OR decisao_controlador IN ('aceita', 'aceita_com_plano', 'requer_revisao')
);

COMMENT ON COLUMN ripd.riscos_tratamento IS 'Art. 38, IV — riscos decorrentes do tratamento';
COMMENT ON COLUMN ripd.nivel_risco IS 'Nível de risco percebido (apoio à análise)';
COMMENT ON COLUMN ripd.tipos_risco IS 'Chaves de tipos de risco (vazamento, discriminação, etc.)';
COMMENT ON COLUMN ripd.categorias_dados_chaves IS 'Categorias de dados (checklist) para inciso I';
COMMENT ON COLUMN ripd.base_legal_predominante IS 'Base legal predominante (apoio)';
COMMENT ON COLUMN ripd.parecer_dpo IS 'Texto do parecer do encarregado';
COMMENT ON COLUMN ripd.parecer_dpo_status IS 'conforme | ressalvas | divergente';
COMMENT ON COLUMN ripd.decisao_controlador IS 'Decisão documentada do controlador';
