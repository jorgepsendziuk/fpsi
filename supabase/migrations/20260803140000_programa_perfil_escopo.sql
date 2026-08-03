-- Escopo do programa: planos (presets) + matriz ignorável (jsonb)

ALTER TABLE public.programa
  ADD COLUMN IF NOT EXISTS perfil_escopo text NOT NULL DEFAULT 'completo',
  ADD COLUMN IF NOT EXISTS gi_alvo text NULL,
  ADD COLUMN IF NOT EXISTS escopo jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.programa
  DROP CONSTRAINT IF EXISTS programa_perfil_escopo_check;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_perfil_escopo_check
  CHECK (perfil_escopo IN ('essencial', 'completo', 'com_ia', 'custom'));

ALTER TABLE public.programa
  DROP CONSTRAINT IF EXISTS programa_gi_alvo_check;

ALTER TABLE public.programa
  ADD CONSTRAINT programa_gi_alvo_check
  CHECK (gi_alvo IS NULL OR gi_alvo IN ('G1', 'G2', 'G3'));

COMMENT ON COLUMN public.programa.perfil_escopo IS 'Preset de escopo: essencial | completo | com_ia | custom';
COMMENT ON COLUMN public.programa.gi_alvo IS 'Grupo de implementação alvo para SI (G1/G2/G3); null se SI fora do escopo';
COMMENT ON COLUMN public.programa.escopo IS 'Matriz versionada: diagnosticos, modulos, comites, controles_ignorados, medidas_ignoradas';

-- Programas existentes: escopo completo (comportamento atual)
UPDATE public.programa
SET
  perfil_escopo = 'completo',
  gi_alvo = COALESCE(gi_alvo, 'G1'),
  escopo = jsonb_build_object(
    'v', 1,
    'diagnosticos', jsonb_build_object('1', true, '2', true, '3', true, '4', false),
    'modulos', jsonb_build_object(
      'escritorio-governanca', true,
      'responsabilidades', true,
      'riscos', true,
      'conformidade-tratamento', true,
      'conformidade-mapeamento', true,
      'conformidade-ropa', true,
      'conformidade-ripd', true,
      'conformidade-incidentes', true,
      'diagnostico', true,
      'planos-acao', true,
      'politicas', true,
      'portal-privacidade', true,
      'inventario-ia', false,
      'usuarios', true,
      'auditoria', true
    ),
    'comites', jsonb_build_object('si', true, 'priva', true, 'etir', true, 'ia', false),
    'controles_ignorados', '[]'::jsonb,
    'medidas_ignoradas', '[]'::jsonb
  )
WHERE escopo = '{}'::jsonb OR escopo IS NULL;
