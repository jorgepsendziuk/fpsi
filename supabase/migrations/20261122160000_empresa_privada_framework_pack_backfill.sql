-- Backfill: programas empresa privada (setor <> 1) → catálogo framework em vez de PPSI 2.0
-- Não altera órgãos públicos (setor = 1).
-- Mapeamento: controle_ppsi.id + 1000 = controle_framework.id; medida_ppsi.id + 10000 = medida_framework.id

-- 1) Remover duplicatas em programa_controle (mantém menor id)
DELETE FROM public.programa_controle AS a
USING public.programa_controle AS b
INNER JOIN public.programa p ON p.id = a.programa
WHERE a.programa = b.programa
  AND a.controle = b.controle
  AND a.id > b.id
  AND p.setor IS DISTINCT FROM 1;

-- 2) Garantir vínculos framework com mesmo nivel do PPSI (antes de apagar PPSI)
INSERT INTO public.programa_controle (programa, controle, nivel)
SELECT DISTINCT p.id, c_fw.id, COALESCE(pc.nivel, 1)
FROM public.programa p
INNER JOIN public.programa_controle pc ON pc.programa = p.id
INNER JOIN public.controle c_ppsi ON c_ppsi.id = pc.controle AND c_ppsi.pack_id = 'ppsi-2.0'
INNER JOIN public.controle c_fw
  ON c_fw.pack_id = 'framework'
  AND c_fw.numero = c_ppsi.numero
  AND c_fw.diagnostico = c_ppsi.diagnostico
WHERE p.setor IS DISTINCT FROM 1
  AND NOT EXISTS (
    SELECT 1
    FROM public.programa_controle pc2
    WHERE pc2.programa = p.id AND pc2.controle = c_fw.id
  );

-- 3) Remover vínculos programa_controle → controles PPSI (eixos 1–3) em empresas
DELETE FROM public.programa_controle pc
USING public.programa p, public.controle c
WHERE pc.programa = p.id
  AND pc.controle = c.id
  AND p.setor IS DISTINCT FROM 1
  AND c.pack_id = 'ppsi-2.0';

-- 4) programa_medida: mesclar respostas PPSI → framework quando já existe linha framework
UPDATE public.programa_medida pm_fw
SET
  resposta = COALESCE(NULLIF(TRIM(pm_fw.resposta), ''), pm_old.resposta),
  justificativa = COALESCE(NULLIF(TRIM(pm_fw.justificativa), ''), pm_old.justificativa),
  observacao_orgao = COALESCE(NULLIF(TRIM(pm_fw.observacao_orgao), ''), pm_old.observacao_orgao),
  nova_resposta = COALESCE(NULLIF(TRIM(pm_fw.nova_resposta), ''), pm_old.nova_resposta),
  encaminhamento_interno = COALESCE(NULLIF(TRIM(pm_fw.encaminhamento_interno), ''), pm_old.encaminhamento_interno),
  responsavel = COALESCE(pm_fw.responsavel, pm_old.responsavel),
  previsao_inicio = COALESCE(pm_fw.previsao_inicio, pm_old.previsao_inicio),
  previsao_fim = COALESCE(pm_fw.previsao_fim, pm_old.previsao_fim),
  status_medida = COALESCE(pm_fw.status_medida, pm_old.status_medida),
  status_plano_acao = COALESCE(pm_fw.status_plano_acao, pm_old.status_plano_acao),
  controle = COALESCE(
    pm_fw.controle,
    CASE
      WHEN pm_old.controle IS NOT NULL AND pm_old.controle <= 27 THEN pm_old.controle + 1000
      ELSE pm_old.controle
    END
  )
FROM public.programa_medida pm_old
INNER JOIN public.programa p ON p.id = pm_old.programa
WHERE pm_fw.programa = pm_old.programa
  AND pm_fw.medida = pm_old.medida + 10000
  AND pm_old.medida BETWEEN 1 AND 210
  AND p.setor IS DISTINCT FROM 1;

-- 5) Criar linhas framework a partir do PPSI quando ainda não existem
INSERT INTO public.programa_medida (
  programa,
  medida,
  resposta,
  justificativa,
  observacao_orgao,
  responsavel,
  previsao_inicio,
  previsao_fim,
  status_medida,
  nova_resposta,
  encaminhamento_interno,
  controle,
  status_plano_acao
)
SELECT
  pm.programa,
  pm.medida + 10000,
  pm.resposta,
  pm.justificativa,
  pm.observacao_orgao,
  pm.responsavel,
  pm.previsao_inicio,
  pm.previsao_fim,
  pm.status_medida,
  pm.nova_resposta,
  pm.encaminhamento_interno,
  CASE
    WHEN pm.controle IS NOT NULL AND pm.controle <= 27 THEN pm.controle + 1000
    ELSE pm.controle
  END,
  pm.status_plano_acao
FROM public.programa_medida pm
INNER JOIN public.programa p ON p.id = pm.programa
WHERE p.setor IS DISTINCT FROM 1
  AND pm.medida BETWEEN 1 AND 210
  AND NOT EXISTS (
    SELECT 1
    FROM public.programa_medida pm2
    WHERE pm2.programa = pm.programa AND pm2.medida = pm.medida + 10000
  );

-- 6) Remover respostas ligadas a medidas PPSI (eixos 1–3) em empresas
DELETE FROM public.programa_medida pm
USING public.programa p
WHERE pm.programa = p.id
  AND p.setor IS DISTINCT FROM 1
  AND pm.medida BETWEEN 1 AND 210;