import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import {
  mediaMaturidadeEscopo,
  resolveProgramaEscopo,
  type MaturidadeRow,
} from "@/lib/programa/perfilEscopo";
import { resolveSeloLgpd, type ResolveSeloLgpdResult } from "@/lib/programa/seloLgpd";

export type PortalSeloPublico = {
  slug: string;
  nome: string;
  selo: ResolveSeloLgpdResult;
};

export async function loadPortalSeloPublico(slugRaw: string): Promise<PortalSeloPublico | null> {
  const slug = slugRaw.trim();
  if (!slug) return null;

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data: programa } = await admin
    .from("programa")
    .select("id, nome, slug, nome_fantasia, razao_social, perfil_escopo, escopo, gi_alvo")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!programa) return null;

  const { preset, escopo } = resolveProgramaEscopo({
    perfil_escopo: programa.perfil_escopo,
    escopo: programa.escopo,
    gi_alvo: programa.gi_alvo,
  });

  let rows: MaturidadeRow[] = [];
  const mat = await admin
    .from("programa_diagnostico_maturidade")
    .select("diagnostico_id, score")
    .eq("programa_id", programa.id);

  if (!mat.error && Array.isArray(mat.data)) {
    rows = mat.data.map((r) => ({
      diagnostico_id: Number(r.diagnostico_id),
      score: Number(r.score ?? 0),
    }));
  }

  const maturidadeMedia = mediaMaturidadeEscopo(rows, escopo);
  const selo = resolveSeloLgpd({ preset, maturidadeMedia });
  const nome =
    String(programa.nome_fantasia ?? "").trim() ||
    String(programa.razao_social ?? "").trim() ||
    String(programa.nome ?? "").trim() ||
    slug;

  return { slug: String(programa.slug ?? slug), nome, selo };
}
