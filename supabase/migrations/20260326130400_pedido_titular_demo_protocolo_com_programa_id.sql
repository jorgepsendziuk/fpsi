-- Normaliza protocolos de pedidos demo antigos (PT-DEMO-2026-NNNNN → PT-DEMO-{programa_id}-2026-NNNNN).
UPDATE public.pedido_titular pt
SET protocolo = 'PT-DEMO-' || pt.programa_id::text || '-2026-' || regexp_replace(pt.protocolo, '^PT-DEMO-2026-', '')
WHERE pt.protocolo ~ '^PT-DEMO-2026-';
