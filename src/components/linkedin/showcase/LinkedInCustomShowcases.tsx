"use client";

import { Box, Grid, Typography, alpha, useTheme } from "@mui/material";
import {
  MeetingRoom,
  Group,
  WarningAmber,
  Gavel,
  CheckCircleOutline,
  Assignment,
  Policy,
  People,
  History,
} from "@mui/icons-material";
import { COVER_MODULES } from "../linkedinArticleContent";

const ff = "var(--font-brand), Montserrat, system-ui, sans-serif";

const MODULES = [
  { icon: <MeetingRoom />, title: "Escritório", color: "#5d4037" },
  { icon: <Group />, title: "Governança", color: "#607d8b" },
  { icon: <WarningAmber />, title: "Riscos", color: "#c62828" },
  { icon: <Gavel />, title: "Tratamento", color: "#1565C0" },
  { icon: <CheckCircleOutline />, title: "Diagnóstico", color: "#43A047" },
  { icon: <Assignment />, title: "Plano", color: "#1E88E5" },
  { icon: <Policy />, title: "Políticas", color: "#00897B" },
  { icon: <People />, title: "Usuários", color: "#FFB300" },
  { icon: <History />, title: "Auditoria", color: "#455A64" },
];

export function LinkedInLandingTeaser() {
  const theme = useTheme();
  return (
    <Box>
      <Typography sx={{ fontFamily: ff, fontWeight: 800, fontSize: "1.35rem", mb: 0.5, color: "#0A2744" }}>
        FPSI
      </Typography>
      <Typography sx={{ fontFamily: ff, fontSize: "0.92rem", color: "text.secondary", mb: 2, lineHeight: 1.5 }}>
        Programa de Privacidade e Segurança da Informação na web — PPSI 2.0, LGPD, titulares e governança de IA.
      </Typography>
      <Grid container spacing={1}>
        {COVER_MODULES.slice(0, 9).map((m) => (
          <Grid item xs={4} sm={4} key={m.label}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(m.color, 0.35),
                bgcolor: alpha(m.color, 0.08),
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: m.color, mb: 0.5 }} />
              <Typography sx={{ fontFamily: ff, fontSize: "0.65rem", fontWeight: 700, lineHeight: 1.2 }}>
                {m.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: "1px dashed",
          borderColor: alpha(theme.palette.primary.main, 0.35),
        }}
      >
        <Typography sx={{ fontFamily: ff, fontSize: "0.8rem", fontWeight: 600 }}>
          Demo aberta · sem cadastro · explore todos os módulos
        </Typography>
      </Box>
    </Box>
  );
}

export function LinkedInProgramModulesShowcase() {
  return (
    <Box>
      <Typography sx={{ fontFamily: ff, fontWeight: 700, fontSize: "1rem", mb: 1.5 }}>
        Programa de Demonstração — FPSI
      </Typography>
      <Grid container spacing={1.25}>
        {MODULES.map((m) => (
          <Grid item xs={6} sm={4} key={m.title}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${m.color} 0%, ${alpha(m.color, 0.75)} 100%)`,
                color: "#fff",
                minHeight: 72,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "default",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: `0 8px 24px ${alpha(m.color, 0.45)}`,
                },
              }}
            >
              <Box sx={{ opacity: 0.95, "& svg": { fontSize: 22 } }}>{m.icon}</Box>
              <Typography sx={{ fontFamily: ff, fontWeight: 700, fontSize: "0.78rem", lineHeight: 1.2 }}>
                {m.title}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, fontFamily: ff }}>
        Mesmo grid da home do programa — clique em &quot;Experimentar demo&quot; para navegar de verdade.
      </Typography>
    </Box>
  );
}

export function LinkedInNormasShowcase() {
  const norms = [
    { label: "LGPD art. 46", tone: "#5C6BC0" },
    { label: "CIS 15.1", tone: "#1565C0" },
    { label: "NIST CSF", tone: "#00897B" },
    { label: "ISO 27001", tone: "#455A64" },
  ];
  return (
    <Box>
      <Typography sx={{ fontFamily: ff, fontWeight: 700, fontSize: "0.95rem", mb: 1 }}>
        Medida 0.1 — Alta administração e governança
      </Typography>
      <Typography sx={{ fontFamily: ff, fontSize: "0.82rem", color: "text.secondary", mb: 1.5, lineHeight: 1.55 }}>
        A alta administração estabelece, mantém e aprimora o sistema de gestão de riscos e controles internos…
      </Typography>
      <Typography variant="caption" sx={{ fontFamily: ff, fontWeight: 600, color: "text.secondary", mb: 0.75, display: "block" }}>
        Normas de referência
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
        {norms.map((n) => (
          <Box
            key={n.label}
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              fontFamily: ff,
              fontSize: "0.72rem",
              fontWeight: 700,
              bgcolor: alpha(n.tone, 0.12),
              color: n.tone,
              border: "1px solid",
              borderColor: alpha(n.tone, 0.35),
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { bgcolor: alpha(n.tone, 0.22), transform: "translateY(-1px)" },
            }}
          >
            {n.label}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: "action.hover" }} />
        <Typography sx={{ fontFamily: ff, fontWeight: 700, fontSize: "0.85rem", color: "#43A047" }}>
          INCC 0.85
        </Typography>
      </Box>
    </Box>
  );
}

export function LinkedInOpenSourceShowcase() {
  const steps = [
    { n: "1", t: "git clone github.com/jorgepsendziuk/fpsi" },
    { n: "2", t: "cp .env.example .env.local" },
    { n: "3", t: "supabase db push" },
    { n: "4", t: "npm run dev → /setup" },
  ];
  return (
    <Box>
      <Typography sx={{ fontFamily: ff, fontWeight: 800, fontSize: "1.05rem", mb: 1 }}>
        MIT · fork · implantação própria
      </Typography>
      <Typography sx={{ fontFamily: ff, fontSize: "0.85rem", color: "text.secondary", mb: 2, lineHeight: 1.55 }}>
        Diagnóstico, portal, riscos, ROPA, políticas e multi-usuário — código aberto para órgãos, empresas e
        consultorias.
      </Typography>
      {steps.map((s) => (
        <Box
          key={s.n}
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            mb: 0.75,
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.75rem",
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: "#0A2744",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {s.n}
          </Box>
          <Box sx={{ flex: 1, py: 0.75, px: 1, borderRadius: 1, bgcolor: "action.hover" }}>{s.t}</Box>
        </Box>
      ))}
    </Box>
  );
}