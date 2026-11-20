import { redirect } from "next/navigation";

/** Atalho: /programas/{id}/panorama → documento em Diagnóstico */
export default async function ProgramaPanoramaRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/programas/${encodeURIComponent(id)}/diagnostico/panorama`);
}