"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse,
  FormHelperText,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SecurityIcon from "@mui/icons-material/Security";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import * as dataService from "@/lib/services/dataService";
import { supabaseBrowserClient } from "@utils/supabase/client";
import {
  PERFIL_ESCOPO_PRESETS,
  listItensCortadosResumo,
  buildEscopoFromPreset,
  type PerfilEscopoPreset,
} from "@/lib/programa/perfilEscopo";

const TIPOS_PROGRAMA = [
  { value: "empresa_organizacao", label: "Empresa/Organização" },
  { value: "cliente", label: "Cliente (consultoria)" },
  { value: "projeto_produto", label: "Projeto/Produto" },
  { value: "unidade_departamento", label: "Unidade/Departamento" },
] as const;

const PRESET_ICONS: Record<string, React.ReactNode> = {
  essencial: <PrivacyTipIcon color="primary" />,
  completo: <SecurityIcon color="primary" />,
  com_ia: <AutoAwesomeIcon color="primary" />,
};

export type CriarProgramaFormState = {
  nome: string;
  tipo_programa: string;
  setor: number;
  orgao_id: number | "";
  atividade_principal_organizacao: string;
  descricao_escopo: string;
  perfil_escopo: PerfilEscopoPreset;
  empresa_modo: "nova" | "existente";
  empresa_id: number | "";
  empresa_cnpj: string;
  empresa_razao_social: string;
  empresa_nome_fantasia: string;
  empresa_endereco: string;
  empresa_atividade_principal: string;
  empresa_gestor_responsavel: string;
  empresa_email: string;
  empresa_telefone: string;
};

export const DEFAULT_WIZARD_FORM: CriarProgramaFormState = {
  nome: "",
  tipo_programa: "empresa_organizacao",
  setor: 2,
  orgao_id: "",
  atividade_principal_organizacao: "",
  descricao_escopo: "",
  perfil_escopo: "essencial",
  empresa_modo: "nova",
  empresa_id: "",
  empresa_cnpj: "",
  empresa_razao_social: "",
  empresa_nome_fantasia: "",
  empresa_endereco: "",
  empresa_atividade_principal: "",
  empresa_gestor_responsavel: "",
  empresa_email: "",
  empresa_telefone: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (programaId: number, slug?: string | null) => void;
  orgaos: { id: number; nome?: string | null; sigla?: string | null }[];
  empresas: dataService.EmpresaRow[];
};

export function CriarProgramaWizard({ open, onClose, onCreated, orgaos, empresas }: Props) {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CriarProgramaFormState>(DEFAULT_WIZARD_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetSummary = useMemo(() => {
    const built = buildEscopoFromPreset(
      form.perfil_escopo === "custom" ? "essencial" : form.perfil_escopo
    );
    return listItensCortadosResumo(built.escopo);
  }, [form.perfil_escopo]);

  const resetAndClose = () => {
    setStep(0);
    setForm(DEFAULT_WIZARD_FORM);
    setError(null);
    onClose();
  };

  const handleCreate = async () => {
    const nome = form.nome.trim();
    if (!nome) {
      setError("Informe o nome do programa");
      return;
    }
    if (form.setor === 1 && !form.orgao_id) {
      setError("Selecione o órgão público");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const preset =
        form.setor === 1 && form.perfil_escopo === "essencial" ? "completo" : form.perfil_escopo;
      const payload: dataService.CreateProgramaPayload = {
        nome,
        setor: form.setor,
        orgao: form.setor === 1 ? Number(form.orgao_id) || null : null,
        tipo_programa: form.tipo_programa || null,
        atividade_principal_organizacao: form.atividade_principal_organizacao.trim() || null,
        descricao_escopo: form.descricao_escopo.trim() || null,
        perfil_escopo: preset === "custom" ? "essencial" : preset,
      };
      if (form.setor === 2) {
        if (form.empresa_modo === "existente" && form.empresa_id !== "") {
          payload.empresa_id = Number(form.empresa_id);
        } else if (
          form.empresa_cnpj ||
          form.empresa_razao_social ||
          form.empresa_nome_fantasia
        ) {
          payload.empresa = {
            cnpj: form.empresa_cnpj || undefined,
            razao_social: form.empresa_razao_social || undefined,
            nome_fantasia: form.empresa_nome_fantasia || undefined,
            endereco: form.empresa_endereco || undefined,
            atividade_principal: form.empresa_atividade_principal || undefined,
            gestor_responsavel: form.empresa_gestor_responsavel || undefined,
            email: form.empresa_email || undefined,
            telefone: form.empresa_telefone || undefined,
          };
        }
      }
      const { data, error: createErr } = await dataService.createPrograma(payload);
      if (createErr || !data) {
        setError("Erro ao criar programa");
        setCreating(false);
        return;
      }
      await dataService.createProgramaControlesForProgram(data.id);
      const {
        data: { user },
      } = await supabaseBrowserClient.auth.getUser();
      if (user) {
        let nomeUser = (user.user_metadata?.nome as string) || user.email || "";
        try {
          const res = await fetch("/api/profiles");
          if (res.ok) {
            const profile = await res.json();
            if (profile?.nome) nomeUser = profile.nome;
          }
        } catch {
          /* ignore */
        }
        await dataService.setCreatorAsDPO(data.id, user.id, user.email || "", nomeUser);
      }
      const slugBase = nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const slug = await dataService.getNextAvailableSlug(slugBase || `programa-${data.id}`);
      await dataService.updateProgramaField(data.id, "slug", slug);
      onCreated(data.id, slug);
      resetAndClose();
    } catch {
      setError("Erro inesperado ao criar programa");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>Novo programa de privacidade</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>Identidade</StepLabel></Step>
          <Step><StepLabel>Escopo</StepLabel></Step>
          <Step><StepLabel>Confirmar</StepLabel></Step>
        </Stepper>

        {step === 0 && (
          <Stack spacing={2}>
            <TextField
              label="Nome do programa"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth
              required
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={form.tipo_programa}
                onChange={(e) => setForm((f) => ({ ...f, tipo_programa: e.target.value }))}
              >
                {TIPOS_PROGRAMA.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <RadioGroup
                row
                value={form.setor}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    setor: Number(e.target.value),
                    perfil_escopo: Number(e.target.value) === 1 ? "completo" : f.perfil_escopo,
                  }))
                }
              >
                <FormControlLabel value={2} control={<Radio />} label="Empresa privada" />
                <FormControlLabel value={1} control={<Radio />} label="Órgão público" />
              </RadioGroup>
            </FormControl>
            {form.setor === 1 ? (
              <FormControl fullWidth>
                <InputLabel>Órgão</InputLabel>
                <Select
                  label="Órgão"
                  value={form.orgao_id}
                  onChange={(e) => setForm((f) => ({ ...f, orgao_id: e.target.value as number }))}
                >
                  {orgaos.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.nome}{o.sigla ? ` (${o.sigla})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Collapse in={form.setor === 2}>
                <Stack spacing={1.5}>
                  <FormControl>
                    <RadioGroup
                      row
                      value={form.empresa_modo}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, empresa_modo: e.target.value as "nova" | "existente" }))
                      }
                    >
                      <FormControlLabel value="nova" control={<Radio />} label="Nova empresa" />
                      <FormControlLabel value="existente" control={<Radio />} label="Empresa existente" />
                    </RadioGroup>
                  </FormControl>
                  {form.empresa_modo === "existente" ? (
                    <FormControl fullWidth>
                      <InputLabel>Empresa</InputLabel>
                      <Select
                        label="Empresa"
                        value={form.empresa_id}
                        onChange={(e) => setForm((f) => ({ ...f, empresa_id: e.target.value as number }))}
                      >
                        {empresas.map((e) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.nome_fantasia || e.razao_social || `Empresa #${e.id}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <>
                      <TextField label="CNPJ" value={form.empresa_cnpj} onChange={(e) => setForm((f) => ({ ...f, empresa_cnpj: e.target.value }))} fullWidth />
                      <TextField label="Razão social" value={form.empresa_razao_social} onChange={(e) => setForm((f) => ({ ...f, empresa_razao_social: e.target.value }))} fullWidth />
                      <TextField label="Nome fantasia" value={form.empresa_nome_fantasia} onChange={(e) => setForm((f) => ({ ...f, empresa_nome_fantasia: e.target.value }))} fullWidth />
                    </>
                  )}
                </Stack>
              </Collapse>
            )}
            <TextField
              label="Principal atividade"
              value={form.atividade_principal_organizacao}
              onChange={(e) => setForm((f) => ({ ...f, atividade_principal_organizacao: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Escolha o escopo recomendado. Você pode ativar módulos adicionais depois na home do programa.
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              {PERFIL_ESCOPO_PRESETS.map((p) => {
                const selected = form.perfil_escopo === p.id;
                const disabled = form.setor === 1 && p.id === "essencial";
                return (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : "transparent",
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <CardActionArea
                      disabled={disabled}
                      onClick={() => setForm((f) => ({ ...f, perfil_escopo: p.id }))}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {PRESET_ICONS[p.id]}
                          <Typography variant="subtitle1" fontWeight={700}>{p.label}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
            {form.setor === 1 && (
              <FormHelperText>Órgãos públicos iniciam com escopo Completo (PPSI).</FormHelperText>
            )}
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>Resumo</Typography>
            <Typography variant="body2"><strong>Nome:</strong> {form.nome}</Typography>
            <Typography variant="body2">
              <strong>Escopo:</strong>{" "}
              {PERFIL_ESCOPO_PRESETS.find((p) => p.id === form.perfil_escopo)?.label ?? form.perfil_escopo}
            </Typography>
            {presetSummary.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Fica fora do score inicial:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {presetSummary.slice(0, 8).map((item) => (
                    <Typography key={item} variant="caption" component="span" sx={{ opacity: 0.8 }}>
                      · {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">
              Proporcionalidade operacional — não substitui parecer jurídico sobre conformidade legal.
            </Typography>
          </Stack>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={resetAndClose} disabled={creating}>Cancelar</Button>
        {step > 0 && (
          <Button onClick={() => setStep((s) => s - 1)} disabled={creating}>Voltar</Button>
        )}
        {step < 2 ? (
          <Button
            variant="contained"
            onClick={() => {
              if (step === 0 && !form.nome.trim()) {
                setError("Informe o nome");
                return;
              }
              setError(null);
              setStep((s) => s + 1);
            }}
          >
            Continuar
          </Button>
        ) : (
          <Button variant="contained" onClick={handleCreate} disabled={creating} startIcon={<CheckCircleOutlineIcon />}>
            {creating ? "Criando…" : "Criar programa"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
