-- Logos de empresa/órgão e do programa (base64 comprimido, ~50-100KB cada)
-- Exibidos no portal, cards de programas e página do programa

ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS logo_orgao_empresa text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS logo_programa text;

COMMENT ON COLUMN public.programa.logo_orgao_empresa IS 'Logo da empresa ou órgão (base64 data URL, comprimida). Ex: data:image/jpeg;base64,...';
COMMENT ON COLUMN public.programa.logo_programa IS 'Logo do programa (base64 data URL, comprimida). Ex: data:image/jpeg;base64,...';
