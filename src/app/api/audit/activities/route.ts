import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

type ActivityRow = {
  id: number;
  user_id: string | null;
  programa_id: number | null;
  action: string;
  resource_type: string | null;
  resource_id: number | null;
  details: unknown;
  ip_address: string | null;
  user_agent: string | null;
  origem: string | null;
  created_at: string;
  user_label?: string | null;
  /** Texto legível (ex.: código PPSI + título da medida) — preenchido no servidor quando possível */
  resource_hint?: string | null;
};

function fallbackUserLabel(userId: string | null): string | null {
  if (!userId) return null;
  return `Usuário ${userId.replace(/-/g, "").slice(0, 8)}…`;
}

async function enrichUserLabels(rows: ActivityRow[], admin: SupabaseClient | null): Promise<ActivityRow[]> {
  const ids = Array.from(
    new Set(rows.map((r) => r.user_id).filter((x): x is string => Boolean(x)))
  );
  const map = new Map<string, string>();
  if (ids.length > 0 && admin) {
    const { data, error } = await admin.from("profiles").select("user_id, nome, email").in("user_id", ids);
    if (!error && data) {
      for (const p of data) {
        const id = String(p.user_id);
        const nome = p.nome?.trim();
        const email = p.email?.trim();
        const label = nome ? (email ? `${nome} (${email})` : nome) : email || fallbackUserLabel(id)!;
        map.set(id, label);
      }
    }
  }
  return rows.map((r) => {
    if (!r.user_id) {
      return { ...r, user_label: null };
    }
    return {
      ...r,
      user_label: map.get(r.user_id) ?? fallbackUserLabel(r.user_id),
    };
  });
}

function truncateStr(s: string, n: number): string {
  const t = s.trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

/** Interpreta `details` gravados pelo client (ex.: após update de medida). */
function hintFromMedidaDetails(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const o = details as Record<string, unknown>;
  const idM = o.id_medida;
  const tit =
    typeof o.titulo_curto === "string"
      ? o.titulo_curto
      : typeof o.titulo === "string"
        ? o.titulo
        : null;
  if (typeof idM === "string" && tit?.trim()) return `${idM} · ${truncateStr(tit, 100)}`;
  if (typeof idM === "string") return idM;
  if (tit?.trim()) return truncateStr(tit, 120);
  return null;
}

/**
 * Resolve IDs técnicos (ex.: programa_medida.id) para texto útil no catálogo PPSI.
 */
async function enrichResourceHints(
  rows: ActivityRow[],
  programaId: number | null,
  admin: SupabaseClient | null
): Promise<ActivityRow[]> {
  if (rows.length === 0) return rows;

  const medidaPmIds = Array.from(
    new Set(
      rows
        .filter((r) => r.resource_type === "medida" && r.resource_id != null)
        .map((r) => r.resource_id as number)
    )
  );

  const medidaHintByPmId = new Map<number, string>();
  if (medidaPmIds.length > 0 && programaId != null && admin) {
    const { data: pms } = await admin
      .from("programa_medida")
      .select("id, medida")
      .eq("programa", programaId)
      .in("id", medidaPmIds);
    const pmList = pms ?? [];
    const medIds = Array.from(new Set(pmList.map((p: { medida: number }) => p.medida)));
    const medMap = new Map<number, { id_medida: string | null; titulo: string | null }>();
    if (medIds.length > 0) {
      const { data: meds } = await admin.from("medida").select("id, id_medida, medida").in("id", medIds);
      for (const m of meds ?? []) {
        medMap.set(m.id, {
          id_medida: m.id_medida,
          titulo: m.medida != null ? String(m.medida) : null,
        });
      }
    }
    for (const pm of pmList) {
      const m = medMap.get(pm.medida);
      if (m?.id_medida && m.titulo?.trim()) {
        medidaHintByPmId.set(pm.id, `${m.id_medida} · ${truncateStr(m.titulo, 100)}`);
      } else if (m?.id_medida) {
        medidaHintByPmId.set(pm.id, m.id_medida);
      } else if (m?.titulo?.trim()) {
        medidaHintByPmId.set(pm.id, truncateStr(m.titulo, 120));
      }
    }
  }

  const controlePcIds = Array.from(
    new Set(
      rows
        .filter((r) => r.resource_type === "controle" && r.resource_id != null)
        .map((r) => r.resource_id as number)
    )
  );
  const controleHintByPcId = new Map<number, string>();
  if (controlePcIds.length > 0 && programaId != null && admin) {
    const { data: pcs } = await admin
      .from("programa_controle")
      .select("id, controle")
      .eq("programa", programaId)
      .in("id", controlePcIds);
    const pcList = pcs ?? [];
    const cIds = Array.from(new Set(pcList.map((p: { controle: number }) => p.controle)));
    const cMap = new Map<number, { numero: number | null; nome: string | null }>();
    if (cIds.length > 0) {
      const { data: ctrs } = await admin.from("controle").select("id, numero, nome").in("id", cIds);
      for (const c of ctrs ?? []) {
        cMap.set(c.id, {
          numero: c.numero,
          nome: c.nome != null ? String(c.nome) : null,
        });
      }
    }
    for (const pc of pcList) {
      const c = cMap.get(pc.controle);
      if (c?.nome?.trim()) {
        const num = c.numero != null ? `${c.numero}. ` : "";
        controleHintByPcId.set(pc.id, `${num}${truncateStr(c.nome, 100)}`);
      }
    }
  }

  return rows.map((r) => {
    let hint: string | null = null;
    if (r.resource_type === "medida") {
      hint = hintFromMedidaDetails(r.details);
      if (!hint && r.resource_id != null) {
        hint = medidaHintByPmId.get(r.resource_id) ?? null;
      }
    } else if (r.resource_type === "controle" && r.resource_id != null) {
      const d = r.details as Record<string, unknown> | undefined;
      const nivel = d && typeof d.nivel === "number" ? d.nivel : null;
      const name = controleHintByPcId.get(r.resource_id);
      if (name && nivel != null) hint = `${name} · nível INCC ${nivel}`;
      else if (name) hint = name;
      else if (nivel != null) hint = `Controle · nível INCC ${nivel}`;
    }
    return { ...r, resource_hint: hint };
  });
}

/**
 * GET /api/audit/activities
 * Lista atividades com paginação e total. Resposta: { data, total }.
 * Filtros: programa_id, user_id (ou __portal__ para user_id nulo), action, resource_type, desde, ate.
 * Ordenação: sort=created_at|user_id|action|resource_type|origem|resource_id, order=asc|desc
 * (resource_type usa desempate por resource_id na mesma direção)
 */
const SORT_COLUMNS = new Set([
  "created_at",
  "user_id",
  "action",
  "resource_type",
  "origem",
  "resource_id",
]);

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programaIdRaw = searchParams.get("programa_id");
    const userIdFilter = searchParams.get("user_id");
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resource_type");
    const desde = searchParams.get("desde");
    const ate = searchParams.get("ate");
    const orderAsc = searchParams.get("order") === "asc";
    const sortRaw = (searchParams.get("sort") || "created_at").trim();
    const sortColumn = SORT_COLUMNS.has(sortRaw) ? sortRaw : "created_at";
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10) || 25), 100);

    let progId: number | null = null;
    if (programaIdRaw) {
      progId = parseInt(programaIdRaw, 10);
      if (Number.isNaN(progId)) {
        return NextResponse.json({ error: "programa_id inválido" }, { status: 400 });
      }
      const { data: member } = await supabase
        .from("programa_users")
        .select("programa_id")
        .eq("programa_id", progId)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();
      if (!member) {
        return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
      }
    }

    const selectCols = `
        id,
        user_id,
        programa_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        origem,
        created_at
      `;

    const applyFilters = (q: any) => {
      let x = q;
      if (progId != null) x = x.eq("programa_id", progId);
      if (userIdFilter === "__portal__") {
        x = x.is("user_id", null);
      } else if (userIdFilter) {
        x = x.eq("user_id", userIdFilter);
      }
      if (action) x = x.eq("action", action);
      if (resourceType) x = x.eq("resource_type", resourceType);
      if (desde) x = x.gte("created_at", desde);
      if (ate) x = x.lte("created_at", ate);
      return x;
    };

    let countQ = applyFilters(
      supabase.from("user_activities").select("id", { count: "exact", head: true }) as any
    );
    const { count, error: countErr } = await countQ;
    if (countErr) {
      console.error("[audit] count:", countErr);
      return NextResponse.json(
        { error: "Erro ao contar atividades", details: countErr.message },
        { status: 500 }
      );
    }

    let dataQ: any = applyFilters(supabase.from("user_activities").select(selectCols));
    const nullsFirst = false;
    dataQ = dataQ.order(sortColumn, { ascending: orderAsc, nullsFirst });
    if (sortColumn === "resource_type") {
      dataQ = dataQ.order("resource_id", { ascending: orderAsc, nullsFirst });
    }
    dataQ = dataQ.range(offset, offset + limit - 1);

    const { data, error } = await dataQ;

    if (error) {
      console.error("[audit] Erro ao listar atividades:", error);
      return NextResponse.json(
        { error: "Erro ao listar atividades", details: error.message },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as ActivityRow[];
    const admin = createSupabaseAdminClient();
    const withUsers = await enrichUserLabels(rows, admin);
    const enriched = await enrichResourceHints(withUsers, progId, admin);

    return NextResponse.json({
      data: enriched,
      total: count ?? 0,
    });
  } catch (err) {
    console.error("[audit] Erro GET /api/audit/activities:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
