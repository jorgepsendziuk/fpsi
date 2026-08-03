"use client";

import { useEffect, useMemo, useState } from "react";
import * as dataService from "@/lib/services/dataService";
import {
  normalizeEscopo,
  resolveProgramaEscopo,
  type PerfilEscopoPreset,
  type ProgramaEscopoV1,
} from "@/lib/programa/perfilEscopo";
import type { Programa } from "@/lib/types/types";

export function useProgramaEscopo(programaId: number | undefined | null) {
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(!!programaId);

  useEffect(() => {
    if (!programaId) {
      setPrograma(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchProgramaById(programaId)
      .then((p) => {
        if (!cancelled) setPrograma(p as Programa);
      })
      .catch(() => {
        if (!cancelled) setPrograma(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const resolved = useMemo(() => {
    if (!programa) {
      return {
        preset: "completo" as PerfilEscopoPreset,
        giAlvo: "G1" as const,
        escopo: normalizeEscopo(null),
      };
    }
    return resolveProgramaEscopo(programa);
  }, [programa]);

  return { programa, loading, ...resolved, escopo: resolved.escopo as ProgramaEscopoV1 };
}
