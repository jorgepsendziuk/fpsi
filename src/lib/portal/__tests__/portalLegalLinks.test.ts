import { describe, expect, it } from "vitest";
import { portalInternalDocHref, resolvePortalDocHref } from "../portalLegalLinks";

describe("resolvePortalDocHref", () => {
  it("usa a página interna do portal quando preferInternal é true", () => {
    expect(
      resolvePortalDocHref("legaliza", "https://minhaterralegal.com.br/site/", "politica", {
        preferInternal: true,
      })
    ).toBe("/legaliza/politica-de-privacidade");
  });

  it("usa URL externa só quando não há documento publicado no portal", () => {
    expect(
      resolvePortalDocHref("legaliza", "https://minhaterralegal.com.br/site/", "politica")
    ).toBe("https://minhaterralegal.com.br/site/");
  });

  it("cai no caminho canônico sem URL externa", () => {
    expect(resolvePortalDocHref("legaliza", null, "cookies")).toBe(
      portalInternalDocHref("legaliza", "cookies")
    );
  });
});
