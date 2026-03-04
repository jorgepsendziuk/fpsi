-- RLS e Grants para programa_papel_lgpd_instituicao e programa_papel_lgpd_vinculo
-- Acesso apenas para membros do programa (programa_users, status accepted)

ALTER TABLE public.programa_papel_lgpd_instituicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_papel_lgpd_vinculo ENABLE ROW LEVEL SECURITY;

-- Instituições: SELECT/INSERT/UPDATE/DELETE para membros do programa
DROP POLICY IF EXISTS "papel_lgpd_instituicao_select_member" ON public.programa_papel_lgpd_instituicao;
CREATE POLICY "papel_lgpd_instituicao_select_member"
    ON public.programa_papel_lgpd_instituicao FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_instituicao.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "papel_lgpd_instituicao_insert_member" ON public.programa_papel_lgpd_instituicao;
CREATE POLICY "papel_lgpd_instituicao_insert_member"
    ON public.programa_papel_lgpd_instituicao FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_instituicao.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "papel_lgpd_instituicao_update_member" ON public.programa_papel_lgpd_instituicao;
CREATE POLICY "papel_lgpd_instituicao_update_member"
    ON public.programa_papel_lgpd_instituicao FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_instituicao.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "papel_lgpd_instituicao_delete_member" ON public.programa_papel_lgpd_instituicao;
CREATE POLICY "papel_lgpd_instituicao_delete_member"
    ON public.programa_papel_lgpd_instituicao FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_instituicao.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

-- Vínculos: mesmo padrão
DROP POLICY IF EXISTS "papel_lgpd_vinculo_select_member" ON public.programa_papel_lgpd_vinculo;
CREATE POLICY "papel_lgpd_vinculo_select_member"
    ON public.programa_papel_lgpd_vinculo FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_vinculo.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "papel_lgpd_vinculo_insert_member" ON public.programa_papel_lgpd_vinculo;
CREATE POLICY "papel_lgpd_vinculo_insert_member"
    ON public.programa_papel_lgpd_vinculo FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_vinculo.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "papel_lgpd_vinculo_update_member" ON public.programa_papel_lgpd_vinculo;
CREATE POLICY "papel_lgpd_vinculo_update_member"
    ON public.programa_papel_lgpd_vinculo FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_vinculo.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "papel_lgpd_vinculo_delete_member" ON public.programa_papel_lgpd_vinculo;
CREATE POLICY "papel_lgpd_vinculo_delete_member"
    ON public.programa_papel_lgpd_vinculo FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_papel_lgpd_vinculo.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

-- Grants (padrão do projeto)
GRANT ALL ON public.programa_papel_lgpd_instituicao TO anon, authenticated, service_role;
GRANT ALL ON public.programa_papel_lgpd_vinculo TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.programa_papel_lgpd_instituicao_id_seq TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.programa_papel_lgpd_vinculo_id_seq TO anon, authenticated, service_role;
