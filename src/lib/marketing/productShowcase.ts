/**
 * Catálogo visual compartilhado: baralho da landing + /divulgacao/slides.
 * Manter alinhados — um só lugar para ordem e cards.
 */
import type { WhatsappVisualKind } from "@/components/marketing/WhatsappProductScenes";
import type { LandingDeckSlot } from "@/components/landing/LandingDeckHero";

export type ProductShowcaseStep = {
  id: string;
  /** Rótulo curto no baralho / eyebrow do slide */
  label: string;
  /** Título do slide / caption da carta */
  title: string;
  /** Corpo do slide */
  body: string;
  tone: "ink" | "lock" | "shield" | "blue";
  deckSlot?: LandingDeckSlot;
  visual?: WhatsappVisualKind;
};

/**
 * Ordem narrativa: maturidade → IA no mapeamento → gov. de IA → canal do titular
 * → painel → políticas → riscos → conformidade.
 */
export const PRODUCT_SHOWCASE: ProductShowcaseStep[] = [
  {
    id: "diag",
    label: "Diagnóstico",
    title: "Maturidade mensurável",
    body: "Índices por domínio: Estrutura, Segurança, Privacidade e Governança de IA — do diagnóstico ao plano.",
    tone: "shield",
    deckSlot: 1,
  },
  {
    id: "ai",
    label: "Mapeamento por IA",
    title: "A IA sugere. Você decide.",
    body: "No mapeamento, a IA propõe tratamentos com área e base legal — você revisa e grava. Assistência também em outras etapas do programa.",
    tone: "lock",
    visual: "ai",
  },
  {
    id: "gov-ia",
    label: "Governança de IA",
    title: "Governança de IA no mesmo programa",
    body: "Inventário de sistemas, risco e maturidade — alinhado a NIST AI RMF, ISO 42001 e LGPD × IA.",
    tone: "lock",
    visual: "aigp",
  },
  {
    id: "portal",
    label: "Portal do Titular",
    title: "Canal público pronto",
    body: "Pedidos de acesso, correção e eliminação — com documentos legais no endereço da organização.",
    tone: "blue",
    visual: "portal",
  },
  {
    id: "dash",
    label: "Painel",
    title: "O que pede atenção hoje",
    body: "Maturidade, pedidos de titulares, reportes e riscos críticos — num único painel.",
    tone: "blue",
    deckSlot: 0,
  },
  {
    id: "politicas",
    label: "Editor de Políticas",
    title: "Políticas com assistência",
    body: "Editor rico com seções, versão e exportação — PGSI, proteção de dados e textos do portal.",
    tone: "shield",
    visual: "politicas",
  },
  {
    id: "risk",
    label: "Gestão de Riscos",
    title: "Priorize o que pode virar incidente",
    body: "Probabilidade × impacto na tela — foque nos críticos e acompanhe a mitigação.",
    tone: "lock",
    deckSlot: 2,
  },
  {
    id: "conf",
    label: "Conformidade",
    title: "Tratamentos e provas juntos",
    body: "ROPA com base legal, pedidos do portal e evidências anexadas às medidas — prontas para auditoria.",
    tone: "blue",
    deckSlot: 3,
  },
];

export const SHOWCASE_CTA = {
  id: "cta",
  label: "Experimente",
  title: "Demo aberta, sem cadastro",
  body: "Entre num programa fictício completo. Depois, crie o da sua organização.",
  tone: "lock" as const,
};

export const SHOWCASE_INTERVAL_MS = 5200;
