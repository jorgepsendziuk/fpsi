import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

async function getSupabaseClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return await createSupabaseServerClient();
}

// GET /api/cargos - Listar cargos
export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("cargo")
      .select("id, nome, ativo")
      .eq("ativo", true)
      .order("nome");

    if (error) {
      console.error("Erro ao buscar cargos:", error);
      return NextResponse.json(
        { error: "Erro ao buscar cargos", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Erro na API de cargos:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/cargos - Criar cargo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome } = body;
    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("cargo")
      .insert({ nome: nome.trim(), ativo: true })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Cargo já existe" }, { status: 409 });
      }
      console.error("Erro ao criar cargo:", error);
      return NextResponse.json(
        { error: "Erro ao criar cargo", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API de cargos (POST):", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
