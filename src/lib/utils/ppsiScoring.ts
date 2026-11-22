/**
 * Pontuação PPSI 2.0 (IN SGD/MGI 4/2026): NIM, NAC e indicadores iBase / iSeg / iPriv.
 */

import { respostas, respostasimnao } from "./utils";

export type MaturityBandId = "inicial" | "intermediario" | "aprimoramento" | "aprimorado";

export const INDICADOR_MATURIDADE_FAIXAS: {
  id: MaturityBandId;
  min: number;
  max: number;
  label: string;
}[] = [
  { id: "inicial", min: 0, max: 0.299999, label: "Inicial" },
  { id: "intermediario", min: 0.3, max: 0.599999, label: "Intermediário" },
  { id: "aprimoramento", min: 0.6, max: 0.899999, label: "Em aprimoramento" },
  { id: "aprimorado", min: 0.9, max: 1, label: "Aprimorado" },
];

/** Nível de adoção do controle (NAC) — média NIM, faixas Anexo II/III */
export function getNacAdoptionLabel(nac: number): string {
  if (nac <= 0) return "Não adota ou há decisão formal";
  if (nac < 0.25) return "Inicial";
  if (nac < 0.5) return "Intermediário";
  if (nac < 0.75) return "Completo";
  return "Aprimorado";
}

export function getIndicadorMaturityLabel(score: number): string {
  const s = Math.max(0, Math.min(1, score));
  const band = INDICADOR_MATURIDADE_FAIXAS.find((f) => s >= f.min && s <= f.max);
  return band?.label ?? "Inicial";
}

export function getIndicadorMaturityBandId(score: number): MaturityBandId {
  const s = Math.max(0, Math.min(1, score));
  const band = INDICADOR_MATURIDADE_FAIXAS.find((f) => s >= f.min && s <= f.max);
  return band?.id ?? "inicial";
}

export function getIndicadorMaturityColor(score: number): string {
  const s = Math.max(0, Math.min(1, score));
  if (s >= 0.9) return "#2E7D32";
  if (s >= 0.6) return "#388E3C";
  if (s >= 0.3) return "#F9A825";
  return "#C62828";
}

export function parseRespostaId(resposta: unknown): number | null {
  if (resposta === undefined || resposta === null || resposta === "") return null;
  const n = typeof resposta === "string" ? parseInt(resposta, 10) : Number(resposta);
  return Number.isFinite(n) ? n : null;
}

/**
 * Peso NIM (0–1) para uma resposta. `null` = não se aplica (excluir do denominador).
 */
export function getPesoNim(respostaId: number | null, diagnosticoId: number): number | null {
  if (respostaId === null) return 0;
  if (respostaId === 6) return null;

  if (diagnosticoId === 1) {
    const r = respostasimnao.find((x) => x.id === respostaId);
    if (!r) return 0;
    return r.peso ?? 0;
  }

  const r = respostas.find((x) => x.id === respostaId);
  if (!r || r.peso === null) return null;
  return r.peso;
}

export function getRespostaLabel(respostaId: number | null | undefined, diagnosticoId: number): string {
  if (respostaId === undefined || respostaId === null) return "Não respondida";
  if (respostaId === 6) return "Não se aplica";
  if (diagnosticoId === 1) {
    if (respostaId === 1) return "Sim";
    if (respostaId === 2) return "Não";
  }
  const r = respostas.find((x) => x.id === respostaId);
  return r?.label ?? "Não respondida";
}

export function getRespostaColor(respostaId: number, diagnosticoId: number): string {
  if (respostaId === 6) return "#9E9E9E";
  if (diagnosticoId === 1) {
    return respostaId === 1 ? "#4CAF50" : "#FF5252";
  }
  switch (respostaId) {
    case 5:
      return "#2E7D32";
    case 4:
      return "#4CAF50";
    case 3:
      return "#FFC107";
    case 2:
      return "#FF9800";
    case 1:
      return "#FF5722";
    default:
      return "#9E9E9E";
  }
}

export type MedidaResposta = { id?: number; resposta?: number | string | null };

/**
 * NAC do controle: média das pontuações NIM das medidas aplicáveis (não respondida = 0).
 */
export function calculateNacFromMedidas(
  medidas: MedidaResposta[],
  diagnosticoId: number,
  resolveResposta?: (medida: MedidaResposta, index: number) => number | string | null | undefined
): {
  nac: number;
  soma: number;
  totalAplicavel: number;
  respondidas: number;
  naoSeAplica: number;
} {
  let soma = 0;
  let totalAplicavel = 0;
  let respondidas = 0;
  let naoSeAplica = 0;

  medidas.forEach((medida, index) => {
    const raw = resolveResposta ? resolveResposta(medida, index) : medida.resposta;
    const respostaId = parseRespostaId(raw);
    const peso = getPesoNim(respostaId, diagnosticoId);

    if (peso === null) {
      naoSeAplica++;
      return;
    }

    totalAplicavel++;
    soma += peso;
    if (respostaId !== null && raw !== undefined && raw !== null && raw !== "") {
      respondidas++;
    }
  });

  const nac = totalAplicavel > 0 ? soma / totalAplicavel : 0;
  return { nac, soma, totalAplicavel, respondidas, naoSeAplica };
}

/**
 * Indicador do eixo (iBase, iSeg, iPriv, iAIGP): média NIM de todas as medidas dos controles do diagnóstico.
 */
export function calculateIndicadorFromControles(
  diagnosticoId: number,
  medidasByControle: MedidaResposta[][],
  resolveResposta?: (controleIndex: number, medida: MedidaResposta, medidaIndex: number) => unknown
): number {
  let soma = 0;
  let total = 0;

  medidasByControle.forEach((medidas, controleIndex) => {
    medidas.forEach((medida, medidaIndex) => {
      const raw = resolveResposta
        ? resolveResposta(controleIndex, medida, medidaIndex)
        : medida.resposta;
      const respostaId = parseRespostaId(raw);
      const peso = getPesoNim(respostaId, diagnosticoId);
      if (peso === null) return;
      total++;
      soma += peso;
    });
  });

  return total > 0 ? soma / total : 0;
}