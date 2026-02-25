-- ============================================
-- FPSI - Incidentes de segurança (dados pessoais)
-- Registro de incidentes que afetam dados pessoais; comunicação ANPD e titulares (LGPD).
-- Depende de: programa, update_updated_at_column()
-- ============================================

CREATE TABLE IF NOT EXISTS public.incidente (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    data_ocorrencia DATE,
    data_detecao DATE,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100),
    dados_afetados TEXT,
    comunicacao_anpd BOOLEAN NOT NULL DEFAULT false,
    data_comunicacao_anpd DATE,
    comunicacao_titulares BOOLEAN NOT NULL DEFAULT false,
    data_comunicacao_titulares DATE,
    medidas_adotadas TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'em_analise',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT incidente_programa_fkey FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE,
    CONSTRAINT incidente_status_check CHECK (status IN ('em_analise', 'comunicado_anpd', 'comunicado_titulares', 'encerrado', 'outro'))
);

CREATE INDEX IF NOT EXISTS idx_incidente_programa_id ON public.incidente(programa_id);
CREATE INDEX IF NOT EXISTS idx_incidente_data_ocorrencia ON public.incidente(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_incidente_status ON public.incidente(status);

COMMENT ON TABLE public.incidente IS 'Registro de incidentes de segurança que afetam dados pessoais; comunicação ANPD e titulares';
COMMENT ON COLUMN public.incidente.comunicacao_anpd IS 'Se a ANPD foi comunicada';
COMMENT ON COLUMN public.incidente.comunicacao_titulares IS 'Se os titulares foram comunicados';

DROP TRIGGER IF EXISTS update_incidente_updated_at ON public.incidente;
CREATE TRIGGER update_incidente_updated_at
    BEFORE UPDATE ON public.incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: mesmo padrão de programa (acesso via programa_users)
ALTER TABLE public.incidente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incidente_select_by_programa_member" ON public.incidente;
CREATE POLICY "incidente_select_by_programa_member"
    ON public.incidente FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = incidente.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "incidente_insert_by_programa_member" ON public.incidente;
CREATE POLICY "incidente_insert_by_programa_member"
    ON public.incidente FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = incidente.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "incidente_update_by_programa_member" ON public.incidente;
CREATE POLICY "incidente_update_by_programa_member"
    ON public.incidente FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = incidente.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted')
    );

DROP POLICY IF EXISTS "incidente_delete_by_programa_member" ON public.incidente;
CREATE POLICY "incidente_delete_by_programa_member"
    ON public.incidente FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = incidente.programa_id AND pu.user_id = auth.uid()::text AND pu.status = 'accepted')
    );
