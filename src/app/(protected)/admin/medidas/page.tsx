"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Checklist as ChecklistIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";

interface Medida {
  id: number;
  id_medida: string | null;
  id_controle: number | null;
  medida: string | null;
  descricao: string | null;
}

export default function AdminMedidasPage() {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [controles, setControles] = useState<{ id: number; nome: string }[]>([]);
  const [controleFilter, setControleFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/controles")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setControles(d) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = controleFilter ? `/api/admin/medidas?controle_id=${controleFilter}` : "/api/admin/medidas";
    fetch(url)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setMedidas(d) : []))
      .catch(() => setMedidas([]))
      .finally(() => setLoading(false));
  }, [controleFilter]);

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Medidas"
        icon={<ChecklistIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Medidas por controle (perguntas, descrições, id_cisv8)."
      />
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Controle</InputLabel>
          <Select
            value={controleFilter}
            label="Controle"
            onChange={(e) => setControleFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {controles.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.nome || `Controle ${c.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>ID Medida</TableCell>
              <TableCell>Controle</TableCell>
              <TableCell>Medida</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : (
              medidas.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.id_medida ?? "-"}</TableCell>
                  <TableCell>{m.id_controle ?? "-"}</TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>{(m.medida || "").slice(0, 80)}{(m.medida && m.medida.length > 80) ? "..." : ""}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && medidas.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Nenhuma medida encontrada.
        </Typography>
      )}
    </Container>
  );
}
