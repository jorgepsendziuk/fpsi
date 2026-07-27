-- Programa institucional FPSI (slug fpsi): respostas didáticas diagnóstico 4 — Governança de IA / iAIGP

DO $$
DECLARE
  pid INTEGER;
  id_dpo INTEGER;
  id_alta INTEGER;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'fpsi' LIMIT 1;

  IF pid IS NULL THEN
    RAISE NOTICE 'seed_fpsi_aigp_respostas: programa slug fpsi não encontrado.';
    RETURN;
  END IF;

  INSERT INTO public.programa_controle (controle, programa, nivel)
  SELECT c.id, pid, 1 + mod(abs(hashtext(concat(c.id::text, 'fpsi_aigp_incc'))), 6)
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

  SELECT id INTO id_dpo FROM public.responsavel
  WHERE programa = pid AND email = 'jorgefrpsendziuk@gmail.com'
  ORDER BY id
  LIMIT 1;

  SELECT id INTO id_alta FROM public.responsavel
  WHERE programa = pid AND nome = 'Representante FPSI'
  LIMIT 1;

  IF id_dpo IS NULL THEN id_dpo := id_alta; END IF;
  IF id_alta IS NULL THEN id_alta := id_dpo; END IF;

  CREATE TEMP TABLE _fpsi_aigp (id_medida text PRIMARY KEY, resposta int, justificativa text) ON COMMIT DROP;

  INSERT INTO _fpsi_aigp (id_medida, resposta, justificativa) VALUES
  ('26.1', 3, '[FPSI] Accountability de IA: DPO/Gestor TIC (Jorge Psendziuk) e representante da alta administração; mandato operacional no programa slug fpsi.'),
  ('26.2', 4, '[FPSI] Operação enxuta sem comitê dedicado; tema de IA tratado na governança do produto e revisões de risco.'),
  ('26.3', 3, '[FPSI] Papéis LGRDC: produto, infra (Supabase/Vercel), DPO e jurídico informal para features com IA.'),
  ('26.4', 3, '[FPSI] Escalonamento via registro de incidentes, riscos (OpenAI internacional) e canal do encarregado.'),
  ('26.5', 3, '[FPSI] Riscos de IA no módulo Gestão de Riscos; iAIGP no diagnóstico integrado ao PPSI da plataforma.'),
  ('27.1', 3, '[FPSI] Inventário: assistência por IA em medidas/evidências, integrações OpenAI, referências AIGP em docs.'),
  ('27.2', 2, '[FPSI] Dono de negócio = LGRDC; responsável técnico definido para pipeline de sugestões IA.'),
  ('27.3', 3, '[FPSI] Classificação por impacto (tenant, dados pessoais, decisão automatizada) em rascunho no catálogo AIGP.'),
  ('27.4', 2, '[FPSI] Vínculo com ROPA do programa FPSI e mapeamento de operações multi-cliente.'),
  ('27.5', 4, '[FPSI] Novas features com IA passam por revisão manual/DPO antes de produção; gate formal em elaboração.'),
  ('28.1', 4, '[FPSI] Política institucional de IA em elaboração; POSIN/privacidade do produto publicadas no portal /fpsi.'),
  ('28.2', 3, '[FPSI] Diretriz: minimizar PII em prompts; validação humana obrigatória nas sugestões automáticas de medidas.'),
  ('28.3', 3, '[FPSI] Documentação interna e docs/aigp comunicam uso responsável de IA no desenvolvimento.'),
  ('28.4', 4, '[FPSI] Revisão anual prevista alinhada a NIST AI RMF / ISO 42001 referenciados no catálogo.'),
  ('28.5', 3, '[FPSI] Usos restritos documentados: sem decisão automatizada sobre titulares sem salvaguardas LGPD.'),
  ('29.1', 3, '[FPSI] Avaliação de risco para endpoint OpenAI e features de sugestão; proporcional ao impacto.'),
  ('29.2', 4, '[FPSI] Métricas básicas de qualidade das sugestões; fairness não aplicável ao escopo atual do produto.'),
  ('29.3', 3, '[FPSI] Risco residual “Transferência internacional — OpenAI” em tratamento na matriz.'),
  ('29.4', 3, '[FPSI] RIPD para operações sensíveis dos clientes; AIPD considerada para evoluções com scoring/IA decisória.'),
  ('29.5', 4, '[FPSI] Reavaliação após mudança de modelo/provedor ainda ad hoc; monitorar changelogs OpenAI.'),
  ('29.6', 4, '[FPSI] Appetite de risco de IA não formalizado por escrito; decisões case a case com DPO.'),
  ('30.1', 2, '[FPSI] Bases legais e finalidades de tratamento com IA documentadas no ROPA do programa FPSI.'),
  ('30.2', 3, '[FPSI] Minimização no envio a APIs de IA; metadados de medidas sem conteúdo desnecessário de titulares.'),
  ('30.3', 3, '[FPSI] Logs de aplicação e retenção Supabase; prompts não persistidos como dataset de treino.'),
  ('30.4', 3, '[FPSI] Art. 20: produto não automatiza decisões sobre titulares finais sem fluxo humano do controlador cliente.'),
  ('30.5', 3, '[FPSI] RIPD módulo disponível; RIPD do próprio FPSI para IA em elaboração conforme evolução do produto.'),
  ('30.6', 2, '[FPSI] OpenAI: avaliar DPA, região e Res. ANPD 19/2024; cláusulas no backlog contratual.'),
  ('31.1', 3, '[FPSI] Portal de titulares e política de privacidade informam tratamento; IA assistiva interna documentada para operadores.'),
  ('31.2', 4, '[FPSI] Explicabilidade limitada: sugestões de medidas com texto justificativo auditável, não modelo opaco ao cliente.'),
  ('31.3', 2, '[FPSI] Pedidos de titulares via portal; contestação de decisões automatizadas responsabilidade do controlador cliente.'),
  ('31.4', 4, '[FPSI] Conteúdo gerado por IA nas sugestões exige revisão humana antes de valer como resposta oficial.'),
  ('31.5', 5, '[FPSI] Model card formal não mantido; documentação técnica em docs/aigp e código.'),
  ('32.1', 3, '[FPSI] RBAC Supabase, RLS multi-tenant, secrets em env; acesso a chaves OpenAI restrito.'),
  ('32.2', 4, '[FPSI] Monitoramento Vercel/logs; drift de modelo N/A (API externa).'),
  ('32.3', 4, '[FPSI] OWASP LLM parcial: validação server-side das sugestões; testes de abuso pontuais.'),
  ('32.4', 3, '[FPSI] Plano de resposta a incidentes e registro de incidentes do programa; extensão para falhas de IA.'),
  ('32.5', 5, '[FPSI] Kill switch: desabilitar feature via config/deploy; sem botão único formalizado.'),
  ('32.6', 3, '[FPSI] Ambientes dev/staging/prod separados; dados de produção não usados em testes de prompt.'),
  ('33.1', 3, '[FPSI] Due diligence OpenAI e Supabase; checklist privacidade antes de novos provedores de IA.'),
  ('33.2', 3, '[FPSI] Preferir tier/API sem treino com dados do cliente quando disponível; decisão documentada.'),
  ('33.3', 4, '[FPSI] Acompanhamento manual de termos e changelogs dos provedores.'),
  ('33.4', 3, '[FPSI] IA embutida mapeada: OpenAI, possíveis copilots de hospedagem; inventário em docs.'),
  ('33.5', 4, '[FPSI] Exit: exportação de dados Supabase; revogação de chaves API documentada.'),
  ('34.1', 4, '[FPSI] Produto B2B: risco de discriminação incide nos modelos/configurações do cliente; orientação na documentação.'),
  ('34.2', 5, '[FPSI] Sem modelos próprios de scoring sobre pessoas; viés de terceiros monitorado genericamente.'),
  ('34.3', 3, '[FPSI] Supervisão humana obrigatória nas sugestões de IA do diagnóstico.'),
  ('34.4', 4, '[FPSI] Reclamações de clientes/titulares via canal DPO; sem ouvidoria dedicada a IA.'),
  ('34.5', 6, '[FPSI] N/A — plataforma não emprega IA para avaliação de desempenho de colaboradores LGRDC.'),
  ('35.1', 4, '[FPSI] Gate de release com checklist LGPD/SI; formalização para features IA em curso.'),
  ('35.2', 3, '[FPSI] Versionamento Git de prompts/regras de sugestão; migrations Supabase auditáveis.'),
  ('35.3', 3, '[FPSI] Capacitação do mantenedor em LGPD/AIGP; material em docs/aigp.'),
  ('35.4', 4, '[FPSI] Auditoria interna de IA não calendarizada; iAIGP acompanhado neste diagnóstico.'),
  ('35.5', 4, '[FPSI] Descontinuação de feature IA via deploy; checklist parcial.'),
  ('35.6', 3, '[FPSI] KPIs: índice iAIGP, cobertura inventário e incidentes IA — visíveis no FPSI.');

  UPDATE public.programa_medida pm
  SET
    resposta = COALESCE(
      d.resposta::text,
      (1 + mod(abs(hashtext(concat(pm.id::text, 'fpsi_aigp_r'))), 4))::text
    ),
    justificativa = COALESCE(
      d.justificativa,
      '[FPSI] Resposta sintética para maturidade iAIGP do programa institucional da plataforma.'
    ),
    responsavel = CASE mod(abs(hashtext(concat(pm.id::text, 'fpsi_aigp_resp'))), 2)
      WHEN 0 THEN id_dpo ELSE id_alta
    END,
    prioridade = (mod(abs(hashtext(concat(pm.id::text, 'fpsi_aigp_pri'))), 12) = 0),
    previsao_inicio = COALESCE(
      pm.previsao_inicio,
      CURRENT_DATE - (mod(abs(hashtext(concat(pm.id::text, 'fpsi_aigp_pi'))), 45))
    ),
    previsao_fim = COALESCE(
      pm.previsao_fim,
      CURRENT_DATE + (30 + mod(abs(hashtext(concat(pm.id::text, 'fpsi_aigp_pf'))), 90))
    ),
    observacao_orgao = COALESCE(
      NULLIF(trim(pm.observacao_orgao), ''),
      'Governança de IA do programa FPSI (jul/2026). Revisar antes de uso como evidência externa.'
    )
  FROM public.medida m
  JOIN public.controle c ON c.id = m.id_controle
  LEFT JOIN _fpsi_aigp d ON d.id_medida = m.id_medida
  WHERE pm.programa = pid
    AND pm.medida = m.id
    AND c.diagnostico = 4;

  RAISE NOTICE 'seed_fpsi_aigp_respostas: concluído para programa_id=% (slug fpsi)', pid;
END $$;
