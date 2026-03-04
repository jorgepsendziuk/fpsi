-- ============================================
-- Seed: Papéis LGPD do projeto PINOVARA
-- Baseado em docs/pinovara/PROGRAMA_PRIVACIDADE.md (linhas 33-51)
-- Executa via: supabase db push  ou  supabase migration up
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
  -- 1. Encontrar programa PINOVARA (slug pinovara, pinovaraufba ou nome contém PINOVARA)
  -- Fallback: programa demo (id 1) se PINOVARA não existir
  SELECT id INTO pid FROM public.programa 
  WHERE slug IN ('pinovara', 'pinovaraufba') 
     OR nome ILIKE '%pinovara%' 
  ORDER BY id 
  LIMIT 1;

  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.programa WHERE id = 1 OR slug = 'demo' LIMIT 1;
    IF pid IS NOT NULL THEN
      RAISE NOTICE 'PINOVARA não encontrado. Usando programa demo (id %) para exibir o diagrama.', pid;
    ELSE
      RAISE EXCEPTION 'Nenhum programa encontrado. Crie o programa PINOVARA (slug: pinovara) pela aplicação primeiro.';
    END IF;
  ELSE
    RAISE NOTICE 'Programa PINOVARA encontrado com id %', pid;
  END IF;

  -- 2. Evitar duplicar se já existirem instituições
  SELECT EXISTS(SELECT 1 FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid) INTO ja_existe;
  IF ja_existe THEN
    RAISE NOTICE 'Instituições já existem para programa %. Pulando seed.', pid;
    RETURN;
  END IF;

  -- 3. Inserir instituições (diagrama PROGRAMA_PRIVACIDADE.md)
  INSERT INTO public.programa_papel_lgpd_instituicao (programa_id, tipo_papel, ordem, nome, descricao)
  VALUES 
    (pid, 'controlador', 0, 'INCRA', 'Instituto Nacional de Colonização e Reforma Agrária'),
    (pid, 'controlador', 1, 'UFBA', 'Universidade Federal da Bahia'),
    (pid, 'contratante', 0, 'FUNARBE - Fundação UFBA', 'Fundação de apoio da UFBA; intermediária contratual'),
    (pid, 'operador', 0, 'LGRDC Serviços de Informática', 'Processa dados pessoais em nome do controlador');

  -- 4. Obter IDs
  SELECT id INTO id_incra FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'INCRA';
  SELECT id INTO id_ufba FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'UFBA';
  SELECT id INTO id_funarbe FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'FUNARBE - Fundação UFBA';
  SELECT id INTO id_lgrdc FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'LGRDC Serviços de Informática';

  -- 5. Inserir vínculos (setas: INCRA→UFBA, UFBA→FUNARBE, FUNARBE→LGRDC, LGRDC→controlador)
  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, instituicao_destino_id, tipo_vinculo, ordem)
  VALUES 
    (pid, id_incra, id_ufba, 'TED 50/2023', 0),
    (pid, id_ufba, id_funarbe, 'Contrato', 1),
    (pid, id_funarbe, id_lgrdc, 'Desenvolvimento/hospedagem', 2);

  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, destino_tipo_papel, tipo_vinculo, ordem)
  VALUES (pid, id_lgrdc, 'controlador', 'Processa dados em nome de', 3);

  RAISE NOTICE 'Papéis LGPD do PINOVARA inseridos com sucesso (programa_id=%).', pid;
END $$;
