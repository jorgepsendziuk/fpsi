import { describe, expect, it } from "vitest";
import {
  formatEncarregadoPublico,
  isPessoaJuridicaEncarregado,
  labelEncarregadoSelect,
} from "../encarregadoIdentidade";

describe("encarregadoIdentidade", () => {
  it("trata pessoa natural como padrão", () => {
    expect(isPessoaJuridicaEncarregado({ nome: "Ana" })).toBe(false);
    expect(labelEncarregadoSelect({ nome: "Ana Silva" })).toBe("Ana Silva");
    expect(formatEncarregadoPublico({ nome: "Ana Silva", email: "ana@ex.com" })).toEqual({
      titulo: "Ana Silva",
      detalhe: null,
      email: "ana@ex.com",
    });
  });

  it("pessoa jurídica exige divulgação da pessoa natural responsável (ANPD Res. 18/2024 art. 12)", () => {
    const pj = {
      tipo_pessoa: "pessoa_juridica" as const,
      nome: "GeoApps",
      razao_social: "GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA",
      cnpj: "14.843.252/0001-97",
      email: "jimxxx@gmail.com",
      pessoa_natural_responsavel_nome: "Jorge",
    };
    expect(isPessoaJuridicaEncarregado(pj)).toBe(true);
    expect(labelEncarregadoSelect(pj)).toContain("PJ");
    expect(labelEncarregadoSelect(pj)).toContain("Jorge");
    const pub = formatEncarregadoPublico(pj);
    expect(pub?.titulo).toContain("GEOAPPS");
    expect(pub?.detalhe).toContain("Jorge");
    expect(pub?.detalhe).toContain("CNPJ");
    expect(pub?.email).toBe("jimxxx@gmail.com");
  });
});
