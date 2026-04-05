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
  /** /dashboard e /referencias usam MainAppShell no layout filho; não empilhar Header aqui. */
  const isDashboardShell = pathname === "/dashboard" || pathname.startsWith("/referencias");
  /** Consulta ao texto da LGPD: conteúdo estático, acesso público (sem login). */
  const isPublicLgpdReferencia = pathname === "/referencias/lgpd";

  useEffect(() => {
    if (isPublicLgpdReferencia) return;
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router, pathname, isPublicLgpdReferencia]);

  if (isLoading && !isPublicLgpdReferencia) {
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

  if (!user && !isPublicLgpdReferencia) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isDashboardShell && <Header sticky />}
      {children}
    </Box>
  );
} 