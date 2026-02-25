import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

const TIPOS = new Set(["vulnerabilidade", "incidente"]);

/**
 * POST /api/portal/[slug]/reportar
 * Registra reporte de vulnerabilidade ou incidente (portal público, sem auth).
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
    const tipo = body.tipo && String(body.tipo).trim().toLowerCase();
    const email = body.email ? String(body.email).trim() : "";
    const descricao = body.descricao ? String(body.descricao).trim() : "";
    const nome = body.nome ? String(body.nome).trim() : null;

    if (!tipo || !TIPOS.has(tipo)) return NextResponse.json({ error: "Tipo deve ser vulnerabilidade ou incidente" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    if (!descricao) return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });

    const { error } = await admin.from("programa_reportes").insert({
      programa_id: programa.id,
      tipo,
      nome: nome || null,
      email,
      descricao,
    });

    if (error) {
      console.error("Erro ao salvar reporte:", error);
      return NextResponse.json({ error: "Não foi possível enviar. Tente novamente." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: "Reporte recebido com sucesso." });
  } catch (e) {
    console.error("Erro POST reportar:", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
