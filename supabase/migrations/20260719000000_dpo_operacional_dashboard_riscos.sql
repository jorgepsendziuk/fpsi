-- FPSI: Fase operacional DPO — SLA DSAR, workflow portal, formalização encarregado, gestão de riscos

-- ========== SLA automático em pedidos de titulares (+15 dias) ==========
CREATE OR REPLACE FUNCTION public.pedido_titular_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.protocolo IS NULL OR trim(NEW.protocolo) = '' THEN
        NEW.protocolo := public.gerar_protocolo_pedido_titular(NEW.programa_id);
    END IF;
    IF NEW.data_prazo_resposta IS NULL THEN
        NEW.data_prazo_resposta := (CURRENT_DATE + INTERVAL '15 days')::date;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pedido_titular_set_protocolo_trigger ON public.pedido_titular;
CREATE TRIGGER pedido_titular_set_protocolo_trigger
    BEFORE INSERT ON public.pedido_titular
    FOR EACH ROW
    EXECUTE FUNCTION public.pedido_titular_before_insert();

-- Backfill prazo em pedidos abertos sem data
UPDATE public.pedido_titular
SET data_prazo_resposta = (created_at::date + INTERVAL '15 days')::date
WHERE data_prazo_resposta IS NULL
  AND status IN ('recebido', 'em_analise');

-- ========== Workflow reportes e contato do portal ==========
ALTER TABLE public.programa_reportes
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS responsavel_user_id TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_internas TEXT,
  ADD COLUMN IF NOT EXISTS incidente_id INTEGER REFERENCES public.incidente(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.programa_reportes DROP CONSTRAINT IF EXISTS programa_reportes_status_check;
ALTER TABLE public.programa_reportes ADD CONSTRAINT programa_reportes_status_check CHECK (
  status IN ('novo', 'em_triagem', 'em_atendimento', 'convertido_incidente', 'encerrado', 'arquivado')
);

ALTER TABLE public.programa_contato
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS responsavel_user_id TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_internas TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.programa_contato DROP CONSTRAINT IF EXISTS programa_contato_status_check;
ALTER TABLE public.programa_contato ADD CONSTRAINT programa_contato_status_check CHECK (
  status IN ('novo', 'em_triagem', 'em_atendimento', 'respondido', 'encerrado', 'arquivado')
);

CREATE INDEX IF NOT EXISTS idx_programa_reportes_status ON public.programa_reportes(status);
CREATE INDEX IF NOT EXISTS idx_programa_contato_status ON public.programa_contato(status);

DROP TRIGGER IF EXISTS update_programa_reportes_updated_at ON public.programa_reportes;
CREATE TRIGGER update_programa_reportes_updated_at
    BEFORE UPDATE ON public.programa_reportes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_programa_contato_updated_at ON public.programa_contato;
CREATE TRIGGER update_programa_contato_updated_at
    BEFORE UPDATE ON public.programa_contato
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP POLICY IF EXISTS "programa_reportes_update_member" ON public.programa_reportes;
CREATE POLICY "programa_reportes_update_member"
    ON public.programa_reportes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_reportes.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "programa_contato_update_member" ON public.programa_contato;
CREATE POLICY "programa_contato_update_member"
    ON public.programa_contato FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_contato.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

-- ========== Formalização encarregado (Resolução ANPD 18/2024) ==========
ALTER TABLE public.programa
  ADD COLUMN IF NOT EXISTS encarregado_substituto INTEGER REFERENCES public.responsavel(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dpo_ato_designacao_data DATE,
  ADD COLUMN IF NOT EXISTS dpo_ato_designacao_texto TEXT,
  ADD COLUMN IF NOT EXISTS dpo_conflito_interesses_avaliado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dpo_notificacao_email TEXT,
  ADD COLUMN IF NOT EXISTS risco_tolerancia_score NUMERIC(4,2) DEFAULT 12.0;

COMMENT ON COLUMN public.programa.encarregado_substituto IS 'Substituto formal do encarregado (ANPD Res. 18/2024 art. 4)';
COMMENT ON COLUMN public.programa.dpo_ato_designacao_texto IS 'Texto/resumo do ato formal de designação do encarregado';
COMMENT ON COLUMN public.programa.dpo_notificacao_email IS 'E-mail para alertas operacionais (DSAR, reportes, incidentes)';
COMMENT ON COLUMN public.programa.risco_tolerancia_score IS 'Score máximo aceitável (prob×impacto) antes de alerta';

-- ========== Gestão de riscos centralizada ==========
CREATE TABLE IF NOT EXISTS public.programa_risco (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL DEFAULT 'privacidade',
    origem_tipo VARCHAR(50),
    origem_id INTEGER,
    probabilidade VARCHAR(20) NOT NULL DEFAULT 'medio',
    impacto VARCHAR(20) NOT NULL DEFAULT 'medio',
    score_inerente NUMERIC(5,2),
    score_residual NUMERIC(5,2),
    status VARCHAR(50) NOT NULL DEFAULT 'identificado',
    estrategia_mitigacao TEXT,
    responsavel VARCHAR(255),
    data_revisao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT programa_risco_programa_fkey FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE,
    CONSTRAINT programa_risco_categoria_check CHECK (
        categoria IN ('privacidade', 'seguranca', 'conformidade', 'operacional', 'reputacional', 'direitos_titulares')
    ),
    CONSTRAINT programa_risco_probabilidade_check CHECK (
        probabilidade IN ('muito_baixo', 'baixo', 'medio', 'alto', 'muito_alto')
    ),
    CONSTRAINT programa_risco_impacto_check CHECK (
        impacto IN ('muito_baixo', 'baixo', 'medio', 'alto', 'muito_alto')
    ),
    CONSTRAINT programa_risco_status_check CHECK (
        status IN ('identificado', 'em_tratamento', 'mitigado', 'aceito', 'materializado', 'encerrado')
    ),
    CONSTRAINT programa_risco_origem_tipo_check CHECK (
        origem_tipo IS NULL OR origem_tipo IN ('manual', 'ropa', 'ripd', 'incidente', 'diagnostico', 'dsar', 'fornecedor', 'mapeamento', 'reporte')
    )
);

CREATE INDEX IF NOT EXISTS idx_programa_risco_programa_id ON public.programa_risco(programa_id);
CREATE INDEX IF NOT EXISTS idx_programa_risco_status ON public.programa_risco(status);
CREATE INDEX IF NOT EXISTS idx_programa_risco_score_residual ON public.programa_risco(score_residual DESC NULLS LAST);

DROP TRIGGER IF EXISTS update_programa_risco_updated_at ON public.programa_risco;
CREATE TRIGGER update_programa_risco_updated_at
    BEFORE UPDATE ON public.programa_risco
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.programa_risco ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programa_risco_select_member" ON public.programa_risco;
CREATE POLICY "programa_risco_select_member"
    ON public.programa_risco FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_risco.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "programa_risco_insert_member" ON public.programa_risco;
CREATE POLICY "programa_risco_insert_member"
    ON public.programa_risco FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_risco.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "programa_risco_update_member" ON public.programa_risco;
CREATE POLICY "programa_risco_update_member"
    ON public.programa_risco FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_risco.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "programa_risco_delete_member" ON public.programa_risco;
CREATE POLICY "programa_risco_delete_member"
    ON public.programa_risco FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = programa_risco.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

COMMENT ON TABLE public.programa_risco IS 'Registro central de riscos de privacidade/segurança por programa';
