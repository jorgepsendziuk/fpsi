import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// GET /api/profiles - Obter perfil do usuário logado
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(null);
      }
      console.error("Erro ao buscar perfil:", error);
      return NextResponse.json(
        { error: "Erro ao buscar perfil", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API de perfis:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/profiles - Atualizar perfil do usuário logado
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, telefone, cargo_id, departamento_id } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (nome !== undefined) updates.nome = nome;
    if (telefone !== undefined) updates.telefone = telefone;
    if (cargo_id !== undefined) updates.cargo_id = cargo_id || null;
    if (departamento_id !== undefined) updates.departamento_id = departamento_id || null;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          ...updates,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar perfil", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API de perfis (PUT):", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
