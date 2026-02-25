-- Diagnóstico: chaves em controle_soma vs medida_count e resultado do FULL OUTER JOIN.
-- Ver por que o JOIN entre os dois ainda falha (valores ou tipos diferentes).

CREATE OR REPLACE VIEW public.debug_maturidade_join_keys AS
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
      WHEN resposta_num = 6 THEN NULL
      WHEN diagnostico_id = 1 THEN CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.0 ELSE 0.0 END
      WHEN diagnostico_id IN (2, 3) THEN
        CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.75 WHEN 3 THEN 0.5 WHEN 4 THEN 0.25 WHEN 5 THEN 0.0 ELSE 0.0 END
      ELSE 0.0
    END AS peso
  FROM pm_resposta
  WHERE resposta_num IS NOT NULL AND resposta_num <> 6
),
medida_count AS (
  SELECT programa_id, controle_id, diagnostico_id, controle_numero, COUNT(*)::numeric AS total_medidas
  FROM pm_resposta
  WHERE resposta_num IS NOT NULL AND resposta_num <> 6
  GROUP BY programa_id, controle_id, diagnostico_id, controle_numero
),
controle_soma AS (
  SELECT programa_id, controle_id, diagnostico_id, controle_numero, COALESCE(SUM(peso), 0)::numeric AS soma_pesos
  FROM medida_peso
  WHERE peso IS NOT NULL
  GROUP BY programa_id, controle_id, diagnostico_id, controle_numero
),
full_join AS (
  SELECT
    COALESCE(cs.programa_id, mc.programa_id) AS programa_id,
    COALESCE(cs.controle_id, mc.controle_id) AS controle_id,
    COALESCE(cs.diagnostico_id, mc.diagnostico_id) AS diagnostico_id,
    COALESCE(cs.controle_numero, mc.controle_numero) AS controle_numero,
    (cs.programa_id IS NOT NULL) AS in_controle_soma,
    (mc.programa_id IS NOT NULL) AS in_medida_count,
    cs.controle_numero AS cs_numero,
    mc.controle_numero AS mc_numero,
    pg_typeof(cs.controle_numero)::text AS tipo_cs_numero,
    pg_typeof(mc.controle_numero)::text AS tipo_mc_numero
  FROM controle_soma cs
  FULL OUTER JOIN medida_count mc
    ON mc.programa_id = cs.programa_id
   AND mc.controle_id = cs.controle_id
   AND mc.diagnostico_id = cs.diagnostico_id
   AND mc.controle_numero IS NOT DISTINCT FROM cs.controle_numero
)
SELECT
  programa_id,
  controle_id,
  diagnostico_id,
  controle_numero,
  in_controle_soma,
  in_medida_count,
  (in_controle_soma AND in_medida_count) AS matched,
  cs_numero,
  mc_numero,
  tipo_cs_numero,
  tipo_mc_numero
FROM full_join
ORDER BY programa_id, controle_id, diagnostico_id, controle_numero NULLS LAST;

COMMENT ON VIEW public.debug_maturidade_join_keys IS 'Chaves de controle_soma vs medida_count e match do FULL OUTER JOIN (4 colunas).';

GRANT SELECT ON public.debug_maturidade_join_keys TO anon;
GRANT SELECT ON public.debug_maturidade_join_keys TO authenticated;
