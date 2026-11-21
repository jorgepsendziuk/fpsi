import type { SupabaseClient } from "@supabase/supabase-js";

/** Resolve id do programa por id numérico ou slug (uso em rotas públicas com service role). */
export async function resolveProgramaIdByIdOrSlug(
  supabase: SupabaseClient,
  idOrSlug: string
): Promise<number | null> {
  const trimmed = String(idOrSlug || "").trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const id = parseInt(trimmed, 10);
    if (Number.isNaN(id)) return null;
    const { data } = await supabase
      .from("programa")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    return data?.id ?? null;
  }
  const { data } = await supabase
    .from("programa")
    .select("id")
    .eq("slug", trimmed)
    .is("deleted_at", null)
    .maybeSingle();
  return data?.id ?? null;
}

export const PANORAMA_PUBLIC_PROGRAMA_SELECT =
  "id, nome, slug, razao_social, nome_fantasia, cnpj, atendimento_fone, atendimento_email, atendimento_site, encarregado_dados_pessoais, logo_orgao_empresa, logo_programa";