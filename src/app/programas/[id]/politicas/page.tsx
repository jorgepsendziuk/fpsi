"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Card, CardContent, Button, Box } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";

export default function ProgramaPoliticasPage() {
  const params = useParams();
  const router = useRouter();
  const programaId = params.id;
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={4} align="center">
        Políticas de Segurança
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SecurityIcon />}
              onClick={() => router.push(`/politica/protecao_dados_pessoais?programaId=${programaId}`)}
              sx={{ py: 2, borderRadius: 2, minWidth: 300 }}
            >
              Política de Proteção de Dados Pessoais
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 