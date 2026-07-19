export type PendenciaTipo =
  | "dsar"
  | "reporte"
  | "contato"
  | "incidente"
  | "risco";

export type PendenciaSeveridade = "info" | "warning" | "critical";

export type PendenciaItem = {
  id: string;
  tipo: PendenciaTipo;
  programaId: number;
  programaNome: string;
  programaSlug: string | null;
  titulo: string;
  subtitulo?: string;
  dataReferencia: string;
  dataLimite?: string | null;
  severidade: PendenciaSeveridade;
  href: string;
  status?: string;
};

export type PendenciasResumo = {
  total: number;
  atrasados: number;
  vencendo7d: number;
  novos: number;
  itens: PendenciaItem[];
};

export type DashboardProgramaResumo = {
  programaId: number;
  nome: string;
  slug: string | null;
  maturidadeMedia: number | null;
  pendenciasTotal: number;
  pendenciasAtrasadas: number;
  dsarAbertos: number;
  incidentesAbertos: number;
  riscosCriticos: number;
};

export type DashboardResumoApi = {
  pendencias: PendenciasResumo;
  programas: DashboardProgramaResumo[];
  kpis: {
    programasAtivos: number;
    dsarAbertos: number;
    incidentesAbertos: number;
    reportesNovos: number;
    riscosCriticos: number;
  };
};
