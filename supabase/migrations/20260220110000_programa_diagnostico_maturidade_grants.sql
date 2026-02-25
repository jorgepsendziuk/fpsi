-- Permitir leitura da view para os roles usados pelo cliente (anon, authenticated).
-- Sem isso, o Supabase retorna vazio ou erro ao consultar a view.
GRANT SELECT ON public.programa_diagnostico_maturidade TO anon;
GRANT SELECT ON public.programa_diagnostico_maturidade TO authenticated;
