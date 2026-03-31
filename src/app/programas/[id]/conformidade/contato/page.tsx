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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  TableChart as ExcelIcon,
  ContactMail as ContactMailIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import * as dataService from "@/lib/services/dataService";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import type { ProgramaContatoRow } from "@/lib/services/dataService";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ContatoPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [mensagens, setMensagens] = useState<ProgramaContatoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (programaId == null) return;
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchProgramaContato(programaId)
      .then((rows) => {
        if (!cancelled) setMensagens(rows);
      })
      .catch((err) => {
        if (!cancelled) console.error("Erro ao carregar mensagens de contato:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const exportExcel = useCallback(() => {
    const headers = ["Nome", "E-mail", "Assunto", "Mensagem", "Data"];
    const rows = mensagens.map((m) => [
      m.nome,
      m.email,
      m.assunto ?? "",
      m.mensagem,
      m.created_at ? dayjs(m.created_at).format("DD/MM/YYYY HH:mm") : "",
    ]);
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Contato-Portal-Programa-${idOrSlug}-${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [mensagens, idOrSlug]);

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
        title="Contato do portal"
        icon={<ContactMailIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Mensagens enviadas pelo formulário de contato no portal público"
        trailing={
          <Button
            variant="outlined"
            startIcon={<ExcelIcon />}
            onClick={exportExcel}
            disabled={mensagens.length === 0}
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
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell><strong>Assunto</strong></TableCell>
              <TableCell><strong>Mensagem</strong></TableCell>
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
            ) : mensagens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhuma mensagem recebida. As mensagens enviadas pelo formulário de contato no portal público aparecem aqui.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              mensagens.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>{m.nome}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.assunto || "—"}</TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>{m.mensagem}</TableCell>
                  <TableCell>{m.created_at ? dayjs(m.created_at).format("DD/MM/YYYY HH:mm") : "—"}</TableCell>
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
