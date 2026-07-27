"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Container, Paper, Typography } from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { AigpReferenciaPanel } from "@/components/normas/AigpReferenciaPanel";

function AigpReferenciaContent() {
  const params = useSearchParams();
  const initialId = params.get("f");

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <PsychologyIcon color="primary" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Governança de IA · referências
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AIGP, ISO/IEC 42001, NIST AI RMF, OECD, EU AI Act, OWASP LLM e PPSI — consulta rápida com links
            oficiais.
          </Typography>
        </Box>
      </Box>
      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <AigpReferenciaPanel initialId={initialId} />
      </Paper>
    </Container>
  );
}

export default function AigpReferenciaPage() {
  return (
    <Suspense fallback={null}>
      <AigpReferenciaContent />
    </Suspense>
  );
}
