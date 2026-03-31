"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Chip,
  useTheme,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { History as HistoryIcon, InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";
import {
  DataGrid,
  GridColDef,
  GridLocaleText,
  GridPaginationModel,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { ptBR as dataGridPtBRLocale } from "@mui/x-data-grid/locales";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";

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
  diagnostico: "Diagnóstico",
  plano_acao: "Plano de ação",
  politica: "Política",
  relatorio: "Relatório",
  user: "Utilizador",
  cargo: "Cargo",
  departamento: "Departamento",
  mapeamento_dados: "Mapeamento de dados",
};

type ActivityRow = {
  id: number;
  user_id: string | null;
  user_label?: string | null;
  action: string;
  resource_type: string | null;
  resource_id: number | null;
  resource_hint?: string | null;
  details: unknown;
  ip_address: string | null;
  user_agent: string | null;
  origem: string | null;
  created_at: string;
};

function resourceSummary(row: ActivityRow): string {
  const type = RESOURCE_LABELS[row.resource_type ?? ""] ?? row.resource_type ?? "—";
  if (row.resource_hint?.trim()) return `${type} · ${row.resource_hint.trim()}`;
  if (row.resource_id != null) return `${type} · ID interno ${row.resource_id}`;
  return type;
}

/** localeText do pacote vem em theme.components — extrair para o DataGrid não ficar em inglês */
const DATA_GRID_LOCALE_TEXT = {
  ...dataGridPtBRLocale.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: "Nenhuma atividade registrada.",
} as GridLocaleText;

const SORT_FIELD_TO_API: Record<string, string> = {
  created_at: "created_at",
  user_label: "user_id",
  action: "action",
  resource_summary: "resource_type",
  origem: "origem",
};

function formatDetailsJson(details: unknown): string {
  if (details == null || (typeof details === "object" && details !== null && Object.keys(details as object).length === 0)) {
    return "Nenhum detalhe adicional foi gravado para este evento.";
  }
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

export default function AuditoriaPage() {
  const params = useParams();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<{ user_id: string; label: string }[]>([]);

  const [filterAction, setFilterAction] = useState<string>("");
  const [filterResource, setFilterResource] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterDesde, setFilterDesde] = useState<dayjs.Dayjs | null>(null);
  const [filterAte, setFilterAte] = useState<dayjs.Dayjs | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "created_at", sort: "desc" }]);

  const [detailRow, setDetailRow] = useState<ActivityRow | null>(null);

  const loadMembers = useCallback(() => {
    if (programaId == null) return;
    fetch(`/api/audit/programa-members?programa_id=${programaId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { members: [] }))
      .then((d) => setMembers(Array.isArray(d.members) ? d.members : []))
      .catch(() => setMembers([]));
  }, [programaId]);

  const loadActivities = useCallback(() => {
    if (programaId == null) return;
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("programa_id", String(programaId));
    sp.set("limit", String(paginationModel.pageSize));
    sp.set("offset", String(paginationModel.page * paginationModel.pageSize));
    const sort = sortModel[0]?.sort ?? "desc";
    sp.set("order", sort === "asc" ? "asc" : "desc");
    const gridField = sortModel[0]?.field ?? "created_at";
    sp.set("sort", SORT_FIELD_TO_API[gridField] ?? "created_at");
    if (filterAction) sp.set("action", filterAction);
    if (filterResource) sp.set("resource_type", filterResource);
    if (filterUser === "__portal__") sp.set("user_id", "__portal__");
    else if (filterUser) sp.set("user_id", filterUser);
    if (filterDesde) sp.set("desde", filterDesde.toISOString());
    if (filterAte) sp.set("ate", filterAte.toISOString());

    fetch(`/api/audit/activities?${sp}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return { data: [], total: 0 };
        return r.json();
      })
      .then((body: { data?: ActivityRow[]; total?: number }) => {
        setRows(Array.isArray(body.data) ? body.data : []);
        setTotal(typeof body.total === "number" ? body.total : 0);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [
    programaId,
    paginationModel.page,
    paginationModel.pageSize,
    sortModel,
    filterAction,
    filterResource,
    filterUser,
    filterDesde,
    filterAte,
  ]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const onFilterChange = useCallback(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }));
  }, []);

  const columns: GridColDef<ActivityRow>[] = useMemo(
    () => [
      {
        field: "created_at",
        headerName: "Data/Hora",
        width: 158,
        sortable: true,
        valueGetter: (_v, row) => row.created_at,
        renderCell: (params) => dayjs(params.row.created_at).format("DD/MM/YYYY HH:mm"),
      },
      {
        field: "user_label",
        headerName: "Utilizador",
        flex: 1.2,
        minWidth: 200,
        sortable: true,
        renderCell: (params) => {
          if (!params.row.user_id) {
            return <Chip label="Portal público" size="small" color="default" variant="outlined" />;
          }
          return (
            <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
              {params.row.user_label ?? params.row.user_id}
            </Typography>
          );
        },
      },
      {
        field: "action",
        headerName: "Ação",
        width: 120,
        sortable: true,
        renderCell: (params) => (
          <Chip
            label={ACTION_LABELS[params.row.action] ?? params.row.action}
            size="small"
            color={
              params.row.action === "delete" ? "error" : params.row.action === "create" ? "success" : "default"
            }
            variant="outlined"
          />
        ),
      },
      {
        field: "resource_summary",
        headerName: "Recurso / registro",
        description: "Ordenação por tipo de recurso (e ID interno como desempate)",
        flex: 1.4,
        minWidth: 240,
        sortable: true,
        valueGetter: (_v, row) => resourceSummary(row),
        renderCell: (params) => {
          const row = params.row;
          const type = RESOURCE_LABELS[row.resource_type ?? ""] ?? row.resource_type ?? "—";
          const main =
            row.resource_hint?.trim() != null && row.resource_hint.trim() !== ""
              ? `${type} · ${row.resource_hint.trim()}`
              : row.resource_id != null
                ? `${type} · ID interno ${row.resource_id}`
                : type;
          return (
            <Box sx={{ py: 0.5, minWidth: 0, width: "100%" }}>
              <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.35, whiteSpace: "normal" }}>
                {main}
              </Typography>
              {row.resource_hint?.trim() && row.resource_id != null && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                  {row.resource_type === "medida"
                    ? `Chave técnica (programa_medida.id): ${row.resource_id}`
                    : `Chave técnica: ${row.resource_id}`}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: "origem",
        headerName: "Origem",
        width: 118,
        sortable: true,
        renderCell: (params) => (
          <Chip
            label={params.row.origem === "portal_publico" ? "Portal" : "Sistema"}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: "details_btn",
        headerName: "",
        width: 56,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Tooltip title="Ver detalhes técnicos (JSON, IP, agente)">
            <IconButton
              size="small"
              aria-label="Detalhes da atividade"
              onClick={() => setDetailRow(params.row)}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    []
  );

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
        <PageHeroHeader
          title="Auditoria"
          icon={<HistoryIcon sx={{ fontSize: 30 }} aria-hidden />}
          description={
            <>
              <Typography variant="body2" component="span" display="block">
                Trilha de auditoria — quem fez o quê, quando (LGPD art. 37, Framework FPSI Controle 8)
              </Typography>
              <ProgramaLastActivityLine
                programaId={programaId}
                programaPathSegment={idOrSlug}
                showHistoricoLink={false}
                sx={{ mt: 1.5 }}
              />
            </>
          }
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, alignItems: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Utilizador</InputLabel>
            <Select
              value={filterUser}
              label="Utilizador"
              onChange={(e) => {
                setFilterUser(e.target.value);
                onFilterChange();
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="__portal__">Portal público (sem login)</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.user_id} value={m.user_id}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ação</InputLabel>
            <Select
              value={filterAction}
              label="Ação"
              onChange={(e) => {
                setFilterAction(e.target.value);
                onFilterChange();
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Recurso</InputLabel>
            <Select
              value={filterResource}
              label="Recurso"
              onChange={(e) => {
                setFilterResource(e.target.value);
                onFilterChange();
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(RESOURCE_LABELS)
                .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
                .map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <DatePicker
            label="Desde"
            value={filterDesde}
            onChange={(v) => {
              setFilterDesde(v);
              onFilterChange();
            }}
            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
          />
          <DatePicker
            label="Até"
            value={filterAte}
            onChange={(v) => {
              setFilterAte(v);
              onFilterChange();
            }}
            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
          />
        </Box>

        <Paper sx={{ borderRadius: 2, width: "100%", overflow: "hidden" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            loading={loading}
            rowCount={total}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(m) => setPaginationModel(m)}
            sortModel={sortModel}
            onSortModelChange={(m) => {
              setSortModel(m.length ? m : [{ field: "created_at", sort: "desc" }]);
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnFilter
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
              },
            }}
            sx={{
              border: "none",
              minHeight: 420,
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
            localeText={DATA_GRID_LOCALE_TEXT}
          />
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Retenção mínima: 90 dias (Framework FPSI, medida 8.4). Não gravar dados pessoais sensíveis em detalhes. Nomes de
          utilizadores vêm do perfil quando disponível (requer chave de serviço no servidor).
        </Typography>

        <Dialog open={Boolean(detailRow)} onClose={() => setDetailRow(null)} maxWidth="md" fullWidth>
          <DialogTitle>Detalhes da atividade</DialogTitle>
          <DialogContent dividers>
            {detailRow && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Data/Hora
                  </Typography>
                  <Typography variant="body2">{dayjs(detailRow.created_at).format("DD/MM/YYYY HH:mm:ss")}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Utilizador (técnico)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all" }}>
                    {detailRow.user_id ?? "— (portal público)"}
                  </Typography>
                  {detailRow.user_label && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Nome/e-mail: {detailRow.user_label}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ação / recurso
                  </Typography>
                  <Typography variant="body2">
                    {ACTION_LABELS[detailRow.action] ?? detailRow.action} · {resourceSummary(detailRow)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    ID do evento na trilha: {detailRow.id}
                    {detailRow.resource_id != null && (
                      <>
                        {" · "}
                        {detailRow.resource_type === "medida"
                          ? `programa_medida.id = ${detailRow.resource_id} (resposta do programa ao catálogo)`
                          : `registo afetado (id): ${detailRow.resource_id}`}
                      </>
                    )}
                    {detailRow.resource_id == null && " · sem id de registo alvo"}
                  </Typography>
                </Box>
                {(detailRow.ip_address || detailRow.user_agent) && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Rede / cliente
                    </Typography>
                    {detailRow.ip_address && (
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        IP: {detailRow.ip_address}
                      </Typography>
                    )}
                    {detailRow.user_agent && (
                      <Typography
                        variant="caption"
                        component="pre"
                        sx={{
                          mt: 0.5,
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontFamily: "inherit",
                        }}
                      >
                        {detailRow.user_agent}
                      </Typography>
                    )}
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payload gravado (JSON)
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      maxHeight: 320,
                      overflow: "auto",
                      fontSize: "0.75rem",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {formatDetailsJson(detailRow.details)}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailRow(null)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
