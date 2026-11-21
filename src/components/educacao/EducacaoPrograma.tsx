"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { EDU_DISCLAIMER, TRILHAS, perguntaDaSemana } from "@/lib/educacao/catalogo";
import { CulturaKitsPanel } from "./CulturaKitsPanel";

type Cobertura = {
  resumo: { total: number; concluidos: number; percentual: number };
  linhas: Array<{
    userId: string;
    nome: string;
    onboardingStatus: string;
    onboardingProgresso: number;
    onboardingConcluido: boolean;
    reciclagemDevida: boolean;
  }>;
  csv: string;
};

export function EducacaoPrograma({ routeParam }: { routeParam: string }) {
  const { programaId, loading, error } = useProgramaIdFromParam(routeParam);
  const search = useSearchParams();
  const abaInicial = search.get("aba") === "divulgar" || search.get("aba") === "acompanhar"
    ? search.get("aba")!
    : "aprender";
  const [aba, setAba] = useState(abaInicial);
  const [cobertura, setCobertura] = useState<Cobertura | null>(null);
  const [podeGerir, setPodeGerir] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [anexando, setAnexando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const cartilha = search.get("cartilha");

  const load = useCallback(async () => {
    if (!programaId) return;
    const res = await fetch(`/api/programas/${programaId}/educacao`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erro");
    setPodeGerir(Boolean(json.podeGerir));
    setCobertura(json.cobertura || null);
  }, [programaId]);

  useEffect(() => {
    if (!programaId) return;
    void load().catch((e) => setErro(e instanceof Error ? e.message : "Erro"));
  }, [programaId, load]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (!programaId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Programa não encontrado."}</Alert>
      </Container>
    );
  }

  const semana = perguntaDaSemana();
  const baixarCsv = () => {
    if (!cobertura) return;
    const blob = new Blob([cobertura.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cobertura-onboarding.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const anexar = async () => {
    setAnexando(true);
    setAviso(null);
    try {
      const res = await fetch(`/api/programas/${programaId}/educacao/cobertura`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setAviso(`Evidência #${json.evidencia?.id} vinculada ao Controle 14.`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setAnexando(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeroHeader
        icon={<SchoolIcon />}
        title="Educação e treinamento"
        description="Minicurso, cartilhas e trilhas com certificado para colaboradores e gestores. A aba Divulgar reúne os kits de cultura deste programa (PPSI Controle 14)."
      />
      <Alert severity="info" sx={{ mb: 2 }}>
        {EDU_DISCLAIMER} Pergunta da semana: {semana.enunciado}
      </Alert>
      {cartilha && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Campanha aponta para a cartilha “{cartilha}”. Ela também está na{" "}
          <Link href="/educacao">academia pública</Link>.
        </Alert>
      )}
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}
      {aviso && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {aviso}
        </Alert>
      )}
      <Tabs value={aba} onChange={(_e, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab value="aprender" label="Aprender" />
        <Tab value="divulgar" label="Divulgar" />
        <Tab value="acompanhar" label="Acompanhar" />
      </Tabs>

      {aba === "aprender" && (
        <Stack spacing={1.2}>
          {TRILHAS.map((trilha) => (
            <Box key={trilha.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Typography fontWeight={700}>{trilha.titulo}</Typography>
              <Typography variant="body2" color="text.secondary">
                {trilha.publico}
                {trilha.obrigatoria ? " · obrigatória no onboarding" : ""}
              </Typography>
              <Button
                component={Link}
                href={`/programas/${routeParam}/educacao/trilha/${trilha.id}`}
                size="small"
                sx={{ mt: 1 }}
                variant={trilha.id === "onboarding" ? "contained" : "outlined"}
              >
                Abrir trilha
              </Button>
            </Box>
          ))}
          <Button component={Link} href="/educacao" size="small">
            Ver a academia pública
          </Button>
        </Stack>
      )}

      {aba === "divulgar" && <CulturaKitsPanel programaId={programaId} />}

      {aba === "acompanhar" && (
        <Stack spacing={2}>
          {!podeGerir && (
            <Alert severity="info">
              O painel de cobertura é de gestores, coordenadores e auditores. Sua trilha continua em Aprender.
            </Alert>
          )}
          {podeGerir && cobertura && (
            <>
              <Typography>
                Onboarding concluído: {cobertura.resumo.concluidos} de {cobertura.resumo.total} (
                {cobertura.resumo.percentual}%).
              </Typography>
              <Stack spacing={0.75}>
                {cobertura.linhas.map((linha) => (
                  <Typography key={linha.userId} variant="body2">
                    {linha.nome} — {linha.onboardingStatus}, {linha.onboardingProgresso}%
                    {linha.reciclagemDevida ? " · reciclagem devida" : ""}
                  </Typography>
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={baixarCsv}>
                  Baixar CSV
                </Button>
                <Button variant="contained" disabled={anexando} onClick={() => void anexar()}>
                  Anexar PDF ao Controle 14
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      )}
    </Container>
  );
}
