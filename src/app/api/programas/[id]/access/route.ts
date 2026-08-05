import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";

/** GET /api/programas/[id]/access — modo de acesso do usuário atual */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;

  return NextResponse.json({
    mode: auth.access.mode,
    role: auth.access.role,
    areaIds: auth.access.areaIds,
    controleIds: auth.access.controleIds,
    diagnosticoIds: auth.access.diagnosticoIds,
    modulos: auth.access.modulos,
    isGovernancePapel: auth.access.isGovernancePapel,
    permissions: auth.access.permissions,
  });
}
