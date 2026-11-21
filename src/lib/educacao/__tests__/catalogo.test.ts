import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CARTILHAS,
  CENARIOS,
  EDU_VERSAO,
  GLOSSARIO,
  MODULOS,
  TRILHAS,
  cargaHorariaMinutos,
  moduloPorId,
  opcoesParaExibir,
  ordemExibicao,
  perguntaDaSemana,
  trilhaPorId,
} from "../catalogo";
import { GABARITO } from "../gabarito";
import { corrigirModulo } from "../corrigir";
import {
  avaliarTrilha,
  coberturaCsv,
  codigoCertificado,
  notaPercentual,
  reciclagemDevida,
  resumirCobertura,
} from "../progresso";
import { buildCertificadoPdf } from "../certificadoPdf";

describe("catalogo de educacao", () => {
  it("tem 8 modulos, cartilhas, trilhas e glossario", () => {
    expect(MODULOS).toHaveLength(8);
    expect(MODULOS.map((m) => m.ordem)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(MODULOS.filter((m) => m.previewPublico).map((m) => m.id)).toEqual([
      "por-que-importa",
      "conceitos",
    ]);
    expect(CARTILHAS.length).toBeGreaterThanOrEqual(8);
    expect(TRILHAS.map((t) => t.id)).toEqual([
      "onboarding",
      "gestores",
      "rh",
      "comercial",
      "ti",
      "atendimento",
      "juridico",
    ]);
    expect(GLOSSARIO.length).toBeGreaterThanOrEqual(8);
    expect(CENARIOS.length).toBeGreaterThanOrEqual(4);
    expect(cargaHorariaMinutos("onboarding")).toBeGreaterThan(30);
  });

  it("toda trilha aponta para modulo e cartilha existentes", () => {
    for (const trilha of TRILHAS) {
      expect(trilha.notaMinima).toBe(70);
      expect(trilha.reciclagemMeses).toBe(12);
      for (const id of trilha.moduloIds) expect(moduloPorId(id)).toBeTruthy();
      for (const id of trilha.cartilhaIds) {
        expect(CARTILHAS.some((c) => c.id === id)).toBe(true);
      }
    }
    expect(trilhaPorId("onboarding")?.moduloIds).not.toContain("ia");
    expect(trilhaPorId("ti")?.moduloIds).toContain("ia");
  });

  it("cada pergunta tem gabarito e embaralha as opcoes", () => {
    for (const modulo of MODULOS) {
      expect(modulo.perguntas.length).toBeGreaterThanOrEqual(3);
      expect(modulo.perguntas.length).toBeLessThanOrEqual(5);
      for (const p of modulo.perguntas) {
        expect(GABARITO[p.id]).toBe(0);
        expect(p.opcoes).toHaveLength(4);
        const ordem = ordemExibicao(p.id);
        expect(new Set(ordem).size).toBe(4);
        expect(opcoesParaExibir(p)).toHaveLength(4);
      }
    }
  });

  it("corrige pelo indice exibido, nao pelo indice original", () => {
    const modulo = moduloPorId("incidentes");
    expect(modulo).toBeTruthy();
    const respostas = modulo!.perguntas.map((p) => ordemExibicao(p.id).indexOf(0));
    const ok = corrigirModulo("incidentes", respostas, 70);
    expect(ok?.aprovado).toBe(true);
    expect(ok?.nota).toBe(100);
    const ruim = corrigirModulo("incidentes", [0, 0, 0], 70);
    expect(ruim?.aprovado).toBe(notaPercentual(ruim!.acertos, ruim!.total) >= 70);
  });

  it("avalia trilha, reciclagem e cobertura", () => {
    const trilha = trilhaPorId("onboarding")!;
    const incompleta = avaliarTrilha({
      trilha,
      progresso: [{ moduloId: "conceitos", aprovado: true, melhorNota: 100 }],
      nossaCasaLida: false,
    });
    expect(incompleta.concluida).toBe(false);
    const completa = avaliarTrilha({
      trilha,
      progresso: trilha.moduloIds.map((moduloId) => ({ moduloId, aprovado: true, melhorNota: 80 })),
      nossaCasaLida: true,
    });
    expect(completa.concluida).toBe(true);
    expect(completa.progresso).toBe(100);
    expect(reciclagemDevida("2020-01-01T00:00:00.000Z", 12, new Date("2026-11-10"))).toBe(true);
    expect(reciclagemDevida("2026-10-01T00:00:00.000Z", 12, new Date("2026-11-10"))).toBe(false);
    const resumo = resumirCobertura([
      { onboardingConcluido: true },
      { onboardingConcluido: false },
    ]);
    expect(resumo.percentual).toBe(50);
    const csv = coberturaCsv([
      {
        userId: "u1",
        nome: "Ana, Silva",
        onboardingStatus: "concluido",
        onboardingProgresso: 100,
        onboardingConcluido: true,
        reciclagemDevida: false,
      },
    ]);
    expect(csv).toContain('"Ana, Silva"');
  });

  it("gera codigo e pdf de certificado", async () => {
    const codigo = codigoCertificado({
      programaId: 4,
      trilhaId: "onboarding",
      versao: EDU_VERSAO,
      nonce: "ab12",
    });
    expect(codigo).toBe("FPSI-4-ONBOARDI-202611-AB12");
    const pdf = await buildCertificadoPdf({
      nome: "Joao da Silva",
      trilha: "Onboarding LGPD",
      orgao: "Org X",
      codigo,
      emitidoEm: "10/11/2026",
      cargaMinutos: 60,
      versao: EDU_VERSAO,
      notaMinima: 70,
    });
    expect(pdf.byteLength).toBeGreaterThan(500);
  });

  it("a migration cita os ids do catalogo", () => {
    const sql = readFileSync(
      resolve(__dirname, "../../../../supabase/migrations/20261110160000_educacao_lms.sql"),
      "utf8"
    );
    expect(sql).toContain(EDU_VERSAO);
    for (const modulo of MODULOS) expect(sql).toContain(`'${modulo.id}'`);
    for (const trilha of TRILHAS) expect(sql).toContain(`'${trilha.id}'`);
    for (const cartilha of CARTILHAS) expect(sql).toContain(`'${cartilha.id}'`);
    expect(perguntaDaSemana(new Date("2026-11-10")).id).toBeTruthy();
  });
});
