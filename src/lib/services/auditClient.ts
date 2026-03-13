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
    const res = await fetch("/api/audit/log", {
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
    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[audit] Falha ao registrar: ${action} ${resourceType} ${resourceId ?? ""} — status ${res.status}`,
        text || res.statusText
      );
    }
  } catch (err) {
    console.error(
      `[audit] Erro de rede ao registrar: ${action} ${resourceType}`,
      err instanceof Error ? err.message : err
    );
  }
}
