/**
 * Helper para registrar atividades de auditoria a partir do client (dataService, etc.).
 * Fire-and-forget: não bloqueia a UI.
 */

export interface LogActivityFromClientParams {
  action: string;
  resourceType: string;
  resourceId?: number;
  programaId?: number;
  details?: Record<string, unknown>;
}

export async function logActivityFromClient(params: LogActivityFromClientParams): Promise<void> {
  const { action, resourceType, resourceId, programaId, details } = params;
  try {
    await fetch("/api/audit/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        programa_id: programaId,
        details,
        origem: "api",
      }),
    });
  } catch {
    // Fire-and-forget: não propagar erro para não afetar o fluxo principal
  }
}
