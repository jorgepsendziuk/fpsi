-- Adiciona coluna prioridade (boolean) em programa_medida para marcar medidas prioritárias no plano de trabalho
ALTER TABLE public.programa_medida
ADD COLUMN IF NOT EXISTS prioridade boolean DEFAULT false;

COMMENT ON COLUMN public.programa_medida.prioridade IS 'Indica se a medida é prioritária no plano de trabalho (Sim/Não)';
