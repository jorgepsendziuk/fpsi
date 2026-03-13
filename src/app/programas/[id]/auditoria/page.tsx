"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Skeleton,
  Chip,
  useTheme,
  alpha,
  Avatar,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, History as HistoryIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";

const ACTION_LABELS: Record<string, string> = {
  create: "Criou",
  update: "Alterou",
  delete: "Excluiu",
  view: "Visualizou",
  approve: "Aprovou",
  reject: "Rejeitou",
  invite: "Convidou",
  login: "Login",
  logout: "Logout",
  export: "Exportou",
  restore: "Restaurou",
  upload: "Enviou",
  download: "Baixou",
};

const RESOURCE_LABELS: Record<string, string> = {
  programa: "Programa",
  pedido_titular: "Pedido titular",
  ropa: "ROPA",
  ripd: "RIPD",
  incidente: "Incidente",
  invite: "Convite",
  empresa: "Empresa",
  programa_user: "Usuário do programa",
  responsavel: "Responsável",
  registro_ropa: "Registro ROPA",
  papel_lgpd_instituicao: "Instituição LGPD",
  papel_lgpd_vinculo: "Vínculo LGPD",
  profile: "Perfil",
  reporte: "Reporte",
  contato: "Contato",
  medida: "Medida",
  controle: "Controle",
};

export default function AuditoriaPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programa, setPrograma] = useState<{ nome?: string } | null>(null);
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterResource, setFilterResource] = useState<string>("");
  const [filterDesde, setFilterDesde] = useState<dayjs.Dayjs | null>(null);
  const [filterAte, setFilterAte] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    dataService.fetchProgramaByIdOrSlug(idOrSlug).then(setPrograma).catch(() => setPrograma(null));
  }, [idOrSlug]);

  useEffect(() => {
    if (programaId == null) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("programa_id", String(programaId));
    params.set("limit", "200");
    if (filterAction) params.set("action", filterAction);
    if (filterResource) params.set("resource_type", filterResource);
    if (filterDesde) params.set("desde", filterDesde.toISOString());
    if (filterAte) params.set("ate", filterAte.toISOString());

    fetch(`/api/audit/activities?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [programaId, filterAction, filterResource, filterDesde, filterAte]);

  const programaName = programa?.nome || `Programa`;

  if (idLoading || (programaId == null && !loading)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              href="/dashboard"
              underline="hover"
              color="inherit"
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                router.push("/dashboard");
              }}
            >
              <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" />
              Programas
            </Link>
            <Link
              href={`/programas/${idOrSlug}`}
              underline="hover"
              color="inherit"
              sx={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/programas/${idOrSlug}`);
              }}
            >
              {programaName}
            </Link>
            <Typography color="text.primary">Histórico de Atividades</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, #455a64 0%, #78909c 100%)`,
              }}
            >
              <HistoryIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Histórico de Atividades
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Trilha de auditoria — quem fez o quê, quando (LGPD art. 37, Framework FPSI Controle 8)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ação</InputLabel>
            <Select
              value={filterAction}
              label="Ação"
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Recurso</InputLabel>
            <Select
              value={filterResource}
              label="Recurso"
              onChange={(e) => setFilterResource(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(RESOURCE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            label="Desde"
            value={filterDesde}
            onChange={(v) => setFilterDesde(v)}
            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
          />
          <DatePicker
            label="Até"
            value={filterAte}
            onChange={(v) => setFilterAte(v)}
            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell><strong>Data/Hora</strong></TableCell>
                <TableCell><strong>Usuário</strong></TableCell>
                <TableCell><strong>Ação</strong></TableCell>
                <TableCell><strong>Recurso</strong></TableCell>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Origem</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton height={40} /></TableCell>
                  </TableRow>
                ))
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhuma atividade registrada.</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Ao fazer alterações no programa, abra o console (F12) para ver erros de auditoria, se houver.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      {dayjs(a.created_at).format("DD/MM/YYYY HH:mm")}
                    </TableCell>
                    <TableCell>
                      {a.user_id ? (
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                          {a.user_id}
                        </Typography>
                      ) : (
                        <Chip label="Portal público" size="small" color="default" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ACTION_LABELS[a.action] ?? a.action}
                        size="small"
                        color={a.action === "delete" ? "error" : a.action === "create" ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{RESOURCE_LABELS[a.resource_type] ?? a.resource_type}</TableCell>
                    <TableCell>{a.resource_id ?? "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.origem === "portal_publico" ? "Portal" : "Sistema"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Retenção mínima: 90 dias (Framework FPSI, medida 8.4). Não gravar dados pessoais sensíveis em detalhes.
        </Typography>
      </Container>
    </LocalizationProvider>
  );
}
