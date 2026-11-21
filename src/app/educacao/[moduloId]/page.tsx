"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { EDU_DISCLAIMER, moduloPorId, opcoesParaExibir } from "@/lib/educacao/catalogo";
import { EducacaoShell } from "@/components/educacao/EducacaoShell";
import { QuizForm } from "@/components/educacao/QuizForm";

export default function ModuloPublicoPage() {
  const params = useParams();
  const modulo = moduloPorId(String(params?.moduloId || ""));
  if (!modulo || !modulo.previewPublico) {
    return (
      <EducacaoShell titulo="Academia LGPD">
        <Alert severity="info" sx={{ mb: 2 }}>
          Este módulo abre dentro do programa, para colaboradores e gestores convidados.
        </Alert>
        <Button component={Link} href="/educacao">
          Voltar à academia
        </Button>
      </EducacaoShell>
    );
  }

  return (
    <EducacaoShell titulo="Academia LGPD">
      <Button component={Link} href="/educacao" size="small" sx={{ mb: 2 }}>
        Todos os módulos
      </Button>
      <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
        {modulo.titulo}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {modulo.minutos} min · {modulo.artigos.join(" · ")}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        {EDU_DISCLAIMER}
      </Alert>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {modulo.paragrafos.map((p) => (
          <Typography key={p}>{p}</Typography>
        ))}
      </Stack>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Quiz
      </Typography>
      <QuizForm
        perguntas={modulo.perguntas.map((p) => ({
          id: p.id,
          enunciado: p.enunciado,
          opcoes: opcoesParaExibir(p),
        }))}
        endpoint="/api/educacao/corrigir"
        corpoExtra={{ moduloId: modulo.id }}
      />
    </EducacaoShell>
  );
}
