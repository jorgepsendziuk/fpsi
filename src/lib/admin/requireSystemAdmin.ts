import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";

function isEnvSystemAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.FPSI_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}

export async function requireSystemAdmin(): Promise<{ ok: true; user: User } | { ok: false; user: User | null }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, user: null };

  if (isEnvSystemAdmin(user.email)) {
    return { ok: true, user };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_system_admin")
    .eq("user_id", user.id)
    .single();

  if (profile?.is_system_admin === true) {
    return { ok: true, user };
  }

  return { ok: false, user };
}

export function maskSecret(value: string | undefined, visible = 4): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.length <= visible * 2) return "••••••••";
  return `${trimmed.slice(0, visible)}••••${trimmed.slice(-visible)}`;
}
