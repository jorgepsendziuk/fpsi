-- PPSI 2.0 — Papéis de governança: renomeia FKs no programa, representante da alta administração,
-- campos adicionais em responsável, comitês (SI, dados) e ETIR como grupos de membros.

-- ---------------------------------------------------------------------------
-- responsavel: dados cadastrais alinhados à designação institucional
-- ---------------------------------------------------------------------------
ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS cargo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS orgao_vinculo_id integer REFERENCES public.orgao (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS orgao_texto_livre text,
  ADD COLUMN IF NOT EXISTS data_designacao date;

COMMENT ON COLUMN public.responsavel.cargo IS 'Cargo ou função declarada na designação';
COMMENT ON COLUMN public.responsavel.orgao_vinculo_id IS 'Órgão do catálogo (ex.: mesmo do programa)';
COMMENT ON COLUMN public.responsavel.orgao_texto_livre IS 'Unidade/órgão em texto quando não usar o catálogo';
COMMENT ON COLUMN public.responsavel.data_designacao IS 'Data da designação ou posse registrada';

-- ---------------------------------------------------------------------------
-- programa: limpar vínculos antigos, renomear colunas para nomenclatura PPSI 2.0
-- ---------------------------------------------------------------------------
ALTER TABLE public.programa DROP CONSTRAINT IF EXISTS programa_responsavel_controle_interno_fkey;
ALTER TABLE public.programa DROP CONSTRAINT IF EXISTS programa_responsavel_si_fkey;
ALTER TABLE public.programa DROP CONSTRAINT IF EXISTS programa_responsavel_privacidade_fkey;
ALTER TABLE public.programa DROP CONSTRAINT IF EXISTS programa_responsavel_ti_fkey;

UPDATE public.programa SET
  responsavel_controle_interno = NULL,
  responsavel_si = NULL,
  responsavel_privacidade = NULL,
  responsavel_ti = NULL;

ALTER TABLE public.programa RENAME COLUMN responsavel_controle_interno TO responsavel_gestao_integridade;
ALTER TABLE public.programa RENAME COLUMN responsavel_si TO gestor_seguranca_informacao;
ALTER TABLE public.programa RENAME COLUMN responsavel_privacidade TO encarregado_dados_pessoais;
ALTER TABLE public.programa RENAME COLUMN responsavel_ti TO gestor_tic;

ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS representante_alta_administracao integer;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_representante_alta_administracao_fkey
  FOREIGN KEY (representante_alta_administracao) REFERENCES public.responsavel (id) ON DELETE SET NULL;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_responsavel_gestao_integridade_fkey
  FOREIGN KEY (responsavel_gestao_integridade) REFERENCES public.responsavel (id) ON DELETE SET NULL;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_gestor_seguranca_informacao_fkey
  FOREIGN KEY (gestor_seguranca_informacao) REFERENCES public.responsavel (id) ON DELETE SET NULL;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_encarregado_dados_pessoais_fkey
  FOREIGN KEY (encarregado_dados_pessoais) REFERENCES public.responsavel (id) ON DELETE SET NULL;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_gestor_tic_fkey
  FOREIGN KEY (gestor_tic) REFERENCES public.responsavel (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.programa.representante_alta_administracao IS 'Representante da alta administração no programa (PPSI 2.0 / cartilha de governança)';
COMMENT ON COLUMN public.programa.responsavel_gestao_integridade IS 'Responsável setorial pela gestão da integridade (antes: controle interno)';
COMMENT ON COLUMN public.programa.gestor_seguranca_informacao IS 'Gestor de segurança da informação';
COMMENT ON COLUMN public.programa.encarregado_dados_pessoais IS 'Encarregado (DPO) — dados pessoais';
COMMENT ON COLUMN public.programa.gestor_tic IS 'Gestor de TIC';

-- ---------------------------------------------------------------------------
-- Grupos: Comitê de SI, Comitê de proteção de dados, ETIR
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_grupo_governanca (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (
    tipo IN (
      'comite_seguranca_informacao',
      'comite_protecao_dados',
      'etir'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programa_id, tipo)
);

CREATE TABLE IF NOT EXISTS public.programa_grupo_governanca_membro (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grupo_id bigint NOT NULL REFERENCES public.programa_grupo_governanca (id) ON DELETE CASCADE,
  responsavel_id integer NOT NULL REFERENCES public.responsavel (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (grupo_id, responsavel_id)
);

CREATE INDEX IF NOT EXISTS idx_pgg_programa ON public.programa_grupo_governanca (programa_id);
CREATE INDEX IF NOT EXISTS idx_pggm_grupo ON public.programa_grupo_governanca_membro (grupo_id);

ALTER TABLE public.programa_grupo_governanca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_grupo_governanca_membro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pgg_select_member" ON public.programa_grupo_governanca;
CREATE POLICY "pgg_select_member" ON public.programa_grupo_governanca FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = programa_grupo_governanca.programa_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pgg_insert_member" ON public.programa_grupo_governanca;
CREATE POLICY "pgg_insert_member" ON public.programa_grupo_governanca FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = programa_grupo_governanca.programa_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pgg_update_member" ON public.programa_grupo_governanca;
CREATE POLICY "pgg_update_member" ON public.programa_grupo_governanca FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = programa_grupo_governanca.programa_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pgg_delete_member" ON public.programa_grupo_governanca;
CREATE POLICY "pgg_delete_member" ON public.programa_grupo_governanca FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = programa_grupo_governanca.programa_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pggm_select_member" ON public.programa_grupo_governanca_membro;
CREATE POLICY "pggm_select_member" ON public.programa_grupo_governanca_membro FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.programa_grupo_governanca g
      JOIN public.programa_users pu ON pu.programa_id = g.programa_id
      WHERE g.id = programa_grupo_governanca_membro.grupo_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pggm_insert_member" ON public.programa_grupo_governanca_membro;
CREATE POLICY "pggm_insert_member" ON public.programa_grupo_governanca_membro FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.programa_grupo_governanca g
      JOIN public.programa_users pu ON pu.programa_id = g.programa_id
      WHERE g.id = programa_grupo_governanca_membro.grupo_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pggm_update_member" ON public.programa_grupo_governanca_membro;
CREATE POLICY "pggm_update_member" ON public.programa_grupo_governanca_membro FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.programa_grupo_governanca g
      JOIN public.programa_users pu ON pu.programa_id = g.programa_id
      WHERE g.id = programa_grupo_governanca_membro.grupo_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "pggm_delete_member" ON public.programa_grupo_governanca_membro;
CREATE POLICY "pggm_delete_member" ON public.programa_grupo_governanca_membro FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.programa_grupo_governanca g
      JOIN public.programa_users pu ON pu.programa_id = g.programa_id
      WHERE g.id = programa_grupo_governanca_membro.grupo_id
        AND pu.user_id = (auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

GRANT ALL ON TABLE public.programa_grupo_governanca TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.programa_grupo_governanca_membro TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.programa_grupo_governanca_id_seq TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.programa_grupo_governanca_membro_id_seq TO anon, authenticated, service_role;
