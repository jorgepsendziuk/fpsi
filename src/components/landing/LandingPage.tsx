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
  MeetingRoom as MeetingRoomIcon,
  WarningAmber as WarningAmberIcon,
  Public as PublicIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { ColorModeContext } from "@contexts/color-mode";
import { LgpdReferenciaDrawer } from "@/components/normas/LgpdReferenciaDrawer";
import { AigpReferenciaDrawer } from "@/components/normas/AigpReferenciaDrawer";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { LandingDeckHero } from "./LandingDeckHero";
import { LandingNav } from "./LandingNav";
import { FeaturesExplorer } from "./FeaturesExplorer";
import { landing, featureAccents } from "./landingTokens";
import { resolveDemoCta } from "@/lib/marketing/demoCtaOptions";

/** Mesma família geométrica do wordmark FPSI no logo — pesos 400–900. */
const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

/** Catálogo alinhado aos módulos da home do programa (`sections` em programas/[id]). */
const features = [
  {
    key: "escritorio-governanca",
    icon: <MeetingRoomIcon />,
    title: "Escritório de governança",
    description: "Sala visual com atalhos aos módulos do programa",
  },
  {
    key: "responsabilidades",
    icon: <GroupIcon />,
    title: "Estrutura de Governança",
    description: "Responsáveis, papéis LGPD, instituições e atribuições (PPSI)",
  },
  {
    key: "riscos",
    icon: <WarningAmberIcon />,
    title: "Gestão de Riscos",
    description: "Matriz 5×5, riscos residuais e planos de mitigação",
  },
  {
    key: "conformidade-tratamento",
    icon: <GavelIcon />,
    title: "Tratamento de dados",
    description: "Mapeamento, ROPA, RIPD/AIPD e incidentes",
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
    description: "Ações, prazos, responsáveis e acompanhamento",
  },
  {
    key: "politicas",
    icon: <PolicyIcon />,
    title: "Políticas e documentos",
    description: "Políticas institucionais e textos do portal",
  },
  {
    key: "portal-privacidade",
    icon: <PublicIcon />,
    title: "Titulares e canais públicos",
    description: "Pedidos, reportes, contato e portal público",
  },
  {
    key: "usuarios",
    icon: <PeopleIcon />,
    title: "Usuários e Permissões",
    description: "Acesso multi-usuário e papéis no programa",
  },
  {
    key: "auditoria",
    icon: <SecurityIcon />,
    title: "Histórico de Atividades",
    description: "Trilha de auditoria (LGPD art. 37 · Controle 8)",
  },
];

const BANNER_DATA: Record<
  string,
  { title: string; tagline: string; points: string[]; gradient: string; icon: React.ReactNode }
> = {
  "escritorio-governanca": {
    title: "Escritório de governança",
    tagline:
      "Ambiente visual do programa — navegue pelos módulos como em uma sala de governança, com atalhos rápidos ao que importa.",
    points: [
      "Visão espacial dos módulos do programa",
      "Atalhos para governança, diagnóstico, riscos e conformidade",
      "Útil para onboarding da equipe e apresentação executiva",
      "Complementa a visão geral operacional da home",
    ],
    gradient: featureAccents["escritorio-governanca"],
    icon: <MeetingRoomIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  responsabilidades: {
    title: "Estrutura de Governança",
    tagline:
      "Formalize responsáveis, papéis LGPD e a cadeia de tratamento — base da governança em privacidade e segurança da informação (PPSI).",
    points: [
      "Responsáveis do programa e equipe (SI, privacidade, TI)",
      "Diagrama de papéis: controlador, contratante, operador (LGPD art. 5º)",
      "Instituições, vínculos e fluxo de dados",
      "Alinhamento a RACI e estrutura de governança do Framework",
    ],
    gradient: featureAccents.responsabilidades,
    icon: <GroupIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  riscos: {
    title: "Gestão de Riscos",
    tagline:
      "Identifique, classifique e mitigue riscos de privacidade e segurança com matriz probabilidade × impacto.",
    points: [
      "Matriz 5×5 com visão visual do portfólio de riscos",
      "Score residual e status (identificado, em tratamento, etc.)",
      "Vínculo com medidas e planos de ação do programa",
      "Priorização de riscos críticos para a postura do programa",
    ],
    gradient: featureAccents.riscos,
    icon: <WarningAmberIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  "conformidade-tratamento": {
    title: "Tratamento de dados",
    tagline:
      "Hub LGPD do ciclo de tratamento: do mapeamento à resposta a incidentes, com ROPA e RIPD/AIPD.",
    points: [
      "Mapeamento de dados e processos de tratamento",
      "ROPA – Registro das Operações de Tratamento",
      "RIPD / AIPD – Relatório de Impacto à Proteção de Dados",
      "Registro e tratamento de incidentes de segurança",
    ],
    gradient: featureAccents["conformidade-tratamento"],
    icon: <GavelIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  diagnostico: {
    title: "Diagnóstico",
    tagline:
      "Avalie maturidade em privacidade, segurança e governança de IA — controles e medidas alinhados ao PPSI 2.0 e a boas práticas AIGP.",
    points: [
      "Domínios PPSI: Estrutura, Segurança e Privacidade",
      "Governança de IA (AIGP): inventário, risco, LGPD×IA, viés e fornecedores",
      "Referências: NIST AI RMF, ISO/IEC 42001, OECD e interseção com a LGPD",
      "Dashboard consolidado, relatório e planos de ação",
    ],
    gradient: featureAccents.diagnostico,
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  "planos-acao": {
    title: "Plano de Trabalho",
    tagline: "Transforme lacunas do diagnóstico e riscos em ações concretas com prazos e responsáveis.",
    points: [
      "Plano de ação vinculado a medidas e lacunas",
      "Status: Concluído, Em andamento, Não iniciado",
      "Datas de início e fim, responsáveis e descrição",
      "Acompanhamento visual do progresso do programa",
    ],
    gradient: featureAccents["planos-acao"],
    icon: <AssignmentIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  politicas: {
    title: "Políticas e documentos",
    tagline:
      "Centralize políticas de SI e privacidade, avisos ao titular e demais textos que o portal de privacidade exibe ou cita.",
    points: [
      "Catálogo de políticas institucionais (SI, proteção de dados, etc.)",
      "Avisos, cookies e documentos ligados ao portal público",
      "Editor rico e exportação em PDF",
      "Vigência, revisão e última gravação por documento",
    ],
    gradient: featureAccents.politicas,
    icon: <PolicyIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  "portal-privacidade": {
    title: "Titulares e canais públicos",
    tagline:
      "Canais externos do programa: pedidos dos titulares, reportes e contato — com portal público configurável.",
    points: [
      "Pedidos dos titulares (acesso, correção, eliminação, etc.)",
      "Reportes do portal (vulnerabilidades e comunicações)",
      "Contato público e páginas do portal (slug da organização)",
      "Separado do hub de tratamento (ROPA/RIPD/incidentes)",
    ],
    gradient: featureAccents["portal-privacidade"],
    icon: <PublicIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  usuarios: {
    title: "Usuários e Permissões",
    tagline: "Trabalho colaborativo no programa — convide a equipe e controle o que cada perfil pode fazer.",
    points: [
      "Multi-usuário com dados centralizados no programa",
      "Convites e gestão de acesso",
      "Permissões alinhadas às funções do programa",
      "Adequado a DPOs, TI, SI e consultores",
    ],
    gradient: featureAccents.usuarios,
    icon: <PeopleIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
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
  const [aigpDrawerOpen, setAigpDrawerOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [demoCta, setDemoCta] = useState(() => resolveDemoCta(null));
  const { mode, setMode } = useContext(ColorModeContext);

  const { data: user, isLoading: userLoading } = useGetIdentity<IUser>();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDemoCta(resolveDemoCta(params.get("cta")));
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
        onOpenAigp={() => setAigpDrawerOpen(true)}
        onOpenFeatures={() => setFeaturesOpen(true)}
        onLogin={handleLogin}
        onDashboard={handleGoToDashboard}
        onLogout={handleLogout}
        demoCtaLabel={demoCta.label}
        demoCtaShort={demoCta.short}
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
          {/* Mobile: texto/CTAs primeiro; baralho de features à direita no desktop */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                animation: heroReady ? "lpRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both" : "none",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1.5, md: 2.25 },
                  mb: 0.85,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 56, md: 78 },
                    height: { xs: 56, md: 78 },
                    flexShrink: 0,
                    filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.35))",
                  }}
                >
                  <Image
                    src="/logo_p.png"
                    alt=""
                    fill
                    priority
                    sizes="78px"
                    style={{ objectFit: "contain" }}
                  />
                </Box>
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
                    textShadow: "0 2px 40px rgba(0,0,0,0.25)",
                  }}
                >
                  FPSI
                </Typography>
              </Box>

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
                  fontWeight: 800,
                  fontSize: { xs: "1.2rem", md: "1.55rem" },
                  lineHeight: 1.22,
                  letterSpacing: "-0.025em",
                  mb: 1.35,
                  maxWidth: 540,
                }}
              >
                {user
                  ? "Bem-vindo de volta ao seu programa."
                  : "Quem lida com dados pessoais precisa de um programa de privacidade e segurança."}
              </Typography>

              <Typography
                sx={{
                  fontFamily: ff,
                  fontWeight: 500,
                  fontSize: { xs: "0.95rem", md: "1.08rem" },
                  color: landing.heroMuted,
                  lineHeight: 1.5,
                  mb: { xs: 2.5, md: 3 },
                  maxWidth: 500,
                }}
              >
                {user
                  ? "Continue o diagnóstico, as evidências e o dia a dia do seu programa."
                  : "O FPSI ajuda a montar e acompanhar esse programa — diagnóstico, evidências e conformidade LGPD — com base no PPSI 2.0, a metodologia pública de maturidade em privacidade e segurança da informação usada no setor público e útil para qualquer organização."}
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
                        borderRadius: 1.5,
                        bgcolor: landing.blue,
                        color: "#fff",
                        boxShadow: "0 6px 20px rgba(21,101,192,0.4)",
                        "&:hover": { bgcolor: "#0D47A1", boxShadow: "0 8px 24px rgba(21,101,192,0.5)" },
                      }}
                    >
                      Ir para o painel
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
                        fontSize: "1.08rem",
                        px: 3.25,
                        py: 1.45,
                        borderRadius: 1.5,
                        bgcolor: landing.blue,
                        color: "#fff",
                        boxShadow: "0 8px 28px rgba(21,101,192,0.45)",
                        "@keyframes demoPulse": {
                          "0%, 100%": { boxShadow: "0 8px 28px rgba(21,101,192,0.45)" },
                          "50%": { boxShadow: "0 8px 36px rgba(33,150,243,0.65)" },
                        },
                        animation: "demoPulse 2.8s ease-in-out infinite",
                        "&:hover": {
                          bgcolor: "#0D47A1",
                          boxShadow: "0 10px 32px rgba(21,101,192,0.55)",
                          animation: "none",
                        },
                      }}
                    >
                      {demoCta.label}
                    </Button>
                  )}
                  {!user && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.push("/register")}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        fontFamily: ff,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "1rem",
                        px: 2.5,
                        py: 1.35,
                        borderRadius: 1.5,
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
                      Montar meu programa
                    </Button>
                  )}
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
                    Demo sem cadastro · veja um programa completo em minutos
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
      <AigpReferenciaDrawer open={aigpDrawerOpen} onClose={() => setAigpDrawerOpen(false)} />
    </Box>
  );
}
