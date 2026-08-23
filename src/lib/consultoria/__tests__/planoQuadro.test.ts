import { describe, expect, it } from "vitest";
import { agruparQuadro, colunaDoStatus } from "../planoQuadro";

describe("planoQuadro", () => {
  const hoje = new Date("2026-08-23");

  it("prazo vencido cai em atrasado mesmo com status em andamento", () => {
    expect(colunaDoStatus("em_andamento", "2026-08-01", hoje)).toBe("atrasado");
    expect(colunaDoStatus("nao_iniciado", "2026-12-01", hoje)).toBe("a_fazer");
    expect(colunaDoStatus("concluido", "2026-01-01", hoje)).toBe("concluido");
  });

  it("agrupa colunas", () => {
    const g = agruparQuadro(
      [
        { id: 1, titulo: "A", status: "nao_iniciado" },
        { id: 2, titulo: "B", status: "em_andamento" },
        { id: 3, titulo: "C", status: "concluido" },
      ],
      hoje
    );
    expect(g.a_fazer).toHaveLength(1);
    expect(g.andamento).toHaveLength(1);
    expect(g.concluido).toHaveLength(1);
  });
});
