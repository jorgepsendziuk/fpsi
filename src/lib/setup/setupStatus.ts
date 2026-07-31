import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublicConfig,
  hasAppUrl,
  hasServiceRoleKey,
  type SupabaseConfigSource,
} from "@/utils/supabase/constants";

export type SetupStepStatus = "complete" | "pending" | "warning";

export type SetupStatus = {
  appRunning: true;
  env: {
    status: SetupStepStatus;
    source: SupabaseConfigSource;
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasServiceRole: boolean;
    hasAppUrl: boolean;
  };
  database: {
    status: SetupStepStatus;
    connected: boolean;
    controleCount: number | null;
    medidaCount: number | null;
    diagnosticoCount: number | null;
    message: string | null;
  };
  /** Passo sugerido do wizard (0 = código, 1 = env, 2 = banco, 3 = pronto). */
  suggestedStep: number;
  ready: boolean;
};

const MIN_CONTROLES = 27;
const MIN_MEDIDAS = 200;
const MIN_DIAGNOSTICOS = 3;

async function probeDatabase(client: SupabaseClient) {
  const [controle, medida, diagnostico] = await Promise.all([
    client.from("controle").select("*", { count: "exact", head: true }),
    client.from("medida").select("*", { count: "exact", head: true }),
    client.from("diagnostico").select("*", { count: "exact", head: true }),
  ]);

  const firstError = controle.error || medida.error || diagnostico.error;
  if (firstError) {
    return {
      connected: false,
      controleCount: null,
      medidaCount: null,
      diagnosticoCount: null,
      message: firstError.message,
    };
  }

  const controleCount = controle.count ?? 0;
  const medidaCount = medida.count ?? 0;
  const diagnosticoCount = diagnostico.count ?? 0;

  let message: string | null = null;
  if (controleCount < MIN_CONTROLES || medidaCount < MIN_MEDIDAS) {
    message =
      "Conexão OK, mas o catálogo PPSI parece incompleto. Rode supabase db push no projeto linkado.";
  } else if (diagnosticoCount < MIN_DIAGNOSTICOS) {
    message = "Domínios de diagnóstico ausentes. Aplique as migrações em supabase/migrations/.";
  }

  return {
    connected: true,
    controleCount,
    medidaCount,
    diagnosticoCount,
    message,
  };
}

export async function getSetupStatus(
  override?: { url: string; anonKey: string }
): Promise<SetupStatus> {
  const publicConfig = getSupabasePublicConfig();
  const config = override ?? publicConfig;
  const fromEnv = !override && publicConfig.source === "env";

  const hasUrl = Boolean(override?.url || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasAnonKey = Boolean(
    override?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );

  const envComplete = hasUrl && hasAnonKey;
  const envStatus: SetupStepStatus = envComplete
    ? publicConfig.source === "default" && !override
      ? "warning"
      : "complete"
    : "pending";

  let database: SetupStatus["database"] = {
    status: "pending",
    connected: false,
    controleCount: null,
    medidaCount: null,
    diagnosticoCount: null,
    message: null,
  };

  if (config.url && config.anonKey) {
    const client = createClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const probe = await probeDatabase(client);
    database = {
      status: probe.connected && !probe.message ? "complete" : probe.connected ? "warning" : "pending",
      connected: probe.connected,
      controleCount: probe.controleCount,
      medidaCount: probe.medidaCount,
      diagnosticoCount: probe.diagnosticoCount,
      message: probe.message ?? (probe.connected ? null : "Não foi possível consultar o banco."),
    };
  }

  let suggestedStep = 0;
  if (envComplete && database.status !== "complete") {
    suggestedStep = 2;
  } else if (!envComplete) {
    suggestedStep = 1;
  } else if (database.status === "complete") {
    suggestedStep = 3;
  }

  const ready =
    envComplete &&
    database.connected &&
    database.status === "complete" &&
    (fromEnv || override != null);

  return {
    appRunning: true,
    env: {
      status: envStatus,
      source: override ? "env" : publicConfig.source,
      hasUrl,
      hasAnonKey,
      hasServiceRole: hasServiceRoleKey(),
      hasAppUrl: hasAppUrl(),
    },
    database,
    suggestedStep,
    ready,
  };
}

export function buildEnvLocalFile(values: {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  appUrl?: string;
}): string {
  const lines = [
    "# Gerado pelo assistente de implantação FPSI",
    `NEXT_PUBLIC_SUPABASE_URL=${values.url}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${values.anonKey}`,
  ];
  if (values.serviceRoleKey?.trim()) {
    lines.push(`SUPABASE_SERVICE_ROLE_KEY=${values.serviceRoleKey.trim()}`);
  }
  if (values.appUrl?.trim()) {
    lines.push(`NEXT_PUBLIC_APP_URL=${values.appUrl.trim()}`);
  }
  lines.push("");
  return lines.join("\n");
}
