import { maskSecret } from "@/lib/admin/requireSystemAdmin";
import {
  getSupabasePublicConfig,
  hasAppUrl,
  hasServiceRoleKey,
} from "@/utils/supabase/constants";

export type EnvVarCategory = "supabase" | "app" | "integrations" | "admin";

export type EnvVarDefinition = {
  key: string;
  label: string;
  description: string;
  category: EnvVarCategory;
  required: boolean;
  secret?: boolean;
  public?: boolean;
};

export const ENV_VAR_DEFINITIONS: EnvVarDefinition[] = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase URL",
    description: "URL pública do projeto Supabase.",
    category: "supabase",
    required: true,
    public: true,
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Supabase Anon Key",
    description: "Chave pública anônima (frontend e SSR).",
    category: "supabase",
    required: true,
    public: true,
    secret: true,
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase Service Role",
    description: "Chave server-side para convites, admin e operações privilegiadas.",
    category: "supabase",
    required: true,
    secret: true,
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    label: "URL da aplicação",
    description: "Usada em links de e-mail, convites, PDFs e OAuth.",
    category: "app",
    required: false,
    public: true,
  },
  {
    key: "FPSI_ADMIN_EMAILS",
    label: "E-mails admin do sistema",
    description: "Lista separada por vírgula para acesso à área /admin (desenvolvimento).",
    category: "admin",
    required: false,
  },
  {
    key: "OPENAI_API_KEY",
    label: "OpenAI API Key",
    description: "IA assistida no mapeamento de dados (opcional).",
    category: "integrations",
    required: false,
    secret: true,
  },
  {
    key: "OPENAI_MODEL",
    label: "Modelo OpenAI",
    description: "Modelo usado nas sugestões de IA (padrão: gpt-4o-mini).",
    category: "integrations",
    required: false,
  },
  {
    key: "RESEND_API_KEY",
    label: "Resend API Key",
    description: "Envio de e-mails transacionais (opcional).",
    category: "integrations",
    required: false,
    secret: true,
  },
  {
    key: "RESEND_FROM_EMAIL",
    label: "Remetente Resend",
    description: "Endereço remetente dos e-mails transacionais.",
    category: "integrations",
    required: false,
  },
  {
    key: "NEXT_PUBLIC_REFINE_DEVTOOLS",
    label: "Refine Devtools",
    description: "Ativa devtools do Refine no browser (desenvolvimento).",
    category: "app",
    required: false,
    public: true,
  },
];

export type EnvVarStatus = EnvVarDefinition & {
  configured: boolean;
  displayValue: string | null;
  source?: "env" | "default";
};

export function getEnvVarStatuses(): EnvVarStatus[] {
  const publicConfig = getSupabasePublicConfig();

  return ENV_VAR_DEFINITIONS.map((def) => {
    const raw = process.env[def.key]?.trim();
    let configured = Boolean(raw);
    let displayValue: string | null = raw ?? null;
    let source: "env" | "default" | undefined;

    if (def.key === "NEXT_PUBLIC_SUPABASE_URL") {
      configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || publicConfig.url);
      displayValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || publicConfig.url;
      source = publicConfig.source;
    } else if (def.key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || publicConfig.anonKey);
      displayValue = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
        ? maskSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        : maskSecret(publicConfig.anonKey);
      source = publicConfig.source;
    } else if (def.key === "SUPABASE_SERVICE_ROLE_KEY") {
      configured = hasServiceRoleKey();
      displayValue = configured ? maskSecret(raw) : null;
    } else if (def.key === "NEXT_PUBLIC_APP_URL") {
      configured = hasAppUrl();
      displayValue = raw ?? null;
    } else if (def.secret) {
      displayValue = configured ? maskSecret(raw) : null;
    }

    return { ...def, configured, displayValue, source };
  });
}
