import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/portal/[slug]/contato
 * Registra mensagem de contato (portal público, sem auth).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });

    const { data: programa } = await admin.from("programa").select("id").eq("slug", slug.trim()).maybeSingle();
    if (!programa) return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });

    const body = await request.json();
    const nome = body.nome ? String(body.nome).trim() : "";
    const email = body.email ? String(body.email).trim() : "";
    const mensagem = body.mensagem ? String(body.mensagem).trim() : "";
    const assunto = body.assunto ? String(body.assunto).trim() : null;

    if (!nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    if (!mensagem) return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });

    const { error } = await admin.from("programa_contato").insert({
      programa_id: programa.id,
      nome,
      email,
      assunto: assunto || null,
      mensagem,
    });

    if (error) {
      console.error("Erro ao salvar contato:", error);
      return NextResponse.json({ error: "Não foi possível enviar. Tente novamente." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: "Mensagem enviada com sucesso." });
  } catch (e) {
    console.error("Erro POST contato:", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
