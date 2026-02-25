-- ============================================
-- FPSI - Reportes (vulnerabilidade/incidente) e Contato do portal público
-- Depende de: programa, update_updated_at_column()
-- ============================================

-- Reportes: vulnerabilidade ou incidente reportado pelo público
CREATE TABLE IF NOT EXISTS public.programa_reportes (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    nome TEXT,
    email TEXT NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT programa_reportes_programa_fkey FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE,
    CONSTRAINT programa_reportes_tipo_check CHECK (tipo IN ('vulnerabilidade', 'incidente'))
);

CREATE INDEX IF NOT EXISTS idx_programa_reportes_programa_id ON public.programa_reportes(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_reportes_created_at ON public.programa_reportes(created_at);
COMMENT ON TABLE public.programa_reportes IS 'Reportes de vulnerabilidade ou incidente enviados pelo portal público';

-- Contato: mensagens de contato pelo portal público
CREATE TABLE IF NOT EXISTS public.programa_contato (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    assunto TEXT,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT programa_contato_programa_fkey FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_programa_contato_programa_id ON public.programa_contato(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_contato_created_at ON public.programa_contato(created_at);
COMMENT ON TABLE public.programa_contato IS 'Mensagens de contato enviadas pelo portal público';

-- RLS: apenas inserção via API (service role). Leitura apenas para membros do programa.
ALTER TABLE public.programa_reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_contato ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programa_reportes_select_member" ON public.programa_reportes;
CREATE POLICY "programa_reportes_select_member"
    ON public.programa_reportes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_reportes.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "programa_contato_select_member" ON public.programa_contato;
CREATE POLICY "programa_contato_select_member"
    ON public.programa_contato FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_contato.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted'
        )
    );

-- Inserção é feita via API com service role (sem policy para anônimo)
