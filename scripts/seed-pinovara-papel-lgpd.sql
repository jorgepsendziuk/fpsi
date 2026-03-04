-- ============================================
-- Seed manual: Papéis LGPD do PINOVARA
-- Baseado em docs/pinovara/PROGRAMA_PRIVACIDADE.md
--
-- Como executar:
--   supabase db execute -f scripts/seed-pinovara-papel-lgpd.sql
--   ou: psql $DATABASE_URL -f scripts/seed-pinovara-papel-lgpd.sql
-- ============================================

DO $$
DECLARE
  pid INTEGER;
  id_incra BIGINT;
  id_ufba BIGINT;
  id_funarbe BIGINT;
  id_lgrdc BIGINT;
  ja_existe BOOLEAN;
BEGIN
  -- Encontrar programa (slug pinovara, pinovaraufba ou demo)
  SELECT id INTO pid FROM public.programa 
  WHERE slug IN ('pinovara', 'pinovaraufba') 
     OR nome ILIKE '%pinovara%' 
  ORDER BY id LIMIT 1;

  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.programa WHERE id = 1 OR slug = 'demo' LIMIT 1;
  END IF;

  IF pid IS NULL THEN
    RAISE EXCEPTION 'Nenhum programa encontrado. Crie o programa PINOVARA (slug: pinovara) pela aplicação.';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid) INTO ja_existe;
  IF ja_existe THEN
    RAISE NOTICE 'Instituições já existem. Para reinserir, exclua antes: DELETE FROM programa_papel_lgpd_vinculo WHERE programa_id = %; DELETE FROM programa_papel_lgpd_instituicao WHERE programa_id = %;', pid, pid;
    RETURN;
  END IF;

  INSERT INTO public.programa_papel_lgpd_instituicao (programa_id, tipo_papel, ordem, nome, descricao)
  VALUES 
    (pid, 'controlador', 0, 'INCRA', 'Instituto Nacional de Colonização e Reforma Agrária'),
    (pid, 'controlador', 1, 'UFBA', 'Universidade Federal da Bahia'),
    (pid, 'contratante', 0, 'FUNARBE - Fundação UFBA', 'Fundação de apoio da UFBA; intermediária contratual'),
    (pid, 'operador', 0, 'LGRDC Serviços de Informática', 'Processa dados pessoais em nome do controlador');

  SELECT id INTO id_incra FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'INCRA';
  SELECT id INTO id_ufba FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'UFBA';
  SELECT id INTO id_funarbe FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'FUNARBE - Fundação UFBA';
  SELECT id INTO id_lgrdc FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'LGRDC Serviços de Informática';

  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, instituicao_destino_id, tipo_vinculo, ordem)
  VALUES 
    (pid, id_incra, id_ufba, 'TED 50/2023', 0),
    (pid, id_ufba, id_funarbe, 'Contrato', 1),
    (pid, id_funarbe, id_lgrdc, 'Desenvolvimento/hospedagem', 2);

  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, destino_tipo_papel, tipo_vinculo, ordem)
  VALUES (pid, id_lgrdc, 'controlador', 'Processa dados em nome de', 3);

  RAISE NOTICE 'Papéis LGPD inseridos (programa_id=%).', pid;
END $$;
