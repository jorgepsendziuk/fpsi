export type LinkedInShowcaseId =
  | "landing-teaser"
  | "program-modules"
  | "program-dashboard"
  | "program-portal"
  | "diagnostico"
  | "diagnostico-normas"
  | "ai-mapeamento"
  | "aigp"
  | "riscos-interactive"
  | "riscos-matrix"
  | "conformidade"
  | "opensource-hub";

export type LinkedInShowcaseMeta = {
  id: LinkedInShowcaseId;
  label: string;
  /** Barra de endereço fictícia no frame */
  urlPath: string;
  demoHref?: string;
  caption?: string;
};

export const LINKEDIN_SHOWCASE_CATALOG: LinkedInShowcaseMeta[] = [
  {
    id: "landing-teaser",
    label: "Apresentação",
    urlPath: "fpsi.com.br",
    demoHref: "/",
    caption: "Landing pública — escopo do programa e entrada na demo",
  },
  {
    id: "program-modules",
    label: "Módulos do programa",
    urlPath: "fpsi.com.br/programas/demo",
    demoHref: "/demo/login",
    caption: "Home do programa — todos os módulos num painel",
  },
  {
    id: "program-dashboard",
    label: "Painel operacional",
    urlPath: "fpsi.com.br/programas/demo",
    demoHref: "/demo/login",
    caption: "KPIs, pendências e alertas do DPO",
  },
  {
    id: "diagnostico",
    label: "Diagnóstico PPSI",
    urlPath: "fpsi.com.br/programas/demo/diagnostico",
    demoHref: "/demo/login",
    caption: "Maturidade por domínio — Estrutura, Segurança, Privacidade, Gov. IA",
  },
  {
    id: "diagnostico-normas",
    label: "Normas na medida",
    urlPath: "fpsi.com.br/programas/demo/diagnostico",
    demoHref: "/demo/login",
    caption: "LGPD, CIS, NIST consultáveis no fluxo",
  },
  {
    id: "ai-mapeamento",
    label: "IA no mapeamento",
    urlPath: "fpsi.com.br/programas/demo/conformidade/mapeamento",
    demoHref: "/demo/login",
    caption: "Sugestões estruturadas — revisão humana antes de gravar",
  },
  {
    id: "aigp",
    label: "Governança de IA",
    urlPath: "fpsi.com.br/programas/demo/diagnostico",
    demoHref: "/demo/login",
    caption: "Domínio AIGP no mesmo diagnóstico PPSI",
  },
  {
    id: "program-portal",
    label: "Portal do titular",
    urlPath: "fpsi.com.br/sua-org",
    demoHref: "/demo/login",
    caption: "Pedidos art. 18, reportes e documentos legais",
  },
  {
    id: "riscos-interactive",
    label: "Riscos (interativo)",
    urlPath: "fpsi.com.br/programas/demo/riscos",
    demoHref: "/demo/login",
    caption: "Clique na matriz — filtre por célula",
  },
  {
    id: "riscos-matrix",
    label: "Mapa de riscos",
    urlPath: "fpsi.com.br/programas/demo/riscos",
    demoHref: "/demo/login",
    caption: "Probabilidade × impacto — priorização visual",
  },
  {
    id: "conformidade",
    label: "Tratamento de dados",
    urlPath: "fpsi.com.br/programas/demo/conformidade",
    demoHref: "/demo/login",
    caption: "ROPA, RIPD, pedidos e evidências",
  },
  {
    id: "opensource-hub",
    label: "Código aberto",
    urlPath: "github.com/jorgepsendziuk/fpsi",
    demoHref: "https://github.com/jorgepsendziuk/fpsi",
    caption: "Clone, implantação guiada e adaptação",
  },
];

export function getShowcaseMeta(id: LinkedInShowcaseId): LinkedInShowcaseMeta {
  return LINKEDIN_SHOWCASE_CATALOG.find((s) => s.id === id) ?? LINKEDIN_SHOWCASE_CATALOG[0];
}
