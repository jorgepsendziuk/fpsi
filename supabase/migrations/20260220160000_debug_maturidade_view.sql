-- View de diagnóstico: contagens por etapa do cálculo de maturidade.
-- Consultar com: SELECT * FROM debug_maturidade_contagens;
-- Ver em qual passo o total cai para 0 (problema na view programa_diagnostico_maturidade).

CREATE OR REPLACE VIEW public.debug_maturidade_contagens AS
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
pm_ok AS (
  SELECT 1 FROM pm_resposta WHERE resposta_num IS NOT NULL AND resposta_num <> 6
),
medida_peso AS (
  SELECT programa_id, controle_id, diagnostico_id, controle_numero,
    CASE WHEN resposta_num = 6 THEN NULL WHEN diagnostico_id = 1 THEN CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.0 ELSE 0.0 END
      WHEN diagnostico_id IN (2, 3) THEN CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.75 WHEN 3 THEN 0.5 WHEN 4 THEN 0.25 WHEN 5 THEN 0.0 ELSE 0.0 END
      ELSE 0.0 END AS peso
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
joined AS (
  SELECT 1
  FROM controle_soma cs
  JOIN medida_count mc
    ON mc.programa_id = cs.programa_id
   AND mc.controle_id = cs.controle_id
   AND mc.diagnostico_id = cs.diagnostico_id
)
SELECT 'pm_ok' AS passo, (SELECT COUNT(*) FROM pm_ok)::bigint AS total
UNION ALL SELECT 'medida_peso', (SELECT COUNT(*) FROM medida_peso)
UNION ALL SELECT 'medida_count', (SELECT COUNT(*) FROM medida_count)
UNION ALL SELECT 'controle_soma', (SELECT COUNT(*) FROM controle_soma)
UNION ALL SELECT 'joined(cs+mc)', (SELECT COUNT(*) FROM joined)
ORDER BY passo;

COMMENT ON VIEW public.debug_maturidade_contagens IS 'Diagnóstico: contagens por etapa do cálculo de maturidade. Use para ver onde as linhas somem.';

GRANT SELECT ON public.debug_maturidade_contagens TO anon;
GRANT SELECT ON public.debug_maturidade_contagens TO authenticated;
