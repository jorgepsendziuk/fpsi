import { redirect } from "next/navigation";

export default async function DeclaracaoSegurancaRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${encodeURIComponent(slug)}/declaracao-de-seguranca`);
}
