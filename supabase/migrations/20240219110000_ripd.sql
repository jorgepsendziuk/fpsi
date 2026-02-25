-- ============================================
-- FPSI - RIPD (Relatório de Impacto à Proteção de Dados Pessoais)
-- Art. 38 LGPD - tratamentos de alto risco
-- Depende de: programa, ropa (opcional)
-- ============================================

CREATE TABLE IF NOT EXISTS ripd (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    ropa_id INTEGER,
    titulo VARCHAR(500) NOT NULL,
    descricao_dados TEXT,
    metodologia_coleta_seguranca TEXT,
    medidas_salvaguardas_mitigacao TEXT,
    conclusao TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'rascunho',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT ripd_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT ripd_ropa_fkey FOREIGN KEY (ropa_id) REFERENCES ropa(id) ON DELETE SET NULL,
    CONSTRAINT ripd_status_check CHECK (status IN ('rascunho', 'em_analise', 'aprovado'))
);

CREATE INDEX IF NOT EXISTS idx_ripd_programa_id ON ripd(programa_id);
CREATE INDEX IF NOT EXISTS idx_ripd_ropa_id ON ripd(ropa_id);
CREATE INDEX IF NOT EXISTS idx_ripd_status ON ripd(status);

COMMENT ON TABLE ripd IS 'RIPD - Relatório de Impacto à Proteção de Dados Pessoais (Art. 38 LGPD)';
COMMENT ON COLUMN ripd.ropa_id IS 'Operação de tratamento vinculada (ROPA) - opcional';
COMMENT ON COLUMN ripd.titulo IS 'Título do relatório';
COMMENT ON COLUMN ripd.descricao_dados IS 'Descrição dos tipos de dados coletados';
COMMENT ON COLUMN ripd.metodologia_coleta_seguranca IS 'Metodologia de coleta e segurança das informações';
COMMENT ON COLUMN ripd.medidas_salvaguardas_mitigacao IS 'Medidas, salvaguardas e mecanismos de mitigação de risco';
COMMENT ON COLUMN ripd.conclusao IS 'Análise/conclusão do controlador';
COMMENT ON COLUMN ripd.status IS 'rascunho | em_analise | aprovado';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_ripd_updated_at ON ripd;
CREATE TRIGGER update_ripd_updated_at
    BEFORE UPDATE ON ripd
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
