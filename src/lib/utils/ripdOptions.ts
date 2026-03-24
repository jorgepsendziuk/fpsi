/**
 * Listas fechadas para RIPD (Art. 38 LGPD) — apoio à padronização sem substituir texto livre onde necessário.
 */

export const RIPD_NIVEL_RISCO = [
  { key: "baixo", label: "Baixo" },
  { key: "medio", label: "Médio" },
  { key: "alto", label: "Alto" },
  { key: "muito_alto", label: "Muito alto" },
] as const;

export const RIPD_TIPOS_RISCO = [
  { key: "vazamento", label: "Vazamento ou acesso indevido" },
  { key: "discriminacao", label: "Discriminação ou tratamento injusto" },
  { key: "vigilancia", label: "Vigilância ou monitoramento excessivo" },
  { key: "reidentificacao", label: "Reidentificação ou correlação indevida" },
  { key: "decisao_automatizada", label: "Decisão automatizada com efeito relevante" },
  { key: "titulares_vulneraveis", label: "Titulares em situação de vulnerabilidade" },
  { key: "transferencia_internacional", label: "Transferência internacional de dados" },
  { key: "outro", label: "Outro (detalhar no texto)" },
] as const;

/** Alinhado a vocabulário comum de ROPA/mapeamento */
export const RIPD_CATEGORIAS_DADOS = [
  { key: "identificacao", label: "Identificação (nome, documento, matrícula)" },
  { key: "contato", label: "Contacto / localização" },
  { key: "financeiro", label: "Dados financeiros ou de pagamento" },
  { key: "saude", label: "Dados de saúde ou biométricos" },
  { key: "preferencias", label: "Preferências, hábitos ou perfil" },
  { key: "sensiveis_art11", label: "Dados sensíveis (art. 11 LGPD)" },
  { key: "criancas", label: "Dados de crianças ou adolescentes" },
  { key: "outros", label: "Outros (detalhar na descrição)" },
] as const;

export const RIPD_BASE_LEGAL = [
  { key: "consentimento", label: "Consentimento" },
  { key: "obrigacao_legal", label: "Cumprimento de obrigação legal ou regulatória" },
  { key: "politicas_publicas", label: "Políticas públicas / serviço público" },
  { key: "estudos_pesquisa", label: "Estudos por órgão de pesquisa" },
  { key: "execucao_contrato", label: "Execução de contrato ou procedimentos preliminares" },
  { key: "exercicio_regular_direitos", label: "Exercício regular de direitos em processo" },
  { key: "protecao_vida", label: "Proteção da vida ou da incolumidade física" },
  { key: "tutela_saude", label: "Tutela da saúde (procedimentos médicos, sanitários)" },
  { key: "legitimo_interesse", label: "Legítimo interesse" },
  { key: "protecao_credito", label: "Proteção ao crédito" },
  { key: "nao_aplicavel_misto", label: "Misto / não aplicável / especificar no texto" },
] as const;

export const RIPD_PARECER_DPO_STATUS = [
  { key: "conforme", label: "Conforme" },
  { key: "ressalvas", label: "Com ressalvas" },
  { key: "divergente", label: "Divergente" },
] as const;

export const RIPD_DECISAO_CONTROLADOR = [
  { key: "aceita", label: "Aceita o tratamento com as salvaguardas descritas" },
  { key: "aceita_com_plano", label: "Aceita com plano de ação / medidas adicionais" },
  { key: "requer_revisao", label: "Requer revisão antes de prosseguir" },
] as const;

export const RIPD_STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  em_analise: "Em análise",
  aprovado: "Aprovado",
};

function labelFrom<T extends readonly { key: string; label: string }[]>(opts: T, key: string | null | undefined): string {
  if (!key) return "—";
  const o = opts.find((x) => x.key === key);
  return o?.label ?? key;
}

export function labelNivelRisco(key: string | null | undefined): string {
  return labelFrom(RIPD_NIVEL_RISCO, key);
}

export function labelTipoRiscoRipd(keys: string[] | null | undefined): string {
  if (!keys?.length) return "—";
  return keys.map((k) => labelFrom(RIPD_TIPOS_RISCO, k)).join(", ");
}

export function labelCategoriaDadoRipd(keys: string[] | null | undefined): string {
  if (!keys?.length) return "—";
  return keys.map((k) => labelFrom(RIPD_CATEGORIAS_DADOS, k)).join(", ");
}

export function labelBaseLegalRipd(key: string | null | undefined): string {
  return labelFrom(RIPD_BASE_LEGAL, key);
}

export function labelParecerDpoStatus(key: string | null | undefined): string {
  return labelFrom(RIPD_PARECER_DPO_STATUS, key);
}

export function labelDecisaoControlador(key: string | null | undefined): string {
  return labelFrom(RIPD_DECISAO_CONTROLADOR, key);
}
