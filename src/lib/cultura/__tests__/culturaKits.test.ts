import { describe, expect, it } from "vitest";
import { buildCulturaKits } from "../culturaKits";
import type { CadastroSnapshot } from "@/lib/politicas/politicaSugestoes";

const snap: CadastroSnapshot = {
  orgao: "Org X",
  dpoNome: "Carlos",
  canalTitular: "/x/portal",
  unidades: [],
  processos: ["Ouvidoria"],
  sistemas: [],
  fornecedores: [{ nome: "SaaS Y" }],
  mapeamentos: [],
  riscosAltos: ["Phishing na ouvidoria"],
};

describe("culturaKits", () => {
  it("gera 4 formatos com dados do programa", () => {
    const kits = buildCulturaKits(snap, "direitos");
    expect(kits.map((k) => k.id)).toEqual(["slides", "cartaz", "quiz", "email"]);
    const blob = kits.map((k) => k.html).join(" ");
    expect(blob).toContain("Carlos");
    expect(blob).toContain("Ouvidoria");
    expect(blob).toContain("Phishing");
    expect(blob).toContain("SaaS Y");
  });
});
