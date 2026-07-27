"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Montserrat } from "next/font/google";
import { LandingDeckScenePreview } from "@/components/landing/LandingDeckHero";
import { WhatsappProductPreview } from "@/components/marketing/WhatsappProductScenes";
import { landing } from "@/components/landing/landingTokens";
import { WHATSAPP_SLIDE_MS, WHATSAPP_SLIDES } from "@/lib/marketing/whatsappSlides";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

const TONE_BG: Record<(typeof WHATSAPP_SLIDES)[number]["tone"], string> = {
  ink: `linear-gradient(165deg, ${landing.ink} 0%, ${landing.navy} 55%, #0d3a5c 100%)`,
  lock: `linear-gradient(165deg, ${landing.ink} 0%, #3d2e0a 45%, ${landing.navy} 100%)`,
  shield: `linear-gradient(165deg, ${landing.ink} 0%, #0d3320 45%, ${landing.navy} 100%)`,
  blue: `linear-gradient(165deg, ${landing.ink} 0%, #0a3058 50%, ${landing.navy} 100%)`,
};

/**
 * Sequência vertical 9:16 para captura (print / vídeo Status).
 * UI limpa: sem voltar / “deslize”. Autoplay em loop.
 * Teclado: ↑↓ ainda navega; Espaço pausa/retoma.
 */
export default function DivulgacaoSlidesPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const n = WHATSAPP_SLIDES.length;
    const next = ((i % n) + n) % n;
    const child = el.children[next] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "start" });
    indexRef.current = next;
    setIndex(next);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const h = el.clientHeight || 1;
      const i = Math.round(el.scrollTop / h);
      indexRef.current = i;
      setIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(indexRef.current + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(indexRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (paused) return;
    const isCta = WHATSAPP_SLIDES[index]?.id === "cta";
    const ms = isCta ? WHATSAPP_SLIDE_MS + 1800 : WHATSAPP_SLIDE_MS;
    const id = window.setTimeout(() => {
      go(indexRef.current + 1);
    }, ms);
    return () => window.clearTimeout(id);
  }, [index, paused, go]);

  return (
    <Box
      className={brandFont.className}
      sx={{
        height: "100dvh",
        bgcolor: landing.ink,
        color: landing.heroText,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        ref={scrollerRef}
        sx={{
          height: "100%",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {WHATSAPP_SLIDES.map((slide, i) => (
          <Box
            key={slide.id}
            sx={{
              height: "100dvh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { xs: 2.5, sm: 4 },
              py: 6,
              background: TONE_BG[slide.tone],
              position: "relative",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 420,
                mx: "auto",
                aspectRatio: { xs: "auto", sm: "9 / 16" },
                maxHeight: { sm: "min(88dvh, 720px)" },
                display: "flex",
                flexDirection: "column",
                justifyContent:
                  slide.deckSlot != null || slide.visual != null ? "flex-start" : "center",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Image src="/logo_p.png" alt="" width={28} height={28} />
                {slide.eyebrow ? (
                  <Typography
                    sx={{
                      fontFamily: ff,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: landing.lock,
                    }}
                  >
                    {slide.eyebrow}
                  </Typography>
                ) : null}
              </Box>

              <Typography
                component="h2"
                sx={{
                  fontFamily: ff,
                  fontWeight: 900,
                  fontSize:
                    slide.deckSlot != null || slide.visual != null
                      ? { xs: "1.4rem", sm: "1.65rem" }
                      : { xs: "1.85rem", sm: "2.15rem" },
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {slide.title}
              </Typography>

              <Typography
                sx={{
                  fontFamily: ff,
                  fontWeight: 500,
                  fontSize: { xs: "0.88rem", sm: "0.98rem" },
                  color: landing.heroMuted,
                  lineHeight: 1.4,
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {slide.body}
              </Typography>

              {slide.visual != null ? (
                <Box
                  sx={{
                    mt: 0.5,
                    flex: "1 1 auto",
                    minHeight: 0,
                    maxHeight: { xs: "48dvh", sm: "52dvh" },
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    overflow: "visible",
                  }}
                >
                  <WhatsappProductPreview
                    kind={slide.visual}
                    fontFamily={ff}
                    tilt={i % 2 === 0 ? "pos" : "neg"}
                    compact
                  />
                </Box>
              ) : null}

              {slide.deckSlot != null ? (
                <Box
                  sx={{
                    mt: 0.5,
                    flex: "1 1 auto",
                    minHeight: 0,
                    maxHeight: { xs: "48dvh", sm: "52dvh" },
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    overflow: "visible",
                  }}
                >
                  <LandingDeckScenePreview
                    slot={slide.deckSlot}
                    fontFamily={ff}
                    tilt={i % 2 === 0 ? "pos" : "neg"}
                    compact
                  />
                </Box>
              ) : null}

              {slide.id === "cta" ? (
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                  <Button
                    component={Link}
                    href="/demo/login"
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      fontFamily: ff,
                      textTransform: "none",
                      fontWeight: 800,
                      py: 1.4,
                      borderRadius: 2,
                      bgcolor: landing.blue,
                      color: "#fff",
                      "&:hover": { bgcolor: "#0D47A1" },
                    }}
                  >
                    Experimentar demonstração
                  </Button>
                  <Button
                    component={Link}
                    href="/register"
                    variant="outlined"
                    size="large"
                    sx={{
                      fontFamily: ff,
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.25,
                      borderRadius: 2,
                      color: landing.heroText,
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Criar meu programa
                  </Button>
                </Box>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
