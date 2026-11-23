import { NextResponse } from "next/server";

import { isFpsiSessionConfigured } from "@/lib/server/fpsi-session";
import { isGoogleOAuthConfigured } from "@/lib/server/google-oauth";

export async function GET() {
  return NextResponse.json({
    enabled: isGoogleOAuthConfigured() && isFpsiSessionConfigured(),
  });
}