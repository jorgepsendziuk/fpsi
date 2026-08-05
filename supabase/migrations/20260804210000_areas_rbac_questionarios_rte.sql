-- Áreas dinâmicas por programa, RBAC scoped, questionários (assignments),
-- impacto no plano e snapshot do Relatório Técnico Executivo.

-- ---------------------------------------------------------------------------
-- responsavel ↔ login
-- ---------------------------------------------------------------------------
ALTER TABLE public.responsavel
  ADD COLUMN IF NOT EXISTS user_id text;

COMMENT ON COLUMN public.responsavel.user_id IS
  'auth.users.id (UUID texto) vinculado ao responsável; usado para full-access via papéis PPSI';

CREATE INDEX IF NOT EXISTS responsavel_user_id_idx
  ON public.responsavel (user_id)
  WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- programa_area
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_area (
  id serial PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  nome text NOT NULL,
  slug text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_area_programa_slug_unique UNIQUE (programa_id, slug)
);

COMMENT ON TABLE public.programa_area IS
  'Áreas/setores dinâmicos do programa (RH, TI, etc.) para escopo de acesso e questionários';

CREATE INDEX IF NOT EXISTS programa_area_programa_id_idx
  ON public.programa_area (programa_id);

-- ---------------------------------------------------------------------------
-- programa_area_escopo (1:1 com área)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_area_escopo (
  id serial PRIMARY KEY,
  area_id integer NOT NULL UNIQUE REFERENCES public.programa_area (id) ON DELETE CASCADE,
  diagnostico_ids integer[] NOT NULL DEFAULT '{}',
  controle_ids integer[] NOT NULL DEFAULT '{}',
  modulos text[] NOT NULL DEFAULT ARRAY['questionario', 'kpis']::text[],
  kpi_keys text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.programa_area_escopo IS
  'Pacote do questionário/KPIs da área: controles e/ou eixos + módulos liberados';

-- ---------------------------------------------------------------------------
-- programa_user_areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_user_areas (
  id serial PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  area_id integer NOT NULL REFERENCES public.programa_area (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_user_areas_unique UNIQUE (programa_id, user_id, area_id)
);

CREATE INDEX IF NOT EXISTS programa_user_areas_user_idx
  ON public.programa_user_areas (programa_id, user_id);

-- ---------------------------------------------------------------------------
-- questionario_assignment
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questionario_assignment (
  id serial PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  assignee_user_id text NOT NULL,
  area_id integer REFERENCES public.programa_area (id) ON DELETE SET NULL,
  invite_id integer REFERENCES public.programa_invites (id) ON DELETE SET NULL,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  due_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questionario_assignment_status_check CHECK (
    status IN ('pending', 'in_progress', 'done', 'cancelled')
  )
);

COMMENT ON COLUMN public.questionario_assignment.scope IS
  'JSON: { controle_ids?: number[], medida_ids?: number[], diagnostico_ids?: number[] }';

CREATE INDEX IF NOT EXISTS questionario_assignment_assignee_idx
  ON public.questionario_assignment (programa_id, assignee_user_id);

-- ---------------------------------------------------------------------------
-- programa_invites: áreas + scope no convite
-- ---------------------------------------------------------------------------
ALTER TABLE public.programa_invites
  ADD COLUMN IF NOT EXISTS area_ids integer[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assignment_scope jsonb,
  ADD COLUMN IF NOT EXISTS due_at timestamptz;

COMMENT ON COLUMN public.programa_invites.area_ids IS
  'Áreas atribuídas ao aceitar o convite (setor scoped)';
COMMENT ON COLUMN public.programa_invites.assignment_scope IS
  'Escopo opcional do questionário materializado no aceite';

-- ---------------------------------------------------------------------------
-- plano: impacto de negócio
-- ---------------------------------------------------------------------------
ALTER TABLE public.programa_medida
  ADD COLUMN IF NOT EXISTS impacto_negocio varchar(20) NOT NULL DEFAULT 'medio';

DO $$
BEGIN
  ALTER TABLE public.programa_medida
    ADD CONSTRAINT programa_medida_impacto_negocio_check CHECK (
      impacto_negocio IN ('muito_baixo', 'baixo', 'medio', 'alto', 'muito_alto')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.programa_medida.impacto_negocio IS
  'Impacto de negócio para priorização do plano (editável por full-access)';

-- ---------------------------------------------------------------------------
-- Relatório Técnico Executivo (snapshot editável)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_relatorio_executivo (
  id serial PRIMARY KEY,
  programa_id integer NOT NULL UNIQUE REFERENCES public.programa (id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  narrativa_resumo text,
  narrativa_impacto text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.programa_relatorio_executivo IS
  'Snapshot/narrativas do Relatório Técnico Executivo por programa';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.programa_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_area_escopo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_user_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionario_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_relatorio_executivo ENABLE ROW LEVEL SECURITY;

-- Membership helper pattern (accepted member of programa)
DROP POLICY IF EXISTS programa_area_select_member ON public.programa_area;
CREATE POLICY programa_area_select_member ON public.programa_area FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_area.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS programa_area_write_member ON public.programa_area;
CREATE POLICY programa_area_write_member ON public.programa_area FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_area.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_area.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS programa_area_escopo_select_member ON public.programa_area_escopo;
CREATE POLICY programa_area_escopo_select_member ON public.programa_area_escopo FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programa_area a
    JOIN public.programa_users pu ON pu.programa_id = a.programa_id
    WHERE a.id = programa_area_escopo.area_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS programa_area_escopo_write_member ON public.programa_area_escopo;
CREATE POLICY programa_area_escopo_write_member ON public.programa_area_escopo FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programa_area a
    JOIN public.programa_users pu ON pu.programa_id = a.programa_id
    WHERE a.id = programa_area_escopo.area_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_area a
    JOIN public.programa_users pu ON pu.programa_id = a.programa_id
    WHERE a.id = programa_area_escopo.area_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS programa_user_areas_select_member ON public.programa_user_areas;
CREATE POLICY programa_user_areas_select_member ON public.programa_user_areas FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = programa_user_areas.programa_id
        AND pu.user_id = (SELECT auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS programa_user_areas_write_member ON public.programa_user_areas;
CREATE POLICY programa_user_areas_write_member ON public.programa_user_areas FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_user_areas.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_user_areas.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS questionario_assignment_select ON public.questionario_assignment;
CREATE POLICY questionario_assignment_select ON public.questionario_assignment FOR SELECT TO authenticated
  USING (
    assignee_user_id = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = questionario_assignment.programa_id
        AND pu.user_id = (SELECT auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS questionario_assignment_write ON public.questionario_assignment;
CREATE POLICY questionario_assignment_write ON public.questionario_assignment FOR ALL TO authenticated
  USING (
    assignee_user_id = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = questionario_assignment.programa_id
        AND pu.user_id = (SELECT auth.uid())::text
        AND pu.status = 'accepted'
    )
  )
  WITH CHECK (
    assignee_user_id = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = questionario_assignment.programa_id
        AND pu.user_id = (SELECT auth.uid())::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS programa_relatorio_executivo_member ON public.programa_relatorio_executivo;
CREATE POLICY programa_relatorio_executivo_member ON public.programa_relatorio_executivo FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_relatorio_executivo.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = programa_relatorio_executivo.programa_id
      AND pu.user_id = (SELECT auth.uid())::text
      AND pu.status = 'accepted'
  ));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.programa_area TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programa_area_escopo TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programa_user_areas TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionario_assignment TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programa_relatorio_executivo TO authenticated, anon;

GRANT USAGE, SELECT ON SEQUENCE public.programa_area_id_seq TO authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE public.programa_area_escopo_id_seq TO authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE public.programa_user_areas_id_seq TO authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE public.questionario_assignment_id_seq TO authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE public.programa_relatorio_executivo_id_seq TO authenticated, anon;
