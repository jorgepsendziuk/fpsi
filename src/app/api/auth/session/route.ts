import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fpsiSessionCookieName, verifyFpsiSessionToken } from "@/lib/server/fpsi-session";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(fpsiSessionCookieName())?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  const user = await verifyFpsiSessionToken(token);
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, email: user.email, name: user.fullName },
  });
}