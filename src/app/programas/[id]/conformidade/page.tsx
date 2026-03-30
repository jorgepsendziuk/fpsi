"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Grid } from "@mui/material";
import { Gavel as GavelIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { ConformidadeHubCard, TRATAMENTO_SECTIONS } from "./ConformidadeHubCard";

export default function ConformidadeTratamentoHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId } = useProgramaIdFromParam(idOrSlug);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title="Tratamento de dados e riscos"
        icon={<GavelIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Conformidade LGPD — ROPA, RIPD e incidentes."
      />
      <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: "md" }}>
        Registro de operações (ROPA), impacto (RIPD) e incidentes — documentação e gestão de risco no tratamento de dados
        pessoais.
      </Typography>

      <Grid container spacing={2}>
        {TRATAMENTO_SECTIONS.map((section) => (
          <ConformidadeHubCard key={section.key} section={section} idOrSlug={idOrSlug} router={router} />
        ))}
      </Grid>
    </Container>
  );
}
