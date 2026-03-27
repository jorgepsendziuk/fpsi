"use client";

import { Box } from "@mui/material";
import { MainAppShell } from "@/components/layout/MainAppShell";
import { useGetIdentity } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type IUser = {
  id: string;
  email: string;
  name?: string;
};

/** Rota única /dashboard: fica sob (protected) para não duplicar com app/dashboard (mesmo path). */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetIdentity<IUser>();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        Loading...
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainAppShell>
      <Box sx={{ flexGrow: 1, bgcolor: "background.default" }}>{children}</Box>
    </MainAppShell>
  );
}
