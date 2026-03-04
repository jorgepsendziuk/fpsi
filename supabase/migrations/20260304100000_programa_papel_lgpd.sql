-- Papéis e Responsabilidades LGPD por programa
-- Baseado no diagrama: Controlador, Contratante, Operador (PROGRAMA_PRIVACIDADE.md)
-- Cada programa pode ter suas próprias instituições em cada papel

-- Instituições por papel (ex: INCRA, UFBA no Controlador; FUNARBE no Contratante; LGRDC no Operador)
CREATE TABLE IF NOT EXISTS public.programa_papel_lgpd_instituicao (
    id BIGSERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES public.programa(id) ON DELETE CASCADE,
    tipo_papel TEXT NOT NULL CHECK (tipo_papel IN ('controlador', 'contratante', 'operador')),
    ordem INTEGER NOT NULL DEFAULT 0,
    nome TEXT NOT NULL,
    descricao TEXT,
    contato TEXT,
    email TEXT,
    site TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relacionamentos entre instituições (setas do diagrama: TED, Contrato, etc.)
CREATE TABLE IF NOT EXISTS public.programa_papel_lgpd_vinculo (
    id BIGSERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES public.programa(id) ON DELETE CASCADE,
    instituicao_origem_id BIGINT NOT NULL REFERENCES public.programa_papel_lgpd_instituicao(id) ON DELETE CASCADE,
    instituicao_destino_id BIGINT REFERENCES public.programa_papel_lgpd_instituicao(id) ON DELETE CASCADE,
    -- Quando null, destino é o grupo (ex: LGRDC -> controlador)
    destino_tipo_papel TEXT CHECK (destino_tipo_papel IS NULL OR destino_tipo_papel IN ('controlador', 'contratante', 'operador')),
    tipo_vinculo TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT vinculo_destino_check CHECK (
        instituicao_destino_id IS NOT NULL OR destino_tipo_papel IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_programa_papel_lgpd_instituicao_programa ON public.programa_papel_lgpd_instituicao(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_papel_lgpd_instituicao_tipo ON public.programa_papel_lgpd_instituicao(tipo_papel);
CREATE INDEX IF NOT EXISTS idx_programa_papel_lgpd_vinculo_programa ON public.programa_papel_lgpd_vinculo(programa_id);

COMMENT ON TABLE public.programa_papel_lgpd_instituicao IS 'Instituições nos papéis LGPD (Controlador, Contratante, Operador) por programa';
COMMENT ON TABLE public.programa_papel_lgpd_vinculo IS 'Relacionamentos entre instituições no diagrama de papéis LGPD';

-- Trigger updated_at (usa função existente update_updated_at_column)
DROP TRIGGER IF EXISTS update_programa_papel_lgpd_instituicao_updated_at ON public.programa_papel_lgpd_instituicao;
CREATE TRIGGER update_programa_papel_lgpd_instituicao_updated_at
    BEFORE UPDATE ON public.programa_papel_lgpd_instituicao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_programa_papel_lgpd_vinculo_updated_at ON public.programa_papel_lgpd_vinculo;
CREATE TRIGGER update_programa_papel_lgpd_vinculo_updated_at
    BEFORE UPDATE ON public.programa_papel_lgpd_vinculo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
