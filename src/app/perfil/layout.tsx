"use client";

import { Box } from "@mui/material";
import { MainAppShell } from "@/components/layout/MainAppShell";

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainAppShell>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100%" }}>
        {children}
      </Box>
    </MainAppShell>
  );
}
