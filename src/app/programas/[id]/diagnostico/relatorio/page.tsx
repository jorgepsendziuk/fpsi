"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  GlobalStyles,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import { useParams, useRouter } from "next/navigation";
import * as dataService from "@/lib/services/dataService";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { useMaturityCache } from "@/components/diagnostico/hooks/useMaturityCache";
import PoliticaStylePrintHeader from "@/components/diagnostico/relatorio/PoliticaStylePrintHeader";
import type { Controle, Diagnostico, Medida, ProgramaMedida } from "@/lib/types/types";
import type { PoliticaProgramaDados } from "@/lib/utils/politicaPlaceholders";
import { alpha } from "@mui/material/styles";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import DescriptionIcon from "@mui/icons-material/Description";

const DOC_TITLE = "RELATÓRIO DE TODOS OS CONTROLES";
const COL_INDICADOR = "Indicador de Maturidade do Controle";

const TABLE_BORDER = "1px solid #000";
const HEADER_BG = "#424242";


/** Barra ISEG / IPRIV (três faixas), acima da tabela de controles — alinhado à planilha oficial. */
function IndiceMaturityBar(props: {
  code: "ISEG" | "IPRIV";
  scoreText: string;
  nivelLabel: string;
}) {
  const { code, scoreText, nivelLabel } = props;
  /** Três tons por faixa; todos escuros o suficiente para texto branco legível. */
  const iseg =
    code === "ISEG"
      ? {
          left: "#0d47a1",
          mid: "#1565c0",
          right: "#1976d2",
        }
      : {
          left: "#bf360c",
          mid: "#d84315",
          right: "#e64a19",
        };

  return (
    <Box
      className="relatorio-indice-bar"
      sx={{
        display: "flex",
        width: "100%",
        border: TABLE_BORDER,
        mb: 1.5,
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      <Box
        sx={{
          flex: "0 0 18%",
          minWidth: 72,
          bgcolor: iseg.left,
          color: "#fff",
          py: 1.25,
          px: 1.5,
          fontWeight: 800,
          fontSize: "0.85rem",
          letterSpacing: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {code}
      </Box>
      <Box
        sx={{
          flex: "1 1 38%",
          bgcolor: iseg.mid,
          color: "#fff",
          py: 1.25,
          px: 1,
          fontWeight: 700,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {scoreText}
      </Box>
      <Box
        sx={{
          flex: "1 1 44%",
          bgcolor: iseg.right,
          color: "#fff",
          py: 1.25,
          px: 1,
          fontWeight: 700,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {nivelLabel}
      </Box>
    </Box>
  );
}

function formatScoreBr(score: number): string {
  return score.toFixed(2).replace(".", ",");
}

export default function DiagnosticoRelatorioPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId: resolvedProgramaId, loading: resolvingId } = useProgramaIdFromParam(idOrSlug);
  const programaId = resolvedProgramaId ?? 0;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programa, setPrograma] = useState<PoliticaProgramaDados>(null);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [controlesPorDiag, setControlesPorDiag] = useState<Record<number, Controle[]>>({});
  const [medidasPorControle, setMedidasPorControle] = useState<Record<number, Medida[]>>({});
  const [programaMedidas, setProgramaMedidas] = useState<Record<string, ProgramaMedida>>({});

  const { getControleMaturity, getDiagnosticoMaturity } = useMaturityCache(programaId, programaMedidas);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const [diagList, prog, pmMap] = await Promise.all([
        dataService.fetchDiagnosticos(),
        dataService.fetchProgramaById(programaId),
        dataService.fetchAllProgramaMedidas(programaId),
      ]);
      setPrograma(prog ?? null);
      setProgramaMedidas(pmMap || {});
      const sorted = [...(diagList || [])].sort((a, b) => a.indice - b.indice);
      setDiagnosticos(sorted);

      const ctrs: Record<number, Controle[]> = {};
      const medMap: Record<number, Medida[]> = {};

      await Promise.all(
        sorted.map(async (d) => {
          const list = await dataService.fetchControles(d.id, programaId);
          ctrs[d.id] = list || [];
        })
      );

      const controleIds = Object.values(ctrs)
        .flat()
        .map((c) => c.id);

      await Promise.all(
        controleIds.map(async (cid) => {
          const m = await dataService.fetchMedidas(cid, programaId);
          medMap[cid] = m || [];
        })
      );

      setControlesPorDiag(ctrs);
      setMedidasPorControle(medMap);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar o relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    if (programaId) void load();
  }, [programaId, load]);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const sections = useMemo(() => {
    if (!programaId) return [];
    return diagnosticos.map((d) => {
      const controles = [...(controlesPorDiag[d.id] || [])].sort((a, b) => a.numero - b.numero);
      const medidasMap: Record<number, Medida[]> = {};
      controles.forEach((c) => {
        medidasMap[c.id] = medidasPorControle[c.id] || [];
      });
      const diagMaturity = getDiagnosticoMaturity(d, controles, medidasMap);

      const mapControleRow = (c: Controle) => {
        const meds = medidasMap[c.id] || [];
        const programaControle = {
          id: c.programa_controle_id || 0,
          programa: programaId,
          controle: c.id,
          nivel: c.nivel || 1,
        };
        const m = getControleMaturity(c, meds, programaControle, programaMedidas);

        return {
          id: c.numero,
          nome: c.nome,
          indicador: formatScoreBr(m.score),
          nivel: m.label,
          key: `c-${c.id}`,
          maturityTint: m.color,
        };
      };

      const zero = controles.filter((c) => c.numero === 0);
      const demais = controles.filter((c) => c.numero !== 0);
      const rowsZero = zero.map(mapControleRow);
      const rowsRest = demais.map(mapControleRow);

      /** Diagnóstico 1: tabela com controle 0 e demais. Diagnósticos 2 e 3: barra ISEG/IPRIV acima; tabela só com controles numerados (≠0), como na planilha oficial. */
      const tableRows = d.id === 1 ? [...rowsZero, ...rowsRest] : [...rowsRest];

      const indiceBar =
        d.id === 2 || d.id === 3
          ? {
              code: d.id === 2 ? ("ISEG" as const) : ("IPRIV" as const),
              scoreText: formatScoreBr(diagMaturity.score),
              nivelLabel: diagMaturity.label,
            }
          : null;

      return {
        diagnostico: d,
        indiceBar,
        tableRows,
      };
    });
  }, [
    diagnosticos,
    controlesPorDiag,
    medidasPorControle,
    programaId,
    programaMedidas,
    getControleMaturity,
    getDiagnosticoMaturity,
  ]);

  if (!resolvingId && !programaId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Programa não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            ".MuiAppBar-root": { display: "none !important" },
            ".no-print": { display: "none !important" },
            body: { background: "#fff !important" },
            "#relatorio-diagnostico-print .relatorio-maturity-row": {
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            },
            "#relatorio-diagnostico-print .relatorio-indice-bar": {
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            },
          },
        }}
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box className="no-print" sx={{ mb: 2 }}>
          <PageHeroHeader
            title="Relatório de todos os controles"
            icon={<DescriptionIcon sx={{ fontSize: 30 }} aria-hidden />}
            trailing={
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                <IconButton
                  color="primary"
                  aria-label="Voltar"
                  onClick={() => router.push(`/programas/${idOrSlug}/diagnostico`)}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                  Imprimir ou salvar em PDF
                </Button>
              </Box>
            }
          />
        </Box>

        {error ? (
          <Alert severity="error" className="no-print" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Paper
          id="relatorio-diagnostico-print"
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            bgcolor: "background.paper",
            "@media print": { boxShadow: "none", p: 2 },
          }}
        >
          {loading || resolvingId ? (
            <Box>
              <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={280} />
            </Box>
          ) : (
            <>
              <PoliticaStylePrintHeader programa={programa} docTitle={DOC_TITLE} />


              {sections.map((sec) => (
                <Box key={sec.diagnostico.id} sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      mb: 1,
                      color: "text.primary",
                    }}
                  >
                    {sec.diagnostico.descricao}
                  </Typography>

                  {sec.indiceBar ? (
                    <IndiceMaturityBar
                      code={sec.indiceBar.code}
                      scoreText={sec.indiceBar.scoreText}
                      nivelLabel={sec.indiceBar.nivelLabel}
                    />
                  ) : null}

                  <Table
                    size="small"
                    sx={{
                      border: TABLE_BORDER,
                      borderCollapse: "collapse",
                      "& th, & td": {
                        border: TABLE_BORDER,
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow sx={{ bgcolor: HEADER_BG }}>
                        <TableCell
                          align="center"
                          sx={{ color: "common.white", fontWeight: 700, width: 80, fontSize: "0.7rem" }}
                        >
                          ID CONTROLE
                        </TableCell>
                        <TableCell sx={{ color: "common.white", fontWeight: 700, fontSize: "0.7rem" }}>
                          NOME CONTROLE
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "common.white", fontWeight: 700, minWidth: 120, fontSize: "0.7rem" }}
                        >
                          {COL_INDICADOR}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "common.white", fontWeight: 700, minWidth: 120, fontSize: "0.7rem" }}
                        >
                          Nível de Maturidade
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sec.tableRows.map((r) => (
                        <TableRow
                          key={r.key}
                          className="relatorio-maturity-row"
                          sx={(theme) => ({
                            bgcolor: r.maturityTint
                              ? alpha(r.maturityTint, 0.075)
                              : theme.palette.grey[50],
                            printColorAdjust: "exact",
                            WebkitPrintColorAdjust: "exact",
                          })}
                        >
                          <TableCell align="center" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                            {r.id}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", textTransform: "uppercase" }}>{r.nome}</TableCell>
                          <TableCell align="center" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                            {r.indicador}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              ...(r.maturityTint
                                ? {
                                    bgcolor: alpha(r.maturityTint, 0.11),
                                    printColorAdjust: "exact",
                                    WebkitPrintColorAdjust: "exact",
                                  }
                                : {}),
                            }}
                          >
                            {r.nivel}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </>
          )}
        </Paper>
      </Container>
    </>
  );
}
