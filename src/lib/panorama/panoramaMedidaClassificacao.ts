export type PanoramaMedidaClasse =
  | "nao_avaliado"
  | "nao_se_aplica"
  | "registrado"
  | "atencao"
  | "lacuna";

/** Regras do Panorama inicial (não espelham isGapMedida do plano de trabalho). */
export function classificarRespostaPanorama(
  resposta: unknown,
  diagnosticoId: number | null | undefined
): PanoramaMedidaClasse {
  if (resposta == null || resposta === "") return "nao_avaliado";
  const n = typeof resposta === "number" ? resposta : Number(resposta);
  if (!Number.isFinite(n)) return "nao_avaliado";
  if (n === 6) return "nao_se_aplica";

  const binario = diagnosticoId === 1;
  if (binario) {
    if (n === 1) return "registrado";
    if (n === 2) return "lacuna";
    return "atencao";
  }

  if (n === 4 || n === 5) return "registrado";
  if (n === 2 || n === 3) return "atencao";
  if (n === 1) return "lacuna";
  return "nao_avaliado";
}

export function labelClassePanorama(classe: PanoramaMedidaClasse): string {
  switch (classe) {
    case "registrado":
      return "Já registrado";
    case "atencao":
      return "Atenção";
    case "lacuna":
      return "Precisa de decisão";
    case "nao_avaliado":
      return "Ainda não avaliado";
    case "nao_se_aplica":
      return "Não se aplica";
  }
}