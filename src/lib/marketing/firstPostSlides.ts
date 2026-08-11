/**
 * Carrossel vertical do 1º post LinkedIn — /divulgacao/first
 * Proporção 9:16 (captura / PDF A4 estreito).
 */

export type FirstPostSlide = {
  id: string;
  eyebrow: string;
  title: string;
  tone: "ink" | "lock" | "shield" | "blue";
  /** Fundo: 1 Auto ANPD | 2 Portal | 3 Diagnóstico | 4 Dashboard */
  backdrop: "anpd" | "portal" | "dash" | "diagnostico";
  bullets?: string[];
  checklist?: string[];
  footer?: string;
};

export const FIRST_POST_SLIDE_MS = 6500;

export const FIRST_POST_SLIDES: FirstPostSlide[] = [
  {
    id: "risco",
    eyebrow: "LGPD · ANPD em ação",
    title: "O risco já é concreto",
    tone: "lock",
    backdrop: "anpd",
    bullets: [
      "A ANPD monitorou 56 organizações (órgãos e empresas) sobre encarregado e canal de atendimento ao titular — quem não regulariza pode ir a sanção.",
      "Custo médio de um vazamento no Brasil: R$ 7,19 mi (IBM, 2025).",
      "Multa: até 2% do faturamento, limitada a R$ 50 mi por infração.",
    ],
    checklist: [
      "Identificação e contatos da instituição e do encarregado (arts. 9º e 41)",
      "Canal de comunicação para o exercício dos direitos do titular (arts. 18 e 41)",
      "Pedidos com prazo, responsável e resposta registrada (art. 18; art. 6º, X)",
    ],
  },
  {
    id: "portal",
    eyebrow: "FPSI · grátis & open source",
    title: "Comece pelo Portal do Titular",
    tone: "blue",
    backdrop: "portal",
    bullets: [
      "Cria o Portal do Titular no endereço da organização",
      "Publica avisos e políticas com DPO visível",
      "Recebe e acompanha pedidos de titulares no sistema",
      "Inicia o programa de privacidade com trilha de auditoria",
    ],
    footer:
      "Ajuda a cobrir o básico operacional que a ANPD já fiscaliza — canal ativo, não só PDF no site.",
  },
  {
    id: "diagnostico",
    eyebrow: "Diagnóstico · PPSI 2.0",
    title: "Maturidade por controle",
    tone: "shield",
    backdrop: "diagnostico",
    bullets: [
      "Estrutura, Segurança, Privacidade e Governança de IA",
      "Resposta por medida, evidências anexadas e plano de trabalho",
      "Responsável, prazos e normas de referência (LGPD, CIS, ISO…)",
      "Índices de maturidade atualizados conforme você avança",
    ],
    footer: "Do catálogo oficial do PPSI 2.0 — na web, com histórico e colaboração.",
  },
  {
    id: "programa",
    eyebrow: "E o programa cresce com você",
    title: "Do canal ao controle completo",
    tone: "blue",
    backdrop: "dash",
    bullets: [
      "Painel com maturidade, pedidos e riscos",
      "Mapeamento de dados e Registro de Operações",
      "Plano de ação, políticas e incidentes",
      "Tudo no mesmo programa — do portal ao relatório executivo",
    ],
    footer: "É grátis. É open source. Precisa de ajuda na implantação? Fala comigo.",
  },
];
