"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import PoliticaStylePrintHeader from "@/components/diagnostico/relatorio/PoliticaStylePrintHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { useProgramaAccess } from "@/hooks/useProgramaAccess";
import * as dataService from "@/lib/services/dataService";
import type { PoliticaProgramaDados } from "@/lib/utils/politicaPlaceholders";
import { supabaseBrowserClient } from "@utils/supabase/client";

type Snapshot = {
  geradoEm?: string;
  programa?: { nome?: string };
  resumo?: {
    totalMedidas: number;
    respondidas: number;
    gaps: number;
    coberturaPct: number;
    riscosAbertos: number;
  };
  achados?: Array<{
    idMedida?: string;
    titulo?: string;
    controleNome?: string;
    score: number;
    criticidade: number;
    esforco: number;
    impacto: number;
  }>;
  evidencias?: Array<{ idMedida?: string; titulo?: string; justificativa?: string }>;
  riscos?: Array<{ titulo: string; probabilidade: string; impacto: string; status: string }>;
  planoPriorizado?: Array<{
    idMedida?: string;
    titulo?: string;
    score: number;
    criticidade: number;
    esforco: number;
    impacto: number;
  }>;
};

export default function RelatorioExecutivoPage() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const { isFull, loading: accessLoading } = useProgramaAccess(programaId ?? undefined);

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [narrativaResumo, setNarrativaResumo] = useState("");
  const [narrativaImpacto, setNarrativaImpacto] = useState("");
  const [programa, setPrograma] = useState<PoliticaProgramaDados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const [res, prog] = await Promise.all([
        fetch(`/api/programas/${programaId}/relatorio-executivo`),
        dataService.fetchProgramaById(programaId),
      ]);
      if (!res.ok) throw new Error((await res.json()).error || "Erro");
      const data = await res.json();
      setSnapshot((data.live || data.snapshot) as Snapshot);
      setNarrativaResumo(data.narrativa_resumo || "");
      setNarrativaImpacto(data.narrativa_impacto || "");
      setPrograma((prog as PoliticaProgramaDados) || null);
      if (prog && typeof prog === "object") {
        const encId = Number((prog as { encarregado_dados_pessoais?: number }).encarregado_dados_pessoais);
        if (Number.isFinite(encId) && encId > 0) {
          const { data: resp } = await supabaseBrowserClient
            .from("responsavel")
            .select("nome, email")
            .eq("id", encId)
            .maybeSingle();
          if (resp) {
            setPrograma({
              ...(prog as object),
              dpo_nome: resp.nome,
              dpo_email: resp.email,
            } as PoliticaProgramaDados);
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (refresh = true) => {
    if (!programaId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/relatorio-executivo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh,
          narrativa_resumo: narrativaResumo,
          narrativa_impacto: narrativaImpacto,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  if (idLoading || accessLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isFull) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Relatório executivo disponível apenas para gestores do programa.</Alert>
      </Box>
    );
  }

  const r = snapshot?.resumo;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }} className="rte-print">
      <Box className="no-print">
        <PageHeroHeader
          title="Relatório Técnico Executivo"
          description="Achados, evidências, riscos e plano priorizado para tomada de decisão"
        />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void save(true)}
            disabled={saving}
          >
            Atualizar snapshot
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} className="no-print">
          {error}
        </Alert>
      )}

      <PoliticaStylePrintHeader programa={programa} docTitle="Relatório Técnico Executivo" />

      {r && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resumo executivo
          </Typography>
          <Typography variant="body2" paragraph>
            Cobertura de respostas: <strong>{r.coberturaPct}%</strong> ({r.respondidas}/{r.totalMedidas}).
            Lacunas identificadas: <strong>{r.gaps}</strong>. Riscos em aberto:{" "}
            <strong>{r.riscosAbertos}</strong>.
          </Typography>
          <TextField
            className="no-print"
            label="Narrativa do resumo (editável)"
            value={narrativaResumo}
            onChange={(e) => setNarrativaResumo(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 1 }}
          />
          {narrativaResumo && (
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }} className="print-only-block">
              {narrativaResumo}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Achados priorizados
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Achado</TableCell>
              <TableCell>Controle</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">C</TableCell>
              <TableCell align="right">E</TableCell>
              <TableCell align="right">I</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(snapshot?.achados || []).slice(0, 15).map((a, i) => (
              <TableRow key={i}>
                <TableCell>{a.idMedida}</TableCell>
                <TableCell>{a.titulo}</TableCell>
                <TableCell>{a.controleNome}</TableCell>
                <TableCell align="right">{a.score}</TableCell>
                <TableCell align="right">{a.criticidade}</TableCell>
                <TableCell align="right">{a.esforco}</TableCell>
                <TableCell align="right">{a.impacto}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Evidências registradas
        </Typography>
        {(snapshot?.evidencias || []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma justificativa/evidência textual registrada ainda.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {(snapshot?.evidencias || []).slice(0, 10).map((e, i) => (
              <Box key={i}>
                <Typography variant="subtitle2">
                  {e.idMedida} — {e.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.justificativa}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Riscos identificados
        </Typography>
        {(snapshot?.riscos || []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum risco cadastrado no módulo de riscos.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>P</TableCell>
                <TableCell>I</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(snapshot?.riscos || []).map((risco, i) => (
                <TableRow key={i}>
                  <TableCell>{risco.titulo}</TableCell>
                  <TableCell>{risco.probabilidade}</TableCell>
                  <TableCell>{risco.impacto}</TableCell>
                  <TableCell>{risco.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Impacto potencial para o negócio
        </Typography>
        <TextField
          className="no-print"
          label="Narrativa de impacto (editável)"
          value={narrativaImpacto}
          onChange={(e) => setNarrativaImpacto(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          sx={{ mb: 1 }}
        />
        {narrativaImpacto ? (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {narrativaImpacto}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Lacunas de alta criticidade e riscos abertos indicam exposição regulatória e operacional.
            Priorize os itens do plano abaixo.
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Plano de ação priorizado (top 15)
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ação / medida</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">Criticidade</TableCell>
              <TableCell align="right">Esforço</TableCell>
              <TableCell align="right">Impacto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(snapshot?.planoPriorizado || []).map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.idMedida}</TableCell>
                <TableCell>{p.titulo}</TableCell>
                <TableCell align="right">{p.score}</TableCell>
                <TableCell align="right">{p.criticidade}</TableCell>
                <TableCell align="right">{p.esforco}</TableCell>
                <TableCell align="right">{p.impacto}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box className="no-print" sx={{ mb: 4 }}>
        <Button variant="contained" onClick={() => void save(false)} disabled={saving}>
          Salvar narrativas
        </Button>
      </Box>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
