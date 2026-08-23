/** Formato sanitizado do portal do auditor (sem PII de titulares, sem conteúdo de evidência). */

export type AuditorKpis = {
  maturidadeMedia: number | null;
  riscosCriticos: number;
  incidentesAbertos: number;
  evidencias: number;
  decisoes: number;
  politicasPublicadas: number;
  ropaOperacoes: number;
  mapeamentos: number;
  ripds: number;
  planosAbertos: number;
  ciencias: number;
  pedidosTitularesAbertos: number;
};

export type AuditorVinculo = {
  tipo: string;
  rotulo: string;
  contexto?: string;
  norma?: string;
};

export type AuditorDiagnostico = {
  diagnosticoId: number;
  nome: string;
  indice: string;
  score: number | null;
  nivel: string;
};

export type AuditorCampo = {
  rotulo: string;
  valor: string;
};

export type AuditorListaItem = {
  id: string | number;
  titulo: string;
  detalhe?: string;
  descricao?: string;
  status?: string;
  data?: string | null;
  categoria?: string;
  tags?: string[];
  vinculos?: AuditorVinculo[];
  campos?: AuditorCampo[];
  /** Auditor pode baixar o arquivo pelo token do portal. */
  baixavel?: boolean;
  arquivoTipo?: "arquivo" | "link";
};

export type AuditorPortalPayload = {
  ok: true;
  programa: {
    nome: string;
    slug?: string | null;
    dpoNome?: string | null;
    dpoEmail?: string | null;
  };
  expires_at: string;
  resumo: AuditorKpis;
  diagnosticos: AuditorDiagnostico[];
  evidencias: AuditorListaItem[];
  politicas: AuditorListaItem[];
  ropa: AuditorListaItem[];
  ripds: AuditorListaItem[];
  riscos: AuditorListaItem[];
  incidentes: AuditorListaItem[];
  decisoes: AuditorListaItem[];
  timeline: AuditorListaItem[];
  planos: AuditorListaItem[];
  ciencias: AuditorListaItem[];
};

const BLOQUEADOS = new Set([
  "conteudo_base64",
  "arquivo_bytes",
  "email_titular",
  "cpf",
  "nome_titular",
  "telefone_titular",
  "ip",
  "user_agent",
]);

export function emptyAuditorKpis(): AuditorKpis {
  return {
    maturidadeMedia: null,
    riscosCriticos: 0,
    incidentesAbertos: 0,
    evidencias: 0,
    decisoes: 0,
    politicasPublicadas: 0,
    ropaOperacoes: 0,
    mapeamentos: 0,
    ripds: 0,
    planosAbertos: 0,
    ciencias: 0,
    pedidosTitularesAbertos: 0,
  };
}

/** Remove campos que não podem ir ao portal público (token). */
export function sanitizeAuditorRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (BLOQUEADOS.has(k)) continue;
    if (/titular|cpf|rg\b|senha|token|base64/i.test(k)) continue;
    out[k] = v;
  }
  return out;
}

export function pickCampos(
  row: Record<string, unknown>,
  pairs: Array<[key: string, rotulo: string]>,
  max = 600
): AuditorCampo[] {
  const out: AuditorCampo[] = [];
  for (const [key, rotulo] of pairs) {
    const v = row[key];
    if (v == null) continue;
    const t = String(v).replace(/\s+/g, " ").trim();
    if (!t) continue;
    out.push({ rotulo, valor: t.length > max ? `${t.slice(0, max - 1)}…` : t });
  }
  return out;
}

export function toListaItem(
  row: Record<string, unknown>,
  tituloKeys: string[],
  detalheKeys?: string[],
  statusKey = "status",
  dataKeys: string[] = ["created_at", "updated_at", "data_decisao", "ocorrido_em"]
): AuditorListaItem {
  const pick = (keys: string[]) => {
    for (const k of keys) {
      const v = row[k];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return "";
  };
  return {
    id: (row.id as string | number) ?? pick(["id"]),
    titulo: pick(tituloKeys) || "—",
    detalhe: detalheKeys?.length ? pick(detalheKeys) || undefined : undefined,
    status: pick([statusKey]) || undefined,
    data: pick(dataKeys) || null,
  };
}

export function mediaScores(scores: number[]): number | null {
  const nums = scores.filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
