/**
 * Selos LGPD Compliance — plano do programa × metal pela média dos diagnósticos ativos.
 */

import type { PerfilEscopoPreset } from "@/lib/programa/perfilEscopo";
import { normalizeMaturityScore } from "@/lib/utils/maturity";

export type SeloPlanoId = "essencial" | "completo" | "ia_plus";
export type SeloMetalId = "bronze" | "prata" | "ouro";

export type SeloMetalPalette = {
  id: SeloMetalId;
  label: string;
  /** Borda / metal principal */
  metal: string;
  metalDeep: string;
  metalLight: string;
  accent: string;
  ink: string;
  ring: string;
};

export type SeloPlanoDef = {
  id: SeloPlanoId;
  label: string;
  shortLabel: string;
  description: string;
  presets: PerfilEscopoPreset[];
};

export const SELO_PLANOS: SeloPlanoDef[] = [
  {
    id: "essencial",
    label: "Essencial",
    shortLabel: "Essencial",
    description:
      "Programa focado em privacidade e LGPD: diagnósticos de Estrutura e Privacidade no escopo ativo.",
    presets: ["essencial"],
  },
  {
    id: "completo",
    label: "Completo",
    shortLabel: "Completo",
    description:
      "PPSI completo: Estrutura, Segurança da Informação e Privacidade — sem o bloco de Governança de IA.",
    presets: ["completo"],
  },
  {
    id: "ia_plus",
    label: "IA+",
    shortLabel: "IA+",
    description:
      "Tudo do Completo mais Governança de IA (AIGP): diagnóstico, inventário e comitê de IA.",
    presets: ["com_ia"],
  },
];

export const SELO_METAIS: SeloMetalPalette[] = [
  {
    id: "bronze",
    label: "Bronze",
    metal: "#B87333",
    metalDeep: "#8B5A2B",
    metalLight: "#D4A574",
    accent: "#F0D0A8",
    ink: "#3E2723",
    ring: "#6D4C41",
  },
  {
    id: "prata",
    label: "Prata",
    metal: "#A8B2C1",
    metalDeep: "#6B7785",
    metalLight: "#E8ECF1",
    accent: "#F5F7FA",
    ink: "#263238",
    ring: "#546E7A",
  },
  {
    id: "ouro",
    label: "Ouro",
    metal: "#D4A017",
    metalDeep: "#9A7209",
    metalLight: "#F5D76E",
    accent: "#FFF3C4",
    ink: "#3E2723",
    ring: "#8D6E00",
  },
];

/** Faixas: bronze ≤ 0,33 · prata ≤ 0,66 · ouro &gt; 0,66 */
export function metalFromMaturidadeMedia(raw: number | null | undefined): SeloMetalId {
  if (raw == null || Number.isNaN(Number(raw))) return "bronze";
  const s = normalizeMaturityScore(Number(raw));
  if (s > 0.66) return "ouro";
  if (s > 0.33) return "prata";
  return "bronze";
}

/** Score 0 / nulo → selo cinza até o programa começar a evoluir nos diagnósticos. */
export function isSeloGreyed(raw: number | null | undefined): boolean {
  if (raw == null || Number.isNaN(Number(raw))) return true;
  return normalizeMaturityScore(Number(raw)) <= 0;
}

export function getSeloMetal(id: SeloMetalId): SeloMetalPalette {
  return SELO_METAIS.find((m) => m.id === id) ?? SELO_METAIS[0];
}

export function getSeloPlano(id: SeloPlanoId): SeloPlanoDef {
  return SELO_PLANOS.find((p) => p.id === id) ?? SELO_PLANOS[0];
}

/**
 * Mapeia o preset do programa para o selo.
 * `custom` → Completo (escopo livre; selo de referência do PPSI padrão).
 */
export function planoFromPreset(preset: PerfilEscopoPreset | string | null | undefined): SeloPlanoId {
  if (preset === "essencial") return "essencial";
  if (preset === "com_ia") return "ia_plus";
  return "completo";
}

export function faixaMetalDescricao(metal: SeloMetalId): string {
  if (metal === "ouro") return "Média dos diagnósticos ativos acima de 0,66";
  if (metal === "prata") return "Média dos diagnósticos ativos até 0,66 (acima de 0,33)";
  return "Média dos diagnósticos ativos até 0,33 — ponto de partida ao iniciar os diagnósticos";
}

export type ResolveSeloLgpdInput = {
  preset: PerfilEscopoPreset | string | null | undefined;
  maturidadeMedia: number | null | undefined;
};

export type ResolveSeloLgpdResult = {
  plano: SeloPlanoId;
  planoDef: SeloPlanoDef;
  metal: SeloMetalId;
  metalPalette: SeloMetalPalette;
  displayMetal: SeloMetalId;
  displayPalette: SeloMetalPalette;
  greyed: boolean;
  score: number | null;
};

export function resolveSeloLgpd(input: ResolveSeloLgpdInput): ResolveSeloLgpdResult {
  const plano = planoFromPreset(input.preset);
  const planoDef = getSeloPlano(plano);
  const greyed = isSeloGreyed(input.maturidadeMedia);
  const metal = greyed ? "bronze" : metalFromMaturidadeMedia(input.maturidadeMedia);
  const metalPalette = getSeloMetal(metal);
  const score =
    input.maturidadeMedia == null || Number.isNaN(Number(input.maturidadeMedia))
      ? null
      : normalizeMaturityScore(Number(input.maturidadeMedia));

  return {
    plano,
    planoDef,
    metal,
    metalPalette,
    displayMetal: metal,
    displayPalette: metalPalette,
    greyed,
    score,
  };
}
