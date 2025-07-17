"use client";

import { Header } from "@components/header";
import { Box } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
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
      <Header sticky />
      {children}
    </Box>
  );
} 