import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * Verifica se o usuário tem acesso à empresa: está em algum programa que usa essa empresa OU criou a empresa (created_by_user_id).
 */
async function userCanAccessEmpresa(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, empresaId: number, userId: string): Promise<boolean> {
  const { data: empresa } = await supabase.from("empresa").select("created_by_user_id").eq("id", empresaId).maybeSingle();
  if (empresa?.created_by_user_id === userId) return true;
  const { data: programaUsers } = await supabase
    .from("programa_users")
    .select("programa_id")
    .eq("user_id", userId)
    .eq("status", "accepted");
  const programaIds = (programaUsers || []).map((r: { programa_id: number }) => r.programa_id);
  if (programaIds.length === 0) return false;
  const { data: programas } = await supabase
    .from("programa")
    .select("id")
    .in("id", programaIds)
    .eq("empresa_id", empresaId)
    .limit(1);
  return (programas?.length ?? 0) > 0;
}

/**
 * PUT /api/empresas/[id]
 * Atualiza uma empresa. Apenas se o usuário tem acesso (programa vinculado).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const empresaId = parseInt(id, 10);
    if (isNaN(empresaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const canAccess = await userCanAccessEmpresa(supabase, empresaId, user.id);
    if (!canAccess) {
      return NextResponse.json({ error: "Empresa não encontrada ou sem permissão" }, { status: 404 });
    }
    const body = await request.json();
    const cnpj = body.cnpj != null ? String(body.cnpj).replace(/\D/g, "") : undefined;
    const update: Record<string, unknown> = {};
    if (body.razao_social !== undefined) update.razao_social = body.razao_social?.trim() || null;
    if (body.nome_fantasia !== undefined) update.nome_fantasia = body.nome_fantasia?.trim() || null;
    if (body.endereco !== undefined) update.endereco = body.endereco?.trim() || null;
    if (body.atividade_principal !== undefined) update.atividade_principal = body.atividade_principal?.trim() || null;
    if (body.gestor_responsavel !== undefined) update.gestor_responsavel = body.gestor_responsavel?.trim() || null;
    if (body.email !== undefined) update.email = body.email?.trim() || null;
    if (body.telefone !== undefined) update.telefone = body.telefone?.trim() || null;
    if (cnpj !== undefined) update.cnpj = cnpj.length >= 14 ? parseInt(cnpj.slice(0, 14), 10) || null : null;

    const { data, error } = await supabase.from("empresa").update(update).eq("id", empresaId).select("*").single();
    if (error) {
      console.error("Erro ao atualizar empresa:", error);
      return NextResponse.json({ error: "Erro ao atualizar empresa", details: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("PUT /api/empresas/[id]:", e);
    return NextResponse.json(
      { error: "Erro interno", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/empresas/[id]
 * Exclui uma empresa. Apenas se o usuário tem acesso e nenhum programa está vinculado.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const empresaId = parseInt(id, 10);
    if (isNaN(empresaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const canAccess = await userCanAccessEmpresa(supabase, empresaId, user.id);
    if (!canAccess) {
      return NextResponse.json({ error: "Empresa não encontrada ou sem permissão" }, { status: 404 });
    }
    const { data: programas, error: progError } = await supabase
      .from("programa")
      .select("id")
      .eq("empresa_id", empresaId)
      .limit(1);
    if (progError) {
      return NextResponse.json({ error: "Erro ao verificar programas", details: progError.message }, { status: 500 });
    }
    if ((programas?.length ?? 0) > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir: há programa(s) vinculado(s) a esta empresa. Desvincule ou exclua os programas primeiro." },
        { status: 400 }
      );
    }
    const { error: delError } = await supabase.from("empresa").delete().eq("id", empresaId);
    if (delError) {
      console.error("Erro ao excluir empresa:", delError);
      return NextResponse.json({ error: "Erro ao excluir empresa", details: delError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/empresas/[id]:", e);
    return NextResponse.json(
      { error: "Erro interno", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
