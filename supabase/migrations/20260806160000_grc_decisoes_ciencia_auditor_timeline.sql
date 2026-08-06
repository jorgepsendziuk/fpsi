-- GRC fase 3: decisões, ciência/assinatura, convite auditor, timeline de eventos.

CREATE TABLE IF NOT EXISTS public.decision_record (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  titulo text NOT NULL,
  contexto text NOT NULL DEFAULT '',
  problema text NOT NULL DEFAULT '',
  alternativas text NOT NULL DEFAULT '',
  decisao text NOT NULL DEFAULT '',
  justificativa text NOT NULL DEFAULT '',
  responsaveis text NOT NULL DEFAULT '',
  data_decisao date,
  status text NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'aprovado', 'arquivado')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT decision_record_titulo_chk CHECK (char_length(trim(titulo)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_decision_record_programa ON public.decision_record (programa_id);

CREATE TABLE IF NOT EXISTS public.decision_record_vinculo (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  decision_id bigint NOT NULL REFERENCES public.decision_record (id) ON DELETE CASCADE,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  alvo_tipo text NOT NULL
    CHECK (alvo_tipo IN ('risco', 'processo', 'auditoria', 'fornecedor', 'politica', 'plano_acao', 'outro')),
  alvo_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ciencia_documento (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  politica_programa_id integer REFERENCES public.politica_programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  versao text NOT NULL DEFAULT '1',
  documento_titulo text NOT NULL DEFAULT '',
  ip text,
  user_agent text,
  aceito_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ciencia_documento_unique UNIQUE (programa_id, politica_programa_id, user_id, versao)
);

CREATE INDEX IF NOT EXISTS idx_ciencia_documento_programa ON public.ciencia_documento (programa_id);

CREATE TABLE IF NOT EXISTS public.programa_auditor_acesso (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_access_at timestamptz,
  CONSTRAINT programa_auditor_email_chk CHECK (char_length(trim(email)) > 3)
);

CREATE INDEX IF NOT EXISTS idx_programa_auditor_token ON public.programa_auditor_acesso (token)
  WHERE revoked_at IS NULL;

-- Timeline unificada (view sobre eventos existentes + workflow)
CREATE OR REPLACE VIEW public.programa_timeline_evento
WITH (security_invoker = true)
AS
SELECT
  we.id::text AS id,
  we.programa_id,
  we.created_at AS ocorrido_em,
  'workflow'::text AS origem,
  we.alvo_tipo AS tipo,
  COALESCE(we.para_estado, '') AS titulo,
  we.comentario AS detalhe,
  we.ator_user_id AS ator_user_id
FROM public.workflow_evento we
UNION ALL
SELECT
  ('dec-' || dr.id::text),
  dr.programa_id,
  COALESCE(dr.data_decisao::timestamptz, dr.created_at),
  'decisao',
  'decisao',
  dr.titulo,
  left(dr.decisao, 280),
  dr.created_by
FROM public.decision_record dr
WHERE dr.status <> 'rascunho'
UNION ALL
SELECT
  ('ciencia-' || c.id::text),
  c.programa_id,
  c.aceito_em,
  'ciencia',
  'ciencia',
  COALESCE(NULLIF(c.documento_titulo, ''), 'Ciência de documento'),
  'Versão ' || c.versao,
  c.user_id
FROM public.ciencia_documento c;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'decision_record',
    'decision_record_vinculo',
    'ciencia_documento',
    'programa_auditor_acesso'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_member', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_programa_member(programa_id))',
      t || '_select_member', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_member', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_programa_member(programa_id))',
      t || '_insert_member', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_member', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_programa_member(programa_id)) WITH CHECK (public.is_programa_member(programa_id))',
      t || '_update_member', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_member', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_programa_member(programa_id))',
      t || '_delete_member', t
    );

    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

GRANT SELECT ON public.programa_timeline_evento TO authenticated;
GRANT SELECT ON public.programa_timeline_evento TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
