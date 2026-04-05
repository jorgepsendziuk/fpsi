-- ============================================
-- Programa de privacidade do software FPSI (slug fpsi)
-- Mapeamento de dados, ROPA (ANPD + operações), política de proteção de dados,
-- papéis LGPD (controlador / operadores). Idempotente: prefixo "FPSI — ".
-- ============================================

DO $$
DECLARE
  pid INTEGER;
  rid INTEGER;
  pr RECORD;
  v_org TEXT;
  v_cnpj TEXT;
  v_email TEXT;
  v_fone TEXT;
  v_site TEXT;
  v_ativ TEXT;
  v_end TEXT;
  id_ctrl BIGINT;
  id_sub_db BIGINT;
  id_sub_host BIGINT;
  ja_papel BOOLEAN;
  mid1 BIGINT;
  mid2 BIGINT;
  mid3 BIGINT;
  mid4 BIGINT;
  mid5 BIGINT;
  mid6 BIGINT;
BEGIN
  SELECT * INTO pr FROM public.programa WHERE slug = 'fpsi' LIMIT 1;
  IF NOT FOUND THEN
    RAISE NOTICE 'seed_fpsi_privacidade: programa slug fpsi não encontrado; crie-o na interface e rode a migration novamente.';
    RETURN;
  END IF;

  pid := pr.id;

  v_org := NULLIF(trim(COALESCE(pr.razao_social, pr.nome_fantasia, pr.nome, '')), '');
  IF v_org IS NULL THEN
    v_org := 'Operação desta instância FPSI (preencher razão social no cadastro do programa)';
  END IF;

  IF pr.cnpj IS NOT NULL AND pr.cnpj::numeric <> 0 THEN
    v_cnpj := lpad((trunc(abs(pr.cnpj)))::bigint::text, 14, '0');
    v_cnpj := substring(v_cnpj, 1, 2) || '.' || substring(v_cnpj, 3, 3) || '.' || substring(v_cnpj, 6, 3)
      || '/' || substring(v_cnpj, 9, 4) || '-' || substring(v_cnpj, 13, 2);
  ELSE
    v_cnpj := NULL;
  END IF;

  v_email := NULLIF(trim(COALESCE(pr.atendimento_email, '')), '');
  v_fone := NULLIF(trim(COALESCE(pr.atendimento_fone, '')), '');
  v_site := NULLIF(trim(COALESCE(pr.atendimento_site, '')), '');
  v_ativ := NULLIF(trim(COALESCE(pr.atividade_principal_organizacao, pr.descricao_escopo, '')), '');
  IF v_ativ IS NULL THEN
    v_ativ := 'Operação da plataforma web FPSI (framework de privacidade e segurança da informação alinhado ao PPSI/LGPD), em modelo multi-inquilino, com autenticação, programas de conformidade, portal de titulares e trilha de auditoria.';
  END IF;
  v_end := NULL;

  UPDATE public.programa p
  SET
    atividade_principal_organizacao = COALESCE(p.atividade_principal_organizacao, v_ativ),
    descricao_escopo = COALESCE(
      NULLIF(trim(p.descricao_escopo), ''),
      'Programa de privacidade e SI que documenta o tratamento de dados pessoais realizado pela operação desta instância do software FPSI e pelos subprocessadores de infraestrutura indicados no ROPA.'
    )
  WHERE p.id = pid
    AND (p.atividade_principal_organizacao IS NULL OR trim(p.atividade_principal_organizacao) = ''
      OR p.descricao_escopo IS NULL OR trim(p.descricao_escopo) = '');

  DELETE FROM public.ropa r
  WHERE r.programa_id = pid AND r.nome LIKE 'FPSI — %';

  DELETE FROM public.mapeamento_dados m
  WHERE m.programa_id = pid AND m.nome LIKE 'FPSI — %';

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
    v_org,
    v_cnpj,
    v_end,
    v_ativ,
    NULL,
    v_email,
    v_fone,
    CURRENT_DATE,
    '["titulares_em_geral","criancas_adolescentes"]'::jsonb,
    'HTTPS, autenticação (Supabase Auth), controle de acesso por programa e permissões, segregação lógica multi-inquilino, hashing de senhas, backups e registro de auditoria de operações na aplicação. Recomenda-se MFA para contas administrativas.',
    '["nome","email","cpf","telefone","endereco"]'::jsonb,
    'Endereço IP, identificadores de sessão, user-agent, registros técnicos de navegação; conteúdo livre inserido pelos usuários nos módulos (ROPA, diagnóstico, pedidos de titulares, etc.) conforme o caso de uso de cada cliente.',
    'Prestadores de infraestrutura (ex.: Supabase — base de dados e autenticação; fornecedor de hospedagem da aplicação). Modelos de IA, quando ativados, processam apenas metadados indicados na operação correspondente — não enviar dados pessoais de titulares nas sugestões automáticas.',
    'Contas de usuário: enquanto a conta existir e até eliminação ou prazo de inatividade definido pela operação; registros de auditoria: em regra até 12–24 meses salvo obrigação legal; pedidos de titulares e conteúdo de programas: conforme política do responsável pelo programa e legislação aplicável.',
    'Documento gerado como referência para a instância FPSI. Ajuste CNPJ, endereço, encarregado (DPO) e subprocessadores à sua realidade contratual e à região escolhida nos serviços em nuvem. Em instalações self-hosted, o perfil de controlador/operador pode diferir.'
  )
  ON CONFLICT (programa_id) DO UPDATE SET
    organizacao = COALESCE(EXCLUDED.organizacao, public.registro_ropa.organizacao),
    cnpj = COALESCE(EXCLUDED.cnpj, public.registro_ropa.cnpj),
    endereco = COALESCE(EXCLUDED.endereco, public.registro_ropa.endereco),
    atividade_principal = COALESCE(EXCLUDED.atividade_principal, public.registro_ropa.atividade_principal),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.registro_ropa.email),
    telefone = COALESCE(NULLIF(EXCLUDED.telefone, ''), public.registro_ropa.telefone),
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

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, setor_outro, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, meios_outro, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid,
    'FPSI — Contas de usuários e autenticação',
    'Registro de usuários da plataforma, credenciais, perfil básico e permissões por programa (convites, membros).',
    'Supabase Auth; aplicação FPSI (Next.js); base PostgreSQL.',
    'ti', NULL, 'execucao_contrato', NULL,
    '["sistema_interno","nuvem","site_app"]'::jsonb, NULL,
    '["identificacao","contato"]'::jsonb, NULL,
    'apenas_interno', NULL,
    'cliente', NULL, 'nao_sei'
  ) RETURNING id INTO mid1;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, setor_outro, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, meios_outro, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid,
    'FPSI — Dados operacionais nos programas de conformidade',
    'Informações inseridas pelos usuários nos módulos (diagnóstico, ROPA, políticas, governança, planos, etc.) relativas aos respectivos programas de privacidade/SI dos clientes.',
    'Base de dados do FPSI; armazenamento de ficheiros quando configurado.',
    'operacoes', NULL, 'execucao_contrato',
    'Execução do serviço contratual ou institucional de gestão de programas PPSI/LGPD em ambiente multi-inquilino.',
    '["sistema_interno","nuvem"]'::jsonb, NULL,
    '["identificacao","contato","preferencias","outros_tipos"]'::jsonb,
    'Conteúdo variável conforme cada programa (pode incluir dados de terceiros inseridos pelo responsável pelo programa).',
    'apenas_interno', NULL,
    'cliente', NULL, 'nao_sei'
  ) RETURNING id INTO mid2;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, setor_outro, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, meios_outro, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid,
    'FPSI — Registos de auditoria e segurança',
    'Trilha de atividades na aplicação autenticada (quem alterou o quê), endereço IP e agente quando registrados nas APIs.',
    'Servidor FPSI; PostgreSQL.',
    'ti', NULL, 'seguranca',
    'Prevenção a fraude, integridade, responsabilização e continuidade do serviço (Controle 8 / art. 37 LGPD, conforme implementação).',
    '["sistema_interno","nuvem"]'::jsonb, NULL,
    '["identificacao","outros_tipos"]'::jsonb,
    'Identificador de usuário, tipo de ação, recurso, data/hora; IP e user-agent quando aplicável.',
    'apenas_interno', NULL,
    'colaborador', NULL, 'nao_sei'
  ) RETURNING id INTO mid3;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, setor_outro, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, meios_outro, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid,
    'FPSI — Portal público e pedidos dos titulares (art. 18 LGPD)',
    'Formulários públicos por programa: exercício de direitos, contatos e protocolos associados.',
    'Site/app FPSI; e-mail de notificação quando configurado.',
    'atendimento', NULL, 'obrigacao_legal', NULL,
    '["site_app","sistema_interno","email_mensageria"]'::jsonb, NULL,
    '["identificacao","contato","outros_tipos"]'::jsonb,
    'Conteúdo livre do titular no pedido; documentos anexados quando permitido.',
    'apenas_interno', NULL,
    'cliente', NULL, 'nao_sei'
  ) RETURNING id INTO mid4;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, setor_outro, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, meios_outro, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid,
    'FPSI — Assistência por IA (sugestões de mapeamento)',
    'Pedidos ao modelo de linguagem com metadados do programa/organização para rascunhar levantamentos; sem envio obrigatório de dados pessoais de titulares.',
    'API de modelo de linguagem configurada no servidor FPSI.',
    'ti', NULL, 'execucao_contrato',
    'Apoio operacional ao preenchimento do inventário, sujeito a revisão humana e validação no servidor.',
    '["nuvem"]'::jsonb, NULL,
    '["outros_tipos"]'::jsonb,
    'Texto descritivo institucional; não incluir dados identificativos de titulares nas mensagens.',
    'empresa_externa',
    'Fornecedor do modelo de IA (conforme configuração da instância).',
    'cliente', NULL, 'nao_sei'
  ) RETURNING id INTO mid5;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes,
    setor_area, setor_outro, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, meios_outro, tipos_dados, tipos_outro,
    fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES
  (
    pid,
    'FPSI — Dados automáticos — logs, navegação e cookies técnicos',
    'Registros técnicos de acesso (IP, rota, sessão, user-agent), cookies necessários à operação e métricas agregadas.',
    'Servidor FPSI; CDN/hospedagem; navegador.',
    'ti', NULL, 'seguranca',
    'Funcionamento seguro do site, diagnóstico de erros e melhoria de desempenho.',
    '["sistema_interno","nuvem","site_app"]'::jsonb, NULL,
    '["outros_tipos"]'::jsonb,
    'IP, data/hora, URL, cookies técnicos, user-agent.',
    'apenas_interno', NULL,
    'visitante', NULL, 'nao_sei'
  ) RETURNING id INTO mid6;

  INSERT INTO public.ropa (
    programa_id, registro_ropa_id, mapeamento_id, nome, finalidade, base_legal,
    categorias_dados, categorias_titulares, compartilhamento, retencao, medidas_seguranca, responsavel
  ) VALUES
  (
    pid, rid, mid1,
    'FPSI — Contas de usuários e autenticação',
    'Criar e gerenciar contas, autenticar, aplicar autorização por programa e comunicar convites.',
    'Art. 7º, V e IX LGPD — execução de contrato; legítimo interesse (segurança)',
    'Nome, e-mail, hash de senha, identificadores de sessão, papéis e permissões, registro de convites',
    'Usuários da plataforma (consultores, gestores, administradores)',
    'Subprocessadores de infraestrutura (base de dados e auth) conforme contratos; sem venda de dados a terceiros.',
    'Enquanto a conta estiver ativa; após cancelamento, eliminação ou anonimização em prazo compatível com auditoria e defesa de direitos.',
    'HTTPS, Supabase Auth, RBAC por programa, convites auditáveis',
    NULL
  ),
  (
    pid, rid, mid2,
    'FPSI — Tratamento de dados nos programas de conformidade (multi-inquilino)',
    'Permitir que cada cliente gerencie o respectivo programa (diagnóstico, ROPA, políticas, governança, etc.).',
    'Art. 7º, V e VI LGPD — contrato/prestação; procedimentos preliminares',
    'Variável: dados cadastrais, respostas a questionários, textos de políticas, anexos, metadados de fluxo de trabalho',
    'Titulares em geral afetados pelos programas configurados pelo cliente; usuários como operadores',
    'Isolamento lógico por programa; o cliente da instância define finalidades face aos titulares finais dos seus programas.',
    'Conforme política de retenção definida pelo responsável pelo programa e requisitos legais do caso.',
    'Isolamento por programa_id, permissões granulares, cópias de segurança, auditoria de alterações',
    NULL
  ),
  (
    pid, rid, mid3,
    'FPSI — Auditoria e registros de segurança',
    'Registrar operações relevantes para prestação de contas, investigação de incidentes e conformidade.',
    'Art. 7º, VI e IX LGPD — direitos; legítimo interesse; registro legal',
    'Identificação do usuário, tipo de evento, recurso, carimbo temporal, IP e user-agent quando armazenados',
    'Usuários autenticados',
    'Acesso restrito a perfis autorizados; não uso para marketing.',
    'Tipicamente 12–24 meses, salvo necessidade de defesa legal ou investigação.',
    'Controle de acesso a logs, integridade, minimização',
    NULL
  ),
  (
    pid, rid, mid4,
    'FPSI — Portal de titulares e pedidos (art. 18 LGPD)',
    'Receber e processar pedidos de direitos dos titulares por programa.',
    'Art. 7º, II LGPD — obrigação legal',
    'Dados fornecidos pelo titular no formulário e anexos; protocolo e histórico de tratamento interno',
    'Titulares de dados que acionam o programa pelo portal',
    'Equipa do programa destinatário; sem divulgação comercial.',
    'Prazo legal de guarda de registros de atendimento após conclusão do pedido, conforme política interna e lei.',
    'Formulários seguros, autenticação de operadores, registro de acessos',
    NULL
  ),
  (
    pid, rid, mid5,
    'FPSI — Processamento de metadados para sugestões por IA',
    'Gerar rascunhos estruturados para o módulo de mapeamento com base em descrições institucionais.',
    'Art. 7º, V e IX LGPD — funcionalidade IA (contrato); legítimo interesse',
    'Texto descritivo do programa/organização enviado ao modelo; respostas estruturadas validadas no servidor',
    'Não se trata de tratamento direto de titulares finais desde que não se incluam dados pessoais nas mensagens',
    'Fornecedor de IA como encarregado de meios, conforme configuração',
    'Retenção mínima de prompts/respostas conforme política da instância; recomenda-se não armazenar conteúdo sensível.',
    'Validação por listas fechadas, aviso de revisão humana obrigatória, sem treino com dados dos clientes salvo contrato específico',
    NULL
  ),
  (
    pid, rid, mid6,
    'FPSI — Logs técnicos, navegação e cookies essenciais',
    'Garantir disponibilidade, segurança perimetral e estatísticas técnicas agregadas.',
    'Art. 7º, IX LGPD — legítimo interesse; arts. 8–9 se cookies opcionais',
    'IP, identificadores de sessão, URLs, user-agent, cookies técnicos',
    'Visitantes e usuários do site/aplicação',
    'Prestadores de hospedagem/CDN como subprocessadores',
    'Logs de curto/médio prazo; política de cookies publicada no portal quando aplicável.',
    'TLS, hardening, gestão de sessão, política de cookies alinhada à LGPD',
    NULL
  );

  INSERT INTO public.politica_programa (
    programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao
  ) VALUES (
    pid,
    'politica_protecao_dados_pessoais',
    $json$[
      {"id":0,"secao":"Política de privacidade","titulo":"Escopo e responsável","descricao":"","texto":"<p>Esta política descreve o tratamento de dados pessoais realizado pela operação desta <strong>instância do software FPSI</strong> (framework de privacidade e segurança da informação). O FPSI é uma aplicação web multi-inquilino: a organização que opera esta instância é, em regra, responsável perante os usuários da plataforma e deve indicar o contato do encarregado de proteção de dados (DPO), quando houver, nos canais institucionais e no cadastro do programa.</p><p>Os <strong>programas de conformidade</strong> criados dentro do FPSI tratam dados inseridos pelos clientes para as respectivas finalidades (ROPA, diagnóstico, portal de titulares, etc.). O titular final desses dados é informado por meio dos avisos e políticas publicados por cada programa.</p>"},
      {"id":1,"secao":"Dados tratados","titulo":"Quais dados coletamos","descricao":"","texto":"<p><strong>Conta e acesso:</strong> nome, e-mail, credenciais de autenticação e permissões por programa.</p><p><strong>Uso da aplicação:</strong> conteúdos e respostas inseridos nos módulos (diagnóstico, planos, políticas, ROPA, governança, pedidos de titulares).</p><p><strong>Segurança e auditoria:</strong> registros técnicos como data/hora, tipo de ação, identificação do usuário na aplicação e, quando aplicável, endereço IP e agente de usuário.</p><p><strong>Portal público:</strong> dados enviados voluntariamente pelo titular no exercício de direitos (art. 18 da LGPD).</p><p><strong>Funcionalidades opcionais:</strong> sugestões por IA recebem apenas metadados ou texto descritivo que o usuário enviar — não deve incluir dados pessoais desnecessários de titulares.</p>"},
      {"id":2,"secao":"Finalidades e bases legais","titulo":"Por que tratamos dados","descricao":"","texto":"<p>Tratamos dados para <strong>prestar o serviço</strong> (execução de contrato ou relação pré-contratual), <strong>cumprir obrigações legais</strong> (por exemplo, atendimento a titulares), <strong>proteger o serviço e os usuários</strong> (legítimo interesse e segurança da informação) e, quando aplicável, com base em <strong>consentimento</strong> para cookies ou comunicações não essenciais.</p>"},
      {"id":3,"secao":"Compartilhamento e subprocessadores","titulo":"Com quem compartilhamos","descricao":"","texto":"<p>Usamos prestadores de infraestrutura para hospedar a aplicação e o banco de dados (por exemplo, <strong>Supabase</strong> para autenticação e armazenamento). Eles atuam, em regra, como <strong>operadores</strong> de tratamento, mediante contrato ou termos aplicáveis. A localização dos dados depende da configuração da sua instância (região do projeto e fornecedores escolhidos).</p><p>Não vendemos dados pessoais. Pode haver compartilhamento quando exigido por lei ou ordem judicial.</p>"},
      {"id":4,"secao":"Direitos dos titulares","titulo":"Como exercer seus direitos","descricao":"","texto":"<p>Em relação aos dados da <strong>conta na plataforma</strong>, o titular pode solicitar acesso, correção, eliminação, portabilidade, informação sobre compartilhamentos e outras medidas previstas na LGPD, contatando os canais indicados pelo responsável por esta instância.</p><p>Em relação a dados tratados no âmbito de um <strong>programa específico</strong> (por exemplo, pedido via portal público), aplicam-se os contatos e fluxos definidos nesse programa.</p>"},
      {"id":5,"secao":"Segurança e retenção","titulo":"Proteção e prazos","descricao":"","texto":"<p>Aplicamos medidas técnicas e organizacionais adequadas: comunicação cifrada (HTTPS), gestão de acessos, segregação por programa, backups e trilha de auditoria. Os prazos de retenção seguem a finalidade (conta ativa, obrigação legal, resolução de litígios) e políticas internas do responsável pela instância.</p>"},
      {"id":6,"secao":"Atualizações","titulo":"Alterações a esta política","descricao":"","texto":"<p>Esta política pode ser atualizada para refletir evoluções do produto ou requisitos legais. Ajuste as datas de vigência e revisão no sistema e comunique alterações relevantes aos usuários quando necessário.</p>"}
    ]$json$::jsonb,
    CURRENT_DATE,
    (CURRENT_DATE + INTERVAL '12 months')::date
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes,
    inicio_vigencia = COALESCE(public.politica_programa.inicio_vigencia, EXCLUDED.inicio_vigencia),
    prazo_revisao = COALESCE(public.politica_programa.prazo_revisao, EXCLUDED.prazo_revisao);

  SELECT EXISTS (
    SELECT 1 FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid
  ) INTO ja_papel;

  IF ja_papel THEN
    RAISE NOTICE 'seed_fpsi_privacidade: papéis LGPD já existem para programa_id=% — mantidos.', pid;
  ELSE
    INSERT INTO public.programa_papel_lgpd_instituicao (programa_id, tipo_papel, ordem, nome, descricao, contato, email, site)
    VALUES
      (pid, 'controlador', 0, v_org,
       'Responsável pela operação desta instância FPSI e pelas decisões sobre o tratamento de dados dos usuários da plataforma, sem prejuízo das responsabilidades dos clientes sobre os programas que criam.',
       NULL, v_email, v_site),
      (pid, 'operador', 0, 'Supabase (base de dados e autenticação)',
       'Tratamento de dados pessoais na qualidade de fornecedor de infraestrutura (PostgreSQL, Auth), conforme região e termos do projeto.',
       NULL, NULL, 'https://supabase.com'),
      (pid, 'operador', 1, 'Fornecedor de hospedagem da aplicação',
       'Execução da aplicação web FPSI (ex.: Vercel, servidor próprio ou outro IaaS/PaaS configurado nesta instância).',
       NULL, NULL, NULL);

    SELECT id INTO id_ctrl FROM public.programa_papel_lgpd_instituicao
      WHERE programa_id = pid AND tipo_papel = 'controlador' ORDER BY ordem LIMIT 1;
    SELECT id INTO id_sub_db FROM public.programa_papel_lgpd_instituicao
      WHERE programa_id = pid AND nome = 'Supabase (base de dados e autenticação)' LIMIT 1;
    SELECT id INTO id_sub_host FROM public.programa_papel_lgpd_instituicao
      WHERE programa_id = pid AND nome = 'Fornecedor de hospedagem da aplicação' LIMIT 1;

    INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, instituicao_destino_id, destino_tipo_papel, tipo_vinculo, ordem)
    VALUES
      (pid, id_sub_db, NULL, 'controlador', 'Encargo de tratamento / termos do fornecedor', 0),
      (pid, id_sub_host, NULL, 'controlador', 'Encargo de tratamento / hospedagem', 1);
  END IF;

  RAISE NOTICE 'seed_fpsi_privacidade: concluído para programa_id=% (slug fpsi).', pid;
END $$;
