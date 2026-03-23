/** Listas fechadas para levantamento de mapeamento (primeira linha). */

export const SETOR_AREA_OPCOES = [
  { key: "rh", label: "RH / Pessoas" },
  { key: "comercial", label: "Comercial / Vendas" },
  { key: "financeiro", label: "Financeiro" },
  { key: "ti", label: "TI / Tecnologia" },
  { key: "juridico", label: "Jurídico / Compliance" },
  { key: "operacoes", label: "Operações / Produção" },
  { key: "marketing", label: "Marketing / Comunicação" },
  { key: "atendimento", label: "Atendimento / Suporte" },
  { key: "outro", label: "Outro" },
] as const;

export const FINALIDADE_OPCOES = [
  { key: "contratacao", label: "Contratação e recrutamento" },
  { key: "execucao_contrato", label: "Execução de contrato ou serviço" },
  { key: "marketing_rel", label: "Marketing e relacionamento" },
  { key: "obrigacao_legal", label: "Cumprimento de obrigação legal" },
  { key: "seguranca", label: "Segurança e controle de acesso" },
  { key: "atendimento_titular", label: "Atendimento ao titular / suporte" },
  { key: "outro", label: "Outro (especificar abaixo)" },
] as const;

/** Onde os dados aparecem (múltipla escolha). */
export const MEIOS_ARMAZENAMENTO_OPCOES = [
  { key: "sistema_interno", label: "Sistema interno / ERP / CRM" },
  { key: "planilha", label: "Planilha (Excel, Google Sheets, etc.)" },
  { key: "email_mensageria", label: "E-mail ou mensageria" },
  { key: "papel", label: "Papel / arquivo físico" },
  { key: "site_app", label: "Site ou aplicativo" },
  { key: "nuvem", label: "Armazenamento em nuvem" },
  { key: "outro", label: "Outro" },
] as const;

export const TIPOS_DADOS_OPCOES = [
  { key: "identificacao", label: "Identificação (nome, documento, matrícula)" },
  { key: "contato", label: "Contacto (telefone, e-mail, endereço)" },
  { key: "financeiro", label: "Dados financeiros / pagamentos" },
  { key: "saude", label: "Dados de saúde ou biométricos" },
  { key: "preferencias", label: "Preferências, hábitos ou perfil" },
  { key: "outros_tipos", label: "Outros" },
] as const;

export const FLUXO_COMPARTILHAMENTO_OPCOES = [
  { key: "nenhum", label: "Não é partilhado fora da equipa" },
  { key: "apenas_interno", label: "Apenas dentro da organização" },
  { key: "outro_departamento", label: "Outro departamento / unidade" },
  { key: "empresa_externa", label: "Empresa ou parceiro externo" },
  { key: "nao_sei_fluxo", label: "Não sei" },
] as const;

export const CATEGORIA_TITULAR_OPCOES = [
  { key: "cliente", label: "Cliente ou utilizador" },
  { key: "colaborador", label: "Colaborador" },
  { key: "candidato", label: "Candidato" },
  { key: "visitante", label: "Visitante ou participante de evento" },
  { key: "fornecedor", label: "Fornecedor ou prestador" },
  { key: "outros", label: "Outros (especificar)" },
] as const;

export const TRANSFERENCIA_INTERNACIONAL_OPCOES = [
  { key: "nao", label: "Não" },
  { key: "sim", label: "Sim" },
  { key: "nao_sei", label: "Não sei" },
] as const;

export type MeioArmazenamentoKey = (typeof MEIOS_ARMAZENAMENTO_OPCOES)[number]["key"];
export type TipoDadoMapeamentoKey = (typeof TIPOS_DADOS_OPCOES)[number]["key"];

function labelMap<T extends readonly { key: string; label: string }[]>(opts: T, key: string | null | undefined): string {
  if (!key) return "—";
  const o = opts.find((x) => x.key === key);
  return o?.label ?? key;
}

export function labelSetorArea(key: string | null | undefined): string {
  return labelMap(SETOR_AREA_OPCOES, key);
}

export function labelFinalidade(key: string | null | undefined): string {
  return labelMap(FINALIDADE_OPCOES, key);
}

export function labelTitular(key: string | null | undefined): string {
  return labelMap(CATEGORIA_TITULAR_OPCOES, key);
}

export function labelTransferencia(key: string | null | undefined): string {
  return labelMap(TRANSFERENCIA_INTERNACIONAL_OPCOES, key);
}

export function labelMeios(keys: string[] | null | undefined): string {
  if (!keys?.length) return "—";
  return keys
    .map((k) => labelMap(MEIOS_ARMAZENAMENTO_OPCOES, k))
    .join(", ");
}

export function labelTiposDados(keys: string[] | null | undefined): string {
  if (!keys?.length) return "—";
  return keys
    .map((k) => labelMap(TIPOS_DADOS_OPCOES, k))
    .join(", ");
}

export function labelFluxoCompartilhamento(key: string | null | undefined): string {
  return labelMap(FLUXO_COMPARTILHAMENTO_OPCOES, key);
}
