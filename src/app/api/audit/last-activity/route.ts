import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/audit/last-activity
 * Retorna a última atividade (create/update) para um recurso, com nome do usuário.
 * Query: programa_id (obrigatório), resource_type (opcional; se omitido, retorna a última atividade do programa).
 * resource_id (opcional).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programaId = searchParams.get("programa_id");
    const resourceType = searchParams.get("resource_type");
    const resourceId = searchParams.get("resource_id");

    if (!programaId) {
      return NextResponse.json(
        { error: "programa_id é obrigatório" },
        { status: 400 }
      );
    }

    const progId = parseInt(programaId, 10);
    if (isNaN(progId)) {
      return NextResponse.json(
        { error: "programa_id inválido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é membro do programa
    const { data: member } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("programa_id", progId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        { error: "Acesso negado ao programa" },
        { status: 403 }
      );
    }

    let query = supabase
      .from("user_activities")
      .select("id, user_id, action, resource_type, resource_id, created_at")
      .eq("programa_id", progId)
      .in("action", ["create", "update"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (resourceType) {
      query = query.eq("resource_type", resourceType);
    }
    if (resourceId) {
      const resId = parseInt(resourceId, 10);
      if (!isNaN(resId)) {
        query = query.eq("resource_id", resId);
      }
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error("[audit] Erro ao buscar última atividade:", error);
      return NextResponse.json(
        { error: "Erro ao buscar atividade", details: error.message },
        { status: 500 }
      );
    }

    const last = activities?.[0];
    if (!last) {
      return NextResponse.json({ lastActivity: null });
    }

    // Buscar nome do usuário em profiles
    let userName: string | null = null;
    if (last.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome, email")
        .eq("user_id", last.user_id)
        .maybeSingle();
      userName = profile?.nome?.trim() || profile?.email?.trim() || null;
    }

    return NextResponse.json({
      lastActivity: {
        created_at: last.created_at,
        user_id: last.user_id,
        user_name: userName,
        action: last.action,
      },
    });
  } catch (err) {
    console.error("[audit] Erro GET /api/audit/last-activity:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
