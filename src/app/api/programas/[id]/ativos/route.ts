import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type Entidade = "unidades" | "processos" | "sistemas" | "fornecedores";

const TABLE: Record<Entidade, string> = {
  unidades: "programa_unidade",
  processos: "programa_processo",
  sistemas: "programa_sistema",
  fornecedores: "programa_fornecedor",
};

async function requireMember(programaId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) } as const;
  }
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) } as const;
  }
  return { supabase, user } as const;
}

function parseEntidade(raw: string | null): Entidade | null {
  if (raw === "unidades" || raw === "processos" || raw === "sistemas" || raw === "fornecedores") {
    return raw;
  }
  return null;
}

/** GET /api/programas/[id]/ativos?tipo=unidades|processos|sistemas|fornecedores */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;

    const tipo = parseEntidade(request.nextUrl.searchParams.get("tipo"));
    if (!tipo) {
      const [unidades, processos, sistemas, fornecedores] = await Promise.all([
        supabase.from("programa_unidade").select("*").eq("programa_id", programaId).eq("ativo", true).order("nome"),
        supabase.from("programa_processo").select("*").eq("programa_id", programaId).eq("ativo", true).order("nome"),
        supabase.from("programa_sistema").select("*").eq("programa_id", programaId).eq("ativo", true).order("nome"),
        supabase.from("programa_fornecedor").select("*").eq("programa_id", programaId).eq("ativo", true).order("nome"),
      ]);
      return NextResponse.json({
        unidades: unidades.data || [],
        processos: processos.data || [],
        sistemas: sistemas.data || [],
        fornecedores: fornecedores.data || [],
      });
    }

    const { data, error } = await supabase
      .from(TABLE[tipo])
      .select("*")
      .eq("programa_id", programaId)
      .eq("ativo", true)
      .order("nome");
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

/** POST body: { tipo, ...campos } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;

    const body = await request.json();
    const tipo = parseEntidade(body.tipo);
    if (!tipo) {
      return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
    }
    const nome = String(body.nome || "").trim();
    if (!nome) {
      return NextResponse.json({ error: "nome obrigatório" }, { status: 400 });
    }

    const base: Record<string, unknown> = {
      programa_id: programaId,
      nome,
      ativo: true,
    };

    if (tipo === "unidades") {
      if (body.parent_id) base.parent_id = body.parent_id;
      if (body.codigo) base.codigo = body.codigo;
    } else if (tipo === "processos") {
      if (body.unidade_id) base.unidade_id = body.unidade_id;
      if (body.descricao) base.descricao = body.descricao;
      if (body.dono) base.dono = body.dono;
    } else if (tipo === "sistemas") {
      if (body.processo_id) base.processo_id = body.processo_id;
      if (body.fornecedor_id) base.fornecedor_id = body.fornecedor_id;
      if (body.descricao) base.descricao = body.descricao;
      if (body.tipo_sistema) base.tipo = body.tipo_sistema;
      if (body.critico != null) base.critico = Boolean(body.critico);
    } else if (tipo === "fornecedores") {
      if (body.cnpj) base.cnpj = body.cnpj;
      if (body.tipo_fornecedor) base.tipo = body.tipo_fornecedor;
      if (body.contato) base.contato = body.contato;
      if (body.avaliacao_status) base.avaliacao_status = body.avaliacao_status;
      if (body.observacoes) base.observacoes = body.observacoes;
      if (body.criticidade) base.criticidade = body.criticidade;
      if (body.data_ultima_avaliacao !== undefined) base.data_ultima_avaliacao = body.data_ultima_avaliacao;
      if (body.data_proxima_revisao !== undefined) base.data_proxima_revisao = body.data_proxima_revisao;
      if (body.possui_clausulas_lgpd != null) base.possui_clausulas_lgpd = Boolean(body.possui_clausulas_lgpd);
      if (body.encerrado_em !== undefined) base.encerrado_em = body.encerrado_em;
      if (body.due_diligence !== undefined) base.due_diligence = body.due_diligence;
    }

    const { data, error } = await supabase
      .from(TABLE[tipo])
      .insert(base)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

/** PATCH body: { tipo, id, ... } soft-delete via ativo:false */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;

    const body = await request.json();
    const tipo = parseEntidade(body.tipo);
    const itemId = Number(body.id);
    if (!tipo || Number.isNaN(itemId)) {
      return NextResponse.json({ error: "tipo/id inválidos" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of [
      "nome",
      "codigo",
      "descricao",
      "dono",
      "parent_id",
      "unidade_id",
      "processo_id",
      "fornecedor_id",
      "critico",
      "ativo",
      "cnpj",
      "contato",
      "avaliacao_status",
      "observacoes",
      "criticidade",
      "data_ultima_avaliacao",
      "data_proxima_revisao",
      "possui_clausulas_lgpd",
      "encerrado_em",
      "due_diligence",
    ]) {
      if (body[k] !== undefined) patch[k] = body[k];
    }
    if (body.tipo_sistema !== undefined) patch.tipo = body.tipo_sistema;
    if (body.tipo_fornecedor !== undefined) patch.tipo = body.tipo_fornecedor;

    const { data, error } = await supabase
      .from(TABLE[tipo])
      .update(patch)
      .eq("programa_id", programaId)
      .eq("id", itemId)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
