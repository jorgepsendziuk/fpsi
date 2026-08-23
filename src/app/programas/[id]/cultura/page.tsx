"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import type { CulturaKit } from "@/lib/cultura/culturaKits";
import { CULTURA_TRILHAS } from "@/lib/cultura/culturaKits";

export default function CulturaPage() {
  const params = useParams();
  const { programaId, loading: idLoading, error: idError } = useProgramaIdFromParam(String(params?.id || ""));
  const [trilha, setTrilha] = useState("onboarding");
  const [kits, setKits] = useState<CulturaKit[]>([]);
  const [orgao, setOrgao] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/programas/${programaId}/cultura?trilha=${encodeURIComponent(trilha)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setKits(json.kits || []);
      setOrgao(json.orgao || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId, trilha]);

  useEffect(() => {
    void load();
  }, [load]);

  const imprimir = (html: string, titulo: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><title>${titulo}</title><style>
        body{font-family:Georgia,serif;max-width:720px;margin:32px auto;padding:16px;color:#123}
        h1,h2{font-family:system-ui,sans-serif}
        section{page-break-after:always;min-height:60vh;border-bottom:1px solid #ccc;padding:24px 0}
        @media print{button{display:none}}
      </style></head><body>${html}</body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  const copiar = async (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    await navigator.clipboard.writeText(tmp.innerText || html);
  };

  if (idLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (!programaId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{idError || "Programa não encontrado."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeroHeader
        icon={<SchoolIcon />}
        title="Cultura de privacidade e SI"
        description="Material gerado com o nome da organização, o Encarregado, processos, riscos e fornecedores deste programa (PPSI Controle 14 / art. 41 §2º III da LGPD). Não é LMS: imprima, envie por e-mail ou anexe como evidência da medida 14.x."
      />
      <Alert severity="info" sx={{ mb: 2 }}>
        Trilhas prontas: onboarding, phishing, direitos do titular, incidente e terceiros. Os exemplos
        vêm dos cadastros reais{orgao ? ` de ${orgao}` : ""}.
      </Alert>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <FormControl size="small" sx={{ minWidth: 260, mb: 2 }}>
        <InputLabel>Trilha</InputLabel>
        <Select
          label="Trilha"
          value={trilha}
          onChange={(e) => setTrilha(String(e.target.value))}
        >
          {CULTURA_TRILHAS.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {kits.map((k) => (
            <Box key={k.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Typography fontWeight={700}>{k.titulo}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {k.descricao}
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  mb: 1,
                  "& h1": { fontSize: "1.2rem" },
                  "& h2": { fontSize: "1.05rem" },
                }}
                dangerouslySetInnerHTML={{ __html: k.html }}
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => imprimir(k.html, k.titulo)}>
                  Imprimir / PDF
                </Button>
                <Button size="small" onClick={() => void copiar(k.html)}>
                  Copiar texto
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
}
