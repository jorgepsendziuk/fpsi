"use client";

import { useState, useEffect, useCallback } from "react";

export interface LastActivityResult {
  created_at: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
}

export function useLastActivity(
  programaId: number | undefined | null,
  resourceType?: string,
  resourceId?: number | null,
  enabled = true
) {
  const [lastActivity, setLastActivity] = useState<LastActivityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLastActivity = useCallback(async () => {
    if (!programaId || !enabled) {
      setLastActivity(null);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        programa_id: String(programaId),
      });
      if (resourceType) {
        params.set("resource_type", resourceType);
      }
      if (resourceId != null && resourceId !== undefined) {
        params.set("resource_id", String(resourceId));
      }
      const res = await fetch(`/api/audit/last-activity?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setLastActivity(null);
        return;
      }
      const json = await res.json();
      setLastActivity(json.lastActivity ?? null);
    } catch {
      setLastActivity(null);
    } finally {
      setLoading(false);
    }
  }, [programaId, resourceType, resourceId, enabled]);

  useEffect(() => {
    fetchLastActivity();
  }, [fetchLastActivity]);

  return { lastActivity, loading, refetch: fetchLastActivity };
}
