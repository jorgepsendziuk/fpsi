import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { checkAiSuggestRateLimit } from "@/lib/ai/rateLimitMemory";
import {
  mapeamentoSugestaoItemSchema,
  sanitizeMapeamentoSugestao,
  suggestMapeamentosResponseSchema,
} from "@/lib/ai/suggestMapeamentosSchema";
import { buildSuggestMapeamentosSystemPrompt, buildSuggestMapeamentosUserMessage } from "@/lib/ai/buildSuggestMapeamentosPrompt";
import { SETOR_AREA_OPCOES } from "@/lib/utils/mapeamentoDadosOptions";

const bodySchema = z.object({
  programaId: z.number().int().positive(),
  focusSetorAreas: z.array(z.string().min(1).max(32)).max(9).optional(),
  count: z.number().int().min(3).max(7).optional(),
});

const SETOR_KEYS = new Set<string>(SETOR_AREA_OPCOES.map((o) => o.key));

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

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Serviço de sugestões indisponível",
          details: "Configure OPENAI_API_KEY no ambiente do servidor.",
        },
        { status: 503 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const parsedBody = bodySchema.safeParse(json);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const { programaId, count: countRaw, focusSetorAreas } = parsedBody.data;
    const focus =
      focusSetorAreas?.filter((k) => SETOR_KEYS.has(k)) ?? undefined;
    const count = countRaw ?? 5;

    const rate = checkAiSuggestRateLimit(`suggest-map:${user.id}:${programaId}`);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Limite de pedidos excedido. Tenta novamente mais tarde.", retryAfterSec: rate.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const member = await isProgramaMember(supabase, programaId, user.id);
    if (!member) {
      return NextResponse.json({ error: "Sem acesso a este programa" }, { status: 403 });
    }

    const { data: programa, error: pErr } = await supabase
      .from("programa")
      .select("id, nome, descricao_escopo, atividade_principal_organizacao, tipo_programa, empresa_id, deleted_at")
      .eq("id", programaId)
      .is("deleted_at", null)
      .maybeSingle();

    if (pErr || !programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    let empresa: { razao_social: string | null; atividade_principal: string | null } | null = null;
    const eid = programa.empresa_id as number | null | undefined;
    if (eid != null) {
      const { data: emp } = await supabase
        .from("empresa")
        .select("razao_social, atividade_principal")
        .eq("id", eid)
        .maybeSingle();
      if (emp) empresa = emp;
    }

    const systemPrompt = buildSuggestMapeamentosSystemPrompt(focus);
    const userMessage = buildSuggestMapeamentosUserMessage({
      count,
      programa: {
        nome: programa.nome ?? null,
        descricao_escopo: programa.descricao_escopo ?? null,
        atividade_principal_organizacao: programa.atividade_principal_organizacao ?? null,
        tipo_programa: programa.tipo_programa ?? null,
      },
      empresa,
    });

    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Resposta vazia do modelo" }, { status: 502 });
    }

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(content) as unknown;
    } catch {
      return NextResponse.json({ error: "JSON inválido devolvido pelo modelo" }, { status: 502 });
    }

    const validated = suggestMapeamentosResponseSchema.safeParse(rawJson);
    if (!validated.success) {
      const items = z.array(z.unknown()).safeParse((rawJson as { suggestions?: unknown }).suggestions);
      if (items.success) {
        const cleaned = items.data
          .map((item) => mapeamentoSugestaoItemSchema.safeParse(item))
          .filter((r): r is z.SafeParseSuccess<z.infer<typeof mapeamentoSugestaoItemSchema>> => r.success)
          .map((r) => sanitizeMapeamentoSugestao(r.data));
        if (cleaned.length > 0) {
          return NextResponse.json({ suggestions: cleaned, model });
        }
      }
      return NextResponse.json(
        { error: "Não foi possível validar as sugestões", details: validated.error.flatten() },
        { status: 502 }
      );
    }

    const suggestions = validated.data.suggestions.map(sanitizeMapeamentoSugestao);
    return NextResponse.json({ suggestions, model });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("suggest-mapeamentos:", e);
    return NextResponse.json({ error: "Erro interno", details: message }, { status: 500 });
  }
}
