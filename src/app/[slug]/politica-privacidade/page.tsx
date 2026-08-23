import { redirect } from "next/navigation";

export default async function PoliticaPrivacidadeRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${encodeURIComponent(slug)}/politica-de-privacidade`);
}
