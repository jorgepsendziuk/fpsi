"use client";

import { ThemedLayoutV2 } from "@refinedev/mui";
import { Header } from "@components/header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemedLayoutV2 Header={() => <Header sticky />}>
      {children}
    </ThemedLayoutV2>
  );
} 