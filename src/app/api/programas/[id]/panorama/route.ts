import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import { buildPanoramaSnapshot, PANORAMA_METODOLOGIA } from "@/lib/panorama/buildPanoramaSnapshot";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

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