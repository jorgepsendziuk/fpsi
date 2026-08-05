"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type Item = {
  id: number;
  idMedida?: string;
  titulo?: string;
  controleNome?: string;
  score: number;
  criticidade: number;
  esforco: number;
  impacto: number;
  impacto_negocio: string;
  prioridade?: boolean;
  gap?: boolean;
};

export function PlanoPriorizadoPanel({ programaId }: { programaId: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyGaps, setOnlyGaps] = useState(true);
  const [quickWins, setQuickWins] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        onlyGaps: String(onlyGaps),
        quickWins: String(quickWins),
      });
      const res = await fetch(`/api/programas/${programaId}/planos-acao/priorizado?${qs}`);
      if (!res.ok) throw new Error((await res.json()).error || "Erro");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId, onlyGaps, quickWins]);

  useEffect(() => {
    void load();
  }, [load]);

  const setImpacto = async (id: number, impacto_negocio: string) => {
    await fetch(`/api/programas/${programaId}/planos-acao/priorizado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, impacto_negocio }),
    });
    await load();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Plano priorizado
        </Typography>
        <FormControlLabel
          control={<Switch checked={onlyGaps} onChange={(_, v) => setOnlyGaps(v)} />}
          label="Só lacunas"
        />
        <FormControlLabel
          control={<Switch checked={quickWins} onChange={(_, v) => setQuickWins(v)} />}
          label="Quick wins"
        />
        <Button size="small" onClick={() => void load()}>
          Atualizar
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Ranking por criticidade × impacto ÷ esforço (GI). Ajuste o impacto de negócio para refinar a ordem.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <CircularProgress size={28} />
      ) : items.length === 0 ? (
        <Alert severity="info">Nenhuma lacuna priorizada no momento.</Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Medida</TableCell>
              <TableCell>Controle</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">C</TableCell>
              <TableCell align="right">E</TableCell>
              <TableCell>Impacto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.slice(0, 40).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.idMedida}
                  {item.prioridade && <Chip size="small" label="★" sx={{ ml: 0.5 }} />}
                </TableCell>
                <TableCell>{item.titulo}</TableCell>
                <TableCell>{item.controleNome}</TableCell>
                <TableCell align="right">
                  <strong>{item.score}</strong>
                </TableCell>
                <TableCell align="right">{item.criticidade}</TableCell>
                <TableCell align="right">{item.esforco}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={item.impacto_negocio || "medio"}
                    onChange={(e) => void setImpacto(item.id, e.target.value)}
                  >
                    {["muito_baixo", "baixo", "medio", "alto", "muito_alto"].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
