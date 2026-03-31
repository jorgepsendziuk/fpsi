import {
  SETOR_AREA_OPCOES,
  FINALIDADE_OPCOES,
  MEIOS_ARMAZENAMENTO_OPCOES,
  TIPOS_DADOS_OPCOES,
  FLUXO_COMPARTILHAMENTO_OPCOES,
  CATEGORIA_TITULAR_OPCOES,
  TRANSFERENCIA_INTERNACIONAL_OPCOES,
} from "@/lib/utils/mapeamentoDadosOptions";
import { resumoCatalogoParaPrompt } from "@/lib/data/mapeamentoProcessosModelo";

function keysLine(opts: readonly { key: string; label: string }[]): string {
  return opts.map((o) => `${o.key} (${o.label})`).join("; ");
}

export function buildSuggestMapeamentosSystemPrompt(focusSetorAreas?: string[] | null): string {
  return [
    "És um assistente de privacidade para o módulo de mapeamento de dados (LGPD).",
    "Gera APENAS JSON válido, sem markdown, no formato: {\"suggestions\":[...]}.",
    "Cada elemento de suggestions deve ser um objeto com as chaves exatas listadas abaixo.",
    "Usa apenas os valores de enum indicados (keys em inglês/minúsculas como no sistema).",
    "Não inventes dados pessoais nem nomes de pessoas. Descreve processos de forma genérica.",
    "As sugestões devem ser plausíveis para a organização descrita pelo utilizador.",
    "",
    "Chaves por sugestão:",
    "- nome: string curta (nome do levantamento)",
    "- descricao: string|null observações opcionais",
    "- sistemas_ou_fontes: string|null (ex.: ERP, e-mail — genérico)",
    "- setor_area: uma key de setor",
    "- setor_outro: string|null (obrigatório se setor_area for outro)",
    "- finalidade_categoria: uma key de finalidade",
    "- finalidade_detalhe: string|null (obrigatório se finalidade for outro)",
    "- meios_armazenamento: array de keys de meio (pode vazio mas preferir 1–3)",
    "- meios_outro: string|null se incluir meio outro",
    "- tipos_dados: array de keys de tipo (mínimo 1)",
    "- tipos_outro: string|null se incluir outros_tipos",
    "- fluxo_compartilhamento: key ou null",
    "- compartilhamento_detalhe: string|null",
    "- categoria_titular: uma key de titular",
    "- titular_outro: string|null se titular for outros",
    "- transferencia_internacional: uma key (nao|sim|nao_sei)",
    "",
    "SETOR_AREA keys: " + keysLine(SETOR_AREA_OPCOES),
    "FINALIDADE keys: " + keysLine(FINALIDADE_OPCOES),
    "MEIOS keys: " + keysLine(MEIOS_ARMAZENAMENTO_OPCOES),
    "TIPOS_DADOS keys: " + keysLine(TIPOS_DADOS_OPCOES),
    "FLUXO keys: " + keysLine(FLUXO_COMPARTILHAMENTO_OPCOES),
    "TITULAR keys: " + keysLine(CATEGORIA_TITULAR_OPCOES),
    "TRANSFERENCIA keys: " + keysLine(TRANSFERENCIA_INTERNACIONAL_OPCOES),
    "",
    resumoCatalogoParaPrompt(focusSetorAreas ?? undefined),
  ].join("\n");
}

export function buildSuggestMapeamentosUserMessage(params: {
  count: number;
  programa: {
    nome: string | null;
    descricao_escopo: string | null;
    atividade_principal_organizacao: string | null;
    tipo_programa: string | null;
  };
  empresa?: { razao_social: string | null; atividade_principal: string | null } | null;
}): string {
  const { count, programa, empresa } = params;
  return JSON.stringify(
    {
      instrucao: `Gera exatamente ${count} sugestões de levantamentos de mapeamento distintos e úteis.`,
      programa,
      empresa: empresa ?? null,
    },
    null,
    2
  );
}
