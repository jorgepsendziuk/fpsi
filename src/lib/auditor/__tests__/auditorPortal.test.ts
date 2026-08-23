import { describe, expect, it } from "vitest";
import {
  emptyAuditorKpis,
  mediaScores,
  sanitizeAuditorRow,
  toListaItem,
} from "../auditorPortal";

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
