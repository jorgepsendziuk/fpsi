/** Remove prefixo de seed demo nos nomes de responsáveis (só exibição/dados legados). */
const DEMO_RESPONSAVEL_PREFIX = /^Demo FPSI\s*[—–-]\s*/i;

export function formatResponsavelNome(nome: string | null | undefined): string {
  if (!nome) return "";
  return nome.replace(DEMO_RESPONSAVEL_PREFIX, "").trim();
}

export function formatResponsavelOptionLabel(
  nome: string | null | undefined,
  departamento?: string | null,
): string {
  const n = formatResponsavelNome(nome);
  const dep = departamento?.trim() || "Sem setor";
  return `${n} (${dep})`;
}
