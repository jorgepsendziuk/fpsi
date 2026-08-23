import { describe, expect, it } from "vitest";
import { buildPoliticaSugestoes, inserirHtmlNaSecao, type CadastroSnapshot } from "../politicaSugestoes";

const snap: CadastroSnapshot = {
  orgao: "Prefeitura Demo",
  dpoNome: "Ana DPO",
  dpoEmail: "dpo@demo.gov.br",
  canalTitular: "/demo/portal",
  unidades: ["RH"],
  processos: ["Folha"],
  sistemas: ["ERP"],
  fornecedores: [{ nome: "CloudX", tipo: "operador", clausulas: false }],
  mapeamentos: [
    {
      nome: "Folha de pagamento",
      finalidade: "cumprimento legal",
      baseLegal: "art. 7º II",
      categorias: "identificação, financeiro",
      compartilhamento: "eSocial",
      transferencia: "não",
    },
  ],
  papeis: ["Encarregado", "Gestor SI"],
  riscosAltos: ["Vazamento de folha"],
};

describe("politicaSugestoes", () => {
  it("PDP usa mapeamento e DPO", () => {
    const s = buildPoliticaSugestoes("politica_protecao_dados_pessoais", snap);
    expect(s.some((x) => x.html.includes("Folha de pagamento"))).toBe(true);
    expect(s.some((x) => x.html.includes("Ana DPO"))).toBe(true);
  });

  it("PGPS lista fornecedores", () => {
    const s = buildPoliticaSugestoes("politica_provedor_servicos", snap);
    expect(s).toHaveLength(1);
    expect(s[0].html).toContain("CloudX");
    expect(s[0].html).toContain("cláusulas pendentes");
  });

  it("ativos lista cadastro mestre", () => {
    const s = buildPoliticaSugestoes("politica_gestao_ativos", snap);
    expect(s[0].html).toContain("ERP");
    expect(s[0].html).toContain("RH");
  });

  it("não insere sem confirmação", () => {
    expect(inserirHtmlNaSecao("<p>a</p>", "<p>b</p>", false)).toBe("<p>a</p>");
    expect(inserirHtmlNaSecao("<p>a</p>", "<p>b</p>", true)).toContain("<p>b</p>");
  });
});
