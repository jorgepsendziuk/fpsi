-- Núcleo GRC: evidências (anexos leves), cadastro mestre mínimo, plano_acao,
-- workflow genérico (histórico). Arquivos em base64 no banco (sem vídeo).

-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_programa_member(p_programa_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = p_programa_id
      AND pu.user_id = auth.uid()::text
      AND pu.status = 'accepted'
  );
$$;

REVOKE ALL ON FUNCTION public.is_programa_member(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_programa_member(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_programa_member(integer) TO service_role;

-- ---------------------------------------------------------------------------
-- Cadastro mestre
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programa_unidade (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  parent_id bigint REFERENCES public.programa_unidade (id) ON DELETE SET NULL,
  nome text NOT NULL,
  codigo text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_unidade_nome_chk CHECK (char_length(trim(nome)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_programa_unidade_programa
  ON public.programa_unidade (programa_id);

CREATE TABLE IF NOT EXISTS public.programa_processo (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  unidade_id bigint REFERENCES public.programa_unidade (id) ON DELETE SET NULL,
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  dono text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_processo_nome_chk CHECK (char_length(trim(nome)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_programa_processo_programa
  ON public.programa_processo (programa_id);

CREATE TABLE IF NOT EXISTS public.programa_fornecedor (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  nome text NOT NULL,
  cnpj text,
  tipo text NOT NULL DEFAULT 'operador'
    CHECK (tipo IN ('operador', 'controlador_conjunto', 'suboperador', 'software', 'outro')),
  contato text NOT NULL DEFAULT '',
  avaliacao_status text NOT NULL DEFAULT 'pendente'
    CHECK (avaliacao_status IN ('pendente', 'aprovado', 'reprovado', 'em_revisao')),
  ativo boolean NOT NULL DEFAULT true,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_fornecedor_nome_chk CHECK (char_length(trim(nome)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_programa_fornecedor_programa
  ON public.programa_fornecedor (programa_id);

CREATE TABLE IF NOT EXISTS public.programa_sistema (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  processo_id bigint REFERENCES public.programa_processo (id) ON DELETE SET NULL,
  fornecedor_id bigint REFERENCES public.programa_fornecedor (id) ON DELETE SET NULL,
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'aplicacao'
    CHECK (tipo IN ('aplicacao', 'banco', 'saas', 'api', 'infra', 'outro')),
  critico boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programa_sistema_nome_chk CHECK (char_length(trim(nome)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_programa_sistema_programa
  ON public.programa_sistema (programa_id);

-- Vínculos opcionais nos satélites existentes
ALTER TABLE public.sistema_ia
  ADD COLUMN IF NOT EXISTS sistema_id bigint REFERENCES public.programa_sistema (id) ON DELETE SET NULL;

ALTER TABLE public.programa_risco
  ADD COLUMN IF NOT EXISTS processo_id bigint REFERENCES public.programa_processo (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sistema_id bigint REFERENCES public.programa_sistema (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fornecedor_id bigint REFERENCES public.programa_fornecedor (id) ON DELETE SET NULL;

ALTER TABLE public.mapeamento_dados
  ADD COLUMN IF NOT EXISTS processo_id bigint REFERENCES public.programa_processo (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sistema_id bigint REFERENCES public.programa_sistema (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Evidências (anexo leve: metadados + base64; sem vídeo)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidencia (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT 'outro'
    CHECK (categoria IN (
      'pdf', 'imagem', 'planilha', 'link', 'contrato', 'politica',
      'certificado', 'ata', 'print', 'outro'
    )),
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  tamanho_bytes integer NOT NULL DEFAULT 0
    CHECK (tamanho_bytes >= 0 AND tamanho_bytes <= 5242880),
  nome_arquivo text,
  conteudo_base64 text,
  url_externa text,
  sha256 text,
  validade date,
  versao text NOT NULL DEFAULT '1',
  status text NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'substituido', 'arquivado')),
  responsavel_user_id text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidencia_titulo_chk CHECK (char_length(trim(titulo)) > 0),
  CONSTRAINT evidencia_conteudo_ou_link_chk CHECK (
    (conteudo_base64 IS NOT NULL AND char_length(conteudo_base64) > 0)
    OR (url_externa IS NOT NULL AND char_length(trim(url_externa)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_evidencia_programa ON public.evidencia (programa_id);
CREATE INDEX IF NOT EXISTS idx_evidencia_status ON public.evidencia (programa_id, status);

COMMENT ON TABLE public.evidencia IS
  'Anexos de evidência (PDF/imagem/planilha/link). Imagens redimensionadas (~A4); máx 5MB; sem vídeo.';

CREATE TABLE IF NOT EXISTS public.evidencia_vinculo (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evidencia_id bigint NOT NULL REFERENCES public.evidencia (id) ON DELETE CASCADE,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  alvo_tipo text NOT NULL
    CHECK (alvo_tipo IN (
      'medida', 'programa_medida', 'controle', 'risco', 'politica',
      'sistema_ia', 'plano_acao', 'incidente', 'ripd', 'outro'
    )),
  alvo_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidencia_vinculo_unique UNIQUE (evidencia_id, alvo_tipo, alvo_id)
);

CREATE INDEX IF NOT EXISTS idx_evidencia_vinculo_alvo
  ON public.evidencia_vinculo (programa_id, alvo_tipo, alvo_id);

-- ---------------------------------------------------------------------------
-- Plano de ação (entidade própria; medida opcional)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plano_acao (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  programa_medida_id integer REFERENCES public.programa_medida (id) ON DELETE SET NULL,
  risco_id integer REFERENCES public.programa_risco (id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  prioridade text NOT NULL DEFAULT 'media'
    CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  status text NOT NULL DEFAULT 'nao_iniciado'
    CHECK (status IN (
      'rascunho', 'nao_iniciado', 'em_andamento', 'concluido',
      'atrasado', 'cancelado', 'em_revisao', 'aprovado'
    )),
  data_inicio date,
  data_fim_prevista date,
  data_fim_real date,
  responsavel text NOT NULL DEFAULT '',
  progresso_percentual integer NOT NULL DEFAULT 0
    CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  workflow_estado text NOT NULL DEFAULT 'rascunho'
    CHECK (workflow_estado IN (
      'rascunho', 'em_elaboracao', 'em_revisao', 'aprovado', 'publicado', 'arquivado'
    )),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plano_acao_titulo_chk CHECK (char_length(trim(titulo)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_plano_acao_programa ON public.plano_acao (programa_id);
CREATE INDEX IF NOT EXISTS idx_plano_acao_medida ON public.plano_acao (programa_medida_id);
CREATE INDEX IF NOT EXISTS idx_plano_acao_status ON public.plano_acao (programa_id, status);

COMMENT ON TABLE public.plano_acao IS
  'Ação do plano de trabalho. programa_medida_id opcional (pode nascer do diagnóstico ou avulsa).';

-- Backfill: ações a partir de medidas com plano preenchido
INSERT INTO public.plano_acao (
  programa_id,
  programa_medida_id,
  titulo,
  descricao,
  status,
  data_inicio,
  data_fim_prevista,
  responsavel,
  workflow_estado,
  created_at,
  updated_at
)
SELECT
  pm.programa,
  pm.id,
  COALESCE(NULLIF(trim(pm.encaminhamento_interno), ''), 'Ação da medida #' || pm.medida::text),
  COALESCE(pm.justificativa, ''),
  CASE pm.status_plano_acao
    WHEN 2 THEN 'concluido'
    WHEN 4 THEN 'em_andamento'
    WHEN 5 THEN 'atrasado'
    WHEN 3 THEN 'cancelado'
    ELSE 'nao_iniciado'
  END,
  pm.previsao_inicio,
  pm.previsao_fim,
  COALESCE(pm.responsavel::text, ''),
  CASE WHEN pm.status_plano_acao = 2 THEN 'aprovado' ELSE 'em_elaboracao' END,
  now(),
  now()
FROM public.programa_medida pm
WHERE pm.programa IS NOT NULL
  AND (
    pm.status_plano_acao IS NOT NULL
    OR NULLIF(trim(COALESCE(pm.encaminhamento_interno, '')), '') IS NOT NULL
    OR pm.previsao_inicio IS NOT NULL
    OR pm.previsao_fim IS NOT NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.plano_acao pa WHERE pa.programa_medida_id = pm.id
  );

-- ---------------------------------------------------------------------------
-- Workflow genérico (histórico de estados)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_evento (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  alvo_tipo text NOT NULL
    CHECK (alvo_tipo IN (
      'politica', 'plano_acao', 'risco', 'ripd', 'sistema_ia', 'evidencia', 'outro'
    )),
  alvo_id text NOT NULL,
  de_estado text,
  para_estado text NOT NULL,
  comentario text NOT NULL DEFAULT '',
  ator_user_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_evento_alvo
  ON public.workflow_evento (programa_id, alvo_tipo, alvo_id, created_at DESC);

-- Políticas: estados de workflow intermediários (mantém rascunho/publicado)
ALTER TABLE public.politica_programa
  ADD COLUMN IF NOT EXISTS workflow_estado text NOT NULL DEFAULT 'rascunho';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'politica_programa_workflow_estado_chk'
  ) THEN
    ALTER TABLE public.politica_programa
      ADD CONSTRAINT politica_programa_workflow_estado_chk
      CHECK (workflow_estado IN (
        'rascunho', 'em_elaboracao', 'em_revisao', 'aprovado', 'publicado', 'arquivado'
      ));
  END IF;
END $$;

UPDATE public.politica_programa
SET workflow_estado = CASE
  WHEN status = 'publicado' THEN 'publicado'
  ELSE 'rascunho'
END
WHERE workflow_estado IS NULL
   OR workflow_estado = 'rascunho' AND status = 'publicado';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'programa_unidade',
    'programa_processo',
    'programa_fornecedor',
    'programa_sistema',
    'evidencia',
    'evidencia_vinculo',
    'plano_acao',
    'workflow_evento'
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

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
