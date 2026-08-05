import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getProgramaAccess, type ProgramaAccess } from "@/lib/authz/programaAccess";

export async function requireProgramaAccess(
  programaId: number,
  opts?: { fullOnly?: boolean }
): Promise<
  | { error: NextResponse }
  | { supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>; user: { id: string }; access: ProgramaAccess }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }

  const access = await getProgramaAccess(supabase as SupabaseClient, programaId, user.id);
  if (!access) {
    return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  }

  if (opts?.fullOnly && access.mode !== "full") {
    return { error: NextResponse.json({ error: "Somente gestores do programa" }, { status: 403 }) };
  }

  return { supabase, user, access };
}
