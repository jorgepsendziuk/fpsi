/**
 * Créditos de autoria e fontes oficiais usadas no FPSI.
 * Textos e URLs para atribuição elegante (modal / rodapé) — não substituem consulta normativa.
 */

export type CreditLink = {
  label: string;
  url: string;
};

export type CreditSource = {
  id: string;
  title: string;
  /** Papel da fonte no FPSI */
  role: string;
  /** Nota de atribuição / disclaimer curto */
  note?: string;
  links: CreditLink[];
};

export const FPSI_GITHUB_URL = "https://github.com/jorgepsendziuk/fpsi";
export const GEOAPPS_URL = "https://geoapps.com.br";
export const JORGE_PORTFOLIO_URL = "https://geoapps.com.br/jorge";
export const JORGE_GITHUB_URL = "https://github.com/jorgepsendziuk";
export const JORGE_LINKEDIN_URL = "https://www.linkedin.com/in/jorge-psendziuk";

export const FPSI_AUTHORSHIP = {
  projectName: "FPSI",
  projectFullName: "Framework de Privacidade e Segurança da Informação",
  authorName: "Jorge Felipe Roman Psendziuk",
  authorShort: "Jorge Psendziuk",
  orgName: "GeoApps",
  orgUrl: GEOAPPS_URL,
  logoSrc: "/branding/geoapps-logo.png",
  githubUrl: FPSI_GITHUB_URL,
  license: "MIT",
  year: 2026,
} as const;

/** Fontes legais e institucionais brasileiras. */
export const CREDIT_FONTES_LEGAIS: CreditSource[] = [
  {
    id: "lgpd",
    title: "LGPD — Lei nº 13.709/2018",
    role: "Lei Geral de Proteção de Dados Pessoais (texto compilado).",
    note: "Fonte oficial do Planalto. O FPSI oferece consulta educativa; o texto legal prevalece.",
    links: [
      {
        label: "LGPD compilada (Planalto)",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm",
      },
    ],
  },
  {
    id: "ppsi",
    title: "PPSI 2.0 — Programa e Guia do Framework",
    role: "Programa de Privacidade e Segurança da Informação (MGI / Governo Digital).",
    note: "O FPSI é implementação open source alinhada ao Guia e ao catálogo oficiais — não é software oficial do governo.",
    links: [
      {
        label: "Governo Digital — PPSI 2.0",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
      },
    ],
  },
  {
    id: "anpd",
    title: "ANPD — Agência Nacional de Proteção de Dados",
    role: "Resoluções, enunciados e orientações da autoridade nacional.",
    links: [
      {
        label: "Resoluções do Conselho Diretor",
        url: "https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/resolucoes_cd",
      },
      {
        label: "Enunciados ANPD",
        url: "https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/enunciados-anpd",
      },
    ],
  },
];

/** Frameworks e padrões que embasam o catálogo PPSI / AIGP no produto. */
export const CREDIT_FRAMEWORKS: CreditSource[] = [
  {
    id: "cis",
    title: "CIS Controls",
    role: "Controles de segurança da informação (referência do Guia PPSI 2.0 / priorização).",
    note: "Marca e materiais © Center for Internet Security. Uso referencial no alinhamento metodológico.",
    links: [{ label: "CIS Controls", url: "https://www.cisecurity.org/controls" }],
  },
  {
    id: "nist-csf",
    title: "NIST Cybersecurity Framework (CSF)",
    role: "Funções e vocabulário de cibersegurança referenciados no diagnóstico.",
    note: "Material do NIST (domínio público nos EUA). Atribuição recomendada ao citar o framework.",
    links: [{ label: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" }],
  },
  {
    id: "iso27001",
    title: "ISO/IEC 27001",
    role: "Sistema de gestão de segurança da informação — referência normativa internacional.",
    note: "Norma comercial da ISO; o FPSI aponta o catálogo oficial, sem reproduzir o texto normativo.",
    links: [{ label: "ISO — ISO/IEC 27001", url: "https://www.iso.org/standard/27001" }],
  },
  {
    id: "aigp",
    title: "AIGP (IAPP)",
    role: "Corpo de conhecimento de governança de IA que inspira o domínio AIGP do FPSI.",
    note: "AIGP® e materiais correlatos são da IAPP. Este módulo não constitui certificação oficial.",
    links: [
      { label: "IAPP — Certificação AIGP", url: "https://iapp.org/certify/aigp/" },
      {
        label: "IAPP — Artificial Intelligence Governance",
        url: "https://iapp.org/resources/article/artificial-intelligence-governance/",
      },
    ],
  },
  {
    id: "nist-ai-rmf",
    title: "NIST AI Risk Management Framework",
    role: "Funções GOVERN / MAP / MEASURE / MANAGE no diagnóstico de governança de IA.",
    links: [
      {
        label: "NIST AI RMF",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
      },
      {
        label: "AI RMF 1.0 (PDF)",
        url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
      },
    ],
  },
  {
    id: "iso42001",
    title: "ISO/IEC 42001",
    role: "Sistema de gestão de IA (AIMS) — referência de alinhamento dos controles AIGP.",
    note: "Norma comercial da ISO; hub oficial apenas.",
    links: [{ label: "ISO — ISO/IEC 42001", url: "https://www.iso.org/standard/81230.html" }],
  },
  {
    id: "oecd",
    title: "OECD AI Principles",
    role: "Princípios intergovernamentais de IA confiável.",
    links: [{ label: "OECD AI Principles", url: "https://oecd.ai/en/ai-principles" }],
  },
  {
    id: "eu-ai-act",
    title: "EU AI Act",
    role: "Regulamento (UE) 2024/1689 — referência comparada de classificação de risco (não é lei brasileira).",
    links: [
      {
        label: "EUR-Lex — Regulamento (UE) 2024/1689",
        url: "https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32024R1689",
      },
    ],
  },
  {
    id: "owasp-llm",
    title: "OWASP Top 10 for LLM Applications",
    role: "Riscos de segurança em aplicações com modelos de linguagem.",
    links: [
      {
        label: "OWASP LLM Top 10",
        url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
      },
    ],
  },
];

export const CREDIT_DISCLAIMER =
  "O FPSI é software livre de referência, mantido de forma independente. Não é produto oficial do Governo Federal, da ANPD, da IAPP, do CIS, do NIST, da ISO ou de quaisquer outros órgãos e entidades citados. Os nomes e marcas pertencem aos respectivos titulares e são mencionados apenas para atribuição de fontes e alinhamento metodológico.";
