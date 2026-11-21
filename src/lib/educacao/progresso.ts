import type { EduTrilha } from "./catalogo";

export type ProgressoModulo = {
  moduloId: string;
  aprovado: boolean;
  melhorNota: number;
};

export function notaPercentual(acertos: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((acertos / total) * 100);
}

export function aprovadoPelaNota(nota: number, notaMinima: number): boolean {
  return nota >= notaMinima;
}

export type AvaliacaoTrilha = {
  passos: number;
  concluidos: number;
  progresso: number;
  modulosOk: boolean;
  nossaCasaOk: boolean;
  concluida: boolean;
};

/** Progresso da trilha: cada módulo aprovado conta; “Nossa casa” conta como passo extra quando exigida. */
export function avaliarTrilha(input: {
  trilha: Pick<EduTrilha, "moduloIds" | "exigeNossaCasa" | "notaMinima">;
  progresso: ProgressoModulo[];
  nossaCasaLida: boolean;
}): AvaliacaoTrilha {
  const obrigatorios = input.trilha.moduloIds;
  const porId = new Map(input.progresso.map((p) => [p.moduloId, p]));
  const modulosAprovados = obrigatorios.filter((id) => porId.get(id)?.aprovado).length;
  const nossaCasaOk = input.trilha.exigeNossaCasa ? input.nossaCasaLida : true;
  const passos = obrigatorios.length + (input.trilha.exigeNossaCasa ? 1 : 0);
  const concluidos = modulosAprovados + (input.trilha.exigeNossaCasa && input.nossaCasaLida ? 1 : 0);
  const progresso = passos === 0 ? 0 : Math.round((concluidos / passos) * 100);
  const modulosOk = modulosAprovados === obrigatorios.length;
  return {
    passos,
    concluidos,
    progresso,
    modulosOk,
    nossaCasaOk,
    concluida: modulosOk && nossaCasaOk,
  };
}

export function reciclagemDevida(
  concluidoEm: string | null | undefined,
  reciclagemMeses: number,
  agora = new Date()
): boolean {
  if (!concluidoEm || reciclagemMeses <= 0) return false;
  const base = new Date(concluidoEm);
  if (Number.isNaN(base.getTime())) return false;
  const limite = new Date(base);
  limite.setMonth(limite.getMonth() + reciclagemMeses);
  return agora.getTime() > limite.getTime();
}

export function prazoConclusao(inicioIso: string, prazoDias: number): string {
  const d = new Date(inicioIso);
  d.setDate(d.getDate() + prazoDias);
  return d.toISOString();
}

export function codigoCertificado(input: {
  programaId: number;
  trilhaId: string;
  versao: string;
  nonce: string;
}): string {
  const trilha = input.trilhaId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase();
  const nonce = input.nonce.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase();
  return `FPSI-${input.programaId}-${trilha}-${input.versao.replace(/\./g, "")}-${nonce}`;
}

export type LinhaCobertura = {
  userId: string;
  nome: string;
  onboardingStatus: string;
  onboardingProgresso: number;
  onboardingConcluido: boolean;
  reciclagemDevida: boolean;
};

export function resumirCobertura(linhas: Pick<LinhaCobertura, "onboardingConcluido">[]): {
  total: number;
  concluidos: number;
  percentual: number;
} {
  const total = linhas.length;
  const concluidos = linhas.filter((l) => l.onboardingConcluido).length;
  const percentual = total === 0 ? 0 : Math.round((concluidos / total) * 100);
  return { total, concluidos, percentual };
}

export function coberturaCsv(linhas: LinhaCobertura[]): string {
  const header = "nome,user_id,status_onboarding,progresso,concluido,reciclagem_devida";
  const body = linhas.map((l) =>
    [
      csvCell(l.nome),
      csvCell(l.userId),
      csvCell(l.onboardingStatus),
      String(l.onboardingProgresso),
      l.onboardingConcluido ? "sim" : "nao",
      l.reciclagemDevida ? "sim" : "nao",
    ].join(",")
  );
  return [header, ...body].join("\n");
}

function csvCell(value: string): string {
  const v = value.replaceAll('"', '""');
  return /[",\n]/.test(v) ? `"${v}"` : v;
}
