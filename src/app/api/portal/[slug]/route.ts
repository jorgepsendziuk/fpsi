import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/portal/[slug]
 * Dados públicos do programa para o portal de privacidade (sem auth).
 * Retorna: nome, slug, razao_social, nome_fantasia, cnpj, atendimento_*, DPO (nome/email), links (quando existirem).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: programa, error: progError } = await supabase
      .from("programa")
      .select("id, nome, slug, razao_social, nome_fantasia, cnpj, atendimento_fone, atendimento_email, atendimento_site, responsavel_privacidade")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (progError) {
      console.error("Erro ao buscar programa por slug:", progError);
      return NextResponse.json(
        { error: "Erro ao buscar programa", details: progError.message },
        { status: 500 }
      );
    }

    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    let dpo_nome: string | null = null;
    let dpo_email: string | null = null;
    if (programa.responsavel_privacidade) {
      const { data: resp } = await supabase
        .from("responsavel")
        .select("nome, email")
        .eq("id", programa.responsavel_privacidade)
        .maybeSingle();
      if (resp) {
        dpo_nome = resp.nome ?? null;
        dpo_email = resp.email ?? null;
      }
    }

    return NextResponse.json({
      id: programa.id,
      nome: programa.nome ?? null,
      slug: programa.slug ?? null,
      razao_social: programa.razao_social ?? null,
      nome_fantasia: programa.nome_fantasia ?? null,
      cnpj: programa.cnpj ?? null,
      atendimento_fone: programa.atendimento_fone ?? null,
      atendimento_email: programa.atendimento_email ?? null,
      atendimento_site: programa.atendimento_site ?? null,
      dpo_nome: dpo_nome,
      dpo_email: dpo_email,
      link_politica_privacidade: null,
      link_aviso_titular: null,
      link_cookies: null,
      link_declaracao_seguranca: null,
      link_reportar_vulnerabilidade: null,
    });
  } catch (error) {
    console.error("Erro GET portal:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
