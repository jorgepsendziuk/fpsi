"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Policy as PolicyIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  PlayArrow as PlayArrowIcon,
  ArrowForward as ArrowForwardIcon,
  Apps as AppsIcon,
} from "@mui/icons-material";
import { Montserrat } from "next/font/google";
import { ColorModeContext } from "@contexts/color-mode";
import { LgpdReferenciaDrawer } from "@/components/normas/LgpdReferenciaDrawer";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { LandingDeckHero } from "./LandingDeckHero";
import { LandingNav } from "./LandingNav";
import { FeaturesExplorer } from "./FeaturesExplorer";
import { landing, featureAccents } from "./landingTokens";

/** Mesma família geométrica do wordmark FPSI no logo — pesos 400–900. */
const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

const features = [
  {
    key: "responsabilidades",
    icon: <GroupIcon />,
    title: "Estrutura de Governança",
    description: "Responsáveis, papéis LGPD, instituições e atribuições (governança PPSI)",
  },
  {
    key: "diagnostico",
    icon: <CheckCircleOutlineIcon />,
    title: "Diagnóstico",
    description: "Maturidade PPSI e Governança de IA (AIGP)",
  },
  {
    key: "planos-acao",
    icon: <AssignmentIcon />,
    title: "Plano de Trabalho",
    description: "Gerencie o plano de trabalho e acompanhe o progresso",
  },
  {
    key: "conformidade",
    icon: <GavelIcon />,
    title: "Conformidade LGPD",
    description: "ROPA, direitos dos titulares, RIPD e incidentes",
  },
  {
    key: "politicas",
    icon: <PolicyIcon />,
    title: "Políticas e documentos",
    description: "Políticas, aviso de privacidade e textos do portal",
  },
  {
    key: "auditoria",
    icon: <SecurityIcon />,
    title: "Histórico de Atividades",
    description: "Trilha de auditoria (LGPD art. 37, Framework FPSI Controle 8)",
  },
];

const BANNER_DATA: Record<
  string,
  { title: string; tagline: string; points: string[]; gradient: string; icon: React.ReactNode }
> = {
  diagnostico: {
    title: "Diagnóstico",
    tagline:
      "Avalie maturidade em privacidade, segurança e governança de IA — controles e medidas alinhados ao PPSI 2.0 e a boas práticas AIGP.",
    points: [
      "Domínios PPSI: Estrutura, Segurança e Privacidade",
      "Governança de IA (AIGP): inventário, risco, LGPD×IA, viés e fornecedores",
      "Referências: NIST AI RMF, ISO/IEC 42001, OECD e interseção com a LGPD",
      "Dashboard consolidado com índice iAIGP e planos de ação",
    ],
    gradient: featureAccents.diagnostico,
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  "planos-acao": {
    title: "Plano de Trabalho",
    tagline: "Transforme lacunas identificadas no diagnóstico em ações concretas com prazos e responsáveis.",
    points: [
      "Plano de ação vinculado a cada medida",
      "Status: Concluído, Em andamento, Não iniciado",
      "Datas de início e fim, responsáveis e descrição",
      "Acompanhamento visual do progresso",
    ],
    gradient: featureAccents["planos-acao"],
    icon: <AssignmentIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  conformidade: {
    title: "Conformidade LGPD",
    tagline: "Atenda aos requisitos da LGPD com ROPA, RIPD, direitos dos titulares e gestão de incidentes.",
    points: [
      "ROPA – Registro das Operações de Tratamento",
      "RIPD – Relatório de Impacto à Proteção de Dados",
      "Direitos dos titulares e pedidos de acesso",
      "Registro e tratamento de incidentes de segurança",
    ],
    gradient: featureAccents.conformidade,
    icon: <GavelIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  politicas: {
    title: "Políticas e documentos",
    tagline:
      "Centralize políticas de SI e privacidade, avisos ao titular e demais textos que o portal de privacidade exibe ou cita.",
    points: [
      "Catálogo de políticas institucionais (SI, proteção de dados, etc.)",
      "Espaço para aviso de privacidade e documentos ligados ao portal",
      "Editor rico e exportação em PDF",
      "Vigência, revisão e última gravação por documento",
    ],
    gradient: featureAccents.politicas,
    icon: <PolicyIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  responsabilidades: {
    title: "Estrutura de Governança",
    tagline:
      "Formalize responsáveis, papéis LGPD e a cadeia de tratamento — base da governança em privacidade e segurança da informação (PPSI).",
    points: [
      "Responsáveis do programa e equipe (controles SI, privacidade, TI)",
      "Diagrama de papéis: controlador, contratante, operador (LGPD art. 5º)",
      "Instituições, vínculos e fluxo de dados",
      "Alinhamento a RACI e estrutura de governança do Framework",
    ],
    gradient: featureAccents.responsabilidades,
    icon: <GroupIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  auditoria: {
    title: "Histórico de Atividades",
    tagline: "Trilha de auditoria completa: quem fez o quê, quando. Atende LGPD art. 37 e Framework FPSI.",
    points: [
      "Registro automático de alterações em diagnósticos, medidas e planos",
      "Filtros por usuário, data e tipo de atividade",
      "Rastreabilidade para conformidade e auditorias",
      "Framework FPSI Controle 8 – Evidências de auditoria",
    ],
    gradient: featureAccents.auditoria,
    icon: <SecurityIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
};

type IUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

export function LandingPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navMenuEl, setNavMenuEl] = useState<null | HTMLElement>(null);
  const [lgpdDrawerOpen, setLgpdDrawerOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const { mode, setMode } = useContext(ColorModeContext);

  const { data: user, isLoading: userLoading } = useGetIdentity<IUser>();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  // Desktop: trava rolagem (uma face). Mobile: permite scroll (texto → cards).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, []);

  const handleLogin = () => router.push("/login");
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };
  const handleGoToDashboard = () => {
    router.push("/dashboard");
    handleMenuClose();
  };

  if (userLoading) {
    return (
      <Box
        className={brandFont.className}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100svh",
          bgcolor: landing.ink,
        }}
      >
        <CircularProgress sx={{ color: landing.lock }} />
      </Box>
    );
  }

  const primaryCta = user ? handleGoToDashboard : handleLogin;

  return (
    <Box
      className={brandFont.className}
      sx={{
        minHeight: "100svh",
        height: { xs: "auto", md: "100svh" },
        maxHeight: { xs: "none", md: "100svh" },
        overflowX: "clip",
        overflowY: { xs: "auto", md: "hidden" },
        display: "flex",
        flexDirection: "column",
        bgcolor: landing.ink,
        color: landing.heroText,
        fontFamily: ff,
        position: "relative",
        "@keyframes lpRise": {
          from: { opacity: 0, transform: "translateY(22px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes lpFade": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <HeroAtmosphere />

      <LandingNav
        fontFamily={ff}
        isMobile={isMobile}
        mode={mode}
        user={user}
        navMenuEl={navMenuEl}
        userMenuEl={anchorEl}
        ready={heroReady}
        onToggleMode={() => setMode()}
        onOpenNavMenu={setNavMenuEl}
        onCloseNavMenu={() => setNavMenuEl(null)}
        onOpenUserMenu={setAnchorEl}
        onCloseUserMenu={handleMenuClose}
        onNavigate={(href) => router.push(href)}
        onOpenLgpd={() => setLgpdDrawerOpen(true)}
        onOpenFeatures={() => setFeaturesOpen(true)}
        onLogin={handleLogin}
        onDashboard={handleGoToDashboard}
        onLogout={handleLogout}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          minHeight: 0,
          py: { xs: 2, md: 2 },
          pb: { xs: 3, md: 2 },
          overflow: "visible",
        }}
      >
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          alignItems="center"
          sx={{ width: "100%", overflow: "visible" }}
        >
          {/* Mobile: texto/CTAs primeiro; cards (bloco da direita no desktop) abaixo */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                animation: heroReady ? "lpRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both" : "none",
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontFamily: ff,
                  fontWeight: 900,
                  fontSize: {
                    xs: "clamp(2.8rem, 12vw, 4rem)",
                    md: "clamp(4.2rem, 7vw, 6.4rem)",
                  },
                  lineHeight: 0.92,
                  letterSpacing: "-0.045em",
                  mb: 0.75,
                  textShadow: "0 2px 40px rgba(0,0,0,0.25)",
                }}
              >
                FPSI
              </Typography>

              <Typography
                component="p"
                sx={{
                  fontFamily: ff,
                  fontWeight: 600,
                  fontSize: { xs: "0.78rem", md: "0.88rem" },
                  letterSpacing: "0.02em",
                  color: landing.lock,
                  mb: { xs: 1.5, md: 2 },
                  maxWidth: 480,
                  lineHeight: 1.35,
                }}
              >
                Framework de Privacidade e Segurança da Informação
              </Typography>

              <Typography
                component="p"
                sx={{
                  fontFamily: ff,
                  fontWeight: 700,
                  fontSize: { xs: "1.15rem", md: "1.45rem" },
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  mb: 1.25,
                  maxWidth: 460,
                }}
              >
                {user
                  ? "Bem-vindo de volta ao seu programa de maturidade."
                  : "Privacidade e segurança com maturidade mensurável."}
              </Typography>

              <Typography
                sx={{
                  fontFamily: ff,
                  fontWeight: 500,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  color: landing.heroMuted,
                  lineHeight: 1.5,
                  mb: { xs: 2.5, md: 3 },
                  maxWidth: 420,
                }}
              >
                {user
                  ? "Continue avaliando e monitorando a maturidade da sua organização."
                  : "Diagnóstico, governança e conformidade LGPD — open source, multi-usuário, sem planilha."}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.25 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
                  {user ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={primaryCta}
                      startIcon={<DashboardIcon />}
                      sx={{
                        fontFamily: ff,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: "0.98rem",
                        px: 2.5,
                        py: 1.25,
                        borderRadius: 999,
                        bgcolor: landing.lock,
                        color: landing.ink,
                        boxShadow: "0 6px 20px rgba(249,168,37,0.35)",
                        "&:hover": { bgcolor: "#FFB300", boxShadow: "0 8px 24px rgba(249,168,37,0.45)" },
                      }}
                    >
                      Ir para Dashboard
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => router.push("/demo/login")}
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        fontFamily: ff,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: "1.05rem",
                        px: 3,
                        py: 1.35,
                        borderRadius: 999,
                        bgcolor: landing.lock,
                        color: landing.ink,
                        boxShadow: "0 8px 28px rgba(249,168,37,0.45)",
                        "@keyframes demoPulse": {
                          "0%, 100%": { boxShadow: "0 8px 28px rgba(249,168,37,0.45)" },
                          "50%": { boxShadow: "0 8px 36px rgba(249,168,37,0.7)" },
                        },
                        animation: "demoPulse 2.8s ease-in-out infinite",
                        "&:hover": {
                          bgcolor: "#FFB300",
                          boxShadow: "0 10px 32px rgba(249,168,37,0.55)",
                          animation: "none",
                        },
                      }}
                    >
                      Ver demonstração
                    </Button>
                  )}
                  {!user && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleLogin}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        fontFamily: ff,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.98rem",
                        px: 2.25,
                        py: 1.25,
                        borderRadius: 999,
                        color: landing.heroText,
                        borderColor: "rgba(255,255,255,0.45)",
                        borderWidth: 1.5,
                        "&:hover": {
                          borderWidth: 1.5,
                          borderColor: landing.heroText,
                          bgcolor: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      Começar diagnóstico
                    </Button>
                  )}
                  <Button
                    variant="text"
                    size="large"
                    onClick={() => setFeaturesOpen(true)}
                    startIcon={<AppsIcon />}
                    sx={{
                      fontFamily: ff,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 999,
                      color: landing.heroMuted,
                      "&:hover": { color: landing.heroText, bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                  >
                    Ver módulos
                  </Button>
                </Box>
                {!user && (
                  <Typography
                    sx={{
                      fontFamily: ff,
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: "rgba(249,168,37,0.9)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Demo sem cadastro · explore com dados de exemplo
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 0,
              overflow: "visible",
              pt: { xs: 1, md: 0 },
            }}
          >
            <Box
              sx={{
                animation: heroReady ? "lpRise 1.05s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both" : "none",
                overflow: "visible",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                transform: { xs: "scale(0.92)", sm: "scale(0.95)", md: "none" },
                transformOrigin: "top center",
                mb: { xs: 2, md: 0 },
              }}
            >
              <LandingDeckHero fontFamily={ff} />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Rodapé mínimo dentro da face */}
      <Box
        component="footer"
        sx={{
          position: "relative",
          zIndex: 2,
          px: { xs: 2, md: 3 },
          pb: { xs: 1.5, md: 2 },
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          animation: heroReady ? "lpFade 1s 0.3s ease both" : "none",
        }}
      >
        <Typography
          sx={{
            fontFamily: ff,
            fontWeight: 500,
            fontSize: "0.72rem",
            color: "rgba(244,248,252,0.45)",
            letterSpacing: "0.02em",
          }}
        >
          © 2026 FPSI — Framework de Privacidade e Segurança da Informação · Código aberto
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {[
            { label: "Sobre", href: "/sobre" },
            { label: "Artigo", href: "/artigo" },
            { label: "Privacidade", href: "/privacidade" },
          ].map((item) => (
            <Button
              key={item.label}
              size="small"
              onClick={() => router.push(item.href)}
              sx={{
                fontFamily: ff,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.72rem",
                color: "rgba(244,248,252,0.5)",
                minWidth: 0,
                px: 1,
                "&:hover": { color: landing.heroText, bgcolor: "transparent" },
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            size="small"
            onClick={() => setFeaturesOpen(true)}
            sx={{
              fontFamily: ff,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.72rem",
              color: landing.lock,
              minWidth: 0,
              px: 1,
              display: { xs: "inline-flex", md: "none" },
              "&:hover": { bgcolor: "transparent", color: "#FFB300" },
            }}
          >
            Módulos
          </Button>
        </Box>
      </Box>

      <FeaturesExplorer
        open={featuresOpen}
        onClose={() => setFeaturesOpen(false)}
        fontFamily={ff}
        features={features}
        bannerData={BANNER_DATA}
      />

      <LgpdReferenciaDrawer open={lgpdDrawerOpen} onClose={() => setLgpdDrawerOpen(false)} />
    </Box>
  );
}
