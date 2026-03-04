import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";

const TIPOS_PAPEL = ["controlador", "contratante", "operador"] as const;

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
 * POST /api/programas/[id]/papel-lgpd/instituicao
 * Cria nova instituição no papel LGPD.
 * Body: { tipo_papel, nome, descricao?, contato?, email?, site?, ordem? }
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

    const body = await request.json().catch(() => ({}));
    const { tipo_papel, nome, descricao, contato, email, site, ordem } = body;

    if (!tipo_papel || !TIPOS_PAPEL.includes(tipo_papel)) {
      return NextResponse.json({ error: "tipo_papel inválido (controlador, contratante, operador)" }, { status: 400 });
    }
    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const member = await isProgramaMember(supabase, programaId, user.id);
    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const { data: inserted, error } = await supabase
      .from("programa_papel_lgpd_instituicao")
      .insert({
        programa_id: programaId,
        tipo_papel,
        nome: String(nome).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        contato: contato ? String(contato).trim() : null,
        email: email ? String(email).trim() : null,
        site: site ? String(site).trim() : null,
        ordem: typeof ordem === "number" ? ordem : 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar instituição:", error);
      return NextResponse.json(
        { error: "Erro ao criar instituição", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "create",
      resourceType: "papel_lgpd_instituicao",
      resourceId: inserted.id,
      programaId,
      details: { tipo_papel, nome: inserted.nome },
      req: { headers: request.headers },
    });

    return NextResponse.json(inserted);
  } catch (error) {
    console.error("Erro POST instituição:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
