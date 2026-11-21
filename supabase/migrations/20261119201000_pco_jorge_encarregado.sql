-- Indica Jorge Psendziuk como encarregado do programa pco-diagnostico,
-- a pedido do titular da conta, e responde as medidas que tratam dessa nomeação
-- e da divulgação da identidade. Não cria substituto nem parecer de RIPD.

DO $$
DECLARE
  pid integer;
  id_dpo integer;
  nota text := 'Indicação registrada em 19/11/2026 a pedido do titular da conta jimxxx@gmail.com. O site pco.org.br, nas páginas lidas nessa data, não exibia essa identidade.';
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico';
  IF pid IS NULL THEN
    RAISE EXCEPTION 'Programa pco-diagnostico não encontrado';
  END IF;

  UPDATE public.responsavel
  SET
    nome = 'JORGE PSENDZIUK',
    departamento = 'Encarregado pelo tratamento de dados pessoais'
  WHERE programa = pid AND email = 'jimxxx@gmail.com';

  SELECT id INTO id_dpo
  FROM public.responsavel
  WHERE programa = pid AND email = 'jimxxx@gmail.com'
  ORDER BY id
  LIMIT 1;

  IF id_dpo IS NULL THEN
    RAISE EXCEPTION 'Responsável jimxxx@gmail.com não encontrado no programa';
  END IF;

  UPDATE public.responsavel
  SET
    nome = 'PCO — identificação do encarregado no site do partido — não localizada nas páginas lidas em 19/11/2026',
    departamento = 'Site do partido — lacuna de divulgação; não é o encarregado deste programa'
  WHERE programa = pid
    AND nome = 'PCO — Encarregado (DPO) — não localizado publicamente';

  UPDATE public.programa
  SET encarregado_dados_pessoais = id_dpo
  WHERE id = pid;

  UPDATE public.programa_medida pm
  SET
    resposta = '1',
    justificativa = $j$Sim. Jorge Psendziuk (jimxxx@gmail.com) foi indicado, neste programa, como encarregado pelo tratamento de dados pessoais, a pedido do titular da conta, em 19/11/2026. O portal público deste diagnóstico passa a exibir o nome e o e-mail. Não há substituto. Não há ato no modelo da Resolução CD/ANPD nº 18/2024 anexado, nem essa identidade nas páginas do site pco.org.br lidas nessa data. A resposta Sim é a indicação neste programa.$j$,
    observacao_orgao = nota
  FROM public.medida m
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = '0.4';

  UPDATE public.programa_medida pm
  SET
    resposta = '3',
    justificativa = $j$Adoção parcial. O portal deste diagnóstico passa a divulgar o nome e o e-mail do encarregado indicado no cadastro: Jorge Psendziuk, jimxxx@gmail.com. Não há substituto. Nas páginas do site do partido lidas em 19/11/2026 essa identidade não aparece, e o portal não está divulgado em pco.org.br.$j$,
    observacao_orgao = nota
  FROM public.medida m
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = '21.4';

  UPDATE public.programa_medida pm
  SET
    justificativa = $j$Há meios públicos de contato (formulário em /contato/, e-mail sorg@sorg.pco.org.br na ficha do TSE e telefone no formulário de filiação). Nenhum deles se apresenta como canal do encarregado ou do art. 18. O portal deste diagnóstico passa a exibir o e-mail do encarregado (jimxxx@gmail.com), e esse portal não está divulgado no site do partido.$j$
  FROM public.medida m
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = '21.2';

  UPDATE public.registro_ropa rr
  SET observacoes = replace(
    rr.observacoes,
    'Encarregado: não localizado publicamente.',
    'Encarregado deste programa, indicado em 19/11/2026: Jorge Psendziuk (jimxxx@gmail.com). Nas páginas do site lidas nessa data, a identidade não aparecia.'
  )
  WHERE rr.programa_id = pid
    AND rr.observacoes LIKE '%Encarregado: não localizado publicamente.%';

  UPDATE public.ropa
  SET responsavel = 'JORGE PSENDZIUK — encarregado deste programa (jimxxx@gmail.com)'
  WHERE programa_id = pid
    AND responsavel = 'A VALIDAR — encarregado não localizado publicamente';

  UPDATE public.ripd
  SET parecer_dpo = $j$O encarregado deste programa é Jorge Psendziuk (jimxxx@gmail.com), indicado em 19/11/2026. Este texto não é o parecer dele sobre o RIPD. Parecer formal e decisão do controlador: A VALIDAR.$j$
  WHERE programa_id = pid
    AND parecer_dpo LIKE '%O encarregado não foi localizado nas páginas consultadas.%';

  UPDATE public.programa_risco
  SET estrategia_mitigacao = $j$Encarregado indicado neste programa em 19/11/2026: Jorge Psendziuk (jimxxx@gmail.com). O portal do diagnóstico publica nome e e-mail. Ainda falta o ato formal, o substituto, a avaliação de conflito de interesses e a mesma identificação no site do partido.$j$
  WHERE programa_id = pid
    AND titulo = 'PCO — Encarregado e responsabilidades não identificados em público'
    AND estrategia_mitigacao LIKE '%Não publicar nome provisório%';

  UPDATE public.plano_acao
  SET
    responsavel = 'JORGE PSENDZIUK',
    descricao = $j$Indicação neste programa, em 19/11/2026: Jorge Psendziuk (jimxxx@gmail.com) é o encarregado, e o portal do diagnóstico publica nome e e-mail. O achado público permanece: nas páginas do site lidas nessa data a identidade não aparecia. Ainda falta o ato no modelo da Resolução CD/ANPD nº 18/2024, o substituto, a avaliação de conflito de interesses e a publicação no site do partido. Prazo proposto para o que falta: 19/12/2026. Requisito: art. 41 da LGPD.$j$
  WHERE programa_id = pid
    AND titulo = 'PCO — Confirmar ou designar encarregado e publicar o canal';

  UPDATE public.politica_programa
  SET secoes = replace(
    secoes::text,
    'Encarregado: não localizado publicamente. O campo de encarregado deste programa ficou vazio de propósito, para o portal não publicar um nome provisório.',
    'Encarregado deste programa: Jorge Psendziuk (jimxxx@gmail.com), indicado em 19/11/2026. O portal deste diagnóstico publica nome e e-mail. O site pco.org.br, nas páginas lidas, ainda não identifica o encarregado. Substituto: não indicado. Ato formal da Resolução CD/ANPD nº 18/2024: não anexado.'
  )::jsonb
  WHERE programa_id = pid
    AND secoes::text LIKE '%campo de encarregado deste programa ficou vazio%';

  UPDATE public.politica_programa
  SET secoes = replace(
    secoes::text,
    'Conta jimxxx@gmail.com: dona deste diagnóstico no FPSI. Não é cargo do partido.',
    'Conta jimxxx@gmail.com: dona deste diagnóstico no FPSI e encarregado indicado neste programa.'
  )::jsonb
  WHERE programa_id = pid
    AND secoes::text LIKE '%Não é cargo do partido.%';

  UPDATE public.politica_programa
  SET secoes = replace(
    secoes::text,
    'Encarregado identificável em público: não evidenciado nas páginas lidas.',
    'Encarregado identificável: no portal deste diagnóstico, sim (nome e e-mail). Nas páginas do site do partido lidas em 19/11/2026, não.'
  )::jsonb
  WHERE programa_id = pid
    AND secoes::text LIKE '%Encarregado identificável em público: não evidenciado%';
END $$;
