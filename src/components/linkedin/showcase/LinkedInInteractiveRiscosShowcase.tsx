"use client";

import { useMemo, useState } from "react";
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from "@mui/material";
import { RiscoHeatmap, type RiscoHeatmapFilter } from "@/components/riscos/RiscoHeatmap";
import { LINKEDIN_DEMO_RISCOS } from "./demoRiscos";

const ff = "var(--font-brand), Montserrat, system-ui, sans-serif";

const CAT_LABEL: Record<string, string> = {
  privacidade: "Privacidade",
  seguranca: "Segurança",
  conformidade: "Conformidade",
  operacional: "Operacional",
  reputacional: "Reputacional",
  direitos_titulares: "Titulares",
};

export function LinkedInInteractiveRiscosShowcase() {
  const [filter, setFilter] = useState<RiscoHeatmapFilter>(null);

  const visible = useMemo(() => {
    if (!filter) return LINKEDIN_DEMO_RISCOS.filter((r) => r.status !== "mitigado" && r.status !== "encerrado");
    return LINKEDIN_DEMO_RISCOS.filter(
      (r) =>
        r.probabilidade === filter.probabilidade &&
        r.impacto === filter.impacto &&
        r.status !== "mitigado" &&
        r.status !== "encerrado"
    );
  }, [filter]);

  return (
    <Box>
      <Typography sx={{ fontFamily: ff, fontSize: "0.82rem", color: "text.secondary", mb: 1.5 }}>
        Clique numa célula da matriz para filtrar — mesmo componente da tela de riscos.
      </Typography>
      <RiscoHeatmap
        riscos={LINKEDIN_DEMO_RISCOS}
        selected={filter}
        onSelect={setFilter}
        embedded
        relaxed
        hideChrome
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5, mb: 1 }}>
        {filter ? (
          <>
            <Chip
              size="small"
              label={`Filtro: P${filter.probabilidade} × I${filter.impacto}`}
              onDelete={() => setFilter(null)}
              color="primary"
              variant="outlined"
            />
          </>
        ) : (
          <Chip size="small" label="Todos os riscos ativos" variant="outlined" />
        )}
      </Box>
      <Table size="small" sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Risco</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Cat.</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.slice(0, 4).map((r) => (
            <TableRow
              key={r.id}
              hover
              sx={{
                "&:last-child td": { border: 0 },
                bgcolor: filter ? alpha("#1565C0", 0.06) : undefined,
              }}
            >
              <TableCell sx={{ fontSize: "0.75rem", maxWidth: 200 }}>{r.titulo}</TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>{CAT_LABEL[r.categoria] ?? r.categoria}</TableCell>
              <TableCell sx={{ fontSize: "0.72rem" }}>{r.status.replace("_", " ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
