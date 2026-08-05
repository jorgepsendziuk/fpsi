"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";

type Assignment = {
  id: number;
  status: string;
  due_at: string | null;
  scope: { controle_ids?: number[]; diagnostico_ids?: number[] };
  programa_area?: { id: number; nome: string; slug: string } | null;
};

export default function TarefasPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/questionarios`);
      if (!res.ok) throw new Error((await res.json()).error || "Erro");
      setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const markInProgress = async (id: number) => {
    if (!programaId) return;
    await fetch(`/api/programas/${programaId}/questionarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    });
    router.push(`/programas/${idOrSlug}/diagnostico`);
  };

  const markDone = async (id: number) => {
    if (!programaId) return;
    await fetch(`/api/programas/${programaId}/questionarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    await load();
  };

  if (idLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: "auto" }}>
      <PageHeroHeader
        title="Minhas tarefas"
        description="Questionários e pacotes do diagnóstico atribuídos a você"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <Alert severity="info">Nenhum questionário atribuído no momento.</Alert>
      ) : (
        <Stack spacing={2}>
          {items.map((a) => {
            const nControles = a.scope?.controle_ids?.length || 0;
            const pct =
              a.status === "done" ? 100 : a.status === "in_progress" ? 40 : 0;
            return (
              <Box
                key={a.id}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {a.programa_area?.nome
                      ? `Questionário: ${a.programa_area.nome}`
                      : "Questionário do diagnóstico"}
                  </Typography>
                  <Chip
                    size="small"
                    label={a.status}
                    color={
                      a.status === "done"
                        ? "success"
                        : a.status === "in_progress"
                          ? "info"
                          : "default"
                    }
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {nControles > 0
                    ? `${nControles} controles no pacote`
                    : "Escopo por eixos do diagnóstico"}
                  {a.due_at ? ` · Prazo ${new Date(a.due_at).toLocaleDateString("pt-BR")}` : ""}
                </Typography>
                <LinearProgress variant="determinate" value={pct} sx={{ mb: 1.5, height: 8, borderRadius: 1 }} />
                <Stack direction="row" spacing={1}>
                  {a.status !== "done" && (
                    <Button variant="contained" onClick={() => void markInProgress(a.id)}>
                      Responder
                    </Button>
                  )}
                  {a.status === "in_progress" && (
                    <Button variant="outlined" onClick={() => void markDone(a.id)}>
                      Marcar concluído
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
