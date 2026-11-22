-- Proveniência de pacotes (conteúdo e superfície). Aditivo — sem DELETE de catálogo ou respostas.

CREATE TABLE IF NOT EXISTS public.content_pack (
  id text PRIMARY KEY,
  nome text NOT NULL,
  versao text NOT NULL DEFAULT '1.0.0',
  descricao text,
  origem text NOT NULL CHECK (origem IN ('proprio', 'terceiro')),
  titular text,
  licenca text,
  url_fonte text,
  schema_versao text NOT NULL DEFAULT '1',
  scoring_profile text,
  pack_tipo text NOT NULL DEFAULT 'conteudo' CHECK (pack_tipo IN ('conteudo', 'superficie')),
  checksum text,
  publicado_em timestamptz,
  instalado_em timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.content_pack IS 'Pacotes instaláveis: metodologia (conteudo) ou site (superficie).';

ALTER TABLE public.diagnostico
  ADD COLUMN IF NOT EXISTS pack_id text REFERENCES public.content_pack (id);

ALTER TABLE public.controle
  ADD COLUMN IF NOT EXISTS pack_id text REFERENCES public.content_pack (id),
  ADD COLUMN IF NOT EXISTS codigo_origem text;

ALTER TABLE public.medida
  ADD COLUMN IF NOT EXISTS pack_id text REFERENCES public.content_pack (id),
  ADD COLUMN IF NOT EXISTS codigo_origem text;

CREATE INDEX IF NOT EXISTS idx_controle_pack_id ON public.controle (pack_id);
CREATE INDEX IF NOT EXISTS idx_medida_pack_id ON public.medida (pack_id);
CREATE INDEX IF NOT EXISTS idx_diagnostico_pack_id ON public.diagnostico (pack_id);

-- Metadados dos pacotes (idempotente)
INSERT INTO public.content_pack (
  id, nome, versao, descricao, origem, titular, licenca, url_fonte, schema_versao, scoring_profile, pack_tipo, publicado_em
) VALUES
  (
    'ppsi-2.0',
    'PPSI 2.0',
    '1.2',
    'Catálogo do Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)',
    'terceiro',
    'SGD/MGI — Governo Federal do Brasil',
    'CC BY-NC-ND 4.0',
    'https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/',
    '1',
    'ppsi-nim-nac-v1',
    'conteudo',
    '2026-01-30'::timestamptz
  ),
  (
    'governanca-ia',
    'Governança de IA',
    '1.0',
    'Domínio complementar de governança de inteligência artificial (FPSI)',
    'proprio',
    'FPSI',
    'MIT (conteúdo autoral deste repositório; ver LICENSE)',
    NULL,
    '1',
    'ppsi-nim-nac-v1',
    'conteudo',
    now()
  ),
  (
    'framework',
    'Framework',
    '0.0.0',
    'Metodologia própria da Ferramenta FPSI (encaixe — catálogo a publicar)',
    'proprio',
    'FPSI',
    'MIT',
    NULL,
    '1',
    NULL,
    'conteudo',
    NULL
  ),
  (
    'publico',
    'Público',
    '1.0.0',
    'Site institucional e páginas de divulgação',
    'proprio',
    'FPSI',
    'MIT',
    NULL,
    '1',
    NULL,
    'superficie',
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  versao = EXCLUDED.versao,
  descricao = EXCLUDED.descricao,
  origem = EXCLUDED.origem,
  titular = EXCLUDED.titular,
  licenca = EXCLUDED.licenca,
  url_fonte = EXCLUDED.url_fonte,
  schema_versao = EXCLUDED.schema_versao,
  scoring_profile = EXCLUDED.scoring_profile,
  pack_tipo = EXCLUDED.pack_tipo,
  publicado_em = COALESCE(public.content_pack.publicado_em, EXCLUDED.publicado_em);

-- Backfill diagnósticos
UPDATE public.diagnostico SET pack_id = 'ppsi-2.0' WHERE id IN (1, 2, 3) AND pack_id IS NULL;
UPDATE public.diagnostico SET pack_id = 'governanca-ia' WHERE id = 4 AND pack_id IS NULL;

-- Backfill controles
UPDATE public.controle c
SET
  pack_id = d.pack_id,
  codigo_origem = COALESCE(c.codigo_origem, c.numero::text)
FROM public.diagnostico d
WHERE c.diagnostico = d.id
  AND c.pack_id IS NULL
  AND d.pack_id IS NOT NULL;

-- Backfill medidas
UPDATE public.medida m
SET
  pack_id = c.pack_id,
  codigo_origem = COALESCE(m.codigo_origem, m.id_medida)
FROM public.controle c
WHERE m.id_controle = c.id
  AND m.pack_id IS NULL
  AND c.pack_id IS NOT NULL;

GRANT SELECT ON public.content_pack TO anon, authenticated, service_role;