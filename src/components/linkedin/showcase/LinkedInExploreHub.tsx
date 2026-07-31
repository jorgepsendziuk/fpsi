"use client";

import { useCallback, useState } from "react";
import { Box, Chip, Typography, alpha, useTheme } from "@mui/material";
import { Montserrat } from "next/font/google";
import { landing } from "@/components/landing/landingTokens";
import { LinkedInShowcase } from "./LinkedInShowcase";
import { LINKEDIN_SHOWCASE_CATALOG, type LinkedInShowcaseId } from "./types";
import { LINKEDIN_ARTICLE } from "../linkedinArticleContent";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

/** Destaques interativos — vitrine publicável do FPSI. */
export function LinkedInExploreHub() {
  const theme = useTheme();
  const [active, setActive] = useState<LinkedInShowcaseId>("program-modules");

  const scrollToShowcase = useCallback((id: LinkedInShowcaseId) => {
    setActive(id);
    document.getElementById(`showcase-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <Box
      component="section"
      id="explorar"
      sx={{
        scrollMarginTop: 24,
        mb: 6,
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 4,
        background: `linear-gradient(145deg, ${alpha(landing.navy, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
        border: "1px solid",
        borderColor: alpha(landing.navy, 0.12),
      }}
    >
      <Typography
        component="h2"
        sx={{ fontFamily: ff, fontWeight: 800, fontSize: { xs: "1.35rem", md: "1.65rem" }, color: landing.navy, mb: 0.5 }}
      >
        Explore o sistema — ao vivo
      </Typography>
      <Typography sx={{ fontFamily: ff, fontSize: "0.95rem", color: landing.muted, mb: 2.5, lineHeight: 1.55, maxWidth: 640 }}>
        Prévias interativas dos módulos reais. Compartilhe{" "}
        <Box component="span" sx={{ fontWeight: 700, color: landing.text }}>
          fpsi.com.br/linkedin
        </Box>{" "}
        como referência — ou entre na{" "}
        <Box component="a" href={LINKEDIN_ARTICLE.demoUrl} sx={{ color: "primary.main", fontWeight: 600 }}>
          demo
        </Box>
        .
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
        {LINKEDIN_SHOWCASE_CATALOG.map((s) => (
          <Chip
            key={s.id}
            component="button"
            label={s.label}
            onClick={() => scrollToShowcase(s.id)}
            variant={active === s.id ? "filled" : "outlined"}
            color={active === s.id ? "primary" : "default"}
            size="small"
            sx={{ fontFamily: ff, cursor: "pointer", fontWeight: active === s.id ? 700 : 500 }}
          />
        ))}
      </Box>

      <Box id={`showcase-${active}`}>
        <LinkedInShowcase id={active} />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, fontFamily: ff }}>
        Troque de módulo nos chips acima. Matriz de riscos aceita clique; IA e portal animam como na landing.
      </Typography>
    </Box>
  );
}
