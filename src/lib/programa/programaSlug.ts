/**
 * Slug do programa = primeiro segmento da URL pública do portal (`/{slug}`).
 * Também pode aparecer em `/programas/{slug}` no painel logado.
 */

export const PROGRAMA_SLUG_EXPLICACAO =
  "O slug é o endereço curto e fixo do portal público de privacidade nesta instalação (ex.: fpsi.com.br/meu-orgao). Use apenas letras minúsculas, números e hífens. Não use espaços, acentos nem barra. Depois de publicar materiais com o link, altere o slug só quando necessário — quem guardou a URL antiga precisará da nova.";

/** Rotas já reservadas pelo app; não podem ser slug de programa. */
export const PROGRAMA_SLUG_RESERVED = new Set([
  "programas",
  "login",
  "sobre",
  "perfil",
  "api",
  "auth",
  "register",
  "forgot-password",
  "artigo",
  "educacao",
  "divulgacao",
  "gestao",
  "linkedin",
  "setup",
  "offline",
  "privacidade",
  "dashboard",
  "admin",
  "auditor",
  "demo",
  "favicon.ico",
  "sw.js",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeProgramaSlug(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type ProgramaSlugValidation =
  | { ok: true; slug: string }
  | { ok: false; slug: string; reason: string };

export function validateProgramaSlug(raw: string): ProgramaSlugValidation {
  const slug = normalizeProgramaSlug(raw);
  if (!slug) {
    return { ok: false, slug: "", reason: "Informe um slug válido." };
  }
  if (slug.length < 2) {
    return { ok: false, slug, reason: "O slug deve ter pelo menos 2 caracteres." };
  }
  if (slug.length > 64) {
    return { ok: false, slug, reason: "O slug pode ter no máximo 64 caracteres." };
  }
  if (!SLUG_RE.test(slug)) {
    return { ok: false, slug, reason: "Use apenas letras minúsculas, números e hífens." };
  }
  if (PROGRAMA_SLUG_RESERVED.has(slug)) {
    return { ok: false, slug, reason: "Este endereço é reservado pelo sistema." };
  }
  return { ok: true, slug };
}