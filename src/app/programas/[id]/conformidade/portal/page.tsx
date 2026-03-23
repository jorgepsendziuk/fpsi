"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Box, Breadcrumbs, Link, Grid, Avatar } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Public as PublicIcon } from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { ConformidadeHubCard, PORTAL_SECTIONS } from "../ConformidadeHubCard";

export default function PortalPrivacidadeHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const [programa, setPrograma] = React.useState<{ nome?: string; nome_fantasia?: string; razao_social?: string } | null>(
    null
  );

  React.useEffect(() => {
    dataService.fetchProgramaByIdOrSlug(idOrSlug).then(setPrograma).catch(() => setPrograma(null));
  }, [idOrSlug]);

  const programaName = programa?.nome || programa?.nome_fantasia || programa?.razao_social || `Programa`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            href="/dashboard"
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              router.push("/dashboard");
            }}
          >
            <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" />
            Programas
          </Link>
          <Link
            href={`/programas/${idOrSlug}`}
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/programas/${idOrSlug}`);
            }}
          >
            {programaName}
          </Link>
          <Typography color="text.primary">Portal de privacidade</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)`,
            }}
          >
            <PublicIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Portal de privacidade
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Canais do site público do programa — titulares, reportes e contato
            </Typography>
          </Box>
        </Box>
      </Box>

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
