-- AIGP Fase A: papéis de governança de IA, flags de pauta em comitês PPSI, comitê dedicado de IA.

ALTER TABLE public.programa
  ADD COLUMN IF NOT EXISTS responsavel_governanca_ia integer,
  ADD COLUMN IF NOT EXISTS substituto_governanca_ia integer,
  ADD COLUMN IF NOT EXISTS comite_si_ia_na_pauta boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS comite_priva_ia_na_pauta boolean NOT NULL DEFAULT false;

ALTER TABLE public.programa DROP CONSTRAINT IF EXISTS programa_responsavel_governanca_ia_fkey;
ALTER TABLE public.programa
  ADD CONSTRAINT programa_responsavel_governanca_ia_fkey
  FOREIGN KEY (responsavel_governanca_ia) REFERENCES public.responsavel (id) ON DELETE SET NULL;

ALTER TABLE public.programa DROP CONSTRAINT IF EXISTS programa_substituto_governanca_ia_fkey;
ALTER TABLE public.programa
  ADD CONSTRAINT programa_substituto_governanca_ia_fkey
  FOREIGN KEY (substituto_governanca_ia) REFERENCES public.responsavel (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.programa.responsavel_governanca_ia IS 'Responsável por governança de IA (AIGP medida 26.1)';
COMMENT ON COLUMN public.programa.substituto_governanca_ia IS 'Substituto do responsável por governança de IA';
COMMENT ON COLUMN public.programa.comite_si_ia_na_pauta IS 'Tema de IA formalmente na pauta do comitê de SI (alternativa ao comitê dedicado — AIGP 26.2)';
COMMENT ON COLUMN public.programa.comite_priva_ia_na_pauta IS 'Tema de IA formalmente na pauta do comitê de privacidade (AIGP 26.2)';

-- Estender tipos de grupo de governança
ALTER TABLE public.programa_grupo_governanca DROP CONSTRAINT IF EXISTS programa_grupo_governanca_tipo_check;

ALTER TABLE public.programa_grupo_governanca
  ADD CONSTRAINT programa_grupo_governanca_tipo_check
  CHECK (
    tipo IN (
      'comite_seguranca_informacao',
      'comite_protecao_dados',
      'etir',
      'comite_governanca_ia'
    )
  );

-- Fase B: inventário de sistemas de IA
CREATE TABLE IF NOT EXISTS public.sistema_ia (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  finalidade text NOT NULL DEFAULT '',
  dono_negocio text NOT NULL DEFAULT '',
  responsavel_tecnico_id integer REFERENCES public.responsavel (id) ON DELETE SET NULL,
  tipo text NOT NULL DEFAULT 'saas' CHECK (tipo IN ('proprio', 'saas', 'api_terceiro', 'embedded')),
  nivel_risco text NOT NULL DEFAULT 'moderado' CHECK (nivel_risco IN ('baixo', 'moderado', 'alto')),
  status_ciclo text NOT NULL DEFAULT 'rascunho' CHECK (
    status_ciclo IN ('rascunho', 'aprovacao', 'producao', 'descontinuado')
  ),
  decisao_automatizada boolean NOT NULL DEFAULT false,
  ia_embutida boolean NOT NULL DEFAULT false,
  data_entrada_producao date,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sistema_ia_programa ON public.sistema_ia (programa_id);

ALTER TABLE public.sistema_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sistema_ia_select_member" ON public.sistema_ia;
CREATE POLICY "sistema_ia_select_member" ON public.sistema_ia FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = sistema_ia.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "sistema_ia_insert_member" ON public.sistema_ia;
CREATE POLICY "sistema_ia_insert_member" ON public.sistema_ia FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = sistema_ia.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "sistema_ia_update_member" ON public.sistema_ia;
CREATE POLICY "sistema_ia_update_member" ON public.sistema_ia FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = sistema_ia.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "sistema_ia_delete_member" ON public.sistema_ia;
CREATE POLICY "sistema_ia_delete_member" ON public.sistema_ia FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = sistema_ia.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

COMMENT ON TABLE public.sistema_ia IS 'Inventário de sistemas e usos de IA por programa (AIGP controle 27)';
