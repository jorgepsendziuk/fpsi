/**
 * Referências do PPSI 2.0 — consulta no FPSI (resumo + links oficiais).
 * Espelha a página de Governança de IA: orientação operacional e atalho confiável.
 */

export type PpsiRefLink = {
  label: string;
  url: string;
};

export type PpsiFrameworkRef = {
  id: string;
  label: string;
  title: string;
  summary: string;
  bullets: string[];
  usoNoFpsi: string;
  links: PpsiRefLink[];
};

export const PPSI_FRAMEWORKS: PpsiFrameworkRef[] = [
  {
    id: "ppsi-2",
    label: "PPSI 2.0",
    title: "PPSI 2.0 — Programa de Privacidade e Segurança da Informação",
    summary:
      "Metodologia pública do Governo Federal (SGD) para maturidade em privacidade e segurança da informação. Organiza controles e medidas em três eixos — Estrutura, Segurança da Informação e Privacidade — com indicadores (iMC, iPriv) e guias complementares. O FPSI usa o PPSI 2.0 como espinha dorsal do diagnóstico e do plano de trabalho.",
    bullets: [
      "Controles de estruturação (papéis, instrumentos, políticas PGSI/PGP)",
      "Controles CIS adaptados ao setor público (ativos, software, dados, contas…)",
      "Domínio de privacidade alinhado à LGPD e à ANPD",
      "Indicadores de maturidade e melhoria contínua",
    ],
    usoNoFpsi:
      "O diagnóstico do programa avalia medidas do catálogo PPSI 2.0. Use esta página para entender a fonte; no programa, avance pelo Diagnóstico, Políticas e Estrutura de Governança.",
    links: [
      {
        label: "Governo Digital — PPSI 2.0",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
      },
      {
        label: "Portal Gov.br — Privacidade e Segurança",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca",
      },
    ],
  },
  {
    id: "estrutura",
    label: "Estrutura / Governança",
    title: "Eixo Estrutura — papéis e instrumentos",
    summary:
      "Base do PPSI: formalizar quem conduz o programa (alta administração, gestores, responsáveis setoriais), comitês e instrumentos (PGSI, PGP, gestão de riscos e continuidade). Sem essa base, os controles técnicos e de privacidade ficam órfãos.",
    bullets: [
      "Papéis PPSI e cadeia de responsabilidade (RACI)",
      "Programas e políticas institucionais (PGSI / PGP)",
      "Gestão de riscos e continuidade em SI",
      "Reporte periódico à alta administração",
    ],
    usoNoFpsi:
      "Módulo Estrutura de Governança e políticas do programa cobrem esse eixo. Medidas 0.x do diagnóstico Estrutura pedem evidências desses papéis e documentos.",
    links: [
      {
        label: "PPSI 2.0 — materiais oficiais",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
      },
      { label: "Consulta LGPD no FPSI", url: "/referencias/lgpd" },
    ],
  },
  {
    id: "cis",
    label: "CIS Controls",
    title: "CIS Controls — base dos controles de Segurança",
    summary:
      "O PPSI 2.0 incorpora e adapta os CIS Controls (Center for Internet Security) ao contexto brasileiro e ao setor público. Inventário de ativos, software autorizado, proteção de dados, configuração segura, gestão de contas e demais controles de SI seguem essa lógica priorizada.",
    bullets: [
      "Grupos de implementação (GI) para priorizar o que fazer primeiro",
      "Foco em ações mensuráveis e evidências",
      "Complementos para nuvem, mobile e IoT",
      "Alinhamento com NIST e ISO em vários pontos",
    ],
    usoNoFpsi:
      "No diagnóstico de Segurança da Informação, as medidas citam CIS e guias complementares. Use o plano de trabalho para priorizar por grupo de implementação.",
    links: [
      { label: "CIS Controls", url: "https://www.cisecurity.org/controls" },
      {
        label: "CIS — guias por ambiente",
        url: "https://www.cisecurity.org/controls/resources?crc=environment-specific-guidance",
      },
    ],
  },
  {
    id: "nist-csf",
    label: "NIST CSF",
    title: "NIST Cybersecurity Framework",
    summary:
      "Framework voluntário de cibersegurança (Identify, Protect, Detect, Respond, Recover). O PPSI e várias medidas de SI dialogam com o CSF e com publicações NIST (ex.: sanitização de mídia, identidade digital).",
    bullets: [
      "Funções: Identify → Protect → Detect → Respond → Recover",
      "Útil para comunicar maturidade à liderança",
      "Complementa CIS com visão de ciclo de risco",
      "Referências técnicas (SP 800-*) em várias medidas",
    ],
    usoNoFpsi:
      "Ao ler normas de referência nas medidas, links NIST abrem a fonte oficial. O iMC do diagnóstico resume maturidade alinhada a essa cultura de melhoria.",
    links: [
      { label: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
      {
        label: "NIST SP 800-88 (sanitização)",
        url: "https://csrc.nist.gov/pubs/sp/800/88/r2/final",
      },
    ],
  },
  {
    id: "iso27001",
    label: "ISO/IEC 27001",
    title: "ISO/IEC 27001 — Sistema de gestão de SI",
    summary:
      "Norma internacional de SGSI (sistema de gestão de segurança da informação). O PPSI não é uma certificação ISO, mas muitos órgãos usam os controles PPSI/CIS como caminho prático em direção a um SGSI formal.",
    bullets: [
      "Política, riscos, controles e melhoria contínua",
      "Anexo A com catálogo de controles",
      "Certificação exige auditoria independente",
      "Complementar ao PPSI, não substituto",
    ],
    usoNoFpsi:
      "Políticas e evidências do programa podem alimentar um SGSI. O FPSI não emite certificado ISO — organiza trabalho e provas do programa PPSI.",
    links: [
      { label: "ISO — ISO/IEC 27001 (catálogo)", url: "https://www.iso.org/standard/27001" },
    ],
  },
  {
    id: "lgpd-anpd",
    label: "LGPD e ANPD",
    title: "LGPD e orientações da ANPD",
    summary:
      "A privacidade no PPSI está ancorada na Lei nº 13.709/2018 e em normas da ANPD (resoluções, guias, fiscalização). Mapeamento, ROPA, RIPD, direitos do titular e incidentes são pilares desse eixo.",
    bullets: [
      "Princípios e bases legais (arts. 6º, 7º, 11)",
      "Encarregado (DPO) e governança (art. 41, Res. CD/ANPD nº 18)",
      "Registro de operações e RIPD quando cabível",
      "Canais e prazos de atendimento ao titular",
    ],
    usoNoFpsi:
      "Use a consulta LGPD do menu, o portal do titular e os módulos de conformidade (ROPA, RIPD, incidentes, pedidos).",
    links: [
      {
        label: "LGPD compilada (Planalto)",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm",
      },
      { label: "ANPD", url: "https://www.gov.br/anpd/pt-br" },
      { label: "Consulta LGPD no FPSI", url: "/referencias/lgpd" },
    ],
  },
  {
    id: "gsi-sgd",
    label: "GSI / SGD",
    title: "Normas GSI/PR e SGD aplicáveis",
    summary:
      "Instruções normativas e portarias do GSI/PR e da Secretaria de Governo Digital sustentam obrigações de SI e privacidade no setor público (continuidade, gestão de riscos, inventários, identidade). O catálogo PPSI cita várias delas nas medidas.",
    bullets: [
      "IN GSI/PR nº 3/2021 e correlatas de SI",
      "Portaria SGD/ME nº 778/2019 e atos SGD",
      "Integração PPSI × política de governo digital",
      "Sempre confira a versão vigente no portal oficial",
    ],
    usoNoFpsi:
      "Nas medidas do diagnóstico, o campo de normas de referência aponta esses atos. Esta página resume o contexto; o texto oficial prevalece.",
    links: [
      {
        label: "PPSI 2.0 (hub oficial)",
        url: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
      },
      {
        label: "Legislação — Governo Digital",
        url: "https://www.gov.br/governodigital/pt-br/legislacao",
      },
    ],
  },
];

export function findPpsiFrameworkById(id: string): PpsiFrameworkRef | undefined {
  return PPSI_FRAMEWORKS.find((f) => f.id === id);
}
