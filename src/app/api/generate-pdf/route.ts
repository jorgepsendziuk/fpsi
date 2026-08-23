import { NextResponse } from "next/server";
import { generatePoliticaPdfBytes, type PoliticaPdfSection } from "@/lib/pdf/politicaPdf";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sections, politicaNome, nomeFantasia, programa } = body as {
      sections?: PoliticaPdfSection[];
      politicaNome?: string;
      nomeFantasia?: string;
      programa?: Record<string, unknown>;
    };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Sections array is required" }, { status: 400 });
    }

    const { bytes, filename } = await generatePoliticaPdfBytes({
      sections,
      politicaNome,
      nomeFantasia,
      programa,
    });

    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
