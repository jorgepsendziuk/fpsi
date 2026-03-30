"use client";

import { useState, useEffect } from "react";
import {
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
import { Badge as BadgeIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";

interface Cargo {
  id: number;
  nome: string;
  ativo: boolean | null;
}

export default function AdminCargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cargos")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setCargos(d) : []))
      .catch(() => setCargos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Cargos"
        icon={<BadgeIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Cargos institucionais disponíveis para perfis."
      />
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
              cargos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.nome}</TableCell>
                  <TableCell>{c.ativo ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && cargos.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Nenhum cargo encontrado.
        </Typography>
      )}
    </Container>
  );
}
