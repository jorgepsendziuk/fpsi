import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import { AREA_SEEDS } from "@/lib/questionarios/areaQuestionarioScope";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;

  const { data: areas, error } = await auth.supabase
    .from("programa_area")
    .select("*, programa_area_escopo(*)")
    .eq("programa_id", programaId)
    .order("nome");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Scoped: só suas áreas
  if (auth.access.mode === "scoped") {
    const allowed = new Set(auth.access.areaIds);
    return NextResponse.json((areas || []).filter((a) => allowed.has(a.id)));
  }
  if (auth.access.mode === "minimal") {
    return NextResponse.json([]);
  }

  return NextResponse.json(areas || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  const body = await request.json();

  // Seed em lote
  if (body.seed === true) {
    const created = [];
    for (const seed of AREA_SEEDS) {
      const { data: existing } = await auth.supabase
        .from("programa_area")
        .select("id")
        .eq("programa_id", programaId)
        .eq("slug", seed.slug)
        .maybeSingle();
      if (existing) continue;

      const { data: area, error } = await auth.supabase
        .from("programa_area")
        .insert({
          programa_id: programaId,
          nome: seed.nome,
          slug: seed.slug,
          descricao: seed.descricao,
          ativo: true,
        })
        .select()
        .single();
      if (error || !area) continue;

      await auth.supabase.from("programa_area_escopo").insert({
        area_id: area.id,
        diagnostico_ids: seed.diagnostico_ids,
        controle_ids: [],
        modulos: seed.modulos,
        kpi_keys: [],
      });
      created.push(area);
    }
    return NextResponse.json({ created });
  }

  const nome = String(body.nome || "").trim();
  const slug = String(body.slug || nome)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!nome || !slug) {
    return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 });
  }

  const { data: area, error } = await auth.supabase
    .from("programa_area")
    .insert({
      programa_id: programaId,
      nome,
      slug,
      descricao: body.descricao ? String(body.descricao) : null,
      ativo: body.ativo !== false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Já existe área com este slug" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const diagnostico_ids = Array.isArray(body.diagnostico_ids)
    ? body.diagnostico_ids.map(Number).filter(Number.isFinite)
    : [];
  const controle_ids = Array.isArray(body.controle_ids)
    ? body.controle_ids.map(Number).filter(Number.isFinite)
    : [];
  const modulos = Array.isArray(body.modulos) ? body.modulos.map(String) : ["questionario", "kpis"];

  await auth.supabase.from("programa_area_escopo").insert({
    area_id: area.id,
    diagnostico_ids,
    controle_ids,
    modulos,
    kpi_keys: Array.isArray(body.kpi_keys) ? body.kpi_keys.map(String) : [],
  });

  const { data: full } = await auth.supabase
    .from("programa_area")
    .select("*, programa_area_escopo(*)")
    .eq("id", area.id)
    .single();

  return NextResponse.json(full || area, { status: 201 });
}
