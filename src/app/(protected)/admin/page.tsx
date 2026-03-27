"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Policy as PolicyIcon,
  Security as SecurityIcon,
  Checklist as ChecklistIcon,
  Category as CategoryIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminPanelIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import Link from "next/link";

const ADMIN_CARDS = [
  {
    title: "Modelos de Políticas",
    description: "Editar templates de políticas (Proteção de Dados, Backup, etc.) com seções e conteúdo padrão.",
    path: "/admin/modelos-politicas",
    icon: <PolicyIcon sx={{ fontSize: 40 }} />,
    color: "#2196F3",
  },
  {
    title: "Controles",
    description: "Gerenciar controles do framework de segurança (nome, texto, por que implementar).",
    path: "/admin/controles",
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    color: "#4CAF50",
  },
  {
    title: "Medidas",
    description: "Gerenciar medidas por controle (perguntas, descrições, id_cisv8).",
    path: "/admin/medidas",
    icon: <ChecklistIcon sx={{ fontSize: 40 }} />,
    color: "#FF9800",
  },
  {
    title: "Diagnósticos",
    description: "Categorias de diagnóstico (descrição, cor, índice, maturidade).",
    path: "/admin/diagnosticos",
    icon: <CategoryIcon sx={{ fontSize: 40 }} />,
    color: "#9C27B0",
  },
  {
    title: "Cargos",
    description: "Cargos institucionais disponíveis para perfis.",
    path: "/admin/cargos",
    icon: <BadgeIcon sx={{ fontSize: 40 }} />,
    color: "#607D8B",
  },
  {
    title: "Departamentos",
    description: "Departamentos institucionais.",
    path: "/admin/departamentos",
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    color: "#00BCD4",
  },
  {
    title: "Configurações",
    description: "Configurações gerais do sistema.",
    path: "/admin/config",
    icon: <SettingsIcon sx={{ fontSize: 40 }} />,
    color: "#795548",
  },
];

export default function AdminDashboardPage() {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <AdminPanelIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            Área de Administração
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gerencie modelos de políticas, controles, medidas, diagnósticos e demais entidades globais do sistema.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {ADMIN_CARDS.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.path}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                border: `2px solid ${alpha(card.color, 0.2)}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                  borderColor: alpha(card.color, 0.5),
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha(card.color, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.color,
                    mb: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  href={card.path}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: card.color, fontWeight: 600 }}
                >
                  Acessar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
