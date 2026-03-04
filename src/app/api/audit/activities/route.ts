import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/audit/activities
 * Lista atividades de auditoria. Suporta filtros: programa_id, user_id, action, resource_type, desde, ate.
 * Requer usuário autenticado e membro do programa (quando programa_id informado).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programaId = searchParams.get("programa_id");
    const userId = searchParams.get("user_id");
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resource_type");
    const desde = searchParams.get("desde");
    const ate = searchParams.get("ate");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 500);

    let query = supabase
      .from("user_activities")
      .select(`
        id,
        user_id,
        programa_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        origem,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (programaId) {
      const progId = parseInt(programaId, 10);
      if (isNaN(progId)) {
        return NextResponse.json({ error: "programa_id inválido" }, { status: 400 });
      }
      const { data: member } = await supabase
        .from("programa_users")
        .select("programa_id")
        .eq("programa_id", progId)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();
      if (!member) {
        return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
      }
      query = query.eq("programa_id", progId);
    }

    if (userId) query = query.eq("user_id", userId);
    if (action) query = query.eq("action", action);
    if (resourceType) query = query.eq("resource_type", resourceType);
    if (desde) query = query.gte("created_at", desde);
    if (ate) query = query.lte("created_at", ate);

    const { data, error } = await query;

    if (error) {
      console.error("[audit] Erro ao listar atividades:", error);
      return NextResponse.json(
        { error: "Erro ao listar atividades", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[audit] Erro GET /api/audit/activities:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
