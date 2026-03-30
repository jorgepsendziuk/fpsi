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
import { Security as SecurityIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";

interface Controle {
  id: number;
  numero: number | null;
  nome: string | null;
  diagnostico: number | null;
}

export default function AdminControlesPage() {
  const [controles, setControles] = useState<Controle[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<{ id: number; descricao: string }[]>([]);
  const [diagnosticoFilter, setDiagnosticoFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/diagnosticos")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setDiagnosticos(d) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = diagnosticoFilter ? `/api/admin/controles?diagnostico_id=${diagnosticoFilter}` : "/api/admin/controles";
    fetch(url)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setControles(d) : []))
      .catch(() => setControles([]))
      .finally(() => setLoading(false));
  }, [diagnosticoFilter]);

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Controles"
        icon={<SecurityIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Controles do framework de segurança (nome, texto, por que implementar)."
      />
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Diagnóstico</InputLabel>
          <Select
            value={diagnosticoFilter}
            label="Diagnóstico"
            onChange={(e) => setDiagnosticoFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {diagnosticos.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.descricao || `Diagnóstico ${d.id}`}
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
              <TableCell>Número</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Diagnóstico</TableCell>
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
              controles.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.numero ?? "-"}</TableCell>
                  <TableCell>{c.nome ?? "-"}</TableCell>
                  <TableCell>{c.diagnostico ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && controles.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Nenhum controle encontrado.
        </Typography>
      )}
    </Container>
  );
}
