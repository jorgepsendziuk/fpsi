import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import sharp from "sharp";
import { logActivity } from "@/lib/services/auditService";
import {
  EVIDENCIA_A4_HEIGHT,
  EVIDENCIA_A4_WIDTH,
  EVIDENCIA_JPEG_QUALITY,
  EVIDENCIA_MAX_BYTES,
  EVIDENCIA_MAX_INPUT_BYTES,
  assertEvidenciaMimeAllowed,
  categoriaFromMime,
  sha256Hex,
  type EvidenciaAlvoTipo,
} from "@/lib/grc/evidenciaLimits";

async function requireMember(programaId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) } as const;
  }
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) } as const;
  }
  return { supabase, user } as const;
}

/**
 * GET /api/programas/[id]/evidencias?alvo_tipo=&alvo_id=
 * Lista evidências (sem base64) filtradas por vínculo opcional.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;

    const sp = request.nextUrl.searchParams;
    const alvoTipo = sp.get("alvo_tipo") as EvidenciaAlvoTipo | null;
    const alvoId = sp.get("alvo_id");
    const includeContent = sp.get("include_content") === "1";
    const evidenciaId = sp.get("id");

    if (evidenciaId) {
      const cols = includeContent
        ? "*"
        : "id, programa_id, titulo, descricao, categoria, mime_type, tamanho_bytes, nome_arquivo, url_externa, sha256, validade, versao, status, created_at, created_by";
      const { data, error } = await supabase
        .from("evidencia")
        .select(cols)
        .eq("programa_id", programaId)
        .eq("id", Number(evidenciaId))
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ evidencia: data });
    }

    if (alvoTipo && alvoId) {
      const { data: vinculos, error: vErr } = await supabase
        .from("evidencia_vinculo")
        .select("evidencia_id")
        .eq("programa_id", programaId)
        .eq("alvo_tipo", alvoTipo)
        .eq("alvo_id", String(alvoId));
      if (vErr) throw vErr;
      const ids = (vinculos || []).map((v) => v.evidencia_id);
      if (ids.length === 0) return NextResponse.json({ evidencias: [] });
      const { data, error } = await supabase
        .from("evidencia")
        .select(
          "id, programa_id, titulo, descricao, categoria, mime_type, tamanho_bytes, nome_arquivo, url_externa, sha256, validade, versao, status, created_at"
        )
        .eq("programa_id", programaId)
        .eq("status", "ativo")
        .in("id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ evidencias: data || [] });
    }

    const { data, error } = await supabase
      .from("evidencia")
      .select(
        "id, programa_id, titulo, descricao, categoria, mime_type, tamanho_bytes, nome_arquivo, url_externa, sha256, validade, versao, status, created_at"
      )
      .eq("programa_id", programaId)
      .eq("status", "ativo")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ evidencias: data || [] });
  } catch (e) {
    console.error("GET evidencias", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

/**
 * POST multipart: file | url_externa + titulo + alvo_tipo + alvo_id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase, user } = auth;

    const form = await request.formData();
    const titulo = String(form.get("titulo") || "").trim();
    const descricao = String(form.get("descricao") || "").trim();
    const alvoTipo = String(form.get("alvo_tipo") || "outro") as EvidenciaAlvoTipo;
    const alvoId = String(form.get("alvo_id") || "").trim();
    const validade = String(form.get("validade") || "").trim() || null;
    const urlExterna = String(form.get("url_externa") || "").trim() || null;
    const file = form.get("file");

    if (!titulo) {
      return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });
    }

    let mime = "text/uri-list";
    let tamanho = 0;
    let nomeArquivo: string | null = null;
    let conteudoBase64: string | null = null;
    let categoria = "link" as ReturnType<typeof categoriaFromMime> | "link";
    let hash: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (file.size > EVIDENCIA_MAX_INPUT_BYTES) {
        return NextResponse.json(
          { error: "Arquivo muito grande. Máximo 12MB de entrada." },
          { status: 400 }
        );
      }
      mime = file.type || "application/octet-stream";
      try {
        assertEvidenciaMimeAllowed(mime);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Tipo inválido" },
          { status: 400 }
        );
      }

      let bytes = new Uint8Array(await file.arrayBuffer());
      nomeArquivo = file.name;

      if (mime.startsWith("image/")) {
        bytes = new Uint8Array(
          await sharp(bytes)
            .rotate()
            .resize(EVIDENCIA_A4_WIDTH, EVIDENCIA_A4_HEIGHT, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: EVIDENCIA_JPEG_QUALITY, mozjpeg: true })
            .toBuffer()
        );
        mime = "image/jpeg";
        if (nomeArquivo && !/\.jpe?g$/i.test(nomeArquivo)) {
          nomeArquivo = nomeArquivo.replace(/\.[^.]+$/, "") + ".jpg";
        }
      }

      if (bytes.byteLength > EVIDENCIA_MAX_BYTES) {
        return NextResponse.json(
          { error: "Arquivo processado excede 5MB. Use PDF menor ou imagem mais leve." },
          { status: 400 }
        );
      }

      tamanho = bytes.byteLength;
      conteudoBase64 = Buffer.from(bytes).toString("base64");
      hash = await sha256Hex(Buffer.from(bytes));
      categoria = categoriaFromMime(mime);
    } else if (urlExterna) {
      categoria = "link";
      mime = "text/uri-list";
    } else {
      return NextResponse.json(
        { error: "Envie um arquivo (PDF/imagem/planilha) ou um link." },
        { status: 400 }
      );
    }

    const { data: ev, error: insErr } = await supabase
      .from("evidencia")
      .insert({
        programa_id: programaId,
        titulo,
        descricao,
        categoria,
        mime_type: mime,
        tamanho_bytes: tamanho,
        nome_arquivo: nomeArquivo,
        conteudo_base64: conteudoBase64,
        url_externa: urlExterna,
        sha256: hash,
        validade,
        versao: "1",
        status: "ativo",
        responsavel_user_id: user.id,
        created_by: user.id,
      })
      .select(
        "id, programa_id, titulo, descricao, categoria, mime_type, tamanho_bytes, nome_arquivo, url_externa, sha256, validade, versao, status, created_at"
      )
      .single();

    if (insErr) {
      console.error(insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    if (alvoId) {
      const { error: vErr } = await supabase.from("evidencia_vinculo").insert({
        evidencia_id: ev.id,
        programa_id: programaId,
        alvo_tipo: alvoTipo,
        alvo_id: alvoId,
      });
      if (vErr) console.error("vinculo", vErr);
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "upload",
      resourceType: "evidencia",
      resourceId: ev.id,
      programaId,
      details: { titulo, categoria, alvoTipo, alvoId },
      req: { headers: request.headers },
    });

    return NextResponse.json({ evidencia: ev }, { status: 201 });
  } catch (e) {
    console.error("POST evidencias", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
