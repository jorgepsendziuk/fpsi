"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Alert, Box, Button, CircularProgress, Container } from "@mui/material";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { TrilhaEstudo } from "@/components/educacao/TrilhaEstudo";

function TrilhaPageInner() {
  const params = useParams();
  const search = useSearchParams();
  const routeParam = String(params?.id || "");
  const trilhaId = String(params?.trilhaId || "");
  const { programaId, loading, error } = useProgramaIdFromParam(routeParam);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (!programaId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Programa não encontrado."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Button component={Link} href={`/programas/${routeParam}/educacao`} size="small" sx={{ mb: 2 }}>
        Todas as trilhas
      </Button>
      <TrilhaEstudo
        programaId={programaId}
        trilhaId={trilhaId}
        moduloInicial={search.get("modulo") || undefined}
      />
    </Container>
  );
}

export default function TrilhaEducacaoPage() {
  return (
    <Suspense fallback={null}>
      <TrilhaPageInner />
    </Suspense>
  );
}
