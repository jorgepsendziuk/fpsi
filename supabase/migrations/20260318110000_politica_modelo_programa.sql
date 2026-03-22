-- ============================================
-- FPSI - Modelos de Políticas e Políticas por Programa
-- ============================================

-- Modelos padrão editáveis pelo admin (templates globais)
CREATE TABLE IF NOT EXISTS public.politica_modelo (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    cor TEXT DEFAULT '#2196F3',
    ordem INTEGER NOT NULL DEFAULT 0,
    secoes JSONB DEFAULT '[]'::jsonb,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.politica_modelo IS 'Templates de políticas editáveis pelo administrador do sistema';
COMMENT ON COLUMN public.politica_modelo.secoes IS 'Array de seções: {id, secao, titulo, descricao, texto}';

-- Instâncias de políticas por programa (conteúdo editado pelo usuário)
CREATE TABLE IF NOT EXISTS public.politica_programa (
    id BIGSERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES public.programa(id) ON DELETE CASCADE,
    tipo_politica TEXT NOT NULL REFERENCES public.politica_modelo(id) ON DELETE CASCADE,
    secoes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(programa_id, tipo_politica)
);

CREATE INDEX IF NOT EXISTS idx_politica_programa_programa ON public.politica_programa(programa_id);
CREATE INDEX IF NOT EXISTS idx_politica_programa_tipo ON public.politica_programa(tipo_politica);

COMMENT ON TABLE public.politica_programa IS 'Políticas criadas por programa (conteúdo editado)';

-- RLS: politica_modelo - leitura para autenticados, escrita apenas para system admin (via API)
ALTER TABLE public.politica_modelo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "politica_modelo_select_authenticated"
    ON public.politica_modelo FOR SELECT
    TO authenticated
    USING (true);

-- politica_programa - membros do programa podem ver/editar
ALTER TABLE public.politica_programa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "politica_programa_select_member"
    ON public.politica_programa FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = politica_programa.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

CREATE POLICY "politica_programa_insert_member"
    ON public.politica_programa FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = politica_programa.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

CREATE POLICY "politica_programa_update_member"
    ON public.politica_programa FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = politica_programa.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

CREATE POLICY "politica_programa_delete_member"
    ON public.politica_programa FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = politica_programa.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted')
    );

-- Service role para admin API (bypass RLS)
GRANT ALL ON public.politica_modelo TO service_role;
GRANT ALL ON public.politica_programa TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.politica_programa_id_seq TO authenticated, service_role;
