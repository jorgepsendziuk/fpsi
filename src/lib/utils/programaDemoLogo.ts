/**
 * Marca FPSI para o programa de demonstração (painel, portal, PDF, etc.).
 * Caminho público — mesmo arquivo referenciado no layout e login.
 */
export const FPSI_LOGO_PUBLIC_URL = "/logo_p.png";

/**
 * Programa institucional de demonstração (dados fictícios / tour).
 * Alinhado a `DEMO_PROGRAMA` em demoData (slug `demo`, id 1) e variações de nome.
 */
export function isProgramaDemonstracao(programa: {
  id?: number;
  slug?: string | null;
  nome?: string | null;
} | null | undefined): boolean {
  if (!programa) return false;
  if (programa.slug === "demo") return true;
  if (programa.id === 1) return true;
  const n = (programa.nome || "").toLowerCase();
  if (n.includes("demonstração") || n.includes("demonstracao")) return true;
  return false;
}

/**
 * URL do logo exibido no painel / portal: demonstração **sempre** usa marca FPSI
 * (ignora logos gravados no banco para esse programa).
 */
export function getProgramaLogoDisplayUrl(programa: {
  id?: number;
  slug?: string | null;
  nome?: string | null;
  logo_programa?: string | null;
  logo_orgao_empresa?: string | null;
} | null | undefined): string | null {
  if (!programa) return null;
  if (isProgramaDemonstracao(programa)) return FPSI_LOGO_PUBLIC_URL;
  const custom = programa.logo_programa || programa.logo_orgao_empresa;
  return custom ? String(custom) : null;
}
