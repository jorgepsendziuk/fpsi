import type { PortalLegalDoc } from "@/lib/portal/portalLegalLinks";
import { PORTAL_DOC_TIPO_POLITICA, type PortalDocKey } from "@/lib/politicas/politicasCatalog";

/** Slugs canônicos públicos: `/{programa}/politica-de-privacidade`. */
export const PORTAL_CANONICAL_PATH: Record<PortalLegalDoc, string> = {
  politica: "politica-de-privacidade",
  cookies: "politica-de-cookies",
  termo: "termos-de-uso",
  aviso: "aviso-do-portal",
  declaracao: "declaracao-de-seguranca",
};

export const PORTAL_SELO_PATH = "selo";

export const PORTAL_DOC_TITLE: Record<PortalLegalDoc, string> = {
  politica: "Política de Privacidade",
  cookies: "Política de Cookies",
  termo: "Termos de Uso",
  aviso: "Aviso do Portal do Titular",
  declaracao: "Declaração de Segurança",
};

const TIPO_ALIASES: Record<string, PortalLegalDoc> = {
  "politica-de-privacidade": "politica",
  "politica-privacidade": "politica",
  privacidade: "politica",
  politica: "politica",
  "politica-de-cookies": "cookies",
  cookies: "cookies",
  cookie: "cookies",
  "termos-de-uso": "termo",
  "termo-de-uso": "termo",
  "termo-uso": "termo",
  termos: "termo",
  termo: "termo",
  "aviso-do-portal": "aviso",
  "aviso-portal-titular": "aviso",
  "aviso-do-portal-do-titular": "aviso",
  aviso: "aviso",
  "declaracao-de-seguranca": "declaracao",
  "declaracao-seguranca": "declaracao",
  seguranca: "declaracao",
  declaracao: "declaracao",
};

export function resolvePortalDocFromTipo(tipo: string | undefined | null): PortalLegalDoc | null {
  if (!tipo) return null;
  const key = decodeURIComponent(String(tipo)).trim().toLowerCase();
  return TIPO_ALIASES[key] ?? null;
}

export function portalDocHref(slug: string, doc: PortalLegalDoc): string {
  return `/${encodeURIComponent(slug)}/${PORTAL_CANONICAL_PATH[doc]}`;
}

export function portalPdfHref(slug: string, doc: PortalLegalDoc): string {
  return `/${encodeURIComponent(slug)}/pdf/${PORTAL_CANONICAL_PATH[doc]}`;
}

export function portalSeloHref(slug: string): string {
  return `/${encodeURIComponent(slug)}/${PORTAL_SELO_PATH}`;
}

export function portalSeloSvgHref(slug: string): string {
  return `/api/portal/${encodeURIComponent(slug)}/selo`;
}

export function portalDocTipoPolitica(doc: PortalLegalDoc): string {
  const key = doc as PortalDocKey;
  return PORTAL_DOC_TIPO_POLITICA[key];
}

export const PORTAL_PUBLIC_CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=120, must-revalidate",
};
