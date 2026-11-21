import { NextRequest, NextResponse } from "next/server";
import { parseProgramaId, requireProgramaMember } from "@/lib/educacao/acesso";
import { EDU_VERSAO, cargaHorariaMinutos, trilhaPorId } from "@/lib/educacao/catalogo";
import { buildCertificadoPdf } from "@/lib/educacao/certificadoPdf";
import { buildNossaCasa } from "@/lib/educacao/nossaCasa";
import { loadCadastroSnapshot } from "@/lib/programa/loadCadastroSnapshot";

export async function GET(
  request: NextRequest,
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
    const trilhaId = request.nextUrl.searchParams.get("trilha") || "onboarding";
    const trilha = trilhaPorId(trilhaId);
    if (!trilha) return NextResponse.json({ error: "Trilha não encontrada" }, { status: 404 });

    const { data: cert, error } = await auth.supabase
      .from("edu_certificado")
      .select("codigo, emitido_em, nome_exibicao, versao_conteudo, carga_horaria_min")
      .eq("programa_id", programaId)
      .eq("user_id", auth.user.id)
      .eq("trilha_id", trilhaId)
      .order("emitido_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cert) return NextResponse.json({ error: "Certificado ainda não emitido" }, { status: 404 });

    const snap = await loadCadastroSnapshot(auth.supabase, programaId);
    const casa = buildNossaCasa(snap);
    const pdf = await buildCertificadoPdf({
      nome: (cert.nome_exibicao as string) || auth.user.email || "Colaborador",
      trilha: trilha.titulo,
      orgao: casa.orgao,
      codigo: cert.codigo as string,
      emitidoEm: new Date(cert.emitido_em as string).toLocaleString("pt-BR"),
      cargaMinutos: Number(cert.carga_horaria_min || cargaHorariaMinutos(trilhaId)),
      versao: (cert.versao_conteudo as string) || EDU_VERSAO,
      notaMinima: trilha.notaMinima,
    });
    return new NextResponse(Buffer.from(pdf) as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${trilhaId}.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
