import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import { buildPanoramaSnapshot, PANORAMA_METODOLOGIA } from "@/lib/panorama/buildPanoramaSnapshot";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { resolveProgramaIdByIdOrSlug } from "@/lib/panorama/resolveProgramaIdPublic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trimmed = String(id || "").trim();
  if (!trimmed) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let programaId = parseInt(trimmed, 10);
  if (Number.isNaN(programaId)) {
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
    const resolved = await resolveProgramaIdByIdOrSlug(admin, trimmed);
    if (!resolved) return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    programaId = resolved;
  }

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  try {
    const snapshot = await buildPanoramaSnapshot(auth.supabase, programaId);
    return NextResponse.json({ metodologia: PANORAMA_METODOLOGIA, snapshot });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao montar panorama" },
      { status: 500 }
    );
  }
}