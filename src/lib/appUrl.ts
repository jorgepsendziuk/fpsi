/** URL pública canônica do FPSI em produção (apex redireciona para www). */
export const DEFAULT_APP_URL = "https://www.fpsi.com.br";

/** Origem do app para links em e-mails, convites, PDFs e OAuth (sem barra final). */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  return fromEnv || DEFAULT_APP_URL;
}
