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

  let list = areas || [];

  // Scoped: só suas áreas
  if (auth.access.mode === "scoped") {
    const allowed = new Set(auth.access.areaIds);
    list = list.filter((a) => allowed.has(a.id));
  } else if (auth.access.mode === "minimal") {
    return NextResponse.json([]);
  }

  const areaIds = list.map((a) => a.id as number);
  if (areaIds.length === 0) return NextResponse.json([]);

  const { data: links } = await auth.supabase
    .from("programa_user_areas")
    .select("area_id, user_id")
    .eq("programa_id", programaId)
    .in("area_id", areaIds);

  const userIds = Array.from(new Set((links || []).map((l) => String(l.user_id))));
  let profileByUserId: Record<string, { nome?: string | null; email?: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await auth.supabase
      .from("profiles")
      .select("user_id, nome, email")
      .in("user_id", userIds);
    profileByUserId = (profiles || []).reduce(
      (acc, p) => {
        acc[p.user_id] = { nome: p.nome, email: p.email };
        return acc;
      },
      {} as Record<string, { nome?: string | null; email?: string | null }>
    );
  }

  const membersByArea = new Map<number, { user_id: string; nome: string | null; email: string | null }[]>();
  for (const link of links || []) {
    const aid = link.area_id as number;
    const uid = String(link.user_id);
    const profile = profileByUserId[uid];
    const row = {
      user_id: uid,
      nome: profile?.nome ?? null,
      email: profile?.email ?? null,
    };
    const arr = membersByArea.get(aid) || [];
    arr.push(row);
    membersByArea.set(aid, arr);
  }

  return NextResponse.json(
    list.map((a) => ({
      ...a,
      users: membersByArea.get(a.id as number) || [],
    }))
  );
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

  if (Array.isArray(body.user_ids)) {
    const userIds: string[] = Array.from(
      new Set(
        (body.user_ids as unknown[])
          .map((id) => String(id))
          .filter((id) => id.length > 0)
      )
    );
    if (userIds.length > 0) {
      await auth.supabase.from("programa_user_areas").insert(
        userIds.map((user_id: string) => ({
          programa_id: programaId,
          user_id,
          area_id: area.id,
        }))
      );

      let controleIds = [...controle_ids];
      if (controleIds.length === 0 && diagnostico_ids.length > 0) {
        const { data: controles } = await auth.supabase
          .from("controle")
          .select("id")
          .in("diagnostico", diagnostico_ids);
        controleIds = (controles || []).map((c: { id: number }) => c.id as number);
      }
      const scope = { diagnostico_ids, controle_ids: controleIds };
      await auth.supabase.from("questionario_assignment").insert(
        userIds.map((user_id: string) => ({
          programa_id: programaId,
          assignee_user_id: user_id,
          area_id: area.id,
          scope,
          status: "pending",
        }))
      );
    }
  }

  const { data: full } = await auth.supabase
    .from("programa_area")
    .select("*, programa_area_escopo(*)")
    .eq("id", area.id)
    .single();

  return NextResponse.json(full || area, { status: 201 });
}
