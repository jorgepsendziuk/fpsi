import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import sharp from "sharp";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB input
const TARGET_SIZE = 128; // 128x128 para avatar
const JPEG_QUALITY = 82;

/**
 * POST /api/profiles/avatar
 * Body: FormData com "file" (imagem)
 * Comprime e redimensiona a imagem, salva no profiles.avatar_url como base64.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Envie 'file' (imagem)" },
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
      .resize(TARGET_SIZE, TARGET_SIZE, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const base64 = resized.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    const { data: existing } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: dataUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Erro ao salvar avatar:", updateError);
        return NextResponse.json(
          { error: "Erro ao salvar foto", details: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        email: user.email ?? null,
        avatar_url: dataUrl,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Erro ao salvar avatar:", insertError);
        return NextResponse.json(
          { error: "Erro ao salvar foto", details: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      avatar_url: dataUrl,
      message: "Foto atualizada com sucesso",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API POST avatar:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem", details: message },
      { status: 500 }
    );
  }
}
