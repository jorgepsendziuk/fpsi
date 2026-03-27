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
  /** /dashboard usa MainAppShell no layout filho; não empilhar Header aqui. */
  const isDashboardShell = pathname === "/dashboard";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isDashboardShell && <Header sticky />}
      {children}
    </Box>
  );
} 