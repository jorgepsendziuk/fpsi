/**
 * Metadados de UI para tipos de política/documento.
 * Fonte de verdade dos templates: tabela politica_modelo (DB).
 * Este catálogo cobre ícones/cores de fallback e agrupamento na lista.
 */

export type PoliticaCatalogMeta = {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  /** Chave de ícone MUI usada na UI */
  iconKey:
    | "privacy"
    | "backup"
    | "lock"
    | "shield"
    | "group"
    | "bug"
    | "inventory"
    | "history"
    | "cloud"
    | "assignment"
    | "accountTree"
    | "gavel"
    | "public"
    | "campaign"
    | "cookie"
    | "verified"
    | "description";
  grupo: "institucional" | "si" | "portal" | "governanca";
};

/** Tipos usados nas medidas PPSI 0.9–0.12 */
export const TIPO_POLITICA_PGSI = "politica_pgsi";
export const TIPO_POLITICA_PGP = "politica_pgp";
export const TIPO_POLITICA_POSIN = "politica_seguranca_informacao";
export const TIPO_POLITICA_PROTECAO_DADOS = "politica_protecao_dados_pessoais";

/** Docs do portal ↔ tipo em politica_modelo */
export const PORTAL_DOC_TIPO_POLITICA = {
  politica: "documento_portal_politica_privacidade",
  aviso: "documento_portal_aviso_titular",
  cookies: "documento_portal_cookies",
  declaracao: "documento_portal_declaracao_seguranca",
  termo: "documento_portal_termo_uso",
} as const;

export type PortalDocKey = keyof typeof PORTAL_DOC_TIPO_POLITICA;

export const POLITICAS_CATALOG: PoliticaCatalogMeta[] = [
  {
    id: TIPO_POLITICA_PROTECAO_DADOS,
    nome: "Política de Proteção de Dados Pessoais",
    descricao: "Diretrizes para proteção de dados pessoais conforme LGPD",
    cor: "#2196F3",
    iconKey: "privacy",
    grupo: "institucional",
  },
  {
    id: "politica_backup",
    nome: "Política de Backup",
    descricao: "Procedimentos para backup e recuperação de dados",
    cor: "#4CAF50",
    iconKey: "backup",
    grupo: "si",
  },
  {
    id: "politica_controle_acesso",
    nome: "Política de Controle de Acesso",
    descricao: "Gestão de credenciais e privilégios de acesso",
    cor: "#FF9800",
    iconKey: "lock",
    grupo: "si",
  },
  {
    id: "politica_defesas_malware",
    nome: "Política de Defesas contra Malware",
    descricao: "Proteção contra softwares maliciosos",
    cor: "#F44336",
    iconKey: "shield",
    grupo: "si",
  },
  {
    id: "politica_desenvolvimento_pessoas",
    nome: "Política de Desenvolvimento de Pessoas",
    descricao: "Treinamento e conscientização em segurança",
    cor: "#9C27B0",
    iconKey: "group",
    grupo: "si",
  },
  {
    id: "politica_gerenciamento_vulnerabilidades",
    nome: "Política de Gerenciamento de Vulnerabilidades",
    descricao: "Identificação e correção de vulnerabilidades",
    cor: "#E91E63",
    iconKey: "bug",
    grupo: "si",
  },
  {
    id: "politica_gestao_ativos",
    nome: "Política de Gestão de Ativos",
    descricao: "Inventário e gestão de ativos de TI",
    cor: "#607D8B",
    iconKey: "inventory",
    grupo: "si",
  },
  {
    id: "politica_logs_auditoria",
    nome: "Política de Logs e Auditoria",
    descricao: "Registros de eventos e trilhas de auditoria",
    cor: "#795548",
    iconKey: "history",
    grupo: "si",
  },
  {
    id: "politica_provedor_servicos",
    nome: "Política de Provedor de Serviços",
    descricao: "Gestão de fornecedores e prestadores de serviços",
    cor: "#00BCD4",
    iconKey: "cloud",
    grupo: "si",
  },
  {
    id: TIPO_POLITICA_POSIN,
    nome: "Política de Segurança da Informação",
    descricao: "Diretrizes gerais de segurança da informação (POSIN)",
    cor: "#3F51B5",
    iconKey: "assignment",
    grupo: "si",
  },
  {
    id: TIPO_POLITICA_PGSI,
    nome: "Programa de Governança em Segurança da Informação (PGSI)",
    descricao: "Programa institucional de governança em SI (PPSI medida 0.9)",
    cor: "#1565C0",
    iconKey: "accountTree",
    grupo: "governanca",
  },
  {
    id: TIPO_POLITICA_PGP,
    nome: "Programa de Governança em Privacidade (PGP)",
    descricao: "Programa institucional de governança em privacidade (PPSI medida 0.10)",
    cor: "#6A1B9A",
    iconKey: "gavel",
    grupo: "governanca",
  },
  {
    id: PORTAL_DOC_TIPO_POLITICA.termo,
    nome: "Termo de Uso do serviço",
    descricao: "Condições de uso do serviço digital (modelo PPSI SGD/MGI)",
    cor: "#455A64",
    iconKey: "description",
    grupo: "portal",
  },
  {
    id: PORTAL_DOC_TIPO_POLITICA.politica,
    nome: "Política de Privacidade (portal)",
    descricao: "Texto público do portal do titular — política de privacidade",
    cor: "#0277BD",
    iconKey: "public",
    grupo: "portal",
  },
  {
    id: PORTAL_DOC_TIPO_POLITICA.aviso,
    nome: "Aviso do Portal do Titular",
    descricao: "Aviso informativo exibido no portal do titular",
    cor: "#00838F",
    iconKey: "campaign",
    grupo: "portal",
  },
  {
    id: PORTAL_DOC_TIPO_POLITICA.cookies,
    nome: "Política de Cookies (portal)",
    descricao: "Política pública de cookies do portal",
    cor: "#EF6C00",
    iconKey: "cookie",
    grupo: "portal",
  },
  {
    id: PORTAL_DOC_TIPO_POLITICA.declaracao,
    nome: "Declaração de Segurança (portal)",
    descricao: "Declaração pública de práticas de segurança",
    cor: "#2E7D32",
    iconKey: "verified",
    grupo: "portal",
  },
];

const BY_ID = new Map(POLITICAS_CATALOG.map((p) => [p.id, p]));

export function getPoliticaCatalogMeta(id: string): PoliticaCatalogMeta | undefined {
  return BY_ID.get(id);
}

export function mergePoliticaCatalogWithModelos(
  modelos: Array<{ id: string; nome?: string | null; descricao?: string | null; cor?: string | null; ordem?: number | null }>
): Array<PoliticaCatalogMeta & { ordem: number }> {
  const fromDb = modelos.map((m, idx) => {
    const meta = BY_ID.get(m.id);
    return {
      id: m.id,
      nome: (m.nome?.trim() || meta?.nome || m.id) as string,
      descricao: (m.descricao?.trim() || meta?.descricao || "") as string,
      cor: (m.cor?.trim() || meta?.cor || "#2196F3") as string,
      iconKey: meta?.iconKey ?? ("assignment" as const),
      grupo: meta?.grupo ?? ("institucional" as const),
      ordem: m.ordem ?? idx,
    };
  });
  fromDb.sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"));
  return fromDb;
}
