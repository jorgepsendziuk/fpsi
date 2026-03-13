import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";
import { ActivityAction, type ResourceType, type AuditOrigem } from "@/lib/types/user";

const VALID_ACTIONS: ActivityAction[] = [
  ActivityAction.CREATE, ActivityAction.UPDATE, ActivityAction.DELETE, ActivityAction.VIEW,
  ActivityAction.APPROVE, ActivityAction.REJECT, ActivityAction.INVITE, ActivityAction.LOGIN,
  ActivityAction.LOGOUT, ActivityAction.EXPORT, ActivityAction.RESTORE, ActivityAction.UPLOAD, ActivityAction.DOWNLOAD
];

const VALID_RESOURCE_TYPES: string[] = [
  "programa", "diagnostico", "controle", "medida", "plano_acao", "politica",
  "relatorio", "user", "pedido_titular", "ropa", "ripd", "incidente", "invite",
  "empresa", "programa_user", "responsavel", "registro_ropa",
  "papel_lgpd_instituicao", "papel_lgpd_vinculo", "profile", "reporte", "contato",
  "cargo", "departamento"
];

/**
 * POST /api/audit/log
 * Registra atividade de auditoria (chamado por APIs e pelo client/dataService).
 * Requer usuário autenticado, exceto quando origem=portal_publico (user_id pode ser null).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { action, resource_type: resourceType, resource_id: resourceId, programa_id: programaId, details, origem = "api" } = body;

    if (!action || !resourceType) {
      return NextResponse.json(
        { error: "action e resource_type são obrigatórios" },
        { status: 400 }
      );
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "action inválido" },
        { status: 400 }
      );
    }

    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      return NextResponse.json(
        { error: "resource_type inválido" },
        { status: 400 }
      );
    }

    // Portal público pode não ter usuário; demais origens exigem auth
    if (origem !== "portal_publico" && !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await logActivity(supabase, {
      userId: user?.id ?? null,
      action: action as ActivityAction,
      resourceType: resourceType as ResourceType,
      resourceId: typeof resourceId === "number" ? resourceId : undefined,
      programaId: typeof programaId === "number" ? programaId : null,
      details: typeof details === "object" && details !== null ? details : undefined,
      origem: ["api", "portal_publico", "sistema"].includes(origem) ? origem as AuditOrigem : "api",
      req: { headers: request.headers },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[audit] Erro POST /api/audit/log:", error);
    if (error instanceof Error) {
      console.error("[audit] Stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Erro ao registrar auditoria" },
      { status: 500 }
    );
  }
}
