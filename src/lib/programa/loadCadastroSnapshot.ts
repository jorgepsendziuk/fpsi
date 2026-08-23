import type { SupabaseClient } from "@supabase/supabase-js";
import type { CadastroSnapshot } from "@/lib/politicas/politicaSugestoes";

type AnyClient = Pick<SupabaseClient, "from">;

async function nomes(client: AnyClient, table: string, programaId: number): Promise<string[]> {
  try {
    const { data } = await client
      .from(table)
      .select("nome")
      .eq("programa_id", programaId)
      .eq("ativo", true)
      .order("nome");
    return (data || []).map((r: { nome?: string }) => String(r.nome || "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

async function rowsOf(q: unknown): Promise<Record<string, unknown>[]> {
  try {
    const res = (await q) as { data?: Record<string, unknown>[] | null };
    return res.data || [];
  } catch {
    return [];
  }
}

export async function loadCadastroSnapshot(
  client: AnyClient,
  programaId: number
): Promise<CadastroSnapshot> {
  const { data: prog } = await client
    .from("programa")
    .select("nome, slug, encarregado_dados_pessoais")
    .eq("id", programaId)
    .maybeSingle();

  const p = (prog || {}) as Record<string, unknown>;
  const orgao = String(p.nome || "Organização").trim();
  let dpoNome: string | undefined;
  let dpoEmail: string | undefined;
  const encId = Number(p.encarregado_dados_pessoais);
  if (Number.isFinite(encId) && encId > 0) {
    const { data: resp } = await client
      .from("responsavel")
      .select("nome, email")
      .eq("id", encId)
      .maybeSingle();
    dpoNome = resp?.nome ? String(resp.nome).trim() : undefined;
    dpoEmail = resp?.email ? String(resp.email).trim() : undefined;
  }
  const slug = String(p.slug || "").trim();
  const canal = slug ? `/${slug}` : undefined;

  const [unidades, processos, sistemas, fornRes, mapRes, riscoRes] = await Promise.all([
    nomes(client, "programa_unidade", programaId),
    nomes(client, "programa_processo", programaId),
    nomes(client, "programa_sistema", programaId),
    rowsOf(
      client
        .from("programa_fornecedor")
        .select("nome, tipo, possui_clausulas_lgpd")
        .eq("programa_id", programaId)
        .eq("ativo", true)
    ),
    rowsOf(
      client
        .from("mapeamento_dados")
        .select(
          "nome, finalidade_categoria, finalidade_detalhe, tipos_dados, fluxo_compartilhamento, transferencia_internacional"
        )
        .eq("programa_id", programaId)
    ).then(async (rows) => {
      if (rows.length) return rows;
      return rowsOf(
        client.from("ropa").select("nome, finalidade, base_legal, categorias_dados, compartilhamento").eq("programa_id", programaId)
      );
    }),
    rowsOf(
      client
        .from("programa_risco")
        .select("titulo, nome, score_residual, status")
        .eq("programa_id", programaId)
        .in("status", ["identificado", "em_tratamento"])
    ),
  ]);

  const riscosAltos = (riscoRes as Array<Record<string, unknown>>)
    .filter((r) => Number(r.score_residual) >= 12)
    .map((r) => String(r.titulo || r.nome || "").trim())
    .filter(Boolean);

  return {
    orgao,
    dpoNome,
    dpoEmail,
    canalTitular: canal,
    unidades,
    processos,
    sistemas,
    fornecedores: (fornRes as Array<Record<string, unknown>>).map((f) => ({
      nome: String(f.nome || ""),
      tipo: String(f.tipo || ""),
      clausulas: Boolean(f.possui_clausulas_lgpd),
    })),
    mapeamentos: (mapRes as Array<Record<string, unknown>>).map((m) => ({
      nome: String(m.nome || "Operação"),
      finalidade:
        (m.finalidade as string) ||
        [m.finalidade_categoria, m.finalidade_detalhe].filter(Boolean).join(" — ") ||
        null,
      baseLegal: (m.base_legal as string) || null,
      categorias: Array.isArray(m.tipos_dados)
        ? (m.tipos_dados as string[]).join(", ")
        : ((m.categorias_dados as string) || null),
      compartilhamento: (m.fluxo_compartilhamento as string) || (m.compartilhamento as string) || null,
      transferencia: (m.transferencia_internacional as string) || null,
    })),
    riscosAltos,
  };
}
