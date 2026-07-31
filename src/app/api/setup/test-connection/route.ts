import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/setup/setupStatus";

type Body = {
  url?: string;
  anonKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const url = body.url?.trim();
    const anonKey = body.anonKey?.trim();

    if (!url || !anonKey) {
      return NextResponse.json(
        { ok: false, error: "Informe a URL e a chave anon do Supabase." },
        { status: 400 }
      );
    }

    const status = await getSetupStatus({ url, anonKey });
    const ok =
      status.database.connected &&
      (status.database.controleCount ?? 0) >= 1 &&
      !status.database.message?.includes("Não foi possível");

    return NextResponse.json({
      ok,
      status,
      hint: ok
        ? "Conexão válida. Salve o .env.local, reinicie npm run dev e aplique as migrações se o catálogo estiver vazio."
        : status.database.message ?? "Verifique URL, chave anon e se as migrações foram aplicadas.",
    });
  } catch (error) {
    console.error("[api/setup/test-connection]", error);
    return NextResponse.json(
      { ok: false, error: "Falha ao testar a conexão." },
      { status: 500 }
    );
  }
}
