/**
 * Ato formal de indicação do encarregado — Anexos I e II da Resolução CD/ANPD nº 18/2024.
 * O texto gerado segue os modelos oficiais da ANPD (pessoa natural / pessoa jurídica).
 */

export type TipoEncarregadoAto = "pessoa_natural" | "pessoa_juridica";

export type TermoNomeacaoDpoDraft = {
  tipoEncarregado: TipoEncarregadoAto;
  organizacaoNome: string;
  cidadeAssinatura: string;
  dataNomeacao: string;
  representanteLegalNome: string;
  representanteLegalCargo: string;
  /** Anexo I — nome completo da pessoa natural encarregada. */
  dpoNome: string;
  /** Anexo II — nome empresarial ou título do estabelecimento. */
  dpoNomeEmpresarial: string;
  /** Anexo II — pessoa natural que representa a PJ junto à ANPD e aos titulares. */
  dpoPessoaNaturalResponsavel: string;
  /** Nome completo do substituto (parágrafo previsto nos dois anexos). */
  substitutoNome: string;
};

export type TermoGap = {
  key: string;
  label: string;
  severity: "obrigatorio" | "recomendado";
  hint?: string;
};

export function createEmptyTermoDraft(): TermoNomeacaoDpoDraft {
  return {
    tipoEncarregado: "pessoa_natural",
    organizacaoNome: "",
    cidadeAssinatura: "",
    dataNomeacao: new Date().toISOString().slice(0, 10),
    representanteLegalNome: "",
    representanteLegalCargo: "Representante legal",
    dpoNome: "",
    dpoNomeEmpresarial: "",
    dpoPessoaNaturalResponsavel: "",
    substitutoNome: "",
  };
}

function trimStr(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

export type SeedTermoParams = {
  programa: Record<string, unknown> | null | undefined;
  dpo?: { nome?: string | null; email?: string | null; cargo?: string | null; data_designacao?: string | null } | null;
  suplente?: { nome?: string | null; email?: string | null; cargo?: string | null } | null;
  representante?: { nome?: string | null; email?: string | null; cargo?: string | null } | null;
  gestorResponsavelEmpresa?: string | null;
};

/** Pré-preenche o formulário com o que o programa/empresa já têm. */
export function seedTermoDraftFromPrograma(params: SeedTermoParams): TermoNomeacaoDpoDraft {
  const draft = createEmptyTermoDraft();
  const p = params.programa ?? {};

  const razao = trimStr(p.razao_social);
  const fantasia = trimStr(p.nome_fantasia);
  const nomeProg = trimStr(p.nome);
  draft.organizacaoNome = razao || fantasia || nomeProg;

  const atoData = trimStr(p.dpo_ato_designacao_data);
  const desigDpo = trimStr(params.dpo?.data_designacao);
  draft.dataNomeacao = (atoData || desigDpo || draft.dataNomeacao).slice(0, 10);

  if (params.dpo) {
    const nomeDpo = trimStr(params.dpo.nome);
    draft.dpoNome = nomeDpo;
    draft.dpoPessoaNaturalResponsavel = nomeDpo;
  }

  draft.substitutoNome = trimStr(params.suplente?.nome);

  const repNome = trimStr(params.representante?.nome) || trimStr(params.gestorResponsavelEmpresa);
  if (repNome) {
    draft.representanteLegalNome = repNome;
    draft.representanteLegalCargo =
      trimStr(params.representante?.cargo) || "Representante legal";
  }

  return draft;
}

/** Lista campos ausentes para avisar antes de gerar o PDF. */
export function analyzeTermoGaps(draft: TermoNomeacaoDpoDraft): TermoGap[] {
  const gaps: TermoGap[] = [];
  const pj = draft.tipoEncarregado === "pessoa_juridica";

  if (!draft.organizacaoNome.trim()) {
    gaps.push({
      key: "organizacaoNome",
      label: "Nome do controlador",
      severity: "obrigatorio",
      hint: "Preencha em Dados da organização ou neste formulário.",
    });
  }
  if (!draft.dataNomeacao.trim()) {
    gaps.push({
      key: "dataNomeacao",
      label: "Data da indicação",
      severity: "obrigatorio",
    });
  }
  if (pj) {
    if (!draft.dpoNomeEmpresarial.trim()) {
      gaps.push({
        key: "dpoNomeEmpresarial",
        label: "Nome empresarial / título do estabelecimento do encarregado",
        severity: "obrigatorio",
        hint: "Anexo II — pessoa jurídica indicada como encarregada.",
      });
    }
    if (!draft.dpoPessoaNaturalResponsavel.trim()) {
      gaps.push({
        key: "dpoPessoaNaturalResponsavel",
        label: "Pessoa natural responsável (representante da PJ)",
        severity: "obrigatorio",
        hint: "Quem representa a pessoa jurídica nas interações com a ANPD e os titulares.",
      });
    }
  } else if (!draft.dpoNome.trim()) {
    gaps.push({
      key: "dpoNome",
      label: "Nome completo do encarregado",
      severity: "obrigatorio",
      hint: "Defina o encarregado em Papéis e equipe.",
    });
  }
  if (!draft.substitutoNome.trim()) {
    gaps.push({
      key: "substitutoNome",
      label: "Nome completo do substituto(a)",
      severity: "recomendado",
      hint: "Os Anexos I e II da ANPD incluem o substituto para ausências, impedimentos e vacâncias.",
    });
  }
  if (!draft.representanteLegalNome.trim()) {
    gaps.push({
      key: "representanteLegalNome",
      label: "Representante legal (assinatura do controlador)",
      severity: "recomendado",
      hint: "Use o papel Representante da alta administração ou informe aqui.",
    });
  }

  return gaps;
}

export function placeholderOr(value: string, label: string): string {
  const t = value.trim();
  return t || `[${label}]`;
}

export function formatDataExtensoPt(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return isoDate.trim() || "[dia, mês e ano]";
  const d = Number(m[3]);
  const month = Number(m[2]);
  const y = Number(m[1]);
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const nomeMes = meses[month - 1] ?? String(month);
  return `${d} de ${nomeMes} de ${y}`;
}

export function atoFormalAnexoId(tipo: TipoEncarregadoAto): "I" | "II" {
  return tipo === "pessoa_juridica" ? "II" : "I";
}

export function atoFormalTituloLinhas(tipo: TipoEncarregadoAto): [string, string] {
  if (tipo === "pessoa_juridica") {
    return ["Ato Formal para Indicação de", "Encarregado Pessoa Jurídica"];
  }
  return ["Ato Formal para Indicação de", "Encarregado Pessoa Natural"];
}

function atribuicoesParagrafo(virgulaAposAnpd: boolean): string {
  const normas = virgulaAposAnpd
    ? "normas da ANPD, em especial"
    : "normas da ANPD em especial";
  return (
    "Como tal, o(a) encarregado(a) será responsável por: (i) aceitar reclamações e comunicações dos titulares, prestar esclarecimentos e adotar providências cabíveis; (ii) receber comunicações da ANPD e adotar providências; (iii) orientar os funcionários e os contratados do agente de tratamento a respeito das práticas a serem tomadas em relação à proteção de dados pessoais; e (iv) executar as demais atribuições determinadas pelo controlador ou estabelecidas em " +
    normas +
    " as atividades descritas no art. 16 do Regulamento aprovado pela Resolução CD/ANPD nº 18, de 16 de julho de 2024."
  );
}

function substitutoParagrafo(nome: string): string {
  const substituto = placeholderOr(nome, "nome completo do substituto(a)");
  return `Informa-se que nas ausências, impedimentos e vacâncias do(a) encarregado(a), a função será exercida por seu(sua) substituto(a), o(a) ${substituto}.`;
}

/** Três parágrafos do modelo oficial (Anexo I ou II). */
export function buildAtoFormalParagrafos(draft: TermoNomeacaoDpoDraft): [string, string, string] {
  const controlador = placeholderOr(draft.organizacaoNome, "nome do controlador");
  const data = formatDataExtensoPt(draft.dataNomeacao);
  const substituto = substitutoParagrafo(draft.substitutoNome);

  if (draft.tipoEncarregado === "pessoa_juridica") {
    const nomeEmpresarial = placeholderOr(
      draft.dpoNomeEmpresarial,
      "nome empresarial ou o título do estabelecimento"
    );
    const pessoaNatural = placeholderOr(
      draft.dpoPessoaNaturalResponsavel,
      "nome completo da pessoa natural responsável"
    );
    return [
      `${controlador} designou, em ${data}, o(a) ${nomeEmpresarial}, como encarregado(a) pelo tratamento de dados pessoais, em atendimento ao art. 41 da Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais – LGPD). O(a) ${pessoaNatural} representará o(a) ${nomeEmpresarial} nas interações junto à ANPD e aos titulares.`,
      atribuicoesParagrafo(true),
      substituto,
    ];
  }

  const nomeCompleto = placeholderOr(draft.dpoNome, "nome completo");
  return [
    `${controlador} designou, em ${data}, o(a) ${nomeCompleto}, como encarregado(a) pelo tratamento de dados pessoais, em atendimento ao art. 41 da Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais – LGPD).`,
    atribuicoesParagrafo(false),
    substituto,
  ];
}

/** Resumo curto para gravar em `dpo_ato_designacao_texto` após gerar o PDF. */
export function buildAtoDesignacaoResumo(draft: TermoNomeacaoDpoDraft): string {
  const anexo = atoFormalAnexoId(draft.tipoEncarregado);
  const org = draft.organizacaoNome.trim() || "controlador";
  const data = formatDataExtensoPt(draft.dataNomeacao);
  const supl = draft.substitutoNome.trim()
    ? ` Substituto(a): ${draft.substitutoNome.trim()}.`
    : "";

  if (draft.tipoEncarregado === "pessoa_juridica") {
    const pj = draft.dpoNomeEmpresarial.trim() || "pessoa jurídica";
    const pn = draft.dpoPessoaNaturalResponsavel.trim()
      ? ` Pessoa natural responsável: ${draft.dpoPessoaNaturalResponsavel.trim()}.`
      : "";
    return `Ato formal (Anexo ${anexo} — pessoa jurídica) de ${data}: ${org} designou ${pj} como encarregado(a) pelo tratamento de dados pessoais.${pn}${supl} Fundamentação: art. 41 da LGPD e Resolução CD/ANPD nº 18/2024.`;
  }

  const dpo = draft.dpoNome.trim() || "Encarregado";
  return `Ato formal (Anexo ${anexo} — pessoa natural) de ${data}: ${org} designou ${dpo} como encarregado(a) pelo tratamento de dados pessoais.${supl} Fundamentação: art. 41 da LGPD e Resolução CD/ANPD nº 18/2024.`;
}
