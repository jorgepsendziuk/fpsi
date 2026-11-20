-- Panorama PCO: encarregado pendente de definição pelo titular (não expor nome provisório no relatório).

DO $$
DECLARE
  pid integer;
  nota text := 'Em 20/11/2026 o encarregado deste programa voltou ao estado “a definir” para o panorama e o portal, até indicação formal do titular.';
BEGIN
  SELECT id INTO pid
  FROM public.programa
  WHERE slug IN ('pco-diagnostico', 'pco')
     OR replace(coalesce(cnpj::text, ''), '.', '') LIKE '%01307059000190%'
  ORDER BY CASE WHEN slug = 'pco-diagnostico' THEN 0 WHEN slug = 'pco' THEN 1 ELSE 2 END, id
  LIMIT 1;

  IF pid IS NULL THEN
    RAISE NOTICE 'Programa PCO não encontrado; nada a alterar.';
    RETURN;
  END IF;

  UPDATE public.programa
  SET encarregado_dados_pessoais = NULL
  WHERE id = pid;

  UPDATE public.programa_medida pm
  SET
    resposta = NULL,
    justificativa = $j$Não respondida. Não localizamos publicamente o encarregado da LGPD (art. 41). Neste programa o cargo está a definir, pendente de indicação pelo titular. Em /como-funciona-o-pco/ a palavra “encarregado” refere-se ao presidente para decisões urgentes da Comissão Executiva, não ao art. 41.$j$,
    observacao_orgao = nota
  FROM public.medida m
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = '0.4';

  UPDATE public.programa_medida pm
  SET
    resposta = '3',
    justificativa = $j$Adoção parcial. O encarregado (art. 41) ainda não está definido neste programa nem identificado nas páginas do site do partido lidas em 19/11/2026. O portal deste diagnóstico também não divulga nome de encarregado até decisão do titular.$j$,
    observacao_orgao = nota
  FROM public.medida m
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = '21.4';

  UPDATE public.programa_medida pm
  SET
    justificativa = $j$Há meios públicos de contato (formulário em /contato/, e-mail sorg@sorg.pco.org.br na ficha do TSE e telefone no formulário de filiação). Nenhum deles se apresenta como canal do encarregado ou do art. 18. O canal do encarregado neste programa permanece a definir.$j$
  FROM public.medida m
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = '21.2';

  UPDATE public.registro_ropa
  SET observacoes = regexp_replace(
    observacoes,
    'Encarregado[^.]*\.',
    'Encarregado: a definir (pendente de indicação pelo titular do programa).',
    'g'
  )
  WHERE programa_id = pid
    AND observacoes ~* 'jorge|jimxxx|encarregado deste programa';

  UPDATE public.ropa
  SET responsavel = 'A definir — encarregado pendente de indicação'
  WHERE programa_id = pid
    AND responsavel ~* 'jorge|jimxxx|encarregado deste programa';

  UPDATE public.ripd
  SET parecer_dpo = $j$Encarregado deste programa: a definir (pendente de indicação pelo titular). Este texto não substitui parecer formal do encarregado sobre o RIPD. Parecer formal e decisão do controlador: A VALIDAR.$j$
  WHERE programa_id = pid
    AND parecer_dpo ~* 'jorge|jimxxx|encarregado deste programa';

  UPDATE public.programa_risco
  SET estrategia_mitigacao = $j$Encarregado de dados: a definir (decisão pendente do titular). Ainda faltam ato formal, substituto, avaliação de conflito de interesses e identificação no site do partido.$j$
  WHERE programa_id = pid
    AND (estrategia_mitigacao ~* 'jorge|jimxxx' OR titulo ILIKE '%Encarregado%');

  UPDATE public.plano_acao
  SET
    responsavel = NULL,
    descricao = $j$Encarregado de dados ainda não definido neste programa (pendência do titular). Nas páginas do site lidas em 19/11/2026 a identidade pública não aparecia. Falta ato no modelo da Resolução CD/ANPD nº 18/2024, substituto, avaliação de conflito de interesses e publicação no site do partido. Prazo proposto para o que falta: 19/12/2026. Requisito: art. 41 da LGPD.$j$
  WHERE programa_id = pid
    AND titulo ILIKE '%encarregado%'
    AND (responsavel ~* 'jorge' OR descricao ~* 'jorge|jimxxx');

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
    $j$O encarregado pelo tratamento de dados pessoais indicado neste programa é <strong>Jorge Psendziuk</strong>, e-mail <a href="mailto:jimxxx@gmail.com">jimxxx@gmail.com</a>, designado em 19/11/2026$j$,
    $j$O encarregado pelo tratamento de dados pessoais neste programa está <strong>a definir</strong> — pendente de indicação formal pelo titular$j$
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
    '<p><strong>Encarregado:</strong> Jorge Psendziuk (<a href="mailto:jimxxx@gmail.com">jimxxx@gmail.com</a>), nos termos do art. 41 da LGPD.</p>',
    '<p><strong>Encarregado:</strong> a definir (pendente de indicação pelo titular do programa), nos termos do art. 41 da LGPD.</p>'
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
  '<p><strong>Titular:</strong> pessoa natural a quem se referem os dados. <strong>Pedido / protocolo:</strong> solicitação registrada pelo portal ou pelo encarregado. <strong>Encarregado:</strong> Jorge Psendziuk (<a href="mailto:jimxxx@gmail.com">jimxxx@gmail.com</a>).',
  '<p><strong>Titular:</strong> pessoa natural a quem se referem os dados. <strong>Pedido / protocolo:</strong> solicitação registrada pelo portal ou pelo encarregado. <strong>Encarregado:</strong> a definir (pendente de indicação pelo titular).'
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text, '<li>encarregado — <a href="mailto:jimxxx@gmail.com">jimxxx@gmail.com</a>;</li>', '<li>encarregado — a definir (use os formulários deste portal até a designação);</li>')::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text, 'encarregado <a href="mailto:jimxxx@gmail.com">jimxxx@gmail.com</a>', 'encarregado (a definir — use os formulários deste portal)')::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text, 'Dúvidas: encarregado <a href="mailto:jimxxx@gmail.com">jimxxx@gmail.com</a>', 'Dúvidas sobre privacidade: encarregado a definir')::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
    'Encarregado: Jorge Psendziuk (jimxxx@gmail.com) ou formulários deste portal.',
    'Encarregado: a definir — use os formulários deste portal até a designação formal.'
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
    'Encarregado deste programa: Jorge Psendziuk (jimxxx@gmail.com), indicado em 19/11/2026. O portal deste diagnóstico publica nome e e-mail. O site pco.org.br, nas páginas lidas, ainda não identifica o encarregado. Substituto: não indicado. Ato formal da Resolução CD/ANPD nº 18/2024: não anexado.',
    'Encarregado deste programa: a definir (pendente de indicação pelo titular). O portal não publica nome provisório. O site pco.org.br, nas páginas lidas, ainda não identifica o encarregado. Substituto: não indicado. Ato formal da Resolução CD/ANPD nº 18/2024: não anexado.'
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
    'Conta jimxxx@gmail.com: dona deste diagnóstico no FPSI e encarregado indicado neste programa.',
    'Titular deste diagnóstico no FPSI. Encarregado do partido: a definir.'
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.politica_programa
  SET secoes = replace(secoes::text,
    'Encarregado identificável: no portal deste diagnóstico, sim (nome e e-mail). Nas páginas do site do partido lidas em 19/11/2026, não.',
    'Encarregado identificável em público: não evidenciado nas páginas lidas; neste programa o cargo está a definir.'
  )::jsonb
  WHERE programa_id = pid;

  UPDATE public.programa_risco
  SET estrategia_mitigacao = $j$Encarregado de dados: a definir (decisão pendente do titular). Ainda faltam ato formal, substituto, avaliação de conflito de interesses e identificação no site do partido.$j$
  WHERE programa_id = pid
    AND estrategia_mitigacao ~* 'jorge|jimxxx';

END $$;