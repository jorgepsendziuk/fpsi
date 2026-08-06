import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/auditor/[token] — portal somente leitura (sem login).
 * Usa service role apenas se necessário; aqui valida token e agrega contagens via RLS bypass
 * com client autenticado anônimo não funciona — usamos server client + checagem de token.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Leitura do token: políticas RLS exigem membership — usar RPC ou service.
    // Fallback: query via admin se disponível.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: acesso, error } = await admin
      .from("programa_auditor_acesso")
      .select("id, programa_id, email, expires_at, revoked_at")
      .eq("token", token)
      .maybeSingle();
    if (error) throw error;
    if (!acesso || acesso.revoked_at) {
      return NextResponse.json({ error: "Acesso inválido ou revogado" }, { status: 403 });
    }
    if (new Date(acesso.expires_at) < new Date()) {
      return NextResponse.json({ error: "Acesso expirado" }, { status: 403 });
    }

    await admin
      .from("programa_auditor_acesso")
      .update({ last_access_at: new Date().toISOString() })
      .eq("id", acesso.id);

    const pid = acesso.programa_id;
    const [{ data: prog }, mat, riscos, inc, ev, dec] = await Promise.all([
      admin.from("programa").select("id, nome, slug").eq("id", pid).maybeSingle(),
      admin.from("programa_diagnostico_maturidade").select("score").eq("programa_id", pid),
      admin
        .from("programa_risco")
        .select("*", { count: "exact", head: true })
        .eq("programa_id", pid)
        .in("status", ["identificado", "em_tratamento"])
        .gte("score_residual", 12),
      admin
        .from("incidente")
        .select("*", { count: "exact", head: true })
        .eq("programa_id", pid)
        .in("status", ["em_analise", "comunicado_anpd", "comunicado_titulares", "outro"]),
      admin
        .from("evidencia")
        .select("*", { count: "exact", head: true })
        .eq("programa_id", pid)
        .eq("status", "ativo"),
      admin
        .from("decision_record")
        .select("*", { count: "exact", head: true })
        .eq("programa_id", pid)
        .neq("status", "rascunho"),
    ]);

    const scores = (mat.data || []).map((r: { score: number }) => Number(r.score));
    const maturidadeMedia =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    // supabase unused warning suppress - kept for cookie session consistency
    void supabase;

    return NextResponse.json({
      ok: true,
      programa: prog,
      expires_at: acesso.expires_at,
      resumo: {
        maturidadeMedia,
        riscosCriticos: riscos.count ?? 0,
        incidentesAbertos: inc.count ?? 0,
        evidencias: ev.count ?? 0,
        decisoes: dec.count ?? 0,
      },
    });
  } catch (e) {
    console.error("auditor portal", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
