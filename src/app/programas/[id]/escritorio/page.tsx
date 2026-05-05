"use client";

import { useParams } from "next/navigation";
import { ProgramOfficeShell } from "@/features/program-office";

export default function ProgramaEscritorioPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  return <ProgramOfficeShell idOrSlug={idOrSlug} />;
}
