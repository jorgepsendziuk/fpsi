-- Rastreabilidade e Auditoria (LGPD art. 37, ANPD, Framework FPSI Controle 8)
-- Estende user_activities para suportar: ações sem programa, portal público (user_id null),
-- novos tipos de ação, e coluna origem.

-- Tornar programa_id nullable (ações como login, criar empresa sem programa)
ALTER TABLE public.user_activities
  ALTER COLUMN programa_id DROP NOT NULL;

-- Tornar user_id nullable (ações do portal público: pedido titular, reportar, contato)
ALTER TABLE public.user_activities
  ALTER COLUMN user_id DROP NOT NULL;

-- Ampliar constraint action com novos valores
ALTER TABLE public.user_activities
  DROP CONSTRAINT IF EXISTS user_activities_action_check;

ALTER TABLE public.user_activities
  ADD CONSTRAINT user_activities_action_check CHECK (
    action IN (
      'create', 'update', 'delete', 'view', 'approve', 'reject',
      'invite', 'login', 'logout', 'export', 'restore', 'upload', 'download'
    )
  );

-- Adicionar coluna origem
ALTER TABLE public.user_activities
  ADD COLUMN IF NOT EXISTS origem VARCHAR(50) DEFAULT 'api';

COMMENT ON COLUMN public.user_activities.origem IS 'Origem da ação: api, portal_publico, sistema';

-- Índice para consultas por resource_type e resource_id
CREATE INDEX IF NOT EXISTS idx_user_activities_resource ON public.user_activities(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_origem ON public.user_activities(origem);

-- RLS: INSERT para usuários autenticados e service_role (portal público usa admin)
-- SELECT apenas para membros do programa (quando programa_id preenchido) ou próprio user_id
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_activities_insert_authenticated" ON public.user_activities;
CREATE POLICY "user_activities_insert_authenticated"
  ON public.user_activities FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "user_activities_insert_anon_for_portal" ON public.user_activities;
-- Portal público: API usa service_role, não anon. Inserção via service_role já coberta acima.

DROP POLICY IF EXISTS "user_activities_select_member" ON public.user_activities;
CREATE POLICY "user_activities_select_member"
  ON public.user_activities FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = user_id
    OR (programa_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = user_activities.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    ))
  );

-- service_role pode ler tudo (para relatórios/admin)
DROP POLICY IF EXISTS "user_activities_select_service_role" ON public.user_activities;
CREATE POLICY "user_activities_select_service_role"
  ON public.user_activities FOR SELECT
  TO service_role
  USING (true);
