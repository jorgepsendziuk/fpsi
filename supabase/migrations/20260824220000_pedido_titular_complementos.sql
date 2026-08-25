-- Complementos do titular no pedido DSAR (portal público) e histórico de prazos.

ALTER TABLE public.pedido_titular
  ADD COLUMN IF NOT EXISTS complementos jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.pedido_titular.complementos IS
  'Histórico de detalhes adicionados pelo titular: [{ texto, created_at, prazo_resposta }].';
