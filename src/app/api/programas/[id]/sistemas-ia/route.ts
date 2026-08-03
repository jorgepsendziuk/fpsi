import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

async function assertProgramaMember(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  programaId: number,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return !!data;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(String(id || "").trim(), 10);
    if (isNaN(programaId) || programaId <= 0) {
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

    const ok = await assertProgramaMember(supabase, programaId, user.id);
    if (!ok) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("sistema_ia")
      .select("*")
      .eq("programa_id", programaId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (e) {
    console.error("sistemas-ia GET", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(String(id || "").trim(), 10);
    if (isNaN(programaId) || programaId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ok = await assertProgramaMember(supabase, programaId, user.id);
    if (!ok) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const row = {
      programa_id: programaId,
      nome: String(body.nome ?? "").trim(),
      finalidade: String(body.finalidade ?? "").trim(),
      dono_negocio: String(body.dono_negocio ?? "").trim(),
      responsavel_tecnico_id:
        typeof body.responsavel_tecnico_id === "number" && body.responsavel_tecnico_id > 0
          ? body.responsavel_tecnico_id
          : null,
      tipo: body.tipo ?? "saas",
      nivel_risco: body.nivel_risco ?? "moderado",
      status_ciclo: body.status_ciclo ?? "rascunho",
      decisao_automatizada: Boolean(body.decisao_automatizada),
      ia_embutida: Boolean(body.ia_embutida),
      observacoes: String(body.observacoes ?? "").trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("sistema_ia").insert(row).select("*").single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (e) {
    console.error("sistemas-ia POST", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
