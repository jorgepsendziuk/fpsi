/**
 * Carrossel vertical do 1º post LinkedIn — /divulgacao/first
 * Proporção 9:16 (captura / PDF A4 estreito).
 */

export type FirstPostSlide = {
  id: string;
  eyebrow: string;
  title: string;
  tone: "ink" | "lock" | "shield" | "blue";
  /** Fundo: 1.png Auto ANPD | 2.jpg Portal | 3.jpg Dashboard */
  backdrop: "anpd" | "portal" | "diag";
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
      "Encarregado (DPO) identificado, com contato claro",
      "Canal fácil para o titular exercer direitos (art. 18)",
      "Pedidos com prazo, responsável e resposta registrada",
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
    id: "programa",
    eyebrow: "E o programa cresce com você",
    title: "Do canal ao controle completo",
    tone: "shield",
    backdrop: "diag",
    bullets: [
      "Diagnóstico PPSI 2.0 + Governança de IA",
      "Mapeamento de dados",
      "Registro de Operações",
      "Plano de ação",
      "Políticas",
      "Incidentes",
      "Tudo no mesmo programa — do portal ao relatório executivo",
    ],
    footer: "É grátis. É open source. Precisa de ajuda na implantação? Fala comigo.",
  },
];
