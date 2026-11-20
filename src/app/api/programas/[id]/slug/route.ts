import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import { validateProgramaSlug } from "@/lib/programa/programaSlug";
import { logActivity } from "@/lib/services/auditService";

function podeEditarPrograma(access: { mode: string; permissions: { can_edit_programa?: boolean } | null }): boolean {
  return access.mode === "full" || Boolean(access.permissions?.can_edit_programa);
}

/**
 * PATCH /api/programas/[id]/slug — body { slug: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;
  if (!podeEditarPrograma(auth.access)) {
    return NextResponse.json({ error: "Sem permissão para editar o programa" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const validated = validateProgramaSlug(String(body.slug ?? ""));
  if (!validated.ok) {
    return NextResponse.json({ error: validated.reason, slug: validated.slug }, { status: 400 });
  }

  const { data: atual } = await auth.supabase
    .from("programa")
    .select("slug")
    .eq("id", programaId)
    .maybeSingle();

  if (atual?.slug === validated.slug) {
    return NextResponse.json({ slug: validated.slug, alterado: false });
  }

  const { data: conflito } = await auth.supabase
    .from("programa")
    .select("id")
    .eq("slug", validated.slug)
    .is("deleted_at", null)
    .neq("id", programaId)
    .maybeSingle();

  if (conflito) {
    return NextResponse.json(
      { error: "Este slug já está em uso por outro programa nesta instalação." },
      { status: 409 }
    );
  }

  const { error: updateError } = await auth.supabase
    .from("programa")
    .update({ slug: validated.slug })
    .eq("id", programaId);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json({ error: "Este slug já está em uso." }, { status: 409 });
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await logActivity(auth.supabase, {
    userId: auth.user.id,
    action: "update",
    resourceType: "programa",
    resourceId: programaId,
    programaId,
    details: { field: "slug", anterior: atual?.slug ?? null, novo: validated.slug },
    req: { headers: request.headers },
  });

  return NextResponse.json({ slug: validated.slug, alterado: true, anterior: atual?.slug ?? null });
}