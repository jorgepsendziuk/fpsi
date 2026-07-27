/**
 * Camuflagem de dados pessoais para extratos / PDFs operacionais (LGPD).
 * Uso: exportações compartilháveis — nunca expor PII em claro no extrato.
 */

export function maskPersonName(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "—";
  const parts = raw.split(/\s+/).filter(Boolean);
  return parts
    .map((p) => {
      if (p.length <= 1) return "*";
      if (p.length === 2) return `${p[0]}*`;
      return `${p[0]}${"*".repeat(Math.min(p.length - 2, 6))}${p[p.length - 1]}`;
    })
    .join(" ");
}

export function maskEmail(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "—";
  const at = raw.indexOf("@");
  if (at <= 0) return "***";
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1);
  const localMasked =
    local.length <= 1 ? "*" : `${local[0]}${"*".repeat(Math.min(local.length - 1, 6))}`;
  const domainParts = domain.split(".");
  const domainMasked = domainParts
    .map((part, i) => {
      if (i === domainParts.length - 1) return part; // TLD
      if (part.length <= 2) return "**";
      return `${part[0]}${"*".repeat(Math.min(part.length - 1, 5))}`;
    })
    .join(".");
  return `${localMasked}@${domainMasked}`;
}

/** CPF/CNPJ ou documento livre — mantém só dígitos finais. */
export function maskDocument(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 11) {
    // CPF: ***.***.***-XX
    return `***.***.***-${digits.slice(-2)}`;
  }
  if (digits.length >= 4) {
    return `${"*".repeat(Math.max(digits.length - 2, 2))}${digits.slice(-2)}`;
  }
  return "***";
}

/** Descrição pode conter PII — omitir no extrato. */
export function maskPedidoDescricao(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "—";
  return "[conteúdo omitido no extrato — dados pessoais]";
}
