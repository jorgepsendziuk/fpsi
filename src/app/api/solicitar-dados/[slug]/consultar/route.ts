import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export type PedidoComplementoPublico = {
  texto: string;
  created_at: string;
  prazo_resposta: string | null;
};

/**
 * GET /api/solicitar-dados/[slug]/consultar
 * Consulta pedidos do titular por protocolo e/ou e-mail e/ou documento (CPF).
 * Quem identifica o pedido vê os dados da própria requisição (não inclui observações internas).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const protocolo = searchParams.get("protocolo")?.trim() || null;
    const email = searchParams.get("email")?.trim().toLowerCase() || null;
    const documento = searchParams.get("documento")?.trim().replace(/\D/g, "") || null;

    if (!protocolo && !email && !documento) {
      return NextResponse.json(
        { error: "Informe ao menos um: protocolo, e-mail ou documento (CPF)." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const { data: programa } = await admin
      .from("programa")
      .select("id")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    const programaId = programa.id as number;

    let query = admin
      .from("pedido_titular")
      .select(
        "protocolo, tipo, status, data_prazo_resposta, data_resposta, created_at, updated_at, nome_titular, email_titular, documento_titular, descricao_pedido, complementos"
      )
      .eq("programa_id", programaId);

    if (protocolo) {
      query = query.eq("protocolo", protocolo);
    }
    if (email) {
      query = query.eq("email_titular", email);
    }
    if (documento) {
      query = query.eq("documento_titular", documento);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao consultar pedidos titular:", error);
      return NextResponse.json(
        { error: "Não foi possível consultar. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pedidos: (data || []).map((p) => ({
        protocolo: p.protocolo,
        tipo: p.tipo,
        status: p.status,
        data_prazo_resposta: p.data_prazo_resposta,
        data_resposta: p.data_resposta ?? null,
        created_at: p.created_at,
        updated_at: p.updated_at ?? null,
        nome_titular: p.nome_titular,
        email_titular: p.email_titular,
        documento_titular: p.documento_titular,
        descricao_pedido: p.descricao_pedido,
        complementos: Array.isArray(p.complementos) ? p.complementos : [],
      })),
    });
  } catch (err) {
    console.error("Erro GET solicitar-dados consultar:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
