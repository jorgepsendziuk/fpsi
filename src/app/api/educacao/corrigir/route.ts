import { NextResponse } from "next/server";
import { moduloPorId } from "@/lib/educacao/catalogo";
import { corrigirModulo } from "@/lib/educacao/corrigir";

/** Correção pública do minicurso. Não grava matrícula. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { moduloId?: string; respostas?: number[] };
    const moduloId = String(body.moduloId || "");
    const modulo = moduloPorId(moduloId);
    if (!modulo?.previewPublico) {
      return NextResponse.json(
        { error: "Este módulo faz parte das trilhas do programa. Peça um convite ao Encarregado." },
        { status: 403 }
      );
    }
    const resultado = corrigirModulo(
      moduloId,
      Array.isArray(body.respostas) ? body.respostas.map(Number) : [],
      70
    );
    if (!resultado) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
    return NextResponse.json({ resultado });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
