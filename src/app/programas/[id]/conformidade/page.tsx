"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Breadcrumbs,
  Link,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  ReportProblem as ReportProblemIcon,
  ContactMail as ContactMailIcon,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";

// Titulares e canais com o público (pedidos, reportes, contato)
const titularesSections = [
  {
    key: "pedidos-titulares",
    title: "Pedidos dos titulares",
    icon: <AssignmentIcon fontSize="large" />,
    subtitle: "Direitos do titular (art. 18 LGPD)",
    description: "Registro de pedidos de acesso, correção, exclusão, portabilidade, oposição e revogação de consentimento; fluxo e prazos.",
    path: "pedidos-titulares",
    color: "#2e7d32",
    gradient: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
  },
  {
    key: "reportes",
    title: "Reportes do portal",
    icon: <ReportProblemIcon fontSize="large" />,
    subtitle: "Reportes enviados pelo público",
    description: "Vulnerabilidades e incidentes reportados por usuários no formulário do portal público.",
    path: "reportes",
    color: "#ed6c02",
    gradient: "linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)",
  },
  {
    key: "contato",
    title: "Contato do portal",
    icon: <ContactMailIcon fontSize="large" />,
    subtitle: "Mensagens do formulário de contato",
    description: "Mensagens enviadas pelo formulário de contato no portal público.",
    path: "contato",
    color: "#0288d1",
    gradient: "linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)",
  },
];

// Registro e conformidade (ROPA, RIPD, Incidentes)
const registroSections = [
  {
    key: "ropa",
    title: "ROPA",
    subtitle: "Registro das Operações de Tratamento",
    icon: <StorageIcon fontSize="large" />,
    description: "Cadastro de operações de tratamento (art. 37 LGPD): finalidade, base legal, categorias de dados, compartilhamento, retenção e medidas de segurança.",
    path: "ropa",
    color: "#1976d2",
    gradient: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
  },
  {
    key: "ripd",
    title: "RIPD / AIPD",
    icon: <DescriptionIcon fontSize="large" />,
    subtitle: "Relatório de Impacto à Proteção de Dados",
    description: "Relatório de impacto para tratamentos de alto risco; vinculação com ROPA e plano de trabalho.",
    path: "ripd",
    color: "#ed6c02",
    gradient: "linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)",
  },
  {
    key: "incidentes",
    title: "Incidentes",
    icon: <WarningIcon fontSize="large" />,
    subtitle: "Gestão de incidentes de segurança",
    description: "Registro de incidentes que afetam dados pessoais; comunicação ANPD e titulares; prazos e checklist.",
    path: "incidentes",
    color: "#d32f2f",
    gradient: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
  },
];

export default function ConformidadeHubPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const idOrSlug = params.id as string;
  const [programa, setPrograma] = React.useState<{ nome?: string; nome_fantasia?: string; razao_social?: string } | null>(null);

  React.useEffect(() => {
    dataService.fetchProgramaByIdOrSlug(idOrSlug).then(setPrograma).catch(() => setPrograma(null));
  }, [idOrSlug]);

  const programaName = programa?.nome || programa?.nome_fantasia || programa?.razao_social || `Programa`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            href="/programas"
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              router.push("/programas");
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
          <Typography color="text.primary">Conformidade LGPD</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)`,
            }}
          >
            <GavelIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Conformidade LGPD
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ROPA, direitos dos titulares, RIPD e incidentes
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna 1: Titulares e canais com o público */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
            Titulares e canais com o público
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 480 }}>
            {titularesSections.map((section) => (
              <Box key={section.key} sx={{ flex: 1, minHeight: 0, display: "flex" }}>
                <Card
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0 12px 24px ${alpha(section.color, 0.25)}`,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: section.gradient,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => router.push(`/programas/${idOrSlug}/conformidade/${section.path}`)}
                    sx={{ flex: 1, p: 2, height: "100%", alignItems: "flex-start", display: "block" }}
                  >
                    <CardContent sx={{ width: "100%", height: "100%", "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, height: "100%" }}>
                        <Box sx={{ color: section.color, p: 1, borderRadius: 2, bgcolor: alpha(section.color, 0.1), flexShrink: 0 }}>
                          {section.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {section.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {section.subtitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Coluna 2: Registro e conformidade */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
            Registro e conformidade
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 480 }}>
            {registroSections.map((section) => (
              <Box key={section.key} sx={{ flex: 1, minHeight: 0, display: "flex" }}>
                <Card
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0 12px 24px ${alpha(section.color, 0.25)}`,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: section.gradient,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => router.push(`/programas/${idOrSlug}/conformidade/${section.path}`)}
                    sx={{ flex: 1, p: 2, height: "100%", alignItems: "flex-start", display: "block" }}
                  >
                    <CardContent sx={{ width: "100%", height: "100%", "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, height: "100%" }}>
                        <Box sx={{ color: section.color, p: 1, borderRadius: 2, bgcolor: alpha(section.color, 0.1), flexShrink: 0 }}>
                          {section.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {section.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {section.subtitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
