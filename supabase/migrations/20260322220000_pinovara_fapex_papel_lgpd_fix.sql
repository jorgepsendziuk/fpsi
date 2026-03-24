-- Corrige instituição contratante: FUNARBE não é fundação da UFBA; o papel no TED é da FAPEX (Fundação de Apoio à Pesquisa e à Extensão).

UPDATE public.programa_papel_lgpd_instituicao
SET
  nome = 'FAPEX - Fundação de Apoio à Pesquisa e à Extensão',
  descricao = 'Fundação de apoio à pesquisa e extensão na Bahia; intermediária contratual junto à UFBA no TED 50/2023 (alinhado ao cadastro do programa no FPSI).'
WHERE nome = 'FUNARBE - Fundação UFBA'
  AND programa_id IN (SELECT id FROM public.programa WHERE slug IN ('pinovara', 'pinovaraufba'));
