import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/setup/setupStatus";

export async function GET() {
  try {
    const status = await getSetupStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[api/setup/status]", error);
    return NextResponse.json(
      { error: "Não foi possível verificar o status da implantação." },
      { status: 500 }
    );
  }
}
