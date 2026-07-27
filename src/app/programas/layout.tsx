"use client";

import { Box } from "@mui/material";
import { MainAppShell } from "@/components/layout/MainAppShell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainAppShell>
      <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100%" }}>
        {children}
      </Box>
    </MainAppShell>
  );
} 