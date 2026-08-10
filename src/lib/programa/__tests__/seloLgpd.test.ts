import { describe, expect, it } from "vitest";
import {
  isSeloGreyed,
  metalFromMaturidadeMedia,
  planoFromPreset,
  resolveSeloLgpd,
} from "@/lib/programa/seloLgpd";

describe("seloLgpd", () => {
  it("mapeia presets para planos do selo", () => {
    expect(planoFromPreset("essencial")).toBe("essencial");
    expect(planoFromPreset("completo")).toBe("completo");
    expect(planoFromPreset("com_ia")).toBe("ia_plus");
    expect(planoFromPreset("custom")).toBe("completo");
  });

  it("define metal pela média de maturidade", () => {
    expect(metalFromMaturidadeMedia(0.2)).toBe("bronze");
    expect(metalFromMaturidadeMedia(0.33)).toBe("bronze");
    expect(metalFromMaturidadeMedia(0.34)).toBe("prata");
    expect(metalFromMaturidadeMedia(0.66)).toBe("prata");
    expect(metalFromMaturidadeMedia(0.67)).toBe("ouro");
    expect(metalFromMaturidadeMedia(0.95)).toBe("ouro");
    expect(metalFromMaturidadeMedia(70)).toBe("ouro"); // legado 0–100
  });

  it("marca greyed quando score é 0 ou nulo", () => {
    expect(isSeloGreyed(null)).toBe(true);
    expect(isSeloGreyed(undefined)).toBe(true);
    expect(isSeloGreyed(0)).toBe(true);
    expect(isSeloGreyed(0.01)).toBe(false);
  });

  it("resolve selo com bronze quando greyed (nível de partida)", () => {
    const r = resolveSeloLgpd({ preset: "essencial", maturidadeMedia: 0 });
    expect(r.greyed).toBe(true);
    expect(r.plano).toBe("essencial");
    expect(r.metal).toBe("bronze");
    expect(r.displayMetal).toBe("bronze");
  });

  it("resolve Completo ouro com média alta", () => {
    const r = resolveSeloLgpd({ preset: "completo", maturidadeMedia: 0.82 });
    expect(r.greyed).toBe(false);
    expect(r.plano).toBe("completo");
    expect(r.metal).toBe("ouro");
  });

  it("resolve IA+ prata", () => {
    const r = resolveSeloLgpd({ preset: "com_ia", maturidadeMedia: 0.55 });
    expect(r.plano).toBe("ia_plus");
    expect(r.planoDef.label).toBe("IA+");
    expect(r.metal).toBe("prata");
  });
});
