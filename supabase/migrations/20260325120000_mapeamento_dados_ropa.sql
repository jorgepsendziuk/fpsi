-- Levantamento de mapeamento de dados (pré-ROPA); operações em `ropa` podem referenciar um item (opcional).
CREATE TABLE IF NOT EXISTS public.mapeamento_dados (
  id SERIAL PRIMARY KEY,
  programa_id INTEGER NOT NULL REFERENCES public.programa(id) ON DELETE CASCADE,
  nome VARCHAR(500) NOT NULL,
  descricao TEXT,
  sistemas_ou_fontes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mapeamento_dados_programa ON public.mapeamento_dados(programa_id);

COMMENT ON TABLE public.mapeamento_dados IS 'Levantamento de mapeamento de dados por programa; alimenta o preenchimento do ROPA';
COMMENT ON COLUMN public.mapeamento_dados.sistemas_ou_fontes IS 'Sistemas, bases ou fontes identificadas no levantamento';

DROP TRIGGER IF EXISTS update_mapeamento_dados_updated_at ON public.mapeamento_dados;
CREATE TRIGGER update_mapeamento_dados_updated_at
  BEFORE UPDATE ON public.mapeamento_dados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.mapeamento_dados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mapeamento_dados_select_member"
  ON public.mapeamento_dados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = mapeamento_dados.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

CREATE POLICY "mapeamento_dados_insert_member"
  ON public.mapeamento_dados FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = mapeamento_dados.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

CREATE POLICY "mapeamento_dados_update_member"
  ON public.mapeamento_dados FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = mapeamento_dados.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

CREATE POLICY "mapeamento_dados_delete_member"
  ON public.mapeamento_dados FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = mapeamento_dados.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapeamento_dados TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.mapeamento_dados_id_seq TO authenticated;
GRANT ALL ON public.mapeamento_dados TO service_role;

ALTER TABLE public.ropa
  ADD COLUMN IF NOT EXISTS mapeamento_id INTEGER REFERENCES public.mapeamento_dados(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ropa_mapeamento_id ON public.ropa(mapeamento_id);

COMMENT ON COLUMN public.ropa.mapeamento_id IS 'Opcional: vínculo ao levantamento de mapeamento de dados que fundamenta esta operação no ROPA';
