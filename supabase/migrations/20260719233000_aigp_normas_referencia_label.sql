-- Alinha rótulo das medidas AIGP ao padrão PPSI ("Normas de referência:")
-- para o parser de chips / popup de consulta no diagnóstico.

UPDATE public.medida m
SET descricao = replace(m.descricao, E'\nReferências:', E'\nNormas de referência:')
FROM public.controle c
WHERE c.id = m.id_controle
  AND c.diagnostico = 4
  AND m.descricao LIKE E'%\nReferências:%';
