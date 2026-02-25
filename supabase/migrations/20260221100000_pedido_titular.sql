-- ============================================
-- FPSI - Pedidos dos Titulares (art. 18 LGPD)
-- Registro de pedidos de acesso, correção, exclusão, portabilidade e revogação de consentimento.
-- Depende de: programa (slug), update_updated_at_column()
-- ============================================

CREATE TABLE IF NOT EXISTS public.pedido_titular (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL,
    protocolo TEXT,
    tipo TEXT NOT NULL,
    nome_titular TEXT NOT NULL,
    email_titular TEXT NOT NULL,
    documento_titular TEXT,
    descricao_pedido TEXT,
    status TEXT NOT NULL DEFAULT 'recebido',
    data_prazo_resposta DATE,
    data_resposta TIMESTAMP WITH TIME ZONE,
    observacoes_internas TEXT,
    origem TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT pedido_titular_programa_fkey FOREIGN KEY (programa_id) REFERENCES public.programa(id) ON DELETE CASCADE,
    CONSTRAINT pedido_titular_tipo_check CHECK (tipo IN ('acesso', 'correcao', 'exclusao', 'portabilidade', 'revogacao_consentimento')),
    CONSTRAINT pedido_titular_status_check CHECK (status IN ('recebido', 'em_analise', 'atendido', 'recusado', 'parcial')),
    CONSTRAINT pedido_titular_origem_check CHECK (origem IN ('formulario_publico', 'manual'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pedido_titular_protocolo ON public.pedido_titular(protocolo) WHERE protocolo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pedido_titular_programa_id ON public.pedido_titular(programa_id);
CREATE INDEX IF NOT EXISTS idx_pedido_titular_status ON public.pedido_titular(status);
CREATE INDEX IF NOT EXISTS idx_pedido_titular_created_at ON public.pedido_titular(created_at);

COMMENT ON TABLE public.pedido_titular IS 'Pedidos dos titulares de dados (art. 18 LGPD): acesso, correção, exclusão, portabilidade, revogação de consentimento';
COMMENT ON COLUMN public.pedido_titular.protocolo IS 'Código único legível: PT-{slug}-{ano}-{NNNNN}';
COMMENT ON COLUMN public.pedido_titular.origem IS 'formulario_publico = enviado pelo portal; manual = cadastrado pela área interna';

-- Função que gera o próximo protocolo para um programa no ano corrente (PT-{slug}-{ano}-{NNNNN})
CREATE OR REPLACE FUNCTION public.gerar_protocolo_pedido_titular(p_programa_id INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_slug TEXT;
    v_ano INT;
    v_seq INT;
    v_protocolo TEXT;
BEGIN
    SELECT COALESCE(NULLIF(trim(slug), ''), 'programa-' || substr(md5(id::text), 1, 8))
      INTO v_slug
      FROM public.programa
      WHERE id = p_programa_id;
    IF v_slug IS NULL THEN
        RAISE EXCEPTION 'Programa % não encontrado', p_programa_id;
    END IF;
    v_ano := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
    SELECT COALESCE(COUNT(*), 0) + 1
      INTO v_seq
      FROM public.pedido_titular
      WHERE programa_id = p_programa_id
        AND EXTRACT(YEAR FROM created_at) = v_ano;
    v_protocolo := 'PT-' || v_slug || '-' || v_ano || '-' || lpad(v_seq::text, 5, '0');
    RETURN v_protocolo;
END;
$$;

-- Trigger: preenche protocolo antes do INSERT se estiver NULL
CREATE OR REPLACE FUNCTION public.pedido_titular_set_protocolo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.protocolo IS NULL OR trim(NEW.protocolo) = '' THEN
        NEW.protocolo := public.gerar_protocolo_pedido_titular(NEW.programa_id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pedido_titular_set_protocolo_trigger ON public.pedido_titular;
CREATE TRIGGER pedido_titular_set_protocolo_trigger
    BEFORE INSERT ON public.pedido_titular
    FOR EACH ROW
    EXECUTE FUNCTION public.pedido_titular_set_protocolo();

DROP TRIGGER IF EXISTS update_pedido_titular_updated_at ON public.pedido_titular;
CREATE TRIGGER update_pedido_titular_updated_at
    BEFORE UPDATE ON public.pedido_titular
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.pedido_titular ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pedido_titular_select_by_programa_member" ON public.pedido_titular;
CREATE POLICY "pedido_titular_select_by_programa_member"
    ON public.pedido_titular FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = pedido_titular.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "pedido_titular_insert_by_programa_member" ON public.pedido_titular;
CREATE POLICY "pedido_titular_insert_by_programa_member"
    ON public.pedido_titular FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = pedido_titular.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "pedido_titular_update_by_programa_member" ON public.pedido_titular;
CREATE POLICY "pedido_titular_update_by_programa_member"
    ON public.pedido_titular FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = pedido_titular.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "pedido_titular_delete_by_programa_member" ON public.pedido_titular;
CREATE POLICY "pedido_titular_delete_by_programa_member"
    ON public.pedido_titular FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.programa_users pu
            WHERE pu.programa_id = pedido_titular.programa_id
              AND pu.user_id = auth.uid()::text
              AND pu.status = 'accepted'
        )
    );
