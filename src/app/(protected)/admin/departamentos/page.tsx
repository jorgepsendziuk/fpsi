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
} from "@mui/material";
import { Business as BusinessIcon } from "@mui/icons-material";

interface Departamento {
  id: number;
  nome: string;
  ativo: boolean | null;
}

export default function AdminDepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/departamentos")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setDepartamentos(d) : []))
      .catch(() => setDepartamentos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">
          Departamentos
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Ativo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : (
              departamentos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.nome}</TableCell>
                  <TableCell>{d.ativo ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && departamentos.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Nenhum departamento encontrado.
        </Typography>
      )}
    </Container>
  );
}
