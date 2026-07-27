#!/usr/bin/env node
/**
 * Gera migration SQL + entradas em controles.json a partir de docs/aigp/catalogo_aigp_v1.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "docs/aigp/catalogo_aigp_v1.json");
const migrationPath = path.join(
  root,
  "supabase/migrations/20260719230000_diagnostico_aigp_governanca_ia.sql"
);
const controlesJsonPath = path.join(root, "src/lib/services/controles.json");
const medidasMetaPath = path.join(root, "src/lib/services/medidas.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const { meta, controles } = catalog;

function sqlEscape(s) {
  if (s == null) return "NULL";
  return `'${String(s).replace(/'/g, "''")}'`;
}

let medidaId = 211;
const controleRows = [];
const medidaRows = [];
const jsonControles = [];

for (const c of controles) {
  controleRows.push(
    `  (${c.id}, ${c.numero}, ${meta.diagnostico_id}, ${sqlEscape(c.nome)})`
  );
  jsonControles.push({
    id: c.id,
    nome: c.nome,
    texto: c.texto,
    por_que_implementar: c.por_que_implementar,
    procedimentos_e_ferramentas: c.procedimentos_e_ferramentas,
    fique_atento: `Referências: ${meta.referencias.slice(0, 4).join("; ")}.`,
    aplicabilidade_privacidade:
      "Articular com o diagnóstico de Privacidade (LGPD) quando o sistema de IA tratar dados pessoais ou decisões automatizadas.",
  });
  for (const m of c.medidas) {
    medidaRows.push(
      `  (${medidaId}, ${sqlEscape(m.id_medida)}, ${c.id}, NULL, ${sqlEscape(m.grupo_imple)}, ${sqlEscape(m.funcao_nist)}, ${sqlEscape(m.medida)}, ${sqlEscape(m.descricao)})`
    );
    medidaId += 1;
  }
}

const lastMedidaId = medidaId - 1;
const totalMedidas = lastMedidaId - 210;

const sql = `-- Diagnóstico 4: Governança de IA / AIGP (catálogo complementar ao PPSI 2.0)
-- Fonte: docs/aigp/catalogo_aigp_v1.json
-- Controles ids ${controles[0].id}–${controles[controles.length - 1].id}; medidas ids 211–${lastMedidaId} (${totalMedidas} medidas).
-- Escala de resposta: mesma de Segurança/Privacidade (1–6). Índice: ${meta.indice}.
-- NÃO apaga catálogo PPSI existente.

INSERT INTO public.diagnostico (id, descricao, cor, indice, maturidade)
VALUES (${meta.diagnostico_id}, ${sqlEscape(meta.descricao_curta)}, ${sqlEscape(meta.cor)}, ${sqlEscape(meta.indice)}, NULL)
ON CONFLICT (id) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  cor = EXCLUDED.cor,
  indice = EXCLUDED.indice;

INSERT INTO public.controle (id, numero, diagnostico, nome) VALUES
${controleRows.join(",\n")}
ON CONFLICT (id) DO UPDATE SET
  numero = EXCLUDED.numero,
  diagnostico = EXCLUDED.diagnostico,
  nome = EXCLUDED.nome;

INSERT INTO public.medida (id, id_medida, id_controle, id_cisv8, grupo_imple, funcao_nist_csf, medida, descricao) VALUES
${medidaRows.join(",\n")}
ON CONFLICT (id) DO UPDATE SET
  id_medida = EXCLUDED.id_medida,
  id_controle = EXCLUDED.id_controle,
  grupo_imple = EXCLUDED.grupo_imple,
  funcao_nist_csf = EXCLUDED.funcao_nist_csf,
  medida = EXCLUDED.medida,
  descricao = EXCLUDED.descricao;

-- Backfill programa_controle para programas que já tinham registros (ensure só cria se vazio)
INSERT INTO public.programa_controle (programa, controle, nivel)
SELECT p.id, c.id, 1
FROM public.programa p
CROSS JOIN public.controle c
WHERE c.diagnostico = ${meta.diagnostico_id}
  AND NOT EXISTS (
    SELECT 1 FROM public.programa_controle pc
    WHERE pc.programa = p.id AND pc.controle = c.id
  );

-- Backfill programa_medida (ensure já cria faltantes; reforço na migration)
INSERT INTO public.programa_medida (programa, medida)
SELECT p.id, m.id
FROM public.programa p
CROSS JOIN public.medida m
JOIN public.controle c ON c.id = m.id_controle
WHERE c.diagnostico = ${meta.diagnostico_id}
  AND NOT EXISTS (
    SELECT 1 FROM public.programa_medida pm
    WHERE pm.programa = p.id AND pm.medida = m.id
  );

-- View de maturidade: incluir diagnóstico 4 na escala 1–6 e média simples dos controles
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
      WHEN resposta_num = 6 THEN NULL
      WHEN diagnostico_id = 1 THEN
        CASE resposta_num WHEN 1 THEN 1.0 WHEN 2 THEN 0.0 ELSE 0.0 END
      WHEN diagnostico_id IN (2, 3, 4) THEN
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
    COUNT(*)::numeric AS total_medidas
  FROM pm_resposta
  WHERE resposta_num IS DISTINCT FROM 6
  GROUP BY programa_id, controle_id, diagnostico_id, controle_numero
),
controle_soma AS (
  SELECT
    programa_id,
    controle_id,
    diagnostico_id,
    controle_numero,
    COALESCE(SUM(peso), 0)::numeric AS soma_pesos
  FROM medida_peso
  WHERE peso IS NOT NULL
  GROUP BY programa_id, controle_id, diagnostico_id, controle_numero
),
score_controle AS (
  SELECT
    mc.programa_id,
    mc.controle_id,
    mc.diagnostico_id,
    mc.controle_numero,
    pc.nivel AS pc_nivel,
    mc.total_medidas,
    COALESCE(cs.soma_pesos, 0)::numeric AS soma_pesos,
    ( (COALESCE(cs.soma_pesos, 0) / NULLIF(mc.total_medidas, 0)) / 2.0 )
      * ( 1.0 + (CASE COALESCE(pc.nivel, 1)
          WHEN 1 THEN 0 WHEN 2 THEN 1 WHEN 3 THEN 2 WHEN 4 THEN 3 WHEN 5 THEN 4 WHEN 6 THEN 5
          ELSE 0 END)::numeric / 5.0 ) AS score
  FROM medida_count mc
  LEFT JOIN controle_soma cs
    ON cs.programa_id IS NOT DISTINCT FROM mc.programa_id
   AND cs.controle_id IS NOT DISTINCT FROM mc.controle_id
   AND cs.diagnostico_id IS NOT DISTINCT FROM mc.diagnostico_id
   AND cs.controle_numero IS NOT DISTINCT FROM mc.controle_numero
  LEFT JOIN public.programa_controle pc
    ON pc.programa IS NOT DISTINCT FROM mc.programa_id
   AND pc.controle IS NOT DISTINCT FROM mc.controle_id
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
    SUM(score)::numeric AS soma_outros,
    COUNT(*)::bigint AS qtd_outros
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
      -- AIGP / demais: média simples dos controles (sem peso iMC0 do PPSI)
      WHEN d.qtd_outros IS NOT NULL AND d.qtd_outros > 0 THEN
        d.soma_outros / d.qtd_outros
      ELSE COALESCE(i.imc0_score, 0)
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
  LEAST(1.0, GREATEST(0.0, COALESCE(sd.score, 0) * 2.0)) AS score,
  CASE
    WHEN LEAST(1.0, COALESCE(sd.score, 0) * 2.0) >= 0.9 THEN 'Aprimorado'
    WHEN LEAST(1.0, COALESCE(sd.score, 0) * 2.0) >= 0.7 THEN 'Em Aprimoramento'
    WHEN LEAST(1.0, COALESCE(sd.score, 0) * 2.0) >= 0.5 THEN 'Intermediário'
    WHEN LEAST(1.0, COALESCE(sd.score, 0) * 2.0) >= 0.3 THEN 'Básico'
    ELSE 'Inicial'
  END AS label
FROM base b
LEFT JOIN score_diag sd ON sd.programa_id = b.programa_id AND sd.diagnostico_id = b.diagnostico_id
WHERE b.programa_id IS NOT NULL AND b.diagnostico_id IS NOT NULL;

COMMENT ON VIEW public.programa_diagnostico_maturidade IS
  'Maturidade por programa/diagnóstico. Diags 1–3: fórmulas PPSI; diag 4 (AIGP): média dos controles ×2 (alinhado à UI).';

GRANT SELECT ON public.programa_diagnostico_maturidade TO anon;
GRANT SELECT ON public.programa_diagnostico_maturidade TO authenticated;
`;

fs.writeFileSync(migrationPath, sql, "utf8");
console.log("Wrote", migrationPath);

const controlesJson = JSON.parse(fs.readFileSync(controlesJsonPath, "utf8"));
const existingIds = new Set(controlesJson.controles.map((c) => c.id));
for (const jc of jsonControles) {
  if (existingIds.has(jc.id)) {
    const idx = controlesJson.controles.findIndex((c) => c.id === jc.id);
    controlesJson.controles[idx] = jc;
  } else {
    controlesJson.controles.push(jc);
  }
}
fs.writeFileSync(controlesJsonPath, JSON.stringify(controlesJson, null, 2) + "\n", "utf8");
console.log("Updated controles.json with", jsonControles.length, "AIGP controles");

fs.writeFileSync(
  medidasMetaPath,
  JSON.stringify(
    {
      total_medidas_catalogo_ppsi_20: 210,
      total_medidas_catalogo_aigp_v1: totalMedidas,
      total_medidas_catalogo: 210 + totalMedidas,
      nota: "Medidas PPSI na tabela public.medida (ids 1–210); AIGP ids 211–" + lastMedidaId + ". Este ficheiro mantém totais para a landing.",
    },
    null,
    2
  ) + "\n",
  "utf8"
);
console.log("Updated medidas.json: AIGP", totalMedidas, "medidas");
