/**
 * Termo de Nomeação do DPO (art. 41 LGPD / ANPD Res. 18/2024).
 * Monta o rascunho a partir dos dados do programa e aponta lacunas.
 */

export type PessoaTermoFields = {
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  rg: string;
  rgOrgao: string;
  cpf: string;
  email: string;
  cargo: string;
};

export type TermoNomeacaoDpoDraft = {
  organizacaoNome: string;
  cnpj: string;
  endereco: string;
  ccm: string;
  cidadeAssinatura: string;
  dataNomeacao: string;
  representanteLegal: PessoaTermoFields & { cargoAssinatura: string };
  dpo: PessoaTermoFields;
  suplente: PessoaTermoFields;
  incluirSuplente: boolean;
  telefone: string;
  site: string;
  emailOrg: string;
};

export type TermoGap = {
  key: string;
  label: string;
  severity: "obrigatorio" | "recomendado";
  hint?: string;
};

const emptyPessoa = (): PessoaTermoFields => ({
  nome: "",
  nacionalidade: "brasileiro(a)",
  estadoCivil: "",
  rg: "",
  rgOrgao: "",
  cpf: "",
  email: "",
  cargo: "",
});

export function createEmptyTermoDraft(): TermoNomeacaoDpoDraft {
  return {
    organizacaoNome: "",
    cnpj: "",
    endereco: "",
    ccm: "",
    cidadeAssinatura: "São Paulo",
    dataNomeacao: new Date().toISOString().slice(0, 10),
    representanteLegal: { ...emptyPessoa(), cargoAssinatura: "Representante Legal" },
    dpo: emptyPessoa(),
    suplente: emptyPessoa(),
    incluirSuplente: false,
    telefone: "",
    site: "",
    emailOrg: "",
  };
}

function trimStr(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function formatCpfDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 11) return raw.trim();
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function formatCpfForTermo(raw: string): string {
  return formatCpfDisplay(raw);
}

export type SeedTermoParams = {
  programa: Record<string, unknown> | null | undefined;
  dpo?: { nome?: string | null; email?: string | null; cargo?: string | null; data_designacao?: string | null } | null;
  suplente?: { nome?: string | null; email?: string | null; cargo?: string | null } | null;
  representante?: { nome?: string | null; email?: string | null; cargo?: string | null } | null;
  /** Nome do gestor da empresa (string livre), se não houver papel formal */
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

  const cnpjRaw = p.cnpj;
  if (cnpjRaw != null && String(cnpjRaw).trim()) {
    const digits = String(cnpjRaw).replace(/\D/g, "");
    draft.cnpj =
      digits.length === 14
        ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
        : String(cnpjRaw).trim();
  }

  draft.endereco = trimStr(p.endereco);
  draft.telefone = trimStr(p.atendimento_fone);
  draft.site = trimStr(p.atendimento_site);
  draft.emailOrg = trimStr(p.atendimento_email);

  const atoData = trimStr(p.dpo_ato_designacao_data);
  const desigDpo = trimStr(params.dpo?.data_designacao);
  draft.dataNomeacao = (atoData || desigDpo || draft.dataNomeacao).slice(0, 10);

  if (params.dpo) {
    draft.dpo.nome = trimStr(params.dpo.nome);
    draft.dpo.email = trimStr(params.dpo.email);
    draft.dpo.cargo = trimStr(params.dpo.cargo) || "Encarregado pelo Tratamento de Dados Pessoais (DPO)";
  }

  if (params.suplente?.nome) {
    draft.incluirSuplente = true;
    draft.suplente.nome = trimStr(params.suplente.nome);
    draft.suplente.email = trimStr(params.suplente.email);
    draft.suplente.cargo = trimStr(params.suplente.cargo) || "Suplente de DPO";
  }

  const repNome = trimStr(params.representante?.nome) || trimStr(params.gestorResponsavelEmpresa);
  if (repNome) {
    draft.representanteLegal.nome = repNome;
    draft.representanteLegal.email = trimStr(params.representante?.email);
    draft.representanteLegal.cargo = trimStr(params.representante?.cargo);
    draft.representanteLegal.cargoAssinatura =
      trimStr(params.representante?.cargo) || "Representante Legal";
  }

  return draft;
}

/** Lista campos ausentes para avisar antes de gerar o PDF. */
export function analyzeTermoGaps(draft: TermoNomeacaoDpoDraft): TermoGap[] {
  const gaps: TermoGap[] = [];

  if (!draft.organizacaoNome.trim()) {
    gaps.push({
      key: "organizacaoNome",
      label: "Razão social / nome da organização",
      severity: "obrigatorio",
      hint: "Preencha em Dados da organização ou neste formulário.",
    });
  }
  if (!draft.dpo.nome.trim()) {
    gaps.push({
      key: "dpo.nome",
      label: "Nome do Encarregado (DPO)",
      severity: "obrigatorio",
      hint: "Defina o encarregado em Papéis e equipe.",
    });
  }
  if (!draft.dataNomeacao.trim()) {
    gaps.push({
      key: "dataNomeacao",
      label: "Data da nomeação",
      severity: "obrigatorio",
    });
  }
  if (!draft.cnpj.trim()) {
    gaps.push({
      key: "cnpj",
      label: "CNPJ",
      severity: "recomendado",
      hint: "Dados da organização.",
    });
  }
  if (!draft.endereco.trim()) {
    gaps.push({
      key: "endereco",
      label: "Endereço da organização",
      severity: "recomendado",
    });
  }
  if (!draft.representanteLegal.nome.trim()) {
    gaps.push({
      key: "representanteLegal.nome",
      label: "Representante legal (assinatura do controlador)",
      severity: "recomendado",
      hint: "Use o papel Representante da alta administração ou informe aqui.",
    });
  }
  if (!draft.dpo.cpf.trim()) {
    gaps.push({
      key: "dpo.cpf",
      label: "CPF do DPO",
      severity: "recomendado",
      hint: "Não fica salvo no sistema — só entra no PDF desta geração.",
    });
  }
  if (!draft.dpo.rg.trim()) {
    gaps.push({
      key: "dpo.rg",
      label: "RG do DPO",
      severity: "recomendado",
      hint: "Não fica salvo no sistema — só entra no PDF desta geração.",
    });
  }
  if (draft.incluirSuplente) {
    if (!draft.suplente.nome.trim()) {
      gaps.push({
        key: "suplente.nome",
        label: "Nome do suplente",
        severity: "obrigatorio",
      });
    }
    if (!draft.suplente.cpf.trim()) {
      gaps.push({
        key: "suplente.cpf",
        label: "CPF do suplente",
        severity: "recomendado",
        hint: "Não fica salvo no sistema — só entra no PDF desta geração.",
      });
    }
  }

  return gaps;
}

export function placeholderOr(value: string, label: string): string {
  const t = value.trim();
  return t || `[${label}]`;
}

export function formatDataExtensoPt(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return isoDate.trim() || "[data]";
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

/** Resumo curto para gravar em `dpo_ato_designacao_texto` após gerar o PDF. */
export function buildAtoDesignacaoResumo(draft: TermoNomeacaoDpoDraft): string {
  const org = draft.organizacaoNome.trim() || "organização";
  const dpo = draft.dpo.nome.trim() || "Encarregado";
  const data = formatDataExtensoPt(draft.dataNomeacao);
  const supl =
    draft.incluirSuplente && draft.suplente.nome.trim()
      ? ` Suplente: ${draft.suplente.nome.trim()}.`
      : "";
  return `Termo de Nomeação do DPO gerado em ${data}: ${dpo} nomeado(a) Encarregado(a) pelo Tratamento de Dados Pessoais da ${org}.${supl} Fundamentação: art. 41 da LGPD e Resolução CD/ANPD nº 18/2024.`;
}

export function describePessoaQualificacao(p: PessoaTermoFields, papel: string): string {
  const nome = placeholderOr(p.nome, `Nome do ${papel}`);
  const nac = placeholderOr(p.nacionalidade, "nacionalidade");
  const civil = p.estadoCivil.trim()
    ? `, ${p.estadoCivil.trim()}`
    : ", [estado civil]";
  const rg = p.rg.trim()
    ? `portador(a) da cédula de identidade RG nº ${p.rg.trim()}${
        p.rgOrgao.trim() ? ` – ${p.rgOrgao.trim()}` : ""
      }`
    : "portador(a) da cédula de identidade RG nº [RG]";
  const cpf = p.cpf.trim()
    ? `CPF nº ${formatCpfForTermo(p.cpf)}`
    : "CPF nº [CPF]";
  return `${nome}, ${nac}${civil}, ${rg} e do ${cpf}`;
}
