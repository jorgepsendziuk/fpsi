import type { Programa } from "@/lib/types/types";

type ProgramaLike =
  | Pick<Programa, "id" | "nome" | "nome_fantasia" | "razao_social">
  | null
  | undefined;

/**
 * Nome do programa (projeto): prioriza `nome`; se vazio, usa dados da organização.
 * Alinhar com a página do programa (`programaName`).
 */
export function getProgramaTituloPrincipal(p: ProgramaLike): string {
  if (!p) return "Programa";
  const nome = String(p.nome ?? "").trim();
  if (nome) return nome;
  const nf = String(p.nome_fantasia ?? "").trim();
  if (nf) return nf;
  const rz = String(p.razao_social ?? "").trim();
  if (rz) return rz;
  return `Programa #${p.id}`;
}

/**
 * Texto da organização quando existe `nome` do programa distinto (nome fantasia / razão social).
 */
export function getProgramaTituloOrganizacao(p: ProgramaLike): string | null {
  if (!p) return null;
  const nome = String(p.nome ?? "").trim();
  if (!nome) return null;
  const parts: string[] = [];
  const nf = String(p.nome_fantasia ?? "").trim();
  const rz = String(p.razao_social ?? "").trim();
  if (nf && nf !== nome) parts.push(nf);
  if (rz && rz !== nome && rz !== nf) parts.push(rz);
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
