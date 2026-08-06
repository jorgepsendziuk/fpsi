import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";

async function requireMember(programaId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) } as const;
  }
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) } as const;
  }
  return { supabase, user } as const;
}

/**
 * DELETE /api/programas/[id]/evidencias/[evidenciaId]
 * Soft-delete (status=arquivado).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenciaId: string }> }
) {
  try {
    const { id, evidenciaId } = await params;
    const programaId = parseInt(id, 10);
    const evId = parseInt(evidenciaId, 10);
    if (Number.isNaN(programaId) || Number.isNaN(evId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase, user } = auth;

    const { error } = await supabase
      .from("evidencia")
      .update({ status: "arquivado", updated_at: new Date().toISOString() })
      .eq("programa_id", programaId)
      .eq("id", evId);
    if (error) throw error;

    await logActivity(supabase, {
      userId: user.id,
      action: "delete",
      resourceType: "evidencia",
      resourceId: evId,
      programaId,
      details: {},
      req: { headers: _request.headers },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

/** GET download (com conteúdo) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenciaId: string }> }
) {
  try {
    const { id, evidenciaId } = await params;
    const programaId = parseInt(id, 10);
    const evId = parseInt(evidenciaId, 10);
    if (Number.isNaN(programaId) || Number.isNaN(evId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;

    const { data, error } = await supabase
      .from("evidencia")
      .select("*")
      .eq("programa_id", programaId)
      .eq("id", evId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

    if (data.url_externa && !data.conteudo_base64) {
      return NextResponse.redirect(data.url_externa);
    }
    if (!data.conteudo_base64) {
      return NextResponse.json({ error: "Sem conteúdo" }, { status: 404 });
    }

    const buf = Buffer.from(data.conteudo_base64, "base64");
    return new NextResponse(buf, {
      headers: {
        "Content-Type": data.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(data.nome_arquivo || "evidencia")}"`,
        "Content-Length": String(buf.length),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
