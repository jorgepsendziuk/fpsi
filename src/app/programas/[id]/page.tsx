"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Grid,
  Box,
  Link,
  Stack,
  Divider,
  TextField,
  IconButton,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Popover,
  Switch,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Group,
  Policy,
  CheckCircleOutline,
  ArrowBack,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Gavel as GavelIcon,
  Public as PublicIcon,
  CloudUpload as CloudUploadIcon,
  Business as BusinessIcon,
  Tag as TagIcon,
  Place as PlaceIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  MeetingRoom as MeetingRoomIcon,
} from "@mui/icons-material";
import { PapelLgpdDiagramWithEdit } from "@/components/programa/PapelLgpdDiagramWithEdit";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import { shouldUseDemoData } from "@/lib/services/demoDataService";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { LastUpdateInfo } from "@/components/common/LastUpdateInfo";
import { useLastActivity } from "@/hooks/useLastActivity";
import { getProgramaLogoDisplayUrl, isProgramaDemonstracao } from "@/lib/utils/programaDemoLogo";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { getProgramaTituloPrincipal } from "@/lib/utils/programaDisplay";
import NextLink from "next/link";
import { ModuloSistemaFlipCard, MODULO_FLIP_STRIP_WIDTH_PX } from "@/components/programa/ModuloSistemaFlipCard";
import type { ModulosResumoApi } from "@/lib/services/dataService";

/** Ordem: escritório (camada visual opcional) → estrutura de governança → … → auditoria */
const sections: Array<{
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  color: string;
  gradient: string;
}> = [
  {
    key: "escritorio-governanca",
    title: "Escritório de governança",
    icon: <MeetingRoomIcon fontSize="large" />,
    description:
      "Navegação em formato de sala: mesas, papéis e atalhos aos setores (mesmos módulos do painel, visão gamificada em evolução)",
    path: "escritorio",
    color: "#5d4037",
    gradient: "linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)",
  },
  {
    key: "responsabilidades",
    title: "Estrutura de Governança",
    icon: <Group fontSize="large" />,
    description:
      "Instruções e campos para responsáveis institucionais (SI, privacidade, TIC, integridade), referência normativa PPSI 2.0 e diagrama de papéis LGPD",
    path: "responsabilidades",
    color: "#607d8b",
    gradient: "linear-gradient(135deg, #607d8b 0%, #78909c 100%)",
  },
  {
    key: "conformidade-tratamento",
    title: "Tratamento de dados e riscos",
    icon: <GavelIcon fontSize="large" />,
    description: "ROPA, RIPD e incidentes — registro de operações e gestão de riscos",
    path: "conformidade",
    color: "#1976d2",
    gradient: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
  },
  {
    key: "diagnostico",
    title: "Diagnóstico",
    icon: <CheckCircleOutline fontSize="large" />,
    description: "Avalie a maturidade e realize diagnósticos completos",
    path: "diagnostico",
    color: "#4caf50",
    gradient: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
  },
  {
    key: "planos-acao",
    title: "Plano de Trabalho",
    icon: <AssignmentIcon fontSize="large" />,
    description: "Gerencie o plano de trabalho e acompanhe o progresso",
    path: "planos-acao",
    color: "#2196f3",
    gradient: "linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)"
  },
  {
    key: "politicas",
    title: "Políticas e documentos",
    icon: <Policy fontSize="large" />,
    description:
      "Políticas institucionais, aviso de privacidade e outros textos que você publica ou cita no portal de privacidade",
    path: "politicas",
    color: "#9c27b0",
    gradient: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)",
  },
  {
    key: "portal-privacidade",
    title: "Titulares e canais públicos",
    icon: <PublicIcon fontSize="large" />,
    description: "Pedidos dos titulares, reportes e contato, e acesso ao site público (portal de privacidade) do programa",
    path: "conformidade/portal",
    color: "#0288d1",
    gradient: "linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)",
  },
  {
    key: "usuarios",
    title: "Usuários e Permissões",
    icon: <PeopleIcon fontSize="large" />,
    description: "Controle acesso e permissões dos usuários",
    path: "usuarios",
    color: "#ff9800",
    gradient: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)"
  },
  {
    key: "auditoria",
    title: "Histórico de Atividades",
    icon: <SecurityIcon fontSize="large" />,
    description: "Trilha de auditoria: quem fez o quê, quando (LGPD art. 37, Framework FPSI Controle 8)",
    path: "auditoria",
    color: "#455a64",
    gradient: "linear-gradient(135deg, #455a64 0%, #78909c 100%)"
  }
];

/** Campos de identificação e contato (tabela programa) — edição na página inicial do programa */
const organizationFieldsEmpresa = [
  { key: "nome", label: "Nome do programa", icon: <BusinessIcon /> },
  { key: "nome_fantasia", label: "Nome fantasia", icon: <BusinessIcon /> },
  { key: "razao_social", label: "Razão social", icon: <BusinessIcon /> },
  { key: "cnpj", label: "CNPJ", icon: <TagIcon /> },
  { key: "endereco", label: "Endereço", icon: <PlaceIcon /> },
  { key: "atendimento_email", label: "E-mail de atendimento", icon: <EmailIcon /> },
  { key: "atendimento_fone", label: "Telefone de atendimento", icon: <PhoneIcon /> },
  { key: "atendimento_site", label: "Site institucional", icon: <WebsiteIcon /> },
  {
    key: "atividade_principal_organizacao",
    label: "Principal atividade",
    icon: <AssignmentIcon />,
    fullRow: true,
  },
];

/** Só endereço livre; órgão vem do cadastro (programa.orgao → tabela orgao). */
const organizationFieldsOrgaoPublico = [{ key: "endereco", label: "Endereço", icon: <PlaceIcon /> }];

/** Com órgão público, não exibir campos de empresa (nome fantasia, CNPJ, razão social); endereço no bloco do órgão público. */
const CAMPOS_EMPRESA_OCULTOS_SE_ORGAO_PUBLICO = new Set([
  "nome_fantasia",
  "razao_social",
  "cnpj",
  "endereco",
]);

type ProgramaFieldDef = {
  key: string;
  label: string;
  icon: React.ReactNode;
  kind?: "text" | "date";
  /** Linha inteira no grid (ex.: texto longo) */
  fullRow?: boolean;
};

const programaEscopoField: ProgramaFieldDef = {
  key: "descricao_escopo",
  label: "Escopo do programa de privacidade",
  icon: <DescriptionIcon />,
  fullRow: true,
};

/** Apenas órgão público — rastreio do envio e retorno do diagnóstico ao SGD/ME */
const sgdUsoFields: ProgramaFieldDef[] = [
  {
    key: "sgd_numero_documento_nota_tecnica",
    label: "Nº do documento (Nota Técnica)",
    icon: <DescriptionIcon />,
    kind: "text",
  },
  {
    key: "sgd_versao_diagnostico_enviado",
    label: "Versão do diagnóstico enviado",
    icon: <TagIcon />,
    kind: "text",
  },
  {
    key: "sgd_data_limite_retorno",
    label: "Data limite para retorno do diagnóstico",
    icon: <EventIcon />,
    kind: "date",
  },
];

const sgdRetornoFields: ProgramaFieldDef[] = [
  {
    key: "sgd_retorno_data",
    label: "Data de retorno do diagnóstico para SGD",
    icon: <EventIcon />,
    kind: "date",
  },
  {
    key: "sgd_versao_diagnostico",
    label: "Versão do diagnóstico devolvido",
    icon: <TagIcon />,
    kind: "text",
  },
];

const SGD_DATE_KEYS = new Set(["sgd_data_limite_retorno", "sgd_retorno_data"]);

const SGD_NULLABLE_TEXT_KEYS = new Set([
  "sgd_numero_documento_nota_tecnica",
  "sgd_versao_diagnostico_enviado",
  "sgd_versao_diagnostico",
]);

export default function ProgramaMainPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const idOrSlug = params.id as string;
  const [programa, setPrograma] = useState<any>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  /** Destaca o card Estrutura de Governança quando o cursor está sobre o diagrama Estrutura de Tratamento */
  const [diagramHover, setDiagramHover] = useState(false);
  const [setorSaving, setSetorSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState<string | null>(null);
  const [orgaosCatalogo, setOrgaosCatalogo] = useState<
    Array<{ id: number; nome: string | null; sigla?: string | null }>
  >([]);
  const [orgaosCatalogoLoading, setOrgaosCatalogoLoading] = useState(true);
  const [orgaoSaving, setOrgaoSaving] = useState(false);
  const [dadosProgramaPopoverAnchor, setDadosProgramaPopoverAnchor] = useState<HTMLElement | null>(null);
  const [dadosOrgPopoverAnchor, setDadosOrgPopoverAnchor] = useState<HTMLElement | null>(null);
  const programaId = programa?.id;

  const orgaoNome = useMemo(() => {
    if (!programa?.orgao || orgaosCatalogo.length === 0) return null;
    const o = orgaosCatalogo.find((x) => x.id === programa.orgao);
    if (!o) return null;
    const label = (o.nome && String(o.nome).trim()) || `Órgão #${o.id}`;
    return `${label}${o.sigla ? ` (${o.sigla})` : ""}`;
  }, [programa, orgaosCatalogo]);

  const isDemoMode = shouldUseDemoData(programaId);
  const isProgramaDemoInstitucional = programa ? isProgramaDemonstracao(programa) : false;
  const logoDisplayUrl = programa ? getProgramaLogoDisplayUrl(programa) : null;
  const { programaUser, isLoading: permissionsLoading, hasPermission } = useUserPermissions(
    isDemoMode ? undefined : programaId
  );
  /** Em demonstração: pode abrir campos e alterar na tela; nada é persistido. Fora demo: exige permissão. */
  const canEditProgramaFieldsUi = isDemoMode || hasPermission("can_edit_programa");
  const canPersistProgramaData = !isDemoMode && hasPermission("can_edit_programa");
  const { lastActivity } = useLastActivity(
    programaId ?? undefined,
    "programa",
    programaId ?? undefined,
    !isDemoMode && !!programaId
  );

  const [modulosResumo, setModulosResumo] = useState<ModulosResumoApi | null>(null);
  const [modulosResumoLoading, setModulosResumoLoading] = useState(false);
  const [modulosResumoError, setModulosResumoError] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", { noSsr: true });
  const canHover = useMediaQuery("(hover: hover)", { noSsr: true });

  useEffect(() => {
    if (!programaId) {
      setModulosResumo(null);
      setModulosResumoLoading(false);
      setModulosResumoError(false);
      return;
    }
    let cancelled = false;
    setModulosResumoLoading(true);
    setModulosResumoError(false);
    dataService
      .fetchModulosResumo(programaId)
      .then((d) => {
        if (!cancelled) {
          setModulosResumo(d);
          setModulosResumoError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModulosResumo(null);
          setModulosResumoError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setModulosResumoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  useEffect(() => {
    const fetchPrograma = async () => {
      setLoading(true);
      try {
        const data = await dataService.fetchProgramaByIdOrSlug(idOrSlug);
        setPrograma(data);
      } catch (error) {
        console.error("Erro ao carregar programa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograma();
  }, [idOrSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await dataService.fetchOrgaos();
        if (!cancelled) setOrgaosCatalogo(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setOrgaosCatalogo([]);
      } finally {
        if (!cancelled) setOrgaosCatalogoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatCnpjDisplay = (v: string | number | null | undefined): string => {
    if (v == null || v === "") return "";
    const s = String(v).replace(/\D/g, "");
    if (s.length !== 14) return String(v);
    return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const handleEdit = (field: string, value: unknown) => {
    setEditField(field);
    if (field === "cnpj") {
      setEditValue(formatCnpjDisplay(String(value ?? "")) || "");
      return;
    }
    if (SGD_DATE_KEYS.has(field)) {
      const s = value != null && value !== "" ? String(value).slice(0, 10) : "";
      setEditValue(s);
      return;
    }
    setEditValue(value != null ? String(value) : "");
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSetorPublicoToggle = async (checked: boolean) => {
    if (!programaId || !canEditProgramaFieldsUi) return;
    if (isDemoMode) {
      setPrograma((prev: any) => ({ ...prev, setor: checked ? 1 : 2 }));
      return;
    }
    if (!canPersistProgramaData) return;
    setSetorSaving(true);
    try {
      const res = await dataService.updateProgramaSetor(programaId, checked ? 1 : 2);
      if (res.error) throw res.error;
      const refreshed = await dataService.fetchProgramaById(programaId);
      if (refreshed) setPrograma(refreshed);
    } catch (e) {
      console.error("Erro ao atualizar tipo de organização:", e);
    } finally {
      setSetorSaving(false);
    }
  };

  const handleLogoUpload = async (tipo: "orgao" | "programa", file: File) => {
    if (!programaId || isDemoMode) return;
    setLogoUploading(tipo);
    try {
      const { success } = await dataService.uploadProgramaLogo(programaId, file, tipo);
      if (success) {
        const data = await dataService.fetchProgramaById(programaId);
        setPrograma(data);
      }
    } catch {
      // ignora erro de upload
    } finally {
      setLogoUploading(null);
    }
  };

  const handleOrgaoCatalogoChange = async (orgaoId: number | null) => {
    if (!programaId || !canEditProgramaFieldsUi) return;
    if (isDemoMode) {
      setPrograma((prev: any) => ({ ...prev, orgao: orgaoId }));
      return;
    }
    if (!canPersistProgramaData) return;
    setOrgaoSaving(true);
    try {
      const { error } = await dataService.updateProgramaField(programaId, "orgao", orgaoId);
      if (error) throw error;
      const refreshed = await dataService.fetchProgramaById(programaId);
      if (refreshed) setPrograma(refreshed);
    } catch (e) {
      console.error("Erro ao atualizar órgão:", e);
    } finally {
      setOrgaoSaving(false);
    }
  };

  const handleSave = async (field: string) => {
    const isSgdDate = SGD_DATE_KEYS.has(field);
    const isDateField = isSgdDate;
    if (!programaId) {
      handleCancel();
      return;
    }
    const nullableProgramaFields = [
      "endereco",
      "cnpj",
      "nome_fantasia",
      "razao_social",
      "atendimento_email",
      "atendimento_fone",
      "atendimento_site",
      "atividade_principal_organizacao",
      "descricao_escopo",
      ...Array.from(SGD_NULLABLE_TEXT_KEYS),
    ];
    if (!isDateField && !editValue.trim() && !nullableProgramaFields.includes(field)) {
      handleCancel();
      return;
    }
    setLoading(true);
    try {
      let valueToSave: string | number | null = isDateField
        ? editValue.trim() || null
        : editValue.trim() || null;
      if (field === "cnpj") {
        const digits = String(editValue).replace(/\D/g, "");
        valueToSave = digits.length >= 14 ? parseInt(digits.slice(0, 14), 10) : null;
      }
      if (isDemoMode) {
        setPrograma((prev: any) => ({ ...prev, [field]: valueToSave }));
        setEditField(null);
        setEditValue("");
        return;
      }
      await dataService.updateProgramaField(programaId, field, valueToSave);
      const refreshed = await dataService.fetchProgramaById(programaId);
      if (refreshed) setPrograma(refreshed);
      else setPrograma((prev: any) => ({ ...prev, [field]: valueToSave }));
      setEditField(null);
      setEditValue("");
    } catch (error) {
      console.error("Erro ao salvar campo:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderEditableField = (field: ProgramaFieldDef, rawValue: unknown, canEdit: boolean) => {
    const isEditing = editField === field.key;
    const kind = field.kind ?? "text";
    const str = rawValue != null ? String(rawValue) : "";
    const displayValue =
      field.key === "cnpj" && str ? formatCnpjDisplay(str) : str;
    let dateDisplay = "";
    if (kind === "date" && str) {
      const d = new Date(String(rawValue).slice(0, 10) + "T12:00:00");
      if (!isNaN(d.getTime())) dateDisplay = d.toLocaleDateString("pt-BR");
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          borderColor: theme.palette.primary.main
        }
      }}>
        <Box sx={{ color: theme.palette.primary.main }}>
          {field.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {field.label}
          </Typography>
          {field.key === "atividade_principal_organizacao" && !isEditing && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
              Atividade institucional do controlador. 
            </Typography>
          )}
          {field.key === "descricao_escopo" && !isEditing && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
              Contexto do programa (projeto, territórios, metas).  da organização.
            </Typography>
          )}
          {isEditing ? (
            kind === "date" ? (
              <DatePicker
                value={editValue ? dayjs(editValue) : null}
                onChange={(date) => setEditValue(date ? date.format("YYYY-MM-DD") : "")}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { mt: 0.5, width: "100%", maxWidth: 280 },
                    disabled: loading,
                  },
                }}
              />
            ) : (
            <TextField
              size="small"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              sx={{ mt: 0.5, width: '100%' }}
              disabled={loading}
              autoFocus
              multiline={
                field.key === "endereco" ||
                field.key === "descricao_escopo" ||
                field.key === "atividade_principal_organizacao"
              }
              minRows={
                field.key === "endereco"
                  ? 3
                  : field.key === "descricao_escopo"
                    ? 4
                    : field.key === "atividade_principal_organizacao"
                      ? 3
                      : 1
              }
            />
            )
          ) : (
            <Typography
              variant="body1"
              sx={{
                mt: 0.5,
                ...((field.key === "descricao_escopo" || field.key === "atividade_principal_organizacao") &&
                displayValue
                  ? { whiteSpace: "pre-wrap", wordBreak: "break-word" }
                  : {}),
              }}
            >
              {kind === "date" ? (
                dateDisplay || (
                  <span style={{ color: theme.palette.text.disabled, fontStyle: 'italic' }}>
                    Não informado
                  </span>
                )
              ) : displayValue ? (
                displayValue
              ) : (
                <span style={{ color: theme.palette.text.disabled, fontStyle: 'italic' }}>
                  Não informado
                </span>
              )}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isEditing ? (
            <>
              <IconButton 
                color="success" 
                onClick={() => handleSave(field.key)} 
                disabled={loading}
                size="small"
              >
                <SaveIcon />
              </IconButton>
              <IconButton 
                color="error" 
                onClick={handleCancel} 
                disabled={loading}
                size="small"
              >
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            canEdit && (
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(field.key, rawValue)}
              size="small"
              aria-label={`Editar ${field.label}`}
            >
              <EditIcon />
            </IconButton>
            )
          )}
        </Box>
      </Box>
    );
  };

  if (loading && !programa) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5].map(i => (
            <Grid item xs={12} sm={6} xl={4} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!programa) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error">
          Programa não encontrado.
        </Alert>
      </Container>
    );
  }

  // Usuário não está atribuído ao programa (e não é modo demo)
  if (!isDemoMode && !permissionsLoading && !programaUser) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Você não tem acesso a este programa.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/dashboard")}>
          Voltar aos programas
        </Button>
      </Container>
    );
  }

  const isOrgaoPublico = programa.setor === 1 || programa.setor === "1";
  const programaName = getProgramaTituloPrincipal(programa);
  const hasSubtitle = isOrgaoPublico
    ? !!(orgaoNome || programa.sigla || programa.unidade)
    : !!(programa.nome_fantasia || programa.razao_social);

  const logoSlot = (
    <Box
      sx={{
        position: "relative",
        flexShrink: 0,
        width: 96,
        height: 96,
      }}
    >
      {logoDisplayUrl ? (
        <Box
          component="img"
          src={logoDisplayUrl}
          alt="Logo"
          sx={{
            width: 96,
            height: 96,
            borderRadius: 2,
            objectFit: "contain",
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            p: 0.75,
            display: "block",
          }}
        />
      ) : (
        <Avatar
          sx={{
            width: 96,
            height: 96,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          <SecurityIcon sx={{ fontSize: 48 }} />
        </Avatar>
      )}
      {!isDemoMode && !isProgramaDemoInstitucional && (
        <IconButton
          component="label"
          size="small"
          disabled={!!logoUploading}
          aria-label={programa.logo_programa || programa.logo_orgao_empresa ? "Trocar logo" : "Enviar logo"}
          sx={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 30,
            height: 30,
            p: 0,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 1,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          {logoUploading === "programa" ? (
            <CircularProgress size={16} thickness={5} />
          ) : (
            <CloudUploadIcon sx={{ fontSize: 16 }} />
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoUpload("programa", f);
              e.target.value = "";
            }}
          />
        </IconButton>
      )}
    </Box>
  );

  const dadosButtons = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      flexWrap="wrap"
      useFlexGap
      alignItems="stretch"
      sx={{
        flexShrink: 0,
        width: { xs: "100%", sm: "auto" },
        justifyContent: { xs: "stretch", sm: "flex-end" },
      }}
    >
            <Button
              variant="contained"
              aria-expanded={Boolean(dadosProgramaPopoverAnchor)}
              aria-haspopup="true"
              onClick={(e) => {
                setDadosOrgPopoverAnchor(null);
                setDadosProgramaPopoverAnchor((a) => (a ? null : e.currentTarget));
              }}
              sx={{
                textTransform: "none",
                borderRadius: 2.5,
                py: 2.25,
                px: 2.5,
                minHeight: 128,
                width: { xs: "100%", sm: 176 },
                maxWidth: { xs: 420, sm: 176 },
                mx: { xs: "auto", sm: 0 },
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 1,
                fontWeight: 700,
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.38)}`,
                background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.primary.contrastText,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.48)}`,
                  transform: "translateY(-3px)",
                  background: `linear-gradient(145deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                },
              }}
            >
              <DashboardIcon sx={{ fontSize: 36, opacity: 0.95 }} />
              <Box sx={{ textAlign: "left" }}>
                <Typography component="span" variant="subtitle1" sx={{ fontWeight: 800, display: "block", lineHeight: 1.25 }}>
                  Dados do programa
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.92, fontWeight: 500, display: "block", mt: 0.35 }}>
                  Escopo e identificação
                </Typography>
              </Box>
            </Button>
            <Button
              variant="contained"
              aria-expanded={Boolean(dadosOrgPopoverAnchor)}
              aria-haspopup="true"
              onClick={(e) => {
                setDadosProgramaPopoverAnchor(null);
                setDadosOrgPopoverAnchor((a) => (a ? null : e.currentTarget));
              }}
              sx={{
                textTransform: "none",
                borderRadius: 2.5,
                py: 2.25,
                px: 2.5,
                minHeight: 128,
                width: { xs: "100%", sm: 176 },
                maxWidth: { xs: 420, sm: 176 },
                mx: { xs: "auto", sm: 0 },
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 1,
                fontWeight: 700,
                boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.35)}`,
                background: `linear-gradient(145deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: theme.palette.secondary.contrastText,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  boxShadow: `0 10px 28px ${alpha(theme.palette.secondary.main, 0.45)}`,
                  transform: "translateY(-3px)",
                  background: `linear-gradient(145deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                },
              }}
            >
              <BusinessIcon sx={{ fontSize: 36, opacity: 0.95 }} />
              <Box sx={{ textAlign: "left" }}>
                <Typography component="span" variant="subtitle1" sx={{ fontWeight: 800, display: "block", lineHeight: 1.25 }}>
                  Dados da organização
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.92, fontWeight: 500, display: "block", mt: 0.35 }}>
                  Contato, CNPJ e endereço
                </Typography>
              </Box>
            </Button>
          </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
      <PageHeroHeader
        iconSlot={logoSlot}
        title={programaName}
        description={
          hasSubtitle || !isDemoMode ? (
            <>
              {hasSubtitle && (
                <Stack spacing={0.35} sx={{ mb: !isDemoMode ? 1 : 0 }}>
                  {isOrgaoPublico ? (
                    <>
                      {orgaoNome && (
                        <Typography variant="body1" sx={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.01em" }}>
                          {orgaoNome}
                        </Typography>
                      )}
                      {!orgaoNome && programa.sigla && (
                        <Typography variant="body1" sx={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.01em" }}>
                          {programa.sigla}
                        </Typography>
                      )}
                      {!orgaoNome && programa.unidade && (
                        <Typography variant="body1" sx={{ fontSize: "0.9375rem", letterSpacing: "0.01em" }}>
                          {programa.unidade}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <>
                      {programa.nome_fantasia && (
                        <Typography variant="body1" sx={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.01em" }}>
                          {programa.nome_fantasia}
                        </Typography>
                      )}
                      {programa.razao_social && (
                        <Typography variant="body1" sx={{ fontSize: "0.9375rem", letterSpacing: "0.01em" }}>
                          {programa.razao_social}
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              )}
              {!isDemoMode && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <LastUpdateInfo
                    updatedAt={programa.updated_at ?? lastActivity?.created_at}
                    userName={lastActivity?.user_name}
                    compact
                  />
                  <Link
                    component={NextLink}
                    href={`/programas/${idOrSlug}/auditoria`}
                    variant="caption"
                    underline="hover"
                    color="primary"
                  >
                    Histórico completo
                  </Link>
                </Box>
              )}
            </>
          ) : undefined
        }
        trailing={dadosButtons}
      />

      <Popover
        open={Boolean(dadosProgramaPopoverAnchor)}
        anchorEl={dadosProgramaPopoverAnchor}
        onClose={() => setDadosProgramaPopoverAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              maxWidth: 560,
              width: "min(92vw, 560px)",
              maxHeight: "min(75vh, 720px)",
              overflow: "auto",
              p: 2,
            },
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <DashboardIcon color="primary" fontSize="small" />
          Dados do programa
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderEditableField(programaEscopoField, programa.descricao_escopo ?? "", canEditProgramaFieldsUi)}
          </Grid>
        </Grid>
      </Popover>

      <Popover
        open={Boolean(dadosOrgPopoverAnchor)}
        anchorEl={dadosOrgPopoverAnchor}
        onClose={() => setDadosOrgPopoverAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              maxWidth: 640,
              width: "min(94vw, 640px)",
              maxHeight: "min(80vh, 900px)",
              overflow: "auto",
              p: 2,
            },
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <BusinessIcon color="primary" fontSize="small" />
            Dados da organização
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isOrgaoPublico
              ? "Nome do programa e canais de atendimento usados em políticas, PDFs e no portal. Escolha o órgão no cadastro e informe o endereço abaixo, se necessário."
              : "Nome, CNPJ, razão social e canais de atendimento usados em políticas, PDFs e no portal de privacidade."}
            {!canEditProgramaFieldsUi && (
              <Box component="span" sx={{ display: "block", mt: 1, fontWeight: 600 }}>
                Você não tem permissão para editar estes campos.
              </Box>
            )}
          </Typography>

          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Typography
                variant="body2"
                fontWeight={!isOrgaoPublico ? 600 : 400}
                color={!isOrgaoPublico ? "primary" : "text.secondary"}
              >
                Setor privado
              </Typography>
              <Switch
                checked={isOrgaoPublico}
                onChange={(_, checked) => void handleSetorPublicoToggle(checked)}
                disabled={!canEditProgramaFieldsUi || setorSaving}
                color="primary"
                inputProps={{ "aria-label": "Alternar entre setor privado e órgão público" }}
              />
              <Typography
                variant="body2"
                fontWeight={isOrgaoPublico ? 600 : 400}
                color={isOrgaoPublico ? "primary" : "text.secondary"}
              >
                Órgão público
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={2}>
            {organizationFieldsEmpresa
              .filter(
                (field) =>
                  !isOrgaoPublico || !CAMPOS_EMPRESA_OCULTOS_SE_ORGAO_PUBLICO.has(field.key)
              )
              .map((field) => (
                <Grid item xs={12} md={field.fullRow ? 12 : 6} key={field.key}>
                  {renderEditableField(field, programa[field.key] ?? "", canEditProgramaFieldsUi)}
                </Grid>
              ))}
            {isOrgaoPublico && (
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  size="small"
                  disabled={!canEditProgramaFieldsUi || orgaosCatalogoLoading || orgaoSaving}
                >
                  <InputLabel id="programa-orgao-select-label">Órgão</InputLabel>
                  <Select
                    labelId="programa-orgao-select-label"
                    label="Órgão"
                    value={programa.orgao ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      void handleOrgaoCatalogoChange(v === "" ? null : Number(v));
                    }}
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {orgaosCatalogo.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.nome || `Órgão #${o.id}`}
                        {o.sigla ? ` (${o.sigla})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {isOrgaoPublico &&
              organizationFieldsOrgaoPublico.map((field) => (
                <Grid item xs={12} md={6} key={field.key}>
                  {renderEditableField(field, programa[field.key] ?? "", canEditProgramaFieldsUi)}
                </Grid>
              ))}
          </Grid>

          {isOrgaoPublico && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                Uso da SGD
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Rastreio do envio do diagnóstico ao SGD/ME (órgãos públicos). Opcional.
              </Typography>
              <Grid container spacing={2}>
                {sgdUsoFields.map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    {renderEditableField(field, programa[field.key] ?? null, canEditProgramaFieldsUi)}
                  </Grid>
                ))}
              </Grid>
              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mt: 3, mb: 1 }}>
                Dados do retorno do diagnóstico para SGD
              </Typography>
              <Grid container spacing={2}>
                {sgdRetornoFields.map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    {renderEditableField(field, programa[field.key] ?? null, canEditProgramaFieldsUi)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </LocalizationProvider>
      </Popover>

      {/* Modo Demo Alert */}
      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Modo Demonstração:</strong> Dados de exemplo.
          </Typography>
        </Alert>
      )}

      {/* Grid principal — módulos com mais largura útil; diagrama à direita */}
      <Grid container spacing={{ xs: 3, lg: 3 }} alignItems="stretch">
        {/* Seções principais: 8/12 em desktop para caber 3 cards em xl */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2.5}>
            {sections.map((section) => {
              const highlightRespCard = diagramHover && section.key === "responsabilidades";
              return (
                <Grid item xs={12} sm={6} xl={4} key={section.key}>
                  <Box sx={{ position: "relative" }}>
                    {section.key === "portal-privacidade" &&
                      modulosResumo?.publicPortalPath && (
                        <Tooltip title="Abrir portal público (nova aba)" placement="left">
                          <Box
                            component="span"
                            sx={{
                              position: "absolute",
                              top: -10,
                              /* À esquerda da faixa do flip + margem — não sobrepõe o ícone Reply */
                              right: MODULO_FLIP_STRIP_WIDTH_PX + 8,
                              zIndex: 2,
                              lineHeight: 0,
                            }}
                          >
                            <IconButton
                              component={NextLink}
                              href={modulosResumo.publicPortalPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              aria-label="Abrir portal público em nova aba"
                              sx={{
                                width: 36,
                                minHeight: 52,
                                px: 0.5,
                                py: 0.75,
                                flexDirection: "column",
                                borderRadius: "4px 4px 10px 10px",
                                border: `1px solid ${alpha(section.color, 0.42)}`,
                                borderTop: `4px solid ${section.color}`,
                                bgcolor: alpha(section.color, 0.12),
                                color: section.color,
                                boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
                                "&:hover": {
                                  bgcolor: alpha(section.color, 0.22),
                                  borderColor: alpha(section.color, 0.65),
                                  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                                },
                              }}
                            >
                              <PublicIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                          </Box>
                        </Tooltip>
                      )}
                    <ModuloSistemaFlipCard
                      section={section}
                      idOrSlug={idOrSlug}
                      highlight={highlightRespCard}
                      resumo={modulosResumo}
                      resumoLoading={modulosResumoLoading}
                      resumoError={modulosResumoError}
                      prefersReducedMotion={prefersReducedMotion}
                      canHover={canHover}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Estrutura de Tratamento (diagrama) — sem botão Gerenciar; edição indicada pelo destaque no card Estrutura de Governança ao passar o mouse */}
        <Grid item xs={12} lg={4}>
          <Box
            onMouseEnter={() => setDiagramHover(true)}
            onMouseLeave={() => setDiagramHover(false)}
            sx={{ height: "100%", minHeight: { xs: 400, lg: 480 } }}
          >
            <PapelLgpdDiagramWithEdit
              programaId={programa.id}
              idOrSlug={idOrSlug}
              isDemoMode={isDemoMode}
              showManageButton={false}
            />
          </Box>
        </Grid>
      </Grid>

    </Container>
  );
} 