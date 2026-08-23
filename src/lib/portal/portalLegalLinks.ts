/** Segmentos de documentos legais hospedados no próprio portal (fallback quando não há URL externa no cadastro). */
export type PortalLegalDoc = "politica" | "aviso" | "cookies" | "declaracao" | "termo";

const PATH: Record<PortalLegalDoc, string> = {
  politica: "politica-de-privacidade",
  aviso: "aviso-do-portal",
  cookies: "politica-de-cookies",
  declaracao: "declaracao-de-seguranca",
  termo: "termos-de-uso",
};

export function portalInternalDocHref(slug: string, doc: PortalLegalDoc): string {
  return `/${encodeURIComponent(slug)}/${PATH[doc]}`;
}

export type ResolvePortalDocHrefOptions = {
  /** Quando o programa já publicou o documento no portal FPSI, ignora link externo (ex.: homepage). */
  preferInternal?: boolean;
};

/**
 * Se houver URL externa válida no cadastro, usa ela; senão, página interna do portal.
 * Com `preferInternal`, sempre aponta para a página canônica do próprio portal.
 */
export function resolvePortalDocHref(
  slug: string,
  external: string | null | undefined,
  doc: PortalLegalDoc,
  options?: ResolvePortalDocHrefOptions
): string {
  if (options?.preferInternal) {
    return portalInternalDocHref(slug, doc);
  }
  const t = external?.trim();
  if (t && (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/"))) {
    return t;
  }
  return portalInternalDocHref(slug, doc);
}
