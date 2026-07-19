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
  ContactMail as ContactMailIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import * as dataService from "@/lib/services/dataService";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import type { ProgramaContatoRow } from "@/lib/services/dataService";

const STATUS_OPTS = [
  { value: "novo", label: "Novo" },
  { value: "em_triagem", label: "Em triagem" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "respondido", label: "Respondido" },
  { value: "encerrado", label: "Encerrado" },
  { value: "arquivado", label: "Arquivado" },
];

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
  const [obsDialog, setObsDialog] = useState<ProgramaContatoRow | null>(null);
  const [obsText, setObsText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    if (programaId == null) return;
    setLoading(true);
    dataService
      .fetchProgramaContato(programaId)
      .then(setMensagens)
      .catch((err) => console.error("Erro ao carregar mensagens de contato:", err))
      .finally(() => setLoading(false));
  }, [programaId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (msg: ProgramaContatoRow, status: string) => {
    if (!programaId) return;
    try {
      await dataService.updateProgramaContato(programaId, msg.id, { status });
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  const handleSaveObs = async () => {
    if (!programaId || !obsDialog) return;
    try {
      await dataService.updateProgramaContato(programaId, obsDialog.id, {
        observacoes_internas: obsText,
      });
      setObsDialog(null);
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };

  const exportExcel = useCallback(() => {
    const headers = ["Nome", "E-mail", "Assunto", "Mensagem", "Status", "Data"];
    const rows = mensagens.map((m) => [
      m.nome,
      m.email,
      m.assunto ?? "",
      m.mensagem,
      m.status ?? "novo",
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
        description="Mensagens do formulário de contato — workflow de triagem e resposta"
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
            ) : mensagens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhuma mensagem recebida.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              mensagens.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>{m.nome}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.assunto || "—"}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>{m.mensagem}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={m.status || "novo"}
                      onChange={(e) => handleStatusChange(m, e.target.value)}
                      variant="standard"
                      disableUnderline
                      sx={{ fontSize: "0.8rem", minWidth: 130 }}
                    >
                      {STATUS_OPTS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{m.created_at ? dayjs(m.created_at).format("DD/MM/YYYY HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setObsDialog(m);
                        setObsText(m.observacoes_internas || "");
                      }}
                      aria-label="Observações internas"
                    >
                      <NotesIcon fontSize="small" color={m.observacoes_internas ? "primary" : "inherit"} />
                    </IconButton>
                  </TableCell>
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
