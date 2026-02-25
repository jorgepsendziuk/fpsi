-- ============================================
-- programa_invites: ON DELETE CASCADE em programa_id
-- Permite exclusão definitiva do programa sem violar FK
-- ============================================

ALTER TABLE public.programa_invites
  DROP CONSTRAINT IF EXISTS programa_invites_programa_id_fkey;

ALTER TABLE public.programa_invites
  DROP CONSTRAINT IF EXISTS programa_invites_programa_fkey;

ALTER TABLE public.programa_invites
  ADD CONSTRAINT programa_invites_programa_id_fkey
  FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE;
