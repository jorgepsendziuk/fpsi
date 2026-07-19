-- ============================================
-- Demo FPSI: placeholder completo e coerente
-- Empresa, governança, diagnóstico (medidas), políticas, riscos,
-- portal (reportes/contato), incidentes e perfil do usuário demo.
-- Idempotente — prefixo "Demo FPSI —" / PT-DEMO-*.
-- ============================================

DO $$
DECLARE
  pid INTEGER;
  eid INTEGER;
  rid INTEGER;
  id_enc INTEGER;
  id_ti INTEGER;
  id_rh INTEGER;
  id_alta INTEGER;
  id_int INTEGER;
  ropa_count INTEGER;
BEGIN
  SELECT id INTO pid FROM public.programa
  WHERE slug IN ('demo', 'demonstracao')
  ORDER BY CASE WHEN slug = 'demo' THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.programa WHERE id = 1 LIMIT 1;
  END IF;

  IF pid IS NULL THEN
    INSERT INTO public.programa (id, nome, nome_fantasia, razao_social, cnpj, setor, slug, tipo_programa)
    VALUES (1, 'Programa de Demonstração - FPSI', 'Empresa Demo Tech Ltda',
            'DemTech Soluções em Software e Serviços Ltda.', 12345678000199, 2, 'demo', 'empresa_organizacao')
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO pid;
    IF pid IS NULL THEN SELECT id INTO pid FROM public.programa WHERE id = 1; END IF;
  END IF;

  RAISE NOTICE 'seed_demo_placeholder: programa_id=%', pid;

  -- Empresa
  SELECT id INTO eid FROM public.empresa WHERE cnpj = 12345678000199 LIMIT 1;
  IF eid IS NULL THEN
    INSERT INTO public.empresa (cnpj, razao_social, nome_fantasia, endereco, atividade_principal, gestor_responsavel, email, telefone)
    VALUES (
      12345678000199,
      'DemTech Soluções em Software e Serviços Ltda.',
      'Empresa Demo Tech Ltda',
      'Av. Paulista, 1000, Bela Vista — São Paulo/SP — CEP 01310-100',
      'Desenvolvimento de software, SaaS B2B, consultoria em privacidade e segurança da informação.',
      'Carla Mendes — Diretora de Operações',
      'privacidade.demo@fpsi.local',
      '(11) 3000-0000'
    ) RETURNING id INTO eid;
  ELSE
    UPDATE public.empresa SET
      razao_social = 'DemTech Soluções em Software e Serviços Ltda.',
      nome_fantasia = 'Empresa Demo Tech Ltda',
      endereco = 'Av. Paulista, 1000, Bela Vista — São Paulo/SP — CEP 01310-100',
      atividade_principal = 'Desenvolvimento de software, SaaS B2B, consultoria em privacidade e segurança da informação.',
      gestor_responsavel = 'Carla Mendes — Diretora de Operações',
      email = 'privacidade.demo@fpsi.local',
      telefone = '(11) 3000-0000'
    WHERE id = eid;
  END IF;

  -- Programa (identificação, escopo, portal, DPO)
  UPDATE public.programa SET
    nome = 'Programa de Demonstração - FPSI',
    slug = COALESCE(NULLIF(trim(slug), ''), 'demo'),
    tipo_programa = 'empresa_organizacao',
    empresa_id = eid,
    nome_fantasia = 'Empresa Demo Tech Ltda',
    razao_social = 'DemTech Soluções em Software e Serviços Ltda.',
    cnpj = 12345678000199,
    endereco = 'Av. Paulista, 1000, Bela Vista — São Paulo/SP — CEP 01310-100',
    sigla = 'EDT',
    unidade = 'Matriz — Operações digitais (demo)',
    atendimento_email = 'privacidade.demo@fpsi.local',
    atendimento_fone = '(11) 3000-0000',
    atendimento_site = 'https://fpsi.vercel.app/demo',
    descricao_escopo = $txt$
Programa didático da Empresa Demo Tech: simula uma organização de tecnologia com RH, comercial, suporte e infraestrutura. Abrange diagnóstico PPSI 2.0, ROPA, RIPD, pedidos de titulares, portal público e gestão de riscos. Utilize apenas dados fictícios.
$txt$,
    atividade_principal_organizacao = $txt$
Desenvolvimento e licenciamento de plataformas SaaS, integração de sistemas, suporte técnico e consultoria em LGPD para clientes corporativos. Porte médio (~180 colaboradores), atuação nacional B2B.
$txt$,
    dpo_notificacao_email = 'dpo.demo@fpsi.local',
    dpo_ato_designacao_data = COALESCE(dpo_ato_designacao_data, DATE '2024-06-01'),
    dpo_ato_designacao_texto = COALESCE(dpo_ato_designacao_texto,
      'Ato nº 042/2024 — Designação de Carla Mendes como Encarregada pelo Tratamento de Dados Pessoais, com atribuições previstas na LGPD e Resolução ANPD nº 18/2024.'),
    dpo_conflito_interesses_avaliado = true,
    risco_tolerancia_score = 12.0,
    link_politica_privacidade = 'https://fpsi.vercel.app/demo/politica-privacidade',
    link_aviso_titular = 'https://fpsi.vercel.app/demo/aviso-portal-titular',
    link_cookies = 'https://fpsi.vercel.app/demo/cookies',
    politica_inicio_vigencia = COALESCE(politica_inicio_vigencia, DATE '2025-01-15'),
    politica_prazo_revisao = COALESCE(politica_prazo_revisao, DATE '2026-07-15')
  WHERE id = pid;

  -- Responsáveis (limpa e recria demo)
  DELETE FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI —%';

  INSERT INTO public.responsavel (programa, nome, departamento, email, cargo) VALUES
    (pid, 'Demo FPSI — Carla Mendes (DPO)', 'Privacidade e Compliance', 'dpo.demo@fpsi.local', 'Encarregada de Dados Pessoais'),
    (pid, 'Demo FPSI — Roberto Alves (TI)', 'Tecnologia da Informação', 'ti.demo@fpsi.local', 'Gestor de TIC e Segurança da Informação'),
    (pid, 'Demo FPSI — Fernanda Costa (RH)', 'Recursos Humanos', 'rh.demo@fpsi.local', 'Gestora de RH Digital'),
    (pid, 'Demo FPSI — Paulo Ribeiro (Alta Adm.)', 'Diretoria', 'diretoria.demo@fpsi.local', 'Representante da Alta Administração'),
    (pid, 'Demo FPSI — Juliana Prado (Integridade)', 'Compliance', 'integridade.demo@fpsi.local', 'Gestão da Integridade');

  SELECT id INTO id_enc FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Carla Mendes%' LIMIT 1;
  SELECT id INTO id_ti FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Roberto Alves%' LIMIT 1;
  SELECT id INTO id_rh FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Fernanda Costa%' LIMIT 1;
  SELECT id INTO id_alta FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Paulo Ribeiro%' LIMIT 1;
  SELECT id INTO id_int FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Juliana Prado%' LIMIT 1;

  UPDATE public.programa SET
    encarregado_dados_pessoais = id_enc,
    encarregado_substituto = id_ti,
    gestor_tic = id_ti,
    gestor_seguranca_informacao = id_ti,
    representante_alta_administracao = id_alta,
    responsavel_gestao_integridade = id_int
  WHERE id = pid;

  -- Vínculo usuário demo
  INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status)
  SELECT pid, au.id::text, 'admin', '{}'::jsonb, 'accepted'
  FROM auth.users au
  WHERE au.email = 'demo@fpsi.com.br'
    AND NOT EXISTS (
      SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = pid AND pu.user_id = au.id::text
    );

  UPDATE public.profiles SET
    nome = COALESCE(nome, 'Usuário Demonstração FPSI'),
    email = COALESCE(email, 'demo@fpsi.com.br'),
    telefone = COALESCE(telefone, '(11) 99999-0000')
  WHERE email = 'demo@fpsi.com.br';

  -- Diagnóstico: garantir linhas
  INSERT INTO public.programa_controle (controle, programa, nivel)
  SELECT c.id, pid, NULL FROM public.controle c
  WHERE NOT EXISTS (SELECT 1 FROM public.programa_controle pc WHERE pc.programa = pid AND pc.controle = c.id);

  INSERT INTO public.programa_medida (programa, medida, controle, resposta, prioridade)
  SELECT pid, m.id, m.id_controle, NULL, false FROM public.medida m
  WHERE NOT EXISTS (SELECT 1 FROM public.programa_medida pm WHERE pm.programa = pid AND pm.medida = m.id);

  -- Respostas didáticas (governança + privacidade + segurança)
  CREATE TEMP TABLE _demo_diag (id_medida text, resposta int, justificativa text) ON COMMIT DROP;
  TRUNCATE _demo_diag;
  INSERT INTO _demo_diag (id_medida, resposta, justificativa) VALUES
  ('0.1', 1, '[Demo] Representante da alta administração formalmente designado (Paulo Ribeiro).'),
  ('0.2', 1, '[Demo] Gestor de TIC designado (Roberto Alves).'),
  ('0.3', 1, '[Demo] Gestor de SI designado (mesmo gestor TIC — operação integrada).'),
  ('0.4', 1, '[Demo] Encarregada LGPD designada (Carla Mendes) com ato formal registrado.'),
  ('0.5', 1, '[Demo] Responsável pela gestão da integridade (Juliana Prado).'),
  ('0.6', 2, '[Demo] Comitê de SI não instituido — operação enxuta; revisão anual pela diretoria.'),
  ('0.7', 2, '[Demo] Comitê de privacidade informal; DPO reporta à diretoria trimestralmente.'),
  ('0.8', 2, '[Demo] Equipe de resposta a incidentes definida ad hoc; playbook em elaboração.'),
  ('0.9', 3, '[Demo] PGSI em revisão; POSIN e política de dados já publicadas no FPSI.'),
  ('0.10', 3, '[Demo] PGP em elaboração; ROPA e portal de titulares operacionais.'),
  ('0.11', 1, '[Demo] Política de segurança da informação publicada no módulo Políticas.'),
  ('0.12', 1, '[Demo] Política de proteção de dados pessoais vigente.'),
  ('0.13', 3, '[Demo] Registro de riscos no módulo Gestão de Riscos; matriz 5×5 em uso.'),
  ('0.14', 2, '[Demo] Plano de continuidade básico; RTO/RPO não testados formalmente.'),
  ('0.15', 3, '[Demo] Mudanças em produção via Git/CI; CAB informal para releases críticos.'),
  ('0.16', 3, '[Demo] Diagnóstico PPSI anual; auditoria interna parcial via módulo FPSI.'),
  ('0.17', 3, '[Demo] RIPD para operações sensíveis (biometria, marketing); demais em backlog.'),
  ('2.1', 3, '[Demo] Inventário de ativos de software via CMDB parcial + planilha.'),
  ('2.4', 3, '[Demo] Varredura de vulnerabilidades trimestral em aplicações críticas.'),
  ('3.2', 1, '[Demo] Inventário de dados via mapeamento e ROPA atualizados.'),
  ('3.3', 1, '[Demo] Controle de acesso por perfil (RBAC) nos sistemas corporativos.'),
  ('3.8', 1, '[Demo] Fluxos de dados documentados no mapeamento (RH, CRM, suporte).'),
  ('3.10', 1, '[Demo] TLS obrigatório; certificados gerenciados pelo provedor cloud.'),
  ('3.14', 3, '[Demo] Logs centralizados; retenção de 6 meses.'),
  ('5.2', 3, '[Demo] Política de senhas alinhada ao IdP corporativo.'),
  ('6.3', 2, '[Demo] MFA disponível mas não obrigatório para todos os colaboradores.'),
  ('7.1', 3, '[Demo] Gestão de patches mensal em servidores e estações.'),
  ('7.4', 3, '[Demo] Scan automatizado em repositórios de código.'),
  ('8.2', 3, '[Demo] SIEM básico; correlação manual.'),
  ('9.1', 2, '[Demo] Plano de resposta a incidentes em rascunho.'),
  ('9.3', 3, '[Demo] Simulação de phishing realizada no último ano.'),
  ('21.1', 1, '[Demo] Encarregado acessível via portal e e-mail dedicado.'),
  ('21.4', 1, '[Demo] Canal de titulares no portal público /demo.'),
  ('22.1', 3, '[Demo] DPAs com fornecedores críticos (cloud, folha, CRM).'),
  ('23.1', 1, '[Demo] Bases legais registradas por operação no ROPA.'),
  ('23.2', 1, '[Demo] Conformidade revisada pelo DPO semestralmente.'),
  ('23.3', 3, '[Demo] RIPD para biometria e campanhas de marketing.'),
  ('25.1', 1, '[Demo] Finalidades explícitas no ROPA e aviso de privacidade.'),
  ('25.4', 1, '[Demo] Portal de titulares com protocolo e SLA de 15 dias.'),
  ('25.7', 3, '[Demo] Criptografia, backups e segregação; MFA parcial.'),
  ('25.8', 3, '[Demo] Registro de incidentes e notificações ao DPO.');

  UPDATE public.programa_medida pm
  SET
    resposta = COALESCE(d.resposta::text, (1 + mod(abs(hashtext(concat(pm.id::text, 'demo_r'))), 5))::text),
    justificativa = COALESCE(
      d.justificativa,
      'Demonstração FPSI: resposta sintética para exercício de relatórios e maturidade.'
    ),
    responsavel = CASE mod(abs(hashtext(concat(pm.id::text, 'demo_resp'))), 5)
      WHEN 0 THEN id_enc WHEN 1 THEN id_ti WHEN 2 THEN id_rh WHEN 3 THEN id_alta ELSE id_int END,
    prioridade = (mod(abs(hashtext(concat(pm.id::text, 'demo_pri'))), 8) = 0),
    previsao_inicio = COALESCE(pm.previsao_inicio, CURRENT_DATE - (mod(abs(hashtext(concat(pm.id::text, 'demo_pi'))), 45))),
    previsao_fim = COALESCE(pm.previsao_fim, CURRENT_DATE + (15 + mod(abs(hashtext(concat(pm.id::text, 'demo_pf'))), 90)))
  FROM public.medida m
  LEFT JOIN _demo_diag d ON d.id_medida = m.id_medida
  WHERE pm.programa = pid AND pm.medida = m.id;

  UPDATE public.programa_controle pc
  SET nivel = 1 + mod(abs(hashtext(concat(pc.controle::text, 'demo_incc'))), 6)
  WHERE pc.programa = pid;

  -- Políticas
  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao)
  VALUES (
    pid, 'politica_protecao_dados_pessoais',
    $json$[
      {"id":0,"secao":"Introdução","titulo":"Empresa Demo Tech","descricao":"","texto":"<p>A <strong>Empresa Demo Tech Ltda.</strong> (CNPJ 12.345.678/0001-99) trata dados pessoais de colaboradores, clientes e visitantes em ambiente de demonstração do FPSI. Encarregada: Carla Mendes — <em>dpo.demo@fpsi.local</em>.</p>"},
      {"id":1,"secao":"Dados coletados","titulo":"Quais dados","descricao":"","texto":"<p>Identificação, contato, dados contratuais, logs de acesso, dados de marketing (com consentimento) e, em áreas restritas, dados biométricos para controle de acesso físico.</p>"},
      {"id":2,"secao":"Direitos","titulo":"Titulares","descricao":"","texto":"<p>Exercício de direitos pelo portal <a href=\"https://fpsi.vercel.app/demo\">fpsi.vercel.app/demo</a> ou e-mail privacidade.demo@fpsi.local. Prazo de resposta: até 15 dias.</p>"}
    ]$json$::jsonb,
    DATE '2025-01-15', DATE '2026-07-15'
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET secoes = EXCLUDED.secoes;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao)
  VALUES (
    pid, 'politica_seguranca_informacao',
    $json$[
      {"id":0,"secao":"POSIN","titulo":"Escopo","descricao":"","texto":"<p>Esta política aplica-se aos sistemas da Demo Tech: ERP, CRM, portal RH, infraestrutura cloud (região Brasil) e estações de trabalho corporativas.</p>"},
      {"id":1,"secao":"Controles","titulo":"Medidas","descricao":"","texto":"<p>HTTPS, MFA para administradores, backups diários, antimalware, segregação de ambientes e gestão de vulnerabilidades trimestral.</p>"}
    ]$json$::jsonb,
    DATE '2025-01-15', DATE '2026-07-15'
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET secoes = EXCLUDED.secoes;

  -- Riscos operacionais
  DELETE FROM public.programa_risco WHERE programa_id = pid AND titulo LIKE 'Demo FPSI —%';

  INSERT INTO public.programa_risco (
    programa_id, titulo, descricao, categoria, origem_tipo, probabilidade, impacto,
    score_inerente, score_residual, status, estrategia_mitigacao, responsavel, data_revisao
  ) VALUES
  (pid, 'Demo FPSI — Vazamento via planilha compartilhada', 'Colaboradores exportam listas de clientes para planilhas sem controle de versão.', 'privacidade', 'manual', 'alto', 'alto', 16, 12, 'em_tratamento', 'DLP em avaliação; treinamento; bloqueio de upload em endpoints não autorizados.', 'Carla Mendes (DPO)', CURRENT_DATE + 30),
  (pid, 'Demo FPSI — MFA não obrigatório', 'Contas administrativas sem segundo fator aumentam risco de takeover.', 'seguranca', 'manual', 'medio', 'alto', 12, 12, 'identificado', 'Exigir MFA para perfis admin e VPN.', 'Roberto Alves (TI)', CURRENT_DATE + 45),
  (pid, 'Demo FPSI — Retenção excessiva em CRM', 'Leads inativos mantidos além do necessário para marketing.', 'conformidade', 'manual', 'medio', 'medio', 9, 6, 'em_tratamento', 'Job de expurgo anual; revisão de bases legais.', 'Carla Mendes (DPO)', CURRENT_DATE + 60),
  (pid, 'Demo FPSI — Biometria em filial', 'Templates biométricos sem revisão periódica de leitores.', 'direitos_titulares', 'manual', 'baixo', 'alto', 8, 8, 'identificado', 'RIPD aprovado com plano de testes; alternativa de cartão.', 'Roberto Alves (TI)', CURRENT_DATE + 90),
  (pid, 'Demo FPSI — Terceiro folha de pagamento', 'Dependência de operador de folha com dados sensíveis de saúde.', 'operacional', 'manual', 'medio', 'alto', 12, 9, 'mitigado', 'DPA vigente; auditoria anual do fornecedor.', 'Fernanda Costa (RH)', CURRENT_DATE + 120);

  -- Conformidade (ROPA etc.) se ainda vazio
  SELECT COUNT(*) INTO ropa_count FROM public.ropa WHERE programa_id = pid;
  IF ropa_count = 0 THEN
    INSERT INTO public.registro_ropa (programa_id, organizacao, cnpj, endereco, atividade_principal, gestor_responsavel, email, telefone, data_registro, categorias_titulares, medidas_seguranca, tipos_dados_pessoais, compartilhamento, periodo_armazenamento, observacoes)
    VALUES (pid, 'Empresa Demo Tech Ltda', '12.345.678/0001-99', 'Av. Paulista, 1000 — São Paulo/SP', 'Software e serviços B2B', 'Carla Mendes (DPO)', 'privacidade.demo@fpsi.local', '(11) 3000-0000', CURRENT_DATE,
      '["colaboradores","clientes","visitantes"]'::jsonb, 'TLS, MFA admin, backups, RBAC', '["nome","email","cpf","telefone"]'::jsonb,
      'Cloud BR; operador folha; CRM SaaS', 'Conforme contrato + 5 anos', 'Dados fictícios para demo')
    ON CONFLICT (programa_id) DO NOTHING
    RETURNING id INTO rid;
    IF rid IS NULL THEN SELECT id INTO rid FROM public.registro_ropa WHERE programa_id = pid; END IF;

    INSERT INTO public.mapeamento_dados (programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, tipos_dados, fluxo_compartilhamento, categoria_titular, transferencia_internacional)
    VALUES (pid, 'Demo FPSI — RH e folha', 'Admissão, benefícios e ponto.', 'HR Cloud + folha terceirizada', 'rh', 'contratacao', '["identificacao","contato","financeiro"]'::jsonb, 'apenas_interno', 'colaborador', 'nao');

    INSERT INTO public.ropa (programa_id, registro_ropa_id, nome, finalidade, base_legal, categorias_dados, categorias_titulares, compartilhamento, retencao, medidas_seguranca, responsavel)
    VALUES (pid, rid, 'Demo FPSI — Gestão de colaboradores', 'Execução contratual e obrigações trabalhistas', 'Contrato e obrigação legal', 'Nome, CPF, dados bancários', 'Colaboradores', 'Operador folha (BR)', '5 anos após desligamento', 'Criptografia e perfis de acesso', 'Fernanda Costa (RH)');
  END IF;

  -- Portal: reportes e contato
  DELETE FROM public.programa_reportes WHERE programa_id = pid AND email LIKE '%@email.test';
  INSERT INTO public.programa_reportes (programa_id, tipo, nome, email, descricao, status) VALUES
    (pid, 'vulnerabilidade', 'Anônimo', 'anonimo@email.test', 'Possível exposição de API de testes sem autenticação (ambiente demo).', 'novo'),
    (pid, 'incidente', 'Lucas Demo', 'lucas.demo@email.test', 'Recebi e-mail suspeito solicitando dados de clientes em nome da empresa.', 'em_triagem');

  DELETE FROM public.programa_contato WHERE programa_id = pid AND email LIKE '%@email.test';
  INSERT INTO public.programa_contato (programa_id, nome, email, assunto, mensagem, status) VALUES
    (pid, 'Mariana Demo', 'mariana.demo@email.test', 'Dúvida sobre cookies', 'Gostaria de saber quais cookies não essenciais são utilizados no site.', 'novo'),
    (pid, 'Pedro Demo', 'pedro.demo@email.test', 'Cópia de dados', 'Solicito informações sobre tratamento dos meus dados como cliente.', 'em_atendimento');

  -- Incidentes
  DELETE FROM public.incidente WHERE programa_id = pid AND titulo LIKE 'Demo FPSI —%';
  INSERT INTO public.incidente (programa_id, data_ocorrencia, data_detecao, titulo, descricao, tipo, dados_afetados, comunicacao_anpd, data_comunicacao_anpd, comunicacao_titulares, data_comunicacao_titulares, medidas_adotadas, status) VALUES
    (pid, CURRENT_DATE - 45, CURRENT_DATE - 44, 'Demo FPSI — Envio indevido de planilha', 'Colaborador enviou planilha com e-mails de clientes para destinatário externo por engano.', 'vazamento_acidental', 'E-mails e nomes de ~120 clientes', false, NULL, true, CURRENT_DATE - 40, 'Notificação aos titulares; revogação de acesso; treinamento refeito.', 'encerrado'),
    (pid, CURRENT_DATE - 7, CURRENT_DATE - 6, 'Demo FPSI — Tentativa de phishing', 'Campanha de phishing direcionada ao setor financeiro; nenhum dado confirmado como comprometido.', 'phishing', 'Credenciais potenciais (não confirmado)', false, NULL, false, NULL, 'Bloqueio de domínio; alerta interno; MFA reforçado.', 'em_analise');

  -- Pedidos titulares (se poucos)
  IF (SELECT COUNT(*) FROM public.pedido_titular WHERE programa_id = pid) < 3 THEN
    DELETE FROM public.pedido_titular WHERE programa_id = pid AND protocolo LIKE 'PT-DEMO-%';
    INSERT INTO public.pedido_titular (programa_id, protocolo, tipo, nome_titular, email_titular, descricao_pedido, status, data_prazo_resposta, origem) VALUES
      (pid, 'PT-DEMO-' || pid || '-2026-00001', 'acesso', 'Maria Silva Demo', 'maria.silva.demo@email.test', 'Cópia dos dados no CRM.', 'em_analise', CURRENT_DATE + 10, 'manual'),
      (pid, 'PT-DEMO-' || pid || '-2026-00002', 'exclusao', 'João Santos Demo', 'joao.santos.demo@email.test', 'Exclusão de cadastro de newsletter.', 'recebido', CURRENT_DATE + 12, 'manual'),
      (pid, 'PT-DEMO-' || pid || '-2026-00003', 'portabilidade', 'Ana Costa Demo', 'ana.costa.demo@email.test', 'Portabilidade em CSV.', 'atendido', CURRENT_DATE - 2, 'manual');
  END IF;

  RAISE NOTICE 'seed_demo_placeholder: concluído para programa_id=%', pid;
END $$;
