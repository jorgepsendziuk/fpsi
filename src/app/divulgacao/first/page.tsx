"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { Montserrat } from "next/font/google";
import { landing } from "@/components/landing/landingTokens";
import { FIRST_POST_SLIDE_MS, FIRST_POST_SLIDES } from "@/lib/marketing/firstPostSlides";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

const TONE_BG: Record<(typeof FIRST_POST_SLIDES)[number]["tone"], string> = {
  ink: `linear-gradient(165deg, ${landing.ink} 0%, ${landing.navy} 55%, #0d3a5c 100%)`,
  lock: `linear-gradient(165deg, ${landing.ink} 0%, #3d2e0a 45%, ${landing.navy} 100%)`,
  shield: `linear-gradient(165deg, ${landing.ink} 0%, #0d3320 45%, ${landing.navy} 100%)`,
  blue: `linear-gradient(165deg, ${landing.ink} 0%, #0a3058 50%, ${landing.navy} 100%)`,
};

const BACKDROP_SRC: Record<(typeof FIRST_POST_SLIDES)[number]["backdrop"], string> = {
  anpd: "/divulgacao/first/1.png",
  portal: "/divulgacao/first/2.jpg",
  diag: "/divulgacao/first/3.jpg",
};

const BACKDROP_OBJECT: Record<(typeof FIRST_POST_SLIDES)[number]["backdrop"], string> = {
  /** Auto de Infração: cabeçalho ANPD + identificação */
  anpd: "center 8%",
  /** Portal: faixa azul + DPO + formulário */
  portal: "center 18%",
  /** Dashboard: maturidade + pedidos + riscos */
  diag: "left 12%",
};

function SlideBackdrop({ kind }: { kind: (typeof FIRST_POST_SLIDES)[number]["backdrop"] }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box sx={{ position: "absolute", inset: 0 }}>
        <Image
          src={BACKDROP_SRC[kind]}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          style={{
            objectFit: "cover",
            objectPosition: BACKDROP_OBJECT[kind],
            filter: "saturate(1) contrast(1.05)",
          }}
          priority={kind === "anpd"}
        />
      </Box>

      {/* Vignette forte nas bordas — centro do print limpo */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 72% 68% at 50% 48%,
              transparent 0%,
              transparent 38%,
              rgba(6,21,37,0.45) 68%,
              rgba(6,21,37,0.82) 88%,
              rgba(6,21,37,0.94) 100%
            )
          `,
        }}
      />
    </Box>
  );
}

/**
 * 1º post LinkedIn — slides verticais 9:16 para print / PDF / carrossel.
 * Fundos: Auto ANPD · Portal · Dashboard (public/divulgacao/first).
 * Teclado: ↑↓ navega; Espaço pausa. Autoplay em loop.
 */
export default function DivulgacaoFirstPostPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const n = FIRST_POST_SLIDES.length;
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
    const id = window.setTimeout(() => {
      go(indexRef.current + 1);
    }, FIRST_POST_SLIDE_MS);
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
        "@media print": {
          height: "auto",
          overflow: "visible",
          bgcolor: "#fff",
        },
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
          "@media print": {
            height: "auto",
            overflow: "visible",
            scrollSnapType: "none",
          },
        }}
      >
        {FIRST_POST_SLIDES.map((slide) => (
          <Box
            key={slide.id}
            className="first-post-slide"
            sx={{
              height: "100dvh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { xs: 2.25, sm: 3.5 },
              py: 5,
              background: TONE_BG[slide.tone],
              position: "relative",
              "@media print": {
                height: "100vh",
                pageBreakAfter: "always",
                breakAfter: "page",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              },
            }}
          >
            <SlideBackdrop kind={slide.backdrop} />

            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: 480 },
                mx: "auto",
                aspectRatio: { xs: "auto", sm: "9 / 16" },
                maxHeight: { sm: "min(90dvh, 760px)" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
                px: { xs: 0.5, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "100%",
                  px: { xs: 2.25, sm: 3 },
                  py: { xs: 2.25, sm: 2.75 },
                  borderRadius: 3,
                  bgcolor: "rgba(4, 14, 26, 0.84)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Image src="/logo_p.png" alt="" width={30} height={30} />
                  <Typography
                    sx={{
                      fontFamily: ff,
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: landing.lock,
                    }}
                  >
                    {slide.eyebrow}
                  </Typography>
                </Box>

                <Typography
                  component="h2"
                  sx={{
                    fontFamily: ff,
                    fontWeight: 700,
                    fontSize: { xs: "1.7rem", sm: "2.05rem" },
                    letterSpacing: "-0.02em",
                    lineHeight: 1.18,
                    color: "#fff",
                  }}
                >
                  {slide.title}
                </Typography>

                {slide.bullets ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {slide.bullets.map((b) => (
                      <Box key={b} sx={{ display: "flex", gap: 1.1, alignItems: "flex-start" }}>
                        <Box
                          sx={{
                            mt: "0.5em",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: slide.tone === "lock" ? landing.lock : landing.blueBright,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: ff,
                            fontWeight: 500,
                            fontSize: { xs: "0.95rem", sm: "1.05rem" },
                            color: "rgba(244,248,252,0.94)",
                            lineHeight: 1.42,
                          }}
                        >
                          {b}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : null}

                {slide.checklist ? (
                  <Box
                    sx={{
                      mt: 0.25,
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: ff,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: landing.lock,
                        mb: 1.1,
                      }}
                    >
                      Básico operacional
                    </Typography>
                    {slide.checklist.map((c) => (
                      <Typography
                        key={c}
                        sx={{
                          fontFamily: ff,
                          fontWeight: 500,
                          fontSize: { xs: "0.92rem", sm: "1rem" },
                          color: "#fff",
                          lineHeight: 1.38,
                          mb: 0.75,
                          pl: 1.35,
                          borderLeft: `3px solid ${landing.shield}`,
                        }}
                      >
                        {c}
                      </Typography>
                    ))}
                  </Box>
                ) : null}

                {slide.footer ? (
                  <Typography
                    sx={{
                      pt: 1.25,
                      fontFamily: ff,
                      fontWeight: 500,
                      fontSize: { xs: "0.92rem", sm: "1rem" },
                      color: "rgba(244,248,252,0.9)",
                      lineHeight: 1.42,
                      borderTop: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    {slide.footer}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          position: "fixed",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          zIndex: 5,
          "@media print": { display: "none" },
        }}
      >
        {FIRST_POST_SLIDES.map((s, i) => (
          <Box
            key={s.id}
            onClick={() => go(i)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              cursor: "pointer",
              bgcolor: i === index ? landing.lock : "rgba(255,255,255,0.28)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
