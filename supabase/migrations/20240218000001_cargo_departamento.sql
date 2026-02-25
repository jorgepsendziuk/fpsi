-- ============================================
-- FPSI - Tabelas Cargo e Departamento
-- ============================================

CREATE TABLE IF NOT EXISTS cargo (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departamento (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cargo_nome ON cargo(nome);
CREATE INDEX IF NOT EXISTS idx_cargo_ativo ON cargo(ativo);
CREATE INDEX IF NOT EXISTS idx_departamento_nome ON departamento(nome);
CREATE INDEX IF NOT EXISTS idx_departamento_ativo ON departamento(ativo);
