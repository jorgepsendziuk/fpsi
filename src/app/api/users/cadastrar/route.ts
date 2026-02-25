import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { UserRole, getDefaultPermissions } from "@/lib/types/user";
import { shouldUseDemoData } from "@/lib/services/demoDataService";

async function getSupabaseClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return await createSupabaseServerClient();
}

/**
 * POST /api/users/cadastrar
 * Cadastra usuário e envia e-mail para definir senha no primeiro acesso.
 * Requer SUPABASE_SERVICE_ROLE_KEY (inviteUserByEmail usa Admin API).
 */
export async function POST(request: NextRequest) {
  try {
    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Cadastro por e-mail requer SUPABASE_SERVICE_ROLE_KEY configurada" },
        { status: 500 }
      );
    }

    // Usar server client para ler sessão dos cookies (admin não tem acesso à sessão)
    const serverClient = await createSupabaseServerClient();
    const { data: { user: currentUser }, error: authError } = await serverClient.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { programaId, email, nome, role } = body;

    if (!programaId || !email || !email.trim()) {
      return NextResponse.json(
        { error: "programaId e email são obrigatórios" },
        { status: 400 }
      );
    }

    if (shouldUseDemoData(programaId)) {
      return NextResponse.json(
        { error: "Não é possível cadastrar em programa demo" },
        { status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      emailNorm,
      {
        data: { nome: nome?.trim() || null },
        redirectTo: `${baseUrl}/programas`,
      }
    );

    if (inviteError) {
      console.error("Erro ao cadastrar usuário:", inviteError);
      const msg = inviteError.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado. Use a opção Convidar e envie o link manualmente." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Erro ao enviar convite por e-mail", details: inviteError.message },
        { status: 500 }
      );
    }

    const user = inviteData?.user;
    if (!user?.id) {
      return NextResponse.json(
        { error: "Convite enviado mas não foi possível adicionar ao programa" },
        { status: 500 }
      );
    }

    const permissions = getDefaultPermissions((role || UserRole.ANALISTA) as UserRole);

    // programa_users.user_id = auth.users.id (UUID) para compatibilidade com RLS e useUserPermissions
    const { error: insertError } = await admin.from("programa_users").insert({
      programa_id: programaId,
      user_id: user.id,
      role: role || UserRole.ANALISTA,
      permissions,
      status: "accepted",
      invited_by: currentUser.id,
      invited_at: new Date().toISOString(),
      accepted_at: new Date().toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({
          message: "Usuário cadastrado. Ele receberá um e-mail para definir a senha no primeiro acesso.",
        });
      }
      console.error("Erro ao inserir em programa_users:", insertError);
      return NextResponse.json(
        { error: "Erro ao adicionar usuário ao programa", details: insertError.message },
        { status: 500 }
      );
    }

    try {
      await admin.from("profiles").upsert(
        {
          user_id: user.id,
          email: user.email || emailNorm,
          nome: nome?.trim() || null,
          verified: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch {
      /* ignora - profile pode ser criado no primeiro login */
    }

    return NextResponse.json({
      message: "Usuário cadastrado. Ele receberá um e-mail para definir a senha no primeiro acesso.",
    });
  } catch (error) {
    console.error("Erro na API de cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
