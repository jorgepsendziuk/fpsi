"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Grid } from "@mui/material";
import { Public as PublicIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { ConformidadeHubCard, PORTAL_SECTIONS } from "../ConformidadeHubCard";
import { PortalPrivacidadePublicLinkCard } from "@/components/conformidade/PortalPrivacidadePublicLinkCard";

export default function PortalPrivacidadeHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  useProgramaIdFromParam(idOrSlug);

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
        title="Titulares e canais públicos"
        icon={<PublicIcon sx={{ fontSize: 26 }} aria-hidden />}
        description="Pedidos, reportes e contato do portal — e o link do site público."
        sx={{ mb: 1.25 }}
      />

      <Box sx={{ mb: 1.25, flexShrink: 0 }}>
        <PortalPrivacidadePublicLinkCard idOrSlug={idOrSlug} />
      </Box>

      <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0, alignContent: "flex-start" }}>
        {PORTAL_SECTIONS.map((section) => (
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
