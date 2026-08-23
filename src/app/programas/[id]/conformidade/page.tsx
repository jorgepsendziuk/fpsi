"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Grid, Typography } from "@mui/material";
import { Gavel as GavelIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { RequisitoIaLabel } from "@/components/aigp/RequisitoIaLabel";
import { ConformidadeHubCard, TRATAMENTO_SECTIONS, AIGP_SECTIONS } from "./ConformidadeHubCard";
import { useProgramaEscopoFromRoute } from "@/hooks/useProgramaEscopoFromRoute";
import { HUB_SECTION_MODULO_MAP, isModuloAtivo, ativarModulo, detectPresetFromEscopo } from "@/lib/programa/perfilEscopo";
import * as dataService from "@/lib/services/dataService";

function isSectionOutOfScope(sectionKey: string, escopo: ReturnType<typeof useProgramaEscopoFromRoute>["escopo"]) {
  const modKey = HUB_SECTION_MODULO_MAP[sectionKey];
  return Boolean(modKey && !isModuloAtivo(escopo, modKey));
}

export default function ConformidadeTratamentoHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { escopo, programaId, canEdit, refresh } = useProgramaEscopoFromRoute();

  const handleAtivar = async (sectionKey: string) => {
    const modKey = HUB_SECTION_MODULO_MAP[sectionKey];
    if (!modKey || !programaId) return;
    const next = ativarModulo(escopo, modKey);
    await dataService.updateProgramaEscopo(programaId, {
      escopo: next,
      perfil_escopo: detectPresetFromEscopo(next),
    });
    refresh();
  };

  const tratamentoSections = useMemo(
    () =>
      TRATAMENTO_SECTIONS.map((s) => ({
        section: s,
        outOfScope: isSectionOutOfScope(s.key, escopo),
      })),
    [escopo]
  );

  const aigpSections = useMemo(
    () =>
      AIGP_SECTIONS.map((s) => ({
        section: s,
        outOfScope: isSectionOutOfScope(s.key, escopo),
      })),
    [escopo]
  );

  return (
    <Box
      sx={{
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

      <Grid container spacing={1.5} sx={{ alignContent: "flex-start" }}>
        {tratamentoSections.map(({ section, outOfScope }) => (
          <ConformidadeHubCard
            key={section.key}
            section={section}
            idOrSlug={idOrSlug}
            router={router}
            dense
            outOfScope={outOfScope}
            onEnable={canEdit && outOfScope ? () => handleAtivar(section.key) : undefined}
          />
        ))}
      </Grid>

      <RequisitoIaLabel variant="section" sx={{ mt: 2.5, mb: 1 }}>
        Governança de IA
      </RequisitoIaLabel>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
        Módulos AIGP integrados ao hub de conformidade.
      </Typography>
      <Grid container spacing={1.5} sx={{ alignContent: "flex-start" }}>
        {aigpSections.map(({ section, outOfScope }) => (
          <ConformidadeHubCard
            key={section.key}
            section={section}
            idOrSlug={idOrSlug}
            router={router}
            dense
            outOfScope={outOfScope}
            onEnable={canEdit && outOfScope ? () => handleAtivar(section.key) : undefined}
          />
        ))}
      </Grid>
    </Box>
  );
}
