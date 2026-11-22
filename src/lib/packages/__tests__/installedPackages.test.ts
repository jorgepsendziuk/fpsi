import { describe, expect, it } from "vitest";
import {
  isPublicoMarketingPath,
  readPackagesConfig,
} from "../installedPackages";
import { CONTENT_PACK_UI, packMetaForDiagnosticoId } from "../contentPackMeta";

describe("installedPackages", () => {
  it("padrão habilita todos os pacotes", () => {
    const cfg = readPackagesConfig();
    expect(cfg.packages.publico).toBe(true);
    expect(cfg.packages["ppsi-2.0"]).toBe(true);
    expect(cfg.packages["governanca-ia"]).toBe(true);
    expect(cfg.packages.framework).toBe(true);
  });

  it("reconhece rotas do pacote publico", () => {
    expect(isPublicoMarketingPath("/")).toBe(true);
    expect(isPublicoMarketingPath("/sobre")).toBe(true);
    expect(isPublicoMarketingPath("/divulgacao/slides")).toBe(true);
    expect(isPublicoMarketingPath("/login")).toBe(false);
    expect(isPublicoMarketingPath("/acme-org")).toBe(false);
  });
});

describe("contentPackMeta", () => {
  it("mapeia diagnósticos PPSI para pacote terceiro", () => {
    const m = packMetaForDiagnosticoId(2);
    expect(m?.id).toBe("ppsi-2.0");
    expect(m?.origem).toBe("terceiro");
  });

  it("mapeia diagnóstico 4 para governança de IA própria", () => {
    const m = packMetaForDiagnosticoId(4);
    expect(m?.id).toBe("governanca-ia");
    expect(m?.origem).toBe("proprio");
  });

  it("PPSI e Governança de IA têm licenças distintas", () => {
    expect(CONTENT_PACK_UI["ppsi-2.0"].licenca).not.toBe(CONTENT_PACK_UI["governanca-ia"].licenca);
  });
});