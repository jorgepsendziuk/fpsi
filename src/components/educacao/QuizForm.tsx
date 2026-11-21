"use client";

import { useState } from "react";
import { Alert, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";

type Pergunta = { id: string; enunciado: string; opcoes: string[] };

type Resultado = {
  nota: number;
  aprovado: boolean;
  acertos: number;
  total: number;
  itens: { id: string; ok: boolean; correta: string }[];
};

export function QuizForm({
  perguntas,
  endpoint,
  corpoExtra,
  onConcluido,
}: {
  perguntas: Pergunta[];
  endpoint: string;
  corpoExtra?: Record<string, unknown>;
  onConcluido?: (resultado: Resultado) => void;
}) {
  const [marcadas, setMarcadas] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      const respostas = perguntas.map((p) => marcadas[p.id] ?? -1);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(corpoExtra || {}), respostas }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível corrigir");
      const data = (json.resultado || json) as Resultado;
      setResultado(data);
      onConcluido?.(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Stack spacing={2}>
      {perguntas.map((p, idx) => {
        const item = resultado?.itens.find((i) => i.id === p.id);
        return (
          <div key={p.id}>
            <Typography fontWeight={700}>
              {idx + 1}. {p.enunciado}
            </Typography>
            <RadioGroup
              value={marcadas[p.id] ?? ""}
              onChange={(e) => setMarcadas((atual) => ({ ...atual, [p.id]: Number(e.target.value) }))}
            >
              {p.opcoes.map((opcao, i) => (
                <FormControlLabel key={opcao} value={i} control={<Radio size="small" />} label={opcao} />
              ))}
            </RadioGroup>
            {item && (
              <Typography variant="body2" color={item.ok ? "success.main" : "warning.main"}>
                {item.ok ? "Certo." : `A referência desta questão é: ${item.correta}`}
              </Typography>
            )}
          </div>
        );
      })}
      {erro && <Alert severity="error">{erro}</Alert>}
      {resultado && (
        <Alert severity={resultado.aprovado ? "success" : "warning"}>
          Nota {resultado.nota}% ({resultado.acertos}/{resultado.total}).{" "}
          {resultado.aprovado ? "Módulo aprovado." : "Abaixo da nota mínima. Você pode tentar de novo."}
        </Alert>
      )}
      <Button variant="contained" disabled={enviando} onClick={() => void enviar()} sx={{ alignSelf: "flex-start" }}>
        {enviando ? "Corrigindo…" : "Enviar respostas"}
      </Button>
    </Stack>
  );
}
