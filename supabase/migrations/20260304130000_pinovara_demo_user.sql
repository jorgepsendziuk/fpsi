-- Vincula usuário demo ao programa PINOVARA para permitir visualização do diagrama
-- Útil para testes; usuários reais devem ser adicionados pela aplicação

INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status)
SELECT p.id, au.id::text, 'admin', '{}'::jsonb, 'accepted'
FROM public.programa p
CROSS JOIN auth.users au
WHERE (p.slug IN ('pinovara', 'pinovaraufba') OR p.nome ILIKE '%pinovara%')
  AND au.email = 'demo@fpsi.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = p.id AND pu.user_id = au.id::text
  );
