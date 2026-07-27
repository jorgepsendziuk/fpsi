-- Protocolo DSAR opaco (não sequencial) — evita enumeração / vazamento de volume.
-- Formato: PT-{slug}-{ano}-{TOKEN} (TOKEN = 10 hex aleatórios).

CREATE OR REPLACE FUNCTION public.gerar_protocolo_pedido_titular(p_programa_id INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_slug TEXT;
    v_ano INT;
    v_token TEXT;
    v_protocolo TEXT;
    v_tentativas INT := 0;
BEGIN
    SELECT COALESCE(NULLIF(trim(slug), ''), 'programa-' || substr(md5(id::text), 1, 8))
      INTO v_slug
      FROM public.programa
      WHERE id = p_programa_id;
    IF v_slug IS NULL THEN
        RAISE EXCEPTION 'Programa % não encontrado', p_programa_id;
    END IF;

    -- Sanitiza slug para o protocolo (sem espaços / caracteres problemáticos)
    v_slug := regexp_replace(lower(v_slug), '[^a-z0-9_-]', '-', 'g');
    v_slug := regexp_replace(v_slug, '-+', '-', 'g');
    v_slug := trim(both '-' from v_slug);
    IF v_slug = '' THEN
        v_slug := 'programa';
    END IF;

    v_ano := EXTRACT(YEAR FROM CURRENT_DATE)::INT;

    LOOP
        v_tentativas := v_tentativas + 1;
        IF v_tentativas > 12 THEN
            RAISE EXCEPTION 'Não foi possível gerar protocolo único para programa %', p_programa_id;
        END IF;
        -- UUID sem hífens → 10 chars hex (não sequencial, sem revelar contagem)
        v_token := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
        v_protocolo := 'PT-' || v_slug || '-' || v_ano || '-' || v_token;
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.pedido_titular WHERE protocolo = v_protocolo
        );
    END LOOP;

    RETURN v_protocolo;
END;
$$;

COMMENT ON FUNCTION public.gerar_protocolo_pedido_titular(INTEGER) IS
  'Gera protocolo DSAR opaco: PT-{slug}-{ano}-{10hex}. Não sequencial (sem enumeração de volume).';

COMMENT ON COLUMN public.pedido_titular.protocolo IS
  'Código único opaco: PT-{slug}-{ano}-{TOKEN_HEX}. Não é sequencial.';
