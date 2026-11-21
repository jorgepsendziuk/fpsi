import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCadastroSnapshot } from "@/lib/programa/loadCadastroSnapshot";
import {
  EDU_VERSAO,
  cargaHorariaMinutos,
  trilhaPorId,
  type EduTrilha,
} from "./catalogo";
import { corrigirModulo } from "./corrigir";
import { buildNossaCasa, type NossaCasa } from "./nossaCasa";
import {
  avaliarTrilha,
  coberturaCsv,
  codigoCertificado,
  prazoConclusao,
  reciclagemDevida,
  resumirCobertura,
  type LinhaCobertura,
} from "./progresso";

const GESTAO = new Set(["admin", "coordenador", "auditor"]);

type MatriculaRow = {
  id: number;
  user_id: string;
  trilha_id: string;
  status: string;
  progresso: number;
  versao_conteudo: string;
  vence_em: string | null;
  concluido_em: string | null;
};

type ProgressoRow = {
  user_id: string;
  trilha_id: string;
  modulo_id: string;
  melhor_nota: number;
  aprovado: boolean;
};

type CertRow = {
  user_id: string;
  trilha_id: string;
  codigo: string;
  versao_conteudo: string;
  emitido_em: string;
  nome_exibicao: string;
};

type LeituraRow = { user_id: string; tipo: string; ref_id: string };

export type EstadoEducacao = {
  versao: string;
  podeGerir: boolean;
  nossaCasa: NossaCasa;
  matriculas: Array<MatriculaRow & { reciclagemDevida: boolean }>;
  progresso: ProgressoRow[];
  leituras: Array<{ tipo: string; refId: string }>;
  certificados: CertRow[];
  cobertura: {
    resumo: { total: number; concluidos: number; percentual: number };
    linhas: LinhaCobertura[];
    csv: string;
  } | null;
};

export async function papelNoPrograma(
  supabase: SupabaseClient,
  programaId: number,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("programa_users")
    .select("role")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return (data?.role as string) || null;
}

export function podeGerirEducacao(role: string | null): boolean {
  return role !== null && GESTAO.has(role);
}

export async function carregarEstado(
  supabase: SupabaseClient,
  programaId: number,
  userId: string,
  podeGerir: boolean,
  admin: SupabaseClient | null
): Promise<EstadoEducacao> {
  const snap = await loadCadastroSnapshot(supabase, programaId);
  const [matriculasRes, progressoRes, leituraRes, certRes] = await Promise.all([
    supabase.from("edu_matricula").select("*").eq("programa_id", programaId),
    supabase.from("edu_progresso_modulo").select("*").eq("programa_id", programaId),
    supabase.from("edu_leitura").select("user_id, tipo, ref_id").eq("programa_id", programaId),
    supabase.from("edu_certificado").select("*").eq("programa_id", programaId).order("emitido_em", { ascending: false }),
  ]);
  for (const res of [matriculasRes, progressoRes, leituraRes, certRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const matriculas = (matriculasRes.data || []) as MatriculaRow[];
  const progresso = (progressoRes.data || []) as ProgressoRow[];
  const leituras = (leituraRes.data || []) as LeituraRow[];
  const certificados = (certRes.data || []) as CertRow[];
  const onboarding = trilhaPorId("onboarding");

  const minhasMatriculas = matriculas
    .filter((m) => m.user_id === userId)
    .map((m) => ({
      ...m,
      reciclagemDevida: reciclagemDevida(
        m.concluido_em,
        trilhaPorId(m.trilha_id)?.reciclagemMeses ?? 12
      ),
    }));

  let cobertura: EstadoEducacao["cobertura"] = null;
  if (podeGerir && onboarding) {
    const { data: members, error } = await supabase
      .from("programa_users")
      .select("user_id, role, status")
      .eq("programa_id", programaId)
      .eq("status", "accepted");
    if (error) throw new Error(error.message);
    const ids = (members || []).map((m: { user_id: string }) => m.user_id);
    const nomes = await nomesDosUsuarios(admin, ids);
    const linhas: LinhaCobertura[] = ids.map((id) => {
      const mat = matriculas.find((m) => m.user_id === id && m.trilha_id === "onboarding");
      const prog = progresso.filter((p) => p.user_id === id && p.trilha_id === "onboarding");
      const nossa = leituras.some(
        (l) => l.user_id === id && l.tipo === "nossa_casa" && l.ref_id === "bloco"
      );
      const avaliacao = avaliarTrilha({
        trilha: onboarding,
        progresso: prog.map((p) => ({
          moduloId: p.modulo_id,
          aprovado: p.aprovado,
          melhorNota: p.melhor_nota,
        })),
        nossaCasaLida: nossa,
      });
      const recicla = reciclagemDevida(mat?.concluido_em, onboarding.reciclagemMeses);
      return {
        userId: id,
        nome: nomes[id] || id,
        onboardingStatus: mat?.status || "nao_iniciado",
        onboardingProgresso: avaliacao.progresso,
        onboardingConcluido: Boolean(mat?.status === "concluido" && !recicla),
        reciclagemDevida: recicla,
      };
    });
    cobertura = { resumo: resumirCobertura(linhas), linhas, csv: coberturaCsv(linhas) };
  }

  return {
    versao: EDU_VERSAO,
    podeGerir,
    nossaCasa: buildNossaCasa(snap),
    matriculas: minhasMatriculas,
    progresso: progresso.filter((p) => p.user_id === userId),
    leituras: leituras
      .filter((l) => l.user_id === userId)
      .map((l) => ({ tipo: l.tipo, refId: l.ref_id })),
    certificados: certificados.filter((c) => c.user_id === userId),
    cobertura,
  };
}

async function nomesDosUsuarios(
  admin: SupabaseClient | null,
  ids: string[]
): Promise<Record<string, string>> {
  if (!admin || ids.length === 0) return {};
  const { data } = await admin.from("profiles").select("user_id, nome, email").in("user_id", ids);
  const map: Record<string, string> = {};
  for (const row of data || []) {
    const nome = (row.nome as string) || (row.email as string) || "";
    if (nome) map[row.user_id as string] = nome;
  }
  return map;
}

export async function nomeDoUsuario(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<string> {
  const { data } = await supabase.from("profiles").select("nome, email").eq("user_id", userId).maybeSingle();
  return (data?.nome as string) || (data?.email as string) || email || "Colaborador";
}

type Acao =
  | { acao: "quiz"; trilhaId: string; moduloId: string; respostas: number[] }
  | { acao: "ler_nossa_casa"; trilhaId: string }
  | { acao: "ler_cartilha"; trilhaId: string; cartilhaId: string }
  | { acao: "iniciar_reciclagem"; trilhaId: string };

export async function aplicarAcao(
  supabase: SupabaseClient,
  programaId: number,
  userId: string,
  nome: string,
  body: Acao
): Promise<Record<string, unknown>> {
  const trilha = trilhaPorId(body.trilhaId);
  if (!trilha) throw new Error("Trilha não encontrada");
  await garantirMatricula(supabase, programaId, userId, trilha);

  if (body.acao === "ler_nossa_casa") {
    await registrarLeitura(supabase, programaId, userId, "nossa_casa", "bloco");
  } else if (body.acao === "ler_cartilha") {
    await registrarLeitura(supabase, programaId, userId, "cartilha", body.cartilhaId);
  } else if (body.acao === "iniciar_reciclagem") {
    await supabase
      .from("edu_progresso_modulo")
      .update({ aprovado: false, melhor_nota: 0, updated_at: new Date().toISOString() })
      .eq("programa_id", programaId)
      .eq("user_id", userId)
      .eq("trilha_id", trilha.id);
    await supabase
      .from("edu_matricula")
      .update({ status: "em_andamento", progresso: 0, concluido_em: null, updated_at: new Date().toISOString() })
      .eq("programa_id", programaId)
      .eq("user_id", userId)
      .eq("trilha_id", trilha.id);
  } else if (body.acao === "quiz") {
    const resultado = corrigirModulo(body.moduloId, body.respostas || [], trilha.notaMinima);
    if (!resultado) throw new Error("Módulo não encontrado");
    if (!trilha.moduloIds.includes(body.moduloId)) throw new Error("Módulo fora da trilha");
    const { data: atual } = await supabase
      .from("edu_progresso_modulo")
      .select("melhor_nota, aprovado")
      .eq("programa_id", programaId)
      .eq("user_id", userId)
      .eq("trilha_id", trilha.id)
      .eq("modulo_id", body.moduloId)
      .maybeSingle();
    const melhor = Math.max(Number(atual?.melhor_nota || 0), resultado.nota);
    const aprovado = Boolean(atual?.aprovado) || resultado.aprovado;
    const { error: upErr } = await supabase.from("edu_progresso_modulo").upsert(
      {
        programa_id: programaId,
        user_id: userId,
        trilha_id: trilha.id,
        modulo_id: body.moduloId,
        melhor_nota: melhor,
        aprovado,
        lido_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "programa_id,user_id,trilha_id,modulo_id" }
    );
    if (upErr) throw new Error(upErr.message);
    const { error: tentErr } = await supabase.from("edu_tentativa_quiz").insert({
      programa_id: programaId,
      user_id: userId,
      trilha_id: trilha.id,
      modulo_id: body.moduloId,
      nota: resultado.nota,
      acertos: resultado.acertos,
      total: resultado.total,
      aprovado: resultado.aprovado,
      respostas: body.respostas || [],
    });
    if (tentErr) throw new Error(tentErr.message);
    const certificado = await sincronizarMatricula(supabase, programaId, userId, nome, trilha);
    return { resultado, certificado };
  }

  const certificado = await sincronizarMatricula(supabase, programaId, userId, nome, trilha);
  return { certificado };
}

async function garantirMatricula(
  supabase: SupabaseClient,
  programaId: number,
  userId: string,
  trilha: EduTrilha
) {
  const { data } = await supabase
    .from("edu_matricula")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("trilha_id", trilha.id)
    .maybeSingle();
  if (data) return;
  const agora = new Date().toISOString();
  const { error } = await supabase.from("edu_matricula").insert({
    programa_id: programaId,
    user_id: userId,
    trilha_id: trilha.id,
    status: "em_andamento",
    progresso: 0,
    versao_conteudo: EDU_VERSAO,
    vence_em: prazoConclusao(agora, trilha.prazoDias),
  });
  if (error) throw new Error(error.message);
}

async function registrarLeitura(
  supabase: SupabaseClient,
  programaId: number,
  userId: string,
  tipo: string,
  refId: string
) {
  const { error } = await supabase.from("edu_leitura").upsert(
    {
      programa_id: programaId,
      user_id: userId,
      tipo,
      ref_id: refId,
      lido_em: new Date().toISOString(),
    },
    { onConflict: "programa_id,user_id,tipo,ref_id" }
  );
  if (error) throw new Error(error.message);
}

async function sincronizarMatricula(
  supabase: SupabaseClient,
  programaId: number,
  userId: string,
  nome: string,
  trilha: EduTrilha
) {
  const { data: prog } = await supabase
    .from("edu_progresso_modulo")
    .select("modulo_id, aprovado, melhor_nota")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("trilha_id", trilha.id);
  const { data: leitura } = await supabase
    .from("edu_leitura")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("tipo", "nossa_casa")
    .eq("ref_id", "bloco")
    .maybeSingle();
  const avaliacao = avaliarTrilha({
    trilha,
    progresso: (prog || []).map((p) => ({
      moduloId: p.modulo_id as string,
      aprovado: Boolean(p.aprovado),
      melhorNota: Number(p.melhor_nota || 0),
    })),
    nossaCasaLida: Boolean(leitura),
  });
  const { data: mat } = await supabase
    .from("edu_matricula")
    .select("concluido_em")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("trilha_id", trilha.id)
    .maybeSingle();
  const agora = new Date().toISOString();
  const jaTinhaConclusao = Boolean(mat?.concluido_em);
  const concluidoEm = avaliacao.concluida ? (mat?.concluido_em as string) || agora : null;
  await supabase
    .from("edu_matricula")
    .update({
      progresso: avaliacao.progresso,
      status: avaliacao.concluida ? "concluido" : "em_andamento",
      concluido_em: concluidoEm,
      versao_conteudo: EDU_VERSAO,
      updated_at: agora,
    })
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("trilha_id", trilha.id);

  if (!avaliacao.concluida) return null;
  if (jaTinhaConclusao) {
    const { data: existente } = await supabase
      .from("edu_certificado")
      .select("codigo, emitido_em, versao_conteudo")
      .eq("programa_id", programaId)
      .eq("user_id", userId)
      .eq("trilha_id", trilha.id)
      .order("emitido_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    return existente;
  }
  const codigo = codigoCertificado({
    programaId,
    trilhaId: trilha.id,
    versao: EDU_VERSAO,
    nonce: `${userId.replace(/-/g, "").slice(0, 4)}${Math.random().toString(16).slice(2, 8)}`,
  });
  const { data, error } = await supabase
    .from("edu_certificado")
    .insert({
      programa_id: programaId,
      user_id: userId,
      trilha_id: trilha.id,
      codigo,
      versao_conteudo: EDU_VERSAO,
      carga_horaria_min: cargaHorariaMinutos(trilha.id),
      nome_exibicao: nome,
      emitido_em: agora,
    })
    .select("codigo, emitido_em, versao_conteudo")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
