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
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  Stack
} from "@mui/material";
import {
  Security as SecurityIcon,
  Policy as PolicyIcon,
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
import { fetchProgramaById } from "../../../../lib/services/dataService";

interface PoliticaInfo {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  cor: string;
  implementada?: boolean;
}

const POLITICAS_DISPONIVEIS: PoliticaInfo[] = [
  {
    id: "politica_protecao_dados_pessoais",
    nome: "Política de Proteção de Dados Pessoais",
    descricao: "Diretrizes para proteção de dados pessoais conforme LGPD",
    icon: <PrivacyTipIcon />,
    cor: "#2196F3",
    implementada: true
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const programaId = params.id;
  const [programa, setPrograma] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrograma = async () => {
      try {
        const data = await fetchProgramaById(Number(programaId));
        setPrograma(data);
      } catch (error) {
        console.error("Erro ao carregar programa:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPrograma();
  }, [programaId]);

  const handlePoliticaClick = (politica: PoliticaInfo) => {
    router.push(`/programas/${programaId}/politicas/${politica.id}`);
  };

  const handleVoltar = () => {
    router.push(`/programas/${programaId}`);
  };

  if (loading) {
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
                  href="/programas"
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  Programas
                </Link>
                <Link
                  color="inherit"
                  href={`/programas/${programaId}`}
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  {programa?.nome || 'Programa'}
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PolicyIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  Políticas de Segurança
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
                Políticas de Segurança
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Gerencie e edite as políticas de segurança do programa{' '}
                <strong>{programa?.nome_fantasia || programa?.nome}</strong>
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Grid de Políticas */}
        <Grid container spacing={3}>
          {POLITICAS_DISPONIVEIS.map((politica) => (
            <Grid item xs={12} md={6} lg={4} key={politica.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  border: `2px solid ${alpha(politica.cor, 0.1)}`,
                  borderRadius: 2,
                }}
                onClick={() => handlePoliticaClick(politica)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Stack spacing={2}>
                    {/* Header do Card */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          bgcolor: alpha(politica.cor, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                        {politica.implementada && (
                          <Chip
                            label="Implementada"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Descrição */}
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {politica.descricao}
                    </Typography>

                    {/* Call to Action */}
                    <Box sx={{ pt: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: politica.cor,
                          '&:hover': {
                            bgcolor: alpha(politica.cor, 0.8),
                          },
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                        startIcon={<SecurityIcon />}
                      >
                        {politica.implementada ? 'Editar Política' : 'Criar Política'}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
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
            💡 Sobre as Políticas de Segurança
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            As políticas de segurança são documentos fundamentais que estabelecem diretrizes, 
            procedimentos e controles para proteger os ativos de informação da organização.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cada política pode ser personalizada com informações específicas da sua organização 
            e exportada em formato PDF para aprovação e distribuição.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
} 