/**
 * Substitui placeholders dos modelos de política por dados do programa (cadastro).
 */

export type PoliticaProgramaDados = Record<string, unknown> | null | undefined;

/** Nome exibido do órgão: prioriza nome fantasia, depois nome do programa, razão social. */
export function getPoliticaNomeOrgao(programa: PoliticaProgramaDados): string {
  if (!programa || typeof programa !== "object") return "";
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = programa[k];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return "";
  };
  return pick("nome_fantasia", "nome", "razao_social");
}

/**
 * Primeira linha em destaque dos PDFs: nome do programa FPSI (`nome`); se vazio, mesmo critério do órgão ([`getPoliticaNomeOrgao`]).
 */
export function getPoliticaPdfCabecalhoTitulo(programa: PoliticaProgramaDados): string {
  if (!programa || typeof programa !== "object") return "";
  const nomeProg = String(programa.nome ?? "").trim();
  if (nomeProg) return nomeProg;
  return getPoliticaNomeOrgao(programa);
}

/**
 * Linhas abaixo do título: nome fantasia / razão social quando o título já é o nome do programa;
 * ou só razão social quando o título veio só do órgão.
 */
export function getPoliticaPdfCabecalhoLinhasMetadados(programa: PoliticaProgramaDados): string[] {
  if (!programa || typeof programa !== "object") return [];
  const titulo = getPoliticaPdfCabecalhoTitulo(programa);
  const nomeProg = String(programa.nome ?? "").trim();
  const nf = String(programa.nome_fantasia ?? "").trim();
  const rs = String(programa.razao_social ?? "").trim();
  const out: string[] = [];
  if (nomeProg) {
    if (nf && nf !== titulo) out.push(nf);
    if (rs && rs !== titulo && rs !== nf) out.push(rs);
  } else if (rs && rs !== titulo) {
    out.push(rs);
  }
  return out;
}

/**
 * Texto para rótulos “Programa: …” — prioriza nome do programa; evita mostrar só o slug quando há cadastro.
 */
export function getPoliticaNomeProgramaRotulo(programa: PoliticaProgramaDados, slugOuIdFallback: string): string {
  if (programa && typeof programa === "object") {
    const n = String(programa.nome ?? "").trim();
    if (n) return n;
    const nf = String(programa.nome_fantasia ?? "").trim();
    if (nf) return nf;
    const rs = String(programa.razao_social ?? "").trim();
    if (rs) return rs;
  }
  const s = String(slugOuIdFallback ?? "").trim();
  return s || "Programa";
}

/**
 * Garante nome para placeholders quando o JSON do programa veio parcial ou só `nomeFantasia` no body do PDF.
 */
export function mergeProgramaForPoliticaPlaceholders(
  programa: PoliticaProgramaDados,
  nomeFantasiaFallback?: string
): PoliticaProgramaDados {
  const fb = typeof nomeFantasiaFallback === "string" ? nomeFantasiaFallback.trim() : "";
  const base: Record<string, unknown> =
    programa && typeof programa === "object" ? { ...(programa as Record<string, unknown>) } : {};
  if (fb) {
    if (!String(base.nome_fantasia ?? "").trim()) base.nome_fantasia = fb;
    if (!String(base.nome ?? "").trim()) base.nome = fb;
  }
  if (Object.keys(base).length > 0) return base;
  if (fb) return { nome_fantasia: fb, nome: fb };
  return programa;
}

function normalizePoliticaHtmlForPlaceholders(html: string): string {
  return String(html).replace(/\u00a0/g, " ").normalize("NFC");
}

/** Escapa texto inserido em HTML para evitar quebra de marcação. */
export function escapeHtmlForPoliticaPlaceholder(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Destaque visual dos valores que substituem placeholders (editor + PDF). */
function wrapPlaceholderValue(value: string): string {
  return `<strong>${escapeHtmlForPoliticaPlaceholder(value)}</strong>`;
}

/** Formata CNPJ quando vier como número ou string só dígitos. */
export function formatCnpjBrasil(raw: unknown): string {
  if (raw == null || raw === "") return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length !== 14) {
    return typeof raw === "string" ? raw.trim() : String(raw);
  }
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

/**
 * Aplica substituições em HTML/texto rico dos modelos.
 * Só substitui quando o dado existe no programa (mantém o placeholder se faltar).
 * `nomeFantasiaFallback`: uso típico no PDF quando o body manda só o nome de exibição.
 */
export function applyPoliticaPlaceholders(
  html: string,
  programa: PoliticaProgramaDados,
  nomeFantasiaFallback?: string
): string {
  if (!html || typeof html !== "string") return html || "";
  const merged = mergeProgramaForPoliticaPlaceholders(programa, nomeFantasiaFallback);
  let out = normalizePoliticaHtmlForPlaceholders(html);

  const nome = getPoliticaNomeOrgao(merged);
  if (nome) {
    // Modelos: [Órgão ou entidade], [Órgão ou Entidade], espaços/NBSP variáveis, Unicode NFC
    const v = wrapPlaceholderValue(nome);
    out = out.replace(/\[(?:Ó|O)rgão\s+ou\s+[Ee]ntidade\]/gi, v);
    // Sem acento em "Ó" (conteúdo antigo ou digitação)
    out = out.replace(/\[Org[aã]o\s+ou\s+[Ee]ntidade\]/gi, v);
  }

  if (merged && typeof merged === "object") {
    const rs = String(merged.razao_social ?? "").trim();
    if (rs) {
      const v = wrapPlaceholderValue(rs);
      out = out.replace(/\[Razão [Ss]ocial\]/g, v);
      out = out.replace(/\[Razao Social\]/gi, v);
    }

    const nf = String(merged.nome_fantasia ?? "").trim();
    if (nf) {
      out = out.replace(/\[Nome [Ff]antasia\]/g, wrapPlaceholderValue(nf));
    }

    const cnpj = formatCnpjBrasil(merged.cnpj);
    if (cnpj) {
      out = out.replace(/\[CNPJ\]/gi, wrapPlaceholderValue(cnpj));
    }

    const email = String(merged.atendimento_email ?? "").trim();
    if (email) {
      const v = wrapPlaceholderValue(email);
      out = out.replace(/\[E-?mail(?: de atendimento)?\]/gi, v);
      out = out.replace(/\[email(?: de contato)?\]/gi, v);
    }

    const fone = String(merged.atendimento_fone ?? "").trim();
    if (fone) {
      out = out.replace(/\[Telefone(?: de atendimento)?\]/gi, wrapPlaceholderValue(fone));
    }

    const site = String(merged.atendimento_site ?? "").trim();
    if (site) {
      out = out.replace(/\[Site(?: institucional)?\]/gi, wrapPlaceholderValue(site));
    }
  }

  return out;
}

export function applyPoliticaPlaceholdersToSections<
  T extends { texto?: string; descricao?: string; secao?: string; titulo?: string },
>(sections: T[], programa: PoliticaProgramaDados, nomeFantasiaFallback?: string): T[] {
  return sections.map((s) => ({
    ...s,
    texto:
      s.texto != null
        ? applyPoliticaPlaceholders(String(s.texto), programa, nomeFantasiaFallback)
        : s.texto,
    descricao:
      s.descricao != null
        ? applyPoliticaPlaceholders(String(s.descricao), programa, nomeFantasiaFallback)
        : s.descricao,
    secao:
      s.secao != null ? applyPoliticaPlaceholders(String(s.secao), programa, nomeFantasiaFallback) : s.secao,
    titulo:
      s.titulo != null ? applyPoliticaPlaceholders(String(s.titulo), programa, nomeFantasiaFallback) : s.titulo,
  }));
}
