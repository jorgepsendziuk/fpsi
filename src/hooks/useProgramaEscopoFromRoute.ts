"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as dataService from "@/lib/services/dataService";
import { resolveProgramaEscopo, type ProgramaEscopoV1 } from "@/lib/programa/perfilEscopo";
import type { Programa } from "@/lib/types/types";
import { useUserPermissions } from "@/hooks/useUserPermissions";

/** Escopo do programa a partir da rota /programas/[id]. */
export function useProgramaEscopoFromRoute() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dataService
      .fetchProgramaByIdOrSlug(idOrSlug)
      .then((p) => {
        if (!cancelled) setPrograma(p as Programa);
      })
      .catch(() => {
        if (!cancelled) setPrograma(null);
      });
    return () => {
      cancelled = true;
    };
  }, [idOrSlug, version]);

  const { escopo, preset, giAlvo } = resolveProgramaEscopo(programa ?? {});
  const { hasPermission } = useUserPermissions(programa?.id);
  const canEdit = hasPermission("can_edit_programa");

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return {
    programaId: programa?.id ?? null,
    escopo: escopo as ProgramaEscopoV1,
    preset,
    giAlvo,
    canEdit,
    refresh,
  };
}
