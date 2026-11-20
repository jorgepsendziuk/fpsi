-- Reaplica remoção do prefixo "PCO — " se o programa foi localizado por slug ou CNPJ TSE.

DO $$
DECLARE
  pid integer;
BEGIN
  SELECT id INTO pid
  FROM public.programa
  WHERE slug = 'pco-diagnostico'
     OR cnpj = 1307059000190
  ORDER BY CASE WHEN slug = 'pco-diagnostico' THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF pid IS NULL THEN
    RAISE NOTICE 'Programa PCO não encontrado (slug pco-diagnostico ou CNPJ 1307059000190); nada a fazer.';
    RETURN;
  END IF;

  UPDATE public.programa_risco
  SET titulo = btrim(regexp_replace(titulo, '^PCO — ', ''))
  WHERE programa_id = pid AND titulo LIKE 'PCO — %';

  UPDATE public.plano_acao
  SET titulo = btrim(regexp_replace(titulo, '^PCO — ', ''))
  WHERE programa_id = pid AND titulo LIKE 'PCO — %';

  UPDATE public.ripd
  SET titulo = btrim(regexp_replace(titulo, '^PCO — ', ''))
  WHERE programa_id = pid AND titulo LIKE 'PCO — %';

  UPDATE public.ropa
  SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
  WHERE programa_id = pid AND nome LIKE 'PCO — %';

  UPDATE public.mapeamento_dados
  SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
  WHERE programa_id = pid AND nome LIKE 'PCO — %';

  UPDATE public.programa_sistema
  SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
  WHERE programa_id = pid AND nome LIKE 'PCO — %';

  UPDATE public.programa_fornecedor
  SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
  WHERE programa_id = pid AND nome LIKE 'PCO — %';

  UPDATE public.programa_unidade
  SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
  WHERE programa_id = pid AND nome LIKE 'PCO — %';

  UPDATE public.evidencia
  SET titulo = btrim(regexp_replace(titulo, '^PCO — ', ''))
  WHERE programa_id = pid AND titulo LIKE 'PCO — %';

  UPDATE public.responsavel
  SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
  WHERE programa = pid AND nome LIKE 'PCO — %';

  IF to_regclass('public.programa_processo') IS NOT NULL THEN
    UPDATE public.programa_processo
    SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
    WHERE programa_id = pid AND nome LIKE 'PCO — %';
  END IF;
END $$;