-- PCO: publica cookies, aviso do portal e declaração de segurança no portal FPSI.

DO $$
DECLARE
  pid integer;
  pslug text;
  sec_aviso jsonb;
  sec_cookies jsonb;
  sec_dec jsonb;
  nota_versao text := 'PCO 2026.11 — cookies, aviso e declaração (portal FPSI)';
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
    link_aviso_titular = NULL,
    link_cookies = NULL,
    link_declaracao_seguranca = NULL
  WHERE id = pid;

  sec_aviso := $j$[
    {"id":0,"secao":"Aviso do Portal do Titular","titulo":"Introdução","descricao":"","texto":"<p>Este aviso explica como usar o <strong>Portal de Privacidade</strong> do Partido da Causa Operária (PCO) para exercer direitos previstos na Lei nº 13.709/2018 (LGPD) e falar com o encarregado pelo tratamento de dados pessoais.</p><p>O portal não substitui o site institucional <a href=\"https://pco.org.br/\" rel=\"noopener noreferrer\" target=\"_blank\">pco.org.br</a>; complementa a transparência do partido com documentos e canais de atendimento ao titular.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Facilitar pedidos de confirmação, acesso, correção, eliminação, portabilidade, informação sobre compartilhamento, oposição quando couber e revogação de consentimento, com registro de protocolo quando o formulário do portal for utilizado.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Trata de dados tratados pelo PCO em razão do site, do formulário de filiação, dos contatos públicos e do próprio uso deste portal. Questões eleitorais ou partidárias de mérito (por exemplo aceitação de filiação) não são decididas por este canal; ele cuida da privacidade e dos direitos do titular sobre seus dados.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p><strong>Titular:</strong> pessoa natural a quem se referem os dados. <strong>Pedido / protocolo:</strong> solicitação registrada pelo portal ou pelo encarregado. <strong>Encarregado:</strong> Jorge Psendziuk (<a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>). <strong>Controlador:</strong> Partido da Causa Operária (PCO), CNPJ 01.307.059/0001-90.</p>"},
    {"id":4,"secao":"Conteúdo do aviso","titulo":"Como usar o canal","descricao":"","texto":"<p><strong>1. Antes de enviar um pedido</strong> — leia a <a href=\"/pco-diagnostico/politica-de-privacidade\">Política de Privacidade</a>, que descreve quais dados o partido trata, especialmente no <a href=\"https://pco.org.br/filiar/\" rel=\"noopener noreferrer\" target=\"_blank\">formulário de filiação</a> (dado pessoal sensível).</p><p><strong>2. Pelo portal</strong> — use os formulários de direitos do titular na página inicial deste programa. Guarde o número de protocolo, quando for gerado.</p><p><strong>3. Pelo encarregado</strong> — escreva para <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a> com assunto claro (por exemplo \"Pedido LGPD — acesso\") e identificação mínima (nome, e-mail usado na filiação ou contato, se aplicável).</p><p><strong>4. Contato institucional do partido</strong> — <a href=\"mailto:sorg@sorg.pco.org.br\">sorg@sorg.pco.org.br</a> (ficha do TSE) serve à comunicação partidária geral; para direitos do art. 18, prefira o encarregado ou este portal.</p><p><strong>5. Prazos</strong> — o partido responderá nos prazos do art. 19 da LGPD e orientações da ANPD. Pode ser solicitado documento adicional para evitar entrega de dados a terceiros.</p><p><strong>6. Aviso no formulário de filiação</strong> — o partido deve exibir, no site, texto equivalente ao tratamento descrito na política. Enquanto o aviso no HTML de /filiar/ não for atualizado, a referência oficial para filiação on-line neste diagnóstico é a política publicada neste portal.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>O PCO responde aos titulares como controlador. O encarregado orienta, recebe petições e articula com a ANPD. A equipe que opera este portal registra e encaminha pedidos. O titular deve fornecer informações verdadeiras e não usar o canal para acessar dados de outras pessoas.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Versão <strong>2026.11</strong> — vigência a partir de <strong>20/11/2026</strong>. Revisão em 12 meses ou quando mudar o site, o formulário de filiação ou a forma de atendimento do portal.</p>"}
  ]$j$::jsonb;

  sec_cookies := $j$[
    {"id":0,"secao":"Política de Cookies","titulo":"Introdução","descricao":"","texto":"<p>Esta Política de Cookies descreve tecnologias de armazenamento e rastreamento usadas no site <a href=\"https://pco.org.br/\" rel=\"noopener noreferrer\" target=\"_blank\">pco.org.br</a> e neste Portal de Privacidade do Partido da Causa Operária (PCO), em linha com a LGPD e o Marco Civil da Internet.</p><p>O modelo genérico de política do WordPress (comentários e login de administrador) <strong>não governa</strong> esta política; ela reflete o que foi observado tecnicamente no site do partido em 19/11/2026.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Informar categorias de cookies e tecnologias semelhantes, finalidades, bases legais e como o titular pode gerenciar preferências.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Aplica-se ao site pco.org.br (incluindo o formulário de filiação) e a este portal FPSI. Não cobre cookies de terceiros em sites acessados por sua conta a partir de links externos.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p><strong>Cookie:</strong> arquivo ou identificador gravado no navegador. <strong>LocalStorage / sessionStorage:</strong> armazenamento local no dispositivo. <strong>Cookies essenciais:</strong> necessários ao funcionamento ou à segurança. <strong>Cookies de preferência, analíticos ou de terceiros:</strong> quando não forem estritamente necessários, em regra dependem de consentimento.</p>"},
    {"id":4,"secao":"Tipos de cookies","titulo":"Categorias observadas ou prováveis","descricao":"","texto":"<p><strong>Essenciais e segurança</strong></p><ul><li>Sessão e balanceamento do servidor (por exemplo infraestrutura LiteSpeed observada);</li><li>Desafio anti-abuso no formulário de filiação (Cloudflare Turnstile);</li><li>Cookies estritamente necessários à operação do WordPress e do formulário (JetFormBuilder).</li></ul><p><strong>Preferências</strong> — podem existir cookies ou armazenamento local para lembrar escolhas de interface; o escopo exato depende da configuração do site.</p><p><strong>Analíticos</strong> — no HTML do site foi observado <em>Independent Analytics</em> (plugin WordPress). Quando ativo, pode tratar dados de navegação agregados ou pseudonimizados. A base legal costuma ser consentimento ou legítimo interesse, conforme configuração; o partido deve confirmar com o administrador do site.</p><p><strong>Terceiros incorporados</strong></p><ul><li><strong>Google Fonts</strong> — carregamento de tipografia; pode envolver IP ao provedor;</li><li><strong>Cloudflare</strong> — DNS e segurança de borda;</li><li>Conteúdo ou scripts de plugins (Elementor, JetEngine, Fluent Forms, entre outros) — conforme páginas visitadas.</li></ul><p>Não há, nas URLs /cookies/ e /politica-de-cookies/ do site do partido, página dedicada (HTTP 404 em 19/11/2026). Esta política no portal FPSI supre essa lacuna para o programa de privacidade do diagnóstico.</p>"},
    {"id":5,"secao":"Gestão","titulo":"Como gerenciar","descricao":"","texto":"<p>O titular pode bloquear ou apagar cookies nas configurações do navegador. Bloquear cookies essenciais pode impedir o envio do formulário de filiação ou o uso de partes do site. Para tecnologias que dependam de consentimento, o partido deve manter banner ou mecanismo equivalente no site quando exigido — a implementação no WordPress é responsabilidade da equipe técnica do PCO.</p><p>Dúvidas sobre cookies e privacidade: encarregado <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>A equipe do site configura plugins e terceiros. O encarregado orienta sobre bases legais. O titular gerencia o navegador e, quando disponível, as preferências de consentimento no site.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Versão <strong>2026.11</strong> (20/11/2026). Revisão em 12 meses ou quando houver nova tecnologia de rastreamento no site.</p>"}
  ]$j$::jsonb;

  sec_dec := $j$[
    {"id":0,"secao":"Declaração de Segurança","titulo":"Introdução","descricao":"","texto":"<p>Declaração pública, em linguagem acessível, das medidas técnicas e organizacionais adotadas ou em adoção pelo Partido da Causa Operária (PCO) para proteger dados pessoais, especialmente os do formulário de filiação. Não substitui auditoria externa nem certificação ISO/IEC 27001.</p>"},
    {"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"","texto":"<p>Demonstrar compromisso com os arts. 46 a 50 da LGPD e permitir ao titular avaliar, em linhas gerais, as salvaguardas do site e do programa de privacidade nesta etapa de diagnóstico.</p>"},
    {"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"","texto":"<p>Site pco.org.br, formulário de filiação, canais de contato públicos e este Portal de Privacidade. Ambientes internos de diretórios, planilhas exportadas e e-mail operacional dependem de controles a confirmar pelo partido.</p>"},
    {"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"","texto":"<p><strong>Medidas técnicas e organizacionais</strong>, <strong>incidente de segurança</strong>, <strong>operador</strong> e <strong>acesso privilegiado</strong> nos sentidos da LGPD e de boas práticas de segurança da informação.</p>"},
    {"id":4,"secao":"Medidas","titulo":"Controles observados ou previstos","descricao":"","texto":"<p><strong>Observados publicamente em 19/11/2026:</strong></p><ul><li>Acesso ao site por <strong>HTTPS</strong> (criptografia em trânsito);</li><li>Mecanismo anti-automação no formulário de filiação (<strong>Cloudflare Turnstile</strong>);</li><li>Stack WordPress com plugins de formulário (JetFormBuilder), sob responsabilidade de administração do partido.</li></ul><p><strong>A confirmar e manter pelo partido:</strong></p><ul><li>Controle de acesso ao painel WordPress e separação de contas pessoais;</li><li>Atualização de núcleo, temas e plugins;</li><li>Backup e teste de restauração da base de filiados;</li><li>Política de senhas, quando houver ambientes autenticados;</li><li>Registro de logs de acesso e retenção proporcional;</li><li>Procedimento de resposta a incidentes (comunicação ao encarregado e, se couber, à ANPD e aos titulares);</li><li>Descarte seguro de dados após o prazo de guarda definido internamente.</li></ul><p>Incidentes com dados pessoais devem ser comunicados ao encarregado <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>.</p>"},
    {"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"","texto":"<p>A alta direção e a área técnica do partido implementam e revisam controles. O encarregado é informado de incidentes relevantes. Fornecedores de hospedagem e nuvem atuam como operadores quando aplicável. Usuários do painel administrativo não devem compartilhar credenciais nem exportar bases sem autorização.</p>"},
    {"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"","texto":"<p>Versão <strong>2026.11</strong> — vigência 20/11/2026. Revisão anual ou após incidente relevante ou mudança material no site.</p>"}
  ]$j$::jsonb;

  IF pslug IS DISTINCT FROM 'pco-diagnostico' THEN
    sec_aviso := replace(sec_aviso::text, '/pco-diagnostico/', '/' || pslug || '/')::jsonb;
    sec_cookies := replace(sec_cookies::text, '/pco-diagnostico/', '/' || pslug || '/')::jsonb;
    sec_dec := replace(sec_dec::text, '/pco-diagnostico/', '/' || pslug || '/')::jsonb;
  END IF;

  INSERT INTO public.politica_programa (
    programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em
  )
  VALUES
    (pid, 'documento_portal_aviso_titular', sec_aviso, vig_inicio, vig_revisao, 'publicado', now()),
    (pid, 'documento_portal_cookies', sec_cookies, vig_inicio, vig_revisao, 'publicado', now()),
    (pid, 'documento_portal_declaracao_seguranca', sec_dec, vig_inicio, vig_revisao, 'publicado', now())
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = EXCLUDED.secoes,
    status = 'publicado',
    publicado_em = now(),
    inicio_vigencia = EXCLUDED.inicio_vigencia,
    prazo_revisao = EXCLUDED.prazo_revisao;

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
      'documento_portal_aviso_titular',
      'documento_portal_cookies',
      'documento_portal_declaracao_seguranca'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.politica_programa_versao v
      WHERE v.programa_id = pp.programa_id
        AND v.tipo_politica = pp.tipo_politica
        AND v.nota = nota_versao
    );
END $$;