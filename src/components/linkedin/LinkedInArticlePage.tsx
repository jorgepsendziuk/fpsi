"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Container, Typography, Divider, Link, useTheme } from "@mui/material";
import { Montserrat } from "next/font/google";
import { LinkedInArticleCover, LINKEDIN_COVER_HEIGHT, LINKEDIN_COVER_WIDTH } from "./LinkedInArticleCover";
import { LINKEDIN_ARTICLE, LINKEDIN_ARTICLE_BODY } from "./linkedinArticleContent";
import { LinkedInPostsSection } from "./LinkedInPostsSection";
import { landing } from "@/components/landing/landingTokens";
import { LinkedInExploreHub } from "./showcase/LinkedInExploreHub";
import { LinkedInShowcase } from "./showcase/LinkedInShowcase";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

function useCoverScale(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);

  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScale(Math.min(1, el.clientWidth / LINKEDIN_COVER_WIDTH));
  }, [containerRef]);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return scale;
}

export function LinkedInArticlePage() {
  const theme = useTheme();
  const [coverHostRef, setCoverHostRef] = useState<HTMLDivElement | null>(null);
  const scale = useCoverScale({ current: coverHostRef });

  return (
    <Box sx={{ bgcolor: landing.ink, minHeight: "100dvh" }}>
      <Box
        ref={setCoverHostRef}
        className="linkedin-cover-viewport"
        sx={{
          width: "100%",
          overflow: "hidden",
          bgcolor: landing.ink,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: LINKEDIN_COVER_WIDTH * scale,
            height: LINKEDIN_COVER_HEIGHT * scale,
            position: "relative",
          }}
        >
          <LinkedInArticleCover scale={scale} />
        </Box>
      </Box>

      <Box
        id="linkedin-article-body"
        sx={{
          bgcolor: theme.palette.mode === "dark" ? "#0a1628" : landing.paper,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 5, md: 8 },
            pb: { xs: 6, md: 10 },
          }}
        >
          <LinkedInExploreHub />

          <Box component="section" id="artigo" sx={{ scrollMarginTop: 24 }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: ff,
                fontWeight: 700,
                fontSize: { xs: "1.5rem", md: "1.85rem" },
                lineHeight: 1.3,
                mb: 1.5,
                color: landing.text,
              }}
            >
              {LINKEDIN_ARTICLE.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 400,
                fontSize: "1.05rem",
                lineHeight: 1.55,
                color: landing.muted,
                mb: 4,
              }}
            >
              {LINKEDIN_ARTICLE.subtitle}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {LINKEDIN_ARTICLE_BODY.map((block) => (
              <Box key={block.id} component="section" sx={{ mb: 5 }}>
                {block.heading && (
                  <Typography
                    component="h2"
                    sx={{
                      fontFamily: ff,
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      mb: 2,
                      color: landing.navy,
                    }}
                  >
                    {block.heading}
                  </Typography>
                )}

                {block.sections.map((section, idx) => {
                  if (section.type === "paragraphs") {
                    return (
                      <Box key={idx}>
                        {section.paragraphs.map((p, pi) => (
                          <Typography
                            key={pi}
                            paragraph
                            sx={{
                              fontFamily: ff,
                              fontSize: "1.02rem",
                              lineHeight: 1.75,
                              color: landing.text,
                              mb: 2,
                            }}
                          >
                            {p}
                          </Typography>
                        ))}
                      </Box>
                    );
                  }

                  return (
                    <Box key={idx}>
                      {section.paragraphs.map((p, pi) => (
                        <Typography
                          key={pi}
                          paragraph
                          sx={{
                            fontFamily: ff,
                            fontSize: "1.02rem",
                            lineHeight: 1.75,
                            color: landing.text,
                            mb: 2,
                          }}
                        >
                          {p}
                        </Typography>
                      ))}
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontFamily: ff,
                          color: "text.secondary",
                          mb: 0.75,
                        }}
                      >
                        {section.legend}
                      </Typography>
                      <LinkedInShowcase id={section.showcaseId} />
                    </Box>
                  );
                })}
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            <Box component="section">
              <Typography
                component="h2"
                sx={{ fontFamily: ff, fontWeight: 700, fontSize: "1.2rem", mb: 2, color: landing.navy }}
              >
                Repositório e exploração
              </Typography>
              <LinkedInShowcase id="opensource-hub" />
              <Typography paragraph sx={{ fontFamily: ff, fontSize: "1.02rem", lineHeight: 1.75, mt: 2 }}>
                <strong>Código:</strong>{" "}
                <Link href={LINKEDIN_ARTICLE.repoUrl} target="_blank" rel="noopener noreferrer">
                  {LINKEDIN_ARTICLE.repoUrl}
                </Link>
              </Typography>
              <Typography paragraph sx={{ fontFamily: ff, fontSize: "1.02rem", lineHeight: 1.75 }}>
                <strong>Ambiente explorável:</strong>{" "}
                <Link href={LINKEDIN_ARTICLE.demoUrl} target="_blank" rel="noopener noreferrer">
                  {LINKEDIN_ARTICLE.demoUrl}
                </Link>
              </Typography>
              <Typography sx={{ fontFamily: ff, fontSize: "1.02rem", lineHeight: 1.75, color: landing.muted }}>
                Sugestões, issues e PRs são bem-vindos. Disponível para conversar sobre implantação ou adaptação do
                código.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 5 }} />

          <LinkedInPostsSection />
        </Container>
      </Box>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .linkedin-cover-viewport {
            overflow: visible !important;
            page-break-after: always;
          }
          .linkedin-cover-root {
            transform: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
