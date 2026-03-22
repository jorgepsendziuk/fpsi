"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  useTheme,
  alpha,
  Skeleton,
  Chip,
} from "@mui/material";
import { Policy as PolicyIcon, Edit as EditIcon } from "@mui/icons-material";
import Link from "next/link";
import type { PoliticaModelo } from "@/lib/types/admin";

export default function AdminModelosPoliticasPage() {
  const theme = useTheme();
  const [modelos, setModelos] = useState<PoliticaModelo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/politica-modelo")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setModelos(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Modelos de Políticas
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Modelos de Políticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Edite os templates de políticas que serão usados ao criar políticas nos programas.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {modelos.map((m) => (
          <Grid item xs={12} sm={6} md={4} key={m.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: `2px solid ${alpha(m.cor || "#2196F3", 0.2)}`,
                "&:hover": { borderColor: alpha(m.cor || "#2196F3", 0.5) },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha(m.cor || "#2196F3", 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: m.cor || "#2196F3",
                    mb: 1,
                  }}
                >
                  <PolicyIcon />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {m.nome}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {m.descricao}
                </Typography>
                <Chip
                  label={m.ativo ? "Ativo" : "Inativo"}
                  size="small"
                  color={m.ativo ? "success" : "default"}
                  variant="outlined"
                />
                {Array.isArray(m.secoes) && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {m.secoes.length} seções
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  href={`/admin/modelos-politicas/${m.id}`}
                  startIcon={<EditIcon />}
                  sx={{ color: m.cor || "#2196F3" }}
                >
                  Editar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {modelos.length === 0 && !loading && (
        <Typography color="text.secondary">Nenhum modelo de política encontrado.</Typography>
      )}
    </Container>
  );
}
