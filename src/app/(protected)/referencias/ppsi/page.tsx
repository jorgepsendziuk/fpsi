"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Container, Paper, Typography } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import { PpsiReferenciaPanel } from "@/components/normas/PpsiReferenciaPanel";

function PpsiReferenciaContent() {
  const params = useSearchParams();
  const initialId = params.get("f");

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <SecurityIcon color="primary" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            PPSI · referências
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Programa de Privacidade e Segurança da Informação 2.0 — CIS, NIST, ISO, LGPD/ANPD e normas
            GSI/SGD, com links oficiais.
          </Typography>
        </Box>
      </Box>
      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <PpsiReferenciaPanel initialId={initialId} />
      </Paper>
    </Container>
  );
}

export default function PpsiReferenciaPage() {
  return (
    <Suspense fallback={null}>
      <PpsiReferenciaContent />
    </Suspense>
  );
}
