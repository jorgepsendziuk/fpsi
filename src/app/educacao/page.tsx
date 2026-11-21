"use client";

import Link from "next/link";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import {
  CARTILHAS,
  CENARIOS,
  EDU_DISCLAIMER,
  GLOSSARIO,
  MODULOS,
  TRILHAS,
  perguntaDaSemana,
} from "@/lib/educacao/catalogo";
import { EducacaoShell } from "@/components/educacao/EducacaoShell";

export default function EducacaoPublicaPage() {
  const semana = perguntaDaSemana();
  return (
    <EducacaoShell titulo="Academia LGPD">
      <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
        Minicurso e cartilhas de privacidade
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Aberto para qualquer pessoa. Colaboradores e gestores concluem as trilhas dentro do programa de
        privacidade da organização, com registro e certificado.
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        {EDU_DISCLAIMER}
      </Alert>

      <Typography variant="h5" component="h2" fontWeight={800} gutterBottom>
        Minicurso
      </Typography>
      <Stack spacing={1.2} sx={{ mb: 4 }}>
        {MODULOS.map((modulo) => (
          <Box key={modulo.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
                {modulo.ordem}. {modulo.titulo}
              </Typography>
              <Chip size="small" label={`${modulo.minutos} min`} />
              {modulo.previewPublico ? (
                <Button component={Link} href={`/educacao/${modulo.id}`} size="small" variant="contained">
                  Ler
                </Button>
              ) : (
                <Chip size="small" variant="outlined" label="No programa" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {modulo.resumo}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant="h5" component="h2" fontWeight={800} gutterBottom>
        Cartilhas
      </Typography>
      <Stack spacing={1.2} sx={{ mb: 4 }}>
        {CARTILHAS.map((cartilha) => (
          <Box key={cartilha.id} id={cartilha.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography fontWeight={700}>{cartilha.titulo}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {cartilha.publico}. {cartilha.resumo}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {cartilha.itens.map((item) => (
                <li key={item}>
                  <Typography variant="body2">{item}</Typography>
                </li>
              ))}
            </Box>
          </Box>
        ))}
      </Stack>

      <Typography variant="h5" component="h2" fontWeight={800} gutterBottom>
        Laboratório de cenários
      </Typography>
      <Stack spacing={1.2} sx={{ mb: 4 }}>
        {CENARIOS.map((c) => (
          <Box key={c.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography fontWeight={700}>{c.titulo}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {c.situacao}
            </Typography>
            <Typography variant="body2">
              Conduta esperada: {c.recomendado}. Referência: {c.artigos.join(", ")}.
            </Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant="h5" component="h2" fontWeight={800} gutterBottom>
        Glossário
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        {GLOSSARIO.map((g) => (
          <Typography key={g.termo} variant="body2">
            <strong>{g.termo}.</strong> {g.definicao}
          </Typography>
        ))}
      </Stack>

      <Alert severity="warning" sx={{ mb: 2 }}>
        Pergunta da semana: {semana.enunciado} A resposta fica no módulo correspondente, depois que você envia o quiz.
      </Alert>

      <Typography variant="h6" fontWeight={800} gutterBottom>
        Trilhas usadas nos programas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {TRILHAS.map((t) => t.titulo).join(" · ")}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button component={Link} href="/register" variant="contained">
          Iniciar um programa
        </Button>
        <Button component={Link} href="/login" variant="outlined">
          Já tenho convite
        </Button>
      </Stack>
    </EducacaoShell>
  );
}
