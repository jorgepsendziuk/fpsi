/**
 * Blocos HTML sugeridos para políticas a partir de cadastros (determinístico).
 * Nunca substitui texto sem confirmação do editor.
 */

export type CadastroSnapshot = {
  orgao: string;
  dpoNome?: string;
  dpoEmail?: string;
  canalTitular?: string;
  unidades: string[];
  processos: string[];
  sistemas: string[];
  fornecedores: Array<{ nome: string; tipo?: string; clausulas?: boolean }>;
  mapeamentos: Array<{
    nome: string;
    finalidade?: string | null;
    baseLegal?: string | null;
    categorias?: string | null;
    compartilhamento?: string | null;
    transferencia?: string | null;
  }>;
  papeis?: string[];
  riscosAltos?: string[];
};

export type PoliticaSugestao = {
  id: string;
  secaoAlvo: string;
  titulo: string;
  html: string;
  origem: string;
};

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ul(items: string[]): string {
  const lis = items.filter(Boolean).map((i) => `<li>${esc(i)}</li>`).join("");
  return lis ? `<ul>${lis}</ul>` : "<p>Nenhum item cadastrado ainda.</p>";
}

function aplicaAosTipos(tipo: string, ids: string[]): boolean {
  return ids.some((id) => tipo === id || tipo.includes(id));
}

export function buildPoliticaSugestoes(tipoPolitica: string, snap: CadastroSnapshot): PoliticaSugestao[] {
  const out: PoliticaSugestao[] = [];
  const tipo = String(tipoPolitica || "");

  const pdp = [
    "politica_protecao_dados_pessoais",
    "documento_portal_politica_privacidade",
    "documento_portal_aviso_titular",
  ];
  if (aplicaAosTipos(tipo, pdp)) {
    const fins = snap.mapeamentos.map((m) =>
      [m.nome, m.finalidade, m.baseLegal].filter(Boolean).join(" — ")
    );
    const cats = snap.mapeamentos
      .map((m) => m.categorias)
      .filter((x): x is string => !!x);
    const comps = snap.mapeamentos
      .map((m) => m.compartilhamento)
      .filter((x): x is string => !!x);
    const trans = snap.mapeamentos.filter((m) =>
      String(m.transferencia || "").toLowerCase().match(/sim|internacional/)
    );
    out.push({
      id: "pdp-finalidades",
      secaoAlvo: "finalidade",
      titulo: "Finalidades e bases legais (ROPA / mapeamento)",
      origem: "mapeamento_dados / ropa",
      html: `<p>Operações de tratamento identificadas em ${esc(snap.orgao || "a organização")}:</p>${ul(fins)}`,
    });
    out.push({
      id: "pdp-categorias",
      secaoAlvo: "dados",
      titulo: "Categorias de dados e compartilhamentos",
      origem: "mapeamento_dados",
      html: `<p>Categorias:</p>${ul(cats.length ? cats : ["Não informado no mapeamento."])}<p>Compartilhamentos:</p>${ul(comps.length ? comps : ["Não informado."])}`,
    });
    if (trans.length) {
      out.push({
        id: "pdp-ti",
        secaoAlvo: "transferencia",
        titulo: "Transferência internacional",
        origem: "mapeamento_dados",
        html: `<p>Há indicação de transferência internacional nas operações:</p>${ul(trans.map((m) => m.nome))}`,
      });
    }
    if (snap.dpoNome || snap.canalTitular) {
      out.push({
        id: "pdp-dpo",
        secaoAlvo: "encarregado",
        titulo: "Encarregado e canal do titular",
        origem: "cadastro do programa",
        html: `<p>Encarregado: <strong>${esc(snap.dpoNome || "—")}</strong>${snap.dpoEmail ? ` (${esc(snap.dpoEmail)})` : ""}.</p><p>Canal: ${esc(snap.canalTitular || "portal do titular deste programa")}.</p>`,
      });
    }
  }

  if (aplicaAosTipos(tipo, ["politica_provedor_servicos"])) {
    const linhas = snap.fornecedores.map((f) => {
      const bits = [f.nome, f.tipo, f.clausulas ? "cláusulas LGPD/SI" : "cláusulas pendentes"];
      return bits.filter(Boolean).join(" — ");
    });
    out.push({
      id: "pgps-lista",
      secaoAlvo: "provedores",
      titulo: "Inventário de provedores de serviços",
      origem: "programa_fornecedor",
      html: `<p>Provedores cadastrados (PPSI Controle 15 / ISO 27002 5.19–5.23):</p>${ul(linhas)}`,
    });
  }

  if (aplicaAosTipos(tipo, ["politica_gestao_ativos"])) {
    out.push({
      id: "ativos-unidades",
      secaoAlvo: "inventario",
      titulo: "Unidades, processos e sistemas",
      origem: "cadastro mestre",
      html: `<p>Unidades</p>${ul(snap.unidades)}<p>Processos</p>${ul(snap.processos)}<p>Sistemas</p>${ul(snap.sistemas)}`,
    });
  }

  const gov = ["politica_seguranca_informacao", "politica_pgsi", "politica_pgp"];
  if (aplicaAosTipos(tipo, gov)) {
    out.push({
      id: "gov-papeis",
      secaoAlvo: "governanca",
      titulo: "Papéis e estrutura",
      origem: "estrutura de governança",
      html: `<p>Papéis registrados:</p>${ul(snap.papeis?.length ? snap.papeis : [snap.dpoNome ? `Encarregado: ${snap.dpoNome}` : "Completar em Estrutura de Governança."])}`,
    });
    if (snap.riscosAltos?.length) {
      out.push({
        id: "gov-riscos",
        secaoAlvo: "riscos",
        titulo: "Riscos residuais altos",
        origem: "programa_risco",
        html: `<p>Riscos em tratamento com criticidade elevada:</p>${ul(snap.riscosAltos)}`,
      });
    }
  }

  if (aplicaAosTipos(tipo, ["politica_controle_acesso", "politica_logs_auditoria", "politica_backup"])) {
    out.push({
      id: "si-sistemas",
      secaoAlvo: "sistemas",
      titulo: "Sistemas no escopo",
      origem: "programa_sistema",
      html: `<p>Sistemas do cadastro mestre no escopo desta política:</p>${ul(snap.sistemas)}`,
    });
  }

  return out;
}

export function inserirHtmlNaSecao(
  textoAtual: string,
  html: string,
  confirmar: boolean
): string {
  if (!confirmar) return textoAtual;
  const base = String(textoAtual || "").trim();
  if (!base) return html;
  return `${base}\n${html}`;
}
