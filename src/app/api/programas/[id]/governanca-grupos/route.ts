import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const TIPOS = ["comite_seguranca_informacao", "comite_protecao_dados", "etir"] as const;
type TipoGrupo = (typeof TIPOS)[number];

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

/** GET — membros por tipo (ids de responsavel). */
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

    const { data: grupos, error: gErr } = await supabase
      .from("programa_grupo_governanca")
      .select("id, tipo")
      .eq("programa_id", programaId);

    if (gErr) {
      return NextResponse.json({ error: gErr.message }, { status: 500 });
    }

    const out: Record<TipoGrupo, number[]> = {
      comite_seguranca_informacao: [],
      comite_protecao_dados: [],
      etir: [],
    };

    const grupoIds = (grupos || []) as { id: number; tipo: string }[];
    if (grupoIds.length === 0) {
      return NextResponse.json(out);
    }

    const { data: membros, error: mErr } = await supabase
      .from("programa_grupo_governanca_membro")
      .select("grupo_id, responsavel_id, sort_order")
      .in(
        "grupo_id",
        grupoIds.map((g) => g.id)
      )
      .order("sort_order", { ascending: true });

    if (mErr) {
      return NextResponse.json({ error: mErr.message }, { status: 500 });
    }

    const tipoByGrupo = new Map<number, TipoGrupo>();
    for (const g of grupoIds) {
      if (TIPOS.includes(g.tipo as TipoGrupo)) {
        tipoByGrupo.set(g.id, g.tipo as TipoGrupo);
      }
    }

    for (const row of membros || []) {
      const tipo = tipoByGrupo.get(row.grupo_id as number);
      if (!tipo) continue;
      out[tipo].push(row.responsavel_id as number);
    }

    return NextResponse.json(out);
  } catch (e) {
    console.error("governanca-grupos GET", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/** PUT — substitui membros de cada tipo (lista de ids responsavel do mesmo programa). */
export async function PUT(
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
    const membros = body?.membros as Record<string, number[]> | undefined;
    if (!membros || typeof membros !== "object") {
      return NextResponse.json({ error: "Corpo inválido: esperado { membros: { tipo: number[] } }" }, { status: 400 });
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

    for (const tipo of TIPOS) {
      const ids = Array.isArray(membros[tipo]) ? membros[tipo].map((n) => parseInt(String(n), 10)).filter((n) => n > 0) : [];
      const unique = Array.from(new Set(ids));

      const { data: respRows } = await supabase
        .from("responsavel")
        .select("id")
        .eq("programa", programaId)
        .in("id", unique.length ? unique : [-1]);

      const valid = new Set((respRows || []).map((r: { id: number }) => r.id));
      const filtered = unique.filter((x) => valid.has(x));

      let grupoId: number | null = null;
      const { data: existing } = await supabase
        .from("programa_grupo_governanca")
        .select("id")
        .eq("programa_id", programaId)
        .eq("tipo", tipo)
        .maybeSingle();

      if (existing?.id) {
        grupoId = existing.id as number;
      } else {
        const { data: ins, error: insErr } = await supabase
          .from("programa_grupo_governanca")
          .insert({ programa_id: programaId, tipo })
          .select("id")
          .single();
        if (insErr || !ins) {
          return NextResponse.json({ error: insErr?.message || "Falha ao criar grupo" }, { status: 500 });
        }
        grupoId = ins.id as number;
      }

      await supabase.from("programa_grupo_governanca_membro").delete().eq("grupo_id", grupoId);

      if (filtered.length > 0) {
        const rows = filtered.map((responsavel_id, sort_order) => ({
          grupo_id: grupoId,
          responsavel_id,
          sort_order,
        }));
        const { error: insM } = await supabase.from("programa_grupo_governanca_membro").insert(rows);
        if (insM) {
          return NextResponse.json({ error: insM.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("governanca-grupos PUT", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
