import { describe, expect, it } from "vitest";
import {
  ANPD_ATPP_WHITELIST_ID_MEDIDA,
  ANPD_CHECKLIST,
  ESSENCIAL_MEDIDAS_IGNORADAS_IDS,
  isAnpdWhitelistMedida,
  resumoCoberturaAnpd,
} from "../anpdAtpp";

describe("anpdAtpp", () => {
  it("checklist cobre as seções do guia ANPD ATPP", () => {
    const secoes = new Set(ANPD_CHECKLIST.map((i) => i.secao));
    expect(secoes.has("politica_si")).toBe(true);
    expect(secoes.has("conscientizacao")).toBe(true);
    expect(secoes.has("contratos")).toBe(true);
    expect(secoes.has("controle_acesso")).toBe(true);
    expect(secoes.has("dados_armazenados")).toBe(true);
    expect(secoes.has("comunicacoes")).toBe(true);
    expect(secoes.has("vulnerabilidades")).toBe(true);
    expect(secoes.has("dispositivos_moveis")).toBe(true);
    expect(secoes.has("nuvem")).toBe(true);
  });

  it("whitelist ANPD inclui medidas GI2/GI3 críticas do plano", () => {
    for (const id of ["3.9", "3.10", "3.11", "4.11", "4.12", "15.2", "15.4"]) {
      expect(ANPD_ATPP_WHITELIST_ID_MEDIDA).toContain(id);
      expect(isAnpdWhitelistMedida(id)).toBe(true);
    }
    expect(isAnpdWhitelistMedida("6.3")).toBe(false);
  });

  it("medidas ignoradas do Essencial são PKs do Controle 0 APF", () => {
    expect(ESSENCIAL_MEDIDAS_IGNORADAS_IDS).toContain(2); // 0.2 gestor TIC
    expect(ESSENCIAL_MEDIDAS_IGNORADAS_IDS).toContain(6); // 0.6 CSI
    expect(ESSENCIAL_MEDIDAS_IGNORADAS_IDS).toContain(8); // 0.8 ETIR
    // Mantidas no score
    expect(ESSENCIAL_MEDIDAS_IGNORADAS_IDS).not.toContain(4); // 0.4 encarregado
    expect(ESSENCIAL_MEDIDAS_IGNORADAS_IDS).not.toContain(11); // 0.11 POSIN
    expect(ESSENCIAL_MEDIDAS_IGNORADAS_IDS).not.toContain(17); // 0.17 riscos LGPD
  });

  it("todo item tem cobertura válida e ids únicos", () => {
    const ids = new Set<string>();
    for (const item of ANPD_CHECKLIST) {
      expect(["coberto", "parcial", "lacuna"]).toContain(item.cobertura);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      if (item.cobertura !== "lacuna") {
        expect(item.idMedidas.length).toBeGreaterThan(0);
      }
    }
  });

  it("resumo de cobertura soma o checklist", () => {
    const r = resumoCoberturaAnpd();
    expect(r.coberto + r.parcial + r.lacuna).toBe(ANPD_CHECKLIST.length);
    expect(r.coberto).toBeGreaterThan(0);
    expect(r.parcial).toBeGreaterThan(0);
  });
});
