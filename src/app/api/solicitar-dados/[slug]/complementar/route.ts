import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { logActivity } from "@/lib/services/auditService";
import { notifyDpoTeam, resolveProgramaNotifyEmails } from "@/lib/server/notifyDpo";
import { checkPortalRateLimit } from "@/lib/server/portalRateLimit";

function isoDatePlusDays(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * POST /api/solicitar-dados/[slug]/complementar
 * Titular acrescenta detalhes a um pedido já registrado (protocolo + e-mail ou CPF).
 * Pedidos abertos têm o prazo de resposta renovado em 15 dias.
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

    const rate = checkPortalRateLimit(request, `dsar-comp:${slug.trim()}`);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Muitas solicitações. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const protocolo = body.protocolo ? String(body.protocolo).trim() : "";
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const documento = body.documento ? String(body.documento).trim().replace(/\D/g, "") : "";
    const texto = body.texto ? String(body.texto).trim() : "";

    if (!protocolo) {
      return NextResponse.json({ error: "Informe o protocolo." }, { status: 400 });
    }
    if (!email && !documento) {
      return NextResponse.json(
        { error: "Informe o e-mail ou o CPF usados no pedido para confirmar a identidade." },
        { status: 400 }
      );
    }
    if (texto.length < 8) {
      return NextResponse.json({ error: "Descreva o detalhe (mínimo 8 caracteres)." }, { status: 400 });
    }
    if (texto.length > 4000) {
      return NextResponse.json({ error: "O detalhe deve ter no máximo 4000 caracteres." }, { status: 400 });
    }

    const { data: programa } = await admin
      .from("programa")
      .select("id, nome, slug")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    const programaId = programa.id as number;

    const { data: pedido, error: findError } = await admin
      .from("pedido_titular")
      .select("id, protocolo, status, email_titular, documento_titular, complementos, data_prazo_resposta")
      .eq("programa_id", programaId)
      .eq("protocolo", protocolo)
      .maybeSingle();

    if (findError) {
      console.error("Erro ao localizar pedido titular:", findError);
      return NextResponse.json({ error: "Não foi possível atualizar o pedido." }, { status: 500 });
    }
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado com os dados informados." }, { status: 404 });
    }

    const emailOk = email ? String(pedido.email_titular || "").trim().toLowerCase() === email : false;
    const docPedido = String(pedido.documento_titular || "").replace(/\D/g, "");
    const docOk = documento ? Boolean(docPedido) && docPedido === documento : false;
    if (!emailOk && !docOk) {
      return NextResponse.json({ error: "Pedido não encontrado com os dados informados." }, { status: 404 });
    }

    if (pedido.status === "atendido" || pedido.status === "recusado") {
      return NextResponse.json(
        {
          error:
            "Este pedido já foi encerrado. Para novas informações, abra outra requisição ou use o contato do portal.",
        },
        { status: 409 }
      );
    }

    const aberto = pedido.status === "recebido" || pedido.status === "em_analise" || pedido.status === "parcial";
    const novoPrazo = aberto ? isoDatePlusDays(15) : pedido.data_prazo_resposta ?? isoDatePlusDays(15);
    const nowIso = new Date().toISOString();
    const existentes = Array.isArray(pedido.complementos) ? pedido.complementos : [];
    const complementos = [
      ...existentes,
      { texto, created_at: nowIso, prazo_resposta: novoPrazo },
    ];

    const patch: { complementos: unknown; data_prazo_resposta?: string | null } = { complementos };
    if (aberto) {
      patch.data_prazo_resposta = novoPrazo;
    }

    const { data: atualizado, error: updError } = await admin
      .from("pedido_titular")
      .update(patch)
      .eq("id", pedido.id)
      .select(
        "protocolo, tipo, status, data_prazo_resposta, data_resposta, created_at, updated_at, nome_titular, email_titular, documento_titular, descricao_pedido, complementos"
      )
      .single();

    if (updError || !atualizado) {
      console.error("Erro ao complementar pedido titular:", updError);
      return NextResponse.json({ error: "Não foi possível registrar o detalhe." }, { status: 500 });
    }

    await logActivity(admin, {
      userId: null,
      action: "update",
      resourceType: "pedido_titular",
      resourceId: pedido.id,
      programaId,
      origem: "portal_publico",
      details: { complemento: true, protocolo },
      req: { headers: request.headers },
    });

    const emails = await resolveProgramaNotifyEmails(admin, programaId);
    void notifyDpoTeam({
      event: "novo_dsar",
      programaId,
      programaNome: String(programa.nome || `Programa ${programaId}`),
      programaSlug: (programa.slug as string) || slug.trim(),
      titulo: `Complemento no pedido ${protocolo}`,
      detalhes: texto.slice(0, 280),
      emails,
    });

    return NextResponse.json({
      ok: true,
      pedido: atualizado,
      mensagem: aberto
        ? "Detalhe registrado. O prazo de resposta foi atualizado para 15 dias a partir de hoje."
        : "Detalhe registrado.",
    });
  } catch (error) {
    console.error("Erro POST solicitar-dados complementar:", error);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
