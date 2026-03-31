/**
 * Catálogo de referência para levantamento de mapeamento (áreas e processos típicos).
 * Origem: planilha modelo em docs/improvements/
 *   "Padrão Inicial - 01 - LGPD - Data Mapping - Identificação de Processos.xlsx - Google Planilhas.pdf"
 * Não contém dados pessoais — apenas nomes genéricos de processos.
 *
 * `setor_area_sugerido` mapeia para keys de SETOR_AREA_OPCOES em mapeamentoDadosOptions.ts.
 * Quando a planilha é mais fina que o formulário, use `area_rotulo` e `tags`.
 */

import { SETOR_AREA_OPCOES } from "@/lib/utils/mapeamentoDadosOptions";

export type MapeamentoProcessoModeloSetorKey = (typeof SETOR_AREA_OPCOES)[number]["key"];

export type MapeamentoProcessoModeloItem = {
  /** Título do processo (como na planilha) */
  titulo: string;
  /** Agrupamento livre da planilha (subárea) */
  area_rotulo: string;
  /** Sugestão para o campo «Setor ou área» do FPSI */
  setor_area_sugerido: MapeamentoProcessoModeloSetorKey | null;
  /** Palavras-chave para pesquisa / filtro */
  tags: string[];
  /** Texto opcional para pré-preencher observações */
  descricao_curta?: string;
};

export const MAPEAMENTO_PROCESSOS_MODELO: MapeamentoProcessoModeloItem[] = [
  {
    titulo: "Recebimento de candidaturas com CV (impresso, e-mail ou WhatsApp)",
    area_rotulo: "RH — Recrutamento",
    setor_area_sugerido: "rh",
    tags: ["rh", "recrutamento", "candidato", "cv"],
    descricao_curta: "Triagem inicial de candidatos; dados de identificação e contacto.",
  },
  {
    titulo: "Dados da fase pré-contratual e negociação do contrato de trabalho",
    area_rotulo: "RH — Recrutamento",
    setor_area_sugerido: "rh",
    tags: ["rh", "contrato", "pré-contratual"],
  },
  {
    titulo: "Solicitações de vale transporte, planos de saúde/odontológicos e empréstimos consignados",
    area_rotulo: "RH — Departamento pessoal",
    setor_area_sugerido: "rh",
    tags: ["rh", "dp", "benefícios", "financeiro colaborador"],
  },
  {
    titulo: "Registro de exames médicos admissionais (medicina do trabalho)",
    area_rotulo: "RH — Medicina do trabalho",
    setor_area_sugerido: "rh",
    tags: ["rh", "saúde", "admissional", "ASO"],
  },
  {
    titulo: "Comunicação a seguradores (seguros de acidentes de trabalho)",
    area_rotulo: "RH — Medicina do trabalho",
    setor_area_sugerido: "rh",
    tags: ["rh", "seguro", "obrigação legal"],
  },
  {
    titulo: "Cadastro de pessoas através de currículo em portal web",
    area_rotulo: "RH — Recrutamento",
    setor_area_sugerido: "rh",
    tags: ["rh", "portal", "candidato"],
  },
  {
    titulo: "Celebração de contrato de trabalho e aditamentos",
    area_rotulo: "RH — Departamento pessoal",
    setor_area_sugerido: "rh",
    tags: ["rh", "contrato", "documento"],
  },
  {
    titulo: "Inscrições e comunicações obrigatórias (INSS, FGTS, Receita)",
    area_rotulo: "RH — Departamento pessoal",
    setor_area_sugerido: "rh",
    tags: ["rh", "obrigação legal", "fgts", "inss"],
  },
  {
    titulo: "Registro de exames médicos no âmbito da medicina do trabalho",
    area_rotulo: "RH — Medicina do trabalho",
    setor_area_sugerido: "rh",
    tags: ["rh", "saúde", "periódico"],
  },
  {
    titulo: "Envio de exames periódicos (ASO), licenças e atestados médicos por e-mail",
    area_rotulo: "RH — Medicina do trabalho",
    setor_area_sugerido: "rh",
    tags: ["rh", "saúde", "e-mail"],
  },
  {
    titulo: "Coleta de dados em equipamentos de biometria do controle de ponto",
    area_rotulo: "RH — Ponto eletrônico",
    setor_area_sugerido: "rh",
    tags: ["rh", "biometria", "ponto", "colaborador"],
  },
  {
    titulo: "Captura de dados para testes de análise comportamental",
    area_rotulo: "RH — Recrutamento",
    setor_area_sugerido: "rh",
    tags: ["rh", "recrutamento", "avaliação"],
  },
  {
    titulo: "Dados financeiros de pessoa física para análise de crédito e cobrança",
    area_rotulo: "Crédito / Cobrança",
    setor_area_sugerido: "financeiro",
    tags: ["crédito", "cobrança", "pf"],
  },
  {
    titulo: "Dados cadastrais para recebimento de pagamentos",
    area_rotulo: "Financeiro — Contas a pagar / receber",
    setor_area_sugerido: "financeiro",
    tags: ["pagamento", "cadastro", "fornecedor"],
  },
  {
    titulo: "Dados cadastrais de colaboradores e terceiros com dados bancários",
    area_rotulo: "Financeiro",
    setor_area_sugerido: "financeiro",
    tags: ["banco", "colaborador", "terceiro"],
  },
  {
    titulo: "Dados de clientes em bases de e-commerce",
    area_rotulo: "E-commerce",
    setor_area_sugerido: "comercial",
    tags: ["e-commerce", "cliente", "venda online"],
  },
  {
    titulo: "Dados pessoais de clientes para emissão de NF-e",
    area_rotulo: "Faturamento",
    setor_area_sugerido: "financeiro",
    tags: ["nfe", "fiscal", "cliente"],
  },
  {
    titulo: "Armazenamento do XML de notas fiscais eletrônicas",
    area_rotulo: "Fiscal / Faturamento",
    setor_area_sugerido: "financeiro",
    tags: ["xml", "nf-e", "armazenamento"],
  },
  {
    titulo: "Dados de salário de colaboradores e MEIs; cadastros fiscais (DIRF PF, etc.)",
    area_rotulo: "Fiscal / RH",
    setor_area_sugerido: "financeiro",
    tags: ["dirf", "salário", "obrigação legal"],
  },
  {
    titulo: "Proteção e confidencialidade em processos jurídicos (colaboradores, clientes, PF)",
    area_rotulo: "Jurídico",
    setor_area_sugerido: "juridico",
    tags: ["jurídico", "processo", "litígio"],
  },
  {
    titulo: "Gestão de contratos de clientes, parceiros e terceiros",
    area_rotulo: "Jurídico",
    setor_area_sugerido: "juridico",
    tags: ["contrato", "parceiro"],
  },
  {
    titulo: "Coleta de leads e prospects para ações com clientes",
    area_rotulo: "Marketing",
    setor_area_sugerido: "marketing",
    tags: ["lead", "prospecção", "crm"],
  },
  {
    titulo: "Coleta via CRM, redes sociais e BI para análise de comportamento de compra",
    area_rotulo: "Marketing",
    setor_area_sugerido: "marketing",
    tags: ["crm", "redes sociais", "perfil"],
  },
  {
    titulo: "Listas de distribuição WhatsApp e e-mail marketing",
    area_rotulo: "Marketing",
    setor_area_sugerido: "marketing",
    tags: ["whatsapp", "e-mail marketing", "newsletter"],
  },
  {
    titulo: "Registro de imagens de câmeras internas (DVR/NVR)",
    area_rotulo: "Segurança patrimonial",
    setor_area_sugerido: "operacoes",
    tags: ["câmera", "vídeo", "segurança"],
    descricao_curta: "Tratamento de imagem; avaliar base legal e sinalização.",
  },
  {
    titulo: "Portaria — cadastro de colaboradores, visitantes e clientes",
    area_rotulo: "Portaria",
    setor_area_sugerido: "atendimento",
    tags: ["portaria", "visitante", "acesso"],
  },
  {
    titulo: "Controle de entrada de pessoas e veículos",
    area_rotulo: "Portaria",
    setor_area_sugerido: "operacoes",
    tags: ["acesso", "veículo", "visitante"],
  },
  {
    titulo: "Portal externo B2B/B2C para acesso a informações e operações",
    area_rotulo: "Portal externo",
    setor_area_sugerido: "comercial",
    tags: ["portal", "b2b", "b2c", "cliente"],
  },
  {
    titulo: "Compras de serviços, produtos e materiais envolvendo dados de PF",
    area_rotulo: "Compras",
    setor_area_sugerido: "operacoes",
    tags: ["compras", "fornecedor"],
  },
  {
    titulo: "Cadastro para acesso à rede Wi-Fi",
    area_rotulo: "TI",
    setor_area_sugerido: "ti",
    tags: ["wifi", "rede", "visitante", "colaborador"],
  },
  {
    titulo: "Controle de celulares, notebooks e dispositivos de armazenamento",
    area_rotulo: "TI",
    setor_area_sugerido: "ti",
    tags: ["mdm", "ativo", "segurança da informação"],
  },
  {
    titulo: "Mapeamento de dados pessoais em sistemas internos e externos (ERP/RH/AD)",
    area_rotulo: "TI",
    setor_area_sugerido: "ti",
    tags: ["inventário", "erp", "sistema"],
  },
  {
    titulo: "Orçamentos para compra de produtos ou serviços por clientes PF",
    area_rotulo: "Comercial",
    setor_area_sugerido: "comercial",
    tags: ["orçamento", "cliente", "pf"],
  },
  {
    titulo: "Informações do cliente para atendimento de reclamações ou solicitações",
    area_rotulo: "SAC / Atendimento",
    setor_area_sugerido: "atendimento",
    tags: ["sac", "reclamação", "titular"],
  },
  {
    titulo: "Mapeamento de compartilhamentos e armazenamentos em plataformas cloud",
    area_rotulo: "TI",
    setor_area_sugerido: "ti",
    tags: ["nuvem", "cloud", "suboperador"],
  },
  {
    titulo: "Áreas de design, programação e mídia performance — tratamento de dados pessoais",
    area_rotulo: "Marketing / TI",
    setor_area_sugerido: "marketing",
    tags: ["mídia", "performance", "cookies", "site"],
  },
];

export type FiltrarProcessosModeloParams = {
  /** Texto livre (título, área, tags) */
  busca?: string;
  /** Filtra por keys de setor (ex.: rh, ti) */
  setor_areas?: string[];
};

function normaliza(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Lista filtrada do catálogo (cliente ou servidor).
 */
export function filtrarMapeamentoProcessosModelo(params: FiltrarProcessosModeloParams): MapeamentoProcessoModeloItem[] {
  const q = params.busca ? normaliza(params.busca) : "";
  const setores = params.setor_areas?.filter(Boolean).map((s) => s.trim()) ?? [];

  return MAPEAMENTO_PROCESSOS_MODELO.filter((item) => {
    if (setores.length > 0) {
      if (!item.setor_area_sugerido || !setores.includes(item.setor_area_sugerido)) return false;
    }
    if (!q) return true;
    const blob = normaliza(
      [item.titulo, item.area_rotulo, item.tags.join(" "), item.descricao_curta ?? ""].join(" ")
    );
    return blob.includes(q);
  });
}

const MAX_LINHAS_PROMPT = 80;
const MAX_CHARS_POR_LINHA = 120;

/**
 * Texto compacto para system prompt da IA (evita tokens excessivos).
 */
export function resumoCatalogoParaPrompt(focusSetorAreas?: string[] | null): string {
  const items =
    focusSetorAreas?.length ?
      filtrarMapeamentoProcessosModelo({ setor_areas: focusSetorAreas })
      : MAPEAMENTO_PROCESSOS_MODELO;

  const slice = items.slice(0, MAX_LINHAS_PROMPT);
  const lines = slice.map((i) => {
    const setor = i.setor_area_sugerido ?? "outro";
    let line = `- [${setor}] ${i.titulo}`;
    if (line.length > MAX_CHARS_POR_LINHA) line = line.slice(0, MAX_CHARS_POR_LINHA - 1) + "…";
    return line;
  });
  const omitted = items.length - slice.length;
  const footer =
    omitted > 0 ? `\n(… mais ${omitted} processos no catálogo completo; podes sugerir variações alinhadas ao programa.)` : "";
  return ["Processos de referência (inspiração, não lista fechada):", ...lines].join("\n") + footer;
}
