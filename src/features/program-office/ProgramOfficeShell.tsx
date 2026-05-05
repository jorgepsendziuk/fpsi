"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { Alert, Box, Button, LinearProgress } from "@mui/material";
import * as dataService from "@/lib/services/dataService";
import type { Programa, Responsavel } from "@/lib/types/types";
import { OfficeGameScene } from "./game/OfficeGameScene";

export type ProgramOfficeShellProps = {
  idOrSlug: string;
};

export function ProgramOfficeShell({ idOrSlug }: ProgramOfficeShellProps) {
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [membros, setMembros] = useState<dataService.GovernancaGruposMembros>({
    comite_seguranca_informacao: [],
    comite_protecao_dados: [],
    etir: [],
  });
  const [resumo, setResumo] = useState<dataService.ModulosResumoApi | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const trimmed = String(idOrSlug || "").trim();
    if (!trimmed) {
      setNotFound(true);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setLoadError(null);
    setNotFound(false);

    try {
      const p = await dataService.fetchProgramaByIdOrSlug(trimmed);
      if (!p?.id) {
        setPrograma(null);
        setNotFound(true);
        setDataLoading(false);
        return;
      }

      const pid = Number(p.id);
      setPrograma(p as Programa);

      const [r, g, m] = await Promise.all([
        dataService.fetchResponsaveis(pid),
        dataService.fetchGovernancaGruposMembros(pid),
        dataService.fetchModulosResumo(pid).catch(() => null),
      ]);

      setResponsaveis(r || []);
      setMembros(g);
      setResumo(m);
    } catch (e) {
      console.error(e);
      setLoadError("Não foi possível carregar os dados do escritório.");
      setPrograma(null);
    } finally {
      setDataLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const nomePorResponsavelId = useMemo(() => {
    const m = new Map<number, string>();
    for (const r of responsaveis) {
      if (r?.id != null && r.nome) m.set(r.id, r.nome);
    }
    return m;
  }, [responsaveis]);

  if (notFound && !dataLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 560, mx: "auto" }}>
        <Alert severity="error">Programa não encontrado ou sem acesso.</Alert>
        <Button component={NextLink} href="/programas" sx={{ mt: 2 }}>
          Voltar aos programas
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default", position: "relative" }}>
      {dataLoading && <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }} />}

      {loadError && (
        <Alert severity="error" sx={{ position: "fixed", top: 48, left: 16, right: 16, zIndex: 9998 }}>
          {loadError}
        </Alert>
      )}

      {programa && (
        <OfficeGameScene
          idOrSlug={idOrSlug}
          programa={programa}
          nomePorResponsavelId={nomePorResponsavelId}
          membros={membros}
          resumo={resumo}
          resumoLoading={dataLoading && !resumo}
          responsaveis={responsaveis}
        />
      )}
    </Box>
  );
}
