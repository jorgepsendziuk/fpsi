-- Adiciona tipos de pedido do titular conforme art. 18 LGPD: informação sobre compartilhamento e oposição
-- Ref: PROCESSO_PEDIDOS_TITULARES.md

ALTER TABLE public.pedido_titular
  DROP CONSTRAINT IF EXISTS pedido_titular_tipo_check;

ALTER TABLE public.pedido_titular
  ADD CONSTRAINT pedido_titular_tipo_check CHECK (
    tipo IN (
      'acesso',
      'correcao',
      'exclusao',
      'portabilidade',
      'revogacao_consentimento',
      'info_compartilhamento',
      'oposicao'
    )
  );

COMMENT ON TABLE public.pedido_titular IS 'Pedidos dos titulares de dados (art. 18 LGPD): acesso, correção, exclusão, portabilidade, revogação de consentimento, informação sobre compartilhamento, oposição';
