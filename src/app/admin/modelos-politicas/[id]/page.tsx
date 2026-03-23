"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Skeleton,
  alpha,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import Link from "next/link";
import { useParams } from "next/navigation";
import SectionDisplay from "@/app/programas/[id]/politicas/[politicaId]/components/SectionDisplay";
import type { PoliticaModelo, PoliticaSecao } from "@/lib/types/admin";

export default function AdminModeloPoliticaEditPage() {
  const params = useParams();
  const id = params.id as string;
  const [modelo, setModelo] = useState<PoliticaModelo | null>(null);
  const [sections, setSections] = useState<PoliticaSecao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadModelo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/politica-modelo/${id}`);
      if (!res.ok) throw new Error("Modelo não encontrado");
      const data = await res.json();
      setModelo(data);
      setSections(Array.isArray(data.secoes) ? data.secoes : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadModelo();
  }, [loadModelo]);

  const handleSectionTextChange = (sectionId: number, text: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, texto: text } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/politica-modelo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secoes: sections }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (error && !modelo) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{error}</Alert>
        <Button component={Link} href="/admin/modelos-politicas" sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              component={Link}
              href="/admin/modelos-politicas"
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Voltar
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: modelo?.cor || "#2196F3", mb: 1 }}
              >
                Editar Modelo: {modelo?.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {modelo?.descricao}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Modelo salvo com sucesso.
            </Alert>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        {sections.map((section) => (
          <SectionDisplay
            key={section.id}
            section={{
              id: section.id,
              secao: section.secao,
              titulo: section.titulo,
              descricao: section.descricao ?? "",
              texto: section.texto ?? "",
            }}
            onTextChange={handleSectionTextChange}
            nomeFantasia=""
            politicaCor={modelo?.cor || "#2196F3"}
          />
        ))}
      </Paper>
    </Container>
  );
}
