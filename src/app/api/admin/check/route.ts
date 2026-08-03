import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";

export async function GET() {
  const { ok, user } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ isAdmin: false });

  return NextResponse.json({
    isAdmin: true,
    email: user?.email ?? null,
  });
}
