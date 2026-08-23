import { describe, expect, it } from "vitest";
import { nomeDownloadEvidencia } from "../auditorArquivoNome";
import {
  emptyAuditorKpis,
  mediaScores,
  sanitizeAuditorRow,
  toListaItem,
} from "../auditorPortal";
import {
  completarDiagnosticosEixos,
  vinculoFromMedida,
} from "../auditorEvidenciaVinculos";

describe("auditorPortal", () => {
  it("não vaza PII nem conteúdo de evidência", () => {
    const clean = sanitizeAuditorRow({
      id: 1,
      titulo: "Política",
      conteudo_base64: "AAAA",
      email_titular: "a@b.com",
      cpf: "000",
      nome_titular: "João",
      status: "ativo",
    });
    expect(clean.titulo).toBe("Política");
    expect(clean.conteudo_base64).toBeUndefined();
    expect(clean.email_titular).toBeUndefined();
    expect(clean.cpf).toBeUndefined();
    expect(clean.nome_titular).toBeUndefined();
    expect(clean.status).toBe("ativo");
  });

  it("KPIs começam zerados e média ignora NaN", () => {
    const k = emptyAuditorKpis();
    expect(k.pedidosTitularesAbertos).toBe(0);
    expect(mediaScores([])).toBeNull();
    expect(mediaScores([2, 4])).toBe(3);
    expect(mediaScores([1, Number.NaN])).toBe(1);
  });

  it("monta item de lista pelos campos conhecidos", () => {
    const item = toListaItem(
      { id: 9, nome: "Backup", finalidade: "contingência", status: "ativo" },
      ["titulo", "nome"],
      ["finalidade"]
    );
    expect(item.id).toBe(9);
    expect(item.titulo).toBe("Backup");
    expect(item.detalhe).toBe("contingência");
  });
});

describe("vinculos e eixos de maturidade", () => {
  it("rótulo da evidência traz medida, controle e diagnóstico", () => {
    const v = vinculoFromMedida({
      codigo: "1.2.3",
      texto: "Nomear encarregado de dados",
      controleNumero: "1.2",
      controleNome: "Governança",
      diagnosticoId: 1,
      diagnosticoNome: "Estrutura de gestão",
    });
    expect(v.rotulo).toContain("Medida 1.2.3");
    expect(v.rotulo).toContain("controle 1.2");
    expect(v.contexto).toContain("Governança");
    expect(v.norma).toMatch(/iMC/);
  });

  it("completa os quatro eixos mesmo sem scores", () => {
    const eixos = completarDiagnosticosEixos([]);
    expect(eixos.map((d) => d.diagnosticoId)).toEqual([1, 2, 3, 4]);
    expect(eixos[0].indice).toMatch(/iMC/);
    expect(eixos[0].score).toBeNull();
  });
});

describe("nome de download da evidência", () => {
  it("usa o título humano e a extensão do mime, não o nome cru", () => {
    expect(
      nomeDownloadEvidencia("Nomeação do DPO", "application/pdf", "SCAN_IMG_9981.pdf")
    ).toBe("Nomeacao-do-DPO.pdf");
  });
});

