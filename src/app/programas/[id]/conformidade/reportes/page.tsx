"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  TableChart as ExcelIcon,
  ReportProblem as ReportProblemIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import * as dataService from "@/lib/services/dataService";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import type { ProgramaReporteRow } from "@/lib/services/dataService";

const STATUS_OPTS: Array<{ value: string; label: string; color: "default" | "info" | "warning" | "success" | "error" }> = [
  { value: "novo", label: "Novo", color: "info" },
  { value: "em_triagem", label: "Em triagem", color: "warning" },
  { value: "em_atendimento", label: "Em atendimento", color: "warning" },
  { value: "convertido_incidente", label: "Convertido em incidente", color: "default" },
  { value: "encerrado", label: "Encerrado", color: "success" },
  { value: "arquivado", label: "Arquivado", color: "default" },
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ReportesPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [reportes, setReportes] = useState<ProgramaReporteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [obsDialog, setObsDialog] = useState<ProgramaReporteRow | null>(null);
  const [obsText, setObsText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    if (programaId == null) return;
    setLoading(true);
    dataService
      .fetchProgramaReportes(programaId)
      .then(setReportes)
      .catch((err) => console.error("Erro ao carregar reportes:", err))
      .finally(() => setLoading(false));
  }, [programaId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (reporte: ProgramaReporteRow, status: string) => {
    if (!programaId) return;
    try {
      await dataService.updateProgramaReporte(programaId, reporte.id, { status });
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  const handleSaveObs = async () => {
    if (!programaId || !obsDialog) return;
    try {
      await dataService.updateProgramaReporte(programaId, obsDialog.id, {
        observacoes_internas: obsText,
      });
      setObsDialog(null);
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };

  const exportExcel = useCallback(() => {
    const headers = ["Tipo", "Nome", "E-mail", "Descrição", "Status", "Data"];
    const rows = reportes.map((r) => [
      r.tipo,
      r.nome ?? "",
      r.email,
      r.descricao,
      r.status ?? "novo",
      r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY HH:mm") : "",
    ]);
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reportes-Portal-Programa-${idOrSlug}-${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [reportes, idOrSlug]);

  if (idLoading || (programaId == null && !loading)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }
  if (programaId == null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Programa não encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title="Reportes do portal"
        icon={<ReportProblemIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Vulnerabilidades e incidentes reportados — workflow de triagem e atendimento"
        trailing={
          <Button
            variant="outlined"
            startIcon={<ExcelIcon />}
            onClick={exportExcel}
            disabled={reportes.length === 0}
          >
            Exportar Excel (CSV)
          </Button>
        }
      />
      <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mb: 2 }} />

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Carregando…</Typography>
                </TableCell>
              </TableRow>
            ) : reportes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhum reporte recebido pelo portal.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reportes.map((r) => {
                const st = STATUS_OPTS.find((s) => s.value === (r.status || "novo"));
                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.tipo === "vulnerabilidade" ? "Vulnerabilidade" : "Incidente"}
                        color={r.tipo === "vulnerabilidade" ? "warning" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{r.nome || "—"}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>{r.descricao}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={r.status || "novo"}
                        onChange={(e) => handleStatusChange(r, e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{ fontSize: "0.8rem", minWidth: 140 }}
                      >
                        {STATUS_OPTS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY HH:mm") : "—"}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setObsDialog(r);
                          setObsText(r.observacoes_internas || "");
                        }}
                        aria-label="Observações internas"
                      >
                        <NotesIcon fontSize="small" color={r.observacoes_internas ? "primary" : "inherit"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/programas/${idOrSlug}/conformidade/portal`)}
        >
          Voltar a titulares e canais públicos
        </Button>
      </Box>

      <Dialog open={!!obsDialog} onClose={() => setObsDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Observações internas</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={obsText}
            onChange={(e) => setObsText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObsDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveObs}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />
    </Container>
  );
}
