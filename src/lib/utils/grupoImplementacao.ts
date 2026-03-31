/** Filtro global do diagnóstico por grupo de implementação (CIS / PPSI 2.0 — GI1, GI2, GI3). */
export type GrupoImpleFilter = "all" | "G1" | "G2" | "G3";

/** Texto do guia (CIS / PPSI 2.0) para tooltip do seletor de grupos. */
export const GRUPO_IMPLEMENTACAO_HINT = `Os grupos GI aplicam-se às medidas do diagnóstico de Segurança da Informação (classificação CIS). Nos demais diagnósticos as medidas não possuem GI.

O CIS Controls é composto por um conjunto de 153 medidas, que são divididas em 18 controles e categorizadas em três Grupos de Implementação (GIs). As medidas visam a mitigação das vulnerabilidades dos mais comuns aos mais avançados tipos de ataque. Dessa forma, objetivando criar uma estratégia de priorização de medidas, o CIS elaborou uma metodologia de implementação das medidas com base nos referidos GIs. De modo resumido:

• o primeiro grupo (GI1), também conhecido como higiene cibernética, formado por 56 medidas básicas, foi concebido para instituições de pequeno a médio porte, com limitação no corpo de profissionais de TI e na experiência em segurança da informação;

• o segundo grupo (GI2) acomoda as instituições que empregam responsáveis por gerenciar e proteger a infraestrutura de TI. Inclui o GI1 e mais 74 medidas;

• por fim, o terceiro grupo (GI3) abrange as instituições que empregam especialistas nas diferentes facetas da segurança da informação. Inclui o GI1 e o GI2, mais 23 medidas.`;

/** Como o filtro do diagnóstico aplica essa lógica cumulativa (GI2 soma o GI1; GI3 soma os dois anteriores). */
export const GRUPO_FILTRO_CUMULATIVO_RESUMO = `No filtro desta tela, o nível escolhido é cumulativo: GI1 mostra só medidas classificadas como GI1; GI2 mostra medidas GI1 e GI2; GI3 mostra medidas GI1, GI2 e GI3 — coerente com o fato de cada grupo de implementação englobar o anterior.`;

/** Cores alinhadas ao guia PPSI 2.0: GI1 verde, GI2 cobre/laranja, GI3 teal escuro. */
export const GRUPO_GI_PALETTE: Record<"G1" | "G2" | "G3", { main: string; contrastText: string }> = {
  G1: { main: "#2E7D32", contrastText: "#FFFFFF" },
  G2: { main: "#C2410C", contrastText: "#FFFFFF" },
  G3: { main: "#00695C", contrastText: "#FFFFFF" },
};

/** Converte valor armazenado (G1 ou GI1) para código interno G1|G2|G3. */
export function normalizeGrupoImpleCode(grupo_imple: string | undefined | null): string | null {
  const raw = (grupo_imple ?? "").trim().toUpperCase();
  if (!raw) return null;
  if (raw === "G1" || raw === "GI1") return "G1";
  if (raw === "G2" || raw === "GI2") return "G2";
  if (raw === "G3" || raw === "GI3") return "G3";
  return null;
}

/** Rótulo exibido no UI (GI1, GI2, GI3). */
export function labelGrupoGi(code: "G1" | "G2" | "G3"): string {
  return `GI${code.charAt(1)}`;
}

/** Subtítulo dos indicadores do dashboard conforme filtro cumulativo. */
export function subheaderGrupoFiltro(filter: GrupoImpleFilter): string {
  if (filter === "all") return "Indicadores de todas as medidas aplicáveis.";
  if (filter === "G1") return "Indicadores considerando apenas medidas classificadas como GI1.";
  if (filter === "G2") return "Indicadores considerando medidas GI1 e GI2 (nível GI2 cumulativo).";
  return "Indicadores considerando medidas GI1, GI2 e GI3 (nível GI3 cumulativo).";
}

/**
 * Filtro cumulativo alinhado à metodologia CIS / PPSI: GI2 inclui o escopo do GI1; GI3 inclui GI1 e GI2.
 * Medidas sem GI (segmento base ou privacidade) não entram ao filtrar por GI1/GI2/GI3.
 */
export function matchesGrupoFilter(
  grupo_imple: string | undefined | null,
  filter: GrupoImpleFilter
): boolean {
  if (filter === "all") return true;
  const g = normalizeGrupoImpleCode(grupo_imple);
  if (!g) return false;
  if (filter === "G1") return g === "G1";
  if (filter === "G2") return g === "G1" || g === "G2";
  if (filter === "G3") return g === "G1" || g === "G2" || g === "G3";
  return true;
}
