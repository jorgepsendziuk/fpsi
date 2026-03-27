-- ============================================
-- Mesmo seed de 20260326130200 para o programa id=1 (fallback DEMO_PROGRAMA no código).
-- Idempotente: prefixos "Demo FPSI —" e protocolos PT-DEMO-{id}-*.
-- ============================================

DO $$
DECLARE
  pid INTEGER;
  rid INTEGER;
  id_enc INTEGER;
  id_ti INTEGER;
  id_rh INTEGER;
  ropa_portal INTEGER;
  ropa_crm INTEGER;
  ropa_bio INTEGER;
BEGIN
  pid := 1;

  IF NOT EXISTS (SELECT 1 FROM public.programa WHERE id = pid) THEN
    RAISE NOTICE 'seed_demo_completo_id1: programa id=1 não existe; nada feito.';
    RETURN;
  END IF;

  RAISE NOTICE 'seed_demo_completo_id1: programa_id=%', pid;

  -- Pedidos titulares demo
  DELETE FROM public.pedido_titular
  WHERE programa_id = pid AND protocolo LIKE 'PT-DEMO-%';

  -- RIPD referencia ropa
  DELETE FROM public.ripd
  WHERE programa_id = pid AND titulo LIKE 'Demo FPSI —%';

  DELETE FROM public.ropa
  WHERE programa_id = pid AND nome LIKE 'Demo FPSI —%';

  DELETE FROM public.mapeamento_dados
  WHERE programa_id = pid AND nome LIKE 'Demo FPSI —%';

  DELETE FROM public.responsavel
  WHERE programa = pid AND nome LIKE 'Demo FPSI —%';

  -- Responsáveis sintéticos (medidas / telas)
  INSERT INTO public.responsavel (programa, nome, departamento, email)
  VALUES
    (pid, 'Demo FPSI — Encarregado LGPD (DPO)', 'Privacidade e Compliance', 'dpo.demo@fpsi.local'),
    (pid, 'Demo FPSI — Gestão de TI', 'Tecnologia da Informação', 'ti.demo@fpsi.local'),
    (pid, 'Demo FPSI — RH Digital', 'Recursos Humanos', 'rh.demo@fpsi.local');

  SELECT id INTO id_enc FROM public.responsavel WHERE programa = pid AND nome = 'Demo FPSI — Encarregado LGPD (DPO)' LIMIT 1;
  SELECT id INTO id_ti FROM public.responsavel WHERE programa = pid AND nome = 'Demo FPSI — Gestão de TI' LIMIT 1;
  SELECT id INTO id_rh FROM public.responsavel WHERE programa = pid AND nome = 'Demo FPSI — RH Digital' LIMIT 1;

  -- Registro ROPA (cabeçalho ANPD)
  INSERT INTO public.registro_ropa (
    programa_id,
    organizacao,
    cnpj,
    endereco,
    atividade_principal,
    gestor_responsavel,
    email,
    telefone,
    data_registro,
    categorias_titulares,
    medidas_seguranca,
    tipos_dados_pessoais,
    outros_dados_pessoais,
    compartilhamento,
    periodo_armazenamento,
    observacoes
  ) VALUES (
    pid,
    'Empresa Demo Tech Ltda (ambiente de demonstração FPSI)',
    '12.345.678/0001-99',
    'Av. Exemplo, 1000 — São Paulo/SP',
    'Desenvolvimento de software e consultoria em governança de dados (dados fictícios).',
    'Demo FPSI — Encarregado LGPD (DPO)',
    'privacidade.demo@fpsi.local',
    '(11) 3000-0000',
    CURRENT_DATE,
    '["titulares_em_geral","criancas_adolescentes"]'::jsonb,
    'HTTPS obrigatório, MFA para administradores, segregação de ambientes, backups diários, registro de acessos, classificação de dados.',
    '["nome","email","cpf","telefone","endereco"]'::jsonb,
    'Em demonstração: perfis comportamentais agregados e logs técnicos sem identificação direta.',
    'Processadores em nuvem (região Brasil); suporte terceirizado sob contrato e confidencialidade.',
    'Prazo do contrato + 5 anos após término, salvo obrigação legal em contrário.',
    'Dados meramente ilustrativos para testes de interface; não representam operação real.'
  )
  ON CONFLICT (programa_id) DO UPDATE SET
    organizacao = EXCLUDED.organizacao,
    cnpj = EXCLUDED.cnpj,
    endereco = EXCLUDED.endereco,
    atividade_principal = EXCLUDED.atividade_principal,
    gestor_responsavel = EXCLUDED.gestor_responsavel,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    data_registro = COALESCE(public.registro_ropa.data_registro, EXCLUDED.data_registro),
    categorias_titulares = EXCLUDED.categorias_titulares,
    medidas_seguranca = EXCLUDED.medidas_seguranca,
    tipos_dados_pessoais = EXCLUDED.tipos_dados_pessoais,
    outros_dados_pessoais = EXCLUDED.outros_dados_pessoais,
    compartilhamento = EXCLUDED.compartilhamento,
    periodo_armazenamento = EXCLUDED.periodo_armazenamento,
    observacoes = EXCLUDED.observacoes
  RETURNING id INTO rid;

  IF rid IS NULL THEN
    SELECT id INTO rid FROM public.registro_ropa WHERE programa_id = pid LIMIT 1;
  END IF;

  -- Levantamentos de mapeamento
  INSERT INTO public.mapeamento_dados (
    programa_id,
    nome,
    descricao,
    sistemas_ou_fontes,
    setor_area,
    setor_outro,
    finalidade_categoria,
    finalidade_detalhe,
    meios_armazenamento,
    meios_outro,
    tipos_dados,
    tipos_outro,
    fluxo_compartilhamento,
    compartilhamento_detalhe,
    categoria_titular,
    titular_outro,
    transferencia_internacional
  )
  VALUES
  (
    pid,
    'Demo FPSI — Portal do colaborador e folha',
    'Gestão de admissão, benefícios e ponto; dados de identificação e contratuais.',
    'FPSI HR Cloud; integração com banco folha; SSO corporativo.',
    'rh',
    NULL,
    'contratacao',
    NULL,
    '["sistema_interno","nuvem","email_mensageria"]'::jsonb,
    NULL,
    '["identificacao","contato","financeiro"]'::jsonb,
    NULL,
    'apenas_interno',
    NULL,
    'colaborador',
    NULL,
    'nao'
  ),
  (
    pid,
    'Demo FPSI — CRM e prospecção',
    'Cadastro de leads e clientes; histórico comercial e campanhas.',
    'CRM SaaS (região BR); planilhas de apoio; e-mail marketing.',
    'comercial',
    NULL,
    'marketing_rel',
    'Relacionamento com clientes e prospecção B2B.',
    '["site_app","planilha","email_mensageria"]'::jsonb,
    NULL,
    '["identificacao","contato","preferencias"]'::jsonb,
    NULL,
    'empresa_externa',
    'Agência parceira para campanhas (DPA assinado).',
    'cliente',
    NULL,
    'nao'
  ),
  (
    pid,
    'Demo FPSI — Suporte e ouvidoria',
    'Tickets, gravações de chamadas (opt-in) e pesquisas de satisfação.',
    'Central de suporte; ferramenta de pesquisa; gravação em nuvem.',
    'atendimento',
    NULL,
    'atendimento_titular',
    NULL,
    '["sistema_interno","nuvem"]'::jsonb,
    NULL,
    '["identificacao","contato","preferencias"]'::jsonb,
    'Gravação de voz com consentimento quando aplicável.',
    'apenas_interno',
    NULL,
    'cliente',
    NULL,
    'nao'
  ),
  (
    pid,
    'Demo FPSI — Biometria e controle de acesso físico',
    'Leitores de digital e catracas em filiais; eventos de acesso.',
    'Sistema de PACS; controladora de acesso; servidores locais.',
    'operacoes',
    NULL,
    'seguranca',
    'Controle de acesso a instalações e auditoria de entradas.',
    '["sistema_interno","papel"]'::jsonb,
    NULL,
    '["identificacao","saude"]'::jsonb,
    'Dados biométricos para acesso (template criptografado).',
    'apenas_interno',
    NULL,
    'colaborador',
    NULL,
    'nao'
  );

  -- Operações ROPA (vinculadas ao registro e, quando possível, ao mapeamento)
  INSERT INTO public.ropa (
    programa_id,
    registro_ropa_id,
    mapeamento_id,
    nome,
    finalidade,
    base_legal,
    categorias_dados,
    categorias_titulares,
    compartilhamento,
    retencao,
    medidas_seguranca,
    responsavel
  )
  SELECT
    pid,
    rid,
    m.id,
    'Demo FPSI — Portal do colaborador e folha',
    'Execução do contrato de trabalho, benefícios, ponto eletrônico e obrigações legais trabalhistas.',
    'Execução de contrato e obrigação legal (CLT, eSocial)',
    'Nome, CPF, dados bancários, contato, dependentes, jornada.',
    'Colaboradores ativos e inativos recentes.',
    'Operador de folha (subcontratado, Brasil); não há transferência internacional.',
    'Mandato legal + 5 anos após desligamento, conforme política interna.',
    'Criptografia em trânsito, perfis de acesso, segregação de dados sensíveis.',
    'Demo FPSI — RH Digital'
  FROM public.mapeamento_dados m
  WHERE m.programa_id = pid AND m.nome = 'Demo FPSI — Portal do colaborador e folha'
  LIMIT 1
  RETURNING id INTO ropa_portal;

  INSERT INTO public.ropa (
    programa_id,
    registro_ropa_id,
    mapeamento_id,
    nome,
    finalidade,
    base_legal,
    categorias_dados,
    categorias_titulares,
    compartilhamento,
    retencao,
    medidas_seguranca,
    responsavel
  )
  SELECT
    pid,
    rid,
    m.id,
    'Demo FPSI — CRM e prospecção',
    'Prospecção, relacionamento comercial e envio de comunicações de marketing.',
    'Legítimo interesse e consentimento quando exigido (opt-in em campanhas)',
    'Nome, e-mail, telefone, cargo, histórico de interações.',
    'Clientes, leads e contatos profissionais.',
    'Agência de marketing (DPA); plataforma de e-mail (Brasil).',
    'Até pedido de exclusão ou fim da base legal; inativos após 3 anos sem interação.',
    'Listas de supressão, double opt-in onde aplicável, minimização de dados.',
    NULL
  FROM public.mapeamento_dados m
  WHERE m.programa_id = pid AND m.nome = 'Demo FPSI — CRM e prospecção'
  LIMIT 1
  RETURNING id INTO ropa_crm;

  INSERT INTO public.ropa (
    programa_id,
    registro_ropa_id,
    mapeamento_id,
    nome,
    finalidade,
    base_legal,
    categorias_dados,
    categorias_titulares,
    compartilhamento,
    retencao,
    medidas_seguranca,
    responsavel
  )
  SELECT
    pid,
    rid,
    m.id,
    'Demo FPSI — Biometria e controle de acesso físico',
    'Identificação para entrada em instalações e registro de presença.',
    'Legítimo interesse e proteção da vida/incolumidade em ambientes restritos',
    'Template biométrico, matrícula, data/hora de acesso.',
    'Colaboradores, prestadores e visitantes cadastrados.',
    'Empresa de segurança patrimonial (contrato); sem envio ao exterior.',
    'Templates com vida útil alinhada ao vínculo; revogação ao desligamento.',
    'Armazenamento criptografado, liveness onde disponível, política de retenção.',
    'Demo FPSI — Gestão de TI'
  FROM public.mapeamento_dados m
  WHERE m.programa_id = pid AND m.nome = 'Demo FPSI — Biometria e controle de acesso físico'
  LIMIT 1
  RETURNING id INTO ropa_bio;

  SELECT id INTO ropa_portal FROM public.ropa WHERE programa_id = pid AND nome = 'Demo FPSI — Portal do colaborador e folha' LIMIT 1;
  SELECT id INTO ropa_crm FROM public.ropa WHERE programa_id = pid AND nome = 'Demo FPSI — CRM e prospecção' LIMIT 1;
  SELECT id INTO ropa_bio FROM public.ropa WHERE programa_id = pid AND nome = 'Demo FPSI — Biometria e controle de acesso físico' LIMIT 1;

  INSERT INTO public.ropa (
    programa_id,
    registro_ropa_id,
    mapeamento_id,
    nome,
    finalidade,
    base_legal,
    categorias_dados,
    categorias_titulares,
    compartilhamento,
    retencao,
    medidas_seguranca,
    responsavel
  )
  SELECT
    pid,
    rid,
    m.id,
    'Demo FPSI — Suporte e ouvidoria',
    'Atendimento ao cliente, registro de reclamações e melhoria contínua.',
    'Execução de contrato e tutela do consumidor',
    'Nome, e-mail, telefone, conteúdo do ticket, notas de atendimento.',
    'Titulares que contactam a empresa.',
    'Não compartilhado fora da equipe de suporte e jurídico.',
    '3 anos após encerramento do ticket, salvo litígio.',
    'Acesso autenticado, mascaramento de dados em ambientes de teste.',
    NULL
  FROM public.mapeamento_dados m
  WHERE m.programa_id = pid AND m.nome = 'Demo FPSI — Suporte e ouvidoria'
  LIMIT 1;

  -- RIPD (alto risco — ilustrativo)
  INSERT INTO public.ripd (
    programa_id,
    ropa_id,
    titulo,
    descricao_dados,
    metodologia_coleta_seguranca,
    medidas_salvaguardas_mitigacao,
    conclusao,
    status,
    riscos_tratamento,
    nivel_risco,
    tipos_risco,
    categorias_dados_chaves,
    base_legal_predominante,
    parecer_dpo,
    parecer_dpo_status,
    decisao_controlador
  ) VALUES (
    pid,
    ropa_bio,
    'Demo FPSI — RIPD: biometria e controle de acesso',
    'Templates biométricos, logs de acesso e vínculo com colaborador/prestador.',
    'Coleta presencial com termo de consentimento; transmissão TLS; armazenamento em controladora certificada.',
    'Criptografia, segregação de rede, revisão periódica de leitores, plano de resposta a incidentes.',
    'Tratamento proporcional; alternativas de acesso para quem não usa biometria; monitoramento contínuo.',
    'em_analise',
    'Risco de reutilização indevida do template e de vazamento em integrações físicas.',
    'alto',
    '["vazamento","titulares_vulneraveis","reidentificacao"]'::jsonb,
    '["identificacao","sensiveis_art11"]'::jsonb,
    'legitimo_interesse',
    'Encaminhar reavaliação após testes de penetração no subsistema de acesso.',
    'ressalvas',
    'aceita_com_plano'
  );

  INSERT INTO public.ripd (
    programa_id,
    ropa_id,
    titulo,
    descricao_dados,
    metodologia_coleta_seguranca,
    medidas_salvaguardas_mitigacao,
    conclusao,
    status,
    riscos_tratamento,
    nivel_risco,
    tipos_risco,
    categorias_dados_chaves,
    base_legal_predominante,
    parecer_dpo,
    parecer_dpo_status,
    decisao_controlador
  ) VALUES (
    pid,
    ropa_crm,
    'Demo FPSI — RIPD: perfilamento comercial e campanhas',
    'Histórico de interações, segmentação e dados de contato profissional.',
    'Importação de bases com opt-in onde exigido; APIs com escopo mínimo; logs de consentimento.',
    'Supressão de listas, janela de contato, DPIA de campanhas com alto alcance.',
    'Monitorar taxa de reclamação e revisar critérios de segmentação sensível.',
    'rascunho',
    'Percepção de marketing invasivo e correlação com dados de terceiros.',
    'medio',
    '["discriminacao","decisao_automatizada","vigilancia"]'::jsonb,
    '["identificacao","contato","preferencias"]'::jsonb,
    'legitimo_interesse',
    'Validar base legal para cada fluxo de automação antes de publicação.',
    'conforme',
    'aceita'
  );

  INSERT INTO public.ripd (
    programa_id,
    ropa_id,
    titulo,
    descricao_dados,
    metodologia_coleta_seguranca,
    medidas_salvaguardas_mitigacao,
    conclusao,
    status,
    riscos_tratamento,
    nivel_risco,
    tipos_risco,
    categorias_dados_chaves,
    base_legal_predominante,
    parecer_dpo,
    parecer_dpo_status,
    decisao_controlador
  ) VALUES (
    pid,
    ropa_portal,
    'Demo FPSI — RIPD: folha e dados sensíveis de saúde (benefícios)',
    'Dados de dependentes, coparticipação em plano de saúde e documentos auxiliares.',
    'Coleta via portal autenticado; anexos com antivírus; retenção conforme política de RH.',
    'Minimização (apenas documentos necessários), acesso por perfil, trilha de auditoria.',
    'Manter inventário de bases com dado sensível e revisão semestral.',
    'aprovado',
    'Exposição acidental de documentação de saúde em tickets ou e-mail.',
    'medio',
    '["vazamento","titulares_vulneraveis"]'::jsonb,
    '["saude","identificacao","contato"]'::jsonb,
    'execucao_contrato',
    'Homologado com plano de treinamento anual para RH e TI.',
    'conforme',
    'aceita'
  );

  -- Pedidos de titulares (art. 18) — para telas de conformidade
  INSERT INTO public.pedido_titular (
    programa_id,
    protocolo,
    tipo,
    nome_titular,
    email_titular,
    documento_titular,
    descricao_pedido,
    status,
    data_prazo_resposta,
    data_resposta,
    observacoes_internas,
    origem
  ) VALUES
    (pid, 'PT-DEMO-' || pid::text || '-2026-00001', 'acesso', 'Maria Silva Demo', 'maria.silva.demo@email.test', '***.***.***-**',
     'Solicito cópia dos dados tratados no CRM nos últimos 12 meses.', 'em_analise', CURRENT_DATE + 10, NULL,
     'Demonstração: validar prazo e status na fila.', 'manual'),
    (pid, 'PT-DEMO-' || pid::text || '-2026-00002', 'correcao', 'João Santos Demo', 'joao.santos.demo@email.test', NULL,
     'Corrigir e-mail de contato cadastrado incorretamente.', 'recebido', CURRENT_DATE + 12, NULL, NULL, 'manual'),
    (pid, 'PT-DEMO-' || pid::text || '-2026-00003', 'exclusao', 'Ana Costa Demo', 'ana.costa.demo@email.test', NULL,
     'Pedido de exclusão de cadastro de newsletter.', 'atendido', CURRENT_DATE - 5, NOW() - INTERVAL '2 days',
     'Removido da base de campanhas; confirmação enviada.', 'manual'),
    (pid, 'PT-DEMO-' || pid::text || '-2026-00004', 'portabilidade', 'Carlos Mendes Demo', 'carlos.mendes.demo@email.test', NULL,
     'Portabilidade em formato estruturado (JSON/CSV).', 'parcial', CURRENT_DATE + 3, NULL,
     'Aguardando definição de escopo de sistemas legados.', 'manual'),
    (pid, 'PT-DEMO-' || pid::text || '-2026-00005', 'revogacao_consentimento', 'Fernanda Lima Demo', 'fernanda.lima.demo@email.test', NULL,
     'Revogar consentimento para cookies não essenciais e personalização.', 'recusado', CURRENT_DATE + 7, NULL,
     'Demonstração: cenário de indeferimento com fundamento (base legítima).', 'manual');

  -- Níveis INCC nos controles (variação para maturidade)
  UPDATE public.programa_controle pc
  SET nivel = 1 + mod(abs(hashtext(concat(pc.id::text, 'demo_incc'))), 6)
  WHERE pc.programa = pid;

  -- Respostas de medidas (determinísticas por id — “aleatório” estável)
  UPDATE public.programa_medida pm
  SET
    resposta = (1 + mod(abs(hashtext(concat(pm.id::text, 'demo_r'))), 5))::text,
    nova_resposta = CASE
      WHEN mod(abs(hashtext(concat(pm.id::text, 'demo_n'))), 4) = 0
      THEN 'Comentário demo: evidência anexada no repositório fictício.'
      ELSE pm.nova_resposta
    END,
    justificativa = CASE
      WHEN mod(abs(hashtext(concat(pm.id::text, 'demo_j'))), 3) = 0 OR pm.justificativa IS NULL
      THEN 'Demonstração FPSI: justificativa sintética para exercício de interface e relatórios.'
      ELSE pm.justificativa
    END,
    responsavel = CASE mod(abs(hashtext(concat(pm.id::text, 'demo_resp'))), 3)
      WHEN 0 THEN id_enc
      WHEN 1 THEN id_ti
      ELSE id_rh
    END,
    previsao_inicio = COALESCE(
      pm.previsao_inicio,
      CURRENT_DATE - (mod(abs(hashtext(concat(pm.id::text, 'demo_pi'))), 60))
    ),
    previsao_fim = COALESCE(
      pm.previsao_fim,
      CURRENT_DATE + (10 + mod(abs(hashtext(concat(pm.id::text, 'demo_pf'))), 120))
    )
  WHERE pm.programa = pid
    AND mod(abs(hashtext(concat(pm.id::text, 'demo_sel'))), 10) < 9;

  RAISE NOTICE 'seed_demo_completo_id1: concluído para programa_id=%', pid;
END $$;
