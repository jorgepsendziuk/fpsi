import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// POST /api/profiles/verify - Marcar perfil como verificado (após login com senha)
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          verified: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
