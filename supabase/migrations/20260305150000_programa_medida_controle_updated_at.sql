-- Adiciona created_at e updated_at em programa_medida e programa_controle
-- para rastrear última atualização em diagnósticos, controles e medidas.

-- Garante que a função update_updated_at_column existe (criada em 20240218000003)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- programa_medida
ALTER TABLE public.programa_medida
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS programa_medida_updated_at ON public.programa_medida;
CREATE TRIGGER programa_medida_updated_at
  BEFORE UPDATE ON public.programa_medida
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON COLUMN public.programa_medida.updated_at IS 'Data/hora da última alteração da resposta/medida';

-- programa_controle
ALTER TABLE public.programa_controle
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS programa_controle_updated_at ON public.programa_controle;
CREATE TRIGGER programa_controle_updated_at
  BEFORE UPDATE ON public.programa_controle
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON COLUMN public.programa_controle.updated_at IS 'Data/hora da última alteração do nível INCC do controle';
