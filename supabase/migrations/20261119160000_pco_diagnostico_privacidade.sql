-- Diagnóstico preventivo de LGPD do Partido da Causa Operária (PCO).
-- Dono do programa no FPSI: jimxxx@gmail.com.
-- Fonte: observação pública em 19/11/2026 (pco.org.br e ficha do TSE).
-- Não conclui irregularidade. "Não localizado publicamente" não significa inexistente.
-- Sistemas, fornecedores, bases legais, responsáveis e processos internos não confirmados ficam como A VALIDAR.
-- Idempotente pelo slug pco-diagnostico e pelo prefixo "PCO — " nos registros gerados.

DO $$
DECLARE
  pid integer;
  eid integer;
  uid_jim text;
  nome_jim text;
  perms jsonb := '{
    "can_view_diagnosticos":true,"can_edit_diagnosticos":true,"can_create_diagnosticos":true,"can_delete_diagnosticos":true,
    "can_view_medidas":true,"can_edit_medidas":true,"can_approve_medidas":true,
    "can_view_planos":true,"can_edit_planos":true,"can_approve_planos":true,
    "can_view_politicas":true,"can_edit_politicas":true,"can_publish_politicas":true,
    "can_view_relatorios":true,"can_export_relatorios":true,"can_share_relatorios":true,
    "can_view_users":true,"can_invite_users":true,"can_remove_users":true,"can_change_roles":true,
    "can_view_programa":true,"can_edit_programa":true,"can_delete_programa":true
  }'::jsonb;
  escopo jsonb := '{
    "v":1,
    "diagnosticos":{"1":true,"2":true,"3":true,"4":false},
    "modulos":{
      "escritorio-governanca":true,"responsabilidades":true,"riscos":true,
      "conformidade-tratamento":true,"conformidade-mapeamento":true,"conformidade-ropa":true,
      "conformidade-ripd":true,"conformidade-incidentes":true,"diagnostico":true,
      "planos-acao":true,"politicas":true,"portal-privacidade":true,
      "inventario-ia":false,"ativos":true,"usuarios":true,"auditoria":true
    },
    "comites":{"si":true,"priva":true,"etir":true,"ia":false},
    "controles_ignorados":[],
    "medidas_ignoradas":[]
  }'::jsonb;
  ativ text := $t$Partido político. No site público observa-se filiação, comunicação e organização partidária. CNAE, CNPJ do controlador nacional e organograma interno: A VALIDAR. Um agregador cadastral público associa o CNPJ 12.197.071/0001-05 à razão PARTIDO DA CAUSA OPERARIA - PCO, com natureza de órgão de direção regional e endereço em São Paulo. Isso não é tratado aqui como CNPJ confirmado do órgão nacional.$t$;
  endereco_txt text := $t$Endereço constante da ficha pública do TSE (consultada em 19/11/2026): SDS, Bloco D, Edifício Eldorado, Sala 118, Asa Sul, Brasília/DF, CEP 70392-901. Há outro endereço em agregador cadastral (Rua Miguel Estefano, 349, Saúde, São Paulo/SP) ligado ao CNPJ regional citado acima. Qual endereço corresponde ao controlador da filiação online: A VALIDAR.$t$;
  escopo_txt text := $t$Diagnóstico preventivo de LGPD e governança de dados do Partido da Causa Operária, aberto em 19/11/2026. Ponto de partida: formulário público de filiação em https://pco.org.br/filiar/. A filiação partidária é dado pessoal sensível (art. 5º, II, da LGPD). Este programa não conclui irregularidade.

Como ler cada achado: CONFIRMADO = fato público ou classificação legal objetiva; EVIDÊNCIA = o que foi visto no HTML, no cabeçalho HTTP ou em página oficial naquela data; HIPÓTESE = explicação plausível ainda não confirmada pelo partido; A VALIDAR = dado interno, contrato, sistema, base legal ou responsável que este diagnóstico não inventa. "Não localizado publicamente" não significa inexistente.

Páginas lidas: https://pco.org.br/ , /filiar/ , /politica-de-privacidade/ e /contato/ . Também a ficha do partido no TSE. Há política de privacidade publicada; o texto é o modelo padrão do WordPress (comentários, Gravatar, cookies de login, mídia incorporada e antispam) e não descreve a filiação nem identifica encarregado. No HTML de /filiar/ não há as palavras privacidade, LGPD, encarregado, cookie ou consentimento.

Indicadores de maturidade (qualitativos; a nota PPSI não foi calculada porque o questionário não foi respondido com evidência interna):
- Transparência da filiação ao titular: inicial.
- Encarregado identificado em público: não localizado nas páginas consultadas.
- Registro de tratamento: em estruturação neste diagnóstico, pendente de validação.
- Operadores e contratos: não avaliados.
- Segurança: HTTPS e Cloudflare Turnstile observados; demais controles A VALIDAR.
- Maturidade numérica PPSI: não calculada.

O portal deste slug é o canal de acompanhamento proposto dentro do FPSI. Não está divulgado no site do PCO e não substitui o canal oficial até o partido validar.$t$;
BEGIN
  SELECT id::text INTO uid_jim FROM auth.users WHERE email = 'jimxxx@gmail.com' LIMIT 1;
  IF uid_jim IS NULL THEN
    RAISE EXCEPTION 'Usuário jimxxx@gmail.com não encontrado em auth.users';
  END IF;

  SELECT COALESCE(NULLIF(trim(p.nome), ''), 'Conta FPSI') INTO nome_jim
  FROM public.profiles p WHERE p.email = 'jimxxx@gmail.com' LIMIT 1;
  IF nome_jim IS NULL THEN nome_jim := 'Conta FPSI'; END IF;

  SELECT id INTO eid FROM public.empresa
  WHERE razao_social = 'PARTIDO DA CAUSA OPERÁRIA (PCO)' LIMIT 1;
  IF eid IS NULL THEN
    INSERT INTO public.empresa (
      razao_social, nome_fantasia, endereco, atividade_principal,
      gestor_responsavel, email, telefone
    ) VALUES (
      'PARTIDO DA CAUSA OPERÁRIA (PCO)',
      'PCO',
      endereco_txt,
      ativ,
      'A VALIDAR — gestor do programa de privacidade não localizado publicamente',
      'sorg@sorg.pco.org.br',
      NULL
    ) RETURNING id INTO eid;
  ELSE
    UPDATE public.empresa SET
      nome_fantasia = 'PCO',
      endereco = endereco_txt,
      atividade_principal = ativ,
      gestor_responsavel = 'A VALIDAR — gestor do programa de privacidade não localizado publicamente',
      email = 'sorg@sorg.pco.org.br',
      telefone = NULL
    WHERE id = eid;
  END IF;

  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico' LIMIT 1;
  IF pid IS NULL THEN
    INSERT INTO public.programa (
      nome, slug, tipo_programa, setor, empresa_id,
      razao_social, nome_fantasia, endereco,
      atendimento_site, atividade_principal_organizacao, descricao_escopo,
      sigla, unidade, link_politica_privacidade,
      perfil_escopo, gi_alvo, escopo
    ) VALUES (
      'Diagnóstico de Privacidade — Partido da Causa Operária (PCO)',
      'pco-diagnostico',
      'empresa_organizacao',
      2,
      eid,
      'PARTIDO DA CAUSA OPERÁRIA (PCO)',
      'PCO — diagnóstico de privacidade (FPSI)',
      endereco_txt,
      'https://pco.org.br/',
      ativ,
      escopo_txt,
      'PCO',
      'Órgão nacional informado na ficha do TSE; diretórios A VALIDAR',
      'https://pco.org.br/politica-de-privacidade/',
      'completo',
      'G1',
      escopo
    ) RETURNING id INTO pid;
  ELSE
    UPDATE public.programa SET
      nome = 'Diagnóstico de Privacidade — Partido da Causa Operária (PCO)',
      tipo_programa = 'empresa_organizacao',
      setor = 2,
      empresa_id = eid,
      razao_social = 'PARTIDO DA CAUSA OPERÁRIA (PCO)',
      nome_fantasia = 'PCO — diagnóstico de privacidade (FPSI)',
      endereco = endereco_txt,
      atendimento_site = 'https://pco.org.br/',
      atendimento_email = NULL,
      atendimento_fone = NULL,
      atividade_principal_organizacao = ativ,
      descricao_escopo = escopo_txt,
      sigla = 'PCO',
      unidade = 'Órgão nacional informado na ficha do TSE; diretórios A VALIDAR',
      link_politica_privacidade = 'https://pco.org.br/politica-de-privacidade/',
      link_aviso_titular = NULL,
      link_cookies = NULL,
      link_declaracao_seguranca = NULL,
      link_termo_uso = NULL,
      perfil_escopo = 'completo',
      gi_alvo = 'G1',
      escopo = escopo,
      encarregado_dados_pessoais = NULL,
      dpo_notificacao_email = NULL,
      dpo_ato_designacao_data = NULL,
      dpo_ato_designacao_texto = 'A VALIDAR. Encarregado não localizado nas páginas públicas consultadas em 19/11/2026. Isso não afirma que não haja designação interna.',
      dpo_conflito_interesses_avaliado = false
    WHERE id = pid;
  END IF;

  INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status, accepted_at)
  VALUES (pid, uid_jim, 'admin', perms, 'accepted', now())
  ON CONFLICT (programa_id, user_id) DO UPDATE SET
    role = 'admin',
    permissions = EXCLUDED.permissions,
    status = 'accepted',
    accepted_at = COALESCE(public.programa_users.accepted_at, now());

  INSERT INTO public.responsavel (programa, nome, departamento, email)
  SELECT pid, v.nome, v.departamento, v.email
  FROM (VALUES
    ('PCO — Encarregado (DPO) — não localizado publicamente', 'Privacidade — A VALIDAR', NULL),
    ('PCO — Presidente Nacional — Rui Costa Pimenta (fonte: ficha pública do TSE). Papel no programa de privacidade: A VALIDAR', 'Alta direção — papel de privacidade A VALIDAR', NULL),
    ('PCO — Controlador da filiação online — A VALIDAR (hipótese: órgão nacional; diretórios podem compartilhar decisão)', 'Governança — A VALIDAR', NULL),
    ('PCO — Gestor do processo de filiação — A VALIDAR. E-mail sorg@sorg.pco.org.br consta da ficha do TSE como contato do partido', 'Secretaria de Organização — existência operacional A VALIDAR', 'sorg@sorg.pco.org.br'),
    ('PCO — Responsável por tecnologia — A VALIDAR', 'Tecnologia — A VALIDAR', NULL),
    ('PCO — Responsável por comunicação — A VALIDAR. O menu do site lista veículos (Diário Causa Operária, rádio, TV, jornal). Relação de tratamento: A VALIDAR', 'Comunicação — A VALIDAR', NULL),
    ('PCO — Responsável financeiro — A VALIDAR. O formulário de filiação oferece contribuição mensal; a plataforma de pagamento não foi identificada', 'Financeiro — A VALIDAR', NULL),
    ('PCO — Diretórios estaduais — responsáveis A VALIDAR. Não foi inventariada a lista de diretórios', 'Diretórios estaduais — A VALIDAR', NULL),
    ('PCO — Diretórios municipais — responsáveis A VALIDAR', 'Diretórios municipais — A VALIDAR', NULL),
    ('PCO — Operadores e fornecedores — responsáveis pelo contrato A VALIDAR', 'Terceiros — A VALIDAR', NULL)
  ) AS v(nome, departamento, email)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.responsavel r WHERE r.programa = pid AND r.nome = v.nome
  );

  INSERT INTO public.responsavel (programa, nome, departamento, email)
  SELECT pid,
    nome_jim || ' — conta FPSI dona deste diagnóstico (não é cargo nem DPO do partido)',
    'Diagnóstico FPSI',
    'jimxxx@gmail.com'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.responsavel r
    WHERE r.programa = pid AND r.email = 'jimxxx@gmail.com'
  );
END $$;

-- Limpa somente registros deste diagnóstico (prefixo PCO — ), para reexecução segura.
DO $$
DECLARE
  pid integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico';
  IF pid IS NULL THEN
    RAISE EXCEPTION 'Programa pco-diagnostico não encontrado';
  END IF;

  DELETE FROM public.evidencia_vinculo ev
  USING public.evidencia e
  WHERE ev.evidencia_id = e.id AND e.programa_id = pid AND e.titulo LIKE 'PCO — %';

  DELETE FROM public.evidencia WHERE programa_id = pid AND titulo LIKE 'PCO — %';
  DELETE FROM public.plano_acao WHERE programa_id = pid AND titulo LIKE 'PCO — %';
  DELETE FROM public.programa_risco WHERE programa_id = pid AND titulo LIKE 'PCO — %';
  DELETE FROM public.ripd WHERE programa_id = pid AND titulo LIKE 'PCO — %';
  DELETE FROM public.ropa WHERE programa_id = pid AND nome LIKE 'PCO — %';
  DELETE FROM public.mapeamento_dados WHERE programa_id = pid AND nome LIKE 'PCO — %';

  DELETE FROM public.programa_papel_lgpd_vinculo v
  WHERE v.programa_id = pid
    AND (
      v.instituicao_origem_id IN (
        SELECT id FROM public.programa_papel_lgpd_instituicao
        WHERE programa_id = pid AND nome LIKE 'PCO — %'
      )
      OR v.instituicao_destino_id IN (
        SELECT id FROM public.programa_papel_lgpd_instituicao
        WHERE programa_id = pid AND nome LIKE 'PCO — %'
      )
    );

  DELETE FROM public.programa_papel_lgpd_instituicao
  WHERE programa_id = pid AND nome LIKE 'PCO — %';

  DELETE FROM public.programa_sistema WHERE programa_id = pid AND nome LIKE 'PCO — %';
  DELETE FROM public.programa_processo WHERE programa_id = pid AND nome LIKE 'PCO — %';
  DELETE FROM public.programa_unidade WHERE programa_id = pid AND nome LIKE 'PCO — %';
  DELETE FROM public.programa_fornecedor WHERE programa_id = pid AND nome LIKE 'PCO — %';
END $$;

INSERT INTO public.programa_unidade (programa_id, nome, codigo, ativo)
SELECT p.id, v.nome, v.codigo, true
FROM public.programa p
JOIN (VALUES
  ('PCO — Órgão nacional (endereço da ficha pública do TSE, Brasília/DF)', 'NACIONAL'),
  ('PCO — Diretórios estaduais — existência e sistemas A VALIDAR', 'ESTADUAIS'),
  ('PCO — Diretórios municipais — existência e sistemas A VALIDAR', 'MUNICIPAIS'),
  ('PCO — Canal público sorg@sorg.pco.org.br (ficha do TSE) — se é a secretaria que opera a filiação: A VALIDAR', 'SORG')
) AS v(nome, codigo) ON p.slug = 'pco-diagnostico';

INSERT INTO public.programa_processo (programa_id, nome, descricao, dono, ativo)
SELECT p.id, v.nome, v.descricao, 'A VALIDAR', true
FROM public.programa p
JOIN (VALUES
  ('PCO — Jornada: visitante no site',
   $t$CONFIRMADO: o site https://pco.org.br/ responde e a meta generator declara WordPress. O visitante ainda não entregou dado de filiação. Plugins e scripts observados no HTML (Elementor, Jet, analytics, fontes) podem tratar dado técnico do visitante — extensão A VALIDAR.$t$),
  ('PCO — Jornada: formulário de filiação',
   $t$CONFIRMADO em 19/11/2026 no HTML de https://pco.org.br/filiar/ (JetFormBuilder). Campos: nome, sobrenome, nome completo da mãe, data de nascimento, profissão, país, estado/província/região, cidade, telefone celular, telefone_celular_intl, e-mail, título de eleitor, zona eleitoral, seção eleitoral (name field_name), opção de não contribuir, valor, dia e mês do acerto, opção de grupo de WhatsApp de filiados, token de captcha. Não há, nesse HTML, aviso de privacidade, base legal ou encarregado.$t$),
  ('PCO — Jornada: envio dos dados',
   $t$CONFIRMADO: o formulário está publicado e aponta para o mecanismo JetFormBuilder do próprio site. HIPÓTESE: a submissão grava no banco do WordPress desse host. Destino real, cópias e quem acessa: A VALIDAR.$t$),
  ('PCO — Jornada: confirmação por e-mail',
   $t$CONFIRMADO o aviso na página: a filiação depende de confirmação por e-mail enviado ao endereço informado; se não chegar, o texto pede contato no (11) 92748-5337. Provedor de e-mail, conteúdo da mensagem e prazo: A VALIDAR.$t$),
  ('PCO — Jornada: cadastro do filiado',
   $t$HIPÓTESE de etapa interna posterior à confirmação. Sistema de cadastro, base e responsável: A VALIDAR. Não foi localizado publicamente um sistema nomeado além do formulário do site.$t$),
  ('PCO — Jornada: utilização interna',
   $t$A VALIDAR. Não há, na observação pública, descrição de quem usa a base de filiados, para quais atividades internas, nem por quanto tempo.$t$),
  ('PCO — Jornada: eventual compartilhamento',
   $t$Nenhum compartilhamento foi confirmado no ar. Hipóteses a examinar com o partido, sem tratá-las como fato: registro da filiação perante a Justiça Eleitoral; contato pelo telefone informado na página; inclusão no WhatsApp de quem marcar a opção; repasse a diretórios; subprocessadores da infraestrutura do site.$t$),
  ('PCO — Jornada: manutenção',
   $t$A VALIDAR. Critério de atualização cadastral, retificação e guarda não foram localizados na página de filiação nem na política publicada (esta fala de comentários do site, não de filiados).$t$),
  ('PCO — Jornada: exercício de direitos',
   $t$Não localizado publicamente, nas páginas consultadas, canal identificado como atendimento a direitos de titular da filiação. A política do WordPress fala em exportar ou apagar dados de conta e comentário. Formulário genérico em /contato/ (nome, e-mail, telefone, assunto, mensagem) não se apresenta como canal do art. 18. Processo proposto neste FPSI; operação real: A VALIDAR.$t$),
  ('PCO — Jornada: encerramento, retenção e eliminação',
   $t$A VALIDAR para a base de filiados. A frase da política publicada sobre conservar comentários por tempo indefinido não deve ser copiada como prazo da filiação: ela descreve outro tratamento e não foi confirmada como regra interna.$t$),
  ('PCO — Contato institucional do site',
   $t$EVIDÊNCIA: /contato/ publica formulário Fluent Forms com nome, sobrenome, e-mail, telefone, assunto e mensagem. Finalidade, base legal, retenção e se a mensagem livre pode conter dado sensível: A VALIDAR. Não foi lido texto que o defina como canal de direitos.$t$),
  ('PCO — Contribuição financeira opcional',
   $t$CONFIRMADO no texto e nos campos de /filiar/: há convite a contribuição mensal (o texto cita valor mínimo de R$ 30), checkbox "Não posso contribuir", valor, dia do acerto e primeiro mês. Plataforma de pagamento, conta destinatária e se o dado financeiro segue junto com a filiação: A VALIDAR. Finalidade distinta da filiação eleitoral.$t$),
  ('PCO — Diagnóstico inicial de segurança da informação',
   $t$Controles a validar com o partido, um a um: controle de acesso; autenticação; privilégios; criptografia; backups; logs; gestão de vulnerabilidades; segurança do formulário; segurança do banco; segurança de e-mail; dispositivos; compartilhamento; descarte seguro; resposta a incidentes. Já observado em público: HTTPS na página; Cloudflare Turnstile no formulário; cabeçalho Server LiteSpeed; meta generator WordPress 7.1.5; nome de autor no JSON-LD de /contato/ exibindo o e-mail joao29pimenta@gmail.com (não é encarregado; A VALIDAR se a conta administra o site).$t$),
  ('PCO — Gestão de incidentes (processo proposto)',
   $t$Processo recomendado, não confirmado como existente: identificação, registro, classificação, contenção, investigação, avaliação de risco aos titulares, comunicação interna, avaliação de comunicação à ANPD e aos titulares (art. 48), tratamento, encerramento e lições aprendidas. Não há incidente registrado neste diagnóstico.$t$),
  ('PCO — Gestão de direitos dos titulares (processo proposto)',
   $t$Direitos a operacionalizar quando o partido validar o canal: confirmação de tratamento; acesso; correção; eliminação quando aplicável; informação sobre compartilhamentos; informação sobre o tratamento; oposição quando aplicável; anonimização, bloqueio e portabilidade nos termos do art. 18. O portal deste programa FPSI serve como fila de acompanhamento nesta etapa de diagnóstico. Publicação no site do PCO: A VALIDAR.$t$)
) AS v(nome, descricao) ON p.slug = 'pco-diagnostico';

INSERT INTO public.programa_fornecedor (
  programa_id, nome, tipo, contato, avaliacao_status, ativo, observacoes,
  criticidade, possui_clausulas_lgpd
)
SELECT p.id, v.nome, v.tipo, v.contato, 'pendente', true, v.obs, v.crit, false
FROM public.programa p
JOIN (VALUES
  ('PCO — Hetzner Online GmbH', 'operador', 'A VALIDAR — sem contrato visto',
   $t$EVIDÊNCIA técnica em 19/11/2026: o A de pco.org.br resolvia 5.161.211.159; consulta pública a esse IP indicou a organização Hetzner Online GmbH e, na mesma resposta, cidade Ashburn/EUA. As duas informações podem divergir da localização real. Cabeçalho HTTP Server: LiteSpeed. Papel de operador, contrato, cláusulas e se a base de filiados está nesse host: A VALIDAR. Transferência internacional: A VALIDAR. Não concluir que a base está nos EUA.$t$,
   'critica'),
  ('PCO — Cloudflare (DNS e Turnstile)', 'operador', 'A VALIDAR — sem contrato visto',
   $t$EVIDÊNCIA: nameservers adam.ns.cloudflare.com e edna.ns.cloudflare.com. O A record observado não é IP da Cloudflare, então proxy/CDN não ficou demonstrado. EVIDÊNCIA no formulário de filiação: script challenges.cloudflare.com/turnstile. Contrato, dado tratado pelo Turnstile e transferência internacional: A VALIDAR.$t$,
   'alta'),
  ('PCO — Google Fonts', 'outro', 'A VALIDAR',
   $t$EVIDÊNCIA: a página de filiação referencia fonts.googleapis.com e fonts.gstatic.com. Há também CSS de fontes servido pelo próprio domínio (Elementor). Se a requisição à Google trata IP do visitante e se isso é relevante para o programa: A VALIDAR. Não é operador da base de filiados até prova em contrário.$t$,
   'baixa'),
  ('PCO — WordPress, Elementor, JetFormBuilder e JetEngine', 'software', 'Plugins e meta generator no HTML do site',
   $t$EVIDÊNCIA de software no HTML: WordPress (meta generator 7.1.5), Elementor, JetFormBuilder no formulário de filiação, JetEngine, Jet Blocks e Jet Blog. São produtos, não contratos de operador confirmados. Onde o banco reside e quem é o responsável pela licença: A VALIDAR.$t$,
   'alta'),
  ('PCO — Independent Analytics (plugin no site)', 'software', 'Script no HTML de pco.org.br',
   $t$EVIDÊNCIA: script independent-analytics-script envia pedido ao endpoint iawp-click-endpoint.php no próprio domínio. Dado coletado, cookie e se o fornecedor do plugin recebe cópia: A VALIDAR.$t$,
   'media'),
  ('PCO — Fluent Forms (formulário de /contato/)', 'software', 'Plugin observado no HTML de /contato/',
   $t$EVIDÊNCIA de formulário com nome, e-mail, telefone, assunto e mensagem. Envio para serviço externo do fabricante do plugin: A VALIDAR.$t$,
   'media'),
  ('PCO — Provedor de e-mail da confirmação de filiação', 'operador', 'A VALIDAR — nome não identificado',
   $t$CONFIRMADO apenas que a página anuncia e-mail de confirmação. Fornecedor, contrato, localização e cláusulas: A VALIDAR. Não nomear um provedor.$t$,
   'alta'),
  ('PCO — WhatsApp / Meta (grupo de filiados)', 'operador', 'A VALIDAR',
   $t$EVIDÊNCIA: checkbox "Desejo entrar no grupo de filiados do WhatsApp" e link api.whatsapp.com para o telefone (11) 92748-5337. HIPÓTESE: quem marcar a opção tem o telefone usado na plataforma WhatsApp. Operação real, contrato e transferência internacional: A VALIDAR. Não tratar como compartilhamento já comprovado.$t$,
   'alta'),
  ('PCO — Plataforma de pagamento da mensalidade', 'operador', 'A VALIDAR — nome não identificado',
   $t$O texto pede para agendar pagamento recorrente na conta da mensalidade. Nenhuma plataforma (Pix, boleto, cartão, intermediário) foi identificada no HTML do formulário. Nome, dado tratado e contrato: A VALIDAR.$t$,
   'alta'),
  ('PCO — Justiça Eleitoral (possível destinatário do registro de filiação)', 'outro', 'Ficha pública do TSE — não é fornecedor contratado',
   $t$HIPÓTESE jurídica a validar com o partido: partidos registram filiação perante a Justiça Eleitoral. Não há evidência, nesta observação, de integração de sistema nem de arquivo transmitido. Não classificar o TSE como operador contratado.$t$,
   'alta'),
  ('PCO — Demais ferramentas de diretórios estaduais e municipais', 'outro', 'A VALIDAR — nenhum fornecedor nomeado',
   $t$Estrutura de cadastro para quando o partido informar planilhas, e-mail, grupos e sistemas usados pelos diretórios. Nenhum nome foi inventado.$t$,
   'alta')
) AS v(nome, tipo, contato, obs, crit) ON p.slug = 'pco-diagnostico';

INSERT INTO public.programa_sistema (programa_id, nome, descricao, tipo, critico, ativo)
SELECT p.id, v.nome, v.descricao, v.tipo, v.critico, true
FROM public.programa p
JOIN (VALUES
  ('PCO — Site institucional pco.org.br',
   $t$CONFIRMADO. WordPress; meta generator declara 7.1.5 (confirmar se a versão é real). HTTPS. É a porta de entrada da filiação.$t$,
   'aplicacao', true),
  ('PCO — Formulário de filiação (/filiar/)',
   $t$CONFIRMADO. JetFormBuilder. Coleta dado pessoal, dado eleitoral e o pedido de filiação, que é dado sensível. Aviso de privacidade não localizado nesse HTML.$t$,
   'aplicacao', true),
  ('PCO — Formulário de contato (/contato/)',
   $t$EVIDÊNCIA. Fluent Forms: nome, sobrenome, e-mail, telefone, assunto, mensagem. Finalidade A VALIDAR.$t$,
   'aplicacao', false),
  ('PCO — Banco de dados do site',
   $t$HIPÓTESE: formulários WordPress gravam no banco do mesmo site. Produto, hospedagem do banco, criptografia e backup: A VALIDAR. Não afirmar o nome do SGBD.$t$,
   'banco', true),
  ('PCO — E-mail de confirmação de filiação',
   $t$CONFIRMADO o aviso de que um e-mail é enviado. Serviço, caixa e logs: A VALIDAR.$t$,
   'outro', true),
  ('PCO — Hospedagem (IP observado em Hetzner, LiteSpeed)',
   $t$EVIDÊNCIA de infraestrutura do site, descrita no cadastro do fornecedor. Se a base de filiados usa o mesmo servidor: A VALIDAR.$t$,
   'infra', true),
  ('PCO — DNS Cloudflare',
   $t$EVIDÊNCIA de nameservers. Proxy não evidenciado nesta consulta.$t$,
   'infra', false),
  ('PCO — Cloudflare Turnstile no formulário de filiação',
   $t$EVIDÊNCIA de script de terceiro na página que coleta a filiação. Dado enviado à Cloudflare: A VALIDAR.$t$,
   'saas', true),
  ('PCO — Google Fonts',
   $t$EVIDÊNCIA de requisição a fonts.googleapis.com. Tratamento: A VALIDAR.$t$,
   'saas', false),
  ('PCO — Independent Analytics no site',
   $t$EVIDÊNCIA de script e endpoint no próprio domínio. Escopo do analytics: A VALIDAR.$t$,
   'aplicacao', false),
  ('PCO — Portal eleitoral candidatos.pco.org.br',
   $t$CONFIRMADO que o host existe e publica conteúdo eleitoral. Se trata dado de filiados ou só conteúdo público de candidatura: A VALIDAR.$t$,
   'aplicacao', false),
  ('PCO — Sistemas da Justiça Eleitoral',
   $t$A VALIDAR. Nenhum sistema, arquivo ou credencial foi identificado. Registro de filiação é hipótese jurídica, não integração confirmada.$t$,
   'outro', true),
  ('PCO — Sistemas financeiros e plataforma de pagamento',
   $t$A VALIDAR. O formulário fala em mensalidade e não mostra intermediário de pagamento.$t$,
   'saas', false),
  ('PCO — WhatsApp (grupo de filiados)',
   $t$EVIDÊNCIA do checkbox e de link wa.me. Uso efetivo como sistema de tratamento: A VALIDAR.$t$,
   'saas', false),
  ('PCO — Sistemas de diretórios estaduais e municipais',
   $t$A VALIDAR. Nenhum sistema local foi nomeado. Incluir aqui o que o partido informar (planilha, e-mail, grupo, sistema próprio).$t$,
   'outro', false)
) AS v(nome, descricao, tipo, critico) ON p.slug = 'pco-diagnostico';

DO $$
DECLARE
  pid integer;
  id_ctrl bigint;
  id_op_host bigint;
  id_op_cf bigint;
  id_op_mail bigint;
  id_op_wa bigint;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico';

  INSERT INTO public.programa_papel_lgpd_instituicao
    (programa_id, tipo_papel, ordem, nome, descricao, contato, email, site)
  VALUES
    (pid, 'controlador', 0, 'PCO — Partido da Causa Operária (controlador da filiação online: hipótese)',
     $t$HIPÓTESE de trabalho, não conclusão: o órgão que publica o formulário em pco.org.br decide as finalidades da filiação e seria o controlador. Falta confirmar se o controlador é o órgão nacional, um diretório regional ou mais de um em conjunto. Presidente nacional na ficha do TSE: Rui Costa Pimenta. Essa função pública não foi convertida aqui em encarregado nem em operador.$t$,
     'A VALIDAR', 'sorg@sorg.pco.org.br', 'https://pco.org.br/'),
    (pid, 'operador', 0, 'PCO — Hetzner Online GmbH (operador de infraestrutura: hipótese)',
     $t$EVIDÊNCIA apenas de que o site resolvia para IP atribuído publicamente a essa organização. Contrato de operador e localização da base: A VALIDAR.$t$,
     'A VALIDAR', NULL, NULL),
    (pid, 'operador', 1, 'PCO — Cloudflare Turnstile (script no formulário: evidência; contrato A VALIDAR)',
     $t$Script de terceiro carregado em /filiar/. Não há contrato visto.$t$,
     'A VALIDAR', NULL, 'https://challenges.cloudflare.com/turnstile/v0/api.js'),
    (pid, 'operador', 2, 'PCO — Provedor de e-mail (nome A VALIDAR)',
     $t$A página anuncia e-mail de confirmação. O fornecedor não foi identificado.$t$,
     'A VALIDAR', NULL, NULL),
    (pid, 'operador', 3, 'PCO — WhatsApp/Meta (somente se a opção do grupo for operada na plataforma — A VALIDAR)',
     $t$HIPÓTESE condicionada ao checkbox. Não registrar como compartilhamento confirmado.$t$,
     'A VALIDAR', NULL, NULL);

  SELECT id INTO id_ctrl FROM public.programa_papel_lgpd_instituicao
  WHERE programa_id = pid AND tipo_papel = 'controlador' AND nome LIKE 'PCO — Partido da Causa Operária%';
  SELECT id INTO id_op_host FROM public.programa_papel_lgpd_instituicao
  WHERE programa_id = pid AND nome LIKE 'PCO — Hetzner%';
  SELECT id INTO id_op_cf FROM public.programa_papel_lgpd_instituicao
  WHERE programa_id = pid AND nome LIKE 'PCO — Cloudflare%';
  SELECT id INTO id_op_mail FROM public.programa_papel_lgpd_instituicao
  WHERE programa_id = pid AND nome LIKE 'PCO — Provedor de e-mail%';
  SELECT id INTO id_op_wa FROM public.programa_papel_lgpd_instituicao
  WHERE programa_id = pid AND nome LIKE 'PCO — WhatsApp%';

  INSERT INTO public.programa_papel_lgpd_vinculo
    (programa_id, instituicao_origem_id, instituicao_destino_id, tipo_vinculo, ordem)
  VALUES
    (pid, id_op_host, id_ctrl, 'HIPÓTESE — encargo de hospedagem, contrato A VALIDAR', 0),
    (pid, id_op_cf, id_ctrl, 'EVIDÊNCIA de script no formulário — cláusulas A VALIDAR', 1),
    (pid, id_op_mail, id_ctrl, 'HIPÓTESE — e-mail de confirmação, fornecedor A VALIDAR', 2),
    (pid, id_op_wa, id_ctrl, 'HIPÓTESE condicionada ao opt-in do grupo — A VALIDAR', 3);
END $$;

DO $$
DECLARE
  pid integer;
  rid integer;
  mid_id integer;
  mid_sens integer;
  mid_contato integer;
  mid_ele integer;
  mid_fin integer;
  mid_wa integer;
  mid_meta integer;
  mid_site integer;
  mid_msg integer;
  mid_dir integer;
  ropa_filiacao integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico';

  INSERT INTO public.registro_ropa (
    programa_id, organizacao, cnpj, endereco, atividade_principal,
    gestor_responsavel, email, telefone, data_registro,
    categorias_titulares, medidas_seguranca, tipos_dados_pessoais, outros_dados_pessoais,
    compartilhamento, periodo_armazenamento, observacoes
  ) VALUES (
    pid,
    'PARTIDO DA CAUSA OPERÁRIA (PCO)',
    NULL,
    $t$Ficha pública do TSE: SDS, Bloco D, Edifício Eldorado, Sala 118, Asa Sul, Brasília/DF, CEP 70392-901. Outro endereço paulista em agregador (CNPJ 12.197.071/0001-05, órgão regional): A VALIDAR. CNPJ do controlador nacional não confirmado — por isso o campo CNPJ ficou vazio.$t$,
    $t$Organização política. Tratamento em escopo neste registro: filiação pelo site, contato do site e operação pública de pco.org.br. Demais operações do partido: A VALIDAR.$t$,
    'A VALIDAR',
    'sorg@sorg.pco.org.br',
    '(11) 98344-0068',
    DATE '2026-11-19',
    '["titulares_em_geral"]'::jsonb,
    $t$A VALIDAR no que é controle interno. Observado em público: HTTPS; Cloudflare Turnstile no formulário de filiação. Não foram verificados acesso, criptografia em repouso, backup, logs, gestão de vulnerabilidades, dispositivos nem descarte.$t$,
    '["nome","email","telefone"]'::jsonb,
    $t$Filiação (dado sensível, art. 5º, II). Também no formulário, todos CONFIRMADOS no HTML salvo o rótulo do segundo telefone: sobrenome; nome completo da mãe; data de nascimento; profissão; país; estado/região; cidade; telefone celular internacional; título de eleitor; zona; seção; opção e dados de contribuição; opção de grupo de WhatsApp. Não há CPF nem RG nesse formulário. Contato do site: nome, e-mail, telefone, assunto e mensagem livre.$t$,
    $t$Nenhum compartilhamento confirmado. Hipóteses a validar: Justiça Eleitoral; e-mail de confirmação; WhatsApp se a pessoa optar; diretórios; hospedagem; Turnstile; fontes; analytics. A política publicada não descreve compartilhamento da filiação.$t$,
    $t$A VALIDAR para filiados. A política do site diz que comentários e metadados de comentário são conservados indefinidamente. Isso é outro tratamento e não foi assumido como prazo da filiação.$t$,
    $t$Registro inicial de diagnóstico (19/11/2026). Classificação: CONFIRMADO, EVIDÊNCIA, HIPÓTESE ou A VALIDAR. Não é declaração de irregularidade. E-mail e telefone deste cabeçalho são os da ficha pública do TSE (sorg@sorg.pco.org.br e (11) 98344-0068), não um canal de encarregado. O formulário também publica o (11) 92748-5337 para quem não receber o e-mail de confirmação. Encarregado: não localizado publicamente.$t$
  )
  ON CONFLICT (programa_id) DO UPDATE SET
    organizacao = EXCLUDED.organizacao,
    cnpj = EXCLUDED.cnpj,
    endereco = EXCLUDED.endereco,
    atividade_principal = EXCLUDED.atividade_principal,
    gestor_responsavel = EXCLUDED.gestor_responsavel,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    data_registro = EXCLUDED.data_registro,
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
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: identificação de quem pede filiação',
    $t$CONFIRMADO no HTML de /filiar/: nome; sobrenome; nome completo da mãe; data de nascimento; profissão. Classificação: dado pessoal e dado cadastral. Nome, sobrenome e data de nascimento: potencialmente necessários para identificação — A VALIDAR com a regra eleitoral aplicável. Nome da mãe: potencialmente necessário para identificação; a necessidade concreta A VALIDAR (não foi rotulado como desnecessário). Profissão: exige avaliação de necessidade; finalidade não está no formulário.$t$,
    'Formulário JetFormBuilder em https://pco.org.br/filiar/ — banco e planilhas A VALIDAR',
    'outro', 'obrigacao_legal',
    'Finalidade provável de filiação partidária, mas a base legal e a necessidade de cada campo estão A VALIDAR. Setor interno: A VALIDAR (não há área confirmada; por isso o setor ficou Outro).',
    '["site_app"]'::jsonb,
    '["identificacao"]'::jsonb,
    'Dado pessoal; dado cadastral; potencialmente necessário para identificação; profissão exige avaliação de necessidade.',
    'nao_sei_fluxo',
    'Destino após o envio: A VALIDAR. HIPÓTESE de gravação no site.',
    'outros', 'Pessoa que pede filiação pelo site',
    'nao_sei'
  ) RETURNING id INTO mid_id;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: filiação partidária (dado pessoal sensível)',
    $t$CONFIRMADO como natureza do pedido, não como um campo isolado: ao enviar o formulário a pessoa pede filiação ao PCO. Filiação a organização de caráter político é dado pessoal sensível (art. 5º, II, da LGPD). Isso classifica o dado; não afirma que o tratamento esteja irregular. Base do art. 11: A VALIDAR. Há data de nascimento no formulário; se menores podem concluir o pedido: A VALIDAR. O título de eleitor sugere público eleitor — hipótese, não bloqueio etário confirmado.$t$,
    'https://pco.org.br/filiar/',
    'outro', 'obrigacao_legal',
    'Finalidade específica ainda não documentada no ponto de coleta. Hipótese a validar com o jurídico do partido: registrar filiação e cumprir dever perante a Justiça Eleitoral. Não é base legal escolhida.',
    '["site_app"]'::jsonb,
    '["outros_tipos"]'::jsonb,
    'Dado pessoal sensível (filiação partidária).',
    'nao_sei_fluxo',
    'Compartilhamento: A VALIDAR.',
    'outros', 'Requerente de filiação',
    'nao_sei'
  ) RETURNING id INTO mid_sens;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: contato e localização',
    $t$CONFIRMADO: país (select); estado/província/região; cidade; telefone celular; e-mail. EVIDÊNCIA de segundo campo tel name=telefone_celular_intl sem rótulo legível nesta extração — rótulo A VALIDAR. Classificação: dado pessoal, dado de contato e dado de localização. País e telefone internacional podem ser necessários para quem está fora do Brasil — necessidade A VALIDAR. O e-mail é usado, segundo o texto da página, para confirmação da filiação (CONFIRMADO o aviso).$t$,
    'https://pco.org.br/filiar/',
    'outro', 'outro',
    'Contato para confirmar a filiação e, no que a página afirma, localizar a pessoa. Outras finalidades: A VALIDAR.',
    '["site_app","email_mensageria"]'::jsonb,
    '["contato"]'::jsonb,
    'Dado de contato; dado de localização (país, estado, cidade — não é endereço completo).',
    'nao_sei_fluxo',
    'E-mail de confirmação: fornecedor A VALIDAR.',
    'outros', 'Requerente de filiação',
    'nao_sei'
  ) RETURNING id INTO mid_contato;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: dados eleitorais',
    $t$CONFIRMADO: título de eleitor (titulo_de_eleitor); zona eleitoral; seção eleitoral (rótulo "Seção Eleitoral", name field_name). Classificação: dado pessoal e dado eleitoral; potencialmente necessário para identificação e para registro da filiação. Necessidade jurídica de cada um: A VALIDAR. Não são CPF nem RG. Não foram rotulados como desnecessários.$t$,
    'https://pco.org.br/filiar/',
    'juridico', 'obrigacao_legal',
    'Hipótese a validar: identificar o eleitor para o registro partidário. Base legal não escolhida neste diagnóstico.',
    '["site_app"]'::jsonb,
    '["identificacao","outros_tipos"]'::jsonb,
    'Dado eleitoral (título, zona e seção).',
    'nao_sei_fluxo',
    'Repasse à Justiça Eleitoral: HIPÓTESE, sem evidência de sistema integrado.',
    'outros', 'Requerente de filiação',
    'nao_sei'
  ) RETURNING id INTO mid_ele;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: contribuição financeira opcional',
    $t$CONFIRMADO no mesmo formulário, com finalidade distinta da filiação: checkbox "Não posso contribuir"; valor em R$; dia do acerto mensal; primeiro mês do acerto. O texto cita mínimo de R$ 30 e pagamento recorrente na conta da mensalidade. Classificação: dado pessoal e dado financeiro. Exige avaliação de necessidade e de separação em relação à base de filiados. Plataforma de pagamento: A VALIDAR.$t$,
    'https://pco.org.br/filiar/ — intermediário de pagamento não identificado',
    'financeiro', 'outro',
    'Sustentação material do partido, se a pessoa não marcar que não pode contribuir. Base legal: A VALIDAR.',
    '["site_app"]'::jsonb,
    '["financeiro","preferencias"]'::jsonb,
    'Dado financeiro. Opção de não contribuir.',
    'nao_sei_fluxo',
    'Quem recebe o valor: A VALIDAR.',
    'outros', 'Filiado ou requerente que aceita contribuir',
    'nao_sei'
  ) RETURNING id INTO mid_fin;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: opção de grupo de WhatsApp',
    $t$CONFIRMADO o rótulo "Desejo entrar no grupo de filiados do WhatsApp". Classificação: dado pessoal de contato, com finalidade de comunicação distinta do registro eleitoral. Exige avaliação de necessidade, de opção e de transferência. Operação na plataforma e transferência internacional: A VALIDAR. Não é compartilhamento comprovado só pela existência do checkbox.$t$,
    'Formulário /filiar/ e link público api.whatsapp.com/send?phone=5511927485337',
    'marketing', 'outro',
    'Comunicação com quem optar pelo grupo. Base: A VALIDAR (não registrar consentimento como fato já implementado).',
    '["site_app"]'::jsonb,
    '["contato","preferencias"]'::jsonb,
    'Opção de comunicação. Dado de contato associado.',
    'nao_sei_fluxo',
    'WhatsApp/Meta: HIPÓTESE se a opção for usada.',
    'outros', 'Quem marcar a opção',
    'nao_sei'
  ) RETURNING id INTO mid_wa;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: metadados do envio da filiação',
    $t$EVIDÊNCIA: campo oculto _captcha_token e script Cloudflare Turnstile na página de filiação. IP, log de servidor e provedor de e-mail não foram lidos por dentro. Classificação: dado pessoal técnico, potencialmente necessário para segurança do formulário. Escopo exato: A VALIDAR.$t$,
    'Cloudflare Turnstile; servidor do site (LiteSpeed) — logs A VALIDAR',
    'ti', 'seguranca',
    'Hipótese de segurança e prevenção a envio automatizado. Registro e prazo: A VALIDAR.',
    '["site_app"]'::jsonb,
    '["outros_tipos"]'::jsonb,
    'Metadado técnico / antiabuso.',
    'empresa_externa',
    'Turnstile é script de terceiro. O que a Cloudflare recebe: A VALIDAR.',
    'outros', 'Quem envia o formulário',
    'nao_sei'
  ) RETURNING id INTO mid_meta;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: site, comentários, cookies e mídia',
    $t$CONFIRMADO: existe página https://pco.org.br/politica-de-privacidade/ com o modelo padrão do WordPress. Ela descreve comentários (dado do formulário, IP e navegador), hash de e-mail ao Gravatar, cookies de comentário, de login e de tela, mídia incorporada de outros sites, IP em e-mail de redefinição de senha, conservação indefinida de comentários e detecção automática de spam. Não descreve filiação. Se comentários estão de fato abertos: A VALIDAR (o texto é o modelo; a função pode não estar em uso).$t$,
    'Política publicada no WordPress; Gravatar citado no texto',
    'marketing', 'outro',
    'O texto publicado fala de comentário, conta e mídia. Adequação desse texto à filiação: lacuna de transparência, não inexistência da página.',
    '["site_app"]'::jsonb,
    '["identificacao","contato","preferencias"]'::jsonb,
    'Conforme a página: comentário, IP, navegador, cookies de conta, mídia incorporada.',
    'empresa_externa',
    'A própria página cita Gravatar e sites de mídia incorporada. Lista real de embeds: A VALIDAR.',
    'visitante', NULL,
    'nao_sei'
  ) RETURNING id INTO mid_site;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: contato institucional (/contato/)',
    $t$EVIDÊNCIA de formulário Fluent Forms: nome, sobrenome, e-mail, telefone, assunto e mensagem. Dado pessoal e dado de contato. A mensagem livre pode incluir dado sensível — HIPÓTESE, depende do que a pessoa escreve. Não foi localizado texto que apresente este formulário como canal de direitos do titular.$t$,
    'https://pco.org.br/contato/',
    'atendimento', 'atendimento_titular',
    'Finalidade real do formulário: A VALIDAR. Não assumir que já atende o art. 18.',
    '["site_app","email_mensageria"]'::jsonb,
    '["identificacao","contato"]'::jsonb,
    'Mensagem livre.',
    'nao_sei_fluxo',
    'Quem lê as mensagens: A VALIDAR.',
    'visitante', NULL,
    'nao_sei'
  ) RETURNING id INTO mid_msg;

  INSERT INTO public.mapeamento_dados (
    programa_id, nome, descricao, sistemas_ou_fontes, setor_area, finalidade_categoria, finalidade_detalhe,
    meios_armazenamento, tipos_dados, tipos_outro, fluxo_compartilhamento, compartilhamento_detalhe,
    categoria_titular, titular_outro, transferencia_internacional
  ) VALUES (
    pid,
    'PCO — Inventário: usos internos ainda não vistos (diretórios e demais operações)',
    $t$Não é dado inventariado. É a ficha para o partido completar: filiados já registrados, pré-campanha, funcionários, doadores fora do formulário, jornal, rádio, TV e diretórios. Tudo A VALIDAR. O menu do site cita veículos de imprensa; isso não prova que recebam a base de filiação.$t$,
    'A VALIDAR',
    'outro', 'outro',
    'Fora do recorte público deste diagnóstico.',
    '[]'::jsonb,
    '["outros_tipos"]'::jsonb,
    'A VALIDAR.',
    'nao_sei_fluxo',
    'A VALIDAR.',
    'outros', 'A VALIDAR',
    'nao_sei'
  ) RETURNING id INTO mid_dir;

  INSERT INTO public.ropa (
    programa_id, registro_ropa_id, mapeamento_id, nome, finalidade, base_legal,
    categorias_dados, categorias_titulares, compartilhamento, retencao, medidas_seguranca, responsavel
  ) VALUES (
    pid, rid, mid_sens,
    'PCO — Filiação partidária pelo site',
    $t$Receber e registrar pedido de filiação. A página não descreve a finalidade em linguagem de privacidade. Hipótese a validar com o partido: constituir o vínculo partidário e permitir o registro perante a Justiça Eleitoral. Campos de contribuição e de WhatsApp têm finalidade distinta e estão em operações separadas. Nenhum campo foi declarado desnecessário; profissão, nome da mãe, telefone internacional, contribuição e WhatsApp exigem avaliação de necessidade.$t$,
    'A VALIDAR',
    'Identificação, filiação (dado sensível), contato, localização e dados eleitorais (título, zona, seção)',
    'Pessoa que solicita filiação pelo site',
    'A VALIDAR. Sem compartilhamento confirmado nesta observação.',
    'A VALIDAR. Não usar o prazo de comentários do WordPress.',
    'HTTPS e Turnstile observados. Demais controles A VALIDAR.',
    'A VALIDAR'
  ) RETURNING id INTO ropa_filiacao;

  INSERT INTO public.ropa (
    programa_id, registro_ropa_id, mapeamento_id, nome, finalidade, base_legal,
    categorias_dados, categorias_titulares, compartilhamento, retencao, medidas_seguranca, responsavel
  ) VALUES
  (
    pid, rid, mid_contato,
    'PCO — Confirmação de filiação por e-mail',
    'Enviar a mensagem de confirmação anunciada na página /filiar/. Provedor, conteúdo e prazo: A VALIDAR.',
    'A VALIDAR',
    'E-mail e o fato de haver um pedido de filiação',
    'Requerente de filiação',
    'Provedor de e-mail não identificado',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR'
  ),
  (
    pid, rid, mid_fin,
    'PCO — Contribuição financeira opcional',
    'Registrar a disposição de contribuir, o valor e a data, se a pessoa não marcar que não pode contribuir. Intermediário de pagamento não identificado.',
    'A VALIDAR',
    'Valor, dia, mês e a opção de não contribuir',
    'Quem preenche a contribuição no mesmo formulário',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR — área financeira'
  ),
  (
    pid, rid, mid_wa,
    'PCO — Grupo de WhatsApp de filiados',
    'Operação condicionada à opção marcada no formulário. Se o telefone é de fato incluído em grupo: A VALIDAR.',
    'A VALIDAR',
    'Telefone e a opção pelo grupo',
    'Quem marca a opção',
    'HIPÓTESE: plataforma WhatsApp. Não confirmado.',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR'
  ),
  (
    pid, rid, mid_site,
    'PCO — Site, comentários, cookies e mídia (texto publicado)',
    'O que a política publicada descreve: comentários, cookies de conta, mídia incorporada e antispam. Não cobre a filiação. Confirmar o que está ligado de fato: A VALIDAR.',
    'A VALIDAR',
    'Comentário, IP, navegador, cookies, hash de e-mail citado para o Gravatar',
    'Visitantes e quem comenta ou tem conta no site',
    'Gravatar e sites de mídia, segundo o próprio texto; lista real A VALIDAR',
    'Comentários: o texto diz conservação indefinida. Confirmar se a função existe.',
    'As que o WordPress aplica por padrão — adequação A VALIDAR',
    'A VALIDAR'
  ),
  (
    pid, rid, mid_msg,
    'PCO — Contato institucional do site',
    'Receber mensagens do formulário /contato/. Não foi apresentado como canal de direitos.',
    'A VALIDAR',
    'Nome, e-mail, telefone, assunto e mensagem',
    'Quem escreve pelo site',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR'
  ),
  (
    pid, rid, mid_dir,
    'PCO — Exercício de direitos dos titulares (processo proposto)',
    $t$Operação ainda não confirmada no site. Quando validada, deve atender confirmação, acesso, correção, eliminação quando aplicável, informação sobre compartilhamento e sobre o tratamento, oposição quando aplicável e os demais incisos do art. 18. O portal deste programa (slug pco-diagnostico) é a fila de acompanhamento do diagnóstico, não um canal já divulgado pelo partido.$t$,
    'A VALIDAR',
    'Dado do pedido e documentos de verificação, quando houver pedido',
    'Titular que acionar o canal',
    'Somente áreas necessárias — regra ainda A VALIDAR',
    'A VALIDAR',
    'A VALIDAR',
    'A VALIDAR — encarregado não localizado publicamente'
  );

  INSERT INTO public.ripd (
    programa_id, ropa_id, titulo, descricao_dados, metodologia_coleta_seguranca,
    medidas_salvaguardas_mitigacao, conclusao, status,
    riscos_tratamento, nivel_risco, tipos_risco, categorias_dados_chaves,
    base_legal_predominante, parecer_dpo, parecer_dpo_status, decisao_controlador
  ) VALUES (
    pid, ropa_filiacao,
    'PCO — RIPD inicial da filiação pelo site (estrutura, não parecer concluído)',
    $t$Tratamento candidato a avaliação de impacto porque a filiação partidária é dado pessoal sensível e o formulário também pede título de eleitor, zona, seção, filiação materna, data de nascimento e contato. O volume real da base: A VALIDAR. Não há dado de criança confirmado; a data de nascimento permite, em tese, identificar menor — A VALIDAR se o fluxo aceita. Este RIPD descreve o que foi visto em público e o que falta. Não substitui o relatório fechado pelo controlador.$t$,
    $t$Coleta observada: formulário público em HTTPS, JetFormBuilder, confirmação por e-mail anunciada, Turnstile. Não houve inspeção de banco, de perfil de acesso, de backup nem de contrato. Metodologia deste documento: leitura das páginas em 19/11/2026 e da ficha do TSE. Fonte interna do partido: pendente.$t$,
    $t$Salvaguardas já recomendadas, todas A VALIDAR quanto à existência: aviso no próprio formulário; política que descreva a filiação; definição do controlador e do encarregado; base do art. 11 documentada; minimização dos campos cuja necessidade não estiver demonstrada; separação da contribuição e do WhatsApp; contratos com hospedagem, e-mail e Turnstile; controle de acesso à base; prazo de retenção; canal de direitos; processo de incidente; RIPD revisto quando o partido entregar evidência interna.$t$,
    $t$Conclusão deste diagnóstico, não do controlador: o tratamento de filiação pelo site justifica RIPD por envolver dado sensível e identificadores eleitorais. A avaliação está incompleta. Não há elemento, na observação pública, para afirmar irregularidade nem para afirmar conformidade. Decisão do controlador e parecer do encarregado: A VALIDAR.$t$,
    'rascunho',
    $t$Risco inerente alto pela natureza do dado (filiação política) e pelos identificadores eleitorais, se a base for acessível além de quem precisa. Risco residual desconhecido: controles internos não foram vistos. Riscos específicos a tratar no plano: transparência insuficiente no formulário; base legal não documentada; operadores do site sem contrato visto; retenção indefinida não definida para filiados, mas também não descartada; canal de direitos não localizado; incidente sem processo público.$t$,
    'alto',
    '["vazamento","discriminacao","transferencia_internacional","outro"]'::jsonb,
    '["identificacao","contato","financeiro","sensiveis_art11","outros"]'::jsonb,
    'nao_aplicavel_misto',
    $t$Não é parecer do encarregado do PCO. O encarregado não foi localizado nas páginas consultadas. Esta nota é do diagnóstico FPSI. Parecer formal: A VALIDAR.$t$,
    NULL,
    NULL
  );
END $$;

INSERT INTO public.programa_risco (
  programa_id, titulo, descricao, categoria, origem_tipo,
  probabilidade, impacto, score_inerente, score_residual, status,
  estrategia_mitigacao, responsavel, data_revisao
)
SELECT p.id, v.titulo, v.descricao, v.categoria, 'manual',
  v.prob, v.impacto, v.score, v.score, 'identificado',
  v.mitigacao, 'A VALIDAR — indicação do partido', DATE '2026-12-19'
FROM public.programa p
JOIN (VALUES
  (
    'PCO — Transparência no ponto de coleta da filiação',
    $t$EVIDÊNCIA: em 19/11/2026 o HTML de /filiar/ não contém as palavras privacidade, LGPD, encarregado, cookie ou consentimento. CONFIRMADO que existe política em /politica-de-privacidade/, e que o texto é o modelo do WordPress, sem descrever filiação. Isso é lacuna de informação ao titular da filiação, não inexistência de política. Probabilidade alta refere-se ao gap público observado, não a uma sanção.$t$,
    'privacidade', 'alto', 'alto', 16,
    'Incluir aviso no formulário: controlador, dado sensível, finalidades, bases ainda em validação, direitos, contato e vínculo para a política reescrita. Manter a página atual até a nova ser aprovada, para não apagar o que já existe.'
  ),
  (
    'PCO — Governança da base de filiados não evidenciada',
    $t$CONFIRMADO que o site coleta o pedido de filiação. Quem opera a base, com qual sistema e sob qual procedimento: A VALIDAR. Impacto muito alto decorre da natureza do dado, não de um incidente. Probabilidade média: não se afirma que o controle interno falhe; afirma-se que ele não foi visto.$t$,
    'direitos_titulares', 'medio', 'muito_alto', 15,
    'Nomear o gestor do processo, o sistema de cadastro e a regra de acesso. Trazer evidência interna antes de recalcular o risco residual.'
  ),
  (
    'PCO — Dado sensível de filiação sem salvaguarda documentada',
    $t$CONFIRMADO o enquadramento: filiação partidária é dado pessoal sensível (art. 5º, II). Salvaguardas do art. 11 e do art. 46 aplicadas a essa base: A VALIDAR.$t$,
    'privacidade', 'medio', 'muito_alto', 15,
    'Documentar a hipótese do art. 11 que o jurídico do partido entender cabível, o registro eleitoral se for o caso, e as medidas específicas da base de filiados. Não escolher a base neste diagnóstico.'
  ),
  (
    'PCO — Finalidades não descritas no formulário',
    $t$EVIDÊNCIA de que filiação, contribuição e WhatsApp convivem no mesmo formulário sem texto de finalidade. A separação de finalidades é recomendação. Não se afirma que o partido use o dado para fim diverso.$t$,
    'conformidade', 'alto', 'alto', 16,
    'Escrever a finalidade de cada bloco: filiação, confirmação por e-mail, contribuição opcional e WhatsApp opcional. Avaliar necessidade de profissão, nome da mãe e telefone internacional.'
  ),
  (
    'PCO — Base legal da filiação ainda não validada',
    $t$Não foi localizada publicamente a base legal. Isso não significa que não exista dever de registro na Lei 9.096/1995 ou em norma eleitoral. Aplicabilidade: A VALIDAR com o jurídico do partido. O diagnóstico não adota consentimento nem obrigação legal como conclusão.$t$,
    'conformidade', 'medio', 'muito_alto', 15,
    'Validar, por escrito, a base do art. 7º e, por ser dado sensível, do art. 11. Registrar a conclusão no ROPA.'
  ),
  (
    'PCO — Controle de acesso à base de filiados',
    $t$A VALIDAR. Não houve auditoria de contas, perfis, MFA nem de estações. EVIDÊNCIA colateral: o JSON-LD de /contato/ expõe como nome de autor o e-mail joao29pimenta@gmail.com. Isso não identifica o encarregado; pede checagem de se contas pessoais administram o site.$t$,
    'seguranca', 'medio', 'muito_alto', 15,
    'Levantar contas com acesso ao WordPress, ao banco e às exportações de filiados. Separar conta pessoal de conta funcional. Evidência: lista de administradores e política de acesso.'
  ),
  (
    'PCO — Compartilhamentos não mapeados',
    $t$Nenhum fluxo de compartilhamento foi confirmado. Hipóteses abertas: Justiça Eleitoral, e-mail, WhatsApp opcional, diretórios, hospedagem, Turnstile, fontes e analytics. Tratar hipótese como hipótese.$t$,
    'privacidade', 'medio', 'alto', 12,
    'Montar a lista real de destinatários com o partido e marcar, em cada um, se é operador, destinatário legal ou órgão interno.'
  ),
  (
    'PCO — Retenção e descarte da filiação',
    $t$A VALIDAR. A política do site fala em guardar comentários indefinidamente. Não transpor esse prazo para filiados. Também não afirmar que a base de filiados seja apagada.$t$,
    'conformidade', 'medio', 'alto', 12,
    'Definir prazo ou critério da filiação, da contribuição, do e-mail de confirmação e do contato do site, e o método de descarte.'
  ),
  (
    'PCO — Canal de direitos não localizado nas páginas lidas',
    $t$Não localizado publicamente canal identificado para o art. 18 da filiação. O formulário de /contato/ existe e não se apresenta como esse canal. A política do WordPress fala em exportar dados de conta e comentário. Inexistência interna: não afirmada.$t$,
    'direitos_titulares', 'alto', 'alto', 16,
    'Definir canal, prazo e responsável. O portal deste FPSI pode ser a fila enquanto o partido não publicar o canal no site.'
  ),
  (
    'PCO — Gestão de incidentes não localizada em público',
    $t$Não foi localizado processo público de incidente. Existência interna: A VALIDAR. Nenhum incidente foi registrado neste diagnóstico.$t$,
    'seguranca', 'medio', 'alto', 12,
    'Adotar o fluxo: identificação, registro, classificação, contenção, investigação, risco aos titulares, comunicação interna, avaliação de comunicação à ANPD e aos titulares, tratamento, encerramento e lições aprendidas.'
  ),
  (
    'PCO — Operadores do site sem avaliação contratual',
    $t$EVIDÊNCIA de terceiros ou de infraestrutura no ar: Hetzner (IP), Cloudflare (DNS e Turnstile), Google Fonts, plugin de analytics, Fluent Forms. Contratos e cláusulas: não vistos. Provedor de e-mail e pagamento: nome A VALIDAR.$t$,
    'conformidade', 'alto', 'alto', 16,
    'Confirmar o contrato de cada um, a localização e se há cláusula de proteção. Não assinar fornecedor que este diagnóstico não identificou.'
  ),
  (
    'PCO — Encarregado e responsabilidades não identificados em público',
    $t$Não localizado, nas páginas consultadas, o nome ou o contato do encarregado. A ficha do TSE informa presidente nacional (Rui Costa Pimenta) e o e-mail sorg@sorg.pco.org.br. Isso não os converte em DPO. Designação interna: A VALIDAR. Resolução CD/ANPD nº 18/2024: identificação e canal.$t$,
    'conformidade', 'alto', 'alto', 16,
    'Confirmar se há encarregado designado. Se não houver, designar e publicar identidade e canal. Avaliar conflito de interesses. Não publicar nome provisório no portal deste diagnóstico.'
  )
) AS v(titulo, descricao, categoria, prob, impacto, score, mitigacao)
ON p.slug = 'pco-diagnostico';

INSERT INTO public.plano_acao (
  programa_id, risco_id, titulo, descricao, prioridade, status,
  data_inicio, data_fim_prevista, responsavel, progresso_percentual, workflow_estado
)
SELECT p.id, r.id, v.titulo, v.descricao, v.prio, 'nao_iniciado',
  DATE '2026-11-19', v.prazo::date, 'A VALIDAR — indicação do partido', 0, 'em_elaboracao'
FROM public.programa p
JOIN (VALUES
  (
    'PCO — Transparência no ponto de coleta da filiação',
    'PCO — Publicar aviso de privacidade no formulário de filiação',
    $t$Achado: formulário sem texto de privacidade; política existente é o modelo do WordPress. Classificação: EVIDÊNCIA. Risco: titular da filiação não é informado na coleta. Impacto: alto. Probabilidade: alta (gap público). Recomendação: aviso específico de filiação, sem apagar a página já publicada. Responsável: A VALIDAR. Prazo proposto: 19/12/2026. Status: não iniciado. Evidência esperada: texto no HTML de /filiar/ e versão aprovada. Requisito: art. 6º, VI, e art. 9º da LGPD.$t$,
    'critica', '2026-12-19'
  ),
  (
    'PCO — Encarregado e responsabilidades não identificados em público',
    'PCO — Confirmar ou designar encarregado e publicar o canal',
    $t$Achado: encarregado não localizado nas páginas lidas. Classificação: não localizado publicamente, não inexistente. Impacto: alto. Probabilidade: alta quanto à ausência de identificação pública. Recomendação: ato de designação, identidade e canal fáceis de achar, inclusive para a ANPD. Responsável: A VALIDAR. Prazo proposto: 19/12/2026. Evidência esperada: ato e página com contato. Requisito: art. 41 da LGPD e Resolução CD/ANPD nº 18/2024.$t$,
    'critica', '2026-12-19'
  ),
  (
    'PCO — Canal de direitos não localizado nas páginas lidas',
    'PCO — Operacionalizar o atendimento a direitos dos titulares',
    $t$Achado: sem canal identificado para o art. 18 na filiação. Classificação: não localizado publicamente. Impacto: alto. Probabilidade: alta no site observado. Recomendação: processo de confirmação, acesso, correção, eliminação quando aplicável, informação de compartilhamento e de tratamento, oposição quando aplicável e demais incisos. O portal pco-diagnostico é fila deste diagnóstico até o partido validar. Prazo proposto: 19/12/2026. Evidência esperada: procedimento e registro de prazo. Requisito: art. 18 da LGPD.$t$,
    'critica', '2026-12-19'
  ),
  (
    'PCO — Finalidades não descritas no formulário',
    'PCO — Documentar a finalidade de cada bloco do formulário',
    $t$Achado: filiação, contribuição e WhatsApp no mesmo formulário, sem finalidade escrita. Classificação: EVIDÊNCIA. Impacto: alto. Probabilidade: alta. Recomendação: uma finalidade por bloco e avaliação de necessidade de profissão, nome da mãe e telefone internacional. Prazo proposto: 19/01/2027. Evidência esperada: ROPA revisado e texto do aviso. Requisito: art. 6º, I e III, da LGPD.$t$,
    'alta', '2027-01-19'
  ),
  (
    'PCO — Base legal da filiação ainda não validada',
    'PCO — Validar a base legal do art. 11 com o jurídico do partido',
    $t$Achado: base não localizada em público. Classificação: A VALIDAR. Impacto: muito alto, pela natureza sensível. Probabilidade: média (pode haver dever eleitoral não publicado no site). Recomendação: nota jurídica do partido, depois registro no ROPA. Este plano não escolhe a base. Prazo proposto: 19/01/2027. Evidência esperada: manifestação do jurídico. Requisito: art. 7º e art. 11 da LGPD; Lei 9.096/1995 a examinar.$t$,
    'alta', '2027-01-19'
  ),
  (
    'PCO — Dado sensível de filiação sem salvaguarda documentada',
    'PCO — Fechar o RIPD da base de filiados com evidência interna',
    $t$Achado: RIPD iniciado em rascunho a partir do site. Classificação: estrutura, não conclusão. Impacto: muito alto. Probabilidade do dano: A VALIDAR. Recomendação: completar agentes, sistemas, contratos, retenção e decisão do controlador. Prazo proposto: 19/01/2027. Evidência esperada: RIPD com parecer e decisão. Requisito: art. 38 da LGPD.$t$,
    'alta', '2027-01-19'
  ),
  (
    'PCO — Operadores do site sem avaliação contratual',
    'PCO — Avaliar operadores e preencher o mapa de terceiros',
    $t$Achado: infraestrutura e scripts observados; contratos não vistos. Classificação: EVIDÊNCIA técnica + A VALIDAR contratual. Impacto: alto. Probabilidade: alta de haver terceiro no site; o descumprimento contratual não está afirmado. Recomendação: confirmar Hetzner, Cloudflare, e-mail, analytics, pagamento e WhatsApp. Prazo proposto: 19/01/2027. Evidência esperada: contrato ou declaração de que não há operador. Requisito: art. 39 da LGPD.$t$,
    'alta', '2027-01-19'
  ),
  (
    'PCO — Controle de acesso à base de filiados',
    'PCO — Levantar acessos à base de filiados e ao WordPress',
    $t$Achado: controle interno não visto; e-mail pessoal aparece como autor no JSON-LD. Classificação: A VALIDAR, com EVIDÊNCIA pontual de exposição de conta. Impacto: muito alto. Probabilidade: média. Recomendação: inventário de contas, privilégio mínimo, autenticação. Prazo proposto: 19/01/2027. Evidência esperada: lista de administradores e regra de acesso. Requisito: art. 46 da LGPD.$t$,
    'alta', '2027-01-19'
  ),
  (
    'PCO — Retenção e descarte da filiação',
    'PCO — Definir retenção e descarte por operação',
    $t$Achado: sem prazo da filiação; prazo indefinido de comentários não deve ser copiado. Classificação: A VALIDAR. Impacto: alto. Probabilidade: média. Recomendação: tabela de retenção e descarte seguro. Prazo proposto: 19/01/2027. Evidência esperada: regra escrita e responsável. Requisito: art. 15 e art. 16 da LGPD.$t$,
    'alta', '2027-01-19'
  ),
  (
    'PCO — Gestão de incidentes não localizada em público',
    'PCO — Adotar o processo de incidentes com dados pessoais',
    $t$Achado: processo não localizado em público. Classificação: não localizado publicamente. Impacto: alto. Probabilidade: média. Recomendação: fluxo completo até lições aprendidas, incluindo avaliação de comunicação à ANPD e aos titulares. Prazo proposto: 19/02/2027. Evidência esperada: procedimento e responsável. Requisito: art. 48 da LGPD.$t$,
    'media', '2027-02-19'
  ),
  (
    'PCO — Governança da base de filiados não evidenciada',
    'PCO — Confirmar responsáveis, diretórios e sistemas internos',
    $t$Achado: papéis internos não confirmados. Classificação: A VALIDAR. Impacto: muito alto. Probabilidade: média. Recomendação: preencher controlador, gestores, tecnologia, comunicação, financeiro e diretórios com nomes reais só quando o partido indicar. Prazo proposto: 19/02/2027. Evidência esperada: organograma do tratamento. Requisito: art. 37 e art. 41 da LGPD; governança do programa.$t$,
    'media', '2027-02-19'
  ),
  (
    'PCO — Compartilhamentos não mapeados',
    'PCO — Confirmar destinatários reais da filiação',
    $t$Achado: compartilhamento não comprovado. Classificação: HIPÓTESE. Impacto: alto. Probabilidade: média. Recomendação: dizer se há arquivo à Justiça Eleitoral, repasse a diretório, grupo de WhatsApp e cópia em planilha. Prazo proposto: 19/02/2027. Evidência esperada: lista assinada pelo gestor do processo. Requisito: art. 9º, VII, e art. 18, VII, da LGPD.$t$,
    'media', '2027-02-19'
  )
) AS v(risco_titulo, titulo, descricao, prio, prazo)
  ON p.slug = 'pco-diagnostico'
JOIN public.programa_risco r
  ON r.programa_id = p.id AND r.titulo = v.risco_titulo;

INSERT INTO public.evidencia (
  programa_id, titulo, descricao, categoria, mime_type, tamanho_bytes, url_externa, versao, status
)
SELECT p.id, v.titulo, v.descricao, 'link', 'text/html', 0, v.url, '2026-11-19', 'ativo'
FROM public.programa p
JOIN (VALUES
  ('PCO — Formulário público de filiação',
   'HTML de https://pco.org.br/filiar/ lido em 19/11/2026. Fonte dos campos e da ausência, nessa página, das palavras de privacidade.',
   'https://pco.org.br/filiar/'),
  ('PCO — Política de privacidade publicada',
   'Página existente. Texto observado: modelo padrão do WordPress. Não descreve a filiação nem o encarregado.',
   'https://pco.org.br/politica-de-privacidade/'),
  ('PCO — Página inicial do partido',
   'Home pública. Meta generator declara WordPress. Não substitui varredura completa do domínio.',
   'https://pco.org.br/'),
  ('PCO — Página de contato',
   'Formulário Fluent Forms observado. E-mail pessoal no JSON-LD de autoria não é canal de encarregado.',
   'https://pco.org.br/contato/'),
  ('PCO — Ficha do partido no TSE',
   'Nome, sigla, presidente nacional, endereço em Brasília, telefone, site e e-mail sorg@sorg.pco.org.br. Fonte pública institucional.',
   'https://www.tse.jus.br/partidos/partidos-registrados-no-tse/partido-da-causa-operaria')
) AS v(titulo, descricao, url) ON p.slug = 'pco-diagnostico';

DO $$
DECLARE
  pid integer;
  banner text := $t$<p><strong>Minuta de diagnóstico — não é documento vigente do PCO.</strong> Elaborada em 19/11/2026 no FPSI a partir de observação pública. Não publicar no site do partido nem neste portal antes da validação interna. A VALIDAR não é fato. Não localizado publicamente não significa inexistente. O diagnóstico não conclui irregularidade.</p>$t$;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico';

  INSERT INTO public.evidencia_vinculo (evidencia_id, programa_id, alvo_tipo, alvo_id)
  SELECT e.id, pid, 'risco', r.id::text
  FROM public.evidencia e
  JOIN public.programa_risco r
    ON r.programa_id = pid
   AND r.titulo = 'PCO — Transparência no ponto de coleta da filiação'
  WHERE e.programa_id = pid AND e.titulo = 'PCO — Formulário público de filiação'
  ON CONFLICT (evidencia_id, alvo_tipo, alvo_id) DO NOTHING;

  INSERT INTO public.evidencia_vinculo (evidencia_id, programa_id, alvo_tipo, alvo_id)
  SELECT e.id, pid, 'ripd', rp.id::text
  FROM public.evidencia e
  JOIN public.ripd rp ON rp.programa_id = pid AND rp.titulo LIKE 'PCO — RIPD%'
  WHERE e.programa_id = pid AND e.titulo = 'PCO — Formulário público de filiação'
  ON CONFLICT (evidencia_id, alvo_tipo, alvo_id) DO NOTHING;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status, inicio_vigencia, prazo_revisao)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Como usar esta minuta', 'descricao', '', 'texto', banner),
      jsonb_build_object('id', 1, 'secao', 'Checklist', 'titulo', 'Checklist de conformidade — filiação', 'descricao', '', 'texto',
        $t$<p>Cada item diz o que já se viu e a evidência que o partido ainda precisa trazer.</p>
        <ul>
        <li><strong>Art. 5º, II.</strong> CONFIRMADO: filiação partidária é dado pessoal sensível. Evidência: o próprio pedido em /filiar/.</li>
        <li><strong>Art. 6º, I e III.</strong> Finalidade e necessidade não estão no formulário. Evidência esperada: finalidade por campo e descarte do que não se justificar. Profissão, nome da mãe e telefone internacional exigem avaliação; não foram declarados desnecessários.</li>
        <li><strong>Art. 7º e 11.</strong> Base legal A VALIDAR. Evidência esperada: nota do jurídico do partido. A Lei 9.096/1995 fica como hipótese, não como base escolhida.</li>
        <li><strong>Art. 9º.</strong> EVIDÊNCIA de formulário sem aviso. CONFIRMADO que a política publicada é o modelo do WordPress e não cobre a filiação. Evidência esperada: aviso no formulário.</li>
        <li><strong>Art. 18.</strong> Canal de direitos da filiação não localizado nas páginas lidas. Evidência esperada: canal, prazo e fila. O portal deste slug é proposta de acompanhamento, não canal já divulgado.</li>
        <li><strong>Art. 37.</strong> ROPA inicial gravado neste programa, pendente de validação.</li>
        <li><strong>Art. 38.</strong> RIPD em rascunho. Evidência esperada: decisão do controlador.</li>
        <li><strong>Art. 39.</strong> Operadores observados ou hipotéticos, sem contrato visto. Evidência esperada: cláusulas ou declaração de inexistência.</li>
        <li><strong>Art. 41 e Resolução CD/ANPD 18/2024.</strong> Encarregado não localizado publicamente. Evidência esperada: ato e contato. Não afirmar que não há designação interna.</li>
        <li><strong>Art. 46.</strong> Segurança interna A VALIDAR. Evidência pública: HTTPS e Turnstile. Evidência esperada: acesso, backup, criptografia, logs e descarte.</li>
        <li><strong>Art. 48.</strong> Processo de incidente proposto, não confirmado. Nenhum incidente foi lançado.</li>
        <li><strong>Art. 15 e 16.</strong> Retenção da filiação A VALIDAR. O prazo indefinido de comentários do WordPress não é o prazo dos filiados.</li>
        </ul>$t$),
      jsonb_build_object('id', 2, 'secao', 'Inventário', 'titulo', 'Campos do formulário de filiação', 'descricao', '', 'texto',
        $t$<p>Fonte: HTML de /filiar/ em 19/11/2026.</p>
        <ul>
        <li>Nome, sobrenome, data de nascimento — dado pessoal, cadastral, potencialmente necessário para identificação.</li>
        <li>Nome completo da mãe — dado pessoal; potencialmente necessário para identificação; necessidade concreta A VALIDAR.</li>
        <li>Profissão — dado pessoal; exige avaliação de necessidade.</li>
        <li>País, estado/região, cidade — dado pessoal de localização. País e o segundo telefone (name telefone_celular_intl, rótulo não lido) exigem avaliação.</li>
        <li>Telefone celular e e-mail — dado de contato. O texto da página confirma o e-mail como meio de confirmação.</li>
        <li>Título, zona e seção — dado pessoal eleitoral; potencialmente necessário para o registro; necessidade jurídica A VALIDAR.</li>
        <li>O pedido em si — dado pessoal sensível.</li>
        <li>Contribuição (não posso contribuir, valor, dia, mês) — dado financeiro, finalidade distinta, opcional no texto.</li>
        <li>WhatsApp — opção de comunicação, finalidade distinta, operação A VALIDAR.</li>
        <li>Turnstile — metadado de segurança, escopo A VALIDAR.</li>
        </ul>$t$),
      jsonb_build_object('id', 3, 'secao', 'Evidências', 'titulo', 'O que falta para cada requisito', 'descricao', '', 'texto',
        $t$<p>Já anexado como link: formulário, política publicada, home, contato e ficha do TSE. Falta, e só o partido pode fornecer: ato do encarregado, contratos de hospedagem e e-mail, print do banco ou do plugin onde a filiação grava, regra de acesso, tabela de retenção, registro de um teste de pedido de titular e a nota jurídica da base legal.</p>$t$)
    ),
    'rascunho', DATE '2026-11-19', DATE '2027-05-19'
  FROM public.politica_modelo m
  WHERE m.id = 'politica_protecao_dados_pessoais'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL,
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status, inicio_vigencia, prazo_revisao)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Minuta', 'descricao', '', 'texto', banner),
      jsonb_build_object('id', 1, 'secao', 'Papéis', 'titulo', 'Responsabilidades — o que está em aberto', 'descricao', '', 'texto',
        $t$<ul>
        <li>Controlador da filiação online: HIPÓTESE de que seja o órgão que publica pco.org.br. Nacional, regional ou conjunto: A VALIDAR.</li>
        <li>Presidente nacional na ficha do TSE: Rui Costa Pimenta. Papel no programa de privacidade: A VALIDAR. Não é o encarregado por esta ficha.</li>
        <li>Encarregado: não localizado publicamente. O campo de encarregado deste programa ficou vazio de propósito, para o portal não publicar um nome provisório.</li>
        <li>Gestor da filiação, tecnologia, comunicação, financeiro, diretórios estaduais e municipais, operadores: A VALIDAR. Estão cadastrados como papéis, sem pessoa inventada.</li>
        <li>Conta jimxxx@gmail.com: dona deste diagnóstico no FPSI. Não é cargo do partido.</li>
        <li>E-mail sorg@sorg.pco.org.br e telefone (11) 98344-0068: ficha do TSE. O formulário também cita (11) 92748-5337. Nenhum dos dois foi confirmado como canal do art. 18.</li>
        </ul>$t$),
      jsonb_build_object('id', 2, 'secao', 'Maturidade', 'titulo', 'Indicadores do programa', 'descricao', '', 'texto',
        $t$<p>Escala usada aqui: não evidenciado; inicial; em estruturação; operando; não calculado. Não há nota de 0 a 100.</p>
        <ul>
        <li>Transparência da filiação ao titular: inicial. Há política, e ela não fala da filiação; o formulário não tem aviso.</li>
        <li>Encarregado identificável em público: não evidenciado nas páginas lidas.</li>
        <li>Inventário e ROPA: em estruturação, à espera do partido.</li>
        <li>RIPD: em estruturação (rascunho).</li>
        <li>Direitos dos titulares: não evidenciado no site; processo proposto no FPSI.</li>
        <li>Operadores: não evidenciado em contrato; há evidência técnica de terceiros no site.</li>
        <li>Segurança da informação: inicial (HTTPS e Turnstile). O restante não foi testado.</li>
        <li>Incidentes: não evidenciado em público. Nenhum evento lançado.</li>
        <li>Maturidade PPSI (questionário): não calculada. Responder o diagnóstico só com evidência interna, sem marcar medida como atendida a partir deste texto.</li>
        </ul>$t$),
      jsonb_build_object('id', 3, 'secao', 'Políticas', 'titulo', 'Estrutura de políticas necessárias', 'descricao', '', 'texto',
        $t$<ul>
        <li>Política de privacidade vigente no site: existe, modelo WordPress. Precisa ser reescrita para a filiação ou complementada. Não apagar antes da nova versão.</li>
        <li>Aviso no formulário: não localizado. Minuta neste programa, em rascunho.</li>
        <li>Cookies: a página atual fala de cookies de comentário e de login. Política específica de cookies não localizada nas URLs /cookies/ e /politica-de-cookies/ (HTTP 404 em 19/11/2026). Analytics próprio observado no HTML: escopo A VALIDAR.</li>
        <li>Segurança da informação, acesso, backup, logs, vulnerabilidades e fornecedores: minutas de diagnóstico neste programa, sem vigência.</li>
        <li>Nenhuma destas minutas está com status publicado.</li>
        </ul>$t$)
    ),
    'rascunho', DATE '2026-11-19', DATE '2027-05-19'
  FROM public.politica_modelo m WHERE m.id = 'politica_pgp'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL,
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status, inicio_vigencia, prazo_revisao)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Minuta', 'descricao', '', 'texto', banner),
      jsonb_build_object('id', 1, 'secao', 'Diagnóstico', 'titulo', 'Controles ainda sem evidência interna', 'descricao', '', 'texto',
        $t$<p>Observado em 19/11/2026: a página de filiação abre em HTTPS; o formulário carrega Cloudflare Turnstile; o cabeçalho HTTP traz Server LiteSpeed; a meta generator declara WordPress 7.1.5; o JSON-LD de /contato/ mostra o e-mail joao29pimenta@gmail.com como nome de autor.</p>
        <p>A VALIDAR, um a um, sem presumir falha: controle de acesso; autenticação; privilégios; criptografia em repouso e em trânsito além do HTTPS já visto; backups; logs; gestão de vulnerabilidades; segurança do formulário além do captcha; segurança do banco; segurança do e-mail de confirmação; dispositivos de quem exporta a base; regra de compartilhamento; descarte seguro; resposta a incidentes.</p>$t$),
      jsonb_build_object('id', 2, 'secao', 'Incidentes', 'titulo', 'Fluxo proposto', 'descricao', '', 'texto',
        $t$<p>Identificação, registro, classificação, contenção, investigação, avaliação de risco aos titulares, comunicação interna, avaliação de comunicação à ANPD e aos titulares, tratamento, encerramento e lições aprendidas. Não há incidente cadastrado. Existência de processo interno anterior: A VALIDAR.</p>$t$)
    ),
    'rascunho', DATE '2026-11-19', DATE '2027-05-19'
  FROM public.politica_modelo m WHERE m.id = 'politica_seguranca_informacao'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL,
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status, inicio_vigencia, prazo_revisao)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Minuta de aviso — não publicar ainda', 'descricao', '', 'texto', banner),
      jsonb_build_object('id', 1, 'secao', 'Aviso', 'titulo', 'Texto sugerido para o formulário de filiação', 'descricao', '', 'texto',
        $t$<p>O Partido da Causa Operária trata, neste formulário, dados para receber e registrar pedido de filiação. A filiação partidária é dado pessoal sensível. Também são pedidos identificação, contato, localização e dados eleitorais (título, zona e seção). Contribuição financeira e entrada em grupo de WhatsApp, quando preenchidas, têm finalidade própria e são opcionais no texto já publicado pelo partido.</p>
        <p>A base legal, o prazo de guarda, os destinatários (inclusive Justiça Eleitoral, diretórios e fornecedores de site e de e-mail) e o contato do encarregado devem ser completados pelo partido antes de este aviso ir ao ar. Enquanto isso, a página já existente em /politica-de-privacidade/ permanece a política publicada — e ela ainda não descreve a filiação.</p>
        <p>Direitos de confirmação, acesso, correção, eliminação quando couber, informação sobre compartilhamento e oposição quando couber: canal A VALIDAR.</p>$t$)
    ),
    'rascunho', DATE '2026-11-19', DATE '2027-05-19'
  FROM public.politica_modelo m WHERE m.id = 'documento_portal_aviso_titular'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL,
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status, inicio_vigencia, prazo_revisao)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Não substituir a página do partido por esta minuta', 'descricao', '', 'texto',
        banner || $t$<p>A política que está no ar é <a href="https://pco.org.br/politica-de-privacidade/">pco.org.br/politica-de-privacidade</a>. Esta minuta só organiza o que a próxima versão precisaria dizer sobre filiação, direitos, operadores e retenção, depois que o partido confirmar o que hoje está A VALIDAR.</p>$t$)
    ),
    'rascunho', DATE '2026-11-19', DATE '2027-05-19'
  FROM public.politica_modelo m WHERE m.id = 'documento_portal_politica_privacidade'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL,
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status, inicio_vigencia, prazo_revisao)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Minuta', 'descricao', '', 'texto', banner),
      jsonb_build_object('id', 1, 'secao', 'Terceiros', 'titulo', 'Como preencher o mapa', 'descricao', '', 'texto',
        $t$<p>Para cada fornecedor o cadastro pede serviço, dado, finalidade, localização, papel, contrato, cláusulas, transferência, segurança e status. Nesta data o status de todos é pendente e cláusulas de proteção estão como não evidenciadas — o que significa “não vimos o contrato”, não “não existe contrato”.</p>
        <p>Com evidência técnica: Hetzner (IP do site), Cloudflare (DNS e Turnstile), Google Fonts, WordPress e plugins, Independent Analytics, Fluent Forms. Sem nome: e-mail de confirmação e pagamento da mensalidade. Hipótese, não fato: WhatsApp se a opção for usada; Justiça Eleitoral como destinatário legal, não como fornecedor. Diretórios: estrutura vazia à espera dos nomes reais.</p>$t$)
    ),
    'rascunho', DATE '2026-11-19', DATE '2027-05-19'
  FROM public.politica_modelo m WHERE m.id = 'politica_provedor_servicos'
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL,
    inicio_vigencia = EXCLUDED.inicio_vigencia, prazo_revisao = EXCLUDED.prazo_revisao;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, status)
  SELECT pid, m.id,
    jsonb_build_array(
      jsonb_build_object('id', 0, 'secao', 'Leitura', 'titulo', 'Minuta', 'descricao', '', 'texto',
        banner || $t$<p>Controle de acesso, backup, logs e vulnerabilidades da base de filiados estão A VALIDAR. Não marcar estas políticas como vigentes. Evidência mínima: lista de contas do site, rotina de backup, onde o log fica e quem aplica atualização do WordPress.</p>$t$)
    ),
    'rascunho'
  FROM public.politica_modelo m
  WHERE m.id IN (
    'politica_controle_acesso', 'politica_backup', 'politica_logs_auditoria', 'politica_gerenciamento_vulnerabilidades'
  )
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes, status = 'rascunho', publicado_em = NULL;
END $$;
