import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { generatePoliticaPdfBytes, type PoliticaPdfSection } from "@/lib/pdf/politicaPdf";
import { formatEncarregadoPublico } from "@/lib/governanca/encarregadoIdentidade";
import {
  PORTAL_CANONICAL_PATH,
  PORTAL_DOC_TITLE,
  PORTAL_PUBLIC_CORS,
  portalDocTipoPolitica,
  resolvePortalDocFromTipo,
} from "@/lib/portal/portalPublicPaths";

function mapSecoes(secoes: unknown): PoliticaPdfSection[] {
  if (!Array.isArray(secoes)) return [];
  return secoes.map((raw, idx) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    return {
      id: Number(s.id ?? idx),
      secao: String(s.secao ?? ""),
      titulo: s.titulo != null ? String(s.titulo) : undefined,
      texto: s.texto != null ? String(s.texto) : undefined,
    };
  });
}

export async function buildPortalPoliticaPdfResponse(
  slugRaw: string,
  tipoRaw: string
): Promise<NextResponse> {
  const slug = slugRaw.trim();
  const doc = resolvePortalDocFromTipo(tipoRaw);
  if (!slug || !doc) {
    return NextResponse.json({ error: "Documento inválido" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const { data: programa, error: progErr } = await admin
    .from("programa")
    .select(
      "id, nome, slug, razao_social, nome_fantasia, cnpj, atendimento_fone, atendimento_email, atendimento_site, encarregado_dados_pessoais, logo_orgao_empresa, logo_programa"
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (progErr) {
    console.error("[portal-pdf]", progErr);
    return NextResponse.json({ error: "Erro ao buscar programa" }, { status: 500 });
  }
  if (!programa) {
    return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
  }

  const row = programa as Record<string, unknown>;
  let dpoNome: string | null = null;
  let dpoEmail: string | null = null;
  if (typeof row.encarregado_dados_pessoais === "number") {
    const { data: resp } = await admin
      .from("responsavel")
      .select("nome, email, tipo_pessoa, razao_social, cnpj, pessoa_natural_responsavel_nome, pessoa_natural_responsavel_email")
      .eq("id", row.encarregado_dados_pessoais)
      .maybeSingle();
    dpoNome = formatEncarregadoPublico(resp)?.titulo ?? resp?.nome ?? null;
    dpoEmail = formatEncarregadoPublico(resp)?.email ?? resp?.email ?? null;
  }

  const { data: pub } = await admin
    .from("politica_programa")
    .select("secoes")
    .eq("programa_id", row.id)
    .eq("tipo_politica", portalDocTipoPolitica(doc))
    .eq("status", "publicado")
    .maybeSingle();

  const sections = mapSecoes(pub?.secoes);
  if (!sections.some((s) => (s.texto || "").trim())) {
    return NextResponse.json(
      { error: "Documento ainda não publicado neste portal" },
      { status: 404 }
    );
  }

  const nomeFantasia =
    String(row.nome_fantasia ?? "").trim() ||
    String(row.razao_social ?? "").trim() ||
    String(row.nome ?? "").trim();

  const { bytes, filename } = await generatePoliticaPdfBytes({
    sections,
    politicaNome: PORTAL_DOC_TITLE[doc],
    nomeFantasia,
    programa: {
      ...row,
      dpo_nome: dpoNome,
      dpo_email: dpoEmail,
    },
  });

  const asciiName = `${PORTAL_CANONICAL_PATH[doc]}.pdf`;
  return new NextResponse(Buffer.from(bytes) as unknown as BodyInit, {
    headers: {
      ...PORTAL_PUBLIC_CORS,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
