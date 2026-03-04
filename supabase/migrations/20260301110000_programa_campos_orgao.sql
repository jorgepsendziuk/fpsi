-- Campos para órgãos públicos (quando não há Razão Social, Nome Fantasia, CNPJ)
-- Usados em Informações Básicas quando setor = 1 (Público)

ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS sigla text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS unidade text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS codigo_orgao text;

COMMENT ON COLUMN public.programa.sigla IS 'Sigla do órgão (ex: MF, STF). Usado quando setor = Público.';
COMMENT ON COLUMN public.programa.endereco IS 'Endereço do órgão ou organização (para ROPA e documentos).';
COMMENT ON COLUMN public.programa.unidade IS 'Unidade ou departamento (ex: Secretaria de X). Usado quando setor = Público.';
COMMENT ON COLUMN public.programa.codigo_orgao IS 'Código do órgão (ex: SIAFI, SIAPE). Usado quando setor = Público.';
