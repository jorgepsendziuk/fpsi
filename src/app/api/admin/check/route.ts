import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    // Bypass via env: FPSI_ADMIN_EMAILS=email1@exemplo.com,email2@exemplo.com
    const adminEmails = (process.env.FPSI_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.length > 0 && user.email) {
      const emailNorm = user.email.trim().toLowerCase();
      if (adminEmails.includes(emailNorm)) {
        return NextResponse.json({ isAdmin: true });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_system_admin")
      .eq("user_id", user.id)
      .single();

    const isAdmin = profile?.is_system_admin === true;
    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
