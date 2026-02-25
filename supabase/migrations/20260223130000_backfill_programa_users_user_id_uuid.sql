-- Backfill programa_users.user_id: converte valores que são email para UUID (auth.users.id).
-- RLS e useUserPermissions comparam com auth.uid(); user_id deve ser sempre UUID em string.
-- Apenas UPDATEs; não apaga dados. Linhas sem correspondência em auth.users permanecem inalteradas.

UPDATE public.programa_users pu
SET user_id = (
  SELECT au.id::text
  FROM auth.users au
  WHERE au.email = pu.user_id
  LIMIT 1
)
WHERE pu.user_id IS NOT NULL
  AND pu.user_id <> ''
  -- Apenas linhas em que user_id não é um UUID válido (ex.: email armazenado no passado)
  AND pu.user_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.email = pu.user_id
  );
