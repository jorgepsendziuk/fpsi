-- ============================================
-- programa_users: ON DELETE CASCADE em programa_id
-- Permite exclusão definitiva do programa sem violar FK
-- ============================================

ALTER TABLE public.programa_users
  DROP CONSTRAINT IF EXISTS programa_users_programa_id_fkey;

ALTER TABLE public.programa_users
  DROP CONSTRAINT IF EXISTS programa_users_programa_fkey;

ALTER TABLE public.programa_users
  ADD CONSTRAINT programa_users_programa_id_fkey
  FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE;
