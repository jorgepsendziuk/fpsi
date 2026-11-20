import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { validateProgramaSlug } from "@/lib/programa/programaSlug";

/**
 * GET /api/programas/slug-disponivel?slug=meu-org&excludeProgramaId=41
 * Verifica se o slug está livre nesta instância (programas não excluídos).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validated = validateProgramaSlug(searchParams.get("slug") || "");
    if (!validated.ok) {
      return NextResponse.json({
        disponivel: false,
        slug: validated.slug,
        motivo: validated.reason,
      });
    }

    const excludeRaw = searchParams.get("excludeProgramaId");
    const excludeId = excludeRaw ? parseInt(excludeRaw, 10) : NaN;

    let query = supabase
      .from("programa")
      .select("id, nome, slug")
      .eq("slug", validated.slug)
      .is("deleted_at", null);

    if (Number.isFinite(excludeId) && excludeId > 0) {
      query = query.neq("id", excludeId);
    }

    const { data: existing, error } = await query.maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({
        disponivel: false,
        slug: validated.slug,
        motivo: "Este slug já está em uso por outro programa nesta instalação.",
        ocupadoPor: { id: existing.id, nome: existing.nome ?? null },
      });
    }

    return NextResponse.json({
      disponivel: true,
      slug: validated.slug,
      motivo: null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}