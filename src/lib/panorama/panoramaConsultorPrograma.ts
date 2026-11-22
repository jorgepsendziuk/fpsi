import type { SupabaseClient } from "@supabase/supabase-js";
import { FPSI_AUTHORSHIP, JORGE_PORTFOLIO_URL } from "@/lib/credits/fpsiCredits";

export type PanoramaConsultorPrograma = {
  nome: string;
  email: string | null;
  telefone: string | null;
  portfolioUrl: string;
};

const FALLBACK: PanoramaConsultorPrograma = {
  nome: FPSI_AUTHORSHIP.authorShort,
  email: null,
  telefone: null,
  portfolioUrl: JORGE_PORTFOLIO_URL,
};

/** Primeiro admin/coordenador aceito do programa (quem montou o cadastro no FPSI). */
export async function resolvePanoramaConsultorPrograma(
  supabase: SupabaseClient,
  programaId: number
): Promise<PanoramaConsultorPrograma> {
  const { data: members } = await supabase
    .from("programa_users")
    .select("user_id, role, accepted_at")
    .eq("programa_id", programaId)
    .eq("status", "accepted")
    .in("role", ["admin", "coordenador"])
    .order("accepted_at", { ascending: true, nullsFirst: false })
    .limit(8);

  const pick =
    members?.find((m) => m.role === "admin") ??
    members?.find((m) => m.role === "coordenador") ??
    members?.[0];

  if (!pick?.user_id) return { ...FALLBACK };

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, telefone")
    .eq("user_id", pick.user_id)
    .maybeSingle();

  const nome = String(profile?.nome ?? "").trim() || FALLBACK.nome;
  const email = String(profile?.email ?? "").trim() || null;
  const telefone = String(profile?.telefone ?? "").trim() || null;

  return {
    nome,
    email,
    telefone,
    portfolioUrl: JORGE_PORTFOLIO_URL,
  };
}

export function telefoneHref(telefone: string): string {
  const digits = telefone.replace(/\D/g, "");
  if (!digits) return `tel:${telefone.trim()}`;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `tel:+${withCountry}`;
}