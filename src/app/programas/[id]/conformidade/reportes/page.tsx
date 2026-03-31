"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  Container,
  Typography,
  Box,
  Link,
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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  TableChart as ExcelIcon,
  ReportProblem as ReportProblemIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import * as dataService from "@/lib/services/dataService";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import type { ProgramaReporteRow } from "@/lib/services/dataService";

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

  useEffect(() => {
    if (programaId == null) return;
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchProgramaReportes(programaId)
      .then((rows) => {
        if (!cancelled) setReportes(rows);
      })
      .catch((err) => {
        if (!cancelled) console.error("Erro ao carregar reportes:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const exportExcel = useCallback(() => {
    const headers = ["Tipo", "Nome", "E-mail", "Descrição", "Data"];
    const rows = reportes.map((r) => [
      r.tipo,
      r.nome ?? "",
      r.email,
      r.descricao,
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
        description="Vulnerabilidades e incidentes reportados por usuários no portal público"
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
              <TableCell><strong>Data</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Carregando…</Typography>
                </TableCell>
              </TableRow>
            ) : reportes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhum reporte recebido pelo portal. Os reportes enviados pelo formulário &quot;Reportar vulnerabilidade / incidente&quot; no portal público aparecem aqui.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reportes.map((r) => (
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
                  <TableCell sx={{ maxWidth: 360 }}>{r.descricao}</TableCell>
                  <TableCell>{r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY HH:mm") : "—"}</TableCell>
                </TableRow>
              ))
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
    </Container>
  );
}
