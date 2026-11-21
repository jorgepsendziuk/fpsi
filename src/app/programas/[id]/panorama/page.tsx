import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { resolveProgramaIdByIdOrSlug } from "@/lib/panorama/resolveProgramaIdPublic";

/** Atalho interno: /programas/{id|slug}/panorama → URL pública curta /{slug}/panorama */
export default async function ProgramaPanoramaRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trimmed = String(id || "").trim();
  const admin = createSupabaseAdminClient();
  if (admin) {
    const programaId = await resolveProgramaIdByIdOrSlug(admin, trimmed);
    if (programaId) {
      const { data } = await admin.from("programa").select("slug").eq("id", programaId).maybeSingle();
      const slug = typeof data?.slug === "string" ? data.slug.trim() : "";
      if (slug) {
        redirect(`/${encodeURIComponent(slug)}/panorama`);
      }
    }
  }
  redirect(`/programas/${encodeURIComponent(trimmed)}/diagnostico/panorama`);
}