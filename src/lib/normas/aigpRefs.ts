/**
 * Referências de Governança de IA / AIGP — consulta no FPSI (resumo + links oficiais).
 * Textos oficiais completos (ISO paga, BoK IAPP) ficam nos sites; aqui oferecemos
 * orientação operacional e atalho confiável, no mesmo espírito da consulta à LGPD.
 */

export type AigpRefLink = {
  label: string;
  url: string;
};

export type AigpFrameworkRef = {
  id: string;
  /** Rótulo curto no chip / lista */
  label: string;
  /** Título no painel */
  title: string;
  /** Resumo operacional (PT) */
  summary: string;
  /** Pontos-chave para consulta rápida */
  bullets: string[];
  /** Como usar no diagnóstico FPSI */
  usoNoFpsi: string;
  links: AigpRefLink[];
  /** Testa se o segmento de "Normas de referência" / "Referências" cita este framework */
  match: (segment: string) => boolean;
};

function n(s: string): string {
  return s.replace(/\*+/g, " ").replace(/\s+/g, " ").trim();
}

export const AIGP_FRAMEWORKS: AigpFrameworkRef[] = [
  {
    id: "aigp",
    label: "AIGP (IAPP)",
    title: "AIGP — Artificial Intelligence Governance Professional (IAPP)",
    summary:
      "Corpo de conhecimento da IAPP para profissionais de governança de IA: accountability, risco, privacidade, ética, fornecedores e conformidade. No FPSI, o domínio GOVERNANÇA DE IA foi desenhado com essa lente operacional (não é certificação oficial embutida).",
    bullets: [
      "Accountability e papéis claros no ciclo de vida de IA",
      "Interseção privacy × AI (bases legais, decisões automatizadas, contratos)",
      "Gestão de fornecedores e modelos fundacionais",
      "Demonstrabilidade: evidências, auditoria e melhoria contínua",
    ],
    usoNoFpsi:
      "Use os controles 26–35 do diagnóstico AIGP como checklist de maturidade. A certificação AIGP da IAPP é independente; este módulo é material de apoio ao programa.",
    links: [
      { label: "IAPP — Artificial Intelligence Governance", url: "https://iapp.org/resources/article/artificial-intelligence-governance/" },
      { label: "IAPP — Certificação AIGP", url: "https://iapp.org/certify/aigp/" },
    ],
    match: (segment) => {
      const s = n(segment);
      if (/\biso\b/i.test(s) && /42001/.test(s)) return false;
      if (/\bnist\b/i.test(s)) return false;
      return /\baigp\b/i.test(s) || /\biapp\b/i.test(s);
    },
  },
  {
    id: "iso42001",
    label: "ISO/IEC 42001",
    title: "ISO/IEC 42001 — Artificial Intelligence Management System (AIMS)",
    summary:
      "Norma internacional de sistema de gestão de IA: liderança, política, avaliação de riscos/impactos, operação, monitoramento e melhoria. O texto normativo completo é comercial (ISO); o FPSI aponta o hub oficial e alinha controles ao espírito do AIMS.",
    bullets: [
      "Política e objetivos do AIMS aprovados pela liderança",
      "Avaliação de riscos e de impactos de sistemas de IA",
      "Controles no ciclo de vida (aquisição, desenvolvimento, uso, retire)",
      "Competência, documentação e auditoria interna",
    ],
    usoNoFpsi:
      "Controles de política (28), risco (29), ciclo de vida (35) e accountability (26) cobrem a espinha dorsal do AIMS. Para certificação formal, use o texto oficial ISO + auditor.",
    links: [
      { label: "ISO — ISO/IEC 42001:2023 (catálogo)", url: "https://www.iso.org/standard/81230.html" },
      { label: "ISO — Inteligência artificial (tema)", url: "https://www.iso.org/sectors/information-communication-technologies/artificial-intelligence" },
    ],
    match: (segment) => {
      const s = n(segment);
      return /42001/.test(s) || (/\biso\b/i.test(s) && /\baims\b/i.test(s));
    },
  },
  {
    id: "nist-ai-rmf",
    label: "NIST AI RMF",
    title: "NIST AI Risk Management Framework (AI RMF 1.0)",
    summary:
      "Framework voluntário do NIST para gerir riscos de IA com quatro funções: Govern, Map, Measure e Manage. No catálogo FPSI, o campo funcao_nist_csf das medidas AIGP usa essas funções.",
    bullets: [
      "GOVERN — cultura, papéis, políticas e accountability",
      "MAP — contexto, inventário, classificação e impacto",
      "MEASURE — métricas, testes, fairness, robustez",
      "MANAGE — priorização, mitigação, monitoramento e resposta",
    ],
    usoNoFpsi:
      "Filtre ou leia as medidas pelo rótulo GOVERN/MAP/MEASURE/MANAGE. O iAIGP resume maturidade; o RMF orienta a sequência de trabalho.",
    links: [
      { label: "NIST — AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
      {
        label: "AI RMF 1.0 (PDF)",
        url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
      },
      {
        label: "AI RMF Playbook",
        url: "https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook",
      },
    ],
    match: (segment) => {
      const s = n(segment);
      if (/cyberframework|csf\s*2|nist\.?sp\s*800/i.test(s) && !/\bai\b/i.test(s)) return false;
      return (
        /\bnist\s+ai\s+rmf\b/i.test(s) ||
        /\bai\s+rmf\b/i.test(s) ||
        (/\bnist\b/i.test(s) && (/\bai\b/i.test(s) || /\brmf\b/i.test(s)))
      );
    },
  },
  {
    id: "oecd",
    label: "OECD AI Principles",
    title: "Princípios de IA da OCDE (OECD AI Principles)",
    summary:
      "Princípios intergovernamentais de IA confiável: crescimento inclusivo, valores humanos e equidade, transparência, robustez/segurança e accountability. Base comum para políticas públicas e frameworks corporativos.",
    bullets: [
      "IA centrada no humano e direitos fundamentais",
      "Transparência e explicabilidade proporcionais",
      "Robustez, segurança e salvaguardas",
      "Accountability dos atores no ecossistema de IA",
    ],
    usoNoFpsi:
      "Princípios aparecem sobretudo nos controles de política (28), transparência (31) e impacto humano (34).",
    links: [
      { label: "OECD — AI Principles", url: "https://oecd.ai/en/ai-principles" },
      { label: "OECD.AI Policy Observatory", url: "https://oecd.ai/en/" },
    ],
    match: (segment) => /\boecd\b/i.test(n(segment)),
  },
  {
    id: "eu-ai-act",
    label: "EU AI Act",
    title: "Regulamento Europeu de IA (EU AI Act) — referência",
    summary:
      "Lei da UE baseada em risco (proibições, alto risco, obrigações de transparência etc.). Não é lei brasileira; no FPSI serve como referência de classificação de risco e deveres proporcionais.",
    bullets: [
      "Abordagem baseada em risco (proibido / alto / limitado / mínimo)",
      "Obrigações reforçadas para sistemas de alto risco",
      "Transparência para interações e conteúdo sintético",
      "Governança e vigilância de mercado na UE",
    ],
    usoNoFpsi:
      "Use na classificação de inventário (controle 27) e em avaliações de impacto (29). Sempre confronte com LGPD e normas nacionais aplicáveis.",
    links: [
      {
        label: "EUR-Lex — Regulamento (UE) 2024/1689",
        url: "https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024R1689",
      },
      {
        label: "Comissão Europeia — AI Act (hub)",
        url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
      },
    ],
    match: (segment) => {
      const s = n(segment);
      return /\beu\s+ai\s+act\b/i.test(s) || /\bai\s+act\b/i.test(s) || /\bregulamento\s+.*ia\b/i.test(s);
    },
  },
  {
    id: "owasp-llm",
    label: "OWASP LLM Top 10",
    title: "OWASP Top 10 for LLM Applications",
    summary:
      "Lista de riscos de segurança mais críticos em aplicações com modelos de linguagem (prompt injection, vazamento de dados, supply chain, overreliance etc.).",
    bullets: [
      "Prompt injection e jailbreak",
      "Divulgação de dados sensíveis via modelo",
      "Supply chain e plugins inseguros",
      "Overreliance e alucinações com impacto operacional",
    ],
    usoNoFpsi:
      "Controle 32 (segurança, robustez e monitoramento) referencia testes proporcionais ao risco alinhados a este Top 10.",
    links: [
      { label: "OWASP — LLM Top 10", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/" },
    ],
    match: (segment) => /\bowasp\b/i.test(n(segment)) && /\bllm\b/i.test(n(segment)),
  },
  {
    id: "ppsi",
    label: "PPSI 2.0",
    title: "PPSI 2.0 — Programa de Privacidade e Segurança da Informação",
    summary:
      "Framework brasileiro (Governo Digital) de privacidade e segurança da informação. O FPSI implementa o catálogo PPSI; o domínio AIGP é complementar e deve integrar-se à governança, SI e privacidade já avaliadas.",
    bullets: [
      "Diagnósticos: Estrutura, Segurança e Privacidade",
      "Controles e medidas com maturidade e planos de ação",
      "Integração com ROPA, RIPD, incidentes e políticas",
      "AIGP articula riscos de IA com o mesmo programa",
    ],
    usoNoFpsi:
      "Não substitua o PPSI pelo AIGP: use ambos. Riscos de IA com dados pessoais devem refletir no diagnóstico de Privacidade e nos instrumentos LGPD.",
    links: [
      {
        label: "Governo Digital — PPSI 2.0",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
      },
      {
        label: "Guia do Framework (página PPSI)",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
      },
    ],
    match: (segment) => /\bppsi\b/i.test(n(segment)),
  },
  {
    id: "lgpd-ia",
    label: "LGPD × IA",
    title: "LGPD aplicável a sistemas de IA",
    summary:
      "Quando a IA trata dados pessoais ou toma decisões automatizadas, a LGPD continua sendo a lei de proteção de dados. Artigos frequentes no catálogo AIGP: 6º (princípios), 7º/11 (bases), 20 (decisões automatizadas), 37–38 (registro e RIPD), 46 (segurança).",
    bullets: [
      "Base legal e finalidade também para treino/inferência/logs",
      "Art. 20 — revisão de decisões unicamente automatizadas",
      "RIPD quando o risco ao titular for elevado",
      "Contratos com operadores/fornecedores de IA",
    ],
    usoNoFpsi:
      "No chip da medida, trechos LGPD com artigos abrem o texto integral (consulta LGPD). Use também a página Referência LGPD do menu.",
    links: [
      {
        label: "LGPD compilada (Planalto)",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm",
      },
      { label: "Consulta LGPD no FPSI", url: "/referencias/lgpd" },
    ],
    match: () => false, // LGPD já tem fluxo próprio; entrada listada na página AIGP
  },
];

/** Frameworks exibidos na página/drawer de consulta (inclui LGPD×IA). */
export function listAigpFrameworksForBrowse(): AigpFrameworkRef[] {
  return AIGP_FRAMEWORKS;
}

export function findAigpFrameworkById(id: string): AigpFrameworkRef | undefined {
  return AIGP_FRAMEWORKS.find((f) => f.id === id);
}

/**
 * Resolve o framework AIGP citado em um segmento de normas/referências.
 * Ordem: matches mais específicos primeiro (ISO 42001, OWASP LLM, etc.).
 */
export function resolveAigpFramework(segment: string): AigpFrameworkRef | null {
  const order = [
    "iso42001",
    "owasp-llm",
    "nist-ai-rmf",
    "eu-ai-act",
    "oecd",
    "aigp",
    "ppsi",
  ];
  for (const id of order) {
    const fw = findAigpFrameworkById(id);
    if (fw?.match(segment)) return fw;
  }
  return null;
}

export function isAigpNormaSegment(segment: string): boolean {
  return resolveAigpFramework(segment) != null;
}
