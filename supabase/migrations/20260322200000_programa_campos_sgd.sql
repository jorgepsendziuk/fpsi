-- Campos de rastreio SGD/ME para órgãos públicos (Nota Técnica, versões e prazos do diagnóstico)

ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS sgd_numero_documento_nota_tecnica text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS sgd_versao_diagnostico_enviado text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS sgd_data_limite_retorno date;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS sgd_retorno_data date;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS sgd_versao_diagnostico text;

COMMENT ON COLUMN public.programa.sgd_numero_documento_nota_tecnica IS 'SGD: número do documento (Nota Técnica)';
COMMENT ON COLUMN public.programa.sgd_versao_diagnostico_enviado IS 'SGD: versão do diagnóstico enviado ao órgão';
COMMENT ON COLUMN public.programa.sgd_data_limite_retorno IS 'SGD: data limite para retorno do diagnóstico';
COMMENT ON COLUMN public.programa.sgd_retorno_data IS 'SGD: data de retorno do diagnóstico para o SGD';
COMMENT ON COLUMN public.programa.sgd_versao_diagnostico IS 'SGD: versão do diagnóstico devolvido';
