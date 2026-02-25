import { useState, useEffect } from "react";
import * as dataService from "@/lib/services/dataService";

/**
 * Resolve o parâmetro de rota (id numérico ou slug) para o programa e retorna o id.
 * Usado em páginas sob /programas/[id]/... para suportar URL por slug.
 */
export function useProgramaIdFromParam(idOrSlug: string | undefined) {
  const [programaId, setProgramaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(!!idOrSlug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) {
      setProgramaId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    dataService
      .fetchProgramaByIdOrSlug(idOrSlug)
      .then((programa) => {
        setProgramaId(programa?.id ?? null);
      })
      .catch((err) => {
        console.error("useProgramaIdFromParam:", err);
        setError("Programa não encontrado");
        setProgramaId(null);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  return { programaId, loading, error };
}
