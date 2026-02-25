-- ============================================
-- FPSI - Modelo ANPD: Registro ROPA (ATPP)
-- Um registro por programa: informações de contato, categorias, medidas,
-- dados pessoais, compartilhamento, período, observações.
-- Operações (processo/finalidade/hipótese legal) permanecem na tabela ropa.
-- ============================================

-- Tabela principal do registro (1 por programa) - modelo ANPD
CREATE TABLE IF NOT EXISTS registro_ropa (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    -- 1. INFORMAÇÕES DE CONTATO
    organizacao VARCHAR(500),
    cnpj VARCHAR(20),
    endereco TEXT,
    atividade_principal TEXT,
    gestor_responsavel VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(50),
    data_registro DATE,
    -- 2. CATEGORIAS DE TITULARES (checkboxes: titulares em geral, crianças/adolescentes, idosos)
    categorias_titulares JSONB DEFAULT '[]'::jsonb,
    -- 3. MEDIDAS DE SEGURANÇA
    medidas_seguranca TEXT,
    -- 4. DADOS PESSOAIS (checkboxes: nome, endereço, RG, e-mail, CPF, telefone + outros)
    tipos_dados_pessoais JSONB DEFAULT '[]'::jsonb,
    outros_dados_pessoais TEXT,
    -- 5. COMPARTILHAMENTO
    compartilhamento TEXT,
    -- 6. PERÍODO DE ARMAZENAMENTO
    periodo_armazenamento TEXT,
    -- 8. OBSERVAÇÕES
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT registro_ropa_programa_fkey FOREIGN KEY (programa_id) REFERENCES programa(id) ON DELETE CASCADE,
    CONSTRAINT registro_ropa_programa_id_key UNIQUE (programa_id)
);

CREATE INDEX IF NOT EXISTS idx_registro_ropa_programa_id ON registro_ropa(programa_id);

COMMENT ON TABLE registro_ropa IS 'Cabeçalho do ROPA por programa - Modelo ANPD ATPP (informações de contato, categorias, medidas, dados pessoais, compartilhamento, período, observações)';
COMMENT ON COLUMN registro_ropa.organizacao IS 'Nome da empresa/organização';
COMMENT ON COLUMN registro_ropa.categorias_titulares IS 'Array: titulares_em_geral, criancas_adolescentes, idosos';
COMMENT ON COLUMN registro_ropa.tipos_dados_pessoais IS 'Array: nome, endereco, rg, email, cpf, telefone';
COMMENT ON COLUMN registro_ropa.outros_dados_pessoais IS 'Outros tipos de dados (apenas categorias, não valores)';

-- Vincular ropa ao registro (operação = processo + finalidade + hipótese legal)
ALTER TABLE ropa ADD COLUMN IF NOT EXISTS registro_ropa_id INTEGER REFERENCES registro_ropa(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_ropa_registro_ropa_id ON ropa(registro_ropa_id);

-- Popular registro_ropa para programas que já têm ropa (um registro por programa)
INSERT INTO registro_ropa (programa_id, medidas_seguranca, compartilhamento, periodo_armazenamento)
SELECT DISTINCT r.programa_id,
    (SELECT r2.medidas_seguranca FROM ropa r2 WHERE r2.programa_id = r.programa_id LIMIT 1),
    (SELECT r2.compartilhamento FROM ropa r2 WHERE r2.programa_id = r.programa_id LIMIT 1),
    (SELECT r2.retencao FROM ropa r2 WHERE r2.programa_id = r.programa_id LIMIT 1)
FROM ropa r
ON CONFLICT (programa_id) DO NOTHING;

-- Atualizar ropa com registro_ropa_id
UPDATE ropa r
SET registro_ropa_id = rr.id
FROM registro_ropa rr
WHERE rr.programa_id = r.programa_id AND r.registro_ropa_id IS NULL;

-- Trigger updated_at para registro_ropa
DROP TRIGGER IF EXISTS update_registro_ropa_updated_at ON registro_ropa;
CREATE TRIGGER update_registro_ropa_updated_at
    BEFORE UPDATE ON registro_ropa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
