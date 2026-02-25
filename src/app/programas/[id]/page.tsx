"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
  Divider,
  Paper,
  CardActionArea,
  TextField,
  IconButton,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  Business,
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
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Gavel as GavelIcon
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import { shouldUseDemoData } from "@/lib/services/demoDataService";
import { useUserPermissions } from "@/hooks/useUserPermissions";

const sections = [
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
    key: "conformidade",
    title: "Conformidade LGPD",
    icon: <GavelIcon fontSize="large" />,
    description: "ROPA, direitos dos titulares, RIPD e incidentes",
    path: "conformidade",
    color: "#1976d2",
    gradient: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
  },
  {
    key: "politicas",
    title: "Políticas de Segurança",
    icon: <Policy fontSize="large" />,
    description: "Crie e gerencie políticas de segurança da informação",
    path: "politicas",
    color: "#9c27b0",
    gradient: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)"
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
    key: "responsabilidades",
    title: "Responsabilidades",
    icon: <Group fontSize="large" />,
    description: "Defina responsáveis e suas atribuições",
    path: "responsabilidades",
    color: "#607d8b",
    gradient: "linear-gradient(135deg, #607d8b 0%, #78909c 100%)"
  }
];

const basicInfoFields = [
  { key: "razao_social", label: "Razão Social", icon: <Business /> },
  { key: "nome_fantasia", label: "Nome Fantasia", icon: <Business /> },
  { key: "cnpj", label: "CNPJ", icon: <Business /> }
];

const contactFields = [
  { key: "atendimento_fone", label: "Telefone", icon: <PhoneIcon /> },
  { key: "atendimento_email", label: "Email", icon: <EmailIcon /> },
  { key: "atendimento_site", label: "Site", icon: <WebsiteIcon /> }
];

const policyFields = [
  { key: "politica_inicio_vigencia", label: "Início da Vigência", icon: <CalendarIcon /> },
  { key: "politica_prazo_revisao", label: "Prazo de Revisão", icon: <CalendarIcon /> }
];

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const programaId = programa?.id;
  const isDemoMode = shouldUseDemoData(programaId);
  const { programaUser, isLoading: permissionsLoading } = useUserPermissions(
    isDemoMode ? undefined : programaId
  );

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

  const handleEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value || "");
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = async (field: string) => {
    const isPolicyDate = policyFields.some((f) => f.key === field);
    if (!programaId) {
      handleCancel();
      return;
    }
    if (!isPolicyDate && !editValue.trim()) {
      handleCancel();
      return;
    }
    setLoading(true);
    try {
      const valueToSave = isPolicyDate ? editValue || null : editValue;
      await dataService.updateProgramaField(programaId, field, valueToSave);
      setPrograma((prev: any) => ({ ...prev, [field]: valueToSave }));
      setEditField(null);
      setEditValue("");
    } catch (error) {
      console.error("Erro ao salvar campo:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderEditableField = (field: any, value: string) => {
    const isEditing = editField === field.key;
    
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
          {isEditing ? (
            <TextField
              size="small"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              sx={{ mt: 0.5, width: '100%' }}
              disabled={loading}
              autoFocus
            />
          ) : (
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {value || (
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
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(field.key, value)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    );
  };

  if (loading && !programa) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!programa) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">
          Programa não encontrado.
        </Alert>
      </Container>
    );
  }

  // Usuário não está atribuído ao programa (e não é modo demo)
  if (!isDemoMode && !permissionsLoading && !programaUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Você não tem acesso a este programa.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/programas")}>
          Voltar aos programas
        </Button>
      </Container>
    );
  }

  const programaName = programa.nome || programa.nome_fantasia || programa.razao_social || `Programa #${programa.id}`;
  const hasSubtitle = programa.nome_fantasia || programa.razao_social;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header com breadcrumb e título */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            href="/programas" 
            underline="hover" 
            color="inherit" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
            Programas
          </Link>
          <Typography color="text.primary">{programaName}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
              }}
            >
              <SecurityIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {programaName}
              </Typography>
              {hasSubtitle && (
                <Stack spacing={0.35} sx={{ mt: 1 }}>
                  {programa.nome_fantasia && (
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                      {programa.nome_fantasia}
                    </Typography>
                  )}
                  {programa.razao_social && (
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9375rem', letterSpacing: '0.01em' }}>
                      {programa.razao_social}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
          
          {isDemoMode && (
            <Chip 
              label="DEMONSTRAÇÃO" 
              color="warning" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
      </Box>

      {/* Modo Demo Alert */}
      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Modo Demonstração:</strong> Este é um ambiente de demonstração com dados sintéticos. 
            As alterações são simuladas e não persistem.
          </Typography>
        </Alert>
      )}

      {/* Política de Segurança — uma linha, antes dos módulos */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Paper
          elevation={1}
          sx={{
            py: 1.5,
            px: 2,
            mb: 4,
            borderRadius: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Policy sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Política de Segurança
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
          {policyFields.map(field => {
            const isEditing = editField === field.key;
            const value = programa[field.key];
            const isPrazoRevisao = field.key === "politica_prazo_revisao";
            const dateValue = value ? new Date(value) : null;
            const isAtrasado =
              isPrazoRevisao &&
              dateValue &&
              !isNaN(dateValue.getTime()) &&
              dateValue < new Date();
            const isEmpty = !value;
            const alertColor = isAtrasado
              ? theme.palette.error.main
              : isEmpty
                ? theme.palette.warning.main
                : undefined;
            return (
              <Box
                key={field.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: { xs: "1 1 100%", sm: "0 0 auto" },
                  minWidth: 0,
                  ...(alertColor && {
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: alpha(alertColor, 0.08),
                    border: `1px solid ${alpha(alertColor, 0.3)}`,
                  }),
                }}
              >
                <Box sx={{ color: alertColor || theme.palette.text.secondary, display: "flex" }}>{field.icon}</Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  {field.label}:
                </Typography>
                {isEditing ? (
                  <DatePicker
                    value={editValue ? dayjs(editValue) : null}
                    onChange={(date) => setEditValue(date ? date.format("YYYY-MM-DD") : "")}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { width: 160 },
                        disabled: loading,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ minWidth: 80, color: alertColor || "text.primary" }}>
                    {value ? (
                      dateValue && !isNaN(dateValue.getTime())
                        ? dateValue.toLocaleDateString("pt-BR")
                        : String(value)
                    ) : (
                      <span style={{ fontStyle: "italic" }}>—</span>
                    )}
                    {isAtrasado && (
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: "error.main" }}>
                        (atrasado)
                      </Typography>
                    )}
                    {isEmpty && !isAtrasado && (
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: "warning.main" }}>
                        (não definido)
                      </Typography>
                    )}
                  </Typography>
                )}
                {isEditing ? (
                  <>
                    <IconButton color="success" onClick={() => handleSave(field.key)} disabled={loading} size="small">
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={handleCancel} disabled={loading} size="small">
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <IconButton color="primary" onClick={() => handleEdit(field.key, value)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Paper>
      </LocalizationProvider>

      {/* Grid principal */}
      <Grid container spacing={4}>
        {/* Seções principais */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Módulos do Sistema
          </Typography>
          
          <Grid container spacing={3}>
            {sections.map((section, index) => (
              <Grid item xs={12} sm={6} key={section.key}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha(section.color, 0.3)}`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: section.gradient,
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => router.push(`/programas/${idOrSlug}/${section.path}`)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "flex-start", 
                      py: 3,
                      px: 3,
                      height: '100%',
                      minHeight: 160,
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          mb: 2,
                          color: section.color
                        }}>
                          {section.icon}
                          <Typography variant="h6" fontWeight="bold">
                            {section.title}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ lineHeight: 1.6 }}
                        >
                          {section.description}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: section.color,
                        fontWeight: 'bold',
                        mt: 2
                      }}>
                        <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                          Acessar
                        </Typography>
                        <Box sx={{ ml: 1, transform: 'translateX(0)', transition: 'transform 0.2s' }}>
                          →
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Informações do programa */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Informações básicas */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Informações Básicas
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setSettingsOpen(true)}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <SettingsIcon />
                </IconButton>
              </Box>
              <Stack spacing={2}>
                {basicInfoFields.map(field => (
                  <Box key={field.key}>
                    {renderEditableField(field, programa[field.key])}
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Informações de contato */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Informações de Contato
              </Typography>
              <Stack spacing={2}>
                {contactFields.map(field => (
                  <Box key={field.key}>
                    {renderEditableField(field, programa[field.key])}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog de configurações */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurações do Programa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configurações avançadas e opções administrativas.
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Status do Programa</InputLabel>
              <Select
                value={programa.status || 'ativo'}
                label="Status do Programa"
                disabled
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
                <MenuItem value="suspenso">Suspenso</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 