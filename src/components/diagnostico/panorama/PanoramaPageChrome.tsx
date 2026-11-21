"use client";

import React from "react";
import { Box } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { MainAppShell } from "@/components/layout/MainAppShell";

type IUser = { id: number; name: string; email: string; avatar: string };

const documentBoxSx = {
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
} as const;

/**
 * Panorama público: sem menu lateral. Com sessão ativa: MainAppShell como o resto do programa.
 */
export function PanoramaPageChrome({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetIdentity<IUser>();

  const inner = (
    <Box sx={documentBoxSx} className="panorama-page-chrome">
      {children}
    </Box>
  );

  if (isLoading || !user) {
    return inner;
  }

  return <MainAppShell>{inner}</MainAppShell>;
}