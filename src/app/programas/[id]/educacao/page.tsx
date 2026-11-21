"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { EducacaoPrograma } from "@/components/educacao/EducacaoPrograma";

export default function EducacaoProgramaPage() {
  const params = useParams();
  const routeParam = String(params?.id || "");
  return (
    <Suspense fallback={null}>
      <EducacaoPrograma routeParam={routeParam} />
    </Suspense>
  );
}
