"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Typography, Card, CardContent, Grid, TextField, IconButton, Box } from "@mui/material";
import { Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function ProgramaDadosPage() {
  const params = useParams();
  const programaId = params.id;
  // Aqui você pode buscar os dados do programa pelo programaId
  // e implementar a edição dos campos conforme já fazia no accordion
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={4} align="center">
        Dados do Programa
      </Typography>
      {/* Implemente aqui o formulário de edição dos dados do programa */}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {/* Campos editáveis do programa */}
            <Grid item xs={12} sm={6}>
              <TextField label="Telefone de Atendimento" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email de Atendimento" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Site de Atendimento" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Início da Vigência da Política" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Prazo de Revisão da Política" fullWidth />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
} 