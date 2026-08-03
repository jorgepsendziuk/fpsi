import { NextResponse } from "next/server";
import { getEnvVarStatuses } from "@/lib/admin/envConfig";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { getSetupStatus } from "@/lib/setup/setupStatus";

export async function GET() {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  try {
    const [setup, envVars] = await Promise.all([getSetupStatus(), Promise.resolve(getEnvVarStatuses())]);

    return NextResponse.json({
      setup,
      envVars,
      nodeEnv: process.env.NODE_ENV ?? "development",
    });
  } catch (error) {
    console.error("[api/admin/config/status]", error);
    return NextResponse.json({ error: "Não foi possível carregar configurações." }, { status: 500 });
  }
}
