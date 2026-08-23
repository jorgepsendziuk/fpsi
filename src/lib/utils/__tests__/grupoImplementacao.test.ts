import { describe, it, expect } from "vitest";
import { matchesGrupoFilter, normalizeGrupoImpleCode } from "../grupoImplementacao";

describe("grupoImplementacao", () => {
  it("normaliza GI1/G1", () => {
    expect(normalizeGrupoImpleCode("GI1")).toBe("G1");
  });

  it("filtro GI2 é cumulativo", () => {
    expect(matchesGrupoFilter("G1", "G2")).toBe(true);
    expect(matchesGrupoFilter("G2", "G2")).toBe(true);
    expect(matchesGrupoFilter("G3", "G2")).toBe(false);
  });

  it("filtro GI1 exclui G2 e medidas sem grupo", () => {
    expect(matchesGrupoFilter("G1", "G1")).toBe(true);
    expect(matchesGrupoFilter("G2", "G1")).toBe(false);
    expect(matchesGrupoFilter(null, "G1")).toBe(false);
  });

  it("whitelist ANPD libera GI2/GI3 no filtro G1", () => {
    const wl = new Set(["4.11", "3.10"]);
    expect(matchesGrupoFilter("G2", "G1", { idMedida: "4.11", whitelistIdMedida: wl })).toBe(true);
    expect(matchesGrupoFilter("G2", "G1", { idMedida: "7.6", whitelistIdMedida: wl })).toBe(false);
    expect(matchesGrupoFilter("G2", "G2", { idMedida: "4.11", whitelistIdMedida: wl })).toBe(true);
  });
});
