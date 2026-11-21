import { NextResponse } from "next/server";
import { parseProgramaId, requireProgramaMember } from "@/lib/educacao/acesso";
import { aplicarAcao, nomeDoUsuario } from "@/lib/educacao/servico";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseProgramaId(id);
    if (programaId === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireProgramaMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const body = (await request.json()) as {
      acao?: string;
      trilhaId?: string;
      moduloId?: string;
      cartilhaId?: string;
      respostas?: number[];
    };
    const trilhaId = String(body.trilhaId || "");
    if (!trilhaId) {
      return NextResponse.json({ error: "Trilha obrigatória" }, { status: 400 });
    }
    const nome = await nomeDoUsuario(auth.supabase, auth.user.id, auth.user.email);
    if (body.acao === "quiz") {
      const data = await aplicarAcao(auth.supabase, programaId, auth.user.id, nome, {
        acao: "quiz",
        trilhaId,
        moduloId: String(body.moduloId || ""),
        respostas: Array.isArray(body.respostas) ? body.respostas.map(Number) : [],
      });
      return NextResponse.json(data);
    }
    if (body.acao === "ler_nossa_casa") {
      const data = await aplicarAcao(auth.supabase, programaId, auth.user.id, nome, {
        acao: "ler_nossa_casa",
        trilhaId,
      });
      return NextResponse.json(data);
    }
    if (body.acao === "ler_cartilha") {
      const data = await aplicarAcao(auth.supabase, programaId, auth.user.id, nome, {
        acao: "ler_cartilha",
        trilhaId,
        cartilhaId: String(body.cartilhaId || ""),
      });
      return NextResponse.json(data);
    }
    if (body.acao === "iniciar_reciclagem") {
      const data = await aplicarAcao(auth.supabase, programaId, auth.user.id, nome, {
        acao: "iniciar_reciclagem",
        trilhaId,
      });
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
