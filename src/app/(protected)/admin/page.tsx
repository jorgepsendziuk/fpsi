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
  Divider,
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
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { AdminStatsPanel } from "@/components/admin/AdminStatsPanel";

const ADMIN_CARDS = [
  {
    title: "Modelos de Políticas",
    description: "Templates de políticas (Proteção de Dados, Backup, etc.) com seções e conteúdo padrão.",
    path: "/admin/modelos-politicas",
    icon: <PolicyIcon sx={{ fontSize: 40 }} />,
    color: "#2196F3",
  },
  {
    title: "Controles",
    description: "Controles do framework PPSI/AIGP — número, nome e diagnóstico.",
    path: "/admin/controles",
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    color: "#4CAF50",
  },
  {
    title: "Medidas",
    description: "Medidas por controle — perguntas, CIS v8, grupo de implementação.",
    path: "/admin/medidas",
    icon: <ChecklistIcon sx={{ fontSize: 40 }} />,
    color: "#FF9800",
  },
  {
    title: "Diagnósticos",
    description: "Domínios de diagnóstico (estruturação, SI, privacidade, governança IA).",
    path: "/admin/diagnosticos",
    icon: <CategoryIcon sx={{ fontSize: 40 }} />,
    color: "#9C27B0",
  },
  {
    title: "Cargos",
    description: "Cargos institucionais disponíveis nos perfis de usuário.",
    path: "/admin/cargos",
    icon: <BadgeIcon sx={{ fontSize: 40 }} />,
    color: "#607D8B",
  },
  {
    title: "Departamentos",
    description: "Departamentos institucionais para perfis e responsáveis.",
    path: "/admin/departamentos",
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    color: "#00BCD4",
  },
  {
    title: "Configurações",
    description: "Variáveis de ambiente, saúde do banco, admins e implantação.",
    path: "/admin/config",
    icon: <SettingsIcon sx={{ fontSize: 40 }} />,
    color: "#795548",
  },
];

export default function AdminDashboardPage() {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Área de administração"
        icon={<AdminPanelIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Catálogo global do framework, modelos de políticas, referências institucionais e configurações da plataforma."
      />

      <AdminStatsPanel />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Gerenciamento
      </Typography>

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
