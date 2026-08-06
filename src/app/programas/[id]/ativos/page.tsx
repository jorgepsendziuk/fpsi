"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Tab,
  Tabs,
  TextField,
  Typography,
  Stack,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "next/navigation";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

type AtivoRow = {
  id: number;
  nome: string;
  [key: string]: unknown;
};

type Bundle = {
  unidades: AtivoRow[];
  processos: AtivoRow[];
  sistemas: AtivoRow[];
  fornecedores: AtivoRow[];
};

const TABS = [
  { key: "unidades" as const, label: "Unidades" },
  { key: "processos" as const, label: "Processos" },
  { key: "sistemas" as const, label: "Sistemas" },
  { key: "fornecedores" as const, label: "Fornecedores" },
];

export default function AtivosPage() {
  const params = useParams();
  const programaId = String(params?.id || "");
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const tipo = TABS[tab].key;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/ativos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    if (programaId) void load();
  }, [load, programaId]);

  const create = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/programas/${programaId}/ativos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, nome: nome.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao criar");
      setNome("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Desativar este item?")) return;
    const res = await fetch(`/api/programas/${programaId}/ativos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, id, ativo: false }),
    });
    if (res.ok) await load();
  };

  const items = (data?.[tipo] || []) as AtivoRow[];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeroHeader
        icon={<AccountTreeOutlinedIcon />}
        title="Cadastro mestre"
        description="Unidades, processos, sistemas e fornecedores — um registro, vários módulos (ROPA, riscos, IA)."
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Cadastre uma vez e vincule nos módulos. Evita repetir o mesmo sistema como texto livre no
        mapeamento, no risco e no inventário de IA.
      </Alert>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {TABS.map((t) => (
          <Tab key={t.key} label={t.label} />
        ))}
      </Tabs>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          label={`Novo ${TABS[tab].label.slice(0, -1).toLowerCase()}`}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void create();
          }}
        />
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
          onClick={() => void create()}
          disabled={saving || !nome.trim()}
        >
          Adicionar
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={1}>
          {items.length === 0 && (
            <Typography color="text.secondary">Nenhum item cadastrado.</Typography>
          )}
          {items.map((row) => (
            <Box
              key={row.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography sx={{ flex: 1 }}>{row.nome}</Typography>
              {row.tipo != null && <Chip size="small" label={String(row.tipo)} />}
              <IconButton size="small" onClick={() => void remove(row.id)} aria-label="Desativar">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
}
