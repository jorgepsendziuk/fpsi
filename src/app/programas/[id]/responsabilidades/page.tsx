"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Add,
  Business,
  AccountBalance as AccountBalanceIcon,
  AccountTreeOutlined,
  CalendarMonth,
  Cancel,
  CrisisAlertOutlined,
  Delete,
  Edit,
  Email,
  GroupOutlined,
  HelpOutlineOutlined,
  Person,
  PersonAdd,
  PrivacyTipOutlined,
  Save,
  SecurityOutlined,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { PapelLgpdManager } from "@/components/programa/PapelLgpdManager";
import { GovernancaGrupoMembrosPicklist } from "@/components/programa/GovernancaGrupoMembrosPicklist";
import { GovernancaPapelHintDialog } from "@/components/programa/GovernancaPpsiCartilhaPanel";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { logActivityFromClient } from "@/lib/services/auditClient";
import type { Programa, Responsavel } from "@/lib/types/types";
import {
  getOrientacaoCampo,
  type CampoResponsavelProgramaId,
} from "@/content/governancaOrientacaoPrograma";
import { CARGO_SUGESTOES, DEPARTAMENTO_SUGESTOES } from "@/lib/governanca/sugestoesCadastro";
import {
  governancaAbaQueryFromIndex,
  governancaIndexFromQueryParam,
} from "@/lib/governanca/abaGovernanca";

type OrgaoRow = { id: number; nome: string };

type PapelDef = {
  campoId: CampoResponsavelProgramaId;
  dbField: keyof Pick<
    Programa,
    | "representante_alta_administracao"
    | "responsavel_gestao_integridade"
    | "gestor_seguranca_informacao"
    | "encarregado_dados_pessoais"
    | "gestor_tic"
  >;
};

const PAPEIS_PROGRAMA: PapelDef[] = [
  { campoId: "representante_alta_administracao", dbField: "representante_alta_administracao" },
  { campoId: "responsavel_gestao_integridade", dbField: "responsavel_gestao_integridade" },
  { campoId: "gestor_seguranca_informacao", dbField: "gestor_seguranca_informacao" },
  { campoId: "encarregado_dados_pessoais", dbField: "encarregado_dados_pessoais" },
  { campoId: "gestor_tic", dbField: "gestor_tic" },
];

type EditResponsavelForm = {
  id?: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  orgMode: "programa" | "catalog" | "livre";
  orgCatalogId: number | "";
  orgLivre: string;
  data_designacao: string;
};

const emptyForm = (): EditResponsavelForm => ({
  nome: "",
  email: "",
  cargo: "",
  departamento: "",
  orgMode: "programa",
  orgCatalogId: "",
  orgLivre: "",
  data_designacao: "",
});

function formatDataBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const p = String(iso).slice(0, 10);
  if (p.length !== 10) return iso;
  const [y, m, d] = p.split("-");
  return `${d}/${m}/${y}`;
}

function responsavelParaForm(r: Responsavel, programaOrgaoId: number | undefined): EditResponsavelForm {
  let orgMode: EditResponsavelForm["orgMode"] = "livre";
  let orgCatalogId: number | "" = "";
  let orgLivre = r.orgao_texto_livre?.trim() || "";
  if (r.orgao_vinculo_id != null && programaOrgaoId != null && r.orgao_vinculo_id === programaOrgaoId) {
    orgMode = "programa";
  } else if (r.orgao_vinculo_id != null) {
    orgMode = "catalog";
    orgCatalogId = r.orgao_vinculo_id;
  } else if (orgLivre) {
    orgMode = "livre";
  } else {
    orgMode = programaOrgaoId ? "programa" : "livre";
  }
  return {
    id: r.id,
    nome: r.nome || "",
    email: r.email || "",
    cargo: r.cargo ?? "",
    departamento: r.departamento ?? "",
    orgMode,
    orgCatalogId,
    orgLivre,
    data_designacao: r.data_designacao ? String(r.data_designacao).slice(0, 10) : "",
  };
}

export default function ProgramaResponsaveisCRUDPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idOrSlug = params.id as string;
  const { programaId: resolvedId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const programaId = resolvedId ?? 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [orgaos, setOrgaos] = useState<OrgaoRow[]>([]);
  const [programaData, setProgramaData] = useState<Partial<Programa>>({});
  const [papelResponsavelId, setPapelResponsavelId] = useState<Record<string, string>>({});
  const [gruposMembros, setGruposMembros] = useState<dataService.GovernancaGruposMembros>({
    comite_seguranca_informacao: [],
    comite_protecao_dados: [],
    etir: [],
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<EditResponsavelForm>(emptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [abaGovernanca, setAbaGovernanca] = useState(0);
  const [hintCampo, setHintCampo] = useState<CampoResponsavelProgramaId | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    const idx = governancaIndexFromQueryParam(searchParams.get("aba"));
    if (idx != null) setAbaGovernanca(idx);
  }, [searchParams]);

  const handleAbaGovernancaChange = useCallback(
    (_: React.SyntheticEvent, v: number) => {
      setAbaGovernanca(v);
      const q = governancaAbaQueryFromIndex(v);
      if (q && pathname) router.replace(`${pathname}?aba=${q}`, { scroll: false });
    },
    [pathname, router]
  );

  const programaOrgaoId =
    programaData.orgao != null && Number(programaData.orgao) > 0 ? Number(programaData.orgao) : undefined;
  const nomeOrgaoPrograma = useMemo(() => {
    if (programaOrgaoId == null) return "";
    return orgaos.find((o) => o.id === programaOrgaoId)?.nome || `Órgão #${programaOrgaoId}`;
  }, [orgaos, programaOrgaoId]);

  const orgNomeById = useMemo(() => {
    const m = new Map<number, string>();
    orgaos.forEach((o) => m.set(o.id, o.nome));
    return m;
  }, [orgaos]);

  const resolveOrgaoLabel = useCallback(
    (r: Responsavel) => {
      if (r.orgao_vinculo_id != null) {
        return orgNomeById.get(r.orgao_vinculo_id) || `Órgão #${r.orgao_vinculo_id}`;
      }
      if (r.orgao_texto_livre?.trim()) return r.orgao_texto_livre.trim();
      return "—";
    },
    [orgNomeById]
  );

  const fetchResponsaveis = useCallback(async () => {
    setLoading(true);
    const data = await dataService.fetchResponsaveis(programaId);
    if (!isMounted.current) return;
    setResponsaveis((data || []) as Responsavel[]);
    setLoading(false);
  }, [programaId]);

  const syncResponsaveisFromUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?programaId=${programaId}`);
      if (!res.ok) return;
      const users = await res.json();
      const responsaveisAtuais = await dataService.fetchResponsaveis(programaId);
      const emailsExistentes = new Set(
        (responsaveisAtuais || []).map((r: Responsavel) => (r.email || "").trim().toLowerCase())
      );
      for (const u of users) {
        const email = (u.email || u.user_id || "").trim().toLowerCase();
        if (!email || emailsExistentes.has(email)) continue;
        await supabaseBrowserClient.from("responsavel").insert({
          programa: programaId,
          nome: u.nome || email,
          email,
          departamento: "",
          cargo: "",
        });
        emailsExistentes.add(email);
      }
    } catch {
      /* sync best-effort */
    }
  }, [programaId]);

  const fetchProgramaCamposPrincipais = useCallback(async () => {
    const programa = await dataService.fetchProgramaById(programaId);
    if (!isMounted.current) return;
    if (!programa) return;
    setProgramaData(programa as Programa);
    const p = programa as Programa;
    const next: Record<string, string> = {};
    for (const { dbField } of PAPEIS_PROGRAMA) {
      const v = p[dbField];
      next[dbField as string] = typeof v === "number" && v > 0 ? String(v) : "";
    }
    setPapelResponsavelId(next);
  }, [programaId]);

  const loadGrupos = useCallback(async () => {
    const g = await dataService.fetchGovernancaGruposMembros(programaId);
    if (!isMounted.current) return;
    setGruposMembros(g);
  }, [programaId]);

  const loadOrgaos = useCallback(async () => {
    const list = await dataService.fetchOrgaos();
    if (!isMounted.current) return;
    setOrgaos((list || []) as OrgaoRow[]);
  }, []);

  useEffect(() => {
    if (!programaId) return;
    isMounted.current = true;
    const load = async () => {
      await loadOrgaos();
      if (!isMounted.current) return;
      await syncResponsaveisFromUsers();
      if (!isMounted.current) return;
      await fetchResponsaveis();
      if (!isMounted.current) return;
      await fetchProgramaCamposPrincipais();
      if (!isMounted.current) return;
      await loadGrupos();
    };
    void load();
    return () => {
      isMounted.current = false;
    };
  }, [programaId, syncResponsaveisFromUsers, fetchResponsaveis, fetchProgramaCamposPrincipais, loadGrupos, loadOrgaos]);

  const handleSaveResponsavelField = async (field: string, value: string) => {
    setLoading(true);
    const payload = value === "" ? null : parseInt(value, 10);
    await dataService.updateProgramaField(programaId, field, payload);
    if (!isMounted.current) return;
    setSnackbar({ message: "Papel atualizado.", severity: "success" });
    setLoading(false);
  };

  const handleChangePapel =
    (dbField: string, setter: (v: string) => void) => async (e: SelectChangeEvent<string>) => {
      const value = e.target.value;
      setter(value);
      await handleSaveResponsavelField(dbField, value);
    };

  const handleAddClick = () => {
    setEditingResponsavel({
      ...emptyForm(),
      orgMode: programaOrgaoId ? "programa" : "livre",
    });
    setIsEditing(false);
    setEditModalOpen(true);
  };

  const handleEditClick = (r: Responsavel) => {
    setEditingResponsavel(responsavelParaForm(r, programaOrgaoId));
    setIsEditing(true);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta pessoa da equipe do programa?")) return;
    setLoading(true);
    await supabaseBrowserClient.from("responsavel").delete().eq("id", id);
    if (!isMounted.current) return;
    await fetchResponsaveis();
    await fetchProgramaCamposPrincipais();
    await loadGrupos();
    setSnackbar({ message: "Registro removido.", severity: "success" });
    setLoading(false);
  };

  const buildOrgaoPayload = (): { orgao_vinculo_id: number | null; orgao_texto_livre: string | null } => {
    const f = editingResponsavel;
    if (f.orgMode === "programa" && programaOrgaoId != null) {
      return { orgao_vinculo_id: programaOrgaoId, orgao_texto_livre: null };
    }
    if (f.orgMode === "catalog" && f.orgCatalogId !== "" && typeof f.orgCatalogId === "number") {
      return { orgao_vinculo_id: f.orgCatalogId, orgao_texto_livre: null };
    }
    const livre = f.orgLivre.trim();
    return { orgao_vinculo_id: null, orgao_texto_livre: livre || null };
  };

  const handleSaveModal = async () => {
    if (!editingResponsavel.nome.trim() || !editingResponsavel.email.trim()) {
      setSnackbar({ message: "Nome e e-mail institucional são obrigatórios.", severity: "error" });
      return;
    }
    const { orgao_vinculo_id, orgao_texto_livre } = buildOrgaoPayload();
    const row = {
      nome: editingResponsavel.nome.trim(),
      email: editingResponsavel.email.trim(),
      departamento: editingResponsavel.departamento.trim(),
      cargo: editingResponsavel.cargo.trim(),
      orgao_vinculo_id,
      orgao_texto_livre,
      data_designacao: editingResponsavel.data_designacao.trim() || null,
    };

    setLoading(true);
    if (isEditing && editingResponsavel.id) {
      await supabaseBrowserClient.from("responsavel").update(row).eq("id", editingResponsavel.id);
      logActivityFromClient({
        action: "update",
        resourceType: "responsavel",
        resourceId: editingResponsavel.id,
        programaId,
      });
      setSnackbar({ message: "Dados atualizados.", severity: "success" });
    } else {
      const { data: inserted } = await supabaseBrowserClient
        .from("responsavel")
        .insert({ ...row, programa: programaId })
        .select("id")
        .single();
      if (inserted) {
        logActivityFromClient({
          action: "create",
          resourceType: "responsavel",
          resourceId: inserted.id,
          programaId,
        });
      }
      setSnackbar({ message: "Pessoa incluída na equipe.", severity: "success" });
    }

    if (!isMounted.current) return;
    await fetchResponsaveis();
    setEditModalOpen(false);
    setLoading(false);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingResponsavel(emptyForm());
  };

  const saveGrupoMembros = async (patch: Partial<dataService.GovernancaGruposMembros>) => {
    const next: dataService.GovernancaGruposMembros = { ...gruposMembros, ...patch };
    setGruposMembros(next);
    setLoading(true);
    const r = await dataService.saveGovernancaGruposMembros(programaId, next);
    setLoading(false);
    if (!r.ok) {
      setSnackbar({ message: r.error || "Erro ao salvar grupos.", severity: "error" });
      await loadGrupos();
      return;
    }
    setSnackbar({ message: "Composição dos grupos atualizada.", severity: "success" });
  };

  if (idLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }
  if (!resolvedId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Programa não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title="Estrutura de Governança"
        icon={<AccountBalanceIcon sx={{ fontSize: 30 }} aria-hidden />}
        description={<ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mt: 0.5 }} />}
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
          border: 1,
          borderColor: "divider",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.35)"
              : "0 8px 32px rgba(25, 118, 210, 0.08), 0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <Tabs
          value={abaGovernanca}
          onChange={handleAbaGovernancaChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 1.5,
            pt: 1.5,
            gap: 0.5,
            bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.12 : 0.06),
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 52,
              py: 1.25,
              px: 2,
              borderRadius: 2,
              mb: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: "text.secondary",
              transition: "background-color 0.2s, color 0.2s",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "primary.main",
              bgcolor: "background.paper",
              boxShadow: (t) => (t.palette.mode === "dark" ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)"),
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab icon={<GroupOutlined sx={{ fontSize: 22 }} />} iconPosition="start" label="Papéis e equipe" />
          <Tab icon={<SecurityOutlined sx={{ fontSize: 22 }} />} iconPosition="start" label="Comitê de SI" />
          <Tab icon={<PrivacyTipOutlined sx={{ fontSize: 22 }} />} iconPosition="start" label="Comitê de privacidade" />
          <Tab icon={<CrisisAlertOutlined sx={{ fontSize: 22 }} />} iconPosition="start" label="ETIR" />
          <Tab icon={<AccountTreeOutlined sx={{ fontSize: 22 }} />} iconPosition="start" label="Tratamento LGPD" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {abaGovernanca === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <Person color="primary" fontSize="small" />
                  Papéis no programa
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5 }}>
                  Escolha alguém da equipe. Use (?) para fundamentação legal e cartilha PPSI 2.0.
                </Typography>
                <Stack spacing={2.25}>
                  {PAPEIS_PROGRAMA.map(({ campoId, dbField }) => {
                    const rotulo = getOrientacaoCampo(campoId)?.rotulo || campoId;
                    const fieldKey = dbField as string;
                    return (
                      <Box key={fieldKey} sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75, lineHeight: 1.3 }}>
                            {rotulo}
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Select
                              displayEmpty
                              value={papelResponsavelId[fieldKey] ?? ""}
                              onChange={handleChangePapel(fieldKey, (v) =>
                                setPapelResponsavelId((prev) => ({ ...prev, [fieldKey]: v }))
                              )}
                            >
                              <MenuItem value="">
                                <em>Não definido</em>
                              </MenuItem>
                              {responsaveis.map((r) => (
                                <MenuItem key={r.id} value={String(r.id)}>
                                  {r.nome}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Tooltip title="Ver fundamentação e referências">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label={`Ajuda: ${rotulo}`}
                            onClick={() => setHintCampo(campoId)}
                            sx={{ flexShrink: 0, mb: 0.35 }}
                          >
                            <HelpOutlineOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  })}
                </Stack>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 2 : 0,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center" }}>
                      <PersonAdd sx={{ mr: 1 }} />
                      Equipe ({responsaveis.length})
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={handleAddClick}
                      sx={{ borderRadius: 2, width: isMobile ? "100%" : "auto" }}
                    >
                      Incluir pessoa
                    </Button>
                  </Box>

                  {responsaveis.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                      <PersonAdd sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Nenhuma pessoa cadastrada
                      </Typography>
                      <Typography variant="body2">
                        Inclua integrantes para designá-los aos papéis, comitês e ETIR.
                      </Typography>
                    </Box>
                  ) : (
                    <List disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                      {responsaveis.map((responsavel) => (
                        <ListItem
                          key={responsavel.id}
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            "&:last-child": { borderBottom: "none" },
                            py: 1.5,
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {responsavel.nome}
                                {responsavel.cargo ? (
                                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    — {responsavel.cargo}
                                  </Typography>
                                ) : null}
                              </Typography>
                            }
                            secondaryTypographyProps={{ component: "div" }}
                            secondary={
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Email sx={{ fontSize: 14, color: "text.secondary" }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {responsavel.email}
                                  </Typography>
                                </Box>
                                {responsavel.departamento ? (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Business sx={{ fontSize: 14, color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {responsavel.departamento}
                                    </Typography>
                                  </Box>
                                ) : null}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Business sx={{ fontSize: 14, color: "text.secondary" }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {resolveOrgaoLabel(responsavel)}
                                  </Typography>
                                </Box>
                                {responsavel.data_designacao ? (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CalendarMonth sx={{ fontSize: 14, color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                      Designação: {formatDataBR(responsavel.data_designacao)}
                                    </Typography>
                                  </Box>
                                ) : null}
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction sx={{ display: "flex", gap: 0.5 }}>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEditClick(responsavel)}
                              sx={{ borderRadius: 2 }}
                            >
                              Editar
                            </Button>
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(responsavel.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {abaGovernanca === 1 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Integrantes do comitê de segurança da informação (equivalente institucional). Atas e atos ficam fora do FPSI.
              </Typography>
              <GovernancaGrupoMembrosPicklist
                responsaveis={responsaveis}
                selectedIds={gruposMembros.comite_seguranca_informacao}
                onChange={(ids) => void saveGrupoMembros({ comite_seguranca_informacao: ids })}
                disabled={loading}
              />
            </Stack>
          )}

          {abaGovernanca === 2 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Integrantes do comitê de proteção de dados (equivalente). Formalização no órgão, não neste cadastro.
              </Typography>
              <GovernancaGrupoMembrosPicklist
                responsaveis={responsaveis}
                selectedIds={gruposMembros.comite_protecao_dados}
                onChange={(ids) => void saveGrupoMembros({ comite_protecao_dados: ids })}
                disabled={loading}
              />
            </Stack>
          )}

          {abaGovernanca === 3 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                ETIR — Equipe de Prevenção, Tratamento e Resposta a Incidentes Cibernéticos — referência de membros da equipe do programa para governança e evidências no diagnóstico.
              </Typography>
              <GovernancaGrupoMembrosPicklist
                responsaveis={responsaveis}
                selectedIds={gruposMembros.etir}
                onChange={(ids) => void saveGrupoMembros({ etir: ids })}
                disabled={loading}
              />
            </Stack>
          )}

          {abaGovernanca === 4 && <PapelLgpdManager programaId={programaId} idOrSlug={idOrSlug} />}
        </Box>
      </Paper>

      <GovernancaPapelHintDialog campoId={hintCampo} open={hintCampo != null} onClose={() => setHintCampo(null)} />

      <Dialog open={editModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>{isEditing ? "Editar pessoa" : "Incluir pessoa"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              fullWidth
              required
              value={editingResponsavel.nome}
              onChange={(e) => setEditingResponsavel({ ...editingResponsavel, nome: e.target.value })}
            />
            <TextField
              label="E-mail institucional"
              type="email"
              fullWidth
              required
              value={editingResponsavel.email}
              onChange={(e) => setEditingResponsavel({ ...editingResponsavel, email: e.target.value })}
            />
            <Autocomplete
              freeSolo
              options={CARGO_SUGESTOES}
              inputValue={editingResponsavel.cargo}
              onInputChange={(_, v) => setEditingResponsavel((prev) => ({ ...prev, cargo: v }))}
              renderInput={(params) => <TextField {...params} label="Cargo" placeholder="Selecione ou digite" />}
            />
            <Autocomplete
              freeSolo
              options={DEPARTAMENTO_SUGESTOES}
              inputValue={editingResponsavel.departamento}
              onInputChange={(_, v) => setEditingResponsavel((prev) => ({ ...prev, departamento: v }))}
              renderInput={(params) => (
                <TextField {...params} label="Departamento / lotação" placeholder="Selecione ou digite" />
              )}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Órgão</InputLabel>
              <Select
                label="Órgão"
                value={
                  editingResponsavel.orgMode === "programa"
                    ? "programa"
                    : editingResponsavel.orgMode === "livre"
                      ? "livre"
                      : "catalog"
                }
                onChange={(e) => {
                  const v = e.target.value as string;
                  if (v === "programa") {
                    setEditingResponsavel({ ...editingResponsavel, orgMode: "programa", orgCatalogId: "", orgLivre: "" });
                  } else if (v === "livre") {
                    setEditingResponsavel({ ...editingResponsavel, orgMode: "livre", orgCatalogId: "" });
                  } else {
                    setEditingResponsavel({ ...editingResponsavel, orgMode: "catalog", orgLivre: "" });
                  }
                }}
              >
                {programaOrgaoId != null ? (
                  <MenuItem value="programa">Órgão do programa ({nomeOrgaoPrograma})</MenuItem>
                ) : null}
                <MenuItem value="catalog">Outro órgão (catálogo)</MenuItem>
                <MenuItem value="livre">Outro (texto livre)</MenuItem>
              </Select>
            </FormControl>
            {editingResponsavel.orgMode === "catalog" ? (
              <FormControl fullWidth size="small">
                <InputLabel>Órgão no catálogo</InputLabel>
                <Select
                  label="Órgão no catálogo"
                  value={editingResponsavel.orgCatalogId === "" ? "" : String(editingResponsavel.orgCatalogId)}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setEditingResponsavel({
                      ...editingResponsavel,
                      orgCatalogId: raw === "" ? "" : parseInt(raw, 10),
                    });
                  }}
                >
                  <MenuItem value="">Selecione…</MenuItem>
                  {orgaos.map((o) => (
                    <MenuItem key={o.id} value={String(o.id)}>
                      {o.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            {editingResponsavel.orgMode === "livre" ? (
              <TextField
                label="Órgão / unidade (texto livre)"
                fullWidth
                value={editingResponsavel.orgLivre}
                onChange={(e) => setEditingResponsavel({ ...editingResponsavel, orgLivre: e.target.value })}
              />
            ) : null}
            <TextField
              label="Data de designação"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editingResponsavel.data_designacao}
              onChange={(e) => setEditingResponsavel({ ...editingResponsavel, data_designacao: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseModal} startIcon={<Cancel />} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSaveModal()} variant="contained" startIcon={<Save />} disabled={loading} sx={{ borderRadius: 2 }}>
            {isEditing ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.severity || "success"} sx={{ width: "100%" }}>
          {snackbar?.message || ""}
        </Alert>
      </Snackbar>
    </Container>
  );
}
