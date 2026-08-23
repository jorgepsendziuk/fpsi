import { redirect } from "next/navigation";

export default async function TermoUsoRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${encodeURIComponent(slug)}/termos-de-uso`);
}
