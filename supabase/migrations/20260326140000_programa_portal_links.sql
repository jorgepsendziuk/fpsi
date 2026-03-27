-- Links opcionais do portal público (quando preenchidos, substituem as páginas internas padrão).
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS link_politica_privacidade text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS link_aviso_titular text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS link_cookies text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS link_declaracao_seguranca text;
ALTER TABLE public.programa ADD COLUMN IF NOT EXISTS link_reportar_vulnerabilidade text;

COMMENT ON COLUMN public.programa.link_politica_privacidade IS 'URL externa da política de privacidade; se vazio, usa página interna /{slug}/politica-privacidade';
COMMENT ON COLUMN public.programa.link_aviso_titular IS 'URL externa do aviso do portal; se vazio, usa página interna /{slug}/aviso-portal-titular';
COMMENT ON COLUMN public.programa.link_cookies IS 'URL externa da política de cookies; se vazio, usa página interna /{slug}/cookies';
