-- Corrige a view para sempre retornar uma linha por (programa_id, diagnostico_id).
-- Antes: só retornava linhas quando havia programa_medida com respostas válidas (resultado vazio).
-- Agora: base = programa CROSS JOIN diagnostico; LEFT JOIN do cálculo → sem cálculo = 0, 'Inicial'.

CREATE OR REPLACE VIEW public.programa_diagnostico_maturidade AS
WITH
-- Resposta: cast defensivo (text ou numérico) e COALESCE com nova_resposta
pm_resposta AS (
  SELECT
    pm.programa AS programa_id,
    pm.medida,
    pm.controle AS controle_id,
    c.diagnostico AS diagnostico_id,
    c.numero AS controle_numero,
    (NULLIF(TRIM(COALESCE(pm.resposta::text, pm.nova_resposta::text, '')), '')::integer) AS resposta_num
  FROM public.programa_medida pm
  JOIN public.medida m ON m.id = pm.medida
  JOIN public.controle c ON c.id = COALESCE(pm.controle, m.id_controle)
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
      WHEN diagnostico_id = 1 THEN
        CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.0 ELSE 0.0 END
      WHEN diagnostico_id IN (2, 3) THEN
        CASE resposta_num
          WHEN 1 THEN 1.0 WHEN 2 THEN 0.75 WHEN 3 THEN 0.5 WHEN 4 THEN 0.25 WHEN 5 THEN 0.0
          ELSE 0.0
        END
      ELSE 0.0
    END AS peso
  FROM pm_resposta
  WHERE resposta_num IS NOT NULL AND resposta_num <> 6
),
medida_count AS (
  SELECT
    programa_id,
    controle_id,
    diagnostico_id,
    controle_numero,
    COUNT(*) AS total_medidas
  FROM pm_resposta
  WHERE resposta_num IS NOT NULL AND resposta_num <> 6
  GROUP BY programa_id, controle_id, diagnostico_id, controle_numero
),
controle_soma AS (
  SELECT
    programa_id,
    controle_id,
    diagnostico_id,
    controle_numero,
    COALESCE(SUM(peso), 0) AS soma_pesos
  FROM medida_peso
  WHERE peso IS NOT NULL
  GROUP BY programa_id, controle_id, diagnostico_id, controle_numero
),
score_controle AS (
  SELECT
    cs.programa_id,
    cs.controle_id,
    cs.diagnostico_id,
    cs.controle_numero,
    pc.nivel AS pc_nivel,
    mc.total_medidas,
    cs.soma_pesos,
    (cs.soma_pesos / NULLIF(mc.total_medidas, 0) / 2.0)
      * (1.0 + (CASE COALESCE(pc.nivel, 1)
          WHEN 1 THEN 0 WHEN 2 THEN 1 WHEN 3 THEN 2 WHEN 4 THEN 3 WHEN 5 THEN 4 WHEN 6 THEN 5
          ELSE 0 END)::numeric / 5.0) AS score
  FROM controle_soma cs
  JOIN medida_count mc ON mc.programa_id = cs.programa_id
    AND mc.controle_id = cs.controle_id AND mc.diagnostico_id = cs.diagnostico_id
  LEFT JOIN public.programa_controle pc ON pc.programa = cs.programa_id AND pc.controle = cs.controle_id
),
imc0 AS (
  SELECT programa_id, diagnostico_id, score AS imc0_score
  FROM score_controle
  WHERE controle_numero = 0
),
demais AS (
  SELECT
    programa_id,
    diagnostico_id,
    SUM(score) AS soma_outros,
    COUNT(*) AS qtd_outros
  FROM score_controle
  WHERE controle_numero IS DISTINCT FROM 0
  GROUP BY programa_id, diagnostico_id
),
score_diag AS (
  SELECT
    COALESCE(i.programa_id, d.programa_id) AS programa_id,
    COALESCE(i.diagnostico_id, d.diagnostico_id) AS diagnostico_id,
    CASE
      WHEN COALESCE(i.diagnostico_id, d.diagnostico_id) = 1 THEN i.imc0_score
      WHEN COALESCE(i.diagnostico_id, d.diagnostico_id) IN (2, 3) AND (d.qtd_outros IS NOT NULL AND d.qtd_outros > 0) THEN
        ((COALESCE(i.imc0_score, 0) * 4) + COALESCE(d.soma_outros, 0)) / (4 + d.qtd_outros)
      WHEN COALESCE(i.diagnostico_id, d.diagnostico_id) IN (2, 3) THEN COALESCE(i.imc0_score, 0)
      ELSE 0
    END AS score
  FROM imc0 i
  FULL OUTER JOIN demais d ON d.programa_id = i.programa_id AND d.diagnostico_id = i.diagnostico_id
),
base AS (
  SELECT p.id AS programa_id, d.id AS diagnostico_id
  FROM public.programa p
  CROSS JOIN public.diagnostico d
)
SELECT
  b.programa_id,
  b.diagnostico_id,
  LEAST(1.0, GREATEST(0.0, COALESCE(sd.score, 0))) AS score,
  CASE
    WHEN COALESCE(sd.score, 0) >= 0.9 THEN 'Aprimorado'
    WHEN COALESCE(sd.score, 0) >= 0.7 THEN 'Em Aprimoramento'
    WHEN COALESCE(sd.score, 0) >= 0.5 THEN 'Intermediário'
    WHEN COALESCE(sd.score, 0) >= 0.3 THEN 'Básico'
    ELSE 'Inicial'
  END AS label
FROM base b
LEFT JOIN score_diag sd ON sd.programa_id = b.programa_id AND sd.diagnostico_id = b.diagnostico_id
WHERE b.programa_id IS NOT NULL AND b.diagnostico_id IS NOT NULL;
