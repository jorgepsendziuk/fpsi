-- Termo de Uso da Legaliza no formato do Guia/Template PPSI (SGD/MGI):
-- Aceitação, Definições, Arcabouço, Descrição do serviço, Direitos, Deveres do
-- usuário, Deveres da organização, Privacidade, Alterações e Disposições finais.
-- Texto da empresa privada (não órgão público); sem placeholders amarelos/vermelhos.

DO $$
DECLARE
  pid integer;
  sec_termo jsonb;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza' LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'Programa legaliza não encontrado — pulando Termo de Uso PPSI';
    RETURN;
  END IF;

  sec_termo := $j$[
    {
      "id": 0,
      "secao": "Termo de Uso",
      "titulo": "Introdução",
      "descricao": "Documento público de adesão ao serviço, no formato do Guia PPSI (SGD/MGI).",
      "texto": "<p>Este Termo de Uso regula o acesso e a utilização dos canais digitais da <strong>Legaliza Brasil Gestão Territorial Geotecnológica Ltda.</strong> (nome fantasia Legaliza Brasil), CNPJ 34.372.346/0001-32, com sede administrativa em Brasília/DF e matriz em Gouveia/MG, em especial o <strong>SIGET</strong> (Sistema Integrado de Gestão Territorial), o aplicativo de campo, o site institucional e este Portal de Privacidade.</p><p>O documento segue a estrutura do Guia/Template PPSI de Elaboração de Termo de Uso e Política de Privacidade (SGD/MGI), adaptada à natureza privada da prestadora e aos serviços de regularização fundiária (REURB) e geotecnologia. Não substitui contratos firmados com prefeituras nem análise jurídica caso a caso.</p>"
    },
    {
      "id": 1,
      "secao": "Aceitação do Termo de Uso",
      "titulo": "Contrato de adesão",
      "descricao": "Ciência e aceitação das condições de uso.",
      "texto": "<p>O presente Termo constitui <strong>contrato de adesão</strong> entre o usuário e a Legaliza Brasil, fornecedora do serviço.</p><p>O uso do SIGET, do aplicativo e dos demais canais digitais está condicionado à ciência e aceitação deste Termo e das políticas associadas, em especial a <a href=\"/legaliza/politica-de-privacidade\">Política de Privacidade</a>, a <a href=\"/legaliza/politica-de-cookies\">Política de Cookies</a> e a <a href=\"/legaliza/declaracao-de-seguranca\">Declaração de Segurança</a>.</p><p>No SIGET, o acesso autenticado é restrito a usuários autorizados. O aceite é registrado no sistema e pode ser invalidado quando a administração publicar nova versão; nesse caso, o usuário deverá ler e aceitar novamente para continuar. No site e neste portal, a navegação implica ciência das condições aplicáveis ao conteúdo público.</p><p>Ao utilizar o serviço, o usuário manifesta estar ciente e de acordo com este Termo e vincula-se às suas condições.</p>"
    },
    {
      "id": 2,
      "secao": "Definições",
      "titulo": "Glossário",
      "descricao": "Termos usados neste documento.",
      "texto": "<p>Para os fins deste Termo, aplicam-se as seguintes definições, além das do art. 5º da LGPD:</p><p><strong>Legaliza / fornecedora:</strong> Legaliza Brasil Gestão Territorial Geotecnológica Ltda., prestadora dos serviços digitais e, conforme o caso, controladora ou operadora de dados pessoais.</p><p><strong>SIGET:</strong> Sistema Integrado de Gestão Territorial usado na regularização fundiária e na gestão territorial (cadastros, documentos, GIS, evidências de campo e indicadores).</p><p><strong>REURB:</strong> Regularização Fundiária Urbana, nos termos da Lei nº 13.465/2017 e do Decreto nº 9.310/2018, inclusive modalidades correlatas (como REURB-S) e programas municipais apoiados pela plataforma.</p><p><strong>Usuário autorizado:</strong> pessoa natural com credencial ativa no SIGET ou no aplicativo, vinculada a perfil, unidade e funcionalidades, inclusive operadores da Legaliza e agentes de prefeituras contratantes.</p><p><strong>Visitante:</strong> pessoa que acessa o site institucional ou este portal sem autenticação no SIGET.</p><p><strong>Credencial:</strong> login, senha e demais fatores de autenticação, pessoais e intransferíveis.</p><p><strong>Evidência processual:</strong> fotos, coordenadas geográficas, documentos e registros de vistoria coletados para instruir o processo de regularização ou o contrato de geotecnologia.</p><p><strong>Códigos maliciosos:</strong> programa de computador, ou parte dele, construído com a intenção de provocar danos, obter informações indevidas ou realizar outras ações ilícitas.</p><p><strong>Terceiro:</strong> pessoa ou entidade que não participa diretamente do vínculo entre o usuário e a Legaliza (prefeituras, cartórios, órgãos fundiários, hospedagem, encarregado).</p><p><strong>Encarregado (DPO as a Service):</strong> GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA, CNPJ 14.843.252/0001-97, pessoa jurídica designada nos termos da Res. CD/ANPD nº 18/2024, art. 12, II.</p>"
    },
    {
      "id": 3,
      "secao": "Arcabouço Legal",
      "titulo": "Normas aplicáveis",
      "descricao": "Leis e atos que regem o serviço.",
      "texto": "<p>O arcabouço aplicável ao serviço compreende, entre outros:</p><p><strong>Lei nº 13.709/2018</strong> — Lei Geral de Proteção de Dados Pessoais (LGPD) e <strong>Resolução CD/ANPD nº 18/2024</strong> (encarregado);</p><p><strong>Lei nº 12.965/2014</strong> — Marco Civil da Internet;</p><p><strong>Lei nº 12.737/2012</strong> — tipificação de delitos informáticos;</p><p><strong>Lei nº 8.078/1990</strong> — Código de Defesa do Consumidor, quando houver relação de consumo;</p><p><strong>Lei nº 13.465/2017</strong> e <strong>Decreto nº 9.310/2018</strong> — regularização fundiária;</p><p><strong>Lei nº 12.527/2011</strong> — Lei de Acesso à Informação, quando o tratamento ocorrer no âmbito de órgão público controlador;</p><p><strong>Lei nº 13.460/2017</strong> — direitos do usuário de serviços públicos, quando o SIGET for usado na prestação de serviço público municipal;</p><p><strong>Código Civil</strong> (Lei nº 10.406/2002) — obrigações, responsabilidade civil e contratos.</p><p>Contratos com municípios, cartórios e fornecedores de infraestrutura complementam este Termo no que couber, sem o substituir perante o usuário do sistema.</p>"
    },
    {
      "id": 4,
      "secao": "Descrição do Serviço",
      "titulo": "O que é oferecido",
      "descricao": "Objetivo, função, canais e o que o serviço não cobre.",
      "texto": "<p>Este Termo regula o uso dos seguintes serviços da Legaliza Brasil:</p><p><strong>SIGET e aplicativo de campo</strong> — autenticação, cadastro social e territorial, documentos, fotos, georreferenciamento, painéis e indicadores de REURB e geotecnologia, com controle de acesso por perfil, unidade e funcionalidade.</p><p><strong>Site institucional e mapa público</strong> — informações sobre a empresa e visualização agregada por município, sem exposição de dados pessoais de beneficiários no mapa público.</p><p><strong>Portal de Privacidade</strong> (fpsi.com.br/legaliza) — documentos legais, selo, pedidos de direitos do titular (art. 18 da LGPD) e canais com o encarregado.</p><p><strong>Público-alvo:</strong> usuários autorizados (equipe Legaliza e prefeituras contratantes) e visitantes/titulares no site e no portal.</p><p><strong>O serviço não cobre:</strong> decisão de mérito da regularização (que compete ao município e aos órgãos competentes); aconselhamento jurídico individual ao beneficiário da REURB por meio deste Termo; disponibilidade ininterrupta; nem o conteúdo de sítios de terceiros (por exemplo, YouTube) acessados por conta do usuário.</p><p>Canais de atendimento da Legaliza: e-mail <a href=\"mailto:contato@legalizabrasil.com.br\">contato@legalizabrasil.com.br</a>, telefone/WhatsApp (61) 99847-6013. Encarregado: <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a> (GeoApps — DPO as a Service).</p>"
    },
    {
      "id": 5,
      "secao": "Direitos do Usuário",
      "titulo": "Direitos básicos",
      "descricao": "Direitos no uso do serviço e, quando titular, na LGPD.",
      "texto": "<p>Sem prejuízo da legislação, o usuário tem direito a:</p><p>I — obter informações claras sobre o serviço, canais de atendimento e documentos vigentes neste portal;</p><p>II — utilizar o SIGET no limite do perfil e da unidade que lhe forem atribuídos, sem discriminação ilícita;</p><p>III — proteção de suas informações pessoais, nos termos da LGPD e da Política de Privacidade;</p><p>IV — exercer, quando for titular, os direitos do art. 18 da LGPD (confirmação, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento) por este portal ou pelo encarregado;</p><p>V — ser informado de alterações relevantes deste Termo, pela publicação da versão vigente no portal e, no SIGET, pelo novo aceite quando a administração invalidar o anterior;</p><p>VI — quando o uso ocorrer no âmbito de serviço público municipal, os direitos da Lei nº 13.460/2017 perante o órgão controlador, sem prejuízo dos canais da Legaliza como operadora.</p><p>Pedidos relativos a cadastros de REURB municipal podem ser encaminhados também à prefeitura controladora.</p>"
    },
    {
      "id": 6,
      "secao": "Responsabilidades do Usuário",
      "titulo": "Obrigações, vedações e cuidados",
      "descricao": "Deveres do usuário na utilização do serviço.",
      "texto": "<p>O usuário é responsável pela precisão e veracidade dos dados que informar e reconhece que inconsistências podem impedir o uso do serviço ou prejudicar o processo de regularização.</p><p>Compromete-se a fornecer somente informações próprias ou de terceiros com autorização ou amparo legal (por exemplo, no exercício da função junto à prefeitura ou à Legaliza).</p><p>Credenciais são pessoais e intransferíveis. O usuário deve manter o sigilo, não as compartilhar, encerrar a sessão em equipamentos compartilhados e comunicar imediatamente o uso indevido ou a suspeita de comprometimento.</p><p>O usuário deve manter seus dados cadastrais atualizados e responde por omissões ou erros nas informações prestadas.</p><p><strong>É vedado:</strong> exportar, copiar ou divulgar dados do SIGET fora do escopo da função; alterar fotos, coordenadas GPS, documentos ou metadados de forma fraudulenta; tentar contornar controles de acesso, auditoria ou segurança; introduzir códigos maliciosos; utilizar o serviço para fins ilícitos ou em desacordo com a REURB e os contratos aplicáveis.</p><p>Os dados do SIGET são confidenciais e protegidos pela LGPD. Fotos e coordenadas são evidência processual: o usuário não deve tratá-las como material de uso pessoal ou de divulgação pública.</p><p>O usuário responde por danos decorrentes do uso indevido da conta, da violação deste Termo ou da legislação.</p><p>A Legaliza não se responsabiliza, em especial, por: (I) equipamento do usuário infectado, invadido ou avariado; (II) falhas de proteção no ambiente do usuário; (III) abuso de uso, monitoração clandestina ou vulnerabilidades no perímetro do usuário; (IV) instabilidades da conexão ou dos sistemas do usuário; (V) códigos maliciosos instalados em decorrência da navegação na Internet pelo próprio usuário.</p>"
    },
    {
      "id": 7,
      "secao": "Responsabilidades da Legaliza Brasil",
      "titulo": "Compromissos com os dados e o serviço",
      "descricao": "Deveres da fornecedora (equivalente à seção PPSI da Administração Pública, adaptada à pessoa jurídica de direito privado).",
      "texto": "<p>A Legaliza compromete-se a tratar dados pessoais em conformidade com a LGPD e demais normas aplicáveis, adotando medidas de segurança compatíveis com o risco, descritas de forma pública na Declaração de Segurança.</p><p>Na REURB executada para prefeituras, o município é, em regra, o <strong>controlador</strong> dos dados dos beneficiários e a Legaliza atua como <strong>operadora</strong> do SIGET, no limite do contrato e da legislação fundiária. Nos tratamentos do site, do canal do titular, do RH e da operação própria, a Legaliza é controladora.</p><p>Poderá compartilhar informações quando houver obrigação legal, ordem judicial, execução do contrato de REURB (prefeitura, cartório, órgãos fundiários) ou contratação de operadores de infraestrutura, nos limites necessários.</p><p>Esforçar-se-á para manter o serviço disponível, sem garantir disponibilidade ininterrupta, podendo realizar manutenções, melhorias e interrupções programadas ou emergenciais.</p><p>Poderá suspender ou cancelar o acesso do usuário em caso de violação deste Termo, risco à segurança, término do vínculo (emprego, contrato ou autorização da prefeitura) ou determinação legal.</p><p>O software, as marcas e os conteúdos da Legaliza permanecem de sua titularidade ou de seus licenciadores. O uso autorizado não transfere propriedade intelectual.</p>"
    },
    {
      "id": 8,
      "secao": "Privacidade e proteção de dados",
      "titulo": "Remissão à Política de Privacidade",
      "descricao": "Tratamento de dados pessoais.",
      "texto": "<p>O tratamento de dados pessoais no âmbito do SIGET, do site e deste portal observa a <a href=\"/legaliza/politica-de-privacidade\">Política de Privacidade</a> publicada neste Portal de Privacidade, e não é reproduzido na íntegra neste Termo.</p><p>O titular pode exercer direitos pelos formulários do portal ou pelos canais do encarregado. O aviso de como usar o canal está em <a href=\"/legaliza/aviso-do-portal\">Aviso do Portal do Titular</a>.</p><p>Encarregado (DPO as a Service): <strong>GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA</strong>, CNPJ 14.843.252/0001-97. Pessoa natural responsável perante a ANPD e os titulares: identificada no cadastro do programa e no portal. E-mail: <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>.</p>"
    },
    {
      "id": 9,
      "secao": "Alterações do Termo",
      "titulo": "Atualizações",
      "descricao": "Como o Termo pode ser modificado.",
      "texto": "<p>A Legaliza poderá atualizar este Termo para refletir mudanças legais, técnicas, contratuais ou do serviço.</p><p>A versão vigente é a publicada neste portal, com indicação da data de vigência. No SIGET, nova versão relevante pode exigir novo aceite; o aceite anterior pode ser invalidado pela administração.</p><p>O uso continuado do serviço após a publicação da nova versão implica ciência das alterações, salvo quando a lei exigir consentimento específico ou novo aceite.</p>"
    },
    {
      "id": 10,
      "secao": "Disposições finais",
      "titulo": "Vigência e foro",
      "descricao": "Entrada em vigor, omissões e foro.",
      "texto": "<p>Este Termo entra em vigor na data de sua publicação neste portal (versão 2026.08 — 23/08/2026). Revisão prevista em 12 meses ou quando houver mudança relevante do serviço.</p><p>Os casos omissos serão resolvidos pela Legaliza, observadas a legislação, os contratos com municípios e as orientações do encarregado no que disser respeito a dados pessoais.</p><p>Fica eleito o foro de <strong>Brasília/DF</strong> (sede administrativa) para dirimir controvérsias oriundas deste Termo, com renúncia a qualquer outro, por mais privilegiado que seja, ressalvadas as hipóteses legais de competência absoluta e os direitos do consumidor quando aplicáveis.</p><p>Dúvidas sobre este Termo: <a href=\"mailto:contato@legalizabrasil.com.br\">contato@legalizabrasil.com.br</a> ou encarregado <a href=\"mailto:jimxxx@gmail.com\">jimxxx@gmail.com</a>.</p>"
    }
  ]$j$::jsonb;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao, status, publicado_em)
  VALUES (pid, 'documento_portal_termo_uso', sec_termo, DATE '2026-08-23', DATE '2027-08-23', 'publicado', now())
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
    'Legaliza 2026.08 — Termo de Uso no modelo PPSI completo',
    pp.secoes, pp.inicio_vigencia, pp.prazo_revisao
  FROM public.politica_programa pp
  WHERE pp.programa_id = pid
    AND pp.tipo_politica = 'documento_portal_termo_uso'
    AND NOT EXISTS (
      SELECT 1 FROM public.politica_programa_versao v
      WHERE v.programa_id = pp.programa_id AND v.tipo_politica = pp.tipo_politica
        AND v.nota = 'Legaliza 2026.08 — Termo de Uso no modelo PPSI completo'
    );
END $$;
