import { describe, it, expect } from "vitest";
import {
  PRESET_ESSENCIAL,
  PRESET_COMPLETO,
  buildEscopoFromPreset,
  isDiagnosticoAtivo,
  isModuloAtivo,
  isControleAtivo,
  ativarDiagnostico,
  ativarModulo,
  filterMaturidadeByEscopo,
  mediaMaturidadeEscopo,
  normalizeEscopo,
  detectPresetFromEscopo,
} from "../perfilEscopo";

describe("perfilEscopo", () => {
  it("essencial desliga SI e AIGP", () => {
    const { escopo } = buildEscopoFromPreset("essencial");
    expect(isDiagnosticoAtivo(escopo, 1)).toBe(true);
    expect(isDiagnosticoAtivo(escopo, 2)).toBe(false);
    expect(isDiagnosticoAtivo(escopo, 3)).toBe(true);
    expect(isDiagnosticoAtivo(escopo, 4)).toBe(false);
    expect(isModuloAtivo(escopo, "inventario-ia")).toBe(false);
  });

  it("completo liga SI e desliga AIGP", () => {
    const { escopo } = buildEscopoFromPreset("completo");
    expect(isDiagnosticoAtivo(escopo, 2)).toBe(true);
    expect(isDiagnosticoAtivo(escopo, 4)).toBe(false);
  });

  it("com_ia liga tudo", () => {
    const { escopo } = buildEscopoFromPreset("com_ia");
    expect(isDiagnosticoAtivo(escopo, 4)).toBe(true);
    expect(isModuloAtivo(escopo, "inventario-ia")).toBe(true);
  });

  it("controle ignorado não pontua", () => {
    const escopo = normalizeEscopo({
      ...PRESET_COMPLETO.escopo,
      controles_ignorados: [99],
    });
    expect(isControleAtivo(escopo, 99, 2)).toBe(false);
    expect(isControleAtivo(escopo, 1, 2)).toBe(true);
  });

  it("ativar diagnóstico SI reativa eixo", () => {
    const base = PRESET_ESSENCIAL.escopo;
    const next = ativarDiagnostico(base, 2);
    expect(isDiagnosticoAtivo(next, 2)).toBe(true);
    expect(isModuloAtivo(next, "diagnostico")).toBe(true);
  });

  it("ativar inventario liga AIGP", () => {
    const base = PRESET_COMPLETO.escopo;
    const next = ativarModulo(base, "inventario-ia");
    expect(isDiagnosticoAtivo(next, 4)).toBe(true);
    expect(isModuloAtivo(next, "inventario-ia")).toBe(true);
  });

  it("filtra maturidade por escopo", () => {
    const rows = [
      { diagnostico_id: 1, score: 80 },
      { diagnostico_id: 2, score: 20 },
      { diagnostico_id: 3, score: 60 },
    ];
    const { ativos, cortados } = filterMaturidadeByEscopo(rows, PRESET_ESSENCIAL.escopo);
    expect(ativos.map((r) => r.diagnostico_id)).toEqual([1, 3]);
    expect(cortados.map((r) => r.diagnostico_id)).toEqual([2]);
    expect(mediaMaturidadeEscopo(rows, PRESET_ESSENCIAL.escopo)).toBe(70);
  });

  it("detecta preset a partir do escopo", () => {
    expect(detectPresetFromEscopo(PRESET_ESSENCIAL.escopo)).toBe("essencial");
    const custom = ativarDiagnostico(PRESET_ESSENCIAL.escopo, 2);
    expect(detectPresetFromEscopo(custom)).toBe("custom");
  });
});
