"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redireciona /programas para /dashboard.
 * A listagem de programas foi movida para o dashboard.
 */
export default function ProgramasRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
