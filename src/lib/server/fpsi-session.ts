import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "fpsi_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type FpsiSessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  provider: "google";
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.FPSI_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("FPSI_SESSION_SECRET não configurada (mín. 16 caracteres)");
  }
  return new TextEncoder().encode(secret);
}

export function fpsiSessionCookieName() {
  return COOKIE_NAME;
}

export function fpsiSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export async function createFpsiSessionToken(user: FpsiSessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.fullName,
    provider: user.provider,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSessionSecret());
}

export async function verifyFpsiSessionToken(token: string): Promise<FpsiSessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    return {
      id: sub,
      email: String(payload.email ?? ""),
      fullName: payload.name ? String(payload.name) : null,
      provider: "google",
    };
  } catch {
    return null;
  }
}

export function isFpsiSessionConfigured(): boolean {
  const secret = process.env.FPSI_SESSION_SECRET?.trim();
  return Boolean(secret && secret.length >= 16);
}