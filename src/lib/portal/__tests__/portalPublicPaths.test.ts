import { describe, expect, it } from "vitest";
import {
  PORTAL_CANONICAL_PATH,
  portalDocHref,
  portalPdfHref,
  portalSeloHref,
  resolvePortalDocFromTipo,
} from "@/lib/portal/portalPublicPaths";

describe("portalPublicPaths", () => {
  it("usa slugs canônicos com 'de'", () => {
    expect(PORTAL_CANONICAL_PATH.politica).toBe("politica-de-privacidade");
    expect(PORTAL_CANONICAL_PATH.cookies).toBe("politica-de-cookies");
    expect(PORTAL_CANONICAL_PATH.termo).toBe("termos-de-uso");
    expect(PORTAL_CANONICAL_PATH.aviso).toBe("aviso-do-portal");
    expect(PORTAL_CANONICAL_PATH.declaracao).toBe("declaracao-de-seguranca");
  });

  it("monta URLs públicas do programa", () => {
    expect(portalDocHref("legaliza", "politica")).toBe("/legaliza/politica-de-privacidade");
    expect(portalPdfHref("legaliza", "politica")).toBe("/legaliza/pdf/politica-de-privacidade");
    expect(portalSeloHref("legaliza")).toBe("/legaliza/selo");
  });

  it("aceita aliases antigos e curtos no PDF", () => {
    expect(resolvePortalDocFromTipo("politica-privacidade")).toBe("politica");
    expect(resolvePortalDocFromTipo("cookies")).toBe("cookies");
    expect(resolvePortalDocFromTipo("termo-uso")).toBe("termo");
    expect(resolvePortalDocFromTipo("aviso-portal-titular")).toBe("aviso");
    expect(resolvePortalDocFromTipo("declaracao-seguranca")).toBe("declaracao");
    expect(resolvePortalDocFromTipo("desconhecido")).toBeNull();
  });
});
