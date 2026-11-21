"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { CulturaKit } from "@/lib/cultura/culturaKits";
import { CULTURA_TRILHAS } from "@/lib/cultura/culturaKits";

export function CulturaKitsPanel({ programaId }: { programaId: number }) {
  const [trilha, setTrilha] = useState("onboarding");
  const [kits, setKits] = useState<CulturaKit[]>([]);
  const [orgao, setOrgao] = useState("");
  const [lmsHref, setLmsHref] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/programas/${programaId}/cultura?trilha=${encodeURIComponent(trilha)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setKits(json.kits || []);
      setOrgao(json.orgao || "");
      setLmsHref(json.lmsHref || "");
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
      </style></head><body>${html}</body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Kits com os dados deste programa{orgao ? ` (${orgao})` : ""}. Use o link da trilha para o
        registro individual no LMS.
      </Alert>
      {lmsHref && (
        <Button href={lmsHref} variant="outlined" size="small" sx={{ mb: 2 }}>
          Abrir a trilha correspondente
        </Button>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <FormControl size="small" sx={{ minWidth: 260, mb: 2 }}>
        <InputLabel>Campanha</InputLabel>
        <Select label="Campanha" value={trilha} onChange={(e) => setTrilha(String(e.target.value))}>
          {CULTURA_TRILHAS.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? (
        <CircularProgress size={28} />
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
              <Button size="small" variant="outlined" onClick={() => imprimir(k.html, k.titulo)}>
                Imprimir / PDF
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
