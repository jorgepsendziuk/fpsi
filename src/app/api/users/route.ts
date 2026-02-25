import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { shouldUseDemoData } from "@/lib/services/demoDataService";
import { UserRole, getDefaultPermissions } from "@/lib/types/user";

// programa_users.user_id deve ser sempre auth.uid() em string (UUID). RLS e useUserPermissions dependem disso.
async function getSupabaseClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return await createSupabaseServerClient();
}

// GET /api/users?programaId=1 - Listar usuários do programa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programaId = parseInt(searchParams.get("programaId") || "0");

    if (!programaId) {
      return NextResponse.json(
        { error: "programaId é obrigatório" },
        { status: 400 }
      );
    }

    if (shouldUseDemoData(programaId)) {
      return NextResponse.json([
        {
          id: 1,
          programa_id: programaId,
          user_id: "demo@fpsi.com.br",
          role: UserRole.ADMIN,
          permissions: getDefaultPermissions(UserRole.ADMIN),
          status: "accepted",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          nome: "Usuário Demo",
          email: "demo@fpsi.com.br",
        },
      ]);
    }

    const supabase = await getSupabaseClient();

    const { data: users, error } = await supabase
      .from("programa_users")
      .select("*")
      .eq("programa_id", programaId)
      .eq("status", "accepted");

    if (error) {
      console.error("Erro ao buscar usuários:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json(
        { error: "Erro ao buscar usuários", details: error.message },
        { status: 500 }
      );
    }

    if (!users?.length) return NextResponse.json([]);

    const userIds = Array.from(new Set(users.map((u: { user_id: string }) => u.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nome, email")
      .in("user_id", userIds);

    const profileByUserId = (profiles || []).reduce(
      (acc: Record<string, { nome?: string; email?: string }>, p: { user_id: string; nome?: string; email?: string }) => {
        acc[p.user_id] = { nome: p.nome, email: p.email };
        return acc;
      },
      {}
    );

    const enriched = users.map((u: { user_id: string; [k: string]: unknown }) => {
      const profile = profileByUserId[u.user_id];
      return {
        ...u,
        nome: profile?.nome ?? null,
        email: profile?.email ?? u.user_id,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Erro na API de usuários (GET):", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Adicionar/atualizar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { programaId, userId, role, action = "add" } = body;

    if (!programaId || !userId) {
      return NextResponse.json(
        { error: "programaId e userId são obrigatórios" },
        { status: 400 }
      );
    }

    const permissions = getDefaultPermissions(role || UserRole.ANALISTA);

    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: `Usuário ${action === "add" ? "adicionado" : "atualizado"} com sucesso (modo demo)`,
        data: {
          id: Date.now(),
          programa_id: programaId,
          user_id: userId,
          role: role || UserRole.ANALISTA,
          permissions,
          status: "accepted",
          created_at: new Date().toISOString(),
        },
      });
    }

    const supabase = await getSupabaseClient();

    if (action === "update_role") {
      const { data, error } = await supabase
        .from("programa_users")
        .update({
          role,
          permissions,
          updated_at: new Date().toISOString(),
        })
        .eq("programa_id", programaId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar usuário:", {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        return NextResponse.json(
          {
            error: "Erro ao atualizar usuário",
            details: error.message,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ message: "Função alterada com sucesso", data });
    }

    // Adicionar novo usuário (userId deve ser UUID do auth.users, ex.: vindo da lista GET /api/users)
    const { data, error } = await supabase
      .from("programa_users")
      .insert({
        programa_id: programaId,
        user_id: userId,
        role: role || UserRole.ANALISTA,
        permissions,
        status: "accepted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar usuário:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json(
        {
          error: "Erro ao adicionar usuário",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Usuário adicionado com sucesso", data });
  } catch (error) {
    console.error("Erro na API de usuários (POST):", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Remover usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programaId = parseInt(searchParams.get("programaId") || "0");
    const userId = searchParams.get("userId");

    if (!programaId || !userId) {
      return NextResponse.json(
        { error: "programaId e userId são obrigatórios" },
        { status: 400 }
      );
    }

    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: "Usuário removido com sucesso (modo demo)",
      });
    }

    const supabase = await getSupabaseClient();

    const { error } = await supabase
      .from("programa_users")
      .delete()
      .eq("programa_id", programaId)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover usuário:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json(
        {
          error: "Erro ao remover usuário",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    console.error("Erro na API de remover usuário:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
