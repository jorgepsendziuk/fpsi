-- Demo FPSI: membros dos comités/ETIR para o escritório de governança 3D.
-- Idempotente — programa slug demo / id 1.

DO $$
DECLARE
  pid INTEGER;
  id_rob INTEGER;
  id_paulo INTEGER;
  id_juliana INTEGER;
  id_carla INTEGER;
  id_fern INTEGER;
  gid_si BIGINT;
  gid_priv BIGINT;
  gid_etir BIGINT;
BEGIN
  SELECT id INTO pid FROM public.programa
  WHERE slug IN ('demo', 'demonstracao')
  ORDER BY CASE WHEN slug = 'demo' THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.programa WHERE id = 1 LIMIT 1;
  END IF;

  IF pid IS NULL THEN
    RAISE NOTICE 'seed_demo_escritorio_governanca: nenhum programa demo; nada feito.';
    RETURN;
  END IF;

  SELECT id INTO id_rob FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Roberto%' LIMIT 1;
  SELECT id INTO id_paulo FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Paulo%' LIMIT 1;
  SELECT id INTO id_juliana FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Juliana%' LIMIT 1;
  SELECT id INTO id_carla FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Carla%' LIMIT 1;
  SELECT id INTO id_fern FROM public.responsavel WHERE programa = pid AND nome LIKE 'Demo FPSI — Fernanda%' LIMIT 1;

  IF id_rob IS NULL OR id_paulo IS NULL OR id_carla IS NULL THEN
    RAISE NOTICE 'seed_demo_escritorio_governanca: responsáveis demo incompletos; nada feito.';
    RETURN;
  END IF;

  INSERT INTO public.programa_grupo_governanca (programa_id, tipo)
  VALUES
    (pid, 'comite_seguranca_informacao'),
    (pid, 'comite_protecao_dados'),
    (pid, 'etir')
  ON CONFLICT (programa_id, tipo) DO NOTHING;

  SELECT id INTO gid_si FROM public.programa_grupo_governanca
  WHERE programa_id = pid AND tipo = 'comite_seguranca_informacao' LIMIT 1;
  SELECT id INTO gid_priv FROM public.programa_grupo_governanca
  WHERE programa_id = pid AND tipo = 'comite_protecao_dados' LIMIT 1;
  SELECT id INTO gid_etir FROM public.programa_grupo_governanca
  WHERE programa_id = pid AND tipo = 'etir' LIMIT 1;

  DELETE FROM public.programa_grupo_governanca_membro
  WHERE grupo_id IN (gid_si, gid_priv, gid_etir);

  INSERT INTO public.programa_grupo_governanca_membro (grupo_id, responsavel_id, sort_order) VALUES
    (gid_si, id_rob, 1),
    (gid_si, id_paulo, 2),
    (gid_si, COALESCE(id_juliana, id_rob), 3);

  INSERT INTO public.programa_grupo_governanca_membro (grupo_id, responsavel_id, sort_order) VALUES
    (gid_priv, id_carla, 1),
    (gid_priv, COALESCE(id_fern, id_carla), 2),
    (gid_priv, COALESCE(id_juliana, id_carla), 3);

  INSERT INTO public.programa_grupo_governanca_membro (grupo_id, responsavel_id, sort_order) VALUES
    (gid_etir, id_rob, 1),
    (gid_etir, id_carla, 2),
    (gid_etir, id_paulo, 3);

  RAISE NOTICE 'seed_demo_escritorio_governanca: concluído para programa_id=%', pid;
END $$;
