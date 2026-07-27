-- Diagnóstico 4: Governança de IA / AIGP (catálogo complementar ao PPSI 2.0)
-- Fonte: docs/aigp/catalogo_aigp_v1.json
-- Controles ids 28–37; medidas ids 211–264 (54 medidas).
-- Escala de resposta: mesma de Segurança/Privacidade (1–6). Índice: iAIGP.
-- NÃO apaga catálogo PPSI existente.

INSERT INTO public.diagnostico (id, descricao, cor, indice, maturidade)
VALUES (4, 'GOVERNANÇA DE IA', '#C5CAE9', 'iAIGP', NULL)
ON CONFLICT (id) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  cor = EXCLUDED.cor,
  indice = EXCLUDED.indice;

INSERT INTO public.controle (id, numero, diagnostico, nome) VALUES
  (28, 26, 4, 'Governança e accountability de IA'),
  (29, 27, 4, 'Inventário e classificação de sistemas de IA'),
  (30, 28, 4, 'Política e princípios de IA responsável'),
  (31, 29, 4, 'Gestão de riscos de IA'),
  (32, 30, 4, 'Dados, privacidade e LGPD em sistemas de IA'),
  (33, 31, 4, 'Transparência, explicabilidade e direitos'),
  (34, 32, 4, 'Segurança, robustez e monitoramento de modelos'),
  (35, 33, 4, 'Terceiros, fornecedores e modelos fundacionais'),
  (36, 34, 4, 'Viés, equidade e impacto humano'),
  (37, 35, 4, 'Ciclo de vida, documentação e auditoria')
ON CONFLICT (id) DO UPDATE SET
  numero = EXCLUDED.numero,
  diagnostico = EXCLUDED.diagnostico,
  nome = EXCLUDED.nome;

INSERT INTO public.medida (id, id_medida, id_controle, id_cisv8, grupo_imple, funcao_nist_csf, medida, descricao) VALUES
  (211, '26.1', 28, NULL, 'G1', 'GOVERN', 'A alta administração definiu formalmente accountability para sistemas de IA (responsável, substituto e escopo)?', 'Designar formalmente pessoa ou estrutura com mandato para supervisionar o uso de IA na organização, com reporte à alta administração. Alinhado a AIGP (accountability) e ISO/IEC 42001 (leadership).

Normas de referência: NIST AI RMF GOVERN; ISO/IEC 42001.'),
  (212, '26.2', 28, NULL, 'G1', 'GOVERN', 'Há comitê ou fórum colegiado que delibera riscos e prioridades de IA (ou o tema está formalmente na pauta de comitê existente)?', 'Pode ser comitê dedicado ou inclusão explícita na agenda do CSI/CPDP/comitê de riscos. Deve haver ata/registro de deliberações sobre IA de alto impacto.

Normas de referência: NIST AI RMF GOVERN; IAPP AIGP.'),
  (213, '26.3', 28, NULL, 'G1', 'GOVERN', 'Papéis e responsabilidades de negócio, TI, privacidade, segurança e jurídico estão definidos para o ciclo de vida de IA?', 'Usar matriz RACI cobrindo concepção, aquisição, desenvolvimento, operação, monitoramento e desativação. Evitar sobreposição e lacunas.

Normas de referência: ISO/IEC 42001; NIST AI RMF GOVERN.'),
  (214, '26.4', 28, NULL, 'G2', 'GOVERN', 'Existe canal de reporte e escalonamento de riscos/incidentes de IA à alta administração?', 'Definir critérios de escalonamento (impacto a direitos, segurança, reputação, financeiro) e periodicidade de relatório executivo.

Normas de referência: NIST AI RMF GOVERN/MANAGE.'),
  (215, '26.5', 28, NULL, 'G2', 'GOVERN', 'A governança de IA está integrada ao PPSI / gestão de riscos e controles internos da organização?', 'Riscos de IA devem entrar no inventário/matriz de riscos institucional e dialogar com controles PPSI (SI e privacidade), sem silos.

Normas de referência: Decreto nº 9.203/2017 (quando aplicável); NIST AI RMF; PPSI 2.0.'),
  (216, '27.1', 29, NULL, 'G1', 'MAP', 'A organização mantém inventário atualizado de sistemas e usos de IA (incluindo ferramentas SaaS e modelos de terceiros)?', 'Incluir IA generativa, modelos preditivos, visão computacional, chatbots, copilots e APIs de modelos fundacionais usados por áreas.

Normas de referência: NIST AI RMF MAP; ISO/IEC 42001.'),
  (217, '27.2', 29, NULL, 'G1', 'MAP', 'Cada sistema de IA possui dono de negócio e responsável técnico identificados?', 'Sem dono claro, mudanças e incidentes não têm accountability operacional.

Normas de referência: AIGP; ISO/IEC 42001.'),
  (218, '27.3', 29, NULL, 'G1', 'MAP', 'Os sistemas de IA são classificados por nível de risco/impacto (ex.: baixo, moderado, alto) com critérios documentados?', 'Critérios podem considerar direitos fundamentais, decisões sobre pessoas, segurança, escala e uso em setor regulado. Proporcionalidade dos controles deve seguir a classificação.

Normas de referência: EU AI Act (conceito de risco); NIST AI RMF MAP.'),
  (219, '27.4', 29, NULL, 'G2', 'MAP', 'O inventário vincula sistemas de IA a processos de negócio e, quando houver, a tratamentos de dados pessoais (ROPA/mapeamento)?', 'Integração com ROPA e mapeamento PPSI/LGPD evita inventários paralelos inconsistentes.

Normas de referência: LGPD art. 37; PPSI controle de registro de operações.'),
  (220, '27.5', 29, NULL, 'G2', 'MAP', 'Há processo para incluir novos usos de IA no inventário antes da entrada em produção ou uso amplo?', 'Gate de onboarding: nenhum sistema relevante de IA entra em uso sem registro e classificação.

Normas de referência: NIST AI RMF MAP/MANAGE.'),
  (221, '28.1', 30, NULL, 'G1', 'GOVERN', 'A organização possui política (ou norma equivalente) de governança / uso responsável de IA aprovada pela alta administração?', 'Documento formal com escopo, princípios, papéis, usos proibidos ou restritos e ciclo de revisão.

Normas de referência: ISO/IEC 42001; OECD AI Principles; AIGP.'),
  (222, '28.2', 30, NULL, 'G1', 'GOVERN', 'Existem diretrizes específicas para uso de IA generativa e ferramentas de copiloto (dados, propriedade intelectual e confidencialidade)?', 'Cobrir proibição/restrição de colar dados pessoais/sensíveis ou segredos em serviços públicos; regras de citação e revisão humana de saídas.

Normas de referência: AIGP; boas práticas de uso seguro de GenAI.'),
  (223, '28.3', 30, NULL, 'G2', 'GOVERN', 'Os princípios de IA responsável estão comunicados às pessoas que projetam, adquirem ou usam sistemas de IA?', 'Comunicação e capacitação mínima; evidência de ciência/aceitação quando aplicável.

Normas de referência: NIST AI RMF GOVERN; OECD.'),
  (224, '28.4', 30, NULL, 'G2', 'GOVERN', 'Há processo de revisão periódica da política de IA diante de mudanças tecnológicas e regulatórias?', 'Prazo de revisão definido (ex.: anual) ou gatilho por mudança material de risco/regulamentação.

Normas de referência: ISO/IEC 42001.'),
  (225, '28.5', 30, NULL, 'G3', 'GOVERN', 'Usos proibidos ou de alto risco de IA estão explicitamente listados e monitorados?', 'Exemplos: profiling discriminatório sem base legal, vigilância desproporcional, decisões automatizadas sem salvaguardas exigidas.

Normas de referência: LGPD art. 20; EU AI Act (usos proibidos — referência); AIGP.'),
  (226, '29.1', 31, NULL, 'G1', 'MAP', 'Sistemas de IA de risco moderado/alto passam por avaliação de riscos antes da entrada em produção ou uso amplo?', 'Avaliação documentada cobrindo contexto, ameaças, impactos a pessoas/operações e medidas de mitigação.

Normas de referência: NIST AI RMF MAP/MEASURE; ISO/IEC 42001.'),
  (227, '29.2', 31, NULL, 'G2', 'MEASURE', 'Há critérios e métodos para medir riscos de IA (métricas de desempenho, fairness, robustez, segurança) proporcionais ao impacto?', 'Não exige ciência de ponta em todos os casos; exige método documentado e evidências mínimas para o nível de risco.

Normas de referência: NIST AI RMF MEASURE.'),
  (228, '29.3', 31, NULL, 'G1', 'MANAGE', 'Riscos residuais de IA são registrados, priorizados e acompanhados com planos de tratamento?', 'Integração com matriz de riscos / plano de ação do programa.

Normas de referência: NIST AI RMF MANAGE; PPSI planos de ação.'),
  (229, '29.4', 31, NULL, 'G2', 'MAP', 'Para IA com impacto relevante a direitos ou decisões sobre pessoas, há avaliação de impacto específica (AIPD/FRIA ou RIPD ampliado)?', 'Quando houver dados pessoais, articular com RIPD (LGPD). Para impacto a direitos fundamentais, usar avaliação de impacto de IA / fundamental rights.

Normas de referência: LGPD arts. 5º, XVII, e 38; EU AI Act FRIA (referência); AIGP.'),
  (230, '29.5', 31, NULL, 'G2', 'MANAGE', 'Há reassessment de riscos após mudanças materiais no modelo, dados, finalidade ou contexto de uso?', 'Mudança material dispara reavaliação — não apenas revisão calendárica.

Normas de referência: NIST AI RMF MANAGE; ISO/IEC 42001.'),
  (231, '29.6', 31, NULL, 'G3', 'MEASURE', 'A organização define limiares (thresholds) de risco aceitável para IA e critérios de go/no-go?', 'Appetite de risco aprovado; sem limiar, decisões de aceite ficam ad hoc.

Normas de referência: NIST AI RMF; ISO/IEC 42001.'),
  (232, '30.1', 32, NULL, 'G1', 'MAP', 'Tratamentos que usam IA com dados pessoais possuem hipótese legal e finalidade documentadas?', 'Incluir treino, validação, inferência e telemetria. Articular com ROPA.

Normas de referência: LGPD arts. 7º, 11 e 37.'),
  (233, '30.2', 32, NULL, 'G1', 'MANAGE', 'Há minimização de dados e restrição de categorias sensíveis no treino/inferência, salvo necessidade justificada?', 'Evitar uso de dados excessivos; preferir dados sintéticos/anonimizados quando viável.

Normas de referência: LGPD art. 6º, III; boas práticas AIGP.'),
  (234, '30.3', 32, NULL, 'G1', 'MANAGE', 'Prompts, saídas e logs de IA que contenham dados pessoais têm retenção, acesso e descarte definidos?', 'Política de retenção; controle de acesso; proibição de uso de logs como dataset sem análise.

Normas de referência: LGPD arts. 6º e 46; PPSI proteção de dados.'),
  (235, '30.4', 32, NULL, 'G2', 'MANAGE', 'Há salvaguardas para decisões automatizadas que afetem interesses do titular (revisão humana, informação, contestação)?', 'LGPD art. 20: direito à revisão de decisões tomadas unicamente com base em tratamento automatizado.

Normas de referência: LGPD art. 20; AIGP.'),
  (236, '30.5', 32, NULL, 'G2', 'MAP', 'Projetos de IA com alto risco a dados pessoais passam por RIPD (ou equivalente) antes do deploy?', 'Articulação explícita com o módulo de RIPD do programa.

Normas de referência: LGPD art. 38; Resolução ANPD aplicável.'),
  (237, '30.6', 32, NULL, 'G2', 'MANAGE', 'Contratos com fornecedores de IA/processadores cobrem instruções de tratamento, subprocessadores e localização de dados?', 'Cláusulas LGPD + requisitos de IA (uso de dados para treino do fornecedor, opt-out, subprocessadores).

Normas de referência: LGPD arts. 33–36; AIGP vendor management.'),
  (238, '31.1', 33, NULL, 'G1', 'GOVERN', 'Pessoas afetadas são informadas, de forma clara, quando IA é usada em interações ou decisões relevantes?', 'Notice contextual (chatbot, scoring, triagem). Evitar linguagem genérica sem utilidade prática.

Normas de referência: OECD AI Principles; LGPD art. 6º, VI; AIGP.'),
  (239, '31.2', 33, NULL, 'G2', 'MEASURE', 'Para sistemas de alto impacto, há capacidade de explicar fatores relevantes da saída/decisão em linguagem adequada ao público?', 'Explicabilidade proporcional: não exige white-box em todo modelo, mas informação útil para revisão e direitos.

Normas de referência: AIGP; NIST AI RMF; LGPD art. 20.'),
  (240, '31.3', 33, NULL, 'G1', 'MANAGE', 'Há canal para questionar, corrigir ou solicitar revisão humana de decisões assistidas/automatizadas por IA?', 'Integrar ao processo de pedidos de titulares / atendimento.

Normas de referência: LGPD art. 20; AIGP.'),
  (241, '31.4', 33, NULL, 'G2', 'GOVERN', 'Conteúdo gerado por IA destinado ao público é identificado quando isso for material para confiança ou conformidade?', 'Política de disclosure de conteúdo sintético em comunicações oficiais/marketing/atendimento, conforme risco.

Normas de referência: boas práticas AIGP; tendências regulatórias de rotulagem.'),
  (242, '31.5', 33, NULL, 'G3', 'MEASURE', 'A organização mantém documentação de modelo (model card / ficha técnica) para sistemas de risco moderado/alto?', 'Ficha com propósito, dados, limitações, métricas e contato do dono — útil para auditoria e transparência interna.

Normas de referência: NIST AI RMF; práticas de model cards.'),
  (243, '32.1', 34, NULL, 'G1', 'MANAGE', 'Acesso a modelos, datasets de treino e pipelines de ML/IA é controlado e registrado?', 'Princípio do menor privilégio; segregação de ambientes; logs de acesso.

Normas de referência: PPSI controles de acesso; ISO/IEC 42001; NIST AI RMF.'),
  (244, '32.2', 34, NULL, 'G1', 'MEASURE', 'Sistemas de IA em produção possuem monitoramento de desempenho, erros e degradação (drift) com alertas?', 'Métricas e limiares; responsável por receber alertas; ação corretiva.

Normas de referência: NIST AI RMF MEASURE/MANAGE.'),
  (245, '32.3', 34, NULL, 'G2', 'MEASURE', 'Há testes de robustez/segurança proporcionais ao risco (ex.: prompt injection, jailbreak, envenenamento de dados) antes do deploy e periodicamente?', 'Para LLM/apps: OWASP LLM Top 10 como referência mínima.

Normas de referência: OWASP LLM Top 10; NIST AI RMF MEASURE.'),
  (246, '32.4', 34, NULL, 'G2', 'MANAGE', 'Incidentes envolvendo IA (falha, vazamento via modelo, uso abusivo) estão cobertos pelo plano de resposta a incidentes / ETIR?', 'Playbook específico ou extensão do plano existente; comunicação e lições aprendidas.

Normas de referência: PPSI gestão de incidentes; NIST AI RMF MANAGE.'),
  (247, '32.5', 34, NULL, 'G2', 'MANAGE', 'Há procedimento de rollback / desligamento seguro (kill switch) para sistemas de IA de alto impacto?', 'Capacidade de interromper ou degradar graciosamente o sistema quando risco materializar.

Normas de referência: NIST AI RMF MANAGE; ISO/IEC 42001.'),
  (248, '32.6', 34, NULL, 'G3', 'MEASURE', 'Ambientes de treino/experimentação estão isolados de produção e de dados desnecessários?', 'Separação de redes/contas; datasets de dev mascarados quando possível.

Normas de referência: PPSI configuração segura; boas práticas MLOps.'),
  (249, '33.1', 35, NULL, 'G1', 'MAP', 'Há due diligence específica de IA antes de contratar ou adotar fornecedor/modelo fundacional relevante?', 'Avaliar segurança, privacidade, localização, uso de dados para treino, SLAs e histórico de incidentes.

Normas de referência: AIGP; ISO/IEC 42001; PPSI gestão de provedores.'),
  (250, '33.2', 35, NULL, 'G1', 'GOVERN', 'Contratos/ToS deixam claro se dados do órgão podem ser usados para treinar modelos do fornecedor e há opt-out quando necessário?', 'Configurar enterprise tiers com no-training quando disponível; registrar decisão.

Normas de referência: LGPD; boas práticas GenAI enterprise.'),
  (251, '33.3', 35, NULL, 'G2', 'MANAGE', 'Mudanças materiais do fornecedor (modelo, região, subprocessador) são acompanhadas e reavaliadas?', 'Assinar status pages / change logs quando possível; reavaliar risco.

Normas de referência: NIST AI RMF MANAGE.'),
  (252, '33.4', 35, NULL, 'G2', 'MAP', 'Sistemas de terceiros com IA embutida (sem ser o produto principal) estão identificados no inventário?', 'CRM, atendimento, RH, segurança — muitos já usam IA sem label óbvio.

Normas de referência: NIST AI RMF MAP.'),
  (253, '33.5', 35, NULL, 'G3', 'MEASURE', 'Há critérios de saída (exit) e portabilidade/retenção de dados ao encerrar contrato com fornecedor de IA?', 'Plano de descontinuação: exportação, apagamento, transição.

Normas de referência: ISO/IEC 42001; LGPD.'),
  (254, '34.1', 36, NULL, 'G1', 'MAP', 'Para IA que afeta pessoas, a organização identifica grupos potencialmente impactados e riscos de discriminação?', 'Mapeamento de stakeholders e atributos sensíveis ao contexto (sem criar tratamento ilícito de dados sensíveis).

Normas de referência: NIST AI RMF MAP; OECD; LGPD art. 6º, IX.'),
  (255, '34.2', 36, NULL, 'G2', 'MEASURE', 'Há avaliação de viés/equidade (qualitativa ou quantitativa) em sistemas de risco moderado/alto antes do deploy e em operação?', 'Método documentado; não exige perfeição estatística, exige esforço razoável e registro de limitações.

Normas de referência: NIST AI RMF MEASURE; AIGP.'),
  (256, '34.3', 36, NULL, 'G1', 'MANAGE', 'Decisões de alto impacto assistidas por IA contam com supervisão humana significativa (não apenas carimbo formal)?', 'Humano com tempo, informação e autoridade para discordar do modelo.

Normas de referência: LGPD art. 20; EU AI Act human oversight (referência); AIGP.'),
  (257, '34.4', 36, NULL, 'G2', 'MANAGE', 'Há processo para tratar reclamações de discriminação ou dano atribuído a sistema de IA?', 'Fluxo, prazo, análise de causa e mitigação; articulação com ouvidoria/titulares.

Normas de referência: AIGP; LGPD direitos do titular.'),
  (258, '34.5', 36, NULL, 'G3', 'MAP', 'Impactos sobre trabalhadores (monitoramento, avaliação de desempenho por IA) são avaliados com transparência e participação adequada?', 'Quando aplicável: comunicação, limites de uso e revisão humana.

Normas de referência: OECD; boas práticas de workplace AI.'),
  (259, '35.1', 37, NULL, 'G1', 'GOVERN', 'Há estágio formal de aprovação (gate) no ciclo de vida antes do uso produtivo de sistemas de IA relevantes?', 'Checklist de conformidade (risco, privacidade, segurança, transparência) com aprovação registrada.

Normas de referência: ISO/IEC 42001; NIST AI RMF MANAGE.'),
  (260, '35.2', 37, NULL, 'G1', 'GOVERN', 'Mudanças relevantes em modelos/dados/prompts de sistemas críticos são versionadas e auditáveis?', 'Controle de versão + registro de quem aprovou e por quê.

Normas de referência: MLOps; ISO/IEC 42001; PPSI logs/auditoria.'),
  (261, '35.3', 37, NULL, 'G2', 'GOVERN', 'Equipes envolvidas recebem capacitação em riscos e uso responsável de IA adequada ao papel?', 'Trilhas distintas: alta administração, desenvolvedores, usuários de GenAI, privacidade/SI.

Normas de referência: NIST AI RMF GOVERN; AIGP.'),
  (262, '35.4', 37, NULL, 'G2', 'MEASURE', 'Há auditoria ou revisão interna periódica da governança de IA (amostra de sistemas + eficácia dos controles)?', 'Pode integrar auditoria interna / 3ª linha; gerar achados e planos de ação.

Normas de referência: ISO/IEC 42001; AIGP.'),
  (263, '35.5', 37, NULL, 'G2', 'MANAGE', 'Sistemas de IA descontinuados são retirados de forma controlada (acesso, dados, modelos e comunicações)?', 'Checklist de retire: desligar endpoints, revogar chaves, apagar/arquivar dados conforme política.

Normas de referência: NIST AI RMF MANAGE; ISO/IEC 42001.'),
  (264, '35.6', 37, NULL, 'G3', 'GOVERN', 'Indicadores de maturidade/eficácia da governança de IA são acompanhados pela liderança (ex.: % inventário completo, tempo de resposta a incidente de IA)?', 'KPIs simples e acionáveis; o próprio iAIGP deste diagnóstico pode ser um deles.

Normas de referência: ISO/IEC 42001; AIGP.')
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
WHERE c.diagnostico = 4
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
WHERE c.diagnostico = 4
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
