/** Segmentos de documentos legais hospedados no próprio portal (fallback quando não há URL externa no cadastro). */
export type PortalLegalDoc = "politica" | "aviso" | "cookies" | "declaracao";

const PATH: Record<PortalLegalDoc, string> = {
  politica: "politica-privacidade",
  aviso: "aviso-portal-titular",
  cookies: "cookies",
  declaracao: "declaracao-seguranca",
};

export function portalInternalDocHref(slug: string, doc: PortalLegalDoc): string {
  return `/${encodeURIComponent(slug)}/${PATH[doc]}`;
}

/**
 * Se houver URL externa válida no cadastro, usa ela; senão, página interna do portal.
 */
export function resolvePortalDocHref(
  slug: string,
  external: string | null | undefined,
  doc: PortalLegalDoc
): string {
  const t = external?.trim();
  if (t && (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/"))) {
    return t;
  }
  return portalInternalDocHref(slug, doc);
}
