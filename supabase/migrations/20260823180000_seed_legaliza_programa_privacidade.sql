-- Programa slug legaliza: dono jimxxx@gmail.com, remove demo, preenche cadastro
-- a partir do site https://minhaterralegal.com.br/site/ e do código em Projetos/legaliza.
-- Idempotente (prefixo "Legaliza — " nos registros gerados).

DO $$
DECLARE
  pid integer;
  eid integer;
  uid_jim text;
  uid_demo text;
  nome_jim text;
  id_dpo integer;
  id_tic integer;
  rid integer;
  id_ctrl_legaliza bigint;
  id_ctrl_pref bigint;
  id_contr_pref bigint;
  id_op_legaliza bigint;
  id_op_host bigint;
  id_op_yt bigint;
  mid1 integer; mid2 integer; mid3 integer; mid4 integer; mid5 integer;
  mid6 integer; mid7 integer; mid8 integer;
  ropa_reurb integer;
  perms jsonb := '{
    "can_view_diagnosticos":true,"can_edit_diagnosticos":true,"can_create_diagnosticos":true,"can_delete_diagnosticos":true,
    "can_view_medidas":true,"can_edit_medidas":true,"can_approve_medidas":true,
    "can_view_planos":true,"can_edit_planos":true,"can_approve_planos":true,
    "can_view_politicas":true,"can_edit_politicas":true,"can_publish_politicas":true,
    "can_view_relatorios":true,"can_export_relatorios":true,"can_share_relatorios":true,
    "can_view_users":true,"can_invite_users":true,"can_remove_users":true,"can_change_roles":true,
    "can_view_programa":true,"can_edit_programa":true,"can_delete_programa":true
  }'::jsonb;
  ativ text := $a$Regularização fundiária urbana e rural (REURB/REURB-S), geoprocessamento e topografia (RTK, drones, LiDAR Classe A), assistência técnica e extensão rural (ATER), desenvolvimento e operação do SIGET (Sistema Integrado de Gestão Territorial) e assessoria jurídica junto a prefeituras, cartórios e órgãos fundiários.$a$;
  escopo_txt text := $e$Programa de privacidade e segurança da informação da Legaliza Brasil: site institucional, aplicativo móvel, SIGET/REURB (cadastro social, documentos, fotos e coordenadas), mapa público agregado por município, cookies/consentimento e canal do titular. Abrange tratamentos em que a empresa é controladora (site, RH, comercial, operação própria) e aqueles em que atua como operadora de prefeituras contratantes na REURB.$e$;
  endereco_txt text := 'Sede administrativa: Setor de Mansões Dom Bosco, Conj. 12 CL, Bloco A, Salas 206/208, Lago Sul, Brasília/DF, CEP 71680-210. Matriz (CNPJ): Rua Major Roberto Alves, 314, Centro, Gouveia/MG, CEP 39120-000. Escritórios: Belo Horizonte/MG, Cuiabá/MT, Aracaju/SE.';
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza' LIMIT 1;
  IF pid IS NULL THEN
    RAISE EXCEPTION 'Programa slug legaliza não encontrado';
  END IF;

  SELECT id::text INTO uid_jim FROM auth.users WHERE email = 'jimxxx@gmail.com' LIMIT 1;
  SELECT id::text INTO uid_demo FROM auth.users WHERE email = 'demo@fpsi.com.br' LIMIT 1;
  IF uid_jim IS NULL THEN
    RAISE EXCEPTION 'Usuário jimxxx@gmail.com não encontrado em auth.users';
  END IF;

  SELECT COALESCE(NULLIF(trim(p.nome), ''), 'Jorge') INTO nome_jim
  FROM public.profiles p WHERE p.email = 'jimxxx@gmail.com' LIMIT 1;
  IF nome_jim IS NULL THEN nome_jim := 'Jorge'; END IF;

  -- Empresa
  SELECT id INTO eid FROM public.empresa WHERE cnpj = 34372346000132 LIMIT 1;
  IF eid IS NULL THEN
    INSERT INTO public.empresa (
      cnpj, razao_social, nome_fantasia, endereco, atividade_principal,
      gestor_responsavel, email, telefone
    ) VALUES (
      34372346000132,
      'LEGALIZA BRASIL GESTAO TERRITORIAL GEOTECNOLOGICA LTDA',
      'LEGALIZA BRASIL',
      endereco_txt,
      ativ,
      'Encarregado (DPO) — contato@legalizabrasil.com.br',
      'contato@legalizabrasil.com.br',
      '(61) 99847-6013'
    ) RETURNING id INTO eid;
  ELSE
    UPDATE public.empresa SET
      razao_social = 'LEGALIZA BRASIL GESTAO TERRITORIAL GEOTECNOLOGICA LTDA',
      nome_fantasia = 'LEGALIZA BRASIL',
      endereco = endereco_txt,
      atividade_principal = ativ,
      gestor_responsavel = 'Encarregado (DPO) — contato@legalizabrasil.com.br',
      email = 'contato@legalizabrasil.com.br',
      telefone = '(61) 99847-6013'
    WHERE id = eid;
  END IF;

  UPDATE public.programa SET
    nome = 'Programa de Privacidade — Legaliza Brasil',
    tipo_programa = 'empresa_organizacao',
    setor = 2,
    empresa_id = eid,
    razao_social = 'LEGALIZA BRASIL GESTAO TERRITORIAL GEOTECNOLOGICA LTDA',
    nome_fantasia = 'LEGALIZA BRASIL',
    cnpj = 34372346000132,
    endereco = endereco_txt,
    atendimento_email = 'contato@legalizabrasil.com.br',
    atendimento_fone = '(61) 99847-6013',
    atendimento_site = 'https://minhaterralegal.com.br/site/',
    atividade_principal_organizacao = ativ,
    descricao_escopo = escopo_txt,
    sigla = 'LEGALIZA',
    unidade = 'Sede Brasília/DF — atuação nacional',
    dpo_notificacao_email = 'contato@legalizabrasil.com.br',
    link_politica_privacidade = 'https://minhaterralegal.com.br/site/',
    link_aviso_titular = '/legaliza',
    link_cookies = '/legaliza/cookies',
    link_termo_uso = '/legaliza/termo-uso',
    link_declaracao_seguranca = '/legaliza/declaracao-seguranca',
    politica_inicio_vigencia = COALESCE(politica_inicio_vigencia, DATE '2026-08-23'),
    politica_prazo_revisao = COALESCE(politica_prazo_revisao, DATE '2027-08-23'),
    perfil_escopo = COALESCE(NULLIF(perfil_escopo, ''), 'completo'),
    gi_alvo = COALESCE(gi_alvo, 'G1')
  WHERE id = pid;

  -- Dono: jim admin; tira demo
  DELETE FROM public.programa_users pu
  WHERE pu.programa_id = pid
    AND (
      pu.user_id = uid_demo
      OR pu.user_id = 'demo@fpsi.com.br'
      OR pu.user_id ILIKE 'demo@%'
    );

  DELETE FROM public.programa_invites pi
  WHERE pi.programa_id = pid
    AND lower(pi.email) IN ('demo@fpsi.com.br', 'demo@fpsi.com.br');

  INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status, accepted_at)
  VALUES (pid, uid_jim, 'admin', perms, 'accepted', now())
  ON CONFLICT (programa_id, user_id) DO UPDATE SET
    role = 'admin',
    permissions = EXCLUDED.permissions,
    status = 'accepted',
    accepted_at = COALESCE(public.programa_users.accepted_at, now());

  -- Responsáveis
  SELECT id INTO id_dpo FROM public.responsavel
  WHERE programa = pid AND email = 'contato@legalizabrasil.com.br' LIMIT 1;
  IF id_dpo IS NULL THEN
    -- reaproveita o encarregado já apontado (ex.: criado no wizard demo)
    SELECT encarregado_dados_pessoais INTO id_dpo FROM public.programa WHERE id = pid;
    IF id_dpo IS NOT NULL AND EXISTS (SELECT 1 FROM public.responsavel r WHERE r.id = id_dpo AND r.programa = pid) THEN
      UPDATE public.responsavel SET
        nome = 'Encarregado pelo tratamento de dados (DPO) — Legaliza Brasil',
        departamento = 'Privacidade e Proteção de Dados',
        email = 'contato@legalizabrasil.com.br'
      WHERE id = id_dpo;
    ELSE
      INSERT INTO public.responsavel (programa, nome, departamento, email)
      VALUES (pid, 'Encarregado pelo tratamento de dados (DPO) — Legaliza Brasil', 'Privacidade e Proteção de Dados', 'contato@legalizabrasil.com.br')
      RETURNING id INTO id_dpo;
    END IF;
  ELSE
    UPDATE public.responsavel SET
      nome = 'Encarregado pelo tratamento de dados (DPO) — Legaliza Brasil',
      departamento = 'Privacidade e Proteção de Dados'
    WHERE id = id_dpo;
  END IF;

  SELECT id INTO id_tic FROM public.responsavel
  WHERE programa = pid AND email = 'jimxxx@gmail.com' LIMIT 1;
  IF id_tic IS NULL THEN
    INSERT INTO public.responsavel (programa, nome, departamento, email)
    VALUES (pid, nome_jim || ' — consultoria / reconstrução do SIGET', 'Tecnologia da Informação', 'jimxxx@gmail.com')
    RETURNING id INTO id_tic;
  END IF;

  UPDATE public.programa SET
    encarregado_dados_pessoais = id_dpo,
    gestor_tic = COALESCE(gestor_tic, id_tic)
  WHERE id = pid;
END $$;

-- Unidades
INSERT INTO public.programa_unidade (programa_id, nome, codigo, ativo)
SELECT p.id, v.nome, v.codigo, true
FROM public.programa p
JOIN (VALUES
  ('Sede administrativa — Brasília/DF', 'BSB'),
  ('Matriz CNPJ — Gouveia/MG', 'GOU'),
  ('Escritório — Belo Horizonte/MG', 'BH'),
  ('Parque tecnológico — Cuiabá/MT', 'CGB'),
  ('Escritório — Aracaju/SE', 'AJU')
) AS v(nome, codigo) ON p.slug = 'legaliza'
WHERE NOT EXISTS (
  SELECT 1 FROM public.programa_unidade u WHERE u.programa_id = p.id AND u.codigo = v.codigo
);

-- Processos
INSERT INTO public.programa_processo (programa_id, nome, descricao, dono, ativo)
SELECT p.id, v.nome, v.descricao, v.dono, true
FROM public.programa p
JOIN (VALUES
  ('REURB — cadastro social e titulação', 'Diagnóstico territorial, cadastro de titulares/moradores, documentos, fotos, georreferenciamento, instrução junto à prefeitura e cartório, emissão de títulos.', 'Operações / jurídico'),
  ('SIGET — plataforma e app', 'Autenticação, perfil de acesso, aceite de termos, logs, preferências de UI, APIs e arquivos de evidência (fotos).', 'TI'),
  ('Site institucional e comunicação', 'Conteúdo público, mapa agregado, cookies, YouTube condicionado a consentimento, canal LGPD.', 'Comunicação'),
  ('ATER e geotecnologia', 'Assistência técnica rural e levantamentos (RTK, drones, LiDAR) que alimentam o SIGET.', 'Operações de campo'),
  ('Gestão de contratos com municípios', 'Parcerias com prefeituras (Lei 13.465/2017, Decreto 9.310/2018) e compartilhamento necessário à REURB.', 'Jurídico / comercial')
) AS v(nome, descricao, dono) ON p.slug = 'legaliza'
WHERE NOT EXISTS (
  SELECT 1 FROM public.programa_processo pr WHERE pr.programa_id = p.id AND pr.nome = v.nome
);

-- Fornecedores / operadores
INSERT INTO public.programa_fornecedor (
  programa_id, nome, tipo, contato, avaliacao_status, ativo, observacoes, criticidade, possui_clausulas_lgpd
)
SELECT p.id, v.nome, v.tipo, v.contato, 'em_revisao', true, v.obs, v.crit, v.lgpd
FROM public.programa p
JOIN (VALUES
  ('Infraestrutura SIGET (bd.minhaterralegal.com.br / app.minhaterralegal.com.br)', 'operador', 'TI Legaliza',
   'Hospedagem do PostgreSQL, API, GeoServer e arquivos de fotos. Tratamento como encarregado de meios da operação SIGET.', 'critica', false),
  ('Google LLC — YouTube (youtube-nocookie.com)', 'operador', 'Política de cookies do site',
   'Vídeos institucionais só após consentimento de terceiros. Pode haver transferência internacional.', 'media', false),
  ('Apple App Store / Google Play — app Legaliza', 'software', 'https://apps.apple.com/br/app/legaliza/id1600354080',
   'Distribuição do aplicativo móvel de campo; as lojas tratam dados de conta do titular do dispositivo conforme suas políticas.', 'baixa', false),
  ('Prefeituras municipais contratantes (REURB)', 'controlador_conjunto', 'Contratos municipais',
   'Na REURB o município é, em regra, controlador dos dados dos beneficiários; a Legaliza opera o SIGET em nome da contratante.', 'alta', true),
  ('Cartórios de Registro de Imóveis e órgãos fundiários (INCRA e correlatos)', 'outro', 'Fluxo legal da titulação',
   'Compartilhamento necessário à regularização (obrigação legal / execução de políticas públicas), sem venda de dados.', 'alta', false)
) AS v(nome, tipo, contato, obs, crit, lgpd) ON p.slug = 'legaliza'
WHERE NOT EXISTS (
  SELECT 1 FROM public.programa_fornecedor f WHERE f.programa_id = p.id AND f.nome = v.nome
);

-- Sistemas
INSERT INTO public.programa_sistema (programa_id, nome, descricao, tipo, critico, ativo)
SELECT p.id, v.nome, v.descricao, v.tipo, v.critico, true
FROM public.programa p
JOIN (VALUES
  ('SIGET — Sistema Integrado de Gestão Territorial', 'Plataforma própria (legado Adianti + rebuild web) para REURB, cadastros, documentos, GIS e indicadores.', 'aplicacao', true),
  ('PostgreSQL (bd.minhaterralegal.com.br)', 'Base operacional do SIGET (usuários, REURB, logs, preferências LGPD, legal_consent_log).', 'banco', true),
  ('GeoServer / WMS', 'Serviços geoespaciais autenticados (app.minhaterralegal.com.br/geoserver).', 'infra', true),
  ('Repositório de fotos (minhaterralegal.com.br/fotos/legaliza)', 'Evidências fotográficas de vistoria vinculadas ao cadastro.', 'infra', true),
  ('Site institucional WordPress (minhaterralegal.com.br/site)', 'Comunicação pública; rebuild em andamento com política, termos, cookies e banner.', 'aplicacao', false),
  ('Aplicativo móvel Legaliza', 'Coleta em campo (cadastro social, GPS, fotos) — iOS/Android.', 'aplicacao', true)
) AS v(nome, descricao, tipo, critico) ON p.slug = 'legaliza'
WHERE NOT EXISTS (
  SELECT 1 FROM public.programa_sistema s WHERE s.programa_id = p.id AND s.nome = v.nome
);

-- Papéis LGPD
DO $$
DECLARE
  pid integer;
  id_ctrl_legaliza bigint;
  id_ctrl_pref bigint;
  id_contr_pref bigint;
  id_op_legaliza bigint;
  id_op_host bigint;
  id_op_yt bigint;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza';
  DELETE FROM public.programa_papel_lgpd_vinculo WHERE programa_id = pid;
  DELETE FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid;

  INSERT INTO public.programa_papel_lgpd_instituicao (programa_id, tipo_papel, ordem, nome, descricao, contato, email, site)
  VALUES
    (pid, 'controlador', 0, 'Legaliza Brasil Gestão Territorial Geotecnológica Ltda.',
     'Controladora dos tratamentos do site, comunicação institucional, RH/colaboradores, contas do SIGET da própria empresa e canal do titular (contato@legalizabrasil.com.br). CNPJ 34.372.346/0001-32.',
     'Encarregado (DPO)', 'contato@legalizabrasil.com.br', 'https://minhaterralegal.com.br/site/'),
    (pid, 'controlador', 1, 'Prefeituras municipais contratantes (REURB)',
     'Controladoras, em regra, dos dados de beneficiários, moradores e imóveis nos procedimentos de regularização fundiária urbana conduzidos em parceria (Lei 13.465/2017 e Decreto 9.310/2018).',
     NULL, NULL, NULL),
    (pid, 'contratante', 0, 'Municípios parceiros / Programa Minha Terra Legal',
     'Contratam a Legaliza para executar cadastro, geotecnologia e instrução processual da REURB e programas correlatos (ex.: REGMEL).',
     NULL, NULL, 'https://minhaterralegal.com.br/site/'),
    (pid, 'operador', 0, 'Legaliza Brasil — operação do SIGET',
     'Opera o SIGET, o app de campo e a guarda técnica de cadastros/fotos/coordenadas em nome das prefeituras, no limite do contrato e da legislação fundiária.',
     'SIGET', 'contato@legalizabrasil.com.br', 'https://app.minhaterralegal.com.br'),
    (pid, 'operador', 1, 'Infraestrutura de hospedagem e arquivos',
     'PostgreSQL, aplicação, GeoServer e storage de fotos nos domínios minhaterralegal.com.br — subprocessamento de infraestrutura.',
     NULL, NULL, 'https://bd.minhaterralegal.com.br'),
    (pid, 'operador', 2, 'Google (YouTube incorporado)',
     'Reprodução de vídeos institucionais somente após consentimento (youtube-nocookie.com), conforme política de cookies do site.',
     NULL, NULL, 'https://www.youtube.com')
  ;

  SELECT id INTO id_ctrl_legaliza FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome LIKE 'Legaliza Brasil Gestão%' AND tipo_papel = 'controlador';
  SELECT id INTO id_ctrl_pref FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome LIKE 'Prefeituras municipais%';
  SELECT id INTO id_contr_pref FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND tipo_papel = 'contratante' LIMIT 1;
  SELECT id INTO id_op_legaliza FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome LIKE 'Legaliza Brasil — operação%';
  SELECT id INTO id_op_host FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome LIKE 'Infraestrutura de hospedagem%';
  SELECT id INTO id_op_yt FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome LIKE 'Google (YouTube%';

  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, instituicao_destino_id, destino_tipo_papel, tipo_vinculo, ordem)
  VALUES
    (pid, id_contr_pref, id_op_legaliza, NULL, 'Contrato de REURB / Minha Terra Legal', 0),
    (pid, id_ctrl_pref, id_op_legaliza, NULL, 'Encargo de tratamento (operadora do SIGET)', 1),
    (pid, id_op_legaliza, id_ctrl_pref, NULL, 'Processa dados de beneficiários em nome do município', 2),
    (pid, id_op_host, NULL, 'controlador', 'Encargo de meios / hospedagem', 3),
    (pid, id_op_yt, id_ctrl_legaliza, NULL, 'Cookies de terceiros mediante consentimento', 4);
END $$;

-- Mapeamento + ROPA
DO $$
DECLARE
  pid integer;
  rid integer;
  mid1 integer; mid2 integer; mid3 integer; mid4 integer;
  mid5 integer; mid6 integer; mid7 integer; mid8 integer;
  ropa_reurb integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza';

  DELETE FROM public.ropa WHERE programa_id = pid AND nome LIKE 'Legaliza — %';
  DELETE FROM public.mapeamento_dados WHERE programa_id = pid AND nome LIKE 'Legaliza — %';

  INSERT INTO public.registro_ropa (
    programa_id, organizacao, cnpj, endereco, atividade_principal,
    gestor_responsavel, email, telefone, data_registro,
    categorias_titulares, medidas_seguranca, tipos_dados_pessoais, outros_dados_pessoais,
    compartilhamento, periodo_armazenamento, observacoes
  ) VALUES (
    pid,
    'LEGALIZA BRASIL GESTAO TERRITORIAL GEOTECNOLOGICA LTDA',
    '34.372.346/0001-32',
    'Brasília/DF (sede adm.) e Gouveia/MG (matriz CNPJ); atuação nacional.',
    'Regularização fundiária (REURB), geotecnologia, ATER e operação do SIGET.',
    'Encarregado (DPO)',
    'contato@legalizabrasil.com.br',
    '(61) 99847-6013',
    DATE '2026-08-23',
    '["titulares_em_geral","criancas_adolescentes","idosos"]'::jsonb,
    'HTTPS; sessão JWT em cookie httpOnly (legaliza_token); controle de acesso por perfil, unidade e funcionalidade; aceite obrigatório de termos no SIGET; trilha system_access_log e legal_consent_log; YouTube bloqueado até consentimento; mapa público apenas com dados agregados por município; segregação de ambientes.',
    '["nome","endereco","rg","email","cpf","telefone"]'::jsonb,
    'Documentos de identidade e posse; fotos de vistoria; coordenadas geográficas do imóvel; composição familiar; renda e programas sociais; NIS; dados de login (IP, data/hora); preferências de UI em localStorage; evidências processuais da REURB.',
    'Prefeituras contratantes, cartórios, órgãos públicos fundiários e prestadores de infraestrutura (hospedagem, e-mail, YouTube mediante consentimento). Sem venda de dados.',
    'Cadastros REURB: prazos contratuais e legais do processo de regularização e defesa em processos. Contas SIGET: enquanto ativas. Logs de acesso: período compatível com auditoria e segurança. Cookies/localStorage: conforme escolha do titular no navegador.',
    'Fonte: código do SIGET/rebuild (cadastro REURB, fotos, GPS, TermsGate, cookies) e site institucional. CNPJ público 34.372.346/0001-32. Papel dual: controladora (site/RH/SIGET próprio) e operadora (REURB municipal).'
  )
  ON CONFLICT (programa_id) DO UPDATE SET
    organizacao = EXCLUDED.organizacao,
    cnpj = EXCLUDED.cnpj,
    endereco = EXCLUDED.endereco,
    atividade_principal = EXCLUDED.atividade_principal,
    gestor_responsavel = EXCLUDED.gestor_responsavel,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    categorias_titulares = EXCLUDED.categorias_titulares,
    medidas_seguranca = EXCLUDED.medidas_seguranca,
    tipos_dados_pessoais = EXCLUDED.tipos_dados_pessoais,
    outros_dados_pessoais = EXCLUDED.outros_dados_pessoais,
    compartilhamento = EXCLUDED.compartilhamento,
    periodo_armazenamento = EXCLUDED.periodo_armazenamento,
    observacoes = EXCLUDED.observacoes
  RETURNING id INTO rid;

  IF rid IS NULL THEN
    SELECT id INTO rid FROM public.registro_ropa WHERE programa_id = pid;
  END IF;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Cadastro REURB (titulares, família e imóvel)',
    'Cadastro social e processual: titular e cônjuge (nome, CPF, RG, filiação, estado civil, renda, NIS, profissão), moradores, confrontantes, endereço, metragem, infraestrutura do lote, documentos de posse/IPTU e dados de pagamento do contrato.',
    'SIGET (tabelas reurb, titulares, moradores); app de campo; formulários de prefeitura.',
    'operacoes', 'execucao_contrato',
    'Execução de contrato com o município e procedimentos de regularização fundiária (Lei 13.465/2017). Quando em nome da prefeitura, a Legaliza atua como operadora.',
    '["sistema_interno","site_app","nuvem","papel"]'::jsonb,
    '["identificacao","contato","financeiro","outros_tipos"]'::jsonb,
    'Documentos de posse, composição familiar, programas sociais, dados do imóvel e evidências da instrução processual.',
    'empresa_externa',
    'Prefeitura contratante, cartório de imóveis e órgãos públicos necessários à titulação.',
    'outros', 'Beneficiários da REURB, moradores do núcleo e representantes (PF/PJ)',
    'nao'
  ) RETURNING id INTO mid1;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Fotos de vistoria e coordenadas geográficas',
    'Fotos do imóvel/ocupação e pontos GPS vinculados ao cadastro como evidência processual. O código trata esses arquivos como evidência — não devem ser alterados fora do fluxo.',
    'Repositório minhaterralegal.com.br/fotos/legaliza; app; SIGET (painéis de fotos/GPS).',
    'operacoes', 'execucao_contrato',
    'Comprovar ocupação, apoiar georreferenciamento e instruir o processo de titulação.',
    '["sistema_interno","nuvem","site_app"]'::jsonb,
    '["identificacao","outros_tipos"]'::jsonb,
    'Imagens do imóvel/ocupantes quando captadas; latitude/longitude; metadados de arquivo.',
    'empresa_externa',
    'Equipes técnicas, prefeitura e, quando necessário, cartório/órgãos.',
    'outros', 'nao'
  ) RETURNING id INTO mid2;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria,
    meios_armazenamento, tipos_dados,
    fluxo_compartilhamento, categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Contas e autenticação do SIGET',
    'Login, senha, nome, e-mail, grupos, unidades, programas/funcionalidades, sessão JWT httpOnly, aceite de termos (accepted_term_policy) e log de consentimento.',
    'system_users; cookie legaliza_token; legal_consent_log; system_access_log.',
    'ti', 'execucao_contrato',
    '["sistema_interno","nuvem"]'::jsonb,
    '["identificacao","contato"]'::jsonb,
    'apenas_interno', 'colaborador', 'nao'
  ) RETURNING id INTO mid3;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro,
    fluxo_compartilhamento, categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Logs de acesso e segurança',
    'Registro de autenticação, IP, data/hora e user-agent para auditoria, prevenção a fraude e continuidade do serviço.',
    'system_access_log; servidor SIGET.',
    'ti', 'seguranca',
    'Legítimo interesse em segurança da informação e responsabilização (art. 7º, IX LGPD).',
    '["sistema_interno","nuvem"]'::jsonb,
    '["identificacao","outros_tipos"]'::jsonb,
    'IP, user-agent, identificador de sessão, ações de login/logout.',
    'apenas_interno', 'colaborador', 'nao'
  ) RETURNING id INTO mid4;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Site, cookies e YouTube',
    'Banner de consentimento (legaliza-cookie-consent), cookies essenciais de sessão, localStorage de layout e embeds YouTube (youtube-nocookie) só após opt-in de terceiros.',
    'Site institucional; rebuild React (CookieConsentBanner, ConsentAwareYoutube).',
    'marketing', 'atendimento_titular',
    'Comunicação institucional; cookies não essenciais mediante consentimento.',
    '["site_app"]'::jsonb,
    '["preferencias","outros_tipos"]'::jsonb,
    'empresa_externa',
    'Google/YouTube apenas se o titular aceitar cookies de terceiros.',
    'visitante', 'sim'
  ) RETURNING id INTO mid5;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro,
    fluxo_compartilhamento, categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Mapa público de impacto (agregado)',
    'Indicadores por município sem identificação de imóveis ou pessoas — privacidade by design no site.',
    'API pública do SIGET; mapa Leaflet/OSM no site.',
    'operacoes', 'outro',
    'Transparência institucional com dados agregados/anonimizados.',
    '["site_app","sistema_interno"]'::jsonb,
    '["outros_tipos"]'::jsonb,
    'Contagens e percentuais por município (não identificam titular).',
    'nenhum', 'visitante', 'nao'
  ) RETURNING id INTO mid6;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria,
    meios_armazenamento, tipos_dados,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Canal LGPD e contato institucional',
    'Solicitações de direitos do titular e atendimento (e-mail contato@legalizabrasil.com.br, WhatsApp SAC (61) 99847-6013). Hoje o exercício de direitos é via e-mail; portal estruturado está no FPSI.',
    'E-mail; WhatsApp; página /contato; portal FPSI /legaliza.',
    'atendimento', 'obrigacao_legal',
    '["email_mensageria","site_app"]'::jsonb,
    '["identificacao","contato","outros_tipos"]'::jsonb,
    'apenas_interno',
    'Equipe da Legaliza / encarregado; sem uso comercial.',
    'cliente', 'nao'
  ) RETURNING id INTO mid7;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados,
    fluxo_compartilhamento, categoria_titular, transferencia_internacional
  ) VALUES
  (
    pid, 'Legaliza — Contatos comerciais e parcerias com prefeituras',
    'Dados de gestores municipais, propostas e contratos para REURB/ATER/geo.',
    'E-mail institucional; CRM/planilhas operacionais; site (formulário/WhatsApp).',
    'comercial', 'execucao_contrato',
    'Procedimentos preliminares e execução de contratos B2G.',
    '["email_mensageria","planilha","sistema_interno"]'::jsonb,
    '["identificacao","contato"]'::jsonb,
    'apenas_interno', 'fornecedor', 'nao'
  ) RETURNING id INTO mid8;

  INSERT INTO public.ropa (
    programa_id, registro_ropa_id, mapeamento_id, nome, finalidade, base_legal,
    categorias_dados, categorias_titulares, compartilhamento, retencao, medidas_seguranca, responsavel
  ) VALUES
  (
    pid, rid, mid1,
    'Legaliza — Tratamento de dados na REURB / SIGET',
    'Conduzir o fluxo de regularização fundiária urbana: cadastro social, instrução, georreferenciamento e titulação em parceria com o município.',
    'Art. 7º, II, III e V LGPD (obrigação legal, políticas públicas, contrato)',
    'Identificação, documentos, família, renda, endereço, imóvel, NIS e evidências processuais',
    'Beneficiários da REURB, moradores, cônjuges e representantes',
    'Prefeitura, cartório, órgãos fundiários; infraestrutura SIGET como subprocessadora',
    'Prazos do processo de regularização, contratos municipais e defesa de direitos',
    'RBAC, HTTPS, evidências rastreadas, aceite de termos pelos operadores do sistema',
    'Operações / jurídico'
  ) RETURNING id INTO ropa_reurb;

  INSERT INTO public.ropa (
    programa_id, registro_ropa_id, mapeamento_id, nome, finalidade, base_legal,
    categorias_dados, categorias_titulares, compartilhamento, retencao, medidas_seguranca, responsavel
  ) VALUES
  (
    pid, rid, mid2,
    'Legaliza — Evidências fotográficas e geolocalização de campo',
    'Documentar ocupação e localização do imóvel para o processo administrativo de REURB.',
    'Art. 7º, II e V LGPD (obrigação legal e contrato)',
    'Fotos, coordenadas, identificadores do cadastro',
    'Ocupantes/beneficiários do núcleo urbanizado',
    'Prefeitura e equipes técnicas autorizadas',
    'Enquanto o processo e obrigações legais exigirem a evidência',
    'Acesso autenticado; arquivos em repositório dedicado; vedação a manipulação fora do fluxo',
    'Operações de campo'
  ),
  (
    pid, rid, mid3,
    'Legaliza — Gestão de usuários do SIGET',
    'Autenticar operadores autorizados, aplicar perfil/unidade e registrar aceite dos termos.',
    'Art. 7º, V e IX LGPD (contrato e segurança)',
    'Nome, login, e-mail, hash de senha, grupos, unidades, aceite de termos',
    'Colaboradores, prepostos da prefeitura e prestadores autorizados',
    'Sem divulgação externa; hospedagem como encarregada de meios',
    'Enquanto a conta estiver ativa e pelo prazo de auditoria após desligamento',
    'Cookie httpOnly, senha com hash, RBAC, TermsGate',
    'TI'
  ),
  (
    pid, rid, mid4,
    'Legaliza — Auditoria de acessos',
    'Registrar logins e eventos para segurança, apuração de incidentes e accountability.',
    'Art. 7º, IX LGPD e art. 37 (registros)',
    'Identificador de usuário, IP, data/hora, user-agent',
    'Usuários autenticados',
    'Acesso restrito à administração',
    '12–24 meses, salvo investigação ou obrigação legal',
    'Logs append-only / acesso administrativo',
    'TI'
  ),
  (
    pid, rid, mid5,
    'Legaliza — Comunicações do site e cookies',
    'Exibir conteúdo institucional e, com consentimento, vídeos de terceiros.',
    'Art. 7º, I e IX LGPD (consentimento e legítimo interesse)',
    'Preferências de cookie, identificadores técnicos, dados de reprodução YouTube se consentido',
    'Visitantes do site',
    'Google/YouTube apenas com opt-in',
    'Até o titular limpar o navegador ou renovar o consentimento (versão 2026.08)',
    'Banner, youtube-nocookie, cookies essenciais mínimos',
    'Comunicação'
  ),
  (
    pid, rid, mid7,
    'Legaliza — Atendimento a titulares (art. 18 LGPD)',
    'Receber e responder pedidos de confirmação, acesso, correção, eliminação, portabilidade e informação sobre compartilhamento.',
    'Art. 7º, II LGPD (obrigação legal)',
    'Dados do pedido, documentos de verificação e protocolo',
    'Titulares que acionam o canal DPO',
    'Somente áreas necessárias ao atendimento',
    'Prazo legal de guarda do atendimento após conclusão',
    'Canal único DPO; portal FPSI para protocolo',
    'Encarregado (DPO)'
  );

  INSERT INTO public.ripd (
    programa_id, ropa_id, titulo, descricao_dados, metodologia_coleta_seguranca,
    medidas_salvaguardas_mitigacao, conclusao, status,
    riscos_tratamento, nivel_risco, tipos_risco, categorias_dados_chaves,
    base_legal_predominante, parecer_dpo, parecer_dpo_status, decisao_controlador
  )
  SELECT
    pid, ropa_reurb,
    'Legaliza — RIPD do cadastro REURB (alto volume, geolocalização e documentos)',
    'Tratamento em larga escala de dados de identificadores, documentos, composição familiar, renda, fotos e coordenadas de imóveis de núcleos sujeitos à REURB, inclusive possíveis crianças/adolescentes no cadastro familiar. Parte dos tratamentos ocorre como operadora de municípios (controladores).',
    'Coleta em campo (app) e escritório; armazenamento no PostgreSQL SIGET e repositório de fotos; transmissão HTTPS; operadores autenticados com perfil; aceite de termos; mapa público usa apenas agregados municipais.',
    'Minimização no mapa público; RBAC e unidades; evidências rastreadas; canal DPO; contratos com prefeituras a formalizar cláusulas de operador (DPA); revisão de retenção e expurgo; não uso de dados de beneficiários para marketing.',
    'O tratamento é necessário à política pública de regularização fundiária, mas é de risco elevado. Recomenda-se manter a dualidade controlador/operador explícita nos contratos, concluir DPAs com a hospedagem, restringir exportações e implementar o portal do titular (FPSI) como canal formal. O tratamento pode seguir com as salvaguardas e o plano de aprimoramento.',
    'em_analise',
    'Vazamento de cadastros de núcleos vulneráveis; acesso indevido por perfil excessivo; reidentificação a partir de foto+GPS; compartilhamento além da prefeitura/cartório; retenção indefinida.',
    'alto',
    '["vazamento","reidentificacao","titulares_vulneraveis"]'::jsonb,
    '["identificacao","contato","financeiro","criancas","outros"]'::jsonb,
    'politicas_publicas',
    'Parecer preliminar com ressalvas: o baseline técnico (termos, cookies, logs, agregação do mapa) está no código; faltam DPA com infraestrutura, CNPJ no site (já identificado 34.372.346/0001-32) e portal do titular em produção na Legaliza (hoje e-mail).',
    'ressalvas',
    'aceita_com_plano'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ripd r WHERE r.programa_id = pid AND r.titulo LIKE 'Legaliza — RIPD%'
  );
END $$;

-- Políticas / documentos do portal (publicados)
DO $$
DECLARE
  pid integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza';

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES (
    pid, 'politica_protecao_dados_pessoais',
    $j$[
      {"id":0,"secao":"Escopo","titulo":"Controladora e encarregado","descricao":"","texto":"<p>Esta política aplica-se à <strong>Legaliza Brasil Gestão Territorial Geotecnológica Ltda.</strong> (nome fantasia Legaliza Brasil), CNPJ 34.372.346/0001-32, sede administrativa em Brasília/DF e matriz em Gouveia/MG.</p><p>Encarregado (DPO): <a href=\"mailto:contato@legalizabrasil.com.br\">contato@legalizabrasil.com.br</a> — assunto sugerido: «Solicitação LGPD — Legaliza Brasil». Telefone/WhatsApp SAC: (61) 99847-6013. Site: <a href=\"https://minhaterralegal.com.br/site/\">minhaterralegal.com.br/site</a>.</p><p>Na REURB executada para prefeituras, o município é em regra o controlador dos dados dos beneficiários e a Legaliza atua como operadora do SIGET.</p>"},
      {"id":1,"secao":"Dados","titulo":"Quais dados tratamos","descricao":"","texto":"<p>Conforme o SIGET e o site:</p><ul><li>Identificação e contato (nome, e-mail, telefone, CPF/CNPJ quando necessário ao serviço);</li><li>Acesso ao sistema (login, logs, IP, data/hora, aceite de termos);</li><li>Cadastro REURB (titulares, moradores, documentos, fotos, coordenadas);</li><li>Mapa público apenas com dados agregados por município;</li><li>Preferências de interface (cookies essenciais e localStorage).</li></ul>"},
      {"id":2,"secao":"Bases","titulo":"Finalidades e bases legais","descricao":"","texto":"<ul><li>Regularização fundiária e gestão territorial — execução de contrato e procedimentos preliminares (art. 7º, V); políticas públicas e obrigação legal (art. 7º, II e III) na REURB;</li><li>Operação do SIGET por usuários autorizados — contrato e legítimo interesse em segurança (art. 7º, V e IX);</li><li>Comunicação institucional — consentimento ou legítimo interesse, conforme o caso;</li><li>Cookies não essenciais e YouTube — consentimento.</li></ul>"},
      {"id":3,"secao":"Compartilhamento","titulo":"Com quem compartilhamos","descricao":"","texto":"<p>Não vendemos dados. Compartilhamento apenas com prefeituras contratantes, cartórios, órgãos públicos e fornecedores de infraestrutura (hospedagem, e-mail), com medidas contratuais e técnicas. YouTube só após consentimento.</p>"},
      {"id":4,"secao":"Direitos","titulo":"Direitos do titular","descricao":"","texto":"<p>Confirmação, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento (art. 18 LGPD), pelo e-mail do encarregado ou pelo portal público deste programa FPSI.</p>"},
      {"id":5,"secao":"Segurança","titulo":"Medidas e retenção","descricao":"","texto":"<p>HTTPS, cookie de sessão httpOnly, RBAC, auditoria de acessos, TermsGate, consentimento de cookies, mapa agregado. Retenção: prazos legais/contratuais da REURB, contas enquanto ativas, logs pelo período de auditoria.</p>"},
      {"id":6,"secao":"Vigência","titulo":"Atualizações","descricao":"","texto":"<p>Versão documental 2026.08 (23/08/2026), alinhada ao baseline LGPD do sistema em reconstrução. Revisão prevista em 12 meses.</p>"}
    ]$j$::jsonb,
    DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'publicado', publicado_em = now(),
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  SELECT pid, 'documento_portal_politica_privacidade', secoes, inicio_vigencia, prazo_revisao, 'publicado', now()
  FROM public.politica_programa
  WHERE programa_id = pid AND tipo_politica = 'politica_protecao_dados_pessoais'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'publicado', publicado_em = now();

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES (
    pid, 'documento_portal_termo_uso',
    $j$[
      {"id":0,"secao":"Aceite","titulo":"Condições de acesso ao SIGET","descricao":"","texto":"<p>O acesso ao sistema REURB (SIGET) é restrito a usuários autorizados. Ao entrar, o usuário declara ter lido e aceito estes Termos e a Política de Privacidade. O aceite é registrado em <code>accepted_term_policy</code> e pode ser invalidado se a administração alterar os termos.</p>"},
      {"id":1,"secao":"Credenciais","titulo":"Responsabilidade","descricao":"","texto":"<p>Login e senha são pessoais e intransferíveis. É vedado compartilhar credenciais, exportar dados fora do escopo da função, alterar fotos/GPS/documentos de forma fraudulenta ou tentar contornar a segurança.</p>"},
      {"id":2,"secao":"Sigilo","titulo":"Dados pessoais","descricao":"","texto":"<p>Os dados do SIGET são confidenciais e protegidos pela LGPD. Fotos e coordenadas são evidência processual. Foro: Brasília/DF, salvo disposição legal em contrário.</p>"}
    ]$j$::jsonb,
    DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'publicado', publicado_em = now();

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES (
    pid, 'documento_portal_cookies',
    $j$[
      {"id":0,"secao":"Cookies","titulo":"O que utilizamos","descricao":"","texto":"<p>Cookies e localStorage no site e no SIGET, conforme a Política de Cookies da Legaliza (versão 2026.08).</p>"},
      {"id":1,"secao":"Essenciais","titulo":"Sempre ativos","descricao":"","texto":"<ul><li><code>legaliza_token</code> — sessão autenticada (httpOnly);</li><li><code>legaliza-cookie-consent</code> — registro da escolha no site.</li></ul>"},
      {"id":2,"secao":"Opcionais","titulo":"Preferências e terceiros","descricao":"","texto":"<p>Layout (sidebar/painéis) em localStorage. YouTube (youtube-nocookie.com) só após consentimento de terceiros. O titular pode recusar e continuar no restante do site.</p>"}
    ]$j$::jsonb,
    DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'publicado', publicado_em = now();

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES (
    pid, 'documento_portal_aviso_titular',
    $j$[
      {"id":0,"secao":"Aviso","titulo":"Como exercer seus direitos","descricao":"","texto":"<p>A Legaliza Brasil trata dados pessoais para regularização fundiária, geotecnologia e operação do SIGET. Para confirmação de tratamento, acesso, correção ou eliminação, escreva para <strong>contato@legalizabrasil.com.br</strong> com o assunto «Solicitação LGPD — Legaliza Brasil» ou use os formulários deste portal.</p><p>WhatsApp SAC: (61) 99847-6013. Encarregado identificado na política de privacidade. Pedidos envolvendo cadastros de REURB municipal podem ser encaminhados também à prefeitura controladora.</p>"}
    ]$j$::jsonb,
    DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'publicado', publicado_em = now();

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES (
    pid, 'documento_portal_declaracao_seguranca',
    $j$[
      {"id":0,"secao":"Segurança","titulo":"Práticas implementadas no SIGET e no site","descricao":"","texto":"<p>Medidas observadas no código e na operação:</p><ul><li>Criptografia em trânsito (HTTPS);</li><li>Sessão em cookie httpOnly com SameSite;</li><li>Controle de acesso por grupo, unidade e funcionalidade;</li><li>Aceite bloqueante de termos e trilha de consentimento;</li><li>Auditoria de login (system_access_log);</li><li>YouTube condicionado a consentimento; mapa público sem PII;</li><li>Segregação de base operacional (PostgreSQL) e arquivos de evidência.</li></ul><p>Incidentes devem ser comunicados ao encarregado. Esta declaração não substitui certificação ISO 27001.</p>"}
    ]$j$::jsonb,
    DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'publicado', publicado_em = now();

  INSERT INTO public.politica_programa_versao (programa_id, tipo_politica, numero, nota, secoes_snapshot, inicio_vigencia, prazo_revisao)
  SELECT pp.programa_id, pp.tipo_politica,
    COALESCE((SELECT max(v.numero) FROM public.politica_programa_versao v
              WHERE v.programa_id = pp.programa_id AND v.tipo_politica = pp.tipo_politica), 0) + 1,
    'Baseline Legaliza 2026.08 (site + SIGET)',
    pp.secoes, pp.inicio_vigencia, pp.prazo_revisao
  FROM public.politica_programa pp
  WHERE pp.programa_id = pid
    AND NOT EXISTS (
      SELECT 1 FROM public.politica_programa_versao v
      WHERE v.programa_id = pp.programa_id AND v.tipo_politica = pp.tipo_politica AND v.nota = 'Baseline Legaliza 2026.08 (site + SIGET)'
    );
END $$;
