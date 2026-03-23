-- Metadados de vigência e revisão por política (por programa), em vez de campos únicos em programa.
ALTER TABLE public.politica_programa
  ADD COLUMN IF NOT EXISTS inicio_vigencia date,
  ADD COLUMN IF NOT EXISTS prazo_revisao date;

COMMENT ON COLUMN public.politica_programa.inicio_vigencia IS 'Início de vigência desta política neste programa.';
COMMENT ON COLUMN public.politica_programa.prazo_revisao IS 'Data prevista para próxima revisão (gestão interna).';
