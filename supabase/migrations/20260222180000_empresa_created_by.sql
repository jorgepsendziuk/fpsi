-- Permite listar empresas criadas pelo usuário (ainda não vinculadas a programas)
ALTER TABLE public.empresa
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.empresa.created_by_user_id IS 'Usuário que criou o cadastro (para listar "minhas empresas")';

CREATE INDEX IF NOT EXISTS idx_empresa_created_by_user_id ON public.empresa(created_by_user_id);
