import {
  createFpsiSessionToken,
  fpsiSessionCookieName,
  fpsiSessionCookieOptions,
  type FpsiSessionUser,
} from "@/lib/server/fpsi-session";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export const OAUTH_STATE_COOKIE = "fpsi_google_oauth_state";
export const OAUTH_NEXT_COOKIE = "fpsi_google_oauth_next";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export function getPublicOrigin(request: Request): string {
  const configured = process.env.AUTH_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export function googleCallbackRedirectUri(request: Request): string {
  return `${getPublicOrigin(request)}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(request: Request, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não configurada");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleCallbackRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function oauthStateCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
}

export function safeNextPath(next: string | null, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  id: string;
  email?: string;
  verified_email?: boolean;
  name?: string;
  picture?: string;
};

export async function exchangeGoogleCode(request: Request, code: string): Promise<GoogleUserInfo> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("Google OAuth não configurado");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleCallbackRedirectUri(request),
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description ?? tokenJson.error ?? "Falha ao obter token do Google");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!userRes.ok) throw new Error("Falha ao obter perfil do Google");

  const profile = (await userRes.json()) as GoogleUserInfo;
  if (!profile.email) throw new Error("Conta Google sem e-mail");
  return profile;
}

/** Sessão FPSI (cookie JWT), sem Supabase Auth. Opcional: sincroniza `profiles` se já existir user_id no Supabase. */
export async function issueFpsiSessionFromGoogle(
  profile: GoogleUserInfo
): Promise<{ token: string; user: FpsiSessionUser }> {
  const user: FpsiSessionUser = {
    id: `google:${profile.id}`,
    email: profile.email!,
    fullName: profile.name ?? null,
    provider: "google",
  };

  try {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("user_id")
        .eq("email", user.email)
        .maybeSingle();
      if (existingProfile?.user_id) {
        user.id = existingProfile.user_id;
        await admin.from("profiles").upsert(
          {
            user_id: existingProfile.user_id,
            email: user.email,
            verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
    }
  } catch {
    /* banco ainda via Supabase; falha não impede login com sessão FPSI */
  }

  const token = await createFpsiSessionToken(user);
  return { token, user };
}

export { fpsiSessionCookieName, fpsiSessionCookieOptions };