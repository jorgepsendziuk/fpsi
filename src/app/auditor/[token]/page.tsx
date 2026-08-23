"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AuditorPortalError,
  AuditorPortalLoading,
  AuditorPortalView,
} from "@/components/auditor/AuditorPortalView";
import type { AuditorPortalPayload } from "@/lib/auditor/auditorPortal";

export default function AuditorPortalPage() {
  const params = useParams();
  const token = String(params?.token || "");
  const [data, setData] = useState<(AuditorPortalPayload & { error?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auditor/${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: "Falha ao carregar" } as never))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <AuditorPortalLoading />;
  if (!data || !("ok" in data) || !data.ok) {
    return (
      <AuditorPortalError
        message={(data as { error?: string } | null)?.error || "Acesso inválido ou expirado."}
      />
    );
  }
  return <AuditorPortalView data={data} token={token} />;
}
