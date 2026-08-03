"use client";

import React from "react";
import { Card, CardContent, CardActionArea, Box, Grid, Typography, Chip, Stack, alpha, useTheme } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { escopoGreyedSx, ESCOPO_CHIP_LABEL } from "@/lib/programa/escopoVisual";
import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Map as MapIcon,
  ReportProblem as ReportProblemIcon,
  ContactMail as ContactMailIcon,
  WarningAmber as WarningAmberIcon,
  AutoAwesome as AutoAwesomeIcon,
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
  /** Se definido, abre módulo do programa (`/programas/:id/:programaModule`) em vez de conformidade. */
  programaModule?: string;
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
  {
    key: "riscos",
    title: "Gestão de riscos",
    icon: <WarningAmberIcon fontSize="large" />,
    subtitle: "Priorização e mapa de calor P×I",
    description:
      "Registre riscos, posicione no mapa probabilidade × impacto e acompanhe tratamento e mitigação.",
    path: "riscos",
    programaModule: "riscos",
    color: "#c62828",
    gradient: "linear-gradient(135deg, #b71c1c 0%, #e53935 100%)",
  },
];

/** Governança de IA — inventário e ciclo de vida */
export const AIGP_SECTIONS: HubCardDef[] = [
  {
    key: "inventario-ia",
    title: "Inventário de IA",
    subtitle: "Sistemas e usos de IA (AIGP 27)",
    icon: <AutoAwesomeIcon fontSize="large" />,
    description:
      "Cadastro central de sistemas de IA: finalidade, dono de negócio, responsável técnico, risco e status de ciclo de vida.",
    path: "inventario-ia",
    color: "#0A2744",
    gradient: "linear-gradient(135deg, #0A2744 0%, #1565c0 100%)",
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
  dense = false,
  outOfScope = false,
  onEnable,
}: {
  section: HubCardDef;
  idOrSlug: string;
  router: { push: (href: string) => void };
  dense?: boolean;
  outOfScope?: boolean;
  onEnable?: () => void;
}) {
  const theme = useTheme();
  const href = section.programaModule
    ? `/programas/${idOrSlug}/${section.programaModule}`
    : `/programas/${idOrSlug}/conformidade/${section.path}`;

  return (
    <Grid item xs={12} sm={6}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
          ...(outOfScope ? escopoGreyedSx(theme) : {}),
          ...(!outOfScope && {
            "&:hover": {
              transform: dense ? "translateY(-2px)" : "translateY(-6px)",
              boxShadow: `0 12px 24px ${alpha(section.color, 0.25)}`,
            },
          }),
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: dense ? 3 : 4,
            background: outOfScope ? alpha(theme.palette.text.primary, 0.2) : section.gradient,
          },
        }}
      >
        <CardActionArea
          onClick={() => router.push(href)}
          sx={{
            flex: 1,
            p: dense ? 1.25 : 2,
            height: "100%",
            alignItems: "flex-start",
            display: "block",
          }}
        >
          <CardContent
            sx={{
              width: "100%",
              height: "100%",
              p: 0,
              "&:last-child": { pb: 0 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: dense ? 1.25 : 2 }}>
              <Box
                sx={{
                  color: section.color,
                  p: dense ? 0.75 : 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(section.color, 0.1),
                  flexShrink: 0,
                  "& .MuiSvgIcon-root": { fontSize: dense ? 28 : undefined },
                }}
              >
                {section.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant={dense ? "subtitle1" : "h6"} fontWeight={700} sx={{ lineHeight: 1.25 }}>
                  {section.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.25, mb: dense ? 0.5 : 1, fontWeight: 600 }}
                >
                  {section.subtitle}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: dense ? "0.8rem" : undefined,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: dense ? 2 : 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {section.description}
                </Typography>
                {outOfScope && (
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                    <Chip size="small" label={ESCOPO_CHIP_LABEL} sx={{ height: 22, fontSize: "0.68rem" }} />
                    {onEnable && (
                      <Chip
                        size="small"
                        icon={<AddCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                        label="Incluir no escopo"
                        clickable
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onEnable();
                        }}
                        sx={{ height: 22, fontSize: "0.68rem" }}
                      />
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
