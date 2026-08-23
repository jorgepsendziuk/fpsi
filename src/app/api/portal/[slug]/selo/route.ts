import { NextRequest, NextResponse } from "next/server";
import { PORTAL_PUBLIC_CORS } from "@/lib/portal/portalPublicPaths";
import { loadPortalSeloPublico } from "@/lib/portal/loadPortalSeloPublico";
import { renderSeloLgpdSvg } from "@/lib/portal/renderSeloLgpdSvg";
import { getAppUrl } from "@/lib/appUrl";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await loadPortalSeloPublico(slug ?? "");
  if (!data) {
    return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
  }

  const format = request.nextUrl.searchParams.get("format");
  if (format === "json") {
    const base = getAppUrl();
    return NextResponse.json(
      {
        slug: data.slug,
        nome: data.nome,
        plano: data.selo.plano,
        planoLabel: data.selo.planoDef.label,
        metal: data.selo.displayMetal,
        metalLabel: data.selo.displayPalette.label,
        greyed: data.selo.greyed,
        score: data.selo.score,
        pageUrl: `${base}/${encodeURIComponent(data.slug)}/selo`,
        svgUrl: `${base}/api/portal/${encodeURIComponent(data.slug)}/selo`,
      },
      { headers: PORTAL_PUBLIC_CORS }
    );
  }

  const svg = renderSeloLgpdSvg(data.selo, { uid: `p${data.slug.replace(/[^a-z0-9]/gi, "")}` });
  return new NextResponse(svg, {
    headers: {
      ...PORTAL_PUBLIC_CORS,
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
