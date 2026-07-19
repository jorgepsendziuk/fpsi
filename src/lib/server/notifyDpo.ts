import type { SupabaseClient } from "@supabase/supabase-js";

type NotifyEvent =
  | "novo_dsar"
  | "novo_reporte"
  | "novo_contato"
  | "novo_incidente";

type NotifyPayload = {
  event: NotifyEvent;
  programaId: number;
  programaNome: string;
  programaSlug: string | null;
  titulo: string;
  detalhes?: string;
  emails: string[];
};

function buildSubject(payload: NotifyPayload): string {
  const prefix: Record<NotifyEvent, string> = {
    novo_dsar: "[FPSI] Novo pedido de titular",
    novo_reporte: "[FPSI] Novo reporte no portal",
    novo_contato: "[FPSI] Nova mensagem de contato",
    novo_incidente: "[FPSI] Novo incidente registrado",
  };
  return `${prefix[payload.event]} — ${payload.programaNome}`;
}

function buildBody(payload: NotifyPayload): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://fpsi.vercel.app";
  const programaPath = payload.programaSlug
    ? `${base}/programas/${payload.programaSlug}`
    : `${base}/programas/${payload.programaId}`;
  return [
    payload.titulo,
    payload.detalhes ? `\n${payload.detalhes}` : "",
    `\n\nPrograma: ${payload.programaNome}`,
    `Acessar: ${programaPath}`,
  ].join("");
}

/**
 * Envia notificação ao DPO/equipe. Usa Resend se RESEND_API_KEY estiver configurada; caso contrário registra no log.
 */
export async function notifyDpoTeam(payload: NotifyPayload): Promise<void> {
  const uniqueEmails = Array.from(
    new Set(payload.emails.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  if (uniqueEmails.length === 0) {
    console.info("[notifyDpo] Sem destinatários para", payload.event, payload.programaId);
    return;
  }

  const subject = buildSubject(payload);
  const body = buildBody(payload);
  const from = process.env.RESEND_FROM_EMAIL || "FPSI <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[notifyDpo]", subject, "→", uniqueEmails.join(", "), body.slice(0, 200));
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: uniqueEmails,
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[notifyDpo] Resend falhou:", res.status, errText);
    }
  } catch (err) {
    console.error("[notifyDpo] Erro ao enviar e-mail:", err);
  }
}

export async function resolveProgramaNotifyEmails(
  admin: SupabaseClient,
  programaId: number
): Promise<string[]> {
  const emails: string[] = [];
  const adminEmails = (process.env.FPSI_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  emails.push(...adminEmails);

  const { data: programa } = await admin
    .from("programa")
    .select("nome, dpo_notificacao_email, atendimento_email, encarregado_dados_pessoais")
    .eq("id", programaId)
    .maybeSingle();

  if (programa?.dpo_notificacao_email) {
    emails.push(String(programa.dpo_notificacao_email));
  }
  if (programa?.atendimento_email) {
    emails.push(String(programa.atendimento_email));
  }

  const encId = programa?.encarregado_dados_pessoais as number | null | undefined;
  if (encId) {
    const { data: resp } = await admin
      .from("responsavel")
      .select("email")
      .eq("id", encId)
      .maybeSingle();
    if (resp?.email) emails.push(String(resp.email));
  }

  return emails;
}
