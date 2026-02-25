import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./constants";

/**
 * Cliente Supabase com service role - bypassa RLS.
 * Usar apenas em API routes do servidor. Nunca expor no cliente.
 * Configure SUPABASE_SERVICE_ROLE_KEY no .env.local
 * Lê a variável no momento da chamada (Next.js carrega .env após alguns imports).
 */
export const createSupabaseAdminClient = (): SupabaseClient | null => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
