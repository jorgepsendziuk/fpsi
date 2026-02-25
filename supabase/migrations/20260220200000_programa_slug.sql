-- Slug para URL amigável (sem expor id numérico)
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS slug text;
COMMENT ON COLUMN public.programa.slug IS 'Identificador para URL (ex: empresa-xyz). Único por programa. Sem id na URL.';

-- Backfill: slug só a partir do nome; duplicatas recebem sufixo -2, -3, etc (não o id)
WITH
base AS (
  SELECT
    id,
    lower(
      regexp_replace(
        regexp_replace(
          trim(both '-' from regexp_replace(coalesce(trim(nome), 'programa'), '[^a-zA-Z0-9\s-]', '', 'g')),
          E'\\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    ) AS base_slug
  FROM public.programa
),
numbered AS (
  SELECT id, base_slug, row_number() OVER (PARTITION BY base_slug ORDER BY id) AS rn
  FROM base
)
UPDATE public.programa p
SET slug = n.base_slug || CASE WHEN n.rn > 1 THEN '-' || n.rn ELSE '' END
FROM numbered n
WHERE p.id = n.id;

-- Fallback: registros sem nome/slug válido recebem slug único sem id (programa-xxxx)
UPDATE public.programa
SET slug = 'programa-' || substr(md5(id::text || coalesce(nome, '')::text), 1, 8)
WHERE slug IS NULL OR trim(slug) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_programa_slug ON public.programa(slug);
