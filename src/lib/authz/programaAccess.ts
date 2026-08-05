import type { SupabaseClient } from "@supabase/supabase-js";
import { UserRole, getDefaultPermissions, type ProgramaPermissions } from "@/lib/types/user";

/** Campos de papel na aba Papéis e equipe → full access quando user_id do responsavel coincide. */
export const PAPEIS_FULL_ACCESS_FIELDS = [
  "representante_alta_administracao",
  "responsavel_gestao_integridade",
  "gestor_seguranca_informacao",
  "encarregado_dados_pessoais",
  "gestor_tic",
  "responsavel_governanca_ia",
  "substituto_governanca_ia",
] as const;

export type AreaModuloKey = "questionario" | "kpis" | "mapeamento" | "riscos";

export type ProgramaAccessMode = "full" | "scoped" | "minimal";

export type ProgramaAreaEscopo = {
  area_id: number;
  diagnostico_ids: number[];
  controle_ids: number[];
  modulos: string[];
  kpi_keys: string[];
};

export type ProgramaAccess = {
  mode: ProgramaAccessMode;
  role: string | null;
  permissions: ProgramaPermissions | null;
  areaIds: number[];
  controleIds: number[];
  diagnosticoIds: number[];
  modulos: string[];
  isGovernancePapel: boolean;
};

const EMPTY_PERMS = getDefaultPermissions(UserRole.CONSULTOR);

function roleIsFull(role: string | null | undefined): boolean {
  return role === UserRole.ADMIN || role === UserRole.COORDENADOR;
}

async function loadGovernancePapelResponsavelIds(
  supabase: SupabaseClient,
  programaId: number
): Promise<number[]> {
  const selectCols = PAPEIS_FULL_ACCESS_FIELDS.join(", ");
  const { data } = await supabase.from("programa").select(selectCols).eq("id", programaId).maybeSingle();
  if (!data || typeof data !== "object") return [];
  const ids: number[] = [];
  const row = data as unknown as Record<string, unknown>;
  for (const field of PAPEIS_FULL_ACCESS_FIELDS) {
    const v = row[field];
    if (typeof v === "number" && Number.isFinite(v)) ids.push(v);
  }
  return ids;
}

/**
 * Resolve acesso do usuário no programa: full (admin/coord/papel governança) vs scoped (áreas).
 */
export async function getProgramaAccess(
  supabase: SupabaseClient,
  programaId: number,
  userId: string
): Promise<ProgramaAccess | null> {
  const { data: member } = await supabase
    .from("programa_users")
    .select("role, permissions, status")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!member) return null;

  const role = (member.role as string) || null;
  const permissions =
    (member.permissions as ProgramaPermissions | null) ||
    (role ? getDefaultPermissions(role as UserRole) : EMPTY_PERMS);

  let isGovernancePapel = false;
  const papelIds = await loadGovernancePapelResponsavelIds(supabase, programaId);
  if (papelIds.length > 0) {
    const { data: resp } = await supabase
      .from("responsavel")
      .select("id")
      .eq("programa", programaId)
      .eq("user_id", userId)
      .in("id", papelIds)
      .limit(1)
      .maybeSingle();
    isGovernancePapel = !!resp;
  }

  if (roleIsFull(role) || isGovernancePapel) {
    return {
      mode: "full",
      role,
      permissions,
      areaIds: [],
      controleIds: [],
      diagnosticoIds: [],
      modulos: [],
      isGovernancePapel,
    };
  }

  const { data: userAreas } = await supabase
    .from("programa_user_areas")
    .select("area_id")
    .eq("programa_id", programaId)
    .eq("user_id", userId);

  const areaIds = (userAreas || []).map((r) => r.area_id as number).filter(Boolean);

  if (areaIds.length === 0) {
    return {
      mode: "minimal",
      role,
      permissions,
      areaIds: [],
      controleIds: [],
      diagnosticoIds: [],
      modulos: [],
      isGovernancePapel: false,
    };
  }

  const { data: escopos } = await supabase
    .from("programa_area_escopo")
    .select("area_id, diagnostico_ids, controle_ids, modulos, kpi_keys")
    .in("area_id", areaIds);

  const controleIds = new Set<number>();
  const diagnosticoIds = new Set<number>();
  const modulos = new Set<string>();

  for (const e of escopos || []) {
    for (const id of e.controle_ids || []) controleIds.add(Number(id));
    for (const id of e.diagnostico_ids || []) diagnosticoIds.add(Number(id));
    for (const m of e.modulos || []) modulos.add(String(m));
  }

  // Se só tem eixos e nenhum controle explícito, libera todos os controles desses eixos
  if (controleIds.size === 0 && diagnosticoIds.size > 0) {
    const { data: controles } = await supabase
      .from("controle")
      .select("id")
      .in("diagnostico", Array.from(diagnosticoIds));
    for (const c of controles || []) controleIds.add(c.id as number);
  }

  return {
    mode: "scoped",
    role,
    permissions,
    areaIds,
    controleIds: Array.from(controleIds),
    diagnosticoIds: Array.from(diagnosticoIds),
    modulos: Array.from(modulos),
    isGovernancePapel: false,
  };
}

export function accessAllowsControle(access: ProgramaAccess, controleId: number): boolean {
  if (access.mode === "full") return true;
  if (access.mode === "minimal") return false;
  return access.controleIds.includes(controleId);
}

export function accessAllowsModulo(access: ProgramaAccess, modulo: AreaModuloKey | string): boolean {
  if (access.mode === "full") return true;
  if (access.mode === "minimal") return modulo === "questionario"; // só via /tarefas
  return access.modulos.includes(modulo);
}

/** Itens de nav (ids de appNavigation) permitidos no modo scoped/minimal. */
export function navItemAllowedForAccess(itemId: string, access: ProgramaAccess): boolean {
  if (access.mode === "full") return true;

  const scopedAllowed = new Set([
    "visao",
    "tarefas",
    "diag",
    "diag-relatorio",
    "plano",
  ]);

  if (access.mode === "minimal") {
    return itemId === "visao" || itemId === "tarefas";
  }

  // scoped: questionário + KPIs (visão) + plano filtrado; sem governança/riscos/usuários etc.
  if (!access.modulos.includes("questionario") && (itemId === "diag" || itemId === "diag-relatorio")) {
    return false;
  }
  return scopedAllowed.has(itemId);
}
