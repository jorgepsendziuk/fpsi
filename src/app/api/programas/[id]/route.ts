import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { logActivity } from "@/lib/services/auditService";

async function isCreator(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, programaId: number, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("user_id")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.user_id === userId;
}

async function isProgramaMember(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, programaId: number, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return !!data;
}

/**
 * GET /api/programas/[id]
 * Retorna o programa por id numérico ou slug. Apenas para membros aceitos.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trimmed = String(id || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "ID ou slug obrigatório" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isNumeric = /^\d+$/.test(trimmed);
    let query = supabase
      .from("programa")
      .select("*")
      .is("deleted_at", null);

    if (isNumeric) {
      query = query.eq("id", parseInt(trimmed, 10));
    } else {
      query = query.eq("slug", trimmed);
    }

    const { data: programa, error: progError } = await query.maybeSingle();

    if (progError) {
      console.error("Erro ao buscar programa:", progError);
      return NextResponse.json(
        { error: "Erro ao buscar programa", details: progError.message },
        { status: 500 }
      );
    }

    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    const isMember = await isProgramaMember(supabase, programa.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "Você não tem acesso a este programa" },
        { status: 403 }
      );
    }

    return NextResponse.json(programa);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API GET programa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/programas/[id]
 * Query ?permanent=1 ou ?permanent=true → exclusão definitiva (apenas criador, requer service role).
 * Sem query → soft delete: marca programa como excluído (lixeira). Apenas criador.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true" || searchParams.get("permanent") === "1";

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const creator = await isCreator(supabase, programaId, user.id);
    const { data: programa } = await supabase.from("programa").select("id, deleted_at").eq("id", programaId).maybeSingle();
    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    if (!creator) {
      return NextResponse.json(
        { error: "Apenas o criador do programa pode excluí-lo ou restaurá-lo" },
        { status: 403 }
      );
    }

    if (permanent) {
      const admin = createSupabaseAdminClient();
      if (!admin) {
        return NextResponse.json(
          { error: "Serviço indisponível para exclusão definitiva. Configure SUPABASE_SERVICE_ROLE_KEY." },
          { status: 503 }
        );
      }
      const { error: deleteError } = await admin.from("programa").delete().eq("id", programaId);
      if (deleteError) {
        console.error("Erro ao excluir programa (definitivo):", deleteError);
        return NextResponse.json(
          { error: "Erro ao excluir programa", details: deleteError.message },
          { status: 500 }
        );
      }
      await logActivity(admin, {
        userId: user.id,
        action: "delete",
        resourceType: "programa",
        resourceId: programaId,
        programaId,
        details: { permanent: true },
        req: { headers: request.headers },
      });
      return NextResponse.json({ message: "Programa excluído definitivamente" });
    }

    // Soft delete: marcar como excluído (lixeira)
    const { error: updateError } = await supabase
      .from("programa")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", programaId);

    if (updateError) {
      console.error("Erro ao mover programa para lixeira:", updateError);
      return NextResponse.json(
        { error: "Erro ao excluir programa", details: updateError.message },
        { status: 500 }
      );
    }
    await logActivity(supabase, {
      userId: user.id,
      action: "delete",
      resourceType: "programa",
      resourceId: programaId,
      programaId,
      details: { soft: true },
      req: { headers: request.headers },
    });
    return NextResponse.json({ message: "Programa movido para a lixeira" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API DELETE programa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/programas/[id]
 * Body: { restore: true } → restaura programa da lixeira (deleted_at = null). Apenas criador.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    if (body?.restore !== true) {
      return NextResponse.json({ error: "Use { restore: true } para restaurar" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const creator = await isCreator(supabase, programaId, user.id);
    if (!creator) {
      return NextResponse.json(
        { error: "Apenas o criador do programa pode restaurá-lo" },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from("programa")
      .update({ deleted_at: null })
      .eq("id", programaId);

    if (updateError) {
      console.error("Erro ao restaurar programa:", updateError);
      return NextResponse.json(
        { error: "Erro ao restaurar programa", details: updateError.message },
        { status: 500 }
      );
    }
    await logActivity(supabase, {
      userId: user.id,
      action: "restore",
      resourceType: "programa",
      resourceId: programaId,
      programaId,
      req: { headers: request.headers },
    });
    return NextResponse.json({ message: "Programa restaurado" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API PATCH programa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: message },
      { status: 500 }
    );
  }
}
