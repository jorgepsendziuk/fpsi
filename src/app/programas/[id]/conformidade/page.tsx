"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Grid } from "@mui/material";
import { Gavel as GavelIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { ConformidadeHubCard, TRATAMENTO_SECTIONS } from "./ConformidadeHubCard";

export default function ConformidadeTratamentoHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;

  return (
    <Box
      sx={{
        height: { md: "calc(100dvh - 64px)" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, md: 2 },
        maxWidth: 1100,
        mx: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <PageHeroHeader
        title="Tratamento de dados"
        icon={<GavelIcon sx={{ fontSize: 26 }} aria-hidden />}
        description="ROPA, RIPD, incidentes e vínculo com a gestão de riscos do programa."
        sx={{ mb: 1.25 }}
      />

      <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0, alignContent: "flex-start" }}>
        {TRATAMENTO_SECTIONS.map((section) => (
          <ConformidadeHubCard
            key={section.key}
            section={section}
            idOrSlug={idOrSlug}
            router={router}
            dense
          />
        ))}
      </Grid>
    </Box>
  );
}
