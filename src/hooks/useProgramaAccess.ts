"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProgramaPermissions } from "@/lib/types/user";
import type { ProgramaAccessMode } from "@/lib/authz/programaAccess";

export type ProgramaAccessClient = {
  mode: ProgramaAccessMode;
  role: string | null;
  areaIds: number[];
  controleIds: number[];
  diagnosticoIds: number[];
  modulos: string[];
  isGovernancePapel: boolean;
  permissions: ProgramaPermissions | null;
};

export function useProgramaAccess(programaId?: number) {
  const [access, setAccess] = useState<ProgramaAccessClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!programaId || Number.isNaN(programaId)) {
      setAccess(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/programas/${programaId}/access`);
      if (!res.ok) {
        setAccess(null);
        if (res.status !== 403) setError("Erro ao carregar acesso");
        return;
      }
      const data = (await res.json()) as ProgramaAccessClient;
      setAccess(data);
    } catch {
      setError("Erro ao carregar acesso");
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    access,
    loading,
    error,
    refresh,
    isFull: access?.mode === "full",
    isScoped: access?.mode === "scoped",
    isMinimal: access?.mode === "minimal",
  };
}
