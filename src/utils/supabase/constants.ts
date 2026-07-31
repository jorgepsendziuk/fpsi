/**
 * Instância de referência / demo — usada quando .env.local não define as chaves.
 * Novas implantações devem sobrescrever via NEXT_PUBLIC_SUPABASE_* no .env.local.
 */
export const DEFAULT_SUPABASE_URL = "https://bqujcsrfblsnvloibmcm.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdWpjc3JmYmxzbnZsb2libWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTAzNDEsImV4cCI6MjA5OTk2NjM0MX0.GxuePg3Y45lq6fQSI4vKhq6FNfxTTQZSbprtjQNC-CE";

export type SupabaseConfigSource = "env" | "default";

export function getSupabasePublicConfig(): {
  url: string;
  anonKey: string;
  source: SupabaseConfigSource;
} {
  const urlFromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const keyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (urlFromEnv && keyFromEnv) {
    return { url: urlFromEnv, anonKey: keyFromEnv, source: "env" };
  }

  return {
    url: urlFromEnv || DEFAULT_SUPABASE_URL,
    anonKey: keyFromEnv || DEFAULT_SUPABASE_ANON_KEY,
    source: "default",
  };
}

const publicConfig = getSupabasePublicConfig();

export const SUPABASE_URL = publicConfig.url;
export const SUPABASE_KEY = publicConfig.anonKey;
export const SUPABASE_CONFIG_SOURCE = publicConfig.source;

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function hasAppUrl(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
}
