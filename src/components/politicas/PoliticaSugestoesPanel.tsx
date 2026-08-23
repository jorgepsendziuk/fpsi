"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { PoliticaSugestao } from "@/lib/politicas/politicaSugestoes";
import { inserirHtmlNaSecao } from "@/lib/politicas/politicaSugestoes";

type Props = {
  programaId: number;
  tipoPolitica: string;
  canEdit: boolean;
  sections: Array<{ id: number; texto?: string; secao?: string; titulo?: string }>;
  onApply: (sectionId: number, nextHtml: string) => void;
};

export function PoliticaSugestoesPanel({
  programaId,
  tipoPolitica,
  canEdit,
  sections,
  onApply,
}: Props) {
  const [items, setItems] = useState<PoliticaSugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(
      `/api/programas/${programaId}/politicas/sugestoes?tipo=${encodeURIComponent(tipoPolitica)}`
    )
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) throw new Error(j.error);
        setItems(j.sugestoes || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId, tipoPolitica]);

  const matchSection = (alvo: string) => {
    const needle = alvo.toLowerCase();
    const found = sections.find((s) =>
      `${s.secao || ""} ${s.titulo || ""}`.toLowerCase().includes(needle)
    );
    return found || sections[0];
  };

  const aplicar = (sug: PoliticaSugestao) => {
    const sec = matchSection(sug.secaoAlvo);
    if (!sec) return;
    if (!confirm(`Inserir “${sug.titulo}” na seção “${sec.titulo || sec.secao || sec.id}”?`)) return;
    const next = inserirHtmlNaSecao(String(sec.texto || ""), sug.html, true);
    onApply(sec.id, next);
  };

  if (loading) return <CircularProgress size={22} />;
  if (error) return <Alert severity="warning">{error}</Alert>;
  if (!items.length) {
    return (
      <Alert severity="info">
        Ainda não há cadastros (mapeamento, fornecedores, sistemas) para sugerir trechos nesta
        política.
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Sugerir a partir do sistema
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Blocos montados com mapeamento, ROPA, cadastro mestre e fornecedores. Nada é gravado até você
        confirmar.
      </Typography>
      <Stack spacing={1.5}>
        {items.map((sug) => (
          <Box key={sug.id} sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography fontWeight={600}>{sug.titulo}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Origem: {sug.origem}
            </Typography>
            <Box
              sx={{ typography: "body2", mt: 0.5, "& ul": { pl: 2 } }}
              dangerouslySetInnerHTML={{ __html: sug.html }}
            />
            {canEdit ? (
              <Button size="small" sx={{ mt: 0.5 }} onClick={() => aplicar(sug)}>
                Inserir nesta política
              </Button>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
