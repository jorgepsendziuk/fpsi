import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

const TIPOS_VALIDOS = new Set([
  "acesso",
  "correcao",
  "exclusao",
  "portabilidade",
  "revogacao_consentimento",
]);

/**
 * POST /api/solicitar-dados/[slug]/enviar
 * Recebe pedido do titular pelo formulário público (sem auth).
 * Usa service role para inserir. Retorna protocolo.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY não configurada");
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
    const body = await request.json();
    const tipo = body.tipo && String(body.tipo).trim().toLowerCase();
    const nome_titular = body.nome_titular ? String(body.nome_titular).trim() : "";
    const email_titular = body.email_titular ? String(body.email_titular).trim() : "";
    const docRaw = body.documento_titular ? String(body.documento_titular).trim() : "";
    const documento_titular = docRaw ? docRaw.replace(new RegExp("\\D", "g"), "") || null : null;
    const descricao_pedido = body.descricao_pedido ? String(body.descricao_pedido).trim() : null;

    if (!tipo || !TIPOS_VALIDOS.has(tipo)) {
      return NextResponse.json(
        { error: "Tipo de pedido inválido. Use: acesso, correcao, exclusao, portabilidade, revogacao_consentimento" },
        { status: 400 }
      );
    }
    if (!nome_titular || !email_titular) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    const payload = {
      programa_id: programaId,
      tipo,
      nome_titular,
      email_titular,
      documento_titular: documento_titular || null,
      descricao_pedido: descricao_pedido || null,
      status: "recebido",
      origem: "formulario_publico",
    };

    const { data, error } = await admin
      .from("pedido_titular")
      .insert(payload)
      .select("id, protocolo, created_at")
      .single();

    if (error) {
      console.error("Erro ao criar pedido titular:", error);
      return NextResponse.json(
        { error: "Não foi possível registrar seu pedido. Tente novamente ou entre em contato.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      protocolo: data.protocolo || "",
      mensagem: "Pedido registrado. Guarde o número do protocolo para acompanhamento.",
      id: data.id,
    });
  } catch (error) {
    console.error("Erro POST solicitar-dados enviar:", error);
    return NextResponse.json(
      {
        error: "Erro interno. Tente novamente.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
