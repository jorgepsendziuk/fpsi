const NIVEL_VALOR: Record<string, number> = {
  muito_baixo: 1,
  baixo: 2,
  medio: 3,
  alto: 4,
  muito_alto: 5,
};

export function calcularScoreRisco(probabilidade: string, impacto: string): number {
  const p = NIVEL_VALOR[probabilidade] ?? 3;
  const i = NIVEL_VALOR[impacto] ?? 3;
  return Math.round(p * i * 100) / 100;
}

export function labelNivelRisco(nivel: string): string {
  const map: Record<string, string> = {
    muito_baixo: "Muito baixo",
    baixo: "Baixo",
    medio: "Médio",
    alto: "Alto",
    muito_alto: "Muito alto",
  };
  return map[nivel] ?? nivel;
}

export function corScoreRisco(score: number): string {
  if (score >= 20) return "#C62828";
  if (score >= 12) return "#EF6C00";
  if (score >= 6) return "#F9A825";
  return "#2E7D32";
}
