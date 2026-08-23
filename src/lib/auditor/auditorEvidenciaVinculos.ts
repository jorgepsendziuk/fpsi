import type { AuditorDiagnostico, AuditorVinculo } from "./auditorPortal";
import { DIAGNOSTICO_INDICE_LABELS, DIAGNOSTICO_TREE_LABELS } from "../utils/diagnosticoTreeLabels";

const TIPO_ROTULO: Record<string, string> = {
  medida: "Medida",
  programa_medida: "Medida",
  controle: "Controle",
  risco: "Risco",
  politica: "Política",
  sistema_ia: "Sistema de IA",
  plano_acao: "Plano de ação",
  incidente: "Incidente",
  ripd: "RIPD",
  outro: "Vínculo",
};

export function rotuloTipoAlvo(tipo: string): string {
  return TIPO_ROTULO[tipo] || "Vínculo";
}

export function indiceDiagnostico(id: number): string {
  return DIAGNOSTICO_INDICE_LABELS[id] ?? `D${id}`;
}

export function nomeDiagnostico(id: number, descricao?: string | null): string {
  return DIAGNOSTICO_TREE_LABELS[id] ?? descricao?.trim() ?? `Diagnóstico ${id}`;
}

function trunc(s: string, max = 140): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export type MedidaLookup = {
  codigo?: string | null;
  texto?: string | null;
  controleNumero?: string | number | null;
  controleNome?: string | null;
  diagnosticoId?: number | null;
  diagnosticoNome?: string | null;
};

export type ControleLookup = {
  numero?: string | number | null;
  nome?: string | null;
  diagnosticoId?: number | null;
};

/** Monta o rótulo que o auditor precisa ver: medida/controle/diagnóstico — não só o arquivo. */
export function vinculoFromMedida(m: MedidaLookup): AuditorVinculo {
  const codigo = String(m.codigo || "").trim();
  const ctrl = m.controleNumero != null && String(m.controleNumero).trim() !== ""
    ? String(m.controleNumero).trim()
    : "";
  const diag = m.diagnosticoId
    ? `${indiceDiagnostico(m.diagnosticoId)}${m.diagnosticoNome ? ` · ${m.diagnosticoNome}` : ""}`
    : undefined;
  const rotulo = [
    codigo ? `Medida ${codigo}` : "Medida",
    ctrl ? `controle ${ctrl}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const contextoParts = [
    m.controleNome ? `Controle: ${m.controleNome}` : null,
    m.texto ? trunc(String(m.texto)) : null,
  ].filter(Boolean);
  return {
    tipo: "medida",
    rotulo,
    contexto: contextoParts.join(" — ") || undefined,
    norma: diag,
  };
}

export function vinculoFromControle(c: ControleLookup): AuditorVinculo {
  const num = c.numero != null ? String(c.numero).trim() : "";
  return {
    tipo: "controle",
    rotulo: num ? `Controle ${num}` : "Controle",
    contexto: c.nome ? String(c.nome) : undefined,
    norma: c.diagnosticoId ? indiceDiagnostico(c.diagnosticoId) : undefined,
  };
}

export function vinculoGenerico(
  tipo: string,
  titulo?: string | null,
  extra?: string | null
): AuditorVinculo {
  const t = String(titulo || "").trim();
  return {
    tipo,
    rotulo: t ? `${rotuloTipoAlvo(tipo)} · ${trunc(t, 72)}` : rotuloTipoAlvo(tipo),
    contexto: extra ? trunc(extra) : undefined,
  };
}

const EIXOS_PPSI = [1, 2, 3, 4];

/** Garante iMC₀ / iSeg / iPriv / iAIGP mesmo quando a view não devolve os quatro. */
export function completarDiagnosticosEixos(
  rows: AuditorDiagnostico[],
  nomeById?: Map<number, string>
): AuditorDiagnostico[] {
  const byId = new Map(rows.map((d) => [d.diagnosticoId, d]));
  const ids = new Set([...EIXOS_PPSI, ...rows.map((d) => d.diagnosticoId)]);
  return [...ids]
    .sort((a, b) => a - b)
    .map(
      (id) =>
        byId.get(id) ?? {
          diagnosticoId: id,
          nome: nomeDiagnostico(id, nomeById?.get(id)),
          indice: indiceDiagnostico(id),
          score: null,
          nivel: "—",
        }
    );
}
