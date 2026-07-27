-- Conta demo não deve acessar o programa institucional FPSI (slug fpsi).
-- Também remove is_system_admin da conta demo (foi concedido por engano em seed anterior).

DELETE FROM public.programa_users pu
USING auth.users au, public.programa p
WHERE pu.user_id = au.id::text
  AND au.email = 'demo@fpsi.com.br'
  AND p.id = pu.programa_id
  AND p.slug = 'fpsi';

UPDATE public.profiles
SET is_system_admin = false
WHERE email = 'demo@fpsi.com.br'
  AND is_system_admin IS DISTINCT FROM false;
