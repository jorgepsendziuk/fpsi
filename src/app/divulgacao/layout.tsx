import type { Metadata } from "next";

/** Rota intencionalmente não linkada no app; metadados discretos e sem indexação. */
export const metadata: Metadata = {
  title: "Notas",
  description: "Rascunhos pessoais",
  robots: { index: false, follow: false },
};

export default function DivulgacaoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
