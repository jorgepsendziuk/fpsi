-- ============================================
-- FPSI - Programa demo e acesso do usuário demo
-- Garante que demo@fpsi.com.br tem acesso ao programa 1 (ou ao programa com slug 'demo').
-- Não apaga dados; apenas insere quando necessário.
-- ============================================

-- 1. Criar programa demo (id 1) se não existir
INSERT INTO public.programa (id, nome, nome_fantasia, razao_social, cnpj, setor, slug)
SELECT 1, 'Programa de Demonstração - FPSI', 'Empresa Demo Tech Ltda', 'Empresa Demo Tech Ltda', 12345678000199, 2, 'demo'
WHERE NOT EXISTS (SELECT 1 FROM public.programa WHERE id = 1);

-- 2. Garantir slug 'demo' no programa 1 (apenas se slug estiver vazio e 'demo' não estiver em uso)
UPDATE public.programa p
SET slug = 'demo'
WHERE p.id = 1
  AND (p.slug IS NULL OR trim(p.slug) = '')
  AND NOT EXISTS (SELECT 1 FROM public.programa o WHERE o.slug = 'demo' AND o.id <> 1);

-- 3. Vincular usuário demo ao programa 1 (se demo user existir em auth.users)
INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status)
SELECT 1, au.id::text, 'admin', '{}'::jsonb, 'accepted'
FROM auth.users au
WHERE au.email = 'demo@fpsi.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = 1 AND pu.user_id = au.id::text
  );
