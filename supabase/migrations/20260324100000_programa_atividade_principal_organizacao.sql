-- Atividade institucional da organização (ROPA: "Principal atividade"), separada do escopo narrativo do programa de privacidade.
ALTER TABLE public.programa
  ADD COLUMN IF NOT EXISTS atividade_principal_organizacao text;

COMMENT ON COLUMN public.programa.atividade_principal_organizacao IS
  'Atividade principal da organização (uso no ROPA). Distinto de descricao_escopo (escopo do programa de privacidade).';

COMMENT ON COLUMN public.programa.descricao_escopo IS
  'Escopo do programa de privacidade (contexto do projeto). Para ROPA, a principal atividade vem da empresa ou de atividade_principal_organizacao.';
