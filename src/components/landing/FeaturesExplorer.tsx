"use client";

import { useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  Fade,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FeatureBanner } from "@/components/landing/FeatureBanners";
import { StatsBanner } from "@/components/landing/StatsBanner";
import { landing } from "./landingTokens";

type FeatureItem = {
  key: string;
  icon: ReactNode;
  title: string;
  description: string;
};

type BannerData = {
  title: string;
  tagline: string;
  points: string[];
  gradient: string;
  icon: ReactNode;
};

type FeaturesExplorerProps = {
  open: boolean;
  onClose: () => void;
  fontFamily: string;
  features: FeatureItem[];
  bannerData: Record<string, BannerData>;
};

/** Painel full-screen: Do diagnóstico à auditoria (sem scroll na landing). */
export function FeaturesExplorer({
  open,
  onClose,
  fontFamily,
  features,
  bannerData,
}: FeaturesExplorerProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      transitionDuration={320}
      PaperProps={{
        sx: {
          overflow: "auto",
          bgcolor: landing.paper,
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 10% 0%, ${landing.blue}14 0%, transparent 55%),
            ${landing.paper}
          `,
        },
      }}
    >
      <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column", fontFamily }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: { xs: 2, md: 3 },
            py: 1.5,
            bgcolor: "rgba(245,248,251,0.88)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${landing.line}`,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily,
                fontWeight: 800,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                letterSpacing: "-0.03em",
                color: landing.text,
              }}
            >
              Do diagnóstico à auditoria
            </Typography>
            <Typography
              sx={{
                fontFamily,
                fontWeight: 500,
                fontSize: "0.9rem",
                color: landing.muted,
                display: { xs: "none", sm: "block" },
              }}
            >
              Selecione um módulo e veja o que ele resolve no dia a dia.
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{
              fontFamily,
              textTransform: "none",
              fontWeight: 700,
              color: landing.blue,
              display: { xs: "none", sm: "inline-flex" },
            }}
          >
            Voltar
          </Button>
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            sx={{
              bgcolor: landing.mist,
              "&:hover": { bgcolor: "#d7e6f2" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, flex: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Box
                component="ul"
                sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}
              >
                {features.map((feature, index) => {
                  const active = activeFeature === index;
                  return (
                    <Box
                      component="li"
                      key={feature.key}
                      onMouseEnter={() => setActiveFeature(index)}
                      onFocus={() => setActiveFeature(index)}
                      onClick={() => setActiveFeature(index)}
                      tabIndex={0}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        p: 2,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: active ? landing.blue : "transparent",
                        bgcolor: active ? "rgba(21, 101, 192, 0.06)" : "transparent",
                        transition: "background 0.2s ease, border-color 0.2s ease",
                        outline: "none",
                        "&:hover": { bgcolor: "rgba(21, 101, 192, 0.04)" },
                        "&:focus-visible": { borderColor: landing.blue },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1.5,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          bgcolor: active ? landing.blue : landing.mist,
                          color: active ? "#fff" : landing.blue,
                          transition: "background 0.2s ease, color 0.2s ease",
                          "& .MuiSvgIcon-root": { fontSize: 24 },
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily,
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            mb: 0.35,
                            color: landing.text,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily,
                            fontWeight: 500,
                            color: landing.muted,
                            fontSize: "0.95rem",
                            lineHeight: 1.45,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  minHeight: { xs: 360, md: "calc(100svh - 160px)" },
                  maxHeight: { md: "calc(100svh - 140px)" },
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `1px solid ${landing.line}`,
                  bgcolor: "#fff",
                  position: { md: "sticky" },
                  top: 88,
                }}
              >
                {activeFeature !== null && features[activeFeature] ? (
                  <Fade in key={`banner-${features[activeFeature].key}`} timeout={250}>
                    <Box sx={{ height: "100%", minHeight: { xs: 360, md: 480 } }}>
                      <FeatureBanner {...bannerData[features[activeFeature].key]} />
                    </Box>
                  </Fade>
                ) : (
                  <Fade in key="stats" timeout={300}>
                    <Box sx={{ height: "100%", minHeight: { xs: 360, md: 480 } }}>
                      <StatsBanner />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Dialog>
  );
}
