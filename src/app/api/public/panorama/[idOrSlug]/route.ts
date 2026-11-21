import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { buildPanoramaSnapshot, PANORAMA_METODOLOGIA } from "@/lib/panorama/buildPanoramaSnapshot";
import {
  PANORAMA_PUBLIC_PROGRAMA_SELECT,
  resolveProgramaIdByIdOrSlug,
} from "@/lib/panorama/resolveProgramaIdPublic";

/**
 * GET /api/public/panorama/[idOrSlug]
 * Panorama inicial para leitura pública (sem login) — quem tem o link vê o relatório.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const trimmed = String(idOrSlug || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Programa obrigatório" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
    }

    const programaId = await resolveProgramaIdByIdOrSlug(supabase, trimmed);
    if (!programaId) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    const { data: programa, error: progError } = await supabase
      .from("programa")
      .select(PANORAMA_PUBLIC_PROGRAMA_SELECT)
      .eq("id", programaId)
      .maybeSingle();

    if (progError) {
      return NextResponse.json({ error: progError.message }, { status: 500 });
    }
    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    const snapshot = await buildPanoramaSnapshot(supabase, programaId);
    return NextResponse.json({
      metodologia: PANORAMA_METODOLOGIA,
      snapshot,
      programa,
      publico: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao montar panorama" },
      { status: 500 }
    );
  }
}