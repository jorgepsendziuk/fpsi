/** Seção publicada de documento legal (espelha politica_programa.secoes). */
export type PortalDocSecaoPublica = {
  id: number;
  secao: string;
  titulo: string;
  descricao?: string;
  texto?: string;
};

/** Documentos do módulo Políticas publicados para o portal. */
export type PortalDocumentosPublicados = {
  politica: PortalDocSecaoPublica[] | null;
  aviso: PortalDocSecaoPublica[] | null;
  cookies: PortalDocSecaoPublica[] | null;
  declaracao: PortalDocSecaoPublica[] | null;
  termo: PortalDocSecaoPublica[] | null;
};

/** Resposta pública GET /api/portal/[slug] (portal do titular). */
export type PortalPublicData = {
  id: number;
  nome: string | null;
  slug: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | number | null;
  atendimento_fone: string | null;
  atendimento_email: string | null;
  atendimento_site: string | null;
  dpo_nome: string | null;
  dpo_email: string | null;
  /** pessoa_natural | pessoa_juridica */
  dpo_tipo_pessoa?: string | null;
  dpo_pessoa_natural_nome?: string | null;
  dpo_cnpj?: string | null;
  logo_orgao_empresa: string | null;
  logo_programa: string | null;
  link_politica_privacidade: string | null;
  link_aviso_titular: string | null;
  link_cookies: string | null;
  link_declaracao_seguranca: string | null;
  link_termo_uso: string | null;
  link_reportar_vulnerabilidade: string | null;
  /** Textos publicados no módulo Políticas (quando status=publicado). */
  documentos_publicados?: PortalDocumentosPublicados;
};
