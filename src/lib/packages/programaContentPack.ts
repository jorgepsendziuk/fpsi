/**
 * Catálogo de controles/medidas por tipo de organização e escolha explícita (empresa).
 * Órgão público → PPSI 2.0; empresa privada → Framework, salvo escolha PPSI no wizard.
 */

export type OperationalContentPackId = "ppsi-2.0" | "framework";

export type ProgramaPackContext = {
  setor?: number | null;
  escopo?: unknown;
};

function readEscopoOperationalPackId(escopo: unknown): OperationalContentPackId | null {
  if (!escopo || typeof escopo !== "object") return null;
  const id = (escopo as { operational_pack_id?: string }).operational_pack_id;
  if (id === "ppsi-2.0" || id === "framework") return id;
  return null;
}

/** Resolve o pack operacional (eixos 1–3) a partir do programa. */
export function operationalPackIdForPrograma(
  programa: ProgramaPackContext | null | undefined
): OperationalContentPackId {
  const fromEscopo = readEscopoOperationalPackId(programa?.escopo);
  if (fromEscopo) return fromEscopo;
  if (programa?.setor === 1) return "ppsi-2.0";
  return "framework";
}

/** @deprecated Use operationalPackIdForPrograma — mantido para chamadas só com setor. */
export function operationalPackIdForProgramaSetor(
  setor: number | null | undefined
): OperationalContentPackId {
  return operationalPackIdForPrograma({ setor });
}

export function governancaIaPackId(): "governanca-ia" {
  return "governanca-ia";
}