"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { PanoramaAccordionSection } from "@/components/diagnostico/panorama/PanoramaAccordionSection";
import { PanoramaSectionSubtitle } from "@/components/diagnostico/panorama/PanoramaSectionFormalSubtitle";
import { GLOSSARIO_PRIVACIDADE } from "@/components/diagnostico/panorama/panoramaGlossarioTerms";
import { getPanoramaSectionMeta } from "@/lib/panorama/panoramaSectionMeta";

const GLOSSARIO_META = getPanoramaSectionMeta("panorama-sec-glossario");

export default function PanoramaGlossario() {
  const titulo = GLOSSARIO_META?.titulo ?? "Glossário simplificado";
  const subtitulo = GLOSSARIO_META?.subtitulo ?? "Siglas e termos usados neste relatório";

  return (
    <PanoramaAccordionSection
      sectionId="panorama-sec-glossario"
      className="panorama-glossario panorama-text-left"
      accent="glossario"
      title={titulo}
      titleIcon={<MenuBookOutlinedIcon fontSize="inherit" />}
      subtitle={<PanoramaSectionSubtitle subtitulo={subtitulo} />}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            print: "1fr 1fr 1fr",
          },
          columnGap: { xs: 1.5, md: 2, print: 1 },
          rowGap: { xs: 0.75, md: 0.85, print: 0.35 },
        }}
      >
        {GLOSSARIO_PRIVACIDADE.map((item) => (
          <Typography
            key={item.termo}
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: { xs: 1.45, print: 1.3 },
              fontSize: { xs: "0.86rem", print: "8pt" },
            }}
          >
            <Box component="span" fontWeight={700} color="text.primary">
              {item.termo}
            </Box>
            {" — "}
            {item.definicao}
          </Typography>
        ))}
      </Box>
    </PanoramaAccordionSection>
  );
}