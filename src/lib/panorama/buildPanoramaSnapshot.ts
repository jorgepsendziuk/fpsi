import type { SupabaseClient } from "@supabase/supabase-js";
import { classificarRespostaPanorama } from "@/lib/panorama/panoramaMedidaClassificacao";
import { getPoliticaCatalogMeta } from "@/lib/politicas/politicasCatalog";
import {
  getDiagnosticoIndiceLabel,
  getDiagnosticoTreeLabel,
} from "@/lib/utils/diagnosticoTreeLabels";
import {
  sanitizePanoramaEncarregadoText,
  sanitizePanoramaResponsavelNome,
} from "@/lib/panorama/sanitizePanoramaEncarregado";

export const PANORAMA_METODOLOGIA =
  "Leitura do que está cadastrado neste programa e do que a equipe respondeu no diagnóstico, com o que couber de evidência pública. Ausência de informação no site ou no cadastro não conta como irregularidade. Não substitui parecer jurídico nem ato formal de governança.";

type MedidaPanoramaCtx = {
  idMedida?: string;
  titulo?: string;
  justificativa: string | null;
  controleNome?: string;
  diagnosticoId?: number;
  diagnosticoIndice?: string;
  diagnosticoNome?: string;
};

function politicaTemTexto(secoes: unknown): boolean {
  if (!Array.isArray(secoes)) return false;
  return secoes.some((s: { texto?: string }) => (s?.texto && String(s.texto).trim().length > 0));
}

export type PanoramaSnapshot = {
  geradoEm: string;
  badges: {
    jaRegistrado: number;
    atencao: number;
    lacunas: number;
    prioridadeAlta: number;
    riscosPrioridadeAlta: number;
    planosCriticos: number;
    naoAvaliado: number;
    naoSeAplica: number;
    totalMedidas: number;
  };
  existencias: {
    encarregadoIndicado: boolean;
    encarregadoNome: string | null;
    slugPortal: string | null;
    mapeamentos: number;
    ropa: number;
    ripd: number;
    sistemas: number;
    fornecedores: number;
    riscos: number;
    planosAbertos: number;
    politicasComTexto: number;
    politicasPublicadas: number;
    medidasRespondidas: number;
    medidasTotal: number;
    linksEvidencia: number;
  };
  lacunas: MedidaPanoramaCtx[];
  atencoes: MedidaPanoramaCtx[];
  riscos: Array<{
    id: number;
    titulo: string;
    descricao: string | null;
    probabilidade: string;
    impacto: string;
    score_residual: number | null;
    score_inerente: number | null;
    status: string;
    estrategia_mitigacao: string | null;
    categoria: string | null;
  }>;
  exposicao: Array<{ titulo: string; texto: string }>;
  planos: Array<{
    id: number;
    titulo: string;
    descricao: string | null;
    prioridade: string | null;
    status: string | null;
    data_fim_prevista: string | null;
    responsavel: string | null;
  }>;
  sistemasInventario: Array<{
    id: number;
    nome: string;
    descricao: string | null;
    tipo: string | null;
    critico: boolean;
  }>;
  /** Índice “já entregue” para a seção inicial do panorama (âncoras = ids das seções no relatório). */
  indiceEntregas: PanoramaIndiceEntrega[];
};

export type PanoramaIndiceEntrega = {
  chave: string;
  titulo: string;
  /** Frase curta no tom de entrega concluída. */
  jaEntregue: string;
  /** Nomes ou títulos concretos já cadastrados. */
  exemplos?: string[];
  /** Fragmento de âncora HTML (sem #) quando há seção correspondente. */
  secaoAnchor?: string | null;
};

const INDICE_MAX_EXEMPLOS = 8;

function politicaRotulo(tipo: string): string {
  return getPoliticaCatalogMeta(tipo)?.nome ?? tipo.replace(/_/g, " ");
}

function buildIndiceEntregas(input: {
  existencias: PanoramaSnapshot["existencias"];
  mapeamentoNomes: string[];
  ropaNomes: string[];
  ripdTitulos: string[];
  fornecedorNomes: string[];
  sistemasNomes: string[];
  politicaRotulos: string[];
  riscosTitulos: string[];
  planosTitulos: string[];
  temExposicao: boolean;
}): PanoramaIndiceEntrega[] {
  const itens: PanoramaIndiceEntrega[] = [];
  const ex = input.existencias;

  itens.push({
    chave: "encarregado",
    titulo: "Encarregado de dados",
    jaEntregue: "A definir — pendente de indicação formal pelo titular do programa",
  });

  if (ex.mapeamentos > 0) {
    itens.push({
      chave: "mapeamento",
      titulo: "Mapeamento de dados",
      jaEntregue: `${ex.mapeamentos} fluxo(s) de tratamento mapeado(s)`,
      exemplos: input.mapeamentoNomes.slice(0, INDICE_MAX_EXEMPLOS),
    });
  }

  if (ex.ropa > 0) {
    itens.push({
      chave: "ropa",
      titulo: "ROPA (registro de operações)",
      jaEntregue: `${ex.ropa} operação(ões) de tratamento registradas`,
      exemplos: input.ropaNomes.slice(0, INDICE_MAX_EXEMPLOS),
    });
  }

  if (ex.ripd > 0) {
    itens.push({
      chave: "ripd",
      titulo: "Relatórios de impacto (AIPD/RIPD)",
      jaEntregue: `${ex.ripd} análise(s) de impacto cadastrada(s)`,
      exemplos: input.ripdTitulos.slice(0, INDICE_MAX_EXEMPLOS),
    });
  }

  if (ex.sistemas > 0) {
    itens.push({
      chave: "sistemas",
      titulo: "Inventário de sistemas e ativos",
      jaEntregue: `${ex.sistemas} sistema(s) inventariado(s) neste programa`,
      exemplos: input.sistemasNomes.slice(0, INDICE_MAX_EXEMPLOS),
      secaoAnchor: "panorama-sec-sistemas",
    });
  }

  if (ex.fornecedores > 0) {
    itens.push({
      chave: "fornecedores",
      titulo: "Fornecedores e terceiros",
      jaEntregue: `${ex.fornecedores} fornecedor(es) relacionado(s) ao tratamento`,
      exemplos: input.fornecedorNomes.slice(0, INDICE_MAX_EXEMPLOS),
    });
  }

  if (ex.politicasPublicadas > 0) {
    itens.push({
      chave: "politicas-publicadas",
      titulo: "Políticas no portal",
      jaEntregue: `${ex.politicasPublicadas} documento(s) publicado(s) para titulares`,
      exemplos: input.politicaRotulos.slice(0, INDICE_MAX_EXEMPLOS),
    });
  } else if (ex.politicasComTexto > 0) {
    itens.push({
      chave: "politicas-texto",
      titulo: "Políticas e documentos institucionais",
      jaEntregue: `${ex.politicasComTexto} texto(s) já redigido(s) no FPSI`,
      exemplos: input.politicaRotulos.slice(0, INDICE_MAX_EXEMPLOS),
    });
  }

  if (ex.linksEvidencia > 0) {
    itens.push({
      chave: "evidencias",
      titulo: "Evidências do diagnóstico",
      jaEntregue: `${ex.linksEvidencia} vínculo(s) de evidência anexado(s) às medidas`,
    });
  }

  if (ex.medidasRespondidas > 0) {
    itens.push({
      chave: "diagnostico",
      titulo: "Diagnóstico PPSI respondido",
      jaEntregue: `${ex.medidasRespondidas} de ${ex.medidasTotal} pergunta(s) já notadas neste programa`,
    });
  }

  if (ex.riscos > 0) {
    itens.push({
      chave: "riscos",
      titulo: "Matriz de riscos",
      jaEntregue: `${ex.riscos} risco(s) identificado(s) e cadastrados`,
      exemplos: input.riscosTitulos.slice(0, 5),
      secaoAnchor: "panorama-sec-riscos",
    });
  }

  if (input.temExposicao) {
    itens.push({
      chave: "exposicao",
      titulo: "Cenários de exposição",
      jaEntregue: "Leitura dos riscos prioritários já traduzida em cenários",
      secaoAnchor: "panorama-sec-exposicao",
    });
  }

  if (ex.planosAbertos > 0) {
    itens.push({
      chave: "planos",
      titulo: "Planos de ação",
      jaEntregue: `${ex.planosAbertos} plano(s) em curso já estruturado(s)`,
      exemplos: input.planosTitulos.slice(0, INDICE_MAX_EXEMPLOS),
      secaoAnchor: "panorama-sec-planos",
    });
  }

  return itens;
}

export async function buildPanoramaSnapshot(
  supabase: SupabaseClient,
  programaId: number
): Promise<PanoramaSnapshot> {
  const programaRes = await supabase
    .from("programa")
    .select("id, nome, slug, encarregado_dados_pessoais")
    .eq("id", programaId)
    .maybeSingle();


  const [
    pmRes,
    riscosRes,
    planosRes,
    mapRes,
    ropaRes,
    ripdRes,
    sistemasRes,
    fornRes,
    politicasRes,
    evidCount,
  ] = await Promise.all([
    supabase
      .from("programa_medida")
      .select("medida, controle, resposta, justificativa")
      .eq("programa", programaId),
    supabase
      .from("programa_risco")
      .select(
        "id, titulo, descricao, probabilidade, impacto, score_residual, score_inerente, status, estrategia_mitigacao, categoria"
      )
      .eq("programa_id", programaId)
      .order("score_residual", { ascending: false }),
    supabase
      .from("plano_acao")
      .select("id, titulo, descricao, prioridade, status, data_fim_prevista, responsavel")
      .eq("programa_id", programaId)
      .not("status", "in", '("concluido","cancelado","encerrado")')
      .order("data_fim_prevista", { ascending: true, nullsFirst: false }),
    supabase
      .from("mapeamento_dados")
      .select("nome", { count: "exact" })
      .eq("programa_id", programaId)
      .order("nome")
      .limit(40),
    supabase
      .from("ropa")
      .select("nome", { count: "exact" })
      .eq("programa_id", programaId)
      .order("nome")
      .limit(40),
    supabase
      .from("ripd")
      .select("titulo", { count: "exact" })
      .eq("programa_id", programaId)
      .order("titulo")
      .limit(25),
    supabase
      .from("programa_sistema")
      .select("id, nome, descricao, tipo, critico")
      .eq("programa_id", programaId)
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("programa_fornecedor")
      .select("nome", { count: "exact" })
      .eq("programa_id", programaId)
      .eq("ativo", true)
      .order("nome")
      .limit(30),
    supabase.from("politica_programa").select("tipo_politica, secoes, status").eq("programa_id", programaId),
    supabase.from("evidencia").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
  ]);

  const rows = pmRes.data || [];
  const medidaIds = Array.from(new Set(rows.map((r) => r.medida)));
  const { data: medidas } = medidaIds.length
    ? await supabase.from("medida").select("id, id_medida, medida, id_controle").in("id", medidaIds)
    : { data: [] as Array<{ id: number; id_medida: string; medida: string; id_controle: number }> };

  const controleIds = Array.from(new Set((medidas || []).map((m) => m.id_controle).filter(Boolean)));
  const { data: controles } = controleIds.length
    ? await supabase.from("controle").select("id, nome, numero, diagnostico").in("id", controleIds)
    : { data: [] as Array<{ id: number; nome: string; numero?: string | number | null; diagnostico: number }> };

  const { data: diagnosticosCatalog } = await supabase.from("diagnostico").select("id, descricao");
  const diagDescMap = new Map((diagnosticosCatalog || []).map((d) => [d.id as number, String(d.descricao || "")]));

  const medidaMap = new Map((medidas || []).map((m) => [m.id, m]));
  const controleMap = new Map((controles || []).map((c) => [c.id, c]));

  const medidaContexto = (
    m: { id_medida?: string; medida?: string } | undefined,
    ctrl: { nome?: string; numero?: string | number | null; diagnostico?: number } | undefined,
    justificativa: string | null
  ): MedidaPanoramaCtx => {
    const dId = typeof ctrl?.diagnostico === "number" ? ctrl.diagnostico : undefined;
    return {
      idMedida: m?.id_medida,
      titulo: m?.medida,
      justificativa: sanitizePanoramaEncarregadoText(justificativa),
      controleNome: ctrl?.nome,
      diagnosticoId: dId,
      diagnosticoIndice: dId != null ? getDiagnosticoIndiceLabel(dId) : undefined,
      diagnosticoNome: dId != null ? getDiagnosticoTreeLabel(dId, diagDescMap.get(dId)) : undefined,
    };
  };

  const badgeCounts = {
    jaRegistrado: 0,
    atencao: 0,
    lacunas: 0,
    naoAvaliado: 0,
    naoSeAplica: 0,
    prioridadeAlta: 0,
    riscosPrioridadeAlta: 0,
    planosCriticos: 0,
  };

  const lacunas: PanoramaSnapshot["lacunas"] = [];
  const atencoes: PanoramaSnapshot["atencoes"] = [];

  for (const r of rows) {
    const m = medidaMap.get(r.medida);
    const ctrlId = r.controle ?? m?.id_controle;
    const ctrl = ctrlId ? controleMap.get(ctrlId) : undefined;
    const classe = classificarRespostaPanorama(r.resposta, ctrl?.diagnostico);
    if (classe === "registrado") badgeCounts.jaRegistrado += 1;
    else if (classe === "atencao") {
      badgeCounts.atencao += 1;
      atencoes.push(
        medidaContexto(m, ctrl, r.justificativa ? String(r.justificativa).trim() : null)
      );
    } else if (classe === "lacuna") {
      badgeCounts.lacunas += 1;
      lacunas.push(
        medidaContexto(m, ctrl, r.justificativa ? String(r.justificativa).trim() : null)
      );
    } else if (classe === "nao_avaliado") badgeCounts.naoAvaliado += 1;
    else if (classe === "nao_se_aplica") badgeCounts.naoSeAplica += 1;
  }

  lacunas.sort((a, b) => (a.idMedida || "").localeCompare(b.idMedida || ""));
  atencoes.sort((a, b) => (a.idMedida || "").localeCompare(b.idMedida || ""));

  const riscos = (riscosRes.data || []).map((r) => ({
    id: r.id as number,
    titulo: String(r.titulo || ""),
    descricao: sanitizePanoramaEncarregadoText(r.descricao != null ? String(r.descricao) : null),
    probabilidade: String(r.probabilidade || "medio"),
    impacto: String(r.impacto || "medio"),
    score_residual: r.score_residual as number | null,
    score_inerente: r.score_inerente as number | null,
    status: String(r.status || "identificado"),
    estrategia_mitigacao: sanitizePanoramaEncarregadoText(
      r.estrategia_mitigacao != null ? String(r.estrategia_mitigacao) : null
    ),
    categoria: r.categoria != null ? String(r.categoria) : null,
  }));

  const riscosAbertosAlto = riscos.filter(
    (r) =>
      r.status !== "encerrado" &&
      r.status !== "mitigado" &&
      r.status !== "aceito" &&
      (r.score_residual ?? r.score_inerente ?? 0) >= 12
  );
  const planosCriticos = (planosRes.data || []).filter(
    (p) => String(p.prioridade || "").toLowerCase() === "critica"
  ).length;
  badgeCounts.riscosPrioridadeAlta = riscosAbertosAlto.length;
  badgeCounts.planosCriticos = planosCriticos;
  badgeCounts.prioridadeAlta = riscosAbertosAlto.length + planosCriticos;

  const politicas = politicasRes.data || [];
  const politicasComTexto = politicas.filter((p) => politicaTemTexto(p.secoes)).length;
  const politicasPublicadas = politicas.filter(
    (p) => p.status === "publicado" && politicaTemTexto(p.secoes)
  ).length;

  const comResposta = rows.filter((r) => r.resposta != null && r.resposta !== "").length;

  const exposicao = riscosAbertosAlto.slice(0, 8).map((r) => {
    const bruto =
      [r.descricao, r.estrategia_mitigacao].filter(Boolean).join(" ").trim() || r.titulo;
    return {
      titulo: r.titulo,
      texto: sanitizePanoramaEncarregadoText(bruto) ?? r.titulo,
    };
  });

  const sistemasInventario = (sistemasRes.data || []).map((s) => ({
    id: s.id as number,
    nome: String(s.nome || "").trim(),
    descricao: s.descricao != null ? String(s.descricao).trim() : null,
    tipo: s.tipo != null ? String(s.tipo).trim() : null,
    critico: Boolean(s.critico),
  }));

  const mapeamentoNomes = (mapRes.data || [])
    .map((r) => String(r.nome || "").trim())
    .filter(Boolean);
  const ropaNomes = (ropaRes.data || [])
    .map((r) => String(r.nome || "").trim())
    .filter(Boolean);
  const ripdTitulos = (ripdRes.data || [])
    .map((r) => String(r.titulo || "").trim())
    .filter(Boolean);
  const fornecedorNomes = (fornRes.data || [])
    .map((r) => String(r.nome || "").trim())
    .filter(Boolean);

  const politicaRotulos = politicas
    .filter((p) => politicaTemTexto(p.secoes))
    .map((p) => {
      const rotulo = politicaRotulo(String(p.tipo_politica || ""));
      return p.status === "publicado" ? `${rotulo} (publicado)` : rotulo;
    });

  const planos = (planosRes.data || []).map((p) => ({
    id: p.id as number,
    titulo: String(p.titulo || ""),
    descricao: sanitizePanoramaEncarregadoText(p.descricao != null ? String(p.descricao) : null),
    prioridade: p.prioridade != null ? String(p.prioridade) : null,
    status: p.status != null ? String(p.status) : null,
    data_fim_prevista: p.data_fim_prevista != null ? String(p.data_fim_prevista) : null,
    responsavel: sanitizePanoramaResponsavelNome(
      p.responsavel != null ? String(p.responsavel) : null
    ),
  }));

  const existenciasBlock: PanoramaSnapshot["existencias"] = {
    /** Panorama: cargo do encarregado só conta após confirmação do cliente. */
    encarregadoIndicado: false,
    /** Panorama não expõe nome do encarregado até confirmação do cliente. */
    encarregadoNome: null,
    slugPortal: programaRes.data?.slug?.trim() || null,
    mapeamentos: mapRes.count ?? mapeamentoNomes.length,
    ropa: ropaRes.count ?? ropaNomes.length,
    ripd: ripdRes.count ?? ripdTitulos.length,
    sistemas: sistemasInventario.length,
    fornecedores: fornRes.count ?? fornecedorNomes.length,
    riscos: riscos.length,
    planosAbertos: planos.length,
    politicasComTexto,
    politicasPublicadas,
    medidasRespondidas: comResposta,
    medidasTotal: rows.length,
    linksEvidencia: evidCount.count ?? 0,
  };

  const indiceEntregas = buildIndiceEntregas({
    existencias: existenciasBlock,
    mapeamentoNomes,
    ropaNomes,
    ripdTitulos,
    fornecedorNomes,
    sistemasNomes: sistemasInventario.map((s) => s.nome),
    politicaRotulos,
    riscosTitulos: riscos.map((r) => r.titulo).filter(Boolean),
    planosTitulos: planos.map((p) => p.titulo).filter(Boolean),
    temExposicao: exposicao.length > 0,
  });

  return {
    geradoEm: new Date().toISOString(),
    badges: { ...badgeCounts, totalMedidas: rows.length },
    existencias: existenciasBlock,
    indiceEntregas,
    lacunas: lacunas.slice(0, 30),
    atencoes: atencoes.slice(0, 20),
    riscos,
    exposicao,
    planos,
    sistemasInventario,
  };
}