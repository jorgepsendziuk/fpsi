import { NextRequest, NextResponse } from "next/server";
import { resolveAuditorAcesso } from "@/lib/auditor/auditorAcesso";
import { nomeDownloadEvidencia } from "@/lib/auditor/auditorArquivoNome";

/**
 * GET /api/auditor/[token]/evidencias/[id]
 * Download autenticado pelo token do portal (sem login, sem PII).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { token, id } = await params;
    const evidId = Number(id);
    if (!Number.isFinite(evidId) || evidId <= 0) {
      return NextResponse.json({ error: "Evidência inválida" }, { status: 400 });
    }

    const acesso = await resolveAuditorAcesso(token, { touch: false });
    if (!acesso.ok) {
      return NextResponse.json({ error: acesso.error }, { status: acesso.status });
    }

    const { data, error } = await acesso.admin
      .from("evidencia")
      .select("id, programa_id, titulo, mime_type, nome_arquivo, url_externa, conteudo_base64, status")
      .eq("id", evidId)
      .eq("programa_id", acesso.programaId)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.status !== "ativo") {
      return NextResponse.json({ error: "Evidência não encontrada" }, { status: 404 });
    }

    if (data.url_externa && !data.conteudo_base64) {
      return NextResponse.redirect(String(data.url_externa));
    }
    if (!data.conteudo_base64) {
      return NextResponse.json({ error: "Arquivo indisponível" }, { status: 404 });
    }

    const buf = Buffer.from(String(data.conteudo_base64), "base64");
    const filename = nomeDownloadEvidencia(
      String(data.titulo || "evidencia"),
      data.mime_type,
      data.nome_arquivo
    );
    const ascii = filename.replace(/[^\x20-\x7E]/g, "_");

    return new NextResponse(buf, {
      headers: {
        "Content-Type": data.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(buf.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("auditor evidencia download", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
