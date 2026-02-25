-- ============================================
-- FPSI - Tabela Profiles
-- Execute APÓS cargo_departamento.sql
-- Execute no Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(50),
  cargo_id INTEGER REFERENCES cargo(id),
  departamento_id INTEGER REFERENCES departamento(id),
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: usuário vê/edita apenas o próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
