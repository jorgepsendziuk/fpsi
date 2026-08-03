/** Índices oficiais por eixo (alinhado aos cards da visão geral). */
export const DIAGNOSTICO_INDICE_LABELS: Record<number, string> = {
  1: "iMC₀",
  2: "iSeg",
  3: "iPriv",
  4: "iAIGP",
};

export function getDiagnosticoIndiceLabel(diagnosticoId: number): string {
  return DIAGNOSTICO_INDICE_LABELS[diagnosticoId] ?? `D${diagnosticoId}`;
}

/** Rótulos curtos e estáveis para a árvore de navegação (evita textões do catálogo). */
export const DIAGNOSTICO_TREE_LABELS: Record<number, string> = {
  1: "Estrutura de gestão",
  2: "Segurança da informação",
  3: "Privacidade",
  4: "Governança de IA",
};

export function getDiagnosticoTreeLabel(diagnosticoId: number, descricao?: string | null): string {
  return DIAGNOSTICO_TREE_LABELS[diagnosticoId] ?? descricao?.trim() ?? `Diagnóstico ${diagnosticoId}`;
}

export function truncateTreeText(text: string, max = 44): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function getControleTreeLabel(numero: string | number | null | undefined, nome: string): string {
  const num = numero != null && String(numero).trim() !== "" ? String(numero).trim() : "?";
  return truncateTreeText(`${num} · ${nome}`, 48);
}

export function getMedidaTreeLabel(medidaTexto: string): string {
  return truncateTreeText(medidaTexto, 52);
}
