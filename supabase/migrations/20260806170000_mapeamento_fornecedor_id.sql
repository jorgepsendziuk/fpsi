ALTER TABLE public.mapeamento_dados
  ADD COLUMN IF NOT EXISTS fornecedor_id bigint REFERENCES public.programa_fornecedor (id) ON DELETE SET NULL;
