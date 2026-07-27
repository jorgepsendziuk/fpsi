/**
 * Sequência para stories / slides verticais (WhatsApp, Reels, etc.).
 * Fonte de verdade dos cards: productShowcase.ts (mesma ordem da landing).
 */
import {
  PRODUCT_SHOWCASE,
  SHOWCASE_CTA,
  SHOWCASE_INTERVAL_MS,
  type ProductShowcaseStep,
} from "@/lib/marketing/productShowcase";

export type WhatsappSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string;
  tone: ProductShowcaseStep["tone"] | "ink";
  deckSlot?: ProductShowcaseStep["deckSlot"];
  visual?: ProductShowcaseStep["visual"];
};

export const WHATSAPP_SLIDE_MS = SHOWCASE_INTERVAL_MS;

export const WHATSAPP_SLIDES: WhatsappSlide[] = [
  ...PRODUCT_SHOWCASE.map((s) => ({
    id: s.id,
    eyebrow: s.label,
    title: s.title,
    body: s.body,
    tone: s.tone,
    deckSlot: s.deckSlot,
    visual: s.visual,
  })),
  {
    id: SHOWCASE_CTA.id,
    eyebrow: SHOWCASE_CTA.label,
    title: SHOWCASE_CTA.title,
    body: SHOWCASE_CTA.body,
    tone: SHOWCASE_CTA.tone,
  },
];
