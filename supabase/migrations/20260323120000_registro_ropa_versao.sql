-- Versões congeladas do ROPA (cabeçalho + operações) para auditoria e PDF histórico
CREATE TABLE IF NOT EXISTS public.registro_ropa_versao (
    id BIGSERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES public.programa(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    nota TEXT,
    registro_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    operacoes_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT registro_ropa_versao_programa_numero UNIQUE (programa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_registro_ropa_versao_programa ON public.registro_ropa_versao(programa_id);
CREATE INDEX IF NOT EXISTS idx_registro_ropa_versao_created ON public.registro_ropa_versao(programa_id, created_at DESC);

COMMENT ON TABLE public.registro_ropa_versao IS 'Snapshot imutável do registro_ropa + linhas ropa no momento da versão (híbrido + versionamento)';
COMMENT ON COLUMN public.registro_ropa_versao.registro_snapshot IS 'JSON do cabeçalho ANPD (registro_ropa)';
COMMENT ON COLUMN public.registro_ropa_versao.operacoes_snapshot IS 'Array JSON das operações (ropa)';

ALTER TABLE public.registro_ropa_versao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registro_ropa_versao_select_member"
    ON public.registro_ropa_versao FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = registro_ropa_versao.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

CREATE POLICY "registro_ropa_versao_insert_member"
    ON public.registro_ropa_versao FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = registro_ropa_versao.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

GRANT SELECT, INSERT ON public.registro_ropa_versao TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.registro_ropa_versao_id_seq TO authenticated;
GRANT ALL ON public.registro_ropa_versao TO service_role;
