import { redirect } from "next/navigation";

export default async function AvisoPortalTitularRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${encodeURIComponent(slug)}/aviso-do-portal`);
}
