"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { MainAppShell } from "@/components/layout/MainAppShell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isPanoramaDocument = pathname.includes("/diagnostico/panorama");

  const content = (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          overscrollBehavior: "contain",
          bgcolor: "background.default",
          "@media print": {
            overflow: "visible",
            height: "auto",
          },
        }}
      >
        {children}
      </Box>
  );

  if (isPanoramaDocument) {
    return content;
  }

  return <MainAppShell>{content}</MainAppShell>;
} 