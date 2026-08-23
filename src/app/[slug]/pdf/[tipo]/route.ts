import { NextRequest, NextResponse } from "next/server";
import { buildPortalPoliticaPdfResponse } from "@/lib/portal/buildPortalPoliticaPdfResponse";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; tipo: string }> }
) {
  const { slug, tipo } = await params;
  return buildPortalPoliticaPdfResponse(slug ?? "", tipo ?? "");
}
