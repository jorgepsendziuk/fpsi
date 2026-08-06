import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { randomBytes } from "crypto";

async function requireMember(programaId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) } as const;
  }
  const { data } = await supabase
    .from("programa_users")
    .select("id, role")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) } as const;
  }
  return { supabase, user } as const;
}

/** GET timeline | POST cria acesso auditor | query?tipo=timeline|auditores|ciencia */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;
    const tipo = request.nextUrl.searchParams.get("tipo") || "timeline";

    if (tipo === "auditores") {
      const { data, error } = await supabase
        .from("programa_auditor_acesso")
        .select("id, email, expires_at, revoked_at, created_at, last_access_at, token")
        .eq("programa_id", programaId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ auditores: data || [] });
    }

    if (tipo === "ciencia") {
      const { data, error } = await supabase
        .from("ciencia_documento")
        .select("*")
        .eq("programa_id", programaId)
        .order("aceito_em", { ascending: false })
        .limit(100);
      if (error) throw error;
      return NextResponse.json({ ciencias: data || [] });
    }

    const { data, error } = await supabase
      .from("programa_timeline_evento")
      .select("*")
      .eq("programa_id", programaId)
      .order("ocorrido_em", { ascending: false })
      .limit(80);
    if (error) throw error;
    return NextResponse.json({ eventos: data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase, user } = auth;
    const body = await request.json();
    const acao = String(body.acao || "auditor");

    if (acao === "ciencia") {
      const politicaId = Number(body.politica_programa_id);
      if (Number.isNaN(politicaId)) {
        return NextResponse.json({ error: "politica_programa_id obrigatório" }, { status: 400 });
      }
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        null;
      const { data, error } = await supabase
        .from("ciencia_documento")
        .upsert(
          {
            programa_id: programaId,
            politica_programa_id: politicaId,
            user_id: user.id,
            versao: String(body.versao || "1"),
            documento_titulo: body.documento_titulo || "",
            ip,
            user_agent: request.headers.get("user-agent")?.slice(0, 400) || null,
            aceito_em: new Date().toISOString(),
          },
          { onConflict: "programa_id,politica_programa_id,user_id,versao" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ ciencia: data }, { status: 201 });
    }

    // acesso auditor
    const email = String(body.email || "").trim().toLowerCase();
    const dias = Math.min(Math.max(Number(body.dias) || 14, 1), 90);
    if (!email.includes("@")) {
      return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
    }
    const token = randomBytes(24).toString("hex");
    const expires = new Date();
    expires.setDate(expires.getDate() + dias);
    const { data, error } = await supabase
      .from("programa_auditor_acesso")
      .insert({
        programa_id: programaId,
        email,
        token,
        expires_at: expires.toISOString(),
        created_by: user.id,
      })
      .select("id, email, token, expires_at, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ auditor: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
