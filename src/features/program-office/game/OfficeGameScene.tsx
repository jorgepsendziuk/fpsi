"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NextLink from "next/link";
import type { Programa, Responsavel } from "@/lib/types/types";
import type { ModulosResumoApi } from "@/lib/services/dataService";
import type { GovernancaGruposMembros } from "@/lib/services/dataService";
import { hrefEstruturaGovernanca } from "@/lib/governanca/abaGovernanca";
import { COMITES, MESA_PAPéis_ORDER, idResponsavelPapel, type TipoComite } from "../governancaPapeis";
import type { CampoResponsavelProgramaId } from "@/content/governancaOrientacaoPrograma";
import { OfficeExperienceProvider } from "./OfficeExperienceContext";
import { OfficeIframeModal } from "./OfficeIframeModal";
import { OfficeRpgWorld } from "./OfficeRpgWorld";
import { rpgPixelFont } from "./rpgGameFont";

export type OfficeGameSceneProps = {
  idOrSlug: string;
  programa: Programa;
  nomePorResponsavelId: Map<number, string>;
  membros: GovernancaGruposMembros;
  resumo: ModulosResumoApi | null;
  resumoLoading: boolean;
  responsaveis: Responsavel[];
};

export function OfficeGameScene({
  idOrSlug,
  programa,
  nomePorResponsavelId,
  membros,
  resumo,
  resumoLoading,
  responsaveis,
}: OfficeGameSceneProps) {
  const base = `/programas/${idOrSlug}`;
  const equipeHref = hrefEstruturaGovernanca(idOrSlug, "equipe");
  const c = resumo?.conformidade;
  const matCount = resumo?.maturidade?.length ?? 0;

  const gruposDept = useMemo(() => {
    const m = new Map<string, Responsavel[]>();
    for (const r of responsaveis) {
      const key = (r.departamento && String(r.departamento).trim()) || "Sem departamento";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [responsaveis]);

  const boardPosters = useMemo(
    () => [
      {
        key: "gov",
        title: "Estrutura de tratamento",
        line: resumoLoading
          ? "…"
          : resumo
            ? `${resumo.responsabilidades.papeisInstituicoes} instituições`
            : "—",
        href: `${base}/responsabilidades`,
      },
      {
        key: "mat",
        title: "Maturidade",
        line: resumoLoading ? "…" : `${matCount} índice(s)`,
        href: `${base}/diagnostico`,
      },
      {
        key: "risk",
        title: "Dados e riscos",
        line: resumoLoading
          ? "…"
          : c
            ? `${c.ropaOperacoes} ROPA · ${c.ripd} RIPD · ${c.incidentes} inc.`
            : "—",
        href: `${base}/conformidade`,
      },
    ],
    [base, resumo, resumoLoading, matCount, c],
  );

  const mesaSlots = useMemo(() => {
    const byId = new Map(responsaveis.map((r) => [r.id, r]));
    return MESA_PAPéis_ORDER.map(({ campo, rotulo, chefe }) => {
      const rid = idResponsavelPapel(programa, campo as CampoResponsavelProgramaId);
      const nome = rid != null ? nomePorResponsavelId.get(rid) : null;
      const definido = Boolean(nome?.trim());
      const r = rid != null ? byId.get(rid) : undefined;
      const cargoSetorLine = [r?.cargo?.trim(), r?.departamento?.trim()].filter(Boolean).join(" · ");
      return {
        campo,
        rotulo,
        chefe,
        label: definido ? nome! : "A designar",
        empty: !definido,
        responsavelId: rid ?? null,
        cargoSetorLine,
      };
    });
  }, [programa, nomePorResponsavelId, responsaveis]);

  const chips = useMemo(
    () => [
      {
        key: "mat",
        label: "Maturidade",
        detail: resumoLoading ? "…" : `${matCount} diag.`,
        href: `${base}/diagnostico`,
      },
      {
        key: "plano",
        label: "Plano",
        detail:
          resumoLoading ? "…" : resumo ? `${resumo.planoAcao.comResposta}/${resumo.planoAcao.total}` : "—",
        href: `${base}/planos-acao`,
      },
      {
        key: "risk",
        label: "Riscos",
        detail: resumoLoading ? "…" : c ? `${c.ropaOperacoes}/${c.ripd}/${c.incidentes}` : "—",
        href: `${base}/conformidade`,
      },
      {
        key: "pol",
        label: "Políticas",
        detail:
          resumoLoading ? "…" : resumo ? `${resumo.politicas.implementadas} impl.` : "—",
        href: `${base}/politicas`,
      },
    ],
    [base, resumo, resumoLoading, matCount, c],
  );

  const committeeTypesOrdered = useMemo(
    () => ["comite_seguranca_informacao", "etir", "comite_protecao_dados"] as TipoComite[],
    [],
  );

  const committeesAll = useMemo(
    () =>
      committeeTypesOrdered.map((tipo) => {
        const com = COMITES.find((c) => c.tipo === tipo)!;
        const ids = membros[com.tipo] || [];
        return {
          tipo: com.tipo,
          title: com.subtitulo,
          subtitle: com.titulo,
          href: hrefEstruturaGovernanca(idOrSlug, com.aba),
          count: ids.length,
          memberIds: ids,
        };
      }),
    [idOrSlug, membros, committeeTypesOrdered],
  );

  return (
    <OfficeExperienceProvider
      idOrSlug={idOrSlug}
      base={base}
      equipeHref={equipeHref}
      programa={programa}
      nomePorResponsavelId={nomePorResponsavelId}
      responsaveis={responsaveis}
      membros={membros}
      resumo={resumo}
      resumoLoading={resumoLoading}
      gruposDept={gruposDept}
      boardPosters={boardPosters}
      mesaSlots={mesaSlots}
      chips={chips}
      committeesAll={committeesAll}
    >
      <Box
        className={rpgPixelFont.className}
        sx={{ position: "relative", width: "100%", height: "100dvh", minHeight: 480, overflow: "hidden" }}
      >
        <IconButton
          component={NextLink}
          href={base}
          size="small"
          aria-label="Voltar ao programa"
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1400,
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <OfficeRpgWorld />
        <OfficeIframeModal />
      </Box>
    </OfficeExperienceProvider>
  );
}
