import { describe, expect, it } from "vitest";
import { matchesGrupoFilter, normalizeGrupoImpleCode } from "../grupoImplementacao";

describe("grupoImplementacao", () => {
  it("normaliza GI1/G1", () => {
    expect(normalizeGrupoImpleCode("GI1")).toBe("G1");
    expect(normalizeGrupoImpleCode("g1")).toBe("G1");
  });

  it("filtro cumulativo GI2 inclui G1", () => {
    expect(matchesGrupoFilter("G1", "G2")).toBe(true);
    expect(matchesGrupoFilter("G2", "G2")).toBe(true);
    expect(matchesGrupoFilter("G3", "G2")).toBe(false);
  });

  it("filtro GI1 exclui G2 e medidas sem grupo", () => {
    expect(matchesGrupoFilter("G1", "G1")).toBe(true);
    expect(matchesGrupoFilter("G2", "G1")).toBe(false);
    expect(matchesGrupoFilter(null, "G1")).toBe(false);
  });
});
