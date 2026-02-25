import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { UserRole, getDefaultPermissions } from "@/lib/types/user";
import crypto from "crypto";

async function getSupabaseClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return await createSupabaseServerClient();
}

// GET /api/invites?programaId=xxx - Listar convites do programa
export async function GET(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const programaId = searchParams.get("programaId");
    if (!programaId) {
      return NextResponse.json({ error: "programaId é obrigatório" }, { status: 400 });
    }

    const { data: invites, error } = await supabase
      .from("programa_invites")
      .select("id, email, role, status, invited_at, expires_at")
      .eq("programa_id", parseInt(programaId, 10))
      .order("invited_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar convites:", error);
      return NextResponse.json(
        { error: "Erro ao listar convites", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(invites || []);
  } catch (error) {
    console.error("Erro na API de convites:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/invites - Criar convite
export async function POST(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();

    const body = await request.json();
    const { programaId, email, role, nome } = body;

    if (!programaId || !email || !email.trim()) {
      return NextResponse.json(
        { error: "programaId e email são obrigatórios" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const message = nome && String(nome).trim() ? JSON.stringify({ nome: String(nome).trim() }) : null;

    const { data: invite, error } = await supabase
      .from("programa_invites")
      .insert({
        programa_id: programaId,
        email: email.trim().toLowerCase(),
        role: role || UserRole.ANALISTA,
        permissions: getDefaultPermissions(role || UserRole.ANALISTA),
        token,
        status: "pending",
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        message,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Já existe convite pendente para este e-mail" },
          { status: 409 }
        );
      }
      console.error("Erro ao criar convite:", error);
      return NextResponse.json(
        { error: "Erro ao criar convite", details: error.message },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const inviteUrl = `${baseUrl}/auth/aceitar-convite?token=${token}`;

    return NextResponse.json({
      message: "Convite criado",
      invite,
      inviteUrl,
    });
  } catch (error) {
    console.error("Erro na API de convites:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/invites - Cancelar convite
export async function PATCH(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();

    const body = await request.json();
    const { inviteId, action } = body;

    if (!inviteId || action !== "cancel") {
      return NextResponse.json(
        { error: "inviteId e action=cancel são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: invite, error: fetchError } = await supabase
      .from("programa_invites")
      .select("id, status")
      .eq("id", inviteId)
      .single();

    if (fetchError || !invite) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Apenas convites pendentes podem ser cancelados" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("programa_invites")
      .update({ status: "declined", declined_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", inviteId);

    if (updateError) {
      console.error("Erro ao cancelar convite:", updateError);
      return NextResponse.json(
        { error: "Erro ao cancelar convite", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Convite cancelado" });
  } catch (error) {
    console.error("Erro na API de convites:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
