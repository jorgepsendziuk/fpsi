import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revisaoVencida } from "@/lib/fornecedores/fornecedorCiclo";

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
  return { supabase } as const;
}

/** GET mapa operacional: fornecedor + sistemas, mapeamentos e riscos vinculados. */
export async function GET(
  _request: NextRequest,
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

    const [fornRes, sisRes, mapRes, riscoRes] = await Promise.all([
      supabase.from("programa_fornecedor").select("*").eq("programa_id", programaId).order("nome"),
      supabase.from("programa_sistema").select("id, nome, fornecedor_id").eq("programa_id", programaId).eq("ativo", true),
      supabase.from("mapeamento_dados").select("id, nome, fornecedor_id").eq("programa_id", programaId),
      supabase.from("programa_risco").select("id, titulo, nome, fornecedor_id, score_residual").eq("programa_id", programaId),
    ]);
    if (fornRes.error) throw fornRes.error;

    const sistemas = (sisRes.data || []) as Array<{ id: number; nome: string; fornecedor_id: number | null }>;
    const mapeamentos = (mapRes.data || []) as Array<{ id: number; nome: string; fornecedor_id?: number | null }>;
    const riscos = (riscoRes.data || []) as Array<{
      id: number;
      titulo?: string;
      nome?: string;
      fornecedor_id?: number | null;
    }>;

    const items = (fornRes.data || []).map((f: { id: number; data_proxima_revisao?: string | null }) => {
      const fid = f.id;
      return {
        ...f,
        revisao_vencida: revisaoVencida(f.data_proxima_revisao ?? null),
        sistemas: sistemas.filter((s) => s.fornecedor_id === fid),
        mapeamentos: mapeamentos.filter((m) => m.fornecedor_id === fid),
        riscos: riscos.filter((r) => r.fornecedor_id === fid),
      };
    });

    return NextResponse.json({ fornecedores: items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
