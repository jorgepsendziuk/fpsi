"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { landing } from "@/components/landing/landingTokens";
import { COVER_MODULES, LINKEDIN_ARTICLE } from "./linkedinArticleContent";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

const muted = "rgba(244, 248, 252, 0.82)";
const faint = "rgba(244, 248, 252, 0.55)";

/** LinkedIn article cover — 1920×1080 (16:9). Tipografia em px para o canvas fixo. */
export const LINKEDIN_COVER_WIDTH = 1920;
export const LINKEDIN_COVER_HEIGHT = 1080;

function CoverAtmosphere() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: `
          radial-gradient(ellipse 70% 60% at 78% 40%, ${landing.blue}44 0%, transparent 58%),
          radial-gradient(ellipse 50% 45% at 12% 80%, ${landing.shield}28 0%, transparent 52%),
          radial-gradient(ellipse 35% 30% at 90% 10%, ${landing.lock}18 0%, transparent 45%),
          linear-gradient(160deg, ${landing.ink} 0%, ${landing.navy} 48%, #0C3A66 100%)
        `,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 75% 65% at 70% 45%, black 15%, transparent 78%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg, ${landing.ink}e8 0%, ${landing.ink}99 38%, transparent 68%),
            linear-gradient(180deg, transparent 55%, ${landing.ink}cc 100%)
          `,
        }}
      />
    </Box>
  );
}

type LinkedInArticleCoverProps = {
  scale?: number;
};

export function LinkedInArticleCover({ scale = 1 }: LinkedInArticleCoverProps) {
  return (
    <Box
      id="linkedin-cover"
      className="linkedin-cover-root"
      sx={{
        position: "relative",
        width: LINKEDIN_COVER_WIDTH,
        height: LINKEDIN_COVER_HEIGHT,
        flexShrink: 0,
        overflow: "hidden",
        color: landing.heroText,
        fontFamily: ff,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
      }}
    >
      <CoverAtmosphere />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          px: "120px",
          py: "72px",
          gap: "48px",
        }}
      >
        {/* Marca — estilo landing */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "28px", flexShrink: 0 }}>
          <Box
            sx={{
              position: "relative",
              width: 112,
              height: 112,
              flexShrink: 0,
              filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.4))",
            }}
          >
            <Image src="/logo_p.png" alt="" fill sizes="112px" priority style={{ objectFit: "contain" }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 900,
                fontSize: "88px",
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                textShadow: "0 2px 40px rgba(0,0,0,0.25)",
              }}
            >
              FPSI
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 600,
                fontSize: "22px",
                letterSpacing: "0.02em",
                color: landing.lock,
                mt: "8px",
                lineHeight: 1.35,
              }}
            >
              Framework de Privacidade e Segurança da Informação
            </Typography>
            <Typography sx={{ fontFamily: ff, fontWeight: 500, fontSize: "20px", color: faint, mt: "6px" }}>
              open source · PPSI 2.0
            </Typography>
          </Box>
        </Box>

        {/* Conteúdo — distribuído na altura restante */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            minHeight: 0,
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: ff,
              fontWeight: 700,
              fontSize: "50px",
              lineHeight: 1.2,
              letterSpacing: "-0.025em",
            }}
          >
            {LINKEDIN_ARTICLE.title}
          </Typography>

          <Typography
            sx={{
              fontFamily: ff,
              fontWeight: 500,
              fontSize: "30px",
              lineHeight: 1.42,
              color: muted,
              maxWidth: "1520px",
            }}
          >
            {LINKEDIN_ARTICLE.subtitle}
          </Typography>

          <Box>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: faint,
                mb: "24px",
              }}
            >
              Módulos no repositório
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                columnGap: "28px",
                rowGap: "24px",
              }}
            >
              {COVER_MODULES.map((mod) => (
                <Typography
                  key={mod.label}
                  sx={{
                    fontFamily: ff,
                    fontWeight: 500,
                    fontSize: "23px",
                    lineHeight: 1.28,
                    color: muted,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: mod.color,
                      flexShrink: 0,
                      boxShadow: `0 0 12px ${mod.color}99`,
                    }}
                  />
                  {mod.label}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
