-- PCO: política de privacidade e termos de uso próprios no portal FPSI
-- (não linkar para o modelo genérico do WordPress em pco.org.br).

DO $$
DECLARE
  pid integer;
  pslug text;
  sec_priv jsonb;
  sec_termo jsonb;
  nota_versao text := 'PCO 2026.11 — política e termo do partido (portal FPSI)';
  vig_inicio date := DATE '2026-11-20';
  vig_revisao date := DATE '2027-11-20';
BEGIN
  SELECT id, NULLIF(trim(slug), '')
    INTO pid, pslug
  FROM public.programa
  WHERE slug = 'pco-diagnostico'
     OR cnpj = 1307059000190
  ORDER BY CASE WHEN slug = 'pco-diagnostico' THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF pid IS NULL THEN
    RAISE NOTICE 'Programa PCO não encontrado; nada a fazer.';
    RETURN;
  END IF;

  pslug := COALESCE(pslug, 'pco-diagnostico');

  UPDATE public.programa SET
    link_politica_privacidade = NULL,
    link_termo_uso = NULL,
    dpo_notificacao_email = COALESCE(NULLIF(trim(dpo_notificacao_email), ''), 'jimxxx@gmail.com')
  WHERE id = pid;

  sec_priv := $j$[
    {"id":0,"secao":"Política de Privacidade","titulo":"Introdução","descricao":"Documento voltado ao titular.","texto":"<p>Esta Política de Privacidade descreve como o <strong>Partido da Causa Operária (PCO)</strong> trata dados pessoais no site institucional <a href=\"https://pco.org.br/\" rel=\"noopener noreferrer\" target=\"_blank\">pco.org.br</a>, em especial no formulário de filiação, nos canais de contato e neste <strong>Portal de Privacidade</strong> (FPSI), em conformidade com a Lei nº 13.709/2018 (LGPD).</p><p><strong>Controlador:</strong> Partido da Causa Operária (PCO), CNPJ <strong>01.307.059/0001-90</strong> (número informado na prestação de contas ao Tribunal Superior Eleitoral). Endereço informado na ficha pública do TSE: SDS, Bloco D, Edifício Eldorado, Sala 118, Asa Sul, Brasília/DF, CEP 70392-901.</p><p>Este texto substitui, <strong>para fins deste portal</strong>, o uso do modelo padrão de política do WordPress observado em 19/11/2026 em pco.org.br/politica-de-privacidade/, que não descreve a filiação partidária nem os tratamentos do partido. A publicação da versão revisada no próprio site do partido é decisão do PCO.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Informar, em linguagem clara, quais dados são tratados, para quê, com qual fundamento, por quanto tempo, com quem são compartilhados, quais medidas de segurança são adotadas e como o titular pode falar com o encarregado e exercer direitos (art. 18 da LGPD).</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Aplica-se a:</p><ul><li>navegação no site pco.org.br (conteúdo público, formulários e recursos incorporados);</li><li>pedido de filiação partidária e dados correlatos (eleitorais, de contato, opcionais de contribuição e de grupo de mensagens);</li><li>contato pelo formulário e demais canais públicos do partido;</li><li>atendimento de direitos do titular por este Portal de Privacidade.</li></ul><p>Não cobre, por si só, tratamentos internos dos diretórios estaduais ou municipais que não passem pelos canais aqui descritos; esses casos devem ser tratados nos instrumentos do respectivo órgão do partido quando aplicável.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p>Usam-se as definições do art. 5º da LGPD, em especial: titular, dado pessoal, <strong>dado pessoal sensível</strong> (incluindo filiação partidária — art. 5º, II), controlador, operador, encarregado, tratamento, consentimento e eliminação.</p>"},
    {"id":4,"secao":"Tratamentos","titulo":"Dados, finalidades e operações","descricao":"","texto":"<p><strong>1. Navegação no site</strong> — dados técnicos do dispositivo e da conexão (por exemplo endereço IP, tipo de navegador, páginas acessadas, data e hora), cookies e tecnologias semelhantes quando ativas, e registros de segurança (por exemplo desafio anti-abuso). <em>Finalidades:</em> operar o site, segurança, métricas de audiência quando habilitadas e melhoria da experiência.</p><p><strong>2. Filiação partidária</strong> — no formulário público em pco.org.br/filiar/, observado em 19/11/2026, são solicitados, entre outros: nome, sobrenome, nome completo da mãe, data de nascimento, profissão, país, estado/província/região, cidade, telefone celular, e-mail, título de eleitor, zona e seção eleitoral, opção e valor de contribuição (quando preenchidos), opção de ingresso em grupo de WhatsApp de filiados, e metadados de verificação anti-automação. O <strong>pedido de filiação em si</strong> é dado pessoal sensível. <em>Finalidades:</em> receber, avaliar e registrar o pedido de filiação; contato com o interessado; cumprimento de obrigações perante a Justiça Eleitoral e a organização partidária; comunicação partidária; e, quando optado, tratamento distinto para contribuição e para convite ao WhatsApp.</p><p><strong>3. Contato</strong> — dados informados em formulários de contato ou por e-mail/telefone públicos. <em>Finalidade:</em> responder solicitações.</p><p><strong>4. Portal de Privacidade (FPSI)</strong> — dados do titular e do pedido ao exercer direitos ou abrir protocolo. <em>Finalidade:</em> atender art. 18 da LGPD e registrar o tramite.</p>"},
    {"id":5,"secao":"Bases legais","titulo":"Fundamentos do tratamento","descricao":"","texto":"<p>O partido trata dados com fundamento nas hipóteses do art. 7º da LGPD e, para dados sensíveis, no art. 11, conforme o caso:</p><ul><li><strong>Filiação e dados eleitorais:</strong> cumprimento de obrigação legal ou regulatória perante a Justiça Eleitoral e a legislação partidária (Lei nº 9.096/1995 e normas correlatas), e procedimentos preliminares ou execução de vínculo com o titular, após confirmação jurídica interna;</li><li><strong>Contato e confirmação do pedido:</strong> execução de procedimentos preliminares ou do vínculo partidário e legítimo interesse em responder o titular, com checagem de balanceamento quando aplicável;</li><li><strong>Contribuição e WhatsApp:</strong> consentimento ou outra base aplicável, porque são opcionais e têm finalidade distinta da filiação em si;</li><li><strong>Segurança e logs:</strong> legítimo interesse em proteger o site e os titulares, ou obrigação de segurança da informação;</li><li><strong>Cookies não essenciais e terceiros incorporados:</strong> consentimento quando exigido.</li></ul><p>As notas finais do órgão jurídico do partido devem confirmar a base legal de cada campo. Campos cuja necessidade ainda estiver em análise (por exemplo profissão ou nome da mãe) só devem ser mantidos se forem estritamente pertinentes à finalidade confirmada.</p>"},
    {"id":6,"secao":"Compartilhamento","titulo":"Com quem os dados podem ser compartilhados","descricao":"","texto":"<p>O PCO não vende dados pessoais. Pode haver compartilhamento, no limite do necessário, com:</p><ul><li><strong>Justiça Eleitoral</strong> e órgãos competentes, quando a lei ou o registro da filiação exigir;</li><li><strong>Diretórios e estruturas do partido</strong> que operem a filiação na esfera correspondente;</li><li><strong>Operadores de tecnologia</strong> que hospedam o site, transmitem e-mail, fornecem segurança de borda (por exemplo Cloudflare Turnstile), fontes, análise de audiência ou formulários — entre os observados publicamente em 19/11/2026: infraestrutura de hospedagem do site, WordPress e plugins (JetFormBuilder, Elementor, JetEngine, entre outros), Cloudflare, Google Fonts, Independent Analytics, Fluent Forms;</li><li><strong>Provedores de mensagens</strong>, se o titular optar por grupo de WhatsApp;</li><li><strong>Autoridades</strong>, mediante obrigação legal ou ordem válida.</li></ul><p>Contratos e cláusulas de proteção com operadores devem ser mantidos pelo partido. Este documento não substitui a relação contratual com cada fornecedor.</p>"},
    {"id":7,"secao":"Retenção","titulo":"Prazos de guarda","descricao":"","texto":"<p>Os dados de filiação são conservados pelo tempo necessário à finalidade (registro partidário, obrigações eleitorais e defesa de direitos), observados prazos legais e normas internas aprovadas pelo partido. Dados de contato sem filiação concluída podem ser eliminados ou anonimizados quando deixarem de ser pertinentes.</p><p>Logs de segurança e cookies seguem prazos técnicos proporcionais à finalidade. O modelo genérico do WordPress que prevê conservação indefinida de comentários <strong>não se aplica</strong> aos filiados e não governa este documento.</p><p>Prazos detalhados por categoria devem constar do registro de operações (ROPA) interno do partido e ser atualizados quando confirmados.</p>"},
    {"id":8,"secao":"Segurança","titulo":"Medidas de proteção","descricao":"","texto":"<p>Em 19/11/2026 observou-se acesso ao site por <strong>HTTPS</strong> e mecanismo anti-abuso no formulário de filiação. O partido deve manter controles de acesso ao ambiente de administração do site, backups, atualização de software, gestão de credenciais e resposta a incidentes, conforme política interna de segurança.</p><p>Incidentes com risco relevante aos titulares devem ser tratados conforme os arts. 46 a 48 da LGPD; o titular pode comunicar fatos ao encarregado.</p>"},
    {"id":9,"secao":"Direitos do titular","titulo":"Como exercer seus direitos","descricao":"","texto":"<p>Nos termos do art. 18 da LGPD, o titular pode solicitar: confirmação de tratamento; acesso; correção; anonimização, bloqueio ou eliminação quando couber; portabilidade; informação sobre entidades com as quais os dados foram compartilhados; informação sobre a possibilidade de não consentir e as consequências; e revogação do consentimento quando o tratamento depender dele.</p><p><strong>Canais:</strong></p><ul><li>este Portal de Privacidade — formulários de direitos do titular;</li><li>encarregado — <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>;</li><li>contato institucional do partido na ficha do TSE — <a href=\"mailto:sorg@sorg.pco.org.br\">sorg@sorg.pco.org.br</a> (não substitui o canal do encarregado para pedidos do art. 18).</li></ul><p>Será solicitada identificação mínima para evitar acesso indevido a dados de terceiros. O prazo de resposta observa o art. 19 da LGPD e orientações da ANPD.</p>"},
    {"id":10,"secao":"Encarregado","titulo":"Canal com o encarregado","descricao":"","texto":"<p>O encarregado pelo tratamento de dados pessoais indicado neste programa é <strong>Jorge Psendziuk</strong>, e-mail <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>, designado em 19/11/2026 para orientar o partido, receber comunicações dos titulares e servir de canal com a Autoridade Nacional de Proteção de Dados, nos termos do art. 41 da LGPD.</p><p>O ato formal de designação no modelo da Resolução CD/ANPD nº 18/2024 e a indicação de substituto, quando houver, são de responsabilidade do partido e devem ser documentados internamente.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>Compete ao PCO, como controlador, decidir finalidades e meios do tratamento descrito, manter este documento atualizado e responder aos titulares. Compete ao encarregado orientar, receber petições e articular com a ANPD. Operadores de tecnologia tratam dados conforme instruções do partido e contratos. Estruturas internas que recebam cópias dos dados de filiação devem observar confidencialidade e necessidade.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Versão <strong>2026.11</strong> (20/11/2026), publicada neste portal. Revisão prevista em 12 meses ou quando houver mudança relevante no site, no formulário de filiação ou na legislação. Dúvidas sobre privacidade: encarregado <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>.</p>"}
  ]$j$::jsonb;

  sec_termo := $j$[
    {"id":0,"secao":"Termos de Uso","titulo":"Introdução","descricao":"","texto":"<p>Estes Termos de Uso regulam o acesso e a utilização do site <a href=\"https://pco.org.br/\" rel=\"noopener noreferrer\" target=\"_blank\">pco.org.br</a>, do formulário de filiação e deste <strong>Portal de Privacidade</strong> do Partido da Causa Operária (PCO), CNPJ <strong>01.307.059/0001-90</strong>.</p><p>Ao navegar, enviar formulários ou utilizar este portal, o usuário declara ciência destes Termos e da <a href=\"/pco-diagnostico/politica-de-privacidade\">Política de Privacidade</a> vigente neste canal. O texto segue a estrutura de boas práticas do PPSI/FPSI adaptada ao partido político.</p>"},
    {"id":1,"secao":"Aceitação","titulo":"Contrato de adesão","descricao":"","texto":"<p>O uso dos canais digitais do PCO constitui adesão a estes Termos. O envio do formulário de filiação implica declaração de veracidade das informações prestadas e ciência de que a filiação partidária é tratada como dado pessoal sensível na LGPD.</p><p>Quando o partido publicar nova versão destes Termos neste portal, a versão vigente será a da data indicada na seção final. O uso continuado após a publicação implica ciência das alterações, salvo quando a lei exigir consentimento específico.</p>"},
    {"id":2,"secao":"Definições","titulo":"Glossário","descricao":"","texto":"<p><strong>PCO / Partido:</strong> Partido da Causa Operária, controlador dos tratamentos descritos na Política de Privacidade.</p><p><strong>Site:</strong> pco.org.br e subpáginas operadas pelo partido.</p><p><strong>Portal de Privacidade:</strong> ambiente FPSI no endereço deste programa (slug <code>pco-diagnostico</code>) para documentos legais, selo e pedidos de direitos do titular.</p><p><strong>Usuário / visitante:</strong> pessoa que acessa o site ou o portal sem vínculo interno de gestão.</p><p><strong>Interessado na filiação:</strong> pessoa que preenche o formulário de filiação.</p><p><strong>Encarregado:</strong> Jorge Psendziuk (<a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>), nos termos do art. 41 da LGPD.</p>"},
    {"id":3,"secao":"Arcabouço legal","titulo":"Normas aplicáveis","descricao":"","texto":"<p>LGPD (Lei nº 13.709/2018), Marco Civil da Internet (Lei nº 12.965/2014), legislação partidária e eleitoral (incluindo Lei nº 9.096/1995), Código Civil e demais normas pertinentes ao tratamento de dados e ao uso do site. A liberdade de expressão e a organização partidária observam a Constituição Federal.</p>"},
    {"id":4,"secao":"Descrição do serviço","titulo":"O que o site e o portal oferecem","descricao":"","texto":"<p><strong>Conteúdo institucional</strong> — notícias, textos e materiais de comunicação política.</p><p><strong>Filiação on-line</strong> — recebimento de pedidos de filiação e dados necessários ao processo, conforme a Política de Privacidade.</p><p><strong>Contato</strong> — formulários e canais públicos de comunicação.</p><p><strong>Portal de Privacidade</strong> — política, termos, avisos e formulários para direitos do titular.</p><p>O partido não garante disponibilidade ininterrupta do site. Manutenções, falhas de terceiros ou de rede podem ocorrer. O conteúdo de sites de terceiros acessados por links não é de responsabilidade do PCO.</p>"},
    {"id":5,"secao":"Direitos do usuário","titulo":"Direitos no uso do serviço","descricao":"","texto":"<p>O usuário tem direito a informações claras sobre o serviço, à proteção de seus dados pessoais nos termos da LGPD e a tratar-se sem discriminação ilícita. Quando titular de dados, pode exercer os direitos do art. 18 pela Política de Privacidade e pelos canais do encarregado.</p>"},
    {"id":6,"secao":"Deveres do usuário","titulo":"Condutas esperadas e vedações","descricao":"","texto":"<p>O usuário deve fornecer informações verdadeiras na filiação e nos contatos, respeitar a lei e não utilizar o site para:</p><ul><li>envio de conteúdo ofensivo, discriminatório ou ilícito;</li><li>tentativas de invasão, scraping abusivo, introdução de malware ou interferência no funcionamento;</li><li>coleta indevida de dados de terceiros;</li><li>uso de identidade falsa em pedidos que exijam verificação.</li></ul><p>O usuário é responsável pelo uso de sua conexão e equipamento. O partido pode recusar, suspender ou ignorar pedidos manifestamente fraudulentos ou abusivos.</p>"},
    {"id":7,"secao":"Deveres do partido","titulo":"Compromissos do PCO","descricao":"","texto":"<p>O PCO compromete-se a operar os canais com razoável diligência, tratar dados pessoais conforme a LGPD e a Política de Privacidade publicada neste portal, e responder pedidos dos titulares no prazo legal. A decisão de aceitar ou recusar filiação é do partido, nos termos de seu estatuto e da legislação aplicável, e pode exigir confirmação documental além do formulário on-line.</p>"},
    {"id":8,"secao":"Privacidade","titulo":"Remissão à política","descricao":"","texto":"<p>O tratamento de dados pessoais é regido pela <a href=\"/pco-diagnostico/politica-de-privacidade\">Política de Privacidade</a> deste portal. O aviso ao titular sobre o uso do canal de direitos consta no <a href=\"/pco-diagnostico/aviso-do-portal\">Aviso do Portal do Titular</a>, quando publicado.</p>"},
    {"id":9,"secao":"Alterações","titulo":"Atualizações","descricao":"","texto":"<p>O PCO pode atualizar estes Termos para refletir mudanças no site, na legislação ou na operação do portal. A versão vigente é a publicada aqui, com a data abaixo.</p>"},
    {"id":10,"secao":"Disposições finais","titulo":"Vigência e foro","descricao":"","texto":"<p>Versão <strong>2026.11</strong> — vigência a partir de <strong>20/11/2026</strong>. Revisão prevista em 12 meses. Dúvidas: encarregado <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a> ou contato <a href=\"mailto:sorg@sorg.pco.org.br\">sorg@sorg.pco.org.br</a>. Fica eleito o foro da <strong>Comarca de Brasília/DF</strong> para dirimir controvérsias oriundas destes Termos, salvo competência legal absoluta em outro foro ou direito do consumidor quando aplicável.</p>"}
  ]$j$::jsonb;

  -- Corrigir slug embutido nos links se o programa não for pco-diagnostico
  IF pslug IS DISTINCT FROM 'pco-diagnostico' THEN
    sec_priv := replace(sec_priv::text, '/pco-diagnostico/', '/' || pslug || '/')::jsonb;
    sec_termo := replace(sec_termo::text, '/pco-diagnostico/', '/' || pslug || '/')::jsonb;
    sec_termo := replace(sec_termo::text, '<code>pco-diagnostico</code>', '<code>' || pslug || '</code>')::jsonb;
  END IF;

  INSERT INTO public.politica_programa (
    programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em
  )
  VALUES
    (pid, 'documento_portal_politica_privacidade', sec_priv, vig_inicio, vig_revisao, 'publicado', now()),
    (pid, 'documento_portal_termo_uso', sec_termo, vig_inicio, vig_revisao, 'publicado', now()),
    (pid, 'politica_protecao_dados_pessoais', sec_priv, vig_inicio, vig_revisao, 'publicado', now())
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes,
    status = 'publicado',
    publicado_em = now(),
    inicio_vigencia = EXCLUDED.inicio_vigencia,
    prazo_revisao = EXCLUDED.prazo_revisao;

  UPDATE public.politica_programa
  SET secoes = replace(
    replace(
      replace(secoes::text,
        'Enquanto isso, a página já existente em /politica-de-privacidade/ permanece a política publicada — e ela ainda não descreve a filiação.',
        'A política aplicável à filiação é a publicada neste Portal de Privacidade (' || pslug || '/politica-de-privacidade), elaborada para o PCO — não o modelo genérico do WordPress no site.'
      ),
      'Canal A VALIDAR.',
      'Encarregado: Jorge Psendziuk (jimxxx@gmail.com) ou formulários deste portal.'
    ),
    'A base legal, o prazo de guarda, os destinatários (inclusive Justiça Eleitoral, diretórios e fornecedores de site e de e-mail) e o contato do encarregado devem ser completados pelo partido antes de este aviso ir ao ar. ',
    ''
  )::jsonb
  WHERE programa_id = pid
    AND tipo_politica = 'documento_portal_aviso_titular'
    AND secoes::text LIKE '%/politica-de-privacidade/%';

  INSERT INTO public.politica_programa_versao (
    programa_id, tipo_politica, numero, nota, secoes_snapshot, inicio_vigencia, prazo_revisao
  )
  SELECT pp.programa_id, pp.tipo_politica,
    COALESCE((
      SELECT max(v.numero) FROM public.politica_programa_versao v
      WHERE v.programa_id = pp.programa_id AND v.tipo_politica = pp.tipo_politica
    ), 0) + 1,
    nota_versao,
    pp.secoes, pp.inicio_vigencia, pp.prazo_revisao
  FROM public.politica_programa pp
  WHERE pp.programa_id = pid
    AND pp.tipo_politica IN (
      'politica_protecao_dados_pessoais',
      'documento_portal_politica_privacidade',
      'documento_portal_termo_uso'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.politica_programa_versao v
      WHERE v.programa_id = pp.programa_id
        AND v.tipo_politica = pp.tipo_politica
        AND v.nota = nota_versao
    );
END $$;