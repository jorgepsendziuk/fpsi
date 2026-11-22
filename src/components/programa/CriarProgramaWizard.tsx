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
  Alert,
  Checkbox,
  Link,
  alpha,
  useTheme,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SecurityIcon from "@mui/icons-material/Security";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { ProgramaOperationalPackId } from "@/lib/programa/perfilEscopo";
import type { OperationalContentPackId } from "@/lib/packages/programaContentPack";
import * as dataService from "@/lib/services/dataService";
import { supabaseBrowserClient } from "@utils/supabase/client";
import {
  PERFIL_ESCOPO_PRESETS,
  listItensCortadosResumo,
  buildEscopoFromPreset,
  type PerfilEscopoPreset,
  type PresetDef,
} from "@/lib/programa/perfilEscopo";
import { CONTENT_PACK_UI, PPSI_WIZARD_LICENSE_NOTICE } from "@/lib/packages/contentPackMeta";

const PPSI_PACK = CONTENT_PACK_UI["ppsi-2.0"];

const EMPRESA_PRESET_COMPLETO_LABEL = "Framework da FPSI";

const EMPRESA_PRESET_COMPLETO_DESCRIPTION =
  "Estrutura, segurança da informação e privacidade com o framework próprio da Ferramenta de Privacidade e Segurança de Informação (FPSI) — metodologia da plataforma para empresas e organizações maduras.";

const EMPRESA_PRESET_COMPLETO_IDEAL_FOR =
  "Empresas e organizações privadas com programa de SI + privacidade";

/** Cópia do preset no passo de escopo: empresa vê o Framework FPSI; órgão público mantém o Completo/PPSI. */
function wizardPresetPresentation(
  preset: PresetDef,
  setor: number,
  operationalPackId: ProgramaOperationalPackId = "framework"
): Pick<PresetDef, "label" | "description" | "idealFor" | "includes"> {
  if (setor === 2 && preset.id === "completo" && operationalPackId === "framework") {
    return {
      label: EMPRESA_PRESET_COMPLETO_LABEL,
      description: EMPRESA_PRESET_COMPLETO_DESCRIPTION,
      idealFor: EMPRESA_PRESET_COMPLETO_IDEAL_FOR,
      includes: preset.includes.map((item) =>
        item.startsWith("Todos os módulos operacionais do PPSI")
          ? "Todos os módulos operacionais do framework da FPSI (exceto IA)"
          : item
      ),
    };
  }
  return {
    label: preset.label,
    description: preset.description,
    idealFor: preset.idealFor,
    includes: preset.includes,
  };
}

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
  /** Catálogo eixos 1–3 para empresa privada */
  operational_pack_id: ProgramaOperationalPackId;
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
  operational_pack_id: "framework",
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
  const [ppsiLicenseAckOpen, setPpsiLicenseAckOpen] = useState(false);
  const [ppsiLicenseAckChecked, setPpsiLicenseAckChecked] = useState(false);

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
    setPpsiLicenseAckOpen(false);
    setPpsiLicenseAckChecked(false);
    onClose();
  };

  const advanceWizardStep = () => {
    if (step === 0 && !form.nome.trim()) {
      setError("Informe o nome");
      return;
    }
    setError(null);
    if (
      step === 1 &&
      (form.setor === 1 || (form.setor === 2 && form.operational_pack_id === "ppsi-2.0"))
    ) {
      setPpsiLicenseAckChecked(false);
      setPpsiLicenseAckOpen(true);
      return;
    }
    setStep((s) => s + 1);
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
        operational_pack_id:
          form.setor === 2 ? form.operational_pack_id : undefined,
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
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth={step === 1 ? "lg" : "md"}
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
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
                    operational_pack_id:
                      Number(e.target.value) === 1 ? "ppsi-2.0" : f.operational_pack_id,
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
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                O escopo define o que conta no <strong>score de maturidade</strong> e quais módulos aparecem
                ativos no programa. Comece pelo adequado ao seu momento — dá para ampliar depois na home
                (barra Escopo / Score), sem perder o trabalho já feito.
              </Typography>
            </Box>
            {form.setor === 2 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                  Catálogo de controles e medidas (eixos 1–3)
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                  {(
                    [
                      {
                        id: "framework" as OperationalContentPackId,
                        label: EMPRESA_PRESET_COMPLETO_LABEL,
                        description:
                          "Metodologia autoral da FPSI para empresas maduras (CSI, CPDP, ETIR). Licença MIT.",
                        icon: <BusinessOutlinedIcon color="success" />,
                      },
                      {
                        id: "ppsi-2.0" as OperationalContentPackId,
                        label: PPSI_PACK.nome,
                        description:
                          "Guia do Governo Federal (SGD/MGI) — framework de privacidade e segurança da informação para a administração pública. Uso sujeito à licença CC BY-NC-ND 4.0.",
                        icon: <AccountBalanceOutlinedIcon color="info" />,
                      },
                    ] as const
                  ).map((opt) => {
                    const selected = form.operational_pack_id === opt.id;
                    return (
                      <Card
                        key={opt.id}
                        variant="outlined"
                        sx={{
                          flex: 1,
                          borderColor: selected ? "primary.main" : "divider",
                          borderWidth: selected ? 2 : 1,
                          bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : "transparent",
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            setForm((f) => ({ ...f, operational_pack_id: opt.id }))
                          }
                        >
                          <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                              {opt.icon}
                              <Typography variant="subtitle2" fontWeight={800}>
                                {opt.label}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                              {opt.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="stretch">
              {PERFIL_ESCOPO_PRESETS.map((p) => {
                const presentation = wizardPresetPresentation(
                  p,
                  form.setor,
                  form.operational_pack_id
                );
                const selected = form.perfil_escopo === p.id;
                const disabled = form.setor === 1 && p.id === "essencial";
                return (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      borderColor: selected ? "primary.main" : "divider",
                      borderWidth: selected ? 2 : 1,
                      bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : "transparent",
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <CardActionArea
                      disabled={disabled}
                      onClick={() => setForm((f) => ({ ...f, perfil_escopo: p.id }))}
                      sx={{
                        flex: 1,
                        alignItems: "stretch",
                        height: "100%",
                        ".MuiCardActionArea-focusHighlight": { opacity: 0 },
                      }}
                    >
                      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {PRESET_ICONS[p.id]}
                          <Typography variant="subtitle1" fontWeight={800}>
                            {presentation.label}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {presentation.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                          }}
                        >
                          Ideal para
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5, lineHeight: 1.45 }}>
                          {presentation.idealFor}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                            mt: 0.5,
                          }}
                        >
                          Inclui
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2, "& li": { mb: 0.35 } }}>
                          {presentation.includes.map((item) => (
                            <Typography key={item} component="li" variant="caption" color="text.primary" sx={{ lineHeight: 1.4 }}>
                              {item}
                            </Typography>
                          ))}
                        </Box>
                        {p.excludes.length > 0 && (
                          <>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: "text.secondary",
                                letterSpacing: "0.02em",
                                textTransform: "uppercase",
                                fontSize: "0.65rem",
                                mt: 0.25,
                              }}
                            >
                              Fica de fora (ativável depois)
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2, "& li": { mb: 0.35 } }}>
                              {p.excludes.map((item) => (
                                <Typography
                                  key={item}
                                  component="li"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ lineHeight: 1.4 }}
                                >
                                  {item}
                                </Typography>
                              ))}
                            </Box>
                          </>
                        )}
                        {p.excludes.length === 0 && (
                          <Typography variant="caption" color="success.main" fontWeight={600} sx={{ mt: "auto", pt: 0.5 }}>
                            Escopo máximo disponível no FPSI
                          </Typography>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
            {form.setor === 1 && (
              <FormHelperText sx={{ mx: 0 }}>
                Órgãos públicos iniciam com escopo Completo (PPSI). O Essencial fica desabilitado neste setor.
              </FormHelperText>
            )}
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>Resumo</Typography>
            <Typography variant="body2"><strong>Nome:</strong> {form.nome}</Typography>
            {(() => {
              const preset = PERFIL_ESCOPO_PRESETS.find((p) => p.id === form.perfil_escopo);
              const presentation = preset
                ? wizardPresetPresentation(preset, form.setor, form.operational_pack_id)
                : null;
              return (
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Escopo:</strong> {presentation?.label ?? form.perfil_escopo}
                  </Typography>
                  {form.setor === 2 && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Catálogo (eixos 1–3):</strong>{" "}
                      {form.operational_pack_id === "ppsi-2.0"
                        ? PPSI_PACK.nome
                        : EMPRESA_PRESET_COMPLETO_LABEL}
                    </Typography>
                  )}
                  {presentation && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.5, mb: 1 }}>
                      {presentation.description}
                    </Typography>
                  )}
                </Box>
              );
            })()}
            {presetSummary.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>
                  Fica fora do score inicial (pode ativar depois):
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
          <Button variant="contained" onClick={advanceWizardStep}>
            Continuar
          </Button>
        ) : (
          <Button variant="contained" onClick={handleCreate} disabled={creating} startIcon={<CheckCircleOutlineIcon />}>
            {creating ? "Criando…" : "Criar programa"}
          </Button>
        )}
      </DialogActions>
      <Dialog
        open={ppsiLicenseAckOpen}
        onClose={() => setPpsiLicenseAckOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <GavelIcon color="warning" fontSize="small" />
          Licença do conteúdo PPSI 2.0
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {form.setor === 1 ? (
              <>
                Órgãos públicos utilizam o catálogo e a metodologia do{" "}
                <strong>{PPSI_PACK.nome}</strong> (pacote <code>{PPSI_PACK.id}</code>). O uso desse
                conteúdo está sujeito à licença do titular.
              </>
            ) : (
              <>
                Você optou pelo <strong>{PPSI_PACK.nome}</strong> na empresa privada. O catálogo é
                conteúdo do Governo Federal (SGD/MGI) e o uso está sujeito à licença do titular.
              </>
            )}
          </Alert>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.55 }}>
            {PPSI_WIZARD_LICENSE_NOTICE.intro}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.55 }}>
            <strong>Titular:</strong> {PPSI_WIZARD_LICENSE_NOTICE.titular} (
            {PPSI_PACK.titular})
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.55 }}>
            <strong>Licença:</strong> {PPSI_WIZARD_LICENSE_NOTICE.licencaLonga} (
            {PPSI_PACK.licenca}).
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Principais restrições
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.25, mb: 1.5 }}>
            {PPSI_WIZARD_LICENSE_NOTICE.restricoes.map((item) => (
              <Typography key={item} component="li" variant="body2" sx={{ lineHeight: 1.5, mb: 0.35 }}>
                {item}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, mb: 1 }}>
            {PPSI_WIZARD_LICENSE_NOTICE.notaFerramenta}
          </Typography>
          {PPSI_PACK.url_fonte ? (
            <Link href={PPSI_PACK.url_fonte} target="_blank" rel="noopener noreferrer" variant="body2">
              Guia oficial PPSI 2.0 (gov.br)
            </Link>
          ) : null}
          <FormControlLabel
            sx={{ mt: 2, alignItems: "flex-start", mx: 0 }}
            control={
              <Checkbox
                checked={ppsiLicenseAckChecked}
                onChange={(e) => setPpsiLicenseAckChecked(e.target.checked)}
                sx={{ pt: 0.25 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                Li e entendo que o programa usará conteúdo do PPSI 2.0 sob{" "}
                <strong>{PPSI_PACK.licenca}</strong> e aceito cumprir suas condições no uso pela
                organização.
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPpsiLicenseAckOpen(false)}>Voltar ao escopo</Button>
          <Button
            variant="contained"
            disabled={!ppsiLicenseAckChecked}
            onClick={() => {
              setPpsiLicenseAckOpen(false);
              setStep(2);
            }}
          >
            Continuar para confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
