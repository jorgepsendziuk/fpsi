import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuditorAcessoOk = {
  ok: true;
  admin: SupabaseClient;
  acessoId: number;
  programaId: number;
  expiresAt: string;
};

export type AuditorAcessoFail = { ok: false; status: number; error: string };

export function createAuditorAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Valida o token público do portal (sem login). */
export async function resolveAuditorAcesso(
  token: string,
  opts?: { touch?: boolean }
): Promise<AuditorAcessoOk | AuditorAcessoFail> {
  if (!token || token.length < 16) {
    return { ok: false, status: 400, error: "Token inválido" };
  }
  const admin = createAuditorAdmin();
  if (!admin) return { ok: false, status: 500, error: "Configuração incompleta" };

  const { data: acesso, error } = await admin
    .from("programa_auditor_acesso")
    .select("id, programa_id, expires_at, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (error) return { ok: false, status: 500, error: error.message };
  if (!acesso || acesso.revoked_at) {
    return { ok: false, status: 403, error: "Acesso inválido ou revogado" };
  }
  if (new Date(acesso.expires_at) < new Date()) {
    return { ok: false, status: 403, error: "Acesso expirado" };
  }

  if (opts?.touch !== false) {
    await admin
      .from("programa_auditor_acesso")
      .update({ last_access_at: new Date().toISOString() })
      .eq("id", acesso.id);
  }

  return {
    ok: true,
    admin,
    acessoId: Number(acesso.id),
    programaId: Number(acesso.programa_id),
    expiresAt: String(acesso.expires_at),
  };
}
