"use client";

import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const mockRopa = [
  { operacao: "Cadastro de clientes", finalidade: "Gestão comercial", baseLegal: "Execução de contrato" },
  { operacao: "Envio de newsletter", finalidade: "Marketing", baseLegal: "Consentimento" },
];

export function ConformidadePreview() {
  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        ROPA (Registro de Operações)
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Operação</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Finalidade</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Base legal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRopa.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontSize: 11 }}>{row.operacao}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{row.finalidade}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{row.baseLegal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        RIPD, direitos dos titulares e incidentes
      </Typography>
    </Box>
  );
}
