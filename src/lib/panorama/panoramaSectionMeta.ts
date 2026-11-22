/** Títulos (PPSI/LGPD) e subtítulo informal só nas seções. */
export type PanoramaSectionMeta = {
  anchor: string;
  /** Título formal — índice e cabeçalho da seção. */
  titulo: string;
  /** Tom leve — apenas no cabeçalho da seção (não no índice). */
  subtitulo: string;
};

export const PANORAMA_SECTION_META: Record<string, PanoramaSectionMeta> = {
  "panorama-fold-two": {
    anchor: "panorama-fold-two",
    titulo: "Diagnóstico de maturidade (PPSI) e glossário",
    subtitulo: "Números do diagnóstico e o que cada sigla significa",
  },
  "panorama-sec-resumo-diagnostico": {
    anchor: "panorama-sec-resumo-diagnostico",
    titulo: "Resumo do diagnóstico PPSI",
    subtitulo: "Quantas perguntas já têm resposta e como isso foi classificado",
  },
  "panorama-sec-glossario": {
    anchor: "panorama-sec-glossario",
    titulo: "Glossário simplificado",
    subtitulo: "Siglas e termos usados neste relatório",
  },
  "panorama-sec-entregas": {
    anchor: "panorama-sec-entregas",
    titulo: "Evidências e registros do programa",
    subtitulo: "O que já está anotado neste programa",
  },
  "panorama-sec-sistemas": {
    anchor: "panorama-sec-sistemas",
    titulo: "Inventário de ativos e sistemas",
    subtitulo: "Sites, ferramentas e serviços que tratam ou apoiam dados",
  },
  "panorama-sec-decisao": {
    anchor: "panorama-sec-decisao",
    titulo: "Lacunas e adoção parcial (governança)",
    subtitulo: "Pontos em aberto que pedem posicionamento da direção",
  },
  "panorama-sec-riscos": {
    anchor: "panorama-sec-riscos",
    titulo: "Gestão de riscos (privacidade e segurança)",
    subtitulo: "Principais riscos e o que fazer com cada um",
  },
  "panorama-sec-exposicao": {
    anchor: "panorama-sec-exposicao",
    titulo: "Cenários de exposição (risco residual)",
    subtitulo: "O que pode acontecer se nada mudar",
  },
  "panorama-sec-planos": {
    anchor: "panorama-sec-planos",
    titulo: "Planos de ação e priorização",
    subtitulo: "Passos sugeridos e o que priorizar primeiro",
  },
  "panorama-sec-checklist-inicio": {
    anchor: "panorama-sec-checklist-inicio",
    titulo: "Quesitos LGPD — abertura do programa",
    subtitulo: "Confira se o básico para começar o programa está encaminhado",
  },
};

export function getPanoramaSectionMeta(anchor: string | undefined | null): PanoramaSectionMeta | undefined {
  if (!anchor) return undefined;
  return PANORAMA_SECTION_META[anchor];
}