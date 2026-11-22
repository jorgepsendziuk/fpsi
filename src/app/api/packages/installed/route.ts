import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { CONTENT_PACK_UI } from "@/lib/packages/contentPackMeta";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), "config/fpsi-packages.json");
    const raw = JSON.parse(readFileSync(configPath, "utf8")) as {
      v: number;
      packages: Record<string, boolean>;
      updatedAt: string | null;
    };

    const manifests = ["publico", "ppsi-2.0", "governanca-ia", "framework"].map((id) => {
      const enabled = raw.packages?.[id] !== false;
      const meta = CONTENT_PACK_UI[id];
      return {
        id,
        enabled,
        nome: meta?.nome ?? id,
        origem: meta?.origem ?? (id === "publico" ? "proprio" : undefined),
        licenca: meta?.licenca,
        tipo: id === "publico" ? "superficie" : "conteudo",
      };
    });

    return NextResponse.json({
      v: raw.v ?? 1,
      updatedAt: raw.updatedAt,
      packages: manifests,
    });
  } catch (e) {
    console.error("[api/packages/installed]", e);
    return NextResponse.json({ error: "Não foi possível ler pacotes instalados." }, { status: 500 });
  }
}