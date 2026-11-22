/**
 * Escopo de catálogo (controles/medidas) por programa — packs operacionais + IA opcional.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  governancaIaPackId,
  operationalPackIdForPrograma,
  type OperationalContentPackId,
} from "@/lib/packages/programaContentPack";
import type { GrupoImpleFilter } from "@/lib/utils/grupoImplementacao";
import {
  matchesGrupoFilter,
  type MatchesGrupoFilterOptions,
} from "@/lib/utils/grupoImplementacao";

export type ProgramaRowForCatalog = {
  setor?: number | null;
  perfil_escopo?: string | null;
  escopo?: unknown;
};

/** Pack IDs de catálogo (eixos 1–3 + governança IA quando no escopo). */
export function resolveCatalogPackIds(prog: ProgramaRowForCatalog | null | undefined): string[] {
  const packIds: string[] = [operationalPackIdForPrograma(prog ?? undefined)];
  const escopo = prog?.escopo as { diagnosticos?: Record<number, boolean> } | null | undefined;
  const iaAtivo =
    prog?.perfil_escopo === "com_ia" || escopo?.diagnosticos?.[4] === true;
  if (iaAtivo) packIds.push(governancaIaPackId());
  return packIds;
}

export function operationalPackForPrograma(
  prog: ProgramaRowForCatalog | null | undefined
): OperationalContentPackId {
  return operationalPackIdForPrograma(prog ?? undefined);
}

/** Classificação GI (GI1–GI3) aplica-se ao PPSI; medidas do framework não têm grupo_imple. */
export function packUsesPpsiGiClassification(pack: OperationalContentPackId): boolean {
  return pack === "ppsi-2.0";
}

export function medidaMatchesGiFilterForPack(
  operationalPack: OperationalContentPackId,
  grupo_imple: string | undefined | null,
  filter: GrupoImpleFilter,
  options?: MatchesGrupoFilterOptions
): boolean {
  if (filter === "all") return true;
  if (!packUsesPpsiGiClassification(operationalPack)) return true;
  return matchesGrupoFilter(grupo_imple, filter, options);
}

export async function fetchControleIdsForProgramaCatalog(
  supabase: SupabaseClient,
  prog: ProgramaRowForCatalog
): Promise<number[]> {
  const packIds = resolveCatalogPackIds(prog);
  const { data, error } = await supabase.from("controle").select("id").in("pack_id", packIds);
  if (error) throw error;
  return data?.map((c) => c.id) ?? [];
}

export async function fetchMedidaIdsForProgramaCatalog(
  supabase: SupabaseClient,
  prog: ProgramaRowForCatalog
): Promise<number[]> {
  const controleIds = await fetchControleIdsForProgramaCatalog(supabase, prog);
  if (controleIds.length === 0) return [];
  const { data, error } = await supabase.from("medida").select("id").in("id_controle", controleIds);
  if (error) throw error;
  return data?.map((m) => m.id) ?? [];
}