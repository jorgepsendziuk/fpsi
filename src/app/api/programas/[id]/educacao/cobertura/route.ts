import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { parseProgramaId, requireProgramaMember } from "@/lib/educacao/acesso";
import { buildCoberturaPdf } from "@/lib/educacao/certificadoPdf";
import { carregarEstado, podeGerirEducacao } from "@/lib/educacao/servico";
import { sha256Hex } from "@/lib/grc/evidenciaLimits";

/** Gera PDF de cobertura e anexa como evidência do Controle 14. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseProgramaId(id);
    if (programaId === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireProgramaMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    if (!podeGerirEducacao(auth.role)) {
      return NextResponse.json({ error: "Apenas gestor, coordenador ou auditor" }, { status: 403 });
    }
    const estado = await carregarEstado(
      auth.supabase,
      programaId,
      auth.user.id,
      true,
      createSupabaseAdminClient()
    );
    const cobertura = estado.cobertura;
    if (!cobertura) return NextResponse.json({ error: "Sem cobertura" }, { status: 400 });

    const linhas = cobertura.linhas.map(
      (l) =>
        `${l.nome} | ${l.onboardingStatus} | ${l.onboardingProgresso}% | concluido=${l.onboardingConcluido ? "sim" : "nao"} | reciclagem=${l.reciclagemDevida ? "sim" : "nao"}`
    );
    const pdf = await buildCoberturaPdf({
      orgao: estado.nossaCasa.orgao,
      emitidoEm: new Date().toLocaleString("pt-BR"),
      resumo: `Onboarding: ${cobertura.resumo.concluidos} de ${cobertura.resumo.total} (${cobertura.resumo.percentual}%).`,
      linhas,
    });
    const buffer = Buffer.from(pdf);
    const hash = await sha256Hex(buffer);
    const titulo = `Cobertura de treinamento LGPD ${new Date().toISOString().slice(0, 10)}`;
    const { data: ev, error } = await auth.supabase
      .from("evidencia")
      .insert({
        programa_id: programaId,
        titulo,
        descricao:
          "Relatório de cobertura da trilha Onboarding (PPSI Controle 14 / art. 41, §2º, III). Códigos de certificado ficam no LMS.",
        categoria: "pdf",
        mime_type: "application/pdf",
        tamanho_bytes: buffer.byteLength,
        nome_arquivo: "cobertura-treinamento-lgpd.pdf",
        conteudo_base64: buffer.toString("base64"),
        sha256: hash,
        versao: estado.versao,
        status: "ativo",
        responsavel_user_id: auth.user.id,
        created_by: auth.user.id,
      })
      .select("id, titulo, sha256")
      .single();
    if (error) throw new Error(error.message);

    const { error: vErr } = await auth.supabase.from("evidencia_vinculo").insert({
      evidencia_id: ev.id,
      programa_id: programaId,
      alvo_tipo: "controle",
      alvo_id: "14",
    });
    if (vErr) throw new Error(vErr.message);

    return NextResponse.json({ evidencia: ev, resumo: cobertura.resumo });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
