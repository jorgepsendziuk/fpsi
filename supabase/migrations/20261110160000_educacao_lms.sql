-- Academia LGPD / LMS por programa.
-- Texto canônico dos módulos: src/lib/educacao/catalogo.ts (EDU_VERSAO 2026.11).
-- Gabarito não fica legível para anon/authenticated: coluna edu_questao.correta sem GRANT.

-- ---------------------------------------------------------------------------
-- Catálogo da plataforma
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.edu_curso (
  id text PRIMARY KEY,
  titulo text NOT NULL,
  versao text NOT NULL,
  escopo text NOT NULL DEFAULT 'plataforma'
    CHECK (escopo IN ('plataforma', 'programa')),
  programa_id integer REFERENCES public.programa (id) ON DELETE CASCADE,
  publicado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edu_curso_escopo_chk CHECK (
    (escopo = 'plataforma' AND programa_id IS NULL)
    OR (escopo = 'programa' AND programa_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.edu_modulo (
  id text PRIMARY KEY,
  curso_id text NOT NULL REFERENCES public.edu_curso (id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  titulo text NOT NULL,
  minutos integer NOT NULL CHECK (minutos > 0),
  versao text NOT NULL,
  preview_publico boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.edu_questao (
  id text PRIMARY KEY,
  modulo_id text NOT NULL REFERENCES public.edu_modulo (id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  enunciado text NOT NULL,
  opcoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  correta smallint NOT NULL CHECK (correta >= 0 AND correta <= 3),
  UNIQUE (modulo_id, ordem)
);

CREATE TABLE IF NOT EXISTS public.edu_cartilha (
  id text PRIMARY KEY,
  titulo text NOT NULL,
  publico text NOT NULL DEFAULT '',
  versao text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.edu_trilha (
  id text PRIMARY KEY,
  curso_id text NOT NULL REFERENCES public.edu_curso (id) ON DELETE CASCADE,
  titulo text NOT NULL,
  publico text NOT NULL DEFAULT '',
  nota_minima integer NOT NULL DEFAULT 70 CHECK (nota_minima >= 0 AND nota_minima <= 100),
  prazo_dias integer NOT NULL DEFAULT 30 CHECK (prazo_dias > 0),
  reciclagem_meses integer NOT NULL DEFAULT 12 CHECK (reciclagem_meses >= 0),
  obrigatoria boolean NOT NULL DEFAULT false,
  exige_nossa_casa boolean NOT NULL DEFAULT true,
  versao text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.edu_trilha_modulo (
  trilha_id text NOT NULL REFERENCES public.edu_trilha (id) ON DELETE CASCADE,
  modulo_id text NOT NULL REFERENCES public.edu_modulo (id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  PRIMARY KEY (trilha_id, modulo_id)
);

-- ---------------------------------------------------------------------------
-- Progresso por programa (colaborador)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.edu_matricula (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  trilha_id text NOT NULL REFERENCES public.edu_trilha (id),
  status text NOT NULL DEFAULT 'em_andamento'
    CHECK (status IN ('matriculado', 'em_andamento', 'concluido', 'vencido')),
  progresso integer NOT NULL DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  versao_conteudo text NOT NULL,
  vence_em timestamptz,
  concluido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programa_id, user_id, trilha_id)
);

CREATE INDEX IF NOT EXISTS idx_edu_matricula_programa
  ON public.edu_matricula (programa_id, trilha_id);

CREATE TABLE IF NOT EXISTS public.edu_progresso_modulo (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  trilha_id text NOT NULL,
  modulo_id text NOT NULL,
  melhor_nota integer NOT NULL DEFAULT 0 CHECK (melhor_nota >= 0 AND melhor_nota <= 100),
  aprovado boolean NOT NULL DEFAULT false,
  lido_em timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programa_id, user_id, trilha_id, modulo_id)
);

CREATE INDEX IF NOT EXISTS idx_edu_progresso_user
  ON public.edu_progresso_modulo (programa_id, user_id);

CREATE TABLE IF NOT EXISTS public.edu_tentativa_quiz (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  trilha_id text NOT NULL,
  modulo_id text NOT NULL,
  nota integer NOT NULL,
  acertos integer NOT NULL,
  total integer NOT NULL,
  aprovado boolean NOT NULL,
  respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edu_tentativa_user
  ON public.edu_tentativa_quiz (programa_id, user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.edu_certificado (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  trilha_id text NOT NULL,
  codigo text NOT NULL UNIQUE,
  versao_conteudo text NOT NULL,
  carga_horaria_min integer NOT NULL DEFAULT 0,
  nome_exibicao text NOT NULL DEFAULT '',
  emitido_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edu_certificado_programa
  ON public.edu_certificado (programa_id, trilha_id, emitido_em DESC);

CREATE TABLE IF NOT EXISTS public.edu_leitura (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programa_id integer NOT NULL REFERENCES public.programa (id) ON DELETE CASCADE,
  user_id text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('cartilha', 'politica', 'nossa_casa', 'cenario')),
  ref_id text NOT NULL,
  lido_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programa_id, user_id, tipo, ref_id)
);

COMMENT ON TABLE public.edu_matricula IS
  'Matrícula do colaborador numa trilha do programa. Certificado e cobertura alimentam o PPSI Controle 14.';

-- ---------------------------------------------------------------------------
-- Seed do catálogo 2026.11 (metadados; enunciado longo vive no código)
-- ---------------------------------------------------------------------------
INSERT INTO public.edu_curso (id, titulo, versao, escopo)
VALUES ('minicurso-lgpd', 'Minicurso LGPD', '2026.11', 'plataforma')
ON CONFLICT (id) DO UPDATE SET versao = EXCLUDED.versao, titulo = EXCLUDED.titulo;

INSERT INTO public.edu_modulo (id, curso_id, ordem, titulo, minutos, versao, preview_publico)
VALUES
  ('por-que-importa', 'minicurso-lgpd', 1, 'Por que privacidade importa', 8, '2026.11', true),
  ('conceitos', 'minicurso-lgpd', 2, 'Conceitos essenciais', 10, '2026.11', true),
  ('principios', 'minicurso-lgpd', 3, 'Principios na pratica', 10, '2026.11', false),
  ('bases-legais', 'minicurso-lgpd', 4, 'Bases legais', 12, '2026.11', false),
  ('direitos', 'minicurso-lgpd', 5, 'Direitos do titular e o canal', 10, '2026.11', false),
  ('incidentes', 'minicurso-lgpd', 6, 'Seguranca e incidentes', 10, '2026.11', false),
  ('terceiros', 'minicurso-lgpd', 7, 'Terceiros e nuvem', 10, '2026.11', false),
  ('ia', 'minicurso-lgpd', 8, 'IA e automacao', 8, '2026.11', false)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  ordem = EXCLUDED.ordem,
  minutos = EXCLUDED.minutos,
  versao = EXCLUDED.versao,
  preview_publico = EXCLUDED.preview_publico;

INSERT INTO public.edu_questao (id, modulo_id, ordem, enunciado, opcoes, correta)
SELECT m.id || '-q' || q.n,
       m.id,
       q.n,
       'Questao ' || q.n || ' de ' || m.id || ' (texto em src/lib/educacao/catalogo.ts, versao 2026.11)',
       '[]'::jsonb,
       0
FROM public.edu_modulo m
CROSS JOIN (VALUES (1), (2), (3)) AS q(n)
ON CONFLICT (id) DO UPDATE SET enunciado = EXCLUDED.enunciado;

INSERT INTO public.edu_cartilha (id, titulo, publico, versao)
VALUES
  ('lgpd-10-min', 'LGPD em 10 minutos', 'Qualquer pessoa', '2026.11'),
  ('checklist-colaborador', 'Checklist do colaborador', 'Colaboradores', '2026.11'),
  ('phishing', 'Phishing e engenharia social', 'Colaboradores', '2026.11'),
  ('whatsapp-email', 'E-mail, grupos e WhatsApp', 'Colaboradores', '2026.11'),
  ('trabalho-remoto', 'Trabalho remoto e dispositivo pessoal', 'Colaboradores', '2026.11'),
  ('descarte', 'Descarte de papel e midias', 'Colaboradores', '2026.11'),
  ('privacy-by-design', 'Privacidade ao comprar ou criar sistema', 'Gestores e TI', '2026.11'),
  ('direitos-titular', 'Como exercer seus direitos', 'Titulares', '2026.11')
ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, versao = EXCLUDED.versao;

INSERT INTO public.edu_trilha (
  id, curso_id, titulo, publico, nota_minima, prazo_dias, reciclagem_meses, obrigatoria, exige_nossa_casa, versao
)
VALUES
  ('onboarding', 'minicurso-lgpd', 'Onboarding LGPD', 'Todo colaborador novo', 70, 30, 12, true, true, '2026.11'),
  ('gestores', 'minicurso-lgpd', 'Gestores', 'Quem aprova acesso, contrato ou compartilhamento', 70, 45, 12, false, true, '2026.11'),
  ('rh', 'minicurso-lgpd', 'RH', 'Admissao, folha, beneficios e desligamento', 70, 30, 12, false, true, '2026.11'),
  ('comercial', 'minicurso-lgpd', 'Comercial e marketing', 'Leads, CRM e cookies', 70, 30, 12, false, true, '2026.11'),
  ('ti', 'minicurso-lgpd', 'TI e desenvolvimento', 'Sistemas, acessos, logs e operadores', 70, 45, 12, false, true, '2026.11'),
  ('atendimento', 'minicurso-lgpd', 'Atendimento', 'Quem fala com o titular', 70, 30, 12, false, true, '2026.11'),
  ('juridico', 'minicurso-lgpd', 'Juridico e compliance', 'Quem apoia o Encarregado', 70, 60, 12, false, true, '2026.11')
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  prazo_dias = EXCLUDED.prazo_dias,
  versao = EXCLUDED.versao;

INSERT INTO public.edu_trilha_modulo (trilha_id, modulo_id, ordem)
VALUES
  ('onboarding', 'por-que-importa', 1),
  ('onboarding', 'conceitos', 2),
  ('onboarding', 'principios', 3),
  ('onboarding', 'bases-legais', 4),
  ('onboarding', 'direitos', 5),
  ('onboarding', 'incidentes', 6),
  ('gestores', 'principios', 1),
  ('gestores', 'bases-legais', 2),
  ('gestores', 'direitos', 3),
  ('gestores', 'terceiros', 4),
  ('gestores', 'incidentes', 5),
  ('rh', 'conceitos', 1),
  ('rh', 'bases-legais', 2),
  ('rh', 'direitos', 3),
  ('rh', 'incidentes', 4),
  ('comercial', 'principios', 1),
  ('comercial', 'bases-legais', 2),
  ('comercial', 'direitos', 3),
  ('ti', 'conceitos', 1),
  ('ti', 'incidentes', 2),
  ('ti', 'terceiros', 3),
  ('ti', 'ia', 4),
  ('atendimento', 'conceitos', 1),
  ('atendimento', 'direitos', 2),
  ('atendimento', 'incidentes', 3),
  ('juridico', 'por-que-importa', 1),
  ('juridico', 'conceitos', 2),
  ('juridico', 'principios', 3),
  ('juridico', 'bases-legais', 4),
  ('juridico', 'direitos', 5),
  ('juridico', 'incidentes', 6),
  ('juridico', 'terceiros', 7),
  ('juridico', 'ia', 8)
ON CONFLICT (trilha_id, modulo_id) DO UPDATE SET ordem = EXCLUDED.ordem;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.edu_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_modulo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_questao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_cartilha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_trilha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_trilha_modulo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edu_curso_select ON public.edu_curso;
CREATE POLICY edu_curso_select ON public.edu_curso FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS edu_modulo_select ON public.edu_modulo;
CREATE POLICY edu_modulo_select ON public.edu_modulo FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS edu_questao_select ON public.edu_questao;
CREATE POLICY edu_questao_select ON public.edu_questao FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS edu_cartilha_select ON public.edu_cartilha;
CREATE POLICY edu_cartilha_select ON public.edu_cartilha FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS edu_trilha_select ON public.edu_trilha;
CREATE POLICY edu_trilha_select ON public.edu_trilha FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS edu_trilha_modulo_select ON public.edu_trilha_modulo;
CREATE POLICY edu_trilha_modulo_select ON public.edu_trilha_modulo FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON public.edu_curso, public.edu_modulo, public.edu_cartilha, public.edu_trilha, public.edu_trilha_modulo
  TO anon, authenticated;
REVOKE ALL ON TABLE public.edu_questao FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, modulo_id, ordem, enunciado, opcoes) ON TABLE public.edu_questao TO anon, authenticated;
GRANT ALL ON public.edu_curso, public.edu_modulo, public.edu_questao, public.edu_cartilha, public.edu_trilha, public.edu_trilha_modulo
  TO service_role;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'edu_matricula',
    'edu_progresso_modulo',
    'edu_tentativa_quiz',
    'edu_certificado',
    'edu_leitura'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_member', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_programa_member(programa_id))',
      t || '_select_member', t
    );
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_own', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_programa_member(programa_id) AND user_id = (SELECT auth.uid())::text)',
      t || '_insert_own', t
    );
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_own', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_programa_member(programa_id) AND user_id = (SELECT auth.uid())::text) WITH CHECK (public.is_programa_member(programa_id) AND user_id = (SELECT auth.uid())::text)',
      t || '_update_own', t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
