"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { useProgramaAccess } from "@/hooks/useProgramaAccess";
import * as dataService from "@/lib/services/dataService";

type Escopo = {
  diagnostico_ids?: number[];
  controle_ids?: number[];
  modulos?: string[];
};

type AreaUser = {
  user_id: string;
  nome: string | null;
  email: string | null;
};

type AreaRow = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
  programa_area_escopo?: Escopo | Escopo[] | null;
  users?: AreaUser[];
};

type ProgramaUser = {
  user_id: string;
  nome?: string | null;
  email?: string | null;
  role?: string;
};

function escopoOf(area: AreaRow): Escopo {
  const raw = area.programa_area_escopo;
  if (Array.isArray(raw)) return raw[0] || {};
  return raw || {};
}

function userLabel(u: { nome?: string | null; email?: string | null; user_id: string }) {
  return u.nome?.trim() || u.email?.trim() || u.user_id.slice(0, 8);
}

const DIAG_LABELS: Record<number, string> = {
  1: "Estrutura",
  2: "Segurança da Informação",
  3: "Privacidade",
  4: "Governança de IA",
};

export default function AreasPage() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const { isFull, loading: accessLoading } = useProgramaAccess(programaId ?? undefined);

  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [users, setUsers] = useState<ProgramaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programaNome, setProgramaNome] = useState("");
  const [edit, setEdit] = useState<AreaRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    diagnostico_ids: [] as number[],
    modulos: ["questionario", "kpis"] as string[],
    ativo: true,
    user_ids: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const [areasRes, usersRes, prog] = await Promise.all([
        fetch(`/api/programas/${programaId}/areas`),
        fetch(`/api/users?programaId=${programaId}`),
        dataService.fetchProgramaById(programaId),
      ]);
      if (!areasRes.ok) {
        const j = await areasRes.json().catch(() => ({}));
        throw new Error(j.error || "Falha ao carregar áreas");
      }
      setAreas(await areasRes.json());
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else {
        setUsers([]);
      }
      setProgramaNome(prog?.nome || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setForm({
      nome: "",
      descricao: "",
      diagnostico_ids: [],
      modulos: ["questionario", "kpis"],
      ativo: true,
      user_ids: [],
    });
    setEdit(null);
    setCreateOpen(true);
  };

  const openEdit = (area: AreaRow) => {
    const e = escopoOf(area);
    setEdit(area);
    setForm({
      nome: area.nome,
      descricao: area.descricao || "",
      diagnostico_ids: e.diagnostico_ids || [],
      modulos: e.modulos || ["questionario", "kpis"],
      ativo: area.ativo,
      user_ids: (area.users || []).map((u) => u.user_id),
    });
    setCreateOpen(true);
  };

  const toggleDiag = (id: number) => {
    setForm((f) => ({
      ...f,
      diagnostico_ids: f.diagnostico_ids.includes(id)
        ? f.diagnostico_ids.filter((x) => x !== id)
        : [...f.diagnostico_ids, id],
    }));
  };

  const toggleModulo = (m: string) => {
    setForm((f) => ({
      ...f,
      modulos: f.modulos.includes(m) ? f.modulos.filter((x) => x !== m) : [...f.modulos, m],
    }));
  };

  const toggleUser = (userId: string) => {
    setForm((f) => ({
      ...f,
      user_ids: f.user_ids.includes(userId)
        ? f.user_ids.filter((x) => x !== userId)
        : [...f.user_ids, userId],
    }));
  };

  const save = async () => {
    if (!programaId) return;
    setSaving(true);
    setError(null);
    try {
      if (edit) {
        const res = await fetch(`/api/programas/${programaId}/areas/${edit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: form.nome,
            descricao: form.descricao,
            ativo: form.ativo,
            diagnostico_ids: form.diagnostico_ids,
            controle_ids: [],
            modulos: form.modulos,
            user_ids: form.user_ids,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      } else {
        const res = await fetch(`/api/programas/${programaId}/areas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: form.nome,
            descricao: form.descricao,
            diagnostico_ids: form.diagnostico_ids,
            modulos: form.modulos,
            user_ids: form.user_ids,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
      }
      setCreateOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const seed = async () => {
    if (!programaId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro no seed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (areaId: number) => {
    if (!programaId || !confirm("Excluir esta área?")) return;
    const res = await fetch(`/api/programas/${programaId}/areas/${areaId}`, { method: "DELETE" });
    if (!res.ok) {
      setError((await res.json()).error || "Erro ao excluir");
      return;
    }
    await load();
  };

  if (idLoading || accessLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isFull) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Somente gestores do programa podem gerenciar áreas.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: "auto" }}>
      <PageHeroHeader
        title="Áreas e questionários"
        description={
          programaNome
            ? `${programaNome} — defina setores, quem responde e o pacote de controles`
            : "Defina setores, quem responde e o pacote de controles do questionário"
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova área
        </Button>
        <Button variant="outlined" onClick={() => void seed()} disabled={saving}>
          Popular áreas padrão
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : areas.length === 0 ? (
        <Alert severity="info">
          Nenhuma área ainda. Use &quot;Popular áreas padrão&quot; ou crie RH, TI, etc.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {areas.map((area) => {
            const e = escopoOf(area);
            const members = area.users || [];
            return (
              <Box
                key={area.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  opacity: area.ativo ? 1 : 0.6,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6">{area.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {area.descricao || `slug: ${area.slug}`}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                      {(e.diagnostico_ids || []).map((d) => (
                        <Chip key={d} size="small" label={DIAG_LABELS[d] || `Eixo ${d}`} />
                      ))}
                      {(e.modulos || []).map((m) => (
                        <Chip key={m} size="small" variant="outlined" label={m} />
                      ))}
                      {!area.ativo && <Chip size="small" color="warning" label="Inativa" />}
                    </Stack>
                    <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5 }}>
                      Responsáveis
                    </Typography>
                    {members.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Ninguém atribuído — edite a área para escolher usuários
                      </Typography>
                    ) : (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {members.map((u) => (
                          <Chip
                            key={u.user_id}
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={userLabel(u)}
                            title={u.email || u.user_id}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                  <Stack direction="row">
                    <IconButton onClick={() => openEdit(area)} aria-label="Editar">
                      <EditOutlinedIcon />
                    </IconButton>
                    <IconButton onClick={() => void remove(area.id)} aria-label="Excluir">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{edit ? "Editar área" : "Nova área"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={form.nome}
              onChange={(ev) => setForm((f) => ({ ...f, nome: ev.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(ev) => setForm((f) => ({ ...f, descricao: ev.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <Typography variant="subtitle2">Eixos do questionário (PPSI)</Typography>
            <FormGroup>
              {[1, 2, 3, 4].map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      checked={form.diagnostico_ids.includes(d)}
                      onChange={() => toggleDiag(d)}
                    />
                  }
                  label={DIAG_LABELS[d]}
                />
              ))}
            </FormGroup>
            <Typography variant="subtitle2">Módulos liberados</Typography>
            <FormGroup row>
              {["questionario", "kpis", "mapeamento", "riscos"].map((m) => (
                <FormControlLabel
                  key={m}
                  control={
                    <Checkbox checked={form.modulos.includes(m)} onChange={() => toggleModulo(m)} />
                  }
                  label={m}
                />
              ))}
            </FormGroup>
            <Typography variant="subtitle2">Usuários desta área</Typography>
            <Typography variant="caption" color="text.secondary">
              Quem for marcado passa a responder o questionário desta área (aparece em Minhas tarefas).
            </Typography>
            {users.length === 0 ? (
              <Alert severity="info">
                Ainda não há usuários no programa. Convide alguém em Responsabilidades / Gestão de usuários.
              </Alert>
            ) : (
              <FormGroup
                sx={{
                  maxHeight: 220,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                {users.map((u) => (
                  <FormControlLabel
                    key={u.user_id}
                    control={
                      <Checkbox
                        checked={form.user_ids.includes(u.user_id)}
                        onChange={() => toggleUser(u.user_id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{userLabel(u)}</Typography>
                        {u.email && u.nome ? (
                          <Typography variant="caption" color="text.secondary">
                            {u.email}
                          </Typography>
                        ) : null}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            )}
            {edit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={form.ativo}
                    onChange={(_, v) => setForm((f) => ({ ...f, ativo: v }))}
                  />
                }
                label="Área ativa"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving || !form.nome.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
