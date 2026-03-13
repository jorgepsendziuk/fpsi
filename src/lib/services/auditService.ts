/**
 * Serviço de auditoria e rastreabilidade (LGPD art. 37, ANPD, Framework FPSI Controle 8)
 * Registra quem fez o quê, quando e por quê — trilha de auditoria auditável.
 *
 * Considerações LGPD: Não gravar dados pessoais sensíveis em details (ex.: CPF, e-mail do titular).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResourceType, AuditOrigem } from "@/lib/types/user";

export interface LogActivityParams {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: number;
  programaId?: number | null;
  details?: Record<string, unknown>;
  origem?: AuditOrigem;
  req?: {
    headers?: Headers;
  };
}

const VALID_ACTIONS = new Set<string>([
  "create", "update", "delete", "view", "approve", "reject",
  "invite", "login", "logout", "export", "restore", "upload", "download"
]);

function parseIp(header: string | null): string | null {
  if (!header) return null;
  return header.split(",")[0]?.trim() || null;
}

export async function logActivity(
  supabase: SupabaseClient,
  params: LogActivityParams
): Promise<void> {
  const { userId, action, resourceType, resourceId, programaId, details, origem = "api", req } = params;

  if (!VALID_ACTIONS.has(action)) {
    console.warn(`[audit] Ação inválida ignorada: ${action}`);
    return;
  }

  const ip = req?.headers ? parseIp(req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip")) : null;
  const userAgent = req?.headers?.get("user-agent") ?? null;

  const row: Record<string, unknown> = {
    user_id: userId ?? null,
    programa_id: programaId ?? null,
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    details: details ?? null,
    ip_address: ip,
    user_agent: userAgent,
    origem,
  };

  const { error } = await supabase.from("user_activities").insert(row);

  if (error) {
    console.error(
      "[audit] Erro ao registrar atividade:",
      error.message,
      "| código:",
      error.code,
      "| row:",
      JSON.stringify({ action, resourceType, resourceId, programaId })
    );
  }
}
