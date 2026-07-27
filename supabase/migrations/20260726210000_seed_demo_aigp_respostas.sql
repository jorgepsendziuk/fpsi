-- Demo: respostas didáticas para diagnóstico 4 (Governança de IA / iAIGP)
-- Medidas criadas após seed_demo_placeholder — backfill de respostas no programa demo.

DO $$
DECLARE
  pid INTEGER;
  id_enc INTEGER;
  id_ti INTEGER;
  id_rh INTEGER;
  id_alta INTEGER;
  id_int INTEGER;
BEGIN
  SELECT id INTO pid FROM public.programa
  WHERE slug IN ('demo', 'demonstracao')
  ORDER BY CASE WHEN slug = 'demo' THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.programa WHERE id = 1 LIMIT 1;
  END IF;

  IF pid IS NULL THEN
    RAISE NOTICE 'seed_demo_aigp_respostas: nenhum programa demo; nada feito.';
    RETURN;
  END IF;

  INSERT INTO public.programa_controle (controle, programa, nivel)
  SELECT c.id, pid, 1 + mod(abs(hashtext(concat(c.id::text, 'demo_aigp_incc'))), 6)
  FROM public.controle c
  WHERE c.diagnostico = 4
    AND NOT EXISTS (
      SELECT 1 FROM public.programa_controle pc
      WHERE pc.programa = pid AND pc.controle = c.id
    );

  INSERT INTO public.programa_medida (programa, medida, controle, resposta, prioridade)
  SELECT pid, m.id, m.id_controle, NULL, false
  FROM public.medida m
  JOIN public.controle c ON c.id = m.id_controle
  WHERE c.diagnostico = 4
    AND NOT EXISTS (
      SELECT 1 FROM public.programa_medida pm
      WHERE pm.programa = pid AND pm.medida = m.id
    );

  SELECT id INTO id_enc FROM public.responsavel
  WHERE programa = pid AND (nome ILIKE '%Carla Mendes%' OR email = 'dpo.demo@fpsi.local')
  LIMIT 1;
  SELECT id INTO id_ti FROM public.responsavel
  WHERE programa = pid AND (nome ILIKE '%Roberto Alves%' OR email = 'ti.demo@fpsi.local')
  LIMIT 1;
  SELECT id INTO id_rh FROM public.responsavel
  WHERE programa = pid AND (nome ILIKE '%Fernanda Costa%' OR email = 'rh.demo@fpsi.local')
  LIMIT 1;
  SELECT id INTO id_alta FROM public.responsavel
  WHERE programa = pid AND (nome ILIKE '%Paulo Ribeiro%' OR email = 'diretoria.demo@fpsi.local')
  LIMIT 1;
  SELECT id INTO id_int FROM public.responsavel
  WHERE programa = pid AND (nome ILIKE '%Juliana Prado%' OR email = 'integridade.demo@fpsi.local')
  LIMIT 1;

  CREATE TEMP TABLE _demo_aigp (id_medida text PRIMARY KEY, resposta int, justificativa text) ON COMMIT DROP;

  INSERT INTO _demo_aigp (id_medida, resposta, justificativa) VALUES
  ('26.1', 3, '[Demo] Accountability de IA: DPO (Carla Mendes) e diretoria (Paulo Ribeiro) com mandato informal; formalização em curso.'),
  ('26.2', 3, '[Demo] IA na pauta do CSI/CPDP e ETIR do escritório de governança FPSI; atas registradas trimestralmente.'),
  ('26.3', 3, '[Demo] RACI em elaboração entre negócio, TI, privacidade, SI e jurídico (Juliana Prado).'),
  ('26.4', 2, '[Demo] Escalonamento de riscos de IA via DPO e canal de incidentes; relatório executivo semestral.'),
  ('26.5', 3, '[Demo] Riscos de IA registrados no módulo Gestão de Riscos; integração com PPSI em andamento.'),
  ('27.1', 3, '[Demo] Inventário parcial: copilots (CRM, suporte), assistência IA no FPSI e APIs OpenAI mapeadas em planilha+ROPA.'),
  ('27.2', 3, '[Demo] Donos de negócio definidos para CRM e RH; ferramentas ad hoc ainda sem owner formal.'),
  ('27.3', 3, '[Demo] Critérios de risco/impacto documentados em rascunho (baixo/moderado/alto).'),
  ('27.4', 2, '[Demo] Vínculo inventário IA ↔ ROPA/mapeamento para operações principais (RH, CRM, biometria).'),
  ('27.5', 4, '[Demo] Gate de onboarding de IA antes de produção ainda informal; TI exige ticket para novos SaaS.'),
  ('28.1', 4, '[Demo] Política de IA responsável em elaboração; POSIN e PGP já publicadas no FPSI.'),
  ('28.2', 3, '[Demo] Diretrizes de GenAI: não colar dados pessoais em copilots; revisão humana de comunicações externas.'),
  ('28.3', 3, '[Demo] Onboarding e treinamento anual citam uso responsável de IA; aceite registrado no RH digital.'),
  ('28.4', 4, '[Demo] Revisão anual da política de IA prevista; gatilho por mudança regulatória (EU AI Act) monitorado pelo DPO.'),
  ('28.5', 3, '[Demo] Lista de usos restritos (decisão automatizada sem revisão, dados sensíveis em LLM público) comunicada internamente.'),
  ('29.1', 3, '[Demo] Avaliação de risco antes de produção para CRM scoring e biometria; demais casos proporcionais.'),
  ('29.2', 4, '[Demo] Métricas de desempenho básicas; fairness/robustez apenas para sistemas de maior impacto.'),
  ('29.3', 3, '[Demo] Riscos residuais de IA acompanhados na matriz P×I e plano de ação do programa.'),
  ('29.4', 3, '[Demo] RIPD para biometria e campanhas; AIPD/FRIA considerada em projetos de scoring comercial.'),
  ('29.5', 4, '[Demo] Reavaliação após mudança de modelo/dados ainda ad hoc; revisão calendárica anual.'),
  ('29.6', 4, '[Demo] Appetite de risco de IA não formalizado; go/no-go por comitê informal.'),
  ('30.1', 2, '[Demo] Bases legais e finalidades de IA com dados pessoais registradas no ROPA (assistência, suporte, marketing).'),
  ('30.2', 3, '[Demo] Minimização aplicada em prompts de suporte; evitar dados sensíveis em ferramentas GenAI públicas.'),
  ('30.3', 3, '[Demo] Retenção de logs de IA alinhada à política de logs SI (6 meses); acesso restrito à TI/DPO.'),
  ('30.4', 3, '[Demo] Revisão humana disponível para decisões automatizadas de triagem de suporte; art. 20 LGPD em comunicação ao titular.'),
  ('30.5', 3, '[Demo] RIPD exigido antes de deploy para biometria e perfilamento comercial de alto impacto.'),
  ('30.6', 2, '[Demo] DPAs com cloud, folha e CRM; cláusulas de IA/no-training em negociação com fornecedor de copiloto.'),
  ('31.1', 3, '[Demo] Aviso de uso de chatbot no portal de titulares e FAQ interno; marketing revisa peças assistidas por IA.'),
  ('31.2', 4, '[Demo] Explicabilidade limitada a fatores principais em scoring comercial; não exige white-box.'),
  ('31.3', 2, '[Demo] Canal de pedidos LGPD/ouvidoria para contestação; integração com fluxo de titulares no portal demo.'),
  ('31.4', 4, '[Demo] Disclosure de conteúdo sintético em marketing ainda inconsistente; política em revisão.'),
  ('31.5', 5, '[Demo] Model cards não mantidos para sistemas de baixo impacto; backlog para CRM scoring.'),
  ('32.1', 3, '[Demo] RBAC em repositórios de código e chaves de API; datasets de ML com acesso restrito à TI.'),
  ('32.2', 4, '[Demo] Monitoramento de erros em produção; drift de modelo não monitorado sistematicamente.'),
  ('32.3', 4, '[Demo] Testes de prompt injection/jailbreak pontuais antes de releases de chatbot interno.'),
  ('32.4', 3, '[Demo] Incidentes de IA tratados no plano de resposta e registro de incidentes demo (phishing, vazamento planilha).'),
  ('32.5', 5, '[Demo] Kill switch formal não implementado; desligamento manual via provedor cloud.'),
  ('32.6', 3, '[Demo] Ambientes de experimentação separados; datasets de dev mascarados quando possível.'),
  ('33.1', 3, '[Demo] Due diligence de IA para OpenAI/CRM; checklist de privacidade e segurança.'),
  ('33.2', 3, '[Demo] Tier enterprise/no-training avaliado para assistente de suporte; decisão documentada pelo DPO.'),
  ('33.3', 4, '[Demo] Acompanhamento de changelogs de fornecedor ad hoc; sem processo formal de reavaliação.'),
  ('33.4', 3, '[Demo] IA embutida identificada em CRM, folha e antimalware; inventário parcial.'),
  ('33.5', 4, '[Demo] Plano de exit com exportação de dados previsto em DPAs; portabilidade de embeddings não tratada.'),
  ('34.1', 4, '[Demo] Mapeamento de grupos impactados em scoring comercial; avaliação qualitativa de discriminação.'),
  ('34.2', 4, '[Demo] Testes de viés pontuais em campanhas de marketing; método documentado em RIPD.'),
  ('34.3', 3, '[Demo] Supervisão humana significativa em triagem de suporte e admissões sensíveis.'),
  ('34.4', 3, '[Demo] Reclamações via ouvidoria e portal; fluxo integrado ao DPO para casos com IA.'),
  ('34.5', 4, '[Demo] Uso de IA em avaliação de desempenho não implementado; monitoramento de colaboradores restrito.'),
  ('35.1', 4, '[Demo] Gate formal de aprovação de IA relevante em definição; checklist PPSI+LGPD usado ad hoc.'),
  ('35.2', 3, '[Demo] Versionamento de prompts/modelos críticos via Git; nem todos os sistemas cobertos.'),
  ('35.3', 3, '[Demo] Capacitação anual de privacidade inclui módulo GenAI; trilha técnica para desenvolvedores planejada.'),
  ('35.4', 4, '[Demo] Auditoria interna de governança de IA não calendarizada; iAIGP acompanhado no FPSI.'),
  ('35.5', 4, '[Demo] Checklist de descontinuação parcial; revogação de chaves API manual.'),
  ('35.6', 3, '[Demo] KPIs: % inventário IA, respostas iAIGP e incidentes — visíveis no diagnóstico FPSI.');

  UPDATE public.programa_medida pm
  SET
    resposta = COALESCE(
      d.resposta::text,
      (1 + mod(abs(hashtext(concat(pm.id::text, 'demo_aigp_r'))), 4))::text
    ),
    justificativa = COALESCE(
      d.justificativa,
      '[Demo] Empresa Demo Tech: resposta sintética para exercício do índice iAIGP e relatórios.'
    ),
    responsavel = CASE mod(abs(hashtext(concat(pm.id::text, 'demo_aigp_resp'))), 5)
      WHEN 0 THEN id_enc WHEN 1 THEN id_ti WHEN 2 THEN id_rh WHEN 3 THEN id_alta ELSE id_int
    END,
    prioridade = (mod(abs(hashtext(concat(pm.id::text, 'demo_aigp_pri'))), 10) = 0),
    previsao_inicio = COALESCE(
      pm.previsao_inicio,
      CURRENT_DATE - (mod(abs(hashtext(concat(pm.id::text, 'demo_aigp_pi'))), 60))
    ),
    previsao_fim = COALESCE(
      pm.previsao_fim,
      CURRENT_DATE + (20 + mod(abs(hashtext(concat(pm.id::text, 'demo_aigp_pf'))), 120))
    )
  FROM public.medida m
  JOIN public.controle c ON c.id = m.id_controle
  LEFT JOIN _demo_aigp d ON d.id_medida = m.id_medida
  WHERE pm.programa = pid
    AND pm.medida = m.id
    AND c.diagnostico = 4;

  RAISE NOTICE 'seed_demo_aigp_respostas: concluído para programa_id=%', pid;
END $$;
