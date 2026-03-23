"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
  Tooltip,
  IconButton
} from "@mui/material";
import {
  Policy as PolicyIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ArrowBack as ArrowBackIcon,
  Backup as BackupIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  Group as GroupIcon,
  BugReport as BugReportIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  PrivacyTip as PrivacyTipIcon,
  Cloud as CloudIcon,
  Assignment as AssignmentIcon
} from "@mui/icons-material";
import * as dataService from "../../../../lib/services/dataService";
import { useProgramaIdFromParam } from "../../../../hooks/useProgramaIdFromParam";
import { loadPoliticaSectionsForPdf } from "../../../../lib/utils/loadPoliticaSectionsForPdf";

interface PoliticaInfo {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  cor: string;
}

const POLITICAS_DISPONIVEIS: PoliticaInfo[] = [
  {
    id: "politica_protecao_dados_pessoais",
    nome: "Política de Proteção de Dados Pessoais",
    descricao: "Diretrizes para proteção de dados pessoais conforme LGPD",
    icon: <PrivacyTipIcon />,
    cor: "#2196F3"
  },
  {
    id: "politica_backup",
    nome: "Política de Backup",
    descricao: "Procedimentos para backup e recuperação de dados",
    icon: <BackupIcon />,
    cor: "#4CAF50"
  },
  {
    id: "politica_controle_acesso",
    nome: "Política de Controle de Acesso", 
    descricao: "Gestão de credenciais e privilégios de acesso",
    icon: <LockIcon />,
    cor: "#FF9800"
  },
  {
    id: "politica_defesas_malware",
    nome: "Política de Defesas contra Malware",
    descricao: "Proteção contra softwares maliciosos",
    icon: <ShieldIcon />,
    cor: "#F44336"
  },
  {
    id: "politica_desenvolvimento_pessoas",
    nome: "Política de Desenvolvimento de Pessoas",
    descricao: "Treinamento e conscientização em segurança",
    icon: <GroupIcon />,
    cor: "#9C27B0"
  },
  {
    id: "politica_gerenciamento_vulnerabilidades",
    nome: "Política de Gerenciamento de Vulnerabilidades",
    descricao: "Identificação e correção de vulnerabilidades",
    icon: <BugReportIcon />,
    cor: "#E91E63"
  },
  {
    id: "politica_gestao_ativos",
    nome: "Política de Gestão de Ativos",
    descricao: "Inventário e gestão de ativos de TI",
    icon: <InventoryIcon />,
    cor: "#607D8B"
  },
  {
    id: "politica_logs_auditoria",
    nome: "Política de Logs e Auditoria",
    descricao: "Registros de eventos e trilhas de auditoria",
    icon: <HistoryIcon />,
    cor: "#795548"
  },
  {
    id: "politica_provedor_servicos",
    nome: "Política de Provedor de Serviços",
    descricao: "Gestão de fornecedores e prestadores de serviços",
    icon: <CloudIcon />,
    cor: "#00BCD4"
  },
  {
    id: "politica_seguranca_informacao",
    nome: "Política de Segurança da Informação",
    descricao: "Diretrizes gerais de segurança da informação",
    icon: <AssignmentIcon />,
    cor: "#3F51B5"
  }
];

export default function ProgramaPoliticasPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading, error: idError } = useProgramaIdFromParam(idOrSlug);
  const [programa, setPrograma] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  /** Metadados por tipo quando já existe registro em politica_programa */
  const [politicasResumo, setPoliticasResumo] = useState<Map<string, dataService.PoliticaProgramaResumo> | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (programaId == null) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [programaData, resumoRows] = await Promise.all([
          dataService.fetchProgramaById(programaId),
          dataService.fetchPoliticaProgramaResumo(programaId),
        ]);
        if (cancelled) return;
        setPrograma(programaData);
        const m = new Map<string, dataService.PoliticaProgramaResumo>();
        resumoRows.forEach((r) => m.set(r.tipo_politica, r));
        setPoliticasResumo(m);
      } catch (error) {
        console.error("Erro ao carregar programa:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const handlePoliticaClick = (politica: PoliticaInfo) => {
    router.push(`/programas/${idOrSlug}/politicas/${politica.id}`);
  };

  const handleVoltar = () => {
    router.push(`/programas/${idOrSlug}`);
  };

  const formatDataPt = (iso: string | null | undefined) => {
    if (!iso) return "";
    try {
      const d = /^\d{4}-\d{2}-\d{2}$/.test(String(iso).trim())
        ? new Date(String(iso).trim() + "T12:00:00")
        : new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handlePdfEtiqueta = async (e: React.MouseEvent, politica: PoliticaInfo) => {
    e.preventDefault();
    e.stopPropagation();
    if (programaId == null || !programa) return;
    setPdfError(null);
    setPdfLoadingId(politica.id);
    try {
      const sections = await loadPoliticaSectionsForPdf(
        programaId,
        politica.id,
        politica.nome,
        programa as Record<string, unknown>
      );
      const nomeFantasia =
        (typeof programa.nome === "string" && programa.nome) ||
        (typeof programa.nome_fantasia === "string" && programa.nome_fantasia) ||
        "";
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections,
          politicaNome: politica.nome,
          nomeFantasia,
          programa: programa as Record<string, unknown>,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao gerar PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${politica.nome} - ${nomeFantasia || "programa"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setPdfError(err instanceof Error ? err.message : "Erro ao gerar PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  if (idLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ width: 200, height: 32, bgcolor: 'grey.200', borderRadius: 1 }} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Box sx={{ width: '100%', height: 200, bgcolor: 'grey.200', borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!programaId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Programa não encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header com Breadcrumbs */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleVoltar}
                sx={{ minWidth: 'auto' }}
              >
                Voltar
              </Button>
              
              <Breadcrumbs separator="›">
                <Link
                  color="inherit"
                  href="/dashboard"
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  Programas
                </Link>
                <Link
                  color="inherit"
                  href={`/programas/${idOrSlug}`}
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  {programa?.nome || 'Programa'}
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PolicyIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  Políticas
                </Typography>
              </Breadcrumbs>
            </Box>

            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Políticas
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Gerencie e edite as políticas institucionais do programa{' '}
                <strong>{programa?.nome || programa?.nome_fantasia}</strong>
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {pdfError && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {pdfError}
          </Typography>
        )}

        {/* Grid de Políticas */}
        <Grid container spacing={3}>
          {POLITICAS_DISPONIVEIS.map((politica) => {
            const row = politicasResumo?.get(politica.id);
            const implementada = !!row;
            const dataImpl = row?.updated_at ? formatDataPt(row.updated_at) : null;
            const vig = row?.inicio_vigencia ? formatDataPt(row.inicio_vigencia) : null;
            const prazo = row?.prazo_revisao ? formatDataPt(row.prazo_revisao) : null;
            const revisaoAtrasada = (() => {
              const s = row?.prazo_revisao ? String(row.prazo_revisao).slice(0, 10) : "";
              if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
              const [yy, mm, dd] = s.split("-").map(Number);
              const prazoD = new Date(yy, mm - 1, dd);
              const t = new Date();
              const hoje = new Date(t.getFullYear(), t.getMonth(), t.getDate());
              return prazoD < hoje;
            })();

            return (
              <Grid item xs={12} md={6} lg={4} key={politica.id}>
                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    overflow: "visible",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    borderRadius: 2,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      "& .politica-card-surface": {
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                >
                  <Card
                    className="politica-card-surface"
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir editor: ${politica.nome}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePoliticaClick(politica);
                      }
                    }}
                    sx={{
                      minWidth: 0,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "box-shadow 0.3s ease",
                      cursor: "pointer",
                      outlineOffset: 2,
                      overflow: "visible",
                      "&:focus-visible": {
                        outline: `2px solid ${politica.cor}`,
                      },
                      border: `2px solid ${alpha(politica.cor, 0.1)}`,
                      borderRadius: 2,
                    }}
                    onClick={() => handlePoliticaClick(politica)}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3, pr: { xs: 3, sm: 4 } }}>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2,
                              bgcolor: alpha(politica.cor, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: politica.cor,
                              flexShrink: 0,
                            }}
                          >
                            {politica.icon}
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                              {politica.nome}
                            </Typography>
                            {implementada && (
                              <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                {dataImpl ? (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Última gravação: <strong>{dataImpl}</strong>
                                  </Typography>
                                ) : null}
                                {vig ? (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Início da vigência: <strong>{vig}</strong>
                                  </Typography>
                                ) : null}
                                {prazo ? (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    color={revisaoAtrasada ? "error" : "text.secondary"}
                                  >
                                    Prazo de revisão: <strong>{prazo}</strong>
                                    {revisaoAtrasada ? " (atrasado)" : ""}
                                  </Typography>
                                ) : null}
                              </Stack>
                            )}
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {politica.descricao}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Marcador de PDF (tipo fita de caderno), colado ao canto superior direito */}
                  <Tooltip title="Baixar PDF (sem abrir o editor)" placement="left">
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: 10,
                        zIndex: 2,
                        lineHeight: 0,
                      }}
                    >
                      <IconButton
                        type="button"
                        size="small"
                        aria-label={`Exportar PDF: ${politica.nome}`}
                        disabled={pdfLoadingId === politica.id}
                        onClick={(e) => handlePdfEtiqueta(e, politica)}
                        sx={{
                          width: 36,
                          minHeight: 52,
                          px: 0.5,
                          py: 0.75,
                          flexDirection: "column",
                          borderRadius: "4px 4px 10px 10px",
                          border: `1px solid ${alpha(politica.cor, 0.42)}`,
                          borderTop: `4px solid ${politica.cor}`,
                          bgcolor: alpha(politica.cor, 0.12),
                          color: politica.cor,
                          boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
                          "&:hover": {
                            bgcolor: alpha(politica.cor, 0.22),
                            borderColor: alpha(politica.cor, 0.65),
                            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                          },
                          "&.Mui-disabled": {
                            borderColor: alpha(politica.cor, 0.2),
                          },
                        }}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 22 }} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Informações Adicionais */}
        <Paper
          elevation={1}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography variant="h6" color="primary" gutterBottom>
            💡 Sobre as Políticas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            As políticas institucionais são documentos fundamentais que estabelecem diretrizes, 
            procedimentos e controles para proteger os ativos de informação da organização.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            <strong>Última gravação</strong> é a data do último salvamento no conteúdo. <strong>Início da vigência</strong> e{" "}
            <strong>prazo de revisão</strong> são editados no editor de cada política (metadados por documento).
          </Typography>
          <Typography variant="body2" color="text.secondary">
            O <strong>marcador PDF</strong> no canto do card baixa o documento sem abrir o editor. No editor, use{" "}
            <strong>Salvar no programa</strong> para registrar conteúdo e datas.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
} 