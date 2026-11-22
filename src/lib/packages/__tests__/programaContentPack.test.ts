import { describe, expect, it } from "vitest";
import {
  governancaIaPackId,
  operationalPackIdForPrograma,
  operationalPackIdForProgramaSetor,
} from "@/lib/packages/programaContentPack";

describe("programaContentPack", () => {
  it("órgão público usa PPSI", () => {
    expect(operationalPackIdForProgramaSetor(1)).toBe("ppsi-2.0");
    expect(operationalPackIdForPrograma({ setor: 1 })).toBe("ppsi-2.0");
  });
  it("empresa privada usa Framework por padrão", () => {
    expect(operationalPackIdForProgramaSetor(2)).toBe("framework");
    expect(operationalPackIdForPrograma({ setor: 2 })).toBe("framework");
    expect(operationalPackIdForPrograma({ setor: null })).toBe("framework");
  });
  it("empresa pode optar por PPSI no escopo", () => {
    expect(
      operationalPackIdForPrograma({
        setor: 2,
        escopo: { v: 1, operational_pack_id: "ppsi-2.0" },
      })
    ).toBe("ppsi-2.0");
  });
  it("governança IA pack", () => {
    expect(governancaIaPackId()).toBe("governanca-ia");
  });
});