-- ============================================
-- Seed: Papéis e Responsabilidades LGPD para programa demonstração
-- Programa com slug 'demonstracao' ou 'demo' (fallback id 1)
-- Executa via: supabase db push  ou  supabase migration up
-- ============================================

DO $$
DECLARE
  pid INTEGER;
  id_controlador BIGINT;
  id_contratante BIGINT;
  id_operador BIGINT;
  ja_existe BOOLEAN;
BEGIN
  -- 1. Encontrar programa demonstração (slug demonstracao ou demo)
  SELECT id INTO pid FROM public.programa 
  WHERE slug IN ('demonstracao', 'demo') 
  ORDER BY CASE WHEN slug = 'demonstracao' THEN 0 ELSE 1 END, id 
  LIMIT 1;

  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.programa WHERE id = 1 LIMIT 1;
    IF pid IS NOT NULL THEN
      RAISE NOTICE 'Programa demonstração não encontrado por slug. Usando programa id % para seed.', pid;
    ELSE
      RAISE EXCEPTION 'Nenhum programa encontrado. Crie o programa demonstração (slug: demo ou demonstracao) primeiro.';
    END IF;
  ELSE
    RAISE NOTICE 'Programa demonstração encontrado com id %', pid;
  END IF;

  -- 2. Evitar duplicar se já existirem instituições
  SELECT EXISTS(SELECT 1 FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid) INTO ja_existe;
  IF ja_existe THEN
    RAISE NOTICE 'Papéis LGPD já existem para programa %. Pulando seed.', pid;
    RETURN;
  END IF;

  -- 3. Inserir instituições (estrutura demo: Empresa Demo Tech como controlador, prestador como contratante, operador)
  INSERT INTO public.programa_papel_lgpd_instituicao (programa_id, tipo_papel, ordem, nome, descricao)
  VALUES 
    (pid, 'controlador', 0, 'Empresa Demo Tech Ltda', 'Controlador - determina finalidades e meios do tratamento'),
    (pid, 'contratante', 0, 'Prestador de Serviços Demo', 'Contratante administrativa - intermediária contratual'),
    (pid, 'operador', 0, 'Operador de Dados Demo', 'Operador - executa conforme instruções do controlador');

  -- 4. Obter IDs
  SELECT id INTO id_controlador FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND tipo_papel = 'controlador' AND nome = 'Empresa Demo Tech Ltda';
  SELECT id INTO id_contratante FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'Prestador de Serviços Demo';
  SELECT id INTO id_operador FROM public.programa_papel_lgpd_instituicao WHERE programa_id = pid AND nome = 'Operador de Dados Demo';

  -- 5. Inserir vínculos (fluxo: Controlador → Contratante → Operador → Controlador)
  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, instituicao_destino_id, tipo_vinculo, ordem)
  VALUES 
    (pid, id_controlador, id_contratante, 'Contrato de prestação', 0),
    (pid, id_contratante, id_operador, 'Desenvolvimento/hospedagem', 1);

  INSERT INTO public.programa_papel_lgpd_vinculo (programa_id, instituicao_origem_id, destino_tipo_papel, tipo_vinculo, ordem)
  VALUES (pid, id_operador, 'controlador', 'Processa dados em nome de', 2);

  RAISE NOTICE 'Papéis LGPD da demonstração inseridos com sucesso (programa_id=%).', pid;
END $$;
