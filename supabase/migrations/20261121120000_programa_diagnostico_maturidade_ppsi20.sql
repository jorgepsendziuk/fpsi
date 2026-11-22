-- PPSI 2.0 (IN SGD/MGI 4/2026): NIM, indicadores iBase/iSeg/iPriv sem INCC nem peso do controle 0.

CREATE OR REPLACE VIEW public.programa_diagnostico_maturidade AS
WITH
pm_resposta AS (
  SELECT
    pm.programa AS programa_id,
    pm.medida,
    pm.controle AS controle_id,
    c.diagnostico AS diagnostico_id,
    c.numero AS controle_numero,
    (NULLIF(TRIM(COALESCE(pm.resposta::text, pm.nova_resposta::text, '')), '')::integer) AS resposta_num
  FROM public.programa_medida pm
  JOIN public.medida m ON m.id = (pm.medida)::bigint
  JOIN public.controle c ON c.id = COALESCE((pm.controle)::bigint, m.id_controle)
  WHERE pm.programa IS NOT NULL
),
medida_peso AS (
  SELECT
    programa_id,
    controle_id,
    diagnostico_id,
    controle_numero,
    CASE
      WHEN resposta_num IS NULL OR resposta_num = 6 THEN NULL
      WHEN diagnostico_id = 1 THEN
        CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.0 ELSE 0.0 END
      WHEN diagnostico_id IN (2, 3, 4) THEN
        CASE resposta_num
          WHEN 1 THEN 0.0
          WHEN 2 THEN 0.25
          WHEN 3 THEN 0.5
          WHEN 4 THEN 0.75
          WHEN 5 THEN 1.0
          ELSE 0.0
        END
      ELSE 0.0
    END AS peso
  FROM pm_resposta
),
aplicavel AS (
  SELECT
    programa_id,
    controle_id,
    diagnostico_id,
    controle_numero
  FROM pm_resposta
  WHERE resposta_num IS DISTINCT FROM 6
),
peso_flat AS (
  SELECT
    a.programa_id,
    a.diagnostico_id,
    COALESCE(p.peso, 0)::numeric AS peso
  FROM aplicavel a
  LEFT JOIN medida_peso p
    ON p.programa_id = a.programa_id
   AND p.controle_id = a.controle_id
   AND p.diagnostico_id = a.diagnostico_id
),
indicador AS (
  SELECT
    programa_id,
    diagnostico_id,
    AVG(peso) AS score
  FROM peso_flat
  GROUP BY programa_id, diagnostico_id
),
base AS (
  SELECT p.id AS programa_id, d.id AS diagnostico_id
  FROM public.programa p
  CROSS JOIN public.diagnostico d
)
SELECT
  b.programa_id,
  b.diagnostico_id,
  LEAST(1.0, GREATEST(0.0, COALESCE(i.score, 0))) AS score,
  CASE
    WHEN COALESCE(i.score, 0) >= 0.9 THEN 'Aprimorado'
    WHEN COALESCE(i.score, 0) >= 0.6 THEN 'Em aprimoramento'
    WHEN COALESCE(i.score, 0) >= 0.3 THEN 'Intermediário'
    ELSE 'Inicial'
  END AS label
FROM base b
LEFT JOIN indicador i ON i.programa_id = b.programa_id AND i.diagnostico_id = b.diagnostico_id
WHERE b.programa_id IS NOT NULL AND b.diagnostico_id IS NOT NULL;

COMMENT ON VIEW public.programa_diagnostico_maturidade IS
  'Indicadores PPSI 2.0 por programa/diagnóstico: iBase (1), iSeg (2), iPriv (3), iAIGP (4). Média NIM; faixas IN 4/2026 Tabela 6.';

GRANT SELECT ON public.programa_diagnostico_maturidade TO anon;
GRANT SELECT ON public.programa_diagnostico_maturidade TO authenticated;