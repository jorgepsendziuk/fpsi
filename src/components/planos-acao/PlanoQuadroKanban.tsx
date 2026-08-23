"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { agruparQuadro, QUADRO_COLUNAS, type PlanoQuadroItem } from "@/lib/consultoria/planoQuadro";

export function PlanoQuadroKanban({ programaId }: { programaId: number }) {
  const [planos, setPlanos] = useState<PlanoQuadroItem[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/programas/${programaId}/planos`);
    const json = await res.json();
    const rows = (json.planos || []) as Array<Record<string, unknown>>;
    setPlanos(
      rows.map((r) => ({
        id: Number(r.id),
        titulo: String(r.titulo || ""),
        status: String(r.status || "nao_iniciado"),
        data_fim_prevista: (r.data_fim_prevista as string) || null,
        prioridade: (r.prioridade as string) || null,
      }))
    );
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const mover = async (id: number, status: string) => {
    setBusy(id);
    await fetch(`/api/programas/${programaId}/planos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setBusy(null);
  };

  const groups = agruparQuadro(planos);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Quadro do plano (consultoria)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Arraste o status das ações — sem apontamento de horas. Itens com prazo vencido caem em Atrasado.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gap: 1.5,
        }}
      >
        {QUADRO_COLUNAS.map((col) => (
          <Box key={col.id} sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1, minHeight: 120 }}>
            <Typography variant="caption" fontWeight={700}>
              {col.label} ({groups[col.id].length})
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {groups[col.id].map((p) => (
                <Box
                  key={p.id}
                  sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {p.titulo}
                  </Typography>
                  {p.data_fim_prevista ? (
                    <Typography variant="caption" color="text.secondary">
                      até {p.data_fim_prevista}
                    </Typography>
                  ) : null}
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {col.id !== "a_fazer" ? (
                      <Chip
                        size="small"
                        label="A fazer"
                        disabled={busy === p.id}
                        onClick={() => void mover(p.id, "nao_iniciado")}
                      />
                    ) : null}
                    {col.id !== "andamento" ? (
                      <Chip
                        size="small"
                        label="Andamento"
                        disabled={busy === p.id}
                        onClick={() => void mover(p.id, "em_andamento")}
                      />
                    ) : null}
                    {col.id !== "concluido" ? (
                      <Chip
                        size="small"
                        label="Concluir"
                        color="success"
                        disabled={busy === p.id}
                        onClick={() => void mover(p.id, "concluido")}
                      />
                    ) : null}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
