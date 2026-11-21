import { SITE_ORIGIN } from "@/lib/siteMetadata";

/** Origem da aplicação para links compartilháveis: browser usa o host atual; SSR usa env ou site. */
export function getAppPublicOrigin(): string {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  return fromEnv || SITE_ORIGIN.replace(/\/$/, "");
}

/** URL pública curta do panorama: {origin}/{slug}/panorama */
export function buildPanoramaPublicUrl(programaSlug: string, origin?: string): string {
  const slug = String(programaSlug ?? "").trim();
  if (!slug) return "";
  const base = (origin ?? getAppPublicOrigin()).replace(/\/$/, "");
  return `${base}/${encodeURIComponent(slug)}/panorama`;
}