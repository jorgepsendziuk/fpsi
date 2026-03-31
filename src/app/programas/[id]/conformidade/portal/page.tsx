"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Grid } from "@mui/material";
import { Public as PublicIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { ConformidadeHubCard, PORTAL_SECTIONS } from "../ConformidadeHubCard";
import { PortalPrivacidadePublicLinkCard } from "@/components/conformidade/PortalPrivacidadePublicLinkCard";

export default function PortalPrivacidadeHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId } = useProgramaIdFromParam(idOrSlug);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title="Titulares e canais públicos"
        icon={<PublicIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Gestão interna do que chega pelo site público (pedidos, reportes, contato) e link para o portal de privacidade."
      />
      <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mb: 2 }} />
      <PortalPrivacidadePublicLinkCard idOrSlug={idOrSlug} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: "md" }}>
        O que chega pelo portal público: exercício de direitos do titular (art. 18 LGPD), reportes e mensagens do formulário
        de contato.
      </Typography>

      <Grid container spacing={2}>
        {PORTAL_SECTIONS.map((section) => (
          <ConformidadeHubCard key={section.key} section={section} idOrSlug={idOrSlug} router={router} />
        ))}
      </Grid>
    </Container>
  );
}
