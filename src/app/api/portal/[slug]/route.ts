import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

type ProgramaPortalRow = {
  id: number;
  nome: string | null;
  slug: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | number | null;
  atendimento_fone: string | null;
  atendimento_email: string | null;
  atendimento_site: string | null;
  encarregado_dados_pessoais: number | null;
  logo_orgao_empresa: string | null;
  logo_programa: string | null;
  link_politica_privacidade?: string | null;
  link_aviso_titular?: string | null;
  link_cookies?: string | null;
  link_declaracao_seguranca?: string | null;
  link_reportar_vulnerabilidade?: string | null;
};

const SELECT_PORTAL_BASE =
  "id, nome, slug, razao_social, nome_fantasia, cnpj, atendimento_fone, atendimento_email, atendimento_site, encarregado_dados_pessoais, logo_orgao_empresa, logo_programa";

const SELECT_PORTAL_WITH_LINKS = `${SELECT_PORTAL_BASE}, link_politica_privacidade, link_aviso_titular, link_cookies, link_declaracao_seguranca, link_reportar_vulnerabilidade`;

function shouldRetryProgramaSelectWithoutLinks(err: { message?: string } | null): boolean {
  const m = (err?.message ?? "").toLowerCase();
  return m.includes("does not exist") && m.includes("link_");
}

/**
 * GET /api/portal/[slug]
 * Dados públicos do programa para o portal de privacidade (sem auth).
 * Usa admin para bypassar RLS e permitir acesso público por slug.
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

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      console.error("[portal] SUPABASE_SERVICE_ROLE_KEY não configurada - configure na Vercel (Environment Variables)");
      return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
    }
    let { data: programaRaw, error: progError } = await supabase
      .from("programa")
      .select(SELECT_PORTAL_WITH_LINKS)
      .eq("slug", slug.trim())
      .is("deleted_at", null)
      .maybeSingle();

    let programa: ProgramaPortalRow | null = programaRaw as ProgramaPortalRow | null;

    if (progError && shouldRetryProgramaSelectWithoutLinks(progError)) {
      const retry = await supabase
        .from("programa")
        .select(SELECT_PORTAL_BASE)
        .eq("slug", slug.trim())
        .is("deleted_at", null)
        .maybeSingle();
      progError = retry.error;
      const base = retry.data as Omit<
        ProgramaPortalRow,
        | "link_politica_privacidade"
        | "link_aviso_titular"
        | "link_cookies"
        | "link_declaracao_seguranca"
        | "link_reportar_vulnerabilidade"
      > | null;
      programa = base
        ? {
            ...base,
            link_politica_privacidade: null,
            link_aviso_titular: null,
            link_cookies: null,
            link_declaracao_seguranca: null,
            link_reportar_vulnerabilidade: null,
          }
        : null;
    }

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

    const row = programa as ProgramaPortalRow;

    let dpo_nome: string | null = null;
    let dpo_email: string | null = null;
    if (row.encarregado_dados_pessoais) {
      const { data: resp } = await supabase
        .from("responsavel")
        .select("nome, email")
        .eq("id", row.encarregado_dados_pessoais)
        .maybeSingle();
      if (resp) {
        dpo_nome = resp.nome ?? null;
        dpo_email = resp.email ?? null;
      }
    }

    return NextResponse.json({
      id: row.id,
      nome: row.nome ?? null,
      slug: row.slug ?? null,
      razao_social: row.razao_social ?? null,
      nome_fantasia: row.nome_fantasia ?? null,
      cnpj: row.cnpj ?? null,
      atendimento_fone: row.atendimento_fone ?? null,
      atendimento_email: row.atendimento_email ?? null,
      atendimento_site: row.atendimento_site ?? null,
      dpo_nome: dpo_nome,
      dpo_email: dpo_email,
      logo_orgao_empresa: row.logo_orgao_empresa ?? null,
      logo_programa: row.logo_programa ?? null,
      link_politica_privacidade: row.link_politica_privacidade ?? null,
      link_aviso_titular: row.link_aviso_titular ?? null,
      link_cookies: row.link_cookies ?? null,
      link_declaracao_seguranca: row.link_declaracao_seguranca ?? null,
      link_reportar_vulnerabilidade: row.link_reportar_vulnerabilidade ?? null,
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
