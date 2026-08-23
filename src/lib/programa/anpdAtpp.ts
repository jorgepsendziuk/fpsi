/**
 * Checklist ANPD — Segurança da Informação para Agentes de Tratamento de Pequeno Porte (ATPP)
 * cruzado com medidas do catálogo PPSI 2.0 (sem inventar linhas no catálogo oficial).
 *
 * Fonte: Guia orientativo ANPD (out/2021) + checklist anexo.
 */

export type AnpdCobertura = "coberto" | "parcial" | "lacuna";

export type AnpdSecaoId =
  | "politica_si"
  | "conscientizacao"
  | "contratos"
  | "controle_acesso"
  | "dados_armazenados"
  | "comunicacoes"
  | "vulnerabilidades"
  | "dispositivos_moveis"
  | "nuvem";

export type AnpdChecklistItem = {
  id: string;
  secao: AnpdSecaoId;
  secaoLabel: string;
  textoAnpd: string;
  cobertura: AnpdCobertura;
  /** id_medida PPSI (ex.: "0.11", "6.3"); vazio quando lacuna pura */
  idMedidas: string[];
  nota?: string;
};

/**
 * Medidas GI2/GI3 do PPSI que o Essencial (ATPP) mantém além do GI1.
 * IDs de catálogo (`id_medida`), não PKs do banco.
 */
export const ANPD_ATPP_WHITELIST_ID_MEDIDA: readonly string[] = [
  "3.9", // mídia removível
  "3.10", // criptografia em trânsito
  "3.11", // criptografia em repouso
  "4.10", // bloqueio de portátil
  "4.11", // wipe remoto
  "4.12", // espaços de trabalho (privado × institucional)
  "6.8", // RBAC / need-to-know
  "7.5", // varredura de vulnerabilidades
  "15.2", // política de provedores
  "15.4", // cláusulas SI em contratos de provedor
] as const;

export const ANPD_ATPP_WHITELIST_SET: ReadonlySet<string> = new Set(ANPD_ATPP_WHITELIST_ID_MEDIDA);

/**
 * Medidas do Controle 0 (estrutura) típicas da APF / SISP que o Essencial
 * não pontua para PME / ATPP. PKs `public.medida.id` (catálogo PPSI 2.0).
 * Mantidas no score: 0.4, 0.7, 0.10, 0.11, 0.12, 0.17 → ids 4, 7, 10, 11, 12, 17.
 */
export const ESSENCIAL_MEDIDAS_IGNORADAS_IDS: readonly number[] = [
  1, // 0.1 alta administração / riscos SI
  2, // 0.2 gestor TIC
  3, // 0.3 gestor SI
  5, // 0.5 responsável integridade
  6, // 0.6 CSI
  8, // 0.8 ETIR
  9, // 0.9 PGSI
  13, // 0.13 gestão riscos SI
  14, // 0.14 continuidade SI
  15, // 0.15 gestão de mudanças SI
  16, // 0.16 avaliação conformidade SI
] as const;

export const ANPD_CHECKLIST: AnpdChecklistItem[] = [
  {
    id: "psi",
    secao: "politica_si",
    secaoLabel: "Política de segurança da informação",
    textoAnpd:
      "Estabelecer PSI simplificada com controles de backup, senhas, acesso, compartilhamento, atualização de softwares, e-mail e antivírus.",
    cobertura: "coberto",
    idMedidas: ["0.11"],
    nota: "POSIN + modelos temáticos (backup, acesso, malware, vulnerabilidades).",
  },
  {
    id: "psi_revisao",
    secao: "politica_si",
    secaoLabel: "Política de segurança da informação",
    textoAnpd: "Realizar revisões periódicas da política de segurança da informação.",
    cobertura: "coberto",
    idMedidas: ["0.11"],
  },
  {
    id: "treino_lgpd",
    secao: "conscientizacao",
    secaoLabel: "Conscientização e treinamento",
    textoAnpd:
      "Conscientizar funcionários sobre obrigações e responsabilidades na LGPD e normas da ANPD.",
    cobertura: "coberto",
    idMedidas: ["14.1", "14.4", "0.12"],
  },
  {
    id: "treino_dia_a_dia",
    secao: "conscientizacao",
    secaoLabel: "Conscientização e treinamento",
    textoAnpd:
      "Informar sobre controles no dia a dia, phishing/vírus, mesa limpa, não compartilhar senha, bloquear tela e seguir a PSI.",
    cobertura: "coberto",
    idMedidas: ["14.2", "14.3", "14.4", "14.5", "14.8", "4.3"],
  },
  {
    id: "reportar_incidentes",
    secao: "conscientizacao",
    secaoLabel: "Conscientização e treinamento",
    textoAnpd:
      "Criar ambiente que incentive informar incidentes e vulnerabilidades detectadas.",
    cobertura: "coberto",
    idMedidas: ["14.6", "14.7", "17.1"],
  },
  {
    id: "contratos_clausulas",
    secao: "contratos",
    secaoLabel: "Gerenciamento de contratos",
    textoAnpd:
      "Contratos com cláusulas de SI: fornecedores, compartilhamentos, controlador-operador e vedação a tratamentos incompatíveis.",
    cobertura: "coberto",
    idMedidas: ["22.1", "22.2", "22.3", "22.4", "15.4"],
  },
  {
    id: "nda_funcionarios",
    secao: "contratos",
    secaoLabel: "Gerenciamento de contratos",
    textoAnpd: "Assinar termos de confidencialidade (NDA) com os funcionários.",
    cobertura: "parcial",
    idMedidas: ["22.1"],
    nota: "Citado em 22.1; reforçado no modelo de POSIN (sem medida exclusiva no catálogo).",
  },
  {
    id: "controle_acesso",
    secao: "controle_acesso",
    secaoLabel: "Controle de acesso",
    textoAnpd: "Sistema de controle de acesso com níveis de permissão e need-to-know.",
    cobertura: "coberto",
    idMedidas: ["3.3", "6.1", "6.2", "6.8"],
  },
  {
    id: "senhas",
    secao: "controle_acesso",
    secaoLabel: "Controle de acesso",
    textoAnpd:
      "Não usar senhas padrão; senhas complexas; não reutilizar; complexidade no sistema.",
    cobertura: "coberto",
    idMedidas: ["4.7", "5.2", "14.3"],
    nota: "Complexidade também na POSIN / treino de autenticação.",
  },
  {
    id: "proibir_compartilhar_conta",
    secao: "controle_acesso",
    secaoLabel: "Controle de acesso",
    textoAnpd: "Proibir o compartilhamento de contas ou senhas entre funcionários.",
    cobertura: "parcial",
    idMedidas: ["5.1", "14.3"],
    nota: "Lacuna de pergunta explícita; coberta na POSIN (vedação) e treino.",
  },
  {
    id: "mfa",
    secao: "controle_acesso",
    secaoLabel: "Controle de acesso",
    textoAnpd: "Autenticação multifator para sistemas ou bases com dados pessoais.",
    cobertura: "coberto",
    idMedidas: ["6.3", "6.4", "6.5"],
  },
  {
    id: "nao_desativar_seguranca",
    secao: "dados_armazenados",
    secaoLabel: "Segurança dos dados pessoais armazenados",
    textoAnpd: "Orientar a não desativar ou ignorar configurações de segurança das estações.",
    cobertura: "parcial",
    idMedidas: ["4.1"],
    nota: "Reforçado no modelo de POSIN.",
  },
  {
    id: "midia_externa",
    secao: "dados_armazenados",
    secaoLabel: "Segurança dos dados pessoais armazenados",
    textoAnpd: "Evitar pendrives; inventariar e cifrar mídias externas.",
    cobertura: "parcial",
    idMedidas: ["3.9", "10.4", "10.5"],
  },
  {
    id: "backup",
    secao: "dados_armazenados",
    secaoLabel: "Segurança dos dados pessoais armazenados",
    textoAnpd: "Backups offline, periódicos e armazenados com segurança.",
    cobertura: "coberto",
    idMedidas: ["11.1", "11.2", "11.3", "11.4"],
  },
  {
    id: "descarte",
    secao: "dados_armazenados",
    secaoLabel: "Segurança dos dados pessoais armazenados",
    textoAnpd: "Descarte seguro de mídias e registro em contrato quando houver terceiro.",
    cobertura: "coberto",
    idMedidas: ["3.5", "15.4", "22.3"],
  },
  {
    id: "minimizacao",
    secao: "dados_armazenados",
    secaoLabel: "Segurança dos dados pessoais armazenados",
    textoAnpd: "Coletar e processar apenas os dados pessoais necessários (minimização).",
    cobertura: "coberto",
    idMedidas: ["25.3"],
  },
  {
    id: "criptografia_pseudonimizacao",
    secao: "dados_armazenados",
    secaoLabel: "Segurança dos dados pessoais armazenados",
    textoAnpd: "Pseudonimização / criptografia de dados pessoais.",
    cobertura: "parcial",
    idMedidas: ["3.6", "3.10", "3.11"],
    nota: "Pseudonimização citada em 22.1; sem medida própria no catálogo.",
  },
  {
    id: "tls",
    secao: "comunicacoes",
    secaoLabel: "Segurança das comunicações",
    textoAnpd: "Conexões cifradas (TLS/HTTPS) ou cifra fim a fim.",
    cobertura: "parcial",
    idMedidas: ["3.10"],
  },
  {
    id: "firewall",
    secao: "comunicacoes",
    secaoLabel: "Segurança das comunicações",
    textoAnpd: "Firewall e/ou WAF.",
    cobertura: "parcial",
    idMedidas: ["4.4", "4.5"],
    nota: "Firewall em GI1; WAF cai em segurança de aplicações (fora do Essencial).",
  },
  {
    id: "email_antispam",
    secao: "comunicacoes",
    secaoLabel: "Segurança das comunicações",
    textoAnpd: "AntiSpam, filtros de e-mail e antivírus integrado ao e-mail.",
    cobertura: "coberto",
    idMedidas: ["9.1", "9.6", "9.7"],
  },
  {
    id: "dados_rede_publica",
    secao: "comunicacoes",
    secaoLabel: "Segurança das comunicações",
    textoAnpd: "Remover dados pessoais desnecessários em redes públicas.",
    cobertura: "parcial",
    idMedidas: ["14.8", "25.3"],
  },
  {
    id: "patches_antivirus",
    secao: "vulnerabilidades",
    secaoLabel: "Gerenciamento de vulnerabilidades",
    textoAnpd: "Atualizar sistemas, antivírus e realizar varreduras periódicas.",
    cobertura: "coberto",
    idMedidas: ["7.3", "7.4", "7.5", "10.1", "10.2"],
  },
  {
    id: "mfa_movel",
    secao: "dispositivos_moveis",
    secaoLabel: "Dispositivos móveis",
    textoAnpd: "MFA para controle de acesso de dispositivos móveis.",
    cobertura: "parcial",
    idMedidas: ["6.3", "6.4", "6.5"],
    nota: "MFA genérico; não específico de smartphone.",
  },
  {
    id: "separar_uso_movel",
    secao: "dispositivos_moveis",
    secaoLabel: "Dispositivos móveis",
    textoAnpd: "Separar dispositivos de uso privado e institucional quando possível.",
    cobertura: "coberto",
    idMedidas: ["4.12"],
  },
  {
    id: "wipe_remoto",
    secao: "dispositivos_moveis",
    secaoLabel: "Dispositivos móveis",
    textoAnpd: "Apagar remotamente dados pessoais em dispositivos móveis.",
    cobertura: "coberto",
    idMedidas: ["4.11"],
  },
  {
    id: "nuvem_sla",
    secao: "nuvem",
    secaoLabel: "Serviços em nuvem",
    textoAnpd:
      "SLA/requisitos de SI com provedor, avaliar o serviço, requisitos de acesso e MFA na nuvem.",
    cobertura: "parcial",
    idMedidas: ["15.1", "15.2", "15.4", "6.3"],
  },
];

export function isAnpdWhitelistMedida(idMedida: string | null | undefined): boolean {
  if (!idMedida) return false;
  return ANPD_ATPP_WHITELIST_SET.has(idMedida.trim());
}

export function listAnpdPorSecao(): Record<AnpdSecaoId, AnpdChecklistItem[]> {
  const out = {} as Record<AnpdSecaoId, AnpdChecklistItem[]>;
  for (const item of ANPD_CHECKLIST) {
    if (!out[item.secao]) out[item.secao] = [];
    out[item.secao].push(item);
  }
  return out;
}

export function resumoCoberturaAnpd(): Record<AnpdCobertura, number> {
  const out: Record<AnpdCobertura, number> = { coberto: 0, parcial: 0, lacuna: 0 };
  for (const item of ANPD_CHECKLIST) {
    out[item.cobertura] += 1;
  }
  return out;
}
