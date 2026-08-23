import { describe, expect, it } from "vitest";
import {
  DUE_DILIGENCE_ITENS,
  dueDiligenceProgresso,
  proximaRevisaoAnual,
  revisaoVencida,
} from "../fornecedorCiclo";

describe("fornecedorCiclo", () => {
  it("revisão sem data ou no passado está vencida", () => {
    expect(revisaoVencida(null, new Date("2026-08-23"))).toBe(true);
    expect(revisaoVencida("2026-01-01", new Date("2026-08-23"))).toBe(true);
    expect(revisaoVencida("2026-12-01", new Date("2026-08-23"))).toBe(false);
  });

  it("próxima revisão é +1 ano", () => {
    expect(proximaRevisaoAnual("2025-03-10")).toBe("2026-03-10");
  });

  it("progresso do checklist", () => {
    expect(DUE_DILIGENCE_ITENS.length).toBe(7);
    const p = dueDiligenceProgresso(["inventario", "clausulas"]);
    expect(p.feitos).toBe(2);
    expect(p.percentual).toBe(Math.round((2 / 7) * 100));
  });
});
