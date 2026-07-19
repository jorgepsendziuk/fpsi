-- RLS para ropa, ripd e registro_ropa (alinhado a mapeamento_dados)

ALTER TABLE public.ropa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ripd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_ropa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ropa_select_member" ON public.ropa;
CREATE POLICY "ropa_select_member" ON public.ropa FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ropa_insert_member" ON public.ropa;
CREATE POLICY "ropa_insert_member" ON public.ropa FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ropa_update_member" ON public.ropa;
CREATE POLICY "ropa_update_member" ON public.ropa FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ropa_delete_member" ON public.ropa;
CREATE POLICY "ropa_delete_member" ON public.ropa FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ripd_select_member" ON public.ripd;
CREATE POLICY "ripd_select_member" ON public.ripd FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ripd.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ripd_insert_member" ON public.ripd;
CREATE POLICY "ripd_insert_member" ON public.ripd FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ripd.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ripd_update_member" ON public.ripd;
CREATE POLICY "ripd_update_member" ON public.ripd FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ripd.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "ripd_delete_member" ON public.ripd;
CREATE POLICY "ripd_delete_member" ON public.ripd FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = ripd.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "registro_ropa_select_member" ON public.registro_ropa;
CREATE POLICY "registro_ropa_select_member" ON public.registro_ropa FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = registro_ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "registro_ropa_insert_member" ON public.registro_ropa;
CREATE POLICY "registro_ropa_insert_member" ON public.registro_ropa FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = registro_ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "registro_ropa_update_member" ON public.registro_ropa;
CREATE POLICY "registro_ropa_update_member" ON public.registro_ropa FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = registro_ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

DROP POLICY IF EXISTS "registro_ropa_delete_member" ON public.registro_ropa;
CREATE POLICY "registro_ropa_delete_member" ON public.registro_ropa FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.programa_users pu
    WHERE pu.programa_id = registro_ropa.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
  ));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ropa TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ripd TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registro_ropa TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.ropa_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.ripd_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.registro_ropa_id_seq TO authenticated;
