import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";
import { FPSI_PRIVACY_NOTICE_VERSION } from "@/lib/privacy/constants";

/**
 * POST /api/profiles/privacy-consent
 * Registra aceite do aviso de privacidade da plataforma (versão atual).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const version = typeof body.version === "string" ? body.version.trim() : "";

    if (version !== FPSI_PRIVACY_NOTICE_VERSION) {
      return NextResponse.json(
        { error: "Versão do aviso inválida ou desatualizada. Recarregue a página." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email: user.email,
        privacy_notice_version_accepted: FPSI_PRIVACY_NOTICE_VERSION,
        privacy_notice_accepted_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error(
        "[privacy-consent]",
        error.message,
        error.code,
        error.details,
        error.hint
      );
      return NextResponse.json(
        { error: "Erro ao registrar aceite", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "update",
      resourceType: "profile",
      details: { privacy_notice_accepted: true, version: FPSI_PRIVACY_NOTICE_VERSION },
      req: { headers: request.headers },
    });

    return NextResponse.json({
      user_id: user.id,
      privacy_notice_version_accepted: FPSI_PRIVACY_NOTICE_VERSION,
      privacy_notice_accepted_at: now,
    });
  } catch (e) {
    console.error("[privacy-consent]", e);
    return NextResponse.json(
      { error: "Erro interno", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
