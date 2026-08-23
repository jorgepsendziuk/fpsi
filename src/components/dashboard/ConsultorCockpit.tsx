"use client";

import React from "react";
import Link from "next/link";
import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import type { DashboardProgramaResumo } from "@/lib/types/pendencias";

/** Visão transversal do consultor DPO (vários programas = vários clientes). */
export function ConsultorCockpit({ programas }: { programas: DashboardProgramaResumo[] }) {
  if (!programas.length) return null;
  const atrasados = programas.filter((p) => (p.pendenciasAtrasadas || 0) > 0);
  const criticos = programas.filter((p) => (p.riscosCriticos || 0) > 0 || (p.incidentesAbertos || 0) > 0);

  return (
    <Alert severity="info" icon={false} sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Cockpit do consultor (DPO as a service)
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Um programa = um cliente. Abaixo, prazos e incidentes em todos os programas em que você atua —
        sem timesheet nem faturamento.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={`${programas.length} programas`} />
        <Chip
          size="small"
          color={atrasados.length ? "warning" : "default"}
          label={`${atrasados.length} com pendência atrasada`}
        />
        <Chip
          size="small"
          color={criticos.length ? "error" : "default"}
          label={`${criticos.length} com risco/incidente aberto`}
        />
      </Stack>
      <Box component="ul" sx={{ m: 0, mt: 1, pl: 2 }}>
        {programas.slice(0, 8).map((p) => (
          <li key={p.programaId}>
            <Typography variant="body2">
              <Link href={`/programas/${p.slug || p.programaId}`}>
                {p.nome}
              </Link>
              {` · ${p.pendenciasTotal} pendências`}
              {p.dsarAbertos ? ` · ${p.dsarAbertos} DSAR` : ""}
              {p.incidentesAbertos ? ` · ${p.incidentesAbertos} incidentes` : ""}
              {p.riscosCriticos ? ` · ${p.riscosCriticos} riscos altos` : ""}
            </Typography>
          </li>
        ))}
      </Box>
    </Alert>
  );
}
