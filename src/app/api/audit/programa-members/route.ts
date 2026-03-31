import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

function memberLabel(nome: string | null | undefined, email: string | null | undefined, userId: string): string {
  const n = nome?.trim();
  if (n) return email ? `${n} (${email})` : n;
  if (email?.trim()) return email.trim();
  return `Usuário ${userId.slice(0, 8)}…`;
}

/**
 * GET /api/audit/programa-members?programa_id=
 * Membros aceitos do programa com rótulo amigável (para filtro da auditoria).
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
    const programaIdRaw = searchParams.get("programa_id");
    const progId = programaIdRaw ? parseInt(programaIdRaw, 10) : NaN;
    if (Number.isNaN(progId)) {
      return NextResponse.json({ error: "programa_id inválido" }, { status: 400 });
    }

    const { data: member } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("programa_id", progId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ members: [] as { user_id: string; label: string }[] });
    }

    const { data: pu, error: puErr } = await admin
      .from("programa_users")
      .select("user_id")
      .eq("programa_id", progId)
      .eq("status", "accepted");

    if (puErr || !pu?.length) {
      return NextResponse.json({ members: [] });
    }

    const userIds = Array.from(new Set(pu.map((r) => r.user_id).filter(Boolean)));
    const { data: profs } = await admin.from("profiles").select("user_id, nome, email").in("user_id", userIds);

    const byId = new Map((profs ?? []).map((p) => [String(p.user_id), p]));

    const members = userIds.map((uid) => {
      const p = byId.get(String(uid));
      return {
        user_id: String(uid),
        label: memberLabel(p?.nome, p?.email, String(uid)),
      };
    });

    members.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

    return NextResponse.json({ members });
  } catch (err) {
    console.error("[audit] GET /api/audit/programa-members:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
