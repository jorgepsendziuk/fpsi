/**
 * Escopo do programa: planos (presets) + matriz ignorável.
 * Só itens ativos entram no score e na navegação principal.
 */

export type PerfilEscopoPreset = "essencial" | "completo" | "com_ia" | "custom";

export type ModuloKey =
  | "escritorio-governanca"
  | "responsabilidades"
  | "riscos"
  | "conformidade-tratamento"
  | "conformidade-mapeamento"
  | "conformidade-ropa"
  | "conformidade-ripd"
  | "conformidade-incidentes"
  | "diagnostico"
  | "planos-acao"
  | "politicas"
  | "portal-privacidade"
  | "inventario-ia"
  | "usuarios"
  | "auditoria";

export type ComiteKey = "si" | "priva" | "etir" | "ia";

export type DiagnosticoId = 1 | 2 | 3 | 4;

export type ProgramaEscopoV1 = {
  v: 1;
  diagnosticos: Record<string, boolean>;
  modulos: Record<string, boolean>;
  comites: Record<string, boolean>;
  controles_ignorados: number[];
  medidas_ignoradas: number[];
};

export type PresetDef = {
  id: PerfilEscopoPreset;
  label: string;
  shortLabel: string;
  description: string;
  giAlvo: "G1" | "G2" | "G3" | null;
  escopo: ProgramaEscopoV1;
};

export const ESCOPO_VERSION = 1 as const;

export const ALL_MODULO_KEYS: ModuloKey[] = [
  "escritorio-governanca",
  "responsabilidades",
  "riscos",
  "conformidade-tratamento",
  "conformidade-mapeamento",
  "conformidade-ropa",
  "conformidade-ripd",
  "conformidade-incidentes",
  "diagnostico",
  "planos-acao",
  "politicas",
  "portal-privacidade",
  "inventario-ia",
  "usuarios",
  "auditoria",
];

export const ALL_COMITE_KEYS: ComiteKey[] = ["si", "priva", "etir", "ia"];

export const ALL_DIAGNOSTICO_IDS: DiagnosticoId[] = [1, 2, 3, 4];

const MODULOS_ALWAYS_ON: ModuloKey[] = ["usuarios", "auditoria"];

function modulosRecord(partial: Partial<Record<ModuloKey, boolean>>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const k of ALL_MODULO_KEYS) {
    out[k] = partial[k] ?? false;
  }
  for (const k of MODULOS_ALWAYS_ON) {
    out[k] = true;
  }
  return out;
}

function diagnosticosRecord(partial: Partial<Record<DiagnosticoId, boolean>>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const id of ALL_DIAGNOSTICO_IDS) {
    out[String(id)] = partial[id] ?? false;
  }
  return out;
}

function comitesRecord(partial: Partial<Record<ComiteKey, boolean>>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const k of ALL_COMITE_KEYS) {
    out[k] = partial[k] ?? false;
  }
  return out;
}

function baseEscopo(
  partial: Partial<{
    diagnosticos: Partial<Record<DiagnosticoId, boolean>>;
    modulos: Partial<Record<ModuloKey, boolean>>;
    comites: Partial<Record<ComiteKey, boolean>>;
    controles_ignorados: number[];
    medidas_ignoradas: number[];
  }>
): ProgramaEscopoV1 {
  return {
    v: ESCOPO_VERSION,
    diagnosticos: diagnosticosRecord(partial.diagnosticos ?? {}),
    modulos: modulosRecord(partial.modulos ?? {}),
    comites: comitesRecord(partial.comites ?? {}),
    controles_ignorados: partial.controles_ignorados ?? [],
    medidas_ignoradas: partial.medidas_ignoradas ?? [],
  };
}

export const PRESET_ESSENCIAL: PresetDef = {
  id: "essencial",
  label: "Essencial",
  shortLabel: "Essencial",
  description: "Programa de privacidade enxuto para PME e consultoria (estrutura + privacidade).",
  giAlvo: null,
  escopo: baseEscopo({
    diagnosticos: { 1: true, 2: false, 3: true, 4: false },
    modulos: {
      "escritorio-governanca": true,
      responsabilidades: true,
      riscos: true,
      "conformidade-tratamento": true,
      "conformidade-mapeamento": true,
      "conformidade-ropa": true,
      "conformidade-ripd": true,
      "conformidade-incidentes": true,
      diagnostico: true,
      "planos-acao": true,
      politicas: true,
      "portal-privacidade": true,
      "inventario-ia": false,
    },
    comites: { si: false, priva: true, etir: false, ia: false },
  }),
};

export const PRESET_COMPLETO: PresetDef = {
  id: "completo",
  label: "Completo",
  shortLabel: "Completo",
  description: "PPSI completo: estrutura, segurança da informação e privacidade.",
  giAlvo: "G1",
  escopo: baseEscopo({
    diagnosticos: { 1: true, 2: true, 3: true, 4: false },
    modulos: {
      "escritorio-governanca": true,
      responsabilidades: true,
      riscos: true,
      "conformidade-tratamento": true,
      "conformidade-mapeamento": true,
      "conformidade-ropa": true,
      "conformidade-ripd": true,
      "conformidade-incidentes": true,
      diagnostico: true,
      "planos-acao": true,
      politicas: true,
      "portal-privacidade": true,
      "inventario-ia": false,
    },
    comites: { si: true, priva: true, etir: true, ia: false },
  }),
};

export const PRESET_COM_IA: PresetDef = {
  id: "com_ia",
  label: "Com IA",
  shortLabel: "Com IA",
  description: "PPSI completo + governança de IA (AIGP) e inventário de sistemas.",
  giAlvo: "G1",
  escopo: baseEscopo({
    diagnosticos: { 1: true, 2: true, 3: true, 4: true },
    modulos: {
      "escritorio-governanca": true,
      responsabilidades: true,
      riscos: true,
      "conformidade-tratamento": true,
      "conformidade-mapeamento": true,
      "conformidade-ropa": true,
      "conformidade-ripd": true,
      "conformidade-incidentes": true,
      diagnostico: true,
      "planos-acao": true,
      politicas: true,
      "portal-privacidade": true,
      "inventario-ia": true,
    },
    comites: { si: true, priva: true, etir: true, ia: true },
  }),
};

export const PERFIL_ESCOPO_PRESETS: PresetDef[] = [
  PRESET_ESSENCIAL,
  PRESET_COMPLETO,
  PRESET_COM_IA,
];

export function getPresetById(id: PerfilEscopoPreset): PresetDef | null {
  if (id === "custom") return null;
  return PERFIL_ESCOPO_PRESETS.find((p) => p.id === id) ?? null;
}

/** Escopo completo padrão (programas legados). */
export function defaultEscopoCompleto(): ProgramaEscopoV1 {
  return structuredClone(PRESET_COMPLETO.escopo);
}

export function normalizeEscopo(raw: unknown): ProgramaEscopoV1 {
  if (!raw || typeof raw !== "object") return defaultEscopoCompleto();
  const o = raw as Partial<ProgramaEscopoV1>;
  const presetBase =
    o.v === ESCOPO_VERSION && o.diagnosticos && o.modulos && o.comites
      ? (o as ProgramaEscopoV1)
      : defaultEscopoCompleto();

  return {
    v: ESCOPO_VERSION,
    diagnosticos: { ...defaultEscopoCompleto().diagnosticos, ...presetBase.diagnosticos },
    modulos: { ...modulosRecord({}), ...presetBase.modulos },
    comites: { ...defaultEscopoCompleto().comites, ...presetBase.comites },
    controles_ignorados: Array.isArray(presetBase.controles_ignorados)
      ? presetBase.controles_ignorados.filter((n) => Number.isFinite(n))
      : [],
    medidas_ignoradas: Array.isArray(presetBase.medidas_ignoradas)
      ? presetBase.medidas_ignoradas.filter((n) => Number.isFinite(n))
      : [],
  };
}

export function resolveProgramaEscopo(programa: {
  perfil_escopo?: string | null;
  escopo?: unknown;
  gi_alvo?: string | null;
}): { preset: PerfilEscopoPreset; giAlvo: "G1" | "G2" | "G3" | null; escopo: ProgramaEscopoV1 } {
  const presetRaw = (programa.perfil_escopo ?? "completo") as PerfilEscopoPreset;
  const preset: PerfilEscopoPreset =
    presetRaw === "essencial" || presetRaw === "completo" || presetRaw === "com_ia" || presetRaw === "custom"
      ? presetRaw
      : "completo";

  const escopo = normalizeEscopo(programa.escopo);
  const giRaw = programa.gi_alvo?.trim().toUpperCase();
  const giAlvo =
    giRaw === "G1" || giRaw === "G2" || giRaw === "G3"
      ? giRaw
      : preset === "essencial"
        ? null
        : "G1";

  return { preset, giAlvo, escopo };
}

export function buildEscopoFromPreset(presetId: Exclude<PerfilEscopoPreset, "custom">): {
  perfil_escopo: PerfilEscopoPreset;
  gi_alvo: "G1" | "G2" | "G3" | null;
  escopo: ProgramaEscopoV1;
} {
  const preset = getPresetById(presetId)!;
  return {
    perfil_escopo: presetId,
    gi_alvo: preset.giAlvo,
    escopo: structuredClone(preset.escopo),
  };
}

export function isDiagnosticoAtivo(escopo: ProgramaEscopoV1, diagnosticoId: number): boolean {
  return escopo.diagnosticos[String(diagnosticoId)] === true;
}

export function isModuloAtivo(escopo: ProgramaEscopoV1, key: ModuloKey | string): boolean {
  if (MODULOS_ALWAYS_ON.includes(key as ModuloKey)) return true;
  return escopo.modulos[key] === true;
}

export function isComiteAtivo(escopo: ProgramaEscopoV1, key: ComiteKey): boolean {
  return escopo.comites[key] === true;
}

export function isControleAtivo(escopo: ProgramaEscopoV1, controleId: number, diagnosticoId: number): boolean {
  if (!isDiagnosticoAtivo(escopo, diagnosticoId)) return false;
  return !escopo.controles_ignorados.includes(controleId);
}

export function isMedidaAtiva(
  escopo: ProgramaEscopoV1,
  medidaId: number,
  controleId: number,
  diagnosticoId: number,
  resposta?: number | null
): boolean {
  if (!isControleAtivo(escopo, controleId, diagnosticoId)) return false;
  if (escopo.medidas_ignoradas.includes(medidaId)) return false;
  if (resposta === 6) return false;
  return true;
}

/** Mapa nav item id → módulo escopo */
export const NAV_ITEM_MODULO_MAP: Record<string, ModuloKey | null> = {
  visao: null,
  responsaveis: "responsabilidades",
  "conf-hub": "conformidade-tratamento",
  "conf-map": "conformidade-mapeamento",
  "conf-ropa": "conformidade-ropa",
  "conf-ripd": "conformidade-ripd",
  "conf-inc": "conformidade-incidentes",
  riscos: "riscos",
  diag: "diagnostico",
  "diag-relatorio": "diagnostico",
  "diag-rte": "diagnostico",
  plano: "planos-acao",
  politicas: "politicas",
  "portal-hub": "portal-privacidade",
  "portal-pedidos": "portal-privacidade",
  "portal-reportes": "portal-privacidade",
  "portal-contato": "portal-privacidade",
  areas: "usuarios",
  tarefas: "diagnostico",
  usuarios: "usuarios",
  auditoria: "auditoria",
};

export const HUB_SECTION_MODULO_MAP: Record<string, ModuloKey> = {
  mapeamento: "conformidade-mapeamento",
  ropa: "conformidade-ropa",
  ripd: "conformidade-ripd",
  incidentes: "conformidade-incidentes",
  riscos: "riscos",
  "inventario-ia": "inventario-ia",
};

export function filterNavItemsByEscopo<T extends { id: string }>(items: T[], escopo: ProgramaEscopoV1): T[] {
  return items.filter((item) => {
    const modKey = NAV_ITEM_MODULO_MAP[item.id];
    if (modKey == null) return true;
    return isModuloAtivo(escopo, modKey);
  });
}

export function splitModulosByEscopo<T extends { key: string }>(
  sections: T[],
  escopo: ProgramaEscopoV1
): { ativos: T[]; cortados: T[] } {
  const ativos: T[] = [];
  const cortados: T[] = [];
  for (const s of sections) {
    if (isModuloAtivo(escopo, s.key)) ativos.push(s);
    else cortados.push(s);
  }
  return { ativos, cortados };
}

export function ativarModulo(escopo: ProgramaEscopoV1, key: ModuloKey): ProgramaEscopoV1 {
  const next = structuredClone(escopo);
  next.modulos[key] = true;
  if (key === "inventario-ia") {
    next.diagnosticos["4"] = true;
    next.comites.ia = true;
  }
  if (key === "diagnostico" || key.startsWith("conformidade")) {
    /* módulos operacionais — sem herança extra */
  }
  return next;
}

export function ativarDiagnostico(escopo: ProgramaEscopoV1, diagnosticoId: DiagnosticoId): ProgramaEscopoV1 {
  const next = structuredClone(escopo);
  next.diagnosticos[String(diagnosticoId)] = true;
  if (diagnosticoId === 2) {
    next.modulos.diagnostico = true;
  }
  if (diagnosticoId === 4) {
    next.modulos["inventario-ia"] = true;
    next.comites.ia = true;
    next.modulos.diagnostico = true;
  }
  return next;
}

export function ativarControle(
  escopo: ProgramaEscopoV1,
  controleId: number,
  diagnosticoId: DiagnosticoId
): ProgramaEscopoV1 {
  let next = ativarDiagnostico(escopo, diagnosticoId);
  next = structuredClone(next);
  next.controles_ignorados = next.controles_ignorados.filter((id) => id !== controleId);
  return next;
}

export function ignorarControle(escopo: ProgramaEscopoV1, controleId: number): ProgramaEscopoV1 {
  const next = structuredClone(escopo);
  if (!next.controles_ignorados.includes(controleId)) {
    next.controles_ignorados.push(controleId);
  }
  return next;
}

export function escoposEquivalentes(a: ProgramaEscopoV1, b: ProgramaEscopoV1): boolean {
  return JSON.stringify(normalizeEscopo(a)) === JSON.stringify(normalizeEscopo(b));
}

export function detectPresetFromEscopo(escopo: ProgramaEscopoV1): PerfilEscopoPreset {
  for (const p of PERFIL_ESCOPO_PRESETS) {
    if (escoposEquivalentes(escopo, p.escopo)) return p.id;
  }
  return "custom";
}

export type MaturidadeRow = { diagnostico_id: number; score: number; label?: string };

/** Filtra maturidade agregada — só diagnósticos ativos no escopo. */
export function filterMaturidadeByEscopo(
  rows: MaturidadeRow[],
  escopo: ProgramaEscopoV1
): { ativos: MaturidadeRow[]; cortados: MaturidadeRow[] } {
  const ativos: MaturidadeRow[] = [];
  const cortados: MaturidadeRow[] = [];
  for (const r of rows) {
    if (isDiagnosticoAtivo(escopo, r.diagnostico_id)) ativos.push(r);
    else cortados.push(r);
  }
  return { ativos, cortados };
}

export function mediaMaturidadeEscopo(rows: MaturidadeRow[], escopo: ProgramaEscopoV1): number | null {
  const { ativos } = filterMaturidadeByEscopo(rows, escopo);
  if (ativos.length === 0) return null;
  return ativos.reduce((s, r) => s + Number(r.score), 0) / ativos.length;
}

export function listItensCortadosResumo(escopo: ProgramaEscopoV1): string[] {
  const out: string[] = [];
  for (const id of ALL_DIAGNOSTICO_IDS) {
    if (!isDiagnosticoAtivo(escopo, id)) {
      const names: Record<number, string> = {
        1: "Estrutura",
        2: "Segurança da Informação",
        3: "Privacidade",
        4: "Governança de IA",
      };
      out.push(`Diagnóstico ${names[id]}`);
    }
  }
  for (const k of ALL_MODULO_KEYS) {
    if (!MODULOS_ALWAYS_ON.includes(k) && !isModuloAtivo(escopo, k)) {
      out.push(formatModuloLabel(k));
    }
  }
  return out;
}

export function formatModuloLabel(key: ModuloKey | string): string {
  const labels: Record<string, string> = {
    "escritorio-governanca": "Escritório de governança",
    responsabilidades: "Estrutura de Governança",
    riscos: "Gestão de Riscos",
    "conformidade-tratamento": "Tratamento de dados",
    "conformidade-mapeamento": "Mapeamento de dados",
    "conformidade-ropa": "ROPA",
    "conformidade-ripd": "RIPD",
    "conformidade-incidentes": "Incidentes",
    diagnostico: "Diagnóstico",
    "planos-acao": "Plano de Trabalho",
    politicas: "Políticas",
    "portal-privacidade": "Portal do titular",
    "inventario-ia": "Inventário de IA",
    usuarios: "Usuários",
    auditoria: "Auditoria",
  };
  return labels[key] ?? key;
}
