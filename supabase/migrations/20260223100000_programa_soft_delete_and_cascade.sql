-- ============================================
-- Programa: soft delete (lixeira) + CASCADE para exclusão definitiva
-- ============================================

-- Coluna para lixeira: NULL = ativo, preenchido = excluído em (data)
ALTER TABLE public.programa
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.programa.deleted_at IS 'Quando preenchido, programa está na lixeira (excluído). NULL = ativo.';

-- Índice para filtrar ativos/excluídos
CREATE INDEX IF NOT EXISTS idx_programa_deleted_at ON public.programa(deleted_at);

-- programa_controle: ON DELETE CASCADE para permitir exclusão definitiva do programa
ALTER TABLE public.programa_controle
  DROP CONSTRAINT IF EXISTS programa_controle_programa_fkey;

ALTER TABLE public.programa_controle
  ADD CONSTRAINT programa_controle_programa_fkey
  FOREIGN KEY (programa) REFERENCES public.programa(id) ON DELETE CASCADE;
