-- Dados da organização para o programa slug pinovara (FAPEX — fundação de apoio à pesquisa e extensão na Bahia).
-- Fontes públicas: https://www.fapex.org.br/, CNPJ divulgado em cadastros de fundações (ex.: portais de transparência / consolidações).
-- A FAPEX é pessoa jurídica de direito privado sem fins lucrativos; setor = 2 (privado).

UPDATE public.programa
SET
  razao_social = 'Fundação de Apoio à Pesquisa e à Extensão',
  nome_fantasia = 'FAPEX',
  cnpj = 10490525000106,
  atendimento_site = 'https://www.fapex.org.br',
  atendimento_fone = '(71) 3183-8400',
  atendimento_email = 'ouvidoria@fapex.org.br',
  setor = 2,
  sigla = NULL,
  unidade = NULL,
  codigo_orgao = NULL,
  endereco = NULL
WHERE slug = 'pinovara';
