"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Box, Breadcrumbs, Link, Grid, Avatar } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Gavel as GavelIcon } from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { ConformidadeHubCard, TRATAMENTO_SECTIONS } from "./ConformidadeHubCard";

export default function ConformidadeTratamentoHubPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId } = useProgramaIdFromParam(idOrSlug);
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
          <Typography color="text.primary">Tratamento de dados e riscos</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)`,
            }}
          >
            <GavelIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Conformidade LGPD — ROPA, RIPD e incidentes
            </Typography>
          </Box>
        </Box>
        <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mt: 1 }} />
      </Box>

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
