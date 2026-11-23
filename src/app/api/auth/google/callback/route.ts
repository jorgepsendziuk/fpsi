import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  exchangeGoogleCode,
  fpsiSessionCookieName,
  fpsiSessionCookieOptions,
  issueFpsiSessionFromGoogle,
  safeNextPath,
} from "@/lib/server/google-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const err = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (err) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("error", "oauth");
    login.searchParams.set("error_description", err);
    return NextResponse.redirect(login);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
  const next = safeNextPath(jar.get(OAUTH_NEXT_COOKIE)?.value ?? null);

  jar.delete(OAUTH_STATE_COOKIE);
  jar.delete(OAUTH_NEXT_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  }

  try {
    const profile = await exchangeGoogleCode(request, code);
    const { token } = await issueFpsiSessionFromGoogle(profile);
    const secure = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(new URL(next, url.origin));
    response.cookies.set(fpsiSessionCookieName(), token, fpsiSessionCookieOptions(secure));
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  }
}