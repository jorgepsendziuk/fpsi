import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/** Garante usuário autenticado e retorna supabase + user. */
async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { supabase: null, user: null, error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }
  return { supabase, user, error: null };
}

/**
 * POST /api/empresas
 * Cria uma nova empresa. Apenas usuário autenticado.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error: authErr } = await requireAuth();
  if (authErr) return authErr;
  try {
    const body = await request.json();
    const cnpj = body.cnpj != null ? String(body.cnpj).replace(/\D/g, "") : "";
    const insert: Record<string, unknown> = {
      cnpj: cnpj.length >= 14 ? parseInt(cnpj.slice(0, 14), 10) || null : null,
      razao_social: body.razao_social?.trim() || null,
      nome_fantasia: body.nome_fantasia?.trim() || null,
      endereco: body.endereco?.trim() || null,
      atividade_principal: body.atividade_principal?.trim() || null,
      gestor_responsavel: body.gestor_responsavel?.trim() || null,
      email: body.email?.trim() || null,
      telefone: body.telefone?.trim() || null,
      created_by_user_id: user!.id,
    };
    const { data, error } = await supabase!.from("empresa").insert(insert).select("*").single();
    if (error) {
      console.error("Erro ao criar empresa:", error);
      return NextResponse.json({ error: "Erro ao criar empresa", details: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("POST /api/empresas:", e);
    return NextResponse.json(
      { error: "Erro interno", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/empresas
 * Retorna empresas vinculadas a programas em que o usuário está (programa_users, accepted).
 * Usado para escolher "empresa existente" ao criar novo programa.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { data: programaUsers, error: puError } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (puError) {
      console.error("Erro ao buscar programa_users:", puError);
      return NextResponse.json(
        { error: "Erro ao buscar empresas", details: puError.message },
        { status: 500 }
      );
    }

    const programaIds = (programaUsers || []).map((r: { programa_id: number }) => r.programa_id);
    let empresaIdsFromProgramas: number[] = [];
    if (programaIds.length > 0) {
      const { data: programas, error: progError } = await supabase
        .from("programa")
        .select("empresa_id")
        .in("id", programaIds)
        .not("empresa_id", "is", null);

      if (progError) {
        console.error("Erro ao buscar programas:", progError);
        return NextResponse.json(
          { error: "Erro ao buscar empresas", details: progError.message },
          { status: 500 }
        );
      }
      empresaIdsFromProgramas = Array.from(new Set((programas || []).map((p: { empresa_id: number }) => p.empresa_id).filter(Boolean)));
    }

    // Empresas: vinculadas a programas do usuário OU criadas por ele (created_by_user_id)
    const allIds = new Set<number>();
    if (empresaIdsFromProgramas.length > 0) {
      const { data: linked } = await supabase.from("empresa").select("id").in("id", empresaIdsFromProgramas);
      (linked || []).forEach((r: { id: number }) => allIds.add(r.id));
    }
    const { data: created } = await supabase.from("empresa").select("id").eq("created_by_user_id", user.id);
    (created || []).forEach((r: { id: number }) => allIds.add(r.id));
    if (allIds.size === 0) {
      return NextResponse.json([]);
    }

    const { data: empresas, error: empError } = await supabase
      .from("empresa")
      .select("*")
      .in("id", Array.from(allIds))
      .order("razao_social", { ascending: true, nullsFirst: false });

    if (empError) {
      console.error("Erro ao buscar empresa:", empError);
      return NextResponse.json(
        { error: "Erro ao buscar empresas", details: empError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(empresas || []);
  } catch (error) {
    console.error("Erro na API de empresas (GET):", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
