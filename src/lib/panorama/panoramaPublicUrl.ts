import { SITE_ORIGIN } from "@/lib/siteMetadata";

/** URL pública curta do panorama: https://www.fpsi.com.br/{slug}/panorama */
export function buildPanoramaPublicUrl(programaSlug: string): string {
  const slug = String(programaSlug ?? "").trim();
  if (!slug) return "";
  const base = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : SITE_ORIGIN
  ).replace(/\/$/, "");
  return `${base}/${encodeURIComponent(slug)}/panorama`;
}