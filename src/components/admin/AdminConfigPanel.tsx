"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";
import { AdminStatusChip } from "@/components/admin/AdminStatusChip";
import type { EnvVarStatus } from "@/lib/admin/envConfig";
import type { SetupStatus } from "@/lib/setup/setupStatus";

type ConfigStatusResponse = {
  setup: SetupStatus;
  envVars: EnvVarStatus[];
  nodeEnv: string;
};

type SystemAdmin = {
  user_id: string;
  nome: string | null;
  email: string | null;
  is_system_admin: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  supabase: "Supabase",
  app: "Aplicação",
  integrations: "Integrações",
  admin: "Administração",
};

export function AdminConfigPanel() {
  const [config, setConfig] = useState<ConfigStatusResponse | null>(null);
  const [admins, setAdmins] = useState<SystemAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, adminsRes] = await Promise.all([
        fetch("/api/admin/config/status"),
        fetch("/api/admin/system-admins"),
      ]);
      if (configRes.ok) setConfig(await configRes.json());
      if (adminsRes.ok) setAdmins(await adminsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedEnvVars = useMemo(() => {
    if (!config) return [];
    const groups = new Map<string, EnvVarStatus[]>();
    for (const env of config.envVars) {
      const list = groups.get(env.category) ?? [];
      list.push(env);
      groups.set(env.category, list);
    }
    return Array.from(groups.entries());
  }, [config]);

  const grantAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    setAdminSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/system-admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, is_system_admin: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao conceder admin");
      setNewAdminEmail("");
      setMessage(`Acesso admin concedido a ${data.email}.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao conceder admin");
    } finally {
      setAdminSaving(false);
    }
  };

  if (loading && !config) {
    return <Typography color="text.secondary">Carregando configurações...</Typography>;
  }

  if (!config) {
    return <Alert severity="error">Não foi possível carregar as configurações.</Alert>;
  }

  return (
    <Stack spacing={3}>
      {message && <Alert severity="success" onClose={() => setMessage(null)}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Implantação e banco
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ambiente: {config.nodeEnv} · Supabase: {config.setup.env.source === "env" ? "variáveis locais" : "instância padrão (demo)"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} onClick={() => void load()} variant="outlined" size="small">
              Atualizar
            </Button>
            <Button component={Link} href="/setup" startIcon={<RocketLaunchIcon />} variant="contained" size="small">
              Assistente de implantação
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          <AdminStatusChip status={config.setup.env.status} />
          <AdminStatusChip status={config.setup.database.status} />
          {config.setup.ready && <Chip size="small" color="success" label="Pronto para produção" />}
        </Stack>

        <GridLikeStats setup={config.setup} />
      </Paper>

      {groupedEnvVars.map(([category, vars]) => (
        <Paper key={category} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {CATEGORY_LABELS[category] ?? category}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Variável</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vars.map((env) => (
                  <TableRow key={env.key}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {env.key}
                      </Typography>
                      {env.required && <Chip size="small" label="Obrigatória" sx={{ mt: 0.5 }} />}
                    </TableCell>
                    <TableCell>{env.description}</TableCell>
                    <TableCell>
                      <AdminStatusChip
                        status={
                          env.configured
                            ? env.source === "default" && env.category === "supabase"
                              ? "warning"
                              : "complete"
                            : env.required
                              ? "error"
                              : "pending"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {env.displayValue ?? "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Alert severity="info" sx={{ mt: 2 }}>
            Variáveis de ambiente são definidas no deploy ou em <code>.env.local</code>. Use o assistente de implantação para gerar o arquivo inicial.
          </Alert>
        </Paper>
      ))}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Administradores do sistema
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Usuários com acesso à área <code>/admin</code>. Também é possível usar <code>FPSI_ADMIN_EMAILS</code> no ambiente (desenvolvimento).
        </Typography>

        {admins.length > 0 ? (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {admins.map((admin) => (
              <Box key={admin.user_id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label="Admin" size="small" color="primary" />
                <Typography variant="body2">{admin.nome || admin.email}</Typography>
                {admin.nome && admin.email && (
                  <Typography variant="caption" color="text.secondary">
                    ({admin.email})
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Nenhum administrador cadastrado no banco. Use a variável FPSI_ADMIN_EMAILS ou conceda abaixo.
          </Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            size="small"
            label="E-mail do usuário"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="usuario@exemplo.com"
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={() => void grantAdmin()} disabled={adminSaving || !newAdminEmail.trim()}>
            Conceder admin
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

function GridLikeStats({ setup }: { setup: SetupStatus }) {
  const items = [
    { label: "Controles", value: setup.database.controleCount },
    { label: "Medidas", value: setup.database.medidaCount },
    { label: "Diagnósticos", value: setup.database.diagnosticoCount },
    { label: "Service role", value: setup.env.hasServiceRole ? "Sim" : "Não" },
    { label: "App URL", value: setup.env.hasAppUrl ? "Sim" : "Não" },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 2 }}>
      {items.map((item) => (
        <Box key={item.label} sx={{ p: 1.5, borderRadius: 1, bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {item.value ?? "—"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
