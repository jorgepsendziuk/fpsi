import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  isGoogleOAuthConfigured,
  oauthStateCookieOptions,
  safeNextPath,
} from "@/lib/server/google-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=oauth&error_description=Google+OAuth+n%C3%A3o+configurado", request.url)
    );
  }

  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const state = randomBytes(24).toString("hex");
  const secure = process.env.NODE_ENV === "production";

  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions(secure));
  jar.set(OAUTH_NEXT_COOKIE, next, oauthStateCookieOptions(secure));

  return NextResponse.redirect(buildGoogleAuthUrl(request, state));
}