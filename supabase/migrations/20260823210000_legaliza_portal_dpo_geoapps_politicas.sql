-- Legaliza: links do portal passam a ser as páginas FPSI; políticas no formato dos
-- documentos de portal (introdução, propósito, escopo, glossário, tratamento, direitos,
-- responsabilidades, vigência) preenchidas com fatos da organização; encarregado PJ
-- GeoApps (DPO as a Service) vinculada ao login jimxxx@gmail.com.
-- ANPD Res. CD/ANPD nº 18/2024, art. 12: encarregado pode ser pessoa natural ou jurídica.

DO $$
DECLARE
  pid integer;
  eid_geo integer;
  uid_jim uuid;
  nome_jim text;
  email_jim text := 'jimxxx@gmail.com';
  id_dpo integer;
  id_tic integer;
  cnpj_geo numeric := 14843252000197;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza' LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'Programa legaliza não encontrado — pulando seed DPO/políticas';
    RETURN;
  END IF;

  SELECT u.id, COALESCE(NULLIF(trim(p.nome), ''), 'Jorge')
    INTO uid_jim, nome_jim
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(u.email) = email_jim
  LIMIT 1;

  IF uid_jim IS NULL THEN
    RAISE EXCEPTION 'Usuário jimxxx@gmail.com não encontrado em auth.users';
  END IF;

  -- Links externos (homepage minhaterralegal) não devem substituir o portal FPSI
  UPDATE public.programa SET
    link_politica_privacidade = NULL,
    link_aviso_titular = NULL,
    link_cookies = NULL,
    link_termo_uso = NULL,
    link_declaracao_seguranca = NULL,
    dpo_notificacao_email = email_jim,
    dpo_ato_designacao_data = COALESCE(dpo_ato_designacao_data, DATE '2026-08-23'),
    dpo_ato_designacao_texto = 'Ato formal (Anexo II — pessoa jurídica) nos termos da Res. CD/ANPD nº 18/2024, art. 12: a Legaliza Brasil designou a GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA como encarregada (DPO as a Service). Pessoa natural responsável: ' || nome_jim || ' (' || email_jim || ').'
  WHERE id = pid;

  SELECT id INTO eid_geo FROM public.empresa WHERE cnpj = cnpj_geo LIMIT 1;
  IF eid_geo IS NULL THEN
    INSERT INTO public.empresa (
      cnpj, razao_social, nome_fantasia, email, telefone,
      atividade_principal, gestor_responsavel, created_by_user_id
    ) VALUES (
      cnpj_geo,
      'GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA',
      'GEOAPPS',
      email_jim,
      '(79) 99145-0095',
      'Desenvolvimento de sistemas e serviços de encarregado pelo tratamento de dados pessoais (DPO as a Service).',
      nome_jim,
      uid_jim
    ) RETURNING id INTO eid_geo;
  ELSE
    UPDATE public.empresa SET
      razao_social = 'GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA',
      nome_fantasia = COALESCE(NULLIF(trim(nome_fantasia), ''), 'GEOAPPS'),
      email = COALESCE(NULLIF(trim(email), ''), email_jim),
      telefone = COALESCE(NULLIF(trim(telefone), ''), '(79) 99145-0095'),
      created_by_user_id = COALESCE(created_by_user_id, uid_jim),
      gestor_responsavel = COALESCE(NULLIF(trim(gestor_responsavel), ''), nome_jim),
      atividade_principal = COALESCE(NULLIF(trim(atividade_principal), ''), 'Desenvolvimento de sistemas e serviços de encarregado pelo tratamento de dados pessoais (DPO as a Service).')
    WHERE id = eid_geo;
  END IF;

  SELECT r.id INTO id_dpo
  FROM public.responsavel r
  WHERE r.programa = pid
    AND r.tipo_pessoa = 'pessoa_juridica'
    AND (r.empresa_id = eid_geo OR r.cnpj = '14843252000197' OR lower(r.email) = email_jim)
  ORDER BY r.id
  LIMIT 1;

  IF id_dpo IS NULL THEN
    INSERT INTO public.responsavel (
      programa, nome, email, departamento, cargo, data_designacao, user_id,
      tipo_pessoa, empresa_id, cnpj, razao_social,
      pessoa_natural_responsavel_nome, pessoa_natural_responsavel_email
    ) VALUES (
      pid,
      'GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA',
      email_jim,
      'Encarregado (DPO as a Service)',
      'Encarregado pelo tratamento de dados pessoais',
      DATE '2026-08-23',
      uid_jim::text,
      'pessoa_juridica',
      eid_geo,
      '14843252000197',
      'GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA',
      nome_jim,
      email_jim
    ) RETURNING id INTO id_dpo;
  ELSE
    UPDATE public.responsavel SET
      nome = 'GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA',
      email = email_jim,
      departamento = 'Encarregado (DPO as a Service)',
      cargo = 'Encarregado pelo tratamento de dados pessoais',
      data_designacao = COALESCE(data_designacao, DATE '2026-08-23'),
      user_id = uid_jim::text,
      tipo_pessoa = 'pessoa_juridica',
      empresa_id = eid_geo,
      cnpj = '14843252000197',
      razao_social = 'GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA',
      pessoa_natural_responsavel_nome = nome_jim,
      pessoa_natural_responsavel_email = email_jim
    WHERE id = id_dpo;
  END IF;

  SELECT id INTO id_tic FROM public.responsavel
  WHERE programa = pid AND lower(email) = email_jim AND tipo_pessoa IS DISTINCT FROM 'pessoa_juridica'
  LIMIT 1;
  IF id_tic IS NULL THEN
    INSERT INTO public.responsavel (programa, nome, email, departamento, cargo, user_id, tipo_pessoa)
    VALUES (pid, nome_jim, email_jim, 'Tecnologia da Informação', 'Consultoria / reconstrução do SIGET', uid_jim::text, 'pessoa_natural')
    RETURNING id INTO id_tic;
  END IF;

  UPDATE public.programa SET
    encarregado_dados_pessoais = id_dpo,
    gestor_tic = COALESCE(gestor_tic, id_tic)
  WHERE id = pid;
END $$;

-- Políticas / documentos do portal (estrutura dos templates FPSI/PPSI, texto da Legaliza)
DO $$
DECLARE
  pid integer;
  sec_priv jsonb;
  sec_aviso jsonb;
  sec_cookies jsonb;
  sec_dec jsonb;
  sec_termo jsonb;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza' LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;

  sec_priv := $j$[
    {"id":0,"secao":"Política de Privacidade do portal","titulo":"Introdução","descricao":"Documento público ao titular.","texto":"<p>Esta Política de Privacidade descreve como a <strong>Legaliza Brasil Gestão Territorial Geotecnológica Ltda.</strong> (nome fantasia Legaliza Brasil), CNPJ 34.372.346/0001-32, trata dados pessoais no site institucional, no aplicativo e no SIGET, em conformidade com a Lei nº 13.709/2018 (LGPD) e com a Resolução CD/ANPD nº 18/2024.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Informar, em linguagem clara, as categorias de dados, finalidades, bases legais, compartilhamentos, prazos de retenção, medidas de segurança e os canais para exercício dos direitos do titular (art. 18 da LGPD) e para contato com o encarregado.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Aplica-se aos tratamentos em que a Legaliza é <strong>controladora</strong> (site, comercial, RH, operação própria) e àqueles em que atua como <strong>operadora</strong> de prefeituras na REURB/SIGET. Sede administrativa em Brasília/DF e matriz em Gouveia/MG.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p>Utilizam-se as definições do art. 5º da LGPD, em especial: titular, dado pessoal, dado sensível, controlador, operador, encarregado, tratamento, consentimento e anonimização. SIGET é o Sistema Integrado de Gestão Territorial usado na regularização fundiária.</p>"},
    {"id":4,"secao":"Tratamentos","titulo":"Dados, finalidades e bases legais","descricao":"","texto":"<p><strong>Dados:</strong> identificação e contato; credenciais e logs de acesso; cadastro REURB (titulares, documentos, fotos, coordenadas); dados agregados no mapa público; preferências de interface.</p><p><strong>Bases (art. 7º):</strong> execução de contrato e procedimentos preliminares (V); obrigação legal e políticas públicas na REURB (II e III); legítimo interesse em segurança da informação (IX); consentimento para cookies não essenciais e conteúdos de terceiros (YouTube).</p>"},
    {"id":5,"secao":"Compartilhamento","titulo":"Com quem compartilhamos","descricao":"","texto":"<p>Não vendemos dados pessoais. Há compartilhamento com prefeituras contratantes, cartórios, órgãos públicos e fornecedores de infraestrutura (hospedagem, e-mail), com cláusulas de proteção. YouTube somente após consentimento.</p>"},
    {"id":6,"secao":"Direitos do titular","titulo":"Canais","descricao":"","texto":"<p>Confirmação, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento podem ser exercidos neste portal ou pelo encarregado. Pedidos de cadastros REURB municipais podem ser encaminhados também à prefeitura controladora.</p>"},
    {"id":7,"secao":"Encarregado","titulo":"DPO as a Service","descricao":"","texto":"<p>O encarregado é a pessoa jurídica <strong>GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA</strong> (GeoApps), CNPJ 14.843.252/0001-97, na modalidade DPO as a Service (Res. CD/ANPD nº 18/2024, art. 12, II). A pessoa natural responsável perante a ANPD e os titulares está identificada no cadastro do programa e no portal. E-mail: <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>Compete à Legaliza decidir sobre tratamentos de que é controladora, manter este documento atualizado e atender titulares. À GeoApps, como encarregada, compete o canal com titulares e ANPD, orientação às equipes e demais atribuições do art. 16 do Regulamento da Res. 18/2024. Gestores e usuários do SIGET devem observar as diretrizes e reportar desvios.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Versão 2026.08 (23/08/2026). Revisão prevista em 12 meses ou quando houver mudança relevante de tratamento. Entra em vigor na data de publicação neste portal.</p>"}
  ]$j$::jsonb;

  sec_aviso := $j$[
    {"id":0,"secao":"Aviso do Portal do Titular","titulo":"Introdução","descricao":"","texto":"<p>Este aviso explica a finalidade deste portal, prazos e como a Legaliza Brasil identifica o titular para atender direitos da LGPD.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Facilitar o exercício dos direitos do art. 18 da LGPD e o contato com o encarregado, com registro de protocolo.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Abrange pedidos relativos ao site, ao SIGET e aos tratamentos em que a Legaliza é controladora. Demandas de REURB municipal podem envolver a prefeitura controladora.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p>Titular, pedido, protocolo, encarregado e controlador conforme a LGPD e a Res. CD/ANPD nº 18/2024.</p>"},
    {"id":4,"secao":"Conteúdo do aviso","titulo":"Informações ao titular","descricao":"","texto":"<p>Use os formulários deste portal ou escreva para o encarregado (GeoApps — DPO as a Service) em <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>. SAC Legaliza: (61) 99847-6013. Poderá ser exigida identificação mínima para evitar acesso indevido a dados de terceiros. O prazo de resposta observa o art. 19 da LGPD e orientações da ANPD.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>O portal é operado pela Legaliza. O encarregado (GeoApps) recebe e encaminha as solicitações. A área responsável registra e responde no prazo.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Vigência a partir de 23/08/2026. Revisão em até 12 meses.</p>"}
  ]$j$::jsonb;

  sec_cookies := $j$[
    {"id":0,"secao":"Política de Cookies","titulo":"Introdução","descricao":"","texto":"<p>Esta política descreve cookies e tecnologias semelhantes usados no site e no SIGET da Legaliza Brasil.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Informar categorias, finalidades, bases legais e como o titular gerencia preferências, em linha com a LGPD e boas práticas de transparência.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Aplica-se ao site institucional e ao SIGET. Não cobre cookies exclusivamente de sítios de terceiros visitados por conta própria do usuário.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p>Cookie: pequeno arquivo ou identificador armazenado no dispositivo. Cookies essenciais: necessários ao serviço. Cookies de preferência/analíticos/terceiros: dependem de consentimento quando não forem estritamente necessários.</p>"},
    {"id":4,"secao":"Tipos de cookies","titulo":"Categorias","descricao":"","texto":"<p><strong>Essenciais (sempre ativos):</strong> sessão autenticada (httpOnly) e registro da escolha de consentimento.</p><p><strong>Preferências:</strong> layout (sidebar/painéis) em localStorage.</p><p><strong>Terceiros:</strong> YouTube (youtube-nocookie.com) somente após consentimento. O titular pode recusar cookies não essenciais e continuar a usar o restante do site.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>A Legaliza configura o banner e as tecnologias. O encarregado orienta sobre bases legais. O titular gerencia preferências no próprio banner ou nas configurações do navegador.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Versão 2026.08. Revisão em 12 meses ou quando houver nova tecnologia de rastreamento.</p>"}
  ]$j$::jsonb;

  sec_dec := $j$[
    {"id":0,"secao":"Declaração de Segurança","titulo":"Introdução","descricao":"","texto":"<p>Declaração pública, em linguagem acessível, das medidas técnicas e organizacionais adotadas pela Legaliza Brasil. Não substitui certificação ISO/IEC 27001.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Demonstrar o compromisso com os arts. 46 e 50 da LGPD e permitir ao titular avaliar, em linhas gerais, as salvaguardas do SIGET e do site.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Ambientes digitais da Legaliza (site, SIGET, evidências de REURB). Fornecedores de nuvem e e-mail atuam como operadores com medidas contratuais.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p>Medidas técnicas e organizacionais, RBAC, trilha de auditoria, incidente de segurança e notificação nos termos da LGPD e guias da ANPD.</p>"},
    {"id":4,"secao":"Medidas","titulo":"Controles adotados","descricao":"","texto":"<ul><li>Criptografia em trânsito (HTTPS);</li><li>Sessão em cookie httpOnly com SameSite;</li><li>Controle de acesso por grupo, unidade e funcionalidade;</li><li>Aceite bloqueante de termos e trilha de consentimento;</li><li>Auditoria de login;</li><li>YouTube condicionado a consentimento; mapa público sem PII;</li><li>Segregação de base operacional e arquivos de evidência.</li></ul><p>Incidentes devem ser comunicados ao encarregado (GeoApps).</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>TI e segurança implementam controles. O encarregado é informado de incidentes com dados pessoais. Usuários não compartilham credenciais nem exportam dados fora do escopo da função.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Vigência 23/08/2026. Revisão anual ou após incidente relevante.</p>"}
  ]$j$::jsonb;

  sec_termo := $j$[
    {"id":0,"secao":"Termos de Uso","titulo":"Introdução","descricao":"","texto":"<p>Estes Termos regulam o acesso ao SIGET e aos canais digitais da Legaliza Brasil. Ao entrar, o usuário declara ter lido estes Termos e a Política de Privacidade.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Definir condições de uso, deveres do usuário autorizado e limites de responsabilidade, em complemento à LGPD.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Usuários autorizados do SIGET/REURB e visitantes do site. O aceite pode ser registrado e invalidado se a administração alterar os termos.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p>Usuário autorizado, credencial, evidência processual (fotos e coordenadas) e foro competente.</p>"},
    {"id":4,"secao":"Condições de uso","titulo":"Credenciais, sigilo e vedações","descricao":"","texto":"<p>Login e senha são pessoais e intransferíveis. É vedado compartilhar credenciais, exportar dados fora do escopo da função, alterar fotos/GPS/documentos de forma fraudulenta ou tentar contornar a segurança. Os dados do SIGET são confidenciais. Foro: Brasília/DF, salvo disposição legal em contrário.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>A Legaliza opera o serviço. O usuário responde pelo uso da conta. O encarregado atua nos canais de privacidade. Dúvidas: canal do portal ou e-mail do encarregado.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Vigência 23/08/2026. Alterações serão publicadas neste portal. Revisão em 12 meses.</p>"}
  ]$j$::jsonb;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES
    (pid, 'politica_protecao_dados_pessoais', sec_priv, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()),
    (pid, 'documento_portal_politica_privacidade', sec_priv, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()),
    (pid, 'documento_portal_aviso_titular', sec_aviso, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()),
    (pid, 'documento_portal_cookies', sec_cookies, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()),
    (pid, 'documento_portal_declaracao_seguranca', sec_dec, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now()),
    (pid, 'documento_portal_termo_uso', sec_termo, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now())
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes,
    status = 'publicado',
    publicado_em = now(),
    inicio_vigencia = EXCLUDED.inicio_vigencia,
    prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa_versao (programa_id, tipo_politica, numero, nota, secoes_snapshot, inicio_vigencia, prazo_revisao)
  SELECT pp.programa_id, pp.tipo_politica,
    COALESCE((SELECT max(v.numero) FROM public.politica_programa_versao v
              WHERE v.programa_id = pp.programa_id AND v.tipo_politica = pp.tipo_politica), 0) + 1,
    'Legaliza 2026.08 — templates FPSI/portal + DPO GeoApps (PJ)',
    pp.secoes, pp.inicio_vigencia, pp.prazo_revisao
  FROM public.politica_programa pp
  WHERE pp.programa_id = pid
    AND pp.tipo_politica IN (
      'politica_protecao_dados_pessoais',
      'documento_portal_politica_privacidade',
      'documento_portal_aviso_titular',
      'documento_portal_cookies',
      'documento_portal_declaracao_seguranca',
      'documento_portal_termo_uso'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.politica_programa_versao v
      WHERE v.programa_id = pp.programa_id AND v.tipo_politica = pp.tipo_politica
        AND v.nota = 'Legaliza 2026.08 — templates FPSI/portal + DPO GeoApps (PJ)'
    );
END $$;
