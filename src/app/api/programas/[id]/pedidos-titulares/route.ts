import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/programas/[id]/pedidos-titulares
 * Lista pedidos do programa. Requer usuário em programa_users (accepted).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("programa_id", programaId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("pedido_titular")
      .select("*")
      .eq("programa_id", programaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar pedidos:", error);
      return NextResponse.json(
        { error: "Erro ao listar pedidos", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Erro GET pedidos-titulares:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/programas/[id]/pedidos-titulares
 * Cria pedido manual. Requer usuário em programa_users (accepted).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("programa_id", programaId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const body = await request.json();
    const {
      tipo,
      nome_titular,
      email_titular,
      documento_titular,
      descricao_pedido,
      status,
      data_prazo_resposta,
      observacoes_internas,
    } = body;

    if (!tipo || !nome_titular || !email_titular) {
      return NextResponse.json(
        { error: "tipo, nome_titular e email_titular são obrigatórios" },
        { status: 400 }
      );
    }

    const payload = {
      programa_id: programaId,
      tipo,
      nome_titular: String(nome_titular).trim(),
      email_titular: String(email_titular).trim(),
      documento_titular: documento_titular ? String(documento_titular).trim() : null,
      descricao_pedido: descricao_pedido ? String(descricao_pedido).trim() : null,
      status: status || "recebido",
      data_prazo_resposta: data_prazo_resposta || null,
      observacoes_internas: observacoes_internas ? String(observacoes_internas).trim() : null,
      origem: "manual",
    };

    const { data, error } = await supabase
      .from("pedido_titular")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar pedido:", error);
      return NextResponse.json(
        { error: "Erro ao criar pedido", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro POST pedidos-titulares:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
