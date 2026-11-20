-- Remove o prefixo "PCO — " dos títulos do diagnóstico pco-diagnostico (era marcador de seed idempotente).

DO $$
DECLARE
  pid integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pco-diagnostico';
  IF pid IS NULL THEN
    RAISE NOTICE 'pco-diagnostico não encontrado; nada a fazer.';
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
    EXECUTE $q$
      UPDATE public.programa_processo
      SET nome = btrim(regexp_replace(nome, '^PCO — ', ''))
      WHERE programa_id = $1 AND nome LIKE 'PCO — %'
    $q$ USING pid;
  END IF;
END $$;