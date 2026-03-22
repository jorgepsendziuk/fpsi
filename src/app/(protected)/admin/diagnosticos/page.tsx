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
import { Category as CategoryIcon } from "@mui/icons-material";

interface Diagnostico {
  id: number;
  descricao: string | null;
  cor: string | null;
  indice: string | null;
  maturidade: number | null;
}

export default function AdminDiagnosticosPage() {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/diagnosticos")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setDiagnosticos(d) : []))
      .catch(() => setDiagnosticos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <CategoryIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">
          Diagnósticos
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Cor</TableCell>
              <TableCell>Índice</TableCell>
              <TableCell>Maturidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : (
              diagnosticos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.descricao ?? "-"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {d.cor && <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: d.cor }} />}
                      {d.cor ?? "-"}
                    </Box>
                  </TableCell>
                  <TableCell>{d.indice ?? "-"}</TableCell>
                  <TableCell>{d.maturidade ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && diagnosticos.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Nenhum diagnóstico encontrado.
        </Typography>
      )}
    </Container>
  );
}
