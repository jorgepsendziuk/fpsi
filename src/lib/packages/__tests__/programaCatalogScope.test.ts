import { describe, expect, it } from "vitest";
import {
  medidaMatchesGiFilterForPack,
  packUsesPpsiGiClassification,
  resolveCatalogPackIds,
} from "@/lib/packages/programaCatalogScope";

describe("programaCatalogScope", () => {
  it("resolve packs operacional + IA no escopo com_ia", () => {
    expect(
      resolveCatalogPackIds({ setor: 2, perfil_escopo: "completo", escopo: { v: 1 } })
    ).toEqual(["framework"]);
    expect(
      resolveCatalogPackIds({ setor: 2, perfil_escopo: "com_ia", escopo: { v: 1 } })
    ).toEqual(["framework", "governanca-ia"]);
    expect(resolveCatalogPackIds({ setor: 1, perfil_escopo: "completo" })).toEqual([
      "ppsi-2.0",
    ]);
  });

  it("GI só restringe medidas no pack PPSI", () => {
    expect(packUsesPpsiGiClassification("ppsi-2.0")).toBe(true);
    expect(packUsesPpsiGiClassification("framework")).toBe(false);
    expect(
      medidaMatchesGiFilterForPack("framework", null, "G1", { idMedida: "F2.1" })
    ).toBe(true);
    expect(medidaMatchesGiFilterForPack("ppsi-2.0", null, "G1")).toBe(false);
    expect(medidaMatchesGiFilterForPack("ppsi-2.0", "G1", "G1")).toBe(true);
  });
});