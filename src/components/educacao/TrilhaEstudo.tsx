"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  CARTILHAS,
  EDU_DISCLAIMER,
  cartilhaPorId,
  modulosDaTrilha,
  opcoesParaExibir,
  personalizarItens,
  trilhaPorId,
} from "@/lib/educacao/catalogo";
import { QuizForm } from "./QuizForm";

type Estado = {
  nossaCasa: {
    orgao: string;
    dpoNome: string;
    dpoEmail: string;
    canal: string;
    processos: string[];
    riscos: string[];
    fornecedores: string[];
  };
  matriculas: Array<{
    trilha_id: string;
    status: string;
    progresso: number;
    reciclagemDevida: boolean;
    vence_em: string | null;
  }>;
  progresso: Array<{ trilha_id: string; modulo_id: string; aprovado: boolean; melhor_nota: number }>;
  leituras: Array<{ tipo: string; refId: string }>;
  certificados: Array<{ trilha_id: string; codigo: string }>;
};

export function TrilhaEstudo({
  programaId,
  trilhaId,
  moduloInicial,
}: {
  programaId: number;
  trilhaId: string;
  moduloInicial?: string;
}) {
  const trilha = trilhaPorId(trilhaId);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduloAberto, setModuloAberto] = useState(moduloInicial || "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/educacao`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao carregar");
      setEstado(json);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const acao = async (body: Record<string, unknown>) => {
    setErro(null);
    const res = await fetch(`/api/programas/${programaId}/educacao/progresso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trilhaId, ...body }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erro");
    await load();
  };

  if (!trilha) return <Alert severity="error">Trilha não encontrada.</Alert>;
  if (loading && !estado) return <CircularProgress size={28} />;

  const matricula = estado?.matriculas.find((m) => m.trilha_id === trilhaId);
  const nossaLida = estado?.leituras.some((l) => l.tipo === "nossa_casa" && l.refId === "bloco");
  const cert = estado?.certificados.find((c) => c.trilha_id === trilhaId);
  const casa = estado?.nossaCasa;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={800}>
          {trilha.titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {trilha.publico}. Nota mínima {trilha.notaMinima}%. Prazo de {trilha.prazoDias} dias. Reciclagem a
          cada {trilha.reciclagemMeses} meses.
        </Typography>
        {matricula && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip size="small" label={`${matricula.progresso}%`} />
            <Chip size="small" label={matricula.status} />
            {matricula.reciclagemDevida && <Chip size="small" color="warning" label="Reciclagem devida" />}
          </Stack>
        )}
      </Box>
      <Alert severity="info">{EDU_DISCLAIMER}</Alert>
      {erro && <Alert severity="error">{erro}</Alert>}

      {trilha.exigeNossaCasa && casa && (
        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
          <Typography fontWeight={800}>Nossa casa</Typography>
          <Typography variant="body2">
            Organização: {casa.orgao}. Encarregado: {casa.dpoNome}
            {casa.dpoEmail ? ` (${casa.dpoEmail})` : ""}. Canal do titular: {casa.canal}.
          </Typography>
          {casa.processos.length > 0 && (
            <Typography variant="body2">Processos no programa: {casa.processos.join("; ")}.</Typography>
          )}
          {casa.riscos.length > 0 && (
            <Typography variant="body2">Riscos em atenção: {casa.riscos.join("; ")}.</Typography>
          )}
          {casa.fornecedores.length > 0 && (
            <Typography variant="body2">Fornecedores: {casa.fornecedores.join(", ")}.</Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
            <Button
              size="small"
              variant={nossaLida ? "outlined" : "contained"}
              disabled={Boolean(nossaLida)}
              onClick={() => void acao({ acao: "ler_nossa_casa" }).catch((e) => setErro(String(e.message || e)))}
            >
              {nossaLida ? "Leitura registrada" : "Registrar que li"}
            </Button>
            <Button size="small" href={`/programas/${programaId}/politicas`}>
              Políticas publicadas
            </Button>
          </Stack>
        </Box>
      )}

      {modulosDaTrilha(trilhaId).map((modulo) => {
        const prog = estado?.progresso.find(
          (p) => p.trilha_id === trilhaId && p.modulo_id === modulo.id
        );
        const aberto = moduloAberto === modulo.id;
        return (
          <Box key={modulo.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700}>
                {modulo.ordem}. {modulo.titulo}
              </Typography>
              <Chip
                size="small"
                color={prog?.aprovado ? "success" : "default"}
                label={prog?.aprovado ? `Aprovado ${prog.melhor_nota}%` : "Pendente"}
              />
            </Stack>
            <Button size="small" onClick={() => setModuloAberto(aberto ? "" : modulo.id)}>
              {aberto ? "Fechar" : "Estudar"}
            </Button>
            {aberto && (
              <Stack spacing={1.2} sx={{ mt: 1 }}>
                {modulo.paragrafos.map((p) => (
                  <Typography key={p} variant="body2">
                    {p}
                  </Typography>
                ))}
                <QuizForm
                  perguntas={modulo.perguntas.map((p) => ({
                    id: p.id,
                    enunciado: p.enunciado,
                    opcoes: opcoesParaExibir(p),
                  }))}
                  endpoint={`/api/programas/${programaId}/educacao/progresso`}
                  corpoExtra={{ acao: "quiz", trilhaId, moduloId: modulo.id }}
                  onConcluido={() => void load()}
                />
              </Stack>
            )}
          </Box>
        );
      })}

      {trilha.cartilhaIds.map((id) => {
        const cartilha = cartilhaPorId(id);
        if (!cartilha) return null;
        const lida = estado?.leituras.some((l) => l.tipo === "cartilha" && l.refId === id);
        const itens = personalizarItens(cartilha.itens, {
          orgao: casa?.orgao,
          dpo: casa?.dpoNome,
          canal: casa?.canal,
        });
        return (
          <Box key={id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography fontWeight={700}>{cartilha.titulo}</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {itens.map((item) => (
                <li key={item}>
                  <Typography variant="body2">{item}</Typography>
                </li>
              ))}
            </Box>
            <Button
              size="small"
              sx={{ mt: 1 }}
              disabled={Boolean(lida)}
              onClick={() =>
                void acao({ acao: "ler_cartilha", cartilhaId: id }).catch((e) => setErro(String(e.message || e)))
              }
            >
              {lida ? "Cartilha lida" : "Marcar cartilha como lida"}
            </Button>
          </Box>
        );
      })}

      <Stack direction="row" spacing={1}>
        {cert && (
          <Button
            variant="contained"
            href={`/api/programas/${programaId}/educacao/certificado?trilha=${trilhaId}`}
          >
            Baixar certificado ({cert.codigo})
          </Button>
        )}
        {matricula?.reciclagemDevida && (
          <Button
            color="warning"
            onClick={() =>
              void acao({ acao: "iniciar_reciclagem" }).catch((e) => setErro(String(e.message || e)))
            }
          >
            Iniciar reciclagem
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Cartilhas do catálogo público: {CARTILHAS.length}. A conclusão da trilha exige os módulos e, quando
        pedido, a leitura de “Nossa casa”.
      </Typography>
    </Stack>
  );
}
