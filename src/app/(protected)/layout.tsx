"use client";

import { Header } from "@components/header";
import { Box } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type IUser = {
  id: string;
  email: string;
  name?: string;
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetIdentity<IUser>();
  const router = useRouter();
  const pathname = usePathname();
  /** Rotas com MainAppShell no layout filho — não empilhar Header legado aqui. */
  const isDashboardShell =
    pathname === "/dashboard" ||
    pathname.startsWith("/referencias") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");
  /** Consulta a referências estáticas: LGPD e Governança de IA (sem login). */
  const isPublicReferencia =
    pathname === "/referencias/lgpd" || pathname === "/referencias/aigp";

  useEffect(() => {
    if (isPublicReferencia) return;
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router, pathname, isPublicReferencia]);

  if (isLoading && !isPublicReferencia) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Loading...
      </Box>
    );
  }

  if (!user && !isPublicReferencia) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isDashboardShell && <Header sticky />}
      {children}
    </Box>
  );
} 