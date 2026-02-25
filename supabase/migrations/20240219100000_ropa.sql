-- ============================================
-- FPSI - ROPA (Registro das Operações de Tratamento)
-- Art. 37 LGPD - por programa
-- Depende de: programa (já existe no Supabase)
-- ============================================

CREATE TABLE IF NOT EXISTS ropa (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    nome VARCHAR(500) NOT NULL,
    finalidade TEXT,
    base_legal VARCHAR(100),
    categorias_dados TEXT,
    categorias_titulares TEXT,
    compartilhamento TEXT,
    retencao TEXT,
    medidas_seguranca TEXT,
    responsavel VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT ropa_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ropa_programa_id ON ropa(programa_id);

COMMENT ON TABLE ropa IS 'Registro das Operações de Tratamento (ROPA) - Art. 37 LGPD';
COMMENT ON COLUMN ropa.nome IS 'Nome da operação de tratamento';
COMMENT ON COLUMN ropa.finalidade IS 'Finalidade do tratamento';
COMMENT ON COLUMN ropa.base_legal IS 'Base legal (consentimento, contrato, obrigação legal, etc.)';
COMMENT ON COLUMN ropa.categorias_dados IS 'Categorias de dados pessoais tratados';
COMMENT ON COLUMN ropa.categorias_titulares IS 'Categorias de titulares';
COMMENT ON COLUMN ropa.compartilhamento IS 'Compartilhamento (com quem e para que)';
COMMENT ON COLUMN ropa.retencao IS 'Prazo/critério de retenção';
COMMENT ON COLUMN ropa.medidas_seguranca IS 'Medidas de segurança e técnicas';

-- Trigger para updated_at (usa função de 20240218000003_user_management.sql)
DROP TRIGGER IF EXISTS update_ropa_updated_at ON ropa;
CREATE TRIGGER update_ropa_updated_at
    BEFORE UPDATE ON ropa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
