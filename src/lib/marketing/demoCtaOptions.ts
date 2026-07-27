/**
 * CTAs da demo na landing — mesmo espírito de “ver / experimentar / entrar”.
 * Teste ao vivo: https://fpsi.vercel.app/?cta=<id>
 */
export const DEMO_CTA_OPTIONS = [
  { id: "pratica", label: "Ver na prática", short: "Demo" },
  { id: "funcionando", label: "Ver funcionando", short: "Demo" },
  { id: "dentro", label: "Ver por dentro", short: "Demo" },
  { id: "programa", label: "Ver um programa de verdade", short: "Demo" },
  { id: "explorar", label: "Explorar o programa", short: "Explorar" },
  { id: "conhecer", label: "Conhecer na prática", short: "Demo" },
  { id: "abrir", label: "Abrir a demonstração", short: "Abrir" },
  { id: "entrar", label: "Entrar e ver", short: "Entrar" },
  { id: "provar", label: "Provar sem cadastro", short: "Provar" },
  { id: "agora", label: "Experimentar agora", short: "Demo" },
] as const;

export type DemoCtaId = (typeof DEMO_CTA_OPTIONS)[number]["id"];

export const DEFAULT_DEMO_CTA_ID: DemoCtaId = "pratica";

export function resolveDemoCta(raw: string | null | undefined) {
  const id = (raw?.trim().toLowerCase() || DEFAULT_DEMO_CTA_ID) as DemoCtaId;
  return DEMO_CTA_OPTIONS.find((o) => o.id === id) ?? DEMO_CTA_OPTIONS[0];
}
