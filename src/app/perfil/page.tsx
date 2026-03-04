"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, CircularProgress } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { PerfilContent } from "@/components/perfil/PerfilContent";

type IUser = {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
};

export default function PerfilPage() {
  const router = useRouter();
  const { data: user, isLoading } = useGetIdentity<IUser>();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <Box sx={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <PerfilContent />
    </Container>
  );
}
