"use client";

import React from "react";
import { Card, CardContent, CardActionArea, Box, Grid, Typography, alpha } from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Map as MapIcon,
  ReportProblem as ReportProblemIcon,
  ContactMail as ContactMailIcon,
} from "@mui/icons-material";

export type HubCardDef = {
  key: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  description: string;
  path: string;
  color: string;
  gradient: string;
};

/** Mapeamento de dados, ROPA, RIPD, incidentes */
export const TRATAMENTO_SECTIONS: HubCardDef[] = [
  {
    key: "mapeamento",
    title: "Mapeamento de dados",
    subtitle: "Levantamento pré-ROPA",
    icon: <MapIcon fontSize="large" />,
    description:
      "Cadastro de levantamentos (sistemas, bases ou fontes) que fundamentam as operações no ROPA. Cada operação pode referenciar um item de mapeamento.",
    path: "mapeamento",
    color: "#00897b",
    gradient: "linear-gradient(135deg, #00897b 0%, #26a69a 100%)",
  },
  {
    key: "ropa",
    title: "ROPA",
    subtitle: "Registro das Operações de Tratamento",
    icon: <StorageIcon fontSize="large" />,
    description:
      "Cadastro de operações de tratamento (art. 37 LGPD): finalidade, base legal, categorias de dados, compartilhamento, retenção e medidas de segurança.",
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

/** Pedidos, reportes e contato — portal público */
export const PORTAL_SECTIONS: HubCardDef[] = [
  {
    key: "pedidos-titulares",
    title: "Pedidos dos titulares",
    icon: <AssignmentIcon fontSize="large" />,
    subtitle: "Direitos do titular (art. 18 LGPD)",
    description:
      "Registro de pedidos de acesso, correção, exclusão, portabilidade, oposição e revogação de consentimento; fluxo e prazos.",
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

export function ConformidadeHubCard({
  section,
  idOrSlug,
  router,
}: {
  section: HubCardDef;
  idOrSlug: string;
  router: { push: (href: string) => void };
}) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          height: "100%",
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
              <Box
                sx={{
                  color: section.color,
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(section.color, 0.1),
                  flexShrink: 0,
                }}
              >
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
    </Grid>
  );
}
