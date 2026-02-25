import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { UserRole, getDefaultPermissions } from "@/lib/types/user";

async function getSupabaseClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return await createSupabaseServerClient();
}

// POST /api/invites/accept - Aceitar convite (usuário autenticado)
export async function POST(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await supabase
      .from("programa_invites")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Convite inválido" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Convite já utilizado" }, { status: 400 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Convite expirado" }, { status: 400 });
    }

    const inviteEmail = (invite.email || "").trim().toLowerCase();
    const userEmail = (user.email || "").trim().toLowerCase();
    if (inviteEmail !== userEmail) {
      return NextResponse.json(
        { error: "O e-mail da conta não corresponde ao convite" },
        { status: 403 }
      );
    }

    const permissions = getDefaultPermissions(invite.role as UserRole);

    // programa_users.user_id = auth.uid() (UUID) para compatibilidade com RLS e useUserPermissions
    const { error: insertError } = await supabase.from("programa_users").insert({
      programa_id: invite.programa_id,
      user_id: user.id,
      role: invite.role,
      permissions,
      status: "accepted",
      invited_by: invite.invited_by,
      invited_at: invite.invited_at,
      accepted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        await supabase
          .from("programa_invites")
          .update({ status: "accepted", accepted_at: new Date().toISOString() })
          .eq("id", invite.id);
        return NextResponse.json({ message: "Você já tem acesso a este programa" });
      }
      console.error("Erro ao aceitar convite:", insertError);
      return NextResponse.json(
        { error: "Erro ao aceitar convite", details: insertError.message },
        { status: 500 }
      );
    }

    await supabase
      .from("programa_invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    let nome: string | undefined;
    if (invite.message) {
      try {
        const parsed = JSON.parse(invite.message) as { nome?: string };
        if (parsed?.nome) nome = parsed.nome;
      } catch {
        /* ignore */
      }
    }

    try {
      await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            ...(nome ? { nome } : {}),
            verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    } catch {
      /* ignore - profile pode não existir ainda */
    }

    const { data: programa } = await supabase
      .from("programa")
      .select("slug")
      .eq("id", invite.programa_id)
      .single();
    return NextResponse.json({
      message: "Convite aceito com sucesso",
      programaId: invite.programa_id,
      programaSlug: programa?.slug ?? null,
    });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
