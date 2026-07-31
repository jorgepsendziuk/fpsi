"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { SetupStatus } from "@/lib/setup/setupStatus";
import { buildEnvLocalFile } from "@/lib/setup/setupStatus";
import {
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
} from "@/utils/supabase/constants";

const REPO_URL = "https://github.com/jorgepsendziuk/fpsi";

function StatusChip({ status }: { status: "complete" | "pending" | "warning" }) {
  if (status === "complete") {
    return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="OK" />;
  }
  if (status === "warning") {
    return <Chip size="small" color="warning" icon={<WarningAmberIcon />} label="Parcial" />;
  }
  return <Chip size="small" color="default" label="Pendente" />;
}

export function SetupWizard() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [appUrl, setAppUrl] = useState("http://localhost:3000");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup/status");
      const data = (await res.json()) as SetupStatus;
      setStatus(data);
      setActiveStep(data.suggestedStep);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const envFileContent = useMemo(
    () =>
      buildEnvLocalFile({
        url: url || DEFAULT_SUPABASE_URL,
        anonKey: anonKey || DEFAULT_SUPABASE_ANON_KEY,
        serviceRoleKey,
        appUrl,
      }),
    [url, anonKey, serviceRoleKey, appUrl]
  );

  const testConnection = async () => {
    setTestLoading(true);
    setTestMessage(null);
    setTestOk(null);
    try {
      const res = await fetch("/api/setup/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, anonKey }),
      });
      const data = await res.json();
      setTestOk(Boolean(data.ok));
      setTestMessage(data.hint ?? data.error ?? null);
      if (data.status) {
        setStatus(data.status as SetupStatus);
      }
    } catch {
      setTestOk(false);
      setTestMessage("Erro ao testar conexão.");
    } finally {
      setTestLoading(false);
    }
  };

  const copyEnv = async () => {
    await navigator.clipboard.writeText(envFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEnv = () => {
    const blob = new Blob([envFileContent], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = ".env.local";
    a.click();
    URL.revokeObjectURL(href);
  };

  if (loading && !status) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {status && (
        <Alert
          severity={status.ready ? "success" : status.env.source === "default" ? "info" : "warning"}
          sx={{ mb: 3 }}
        >
          {status.ready
            ? "Implantação pronta. Acesse login ou cadastro para começar."
            : status.env.source === "default"
              ? "Rodando com a instância de referência embutida no código. Para sua própria instância, configure o passo 2."
              : "Complete os passos abaixo para finalizar a implantação."}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        <Step expanded>
          <StepLabel
            optional={<Typography variant="caption">git clone · npm install · npm run dev</Typography>}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Código e dependências
              <StatusChip status="complete" />
            </Box>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Se você já está vendo esta página, o app está rodando. Para uma máquina nova:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: "monospace", fontSize: "0.85rem" }}>
              git clone {REPO_URL}
              <br />
              cd fpsi
              <br />
              npm install
              <br />
              npm run dev
            </Paper>
            <Typography variant="body2" color="text.secondary" paragraph>
              Documentação: <code>docs/essentials/setup/IMPLANTACAO.md</code> no repositório ou README na raiz.
            </Typography>
            <Button variant="contained" onClick={() => setActiveStep(1)}>
              Próximo: variáveis de ambiente
            </Button>
          </StepContent>
        </Step>

        <Step expanded>
          <StepLabel optional={<Typography variant="caption">.env.local · Supabase Dashboard → API</Typography>}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Supabase e variáveis de ambiente
              {status && <StatusChip status={status.env.status} />}
            </Box>
          </StepLabel>
          <StepContent>
            {status?.env.source === "default" && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nenhum <code>.env.local</code> detectado — usando a instância de referência do projeto (
                {DEFAULT_SUPABASE_URL.replace("https://", "")}). Para implantar em outro Supabase, preencha abaixo.
              </Alert>
            )}

            <TextField
              fullWidth
              label="NEXT_PUBLIC_SUPABASE_URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={DEFAULT_SUPABASE_URL}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="NEXT_PUBLIC_SUPABASE_ANON_KEY"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJ..."
              margin="normal"
              size="small"
              multiline
              minRows={2}
            />
            <TextField
              fullWidth
              label="SUPABASE_SERVICE_ROLE_KEY (cadastro e convites)"
              value={serviceRoleKey}
              onChange={(e) => setServiceRoleKey(e.target.value)}
              margin="normal"
              size="small"
              type="password"
              helperText="Opcional no teste; obrigatória para cadastro por e-mail e convites."
            />
            <TextField
              fullWidth
              label="NEXT_PUBLIC_APP_URL"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              margin="normal"
              size="small"
            />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={testLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => void testConnection()}
                disabled={testLoading || !url.trim() || !anonKey.trim()}
              >
                Testar conexão
              </Button>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => void copyEnv()}>
                {copied ? "Copiado!" : "Copiar .env.local"}
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadEnv}>
                Baixar .env.local
              </Button>
            </Box>

            {testMessage && (
              <Alert severity={testOk ? "success" : "warning"} sx={{ mb: 2 }}>
                {testMessage}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" paragraph>
              Salve o arquivo na <strong>raiz do projeto</strong> e reinicie <code>npm run dev</code>.
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={() => setActiveStep(0)}>Voltar</Button>
              <Button variant="contained" onClick={() => setActiveStep(2)}>
                Próximo: banco de dados
              </Button>
            </Box>
          </StepContent>
        </Step>

        <Step expanded>
          <StepLabel optional={<Typography variant="caption">supabase link · supabase db push</Typography>}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Banco de dados e migrações
              {status && <StatusChip status={status.database.status} />}
            </Box>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Em um projeto Supabase <strong>novo e vazio</strong>:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: "monospace", fontSize: "0.85rem" }}>
              supabase login
              <br />
              supabase link --project-ref SEU_PROJECT_REF
              <br />
              supabase db push
            </Paper>

            {status?.database.connected && (
              <Alert severity={status.database.status === "complete" ? "success" : "warning"} sx={{ mb: 2 }}>
                Conectado — controles: {status.database.controleCount ?? "?"}, medidas:{" "}
                {status.database.medidaCount ?? "?"}, diagnósticos: {status.database.diagnosticoCount ?? "?"}
                {status.database.message ? ` — ${status.database.message}` : ""}
              </Alert>
            )}

            {!status?.database.connected && status && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {status.database.message ?? "Sem conexão com o banco. Verifique as variáveis e as migrações."}
              </Alert>
            )}

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={() => void refresh()}
              sx={{ mb: 2 }}
            >
              Verificar banco novamente
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={() => setActiveStep(1)}>Voltar</Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(3)}
                disabled={status?.database.status === "pending"}
              >
                Próximo: concluir
              </Button>
            </Box>
          </StepContent>
        </Step>

        <Step expanded>
          <StepLabel>Pronto</StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              Com o app rodando e o banco migrado, crie sua conta e o primeiro programa pela interface.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button variant="contained" href="/register">
                Cadastrar
              </Button>
              <Button variant="outlined" href="/login">
                Login
              </Button>
              <Button variant="outlined" href="/">
                Ir para a home
              </Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
}
