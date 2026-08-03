"use client";

import { Box, Skeleton } from "@mui/material";
import { MainAppShell } from "@/components/layout/MainAppShell";
import { useGetIdentity } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: userLoading } = useGetIdentity();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || userLoading) return;
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setIsAdmin(data?.isAdmin === true);
        if (!data?.isAdmin) {
          router.replace("/dashboard");
        }
      } catch {
        setIsAdmin(false);
        router.replace("/dashboard");
      }
    };
    void checkAdmin();
  }, [user, userLoading, router]);

  if (userLoading || isAdmin === false) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Skeleton variant="rectangular" width={300} height={100} />
      </Box>
    );
  }

  if (!user || isAdmin !== true) {
    return null;
  }

  return (
    <MainAppShell>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100%",
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Box>
    </MainAppShell>
  );
}
