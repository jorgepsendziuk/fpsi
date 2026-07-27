"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { LandingDeckScenePreview } from "./LandingDeckHero";
import { WhatsappProductPreview } from "@/components/marketing/WhatsappProductScenes";
import {
  PRODUCT_SHOWCASE,
  SHOWCASE_INTERVAL_MS,
} from "@/lib/marketing/productShowcase";
import { landing } from "./landingTokens";

/**
 * Jornada da landing — mesmos cards de /divulgacao/slides (productShowcase).
 */
export function LandingJourneyHero({ fontFamily }: { fontFamily: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = PRODUCT_SHOWCASE[index];
  const tilt = index % 2 === 0 ? "pos" : "neg";

  const goToIndex = useCallback((i: number) => {
    setIndex(i);
    setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) {
      const resume = window.setTimeout(() => setPaused(false), SHOWCASE_INTERVAL_MS * 2);
      return () => window.clearTimeout(resume);
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PRODUCT_SHOWCASE.length);
    }, SHOWCASE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 1.25, md: 1.5 },
        "@keyframes journeyRailIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes journeyBar": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      }}
    >
      <Box sx={{ width: "100%", px: { xs: 0.5, md: 0 }, animation: "journeyRailIn 0.6s ease both" }}>
        <Typography
          sx={{
            fontFamily,
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: landing.lock,
            mb: 1,
            textAlign: { xs: "left", md: "center" },
          }}
        >
          A jornada do programa
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 0.65,
            overflowX: "auto",
            pb: 0.5,
            mx: { xs: -0.5, md: 0 },
            px: { xs: 0.5, md: 0 },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {PRODUCT_SHOWCASE.map((item, i) => {
            const on = i === index;
            const done = i < index;
            const n = String(i + 1).padStart(2, "0");
            return (
              <Box
                key={item.id}
                component="button"
                type="button"
                onClick={() => goToIndex(i)}
                aria-label={`Passo ${n}: ${item.label}`}
                aria-current={on ? "step" : undefined}
                sx={{
                  appearance: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  flex: "0 0 auto",
                  minWidth: { xs: 72, md: 78 },
                  maxWidth: 96,
                  p: { xs: 0.75, md: 0.9 },
                  borderRadius: 1.5,
                  bgcolor: on ? "rgba(249,168,37,0.16)" : "rgba(255,255,255,0.04)",
                  outline: on ? `1px solid ${landing.lock}88` : "1px solid transparent",
                  transition: "background-color 0.35s ease, outline-color 0.35s ease, transform 0.25s ease",
                  transform: on ? "translateY(-1px)" : "none",
                  "&:hover": {
                    bgcolor: on ? "rgba(249,168,37,0.2)" : "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily,
                    fontWeight: 800,
                    fontSize: "0.6rem",
                    letterSpacing: "0.06em",
                    color: on ? landing.lock : done ? landing.shield : landing.heroMuted,
                    mb: 0.3,
                  }}
                >
                  {n}
                </Typography>
                <Typography
                  sx={{
                    fontFamily,
                    fontWeight: on ? 700 : 600,
                    fontSize: { xs: "0.68rem", md: "0.72rem" },
                    color: on || done ? landing.heroText : landing.heroMuted,
                    lineHeight: 1.15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Typography>
                {on ? (
                  <Box
                    sx={{
                      mt: 0.7,
                      height: 2,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,0.12)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      key={`${item.id}-${paused}`}
                      sx={{
                        height: "100%",
                        width: "100%",
                        transformOrigin: "left",
                        bgcolor: landing.lock,
                        animation: paused
                          ? "none"
                          : `journeyBar ${SHOWCASE_INTERVAL_MS}ms linear both`,
                        transform: paused ? "scaleX(1)" : undefined,
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ mt: 0.7, height: 2 }} />
                )}
              </Box>
            );
          })}
        </Box>

        <Typography
          sx={{
            fontFamily,
            fontWeight: 500,
            fontSize: { xs: "0.8rem", md: "0.86rem" },
            color: landing.heroMuted,
            mt: 1.1,
            minHeight: "2.5em",
            textAlign: { xs: "left", md: "center" },
            lineHeight: 1.35,
          }}
        >
          {active.title}
          <Box
            component="span"
            sx={{
              display: "block",
              mt: 0.35,
              fontSize: "0.78em",
              color: "rgba(244,248,252,0.55)",
            }}
          >
            {active.body}
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          maxHeight: { xs: "42vh", md: "48vh" },
          overflow: "visible",
        }}
      >
        {active.visual != null ? (
          <WhatsappProductPreview
            kind={active.visual}
            fontFamily={fontFamily}
            tilt={tilt}
            compact
          />
        ) : active.deckSlot != null ? (
          <LandingDeckScenePreview
            slot={active.deckSlot}
            fontFamily={fontFamily}
            tilt={tilt}
            compact
          />
        ) : null}
      </Box>
    </Box>
  );
}
