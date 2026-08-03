import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { getDefaultPermissions, UserRole, type ProgramaPermissions } from "@/lib/types/user";

function permissionsAllowEdit(permissions: unknown): boolean {
  if (!permissions || typeof permissions !== "object") return false;
  return (permissions as ProgramaPermissions).can_edit_programa === true;
}

function roleAllowsEdit(role: unknown): boolean {
  if (!role || typeof role !== "string") return false;
  return getDefaultPermissions(role as UserRole).can_edit_programa === true;
}

/** Pode alterar escopo do programa (PATCH /escopo). */
export async function canEditProgramaEscopo(
  supabase: SupabaseClient,
  programaId: number,
  userId: string
): Promise<boolean> {
  const admin = await requireSystemAdmin();
  if (admin.ok && admin.user.id === userId) return true;

  const { data: member } = await supabase
    .from("programa_users")
    .select("permissions, role")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!member) return false;
  if (permissionsAllowEdit(member.permissions)) return true;
  if (roleAllowsEdit(member.role)) return true;

  const { data: creator } = await supabase
    .from("programa_users")
    .select("user_id")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return creator?.user_id === userId;
}
