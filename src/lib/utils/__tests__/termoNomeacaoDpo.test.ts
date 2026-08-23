import { describe, expect, it } from "vitest";
import {
  analyzeTermoGaps,
  atoFormalAnexoId,
  atoFormalTituloLinhas,
  buildAtoDesignacaoResumo,
  buildAtoFormalParagrafos,
  createEmptyTermoDraft,
  formatDataExtensoPt,
  seedTermoDraftFromPrograma,
  type TermoNomeacaoDpoDraft,
} from "../termoNomeacaoDpo";

function draftNatural(over: Partial<TermoNomeacaoDpoDraft> = {}): TermoNomeacaoDpoDraft {
  return {
    ...createEmptyTermoDraft(),
    tipoEncarregado: "pessoa_natural",
    organizacaoNome: "Prefeitura Municipal de Exemplo",
    dataNomeacao: "2024-07-16",
    dpoNome: "Maria Silva",
    substitutoNome: "João Pereira",
    representanteLegalNome: "Ana Costa",
    ...over,
  };
}

function draftJuridica(over: Partial<TermoNomeacaoDpoDraft> = {}): TermoNomeacaoDpoDraft {
  return {
    ...createEmptyTermoDraft(),
    tipoEncarregado: "pessoa_juridica",
    organizacaoNome: "Prefeitura Municipal de Exemplo",
    dataNomeacao: "2024-07-16",
    dpoNomeEmpresarial: "Privacidade Consultoria Ltda.",
    dpoPessoaNaturalResponsavel: "Carlos Mendes",
    substitutoNome: "João Pereira",
    representanteLegalNome: "Ana Costa",
    ...over,
  };
}

describe("ato formal ANPD — Anexo I e II", () => {
  it("formata a data como dia, mês e ano por extenso", () => {
    expect(formatDataExtensoPt("2024-07-16")).toBe("16 de julho de 2024");
    expect(formatDataExtensoPt("")).toBe("[dia, mês e ano]");
  });

  it("Anexo I (pessoa natural) segue o modelo oficial da ANPD", () => {
    const [p1, p2, p3] = buildAtoFormalParagrafos(draftNatural());

    expect(atoFormalAnexoId("pessoa_natural")).toBe("I");
    expect(atoFormalTituloLinhas("pessoa_natural")).toEqual([
      "Ato Formal para Indicação de",
      "Encarregado Pessoa Natural",
    ]);

    expect(p1).toBe(
      "Prefeitura Municipal de Exemplo designou, em 16 de julho de 2024, o(a) Maria Silva, como encarregado(a) pelo tratamento de dados pessoais, em atendimento ao art. 41 da Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais – LGPD)."
    );
    expect(p2).toContain("(i) aceitar reclamações e comunicações dos titulares, prestar esclarecimentos e adotar providências cabíveis");
    expect(p2).toContain("(ii) receber comunicações da ANPD e adotar providências");
    expect(p2).toContain("(iii) orientar os funcionários e os contratados do agente de tratamento a respeito das práticas a serem tomadas em relação à proteção de dados pessoais");
    expect(p2).toContain(
      "estabelecidas em normas da ANPD em especial as atividades descritas no art. 16 do Regulamento aprovado pela Resolução CD/ANPD nº 18, de 16 de julho de 2024."
    );
    expect(p2).not.toContain("normas da ANPD, em especial");
    expect(p3).toBe(
      "Informa-se que nas ausências, impedimentos e vacâncias do(a) encarregado(a), a função será exercida por seu(sua) substituto(a), o(a) João Pereira."
    );
  });

  it("Anexo II (pessoa jurídica) inclui a pessoa natural responsável perante ANPD e titulares", () => {
    const [p1, p2, p3] = buildAtoFormalParagrafos(draftJuridica());

    expect(atoFormalAnexoId("pessoa_juridica")).toBe("II");
    expect(atoFormalTituloLinhas("pessoa_juridica")).toEqual([
      "Ato Formal para Indicação de",
      "Encarregado Pessoa Jurídica",
    ]);

    expect(p1).toBe(
      "Prefeitura Municipal de Exemplo designou, em 16 de julho de 2024, o(a) Privacidade Consultoria Ltda., como encarregado(a) pelo tratamento de dados pessoais, em atendimento ao art. 41 da Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais – LGPD). O(a) Carlos Mendes representará o(a) Privacidade Consultoria Ltda. nas interações junto à ANPD e aos titulares."
    );
    expect(p2).toContain("estabelecidas em normas da ANPD, em especial as atividades descritas no art. 16");
    expect(p3).toContain("João Pereira");
  });

  it("usa placeholders oficiais quando faltam nomes", () => {
    const [p1, , p3] = buildAtoFormalParagrafos(
      draftNatural({ organizacaoNome: "", dpoNome: "", substitutoNome: "", dataNomeacao: "" })
    );
    expect(p1).toContain("[nome do controlador]");
    expect(p1).toContain("[nome completo]");
    expect(p1).toContain("[dia, mês e ano]");
    expect(p3).toContain("[nome completo do substituto(a)]");
  });

  it("exige nome empresarial e pessoa natural no Anexo II", () => {
    const gaps = analyzeTermoGaps(draftJuridica({ dpoNomeEmpresarial: "", dpoPessoaNaturalResponsavel: "" }));
    expect(gaps.some((g) => g.key === "dpoNomeEmpresarial" && g.severity === "obrigatorio")).toBe(true);
    expect(gaps.some((g) => g.key === "dpoPessoaNaturalResponsavel" && g.severity === "obrigatorio")).toBe(true);
  });

  it("não trata RG/CPF como lacuna — o modelo da ANPD não pede qualificação civil", () => {
    const gaps = analyzeTermoGaps(draftNatural());
    expect(gaps.map((g) => g.key).join(",")).not.toMatch(/cpf|rg/i);
    expect(gaps.filter((g) => g.severity === "obrigatorio")).toHaveLength(0);
  });

  it("preenche o rascunho a partir do cadastro do programa", () => {
    const seeded = seedTermoDraftFromPrograma({
      programa: { razao_social: "Org Controladora SA", dpo_ato_designacao_data: "2025-01-10" },
      dpo: { nome: "Lia DPO", data_designacao: "2024-01-01" },
      suplente: { nome: "Suplente X" },
      representante: { nome: "Dir. Geral", cargo: "Diretora" },
    });
    expect(seeded.organizacaoNome).toBe("Org Controladora SA");
    expect(seeded.dataNomeacao).toBe("2025-01-10");
    expect(seeded.dpoNome).toBe("Lia DPO");
    expect(seeded.dpoPessoaNaturalResponsavel).toBe("Lia DPO");
    expect(seeded.substitutoNome).toBe("Suplente X");
    expect(seeded.representanteLegalNome).toBe("Dir. Geral");
    expect(seeded.tipoEncarregado).toBe("pessoa_natural");
  });

  it("pré-preenche Anexo II quando o encarregado cadastrado é pessoa jurídica", () => {
    const seeded = seedTermoDraftFromPrograma({
      programa: { razao_social: "Legaliza Brasil Ltda" },
      dpo: {
        tipo_pessoa: "pessoa_juridica",
        nome: "GeoApps",
        razao_social: "GEOAPPS DESENVOLVIMENTO DE SISTEMAS LTDA",
        pessoa_natural_responsavel_nome: "Jorge",
      },
    });
    expect(seeded.tipoEncarregado).toBe("pessoa_juridica");
    expect(seeded.dpoNomeEmpresarial).toContain("GEOAPPS");
    expect(seeded.dpoPessoaNaturalResponsavel).toBe("Jorge");
  });

  it("resumo do ato distingue Anexo I e II", () => {
    expect(buildAtoDesignacaoResumo(draftNatural())).toContain("Anexo I — pessoa natural");
    expect(buildAtoDesignacaoResumo(draftJuridica())).toContain("Anexo II — pessoa jurídica");
    expect(buildAtoDesignacaoResumo(draftJuridica())).toContain("Privacidade Consultoria Ltda.");
  });
});
