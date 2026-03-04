import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import sharp from "sharp";
import { logActivity } from "@/lib/services/auditService";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB input
const TARGET_WIDTH = 256;
const TARGET_HEIGHT = 256;
const JPEG_QUALITY = 82;

/** Verifica se o usuário é membro aceito do programa */
async function isProgramaMember(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  programaId: number,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return !!data;
}

/**
 * POST /api/programas/[id]/logo
 * Body: FormData com "file" (imagem) e "tipo" ("orgao" | "programa")
 * Comprime e redimensiona a imagem, salva no banco como base64.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isMember = await isProgramaMember(supabase, programaId, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "Você não tem permissão para alterar este programa" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tipo = formData.get("tipo") as string | null;

    if (!file || !tipo) {
      return NextResponse.json(
        { error: "Envie 'file' (imagem) e 'tipo' (orgao ou programa)" },
        { status: 400 }
      );
    }

    if (!["orgao", "programa"].includes(tipo)) {
      return NextResponse.json(
        { error: "tipo deve ser 'orgao' ou 'programa'" },
        { status: 400 }
      );
    }

    const mime = file.type;
    if (!mime?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Arquivo deve ser uma imagem (PNG, JPEG, WebP)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resized = await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const base64 = resized.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    const column = tipo === "orgao" ? "logo_orgao_empresa" : "logo_programa";

    const { error: updateError } = await supabase
      .from("programa")
      .update({ [column]: dataUrl })
      .eq("id", programaId);

    if (updateError) {
      console.error("Erro ao salvar logo:", updateError);
      return NextResponse.json(
        { error: "Erro ao salvar logo", details: updateError.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "upload",
      resourceType: "programa",
      resourceId: programaId,
      programaId,
      details: { tipo },
      req: { headers: request.headers },
    });

    return NextResponse.json({
      success: true,
      tipo,
      size: resized.length,
      message: "Logo enviada com sucesso",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API POST logo:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem", details: message },
      { status: 500 }
    );
  }
}
