"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Link as MuiLink } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { MainAppShell } from "@/components/layout/MainAppShell";

type IUser = { id: number; name: string; email: string; avatar: string };

const publicShellSx = {
  minHeight: "100dvh",
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  bgcolor: "#fff",
  "@media print": {
    height: "auto",
    minHeight: 0,
    overflow: "visible",
  },
} as const;

const documentBoxSx = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "y",
  bgcolor: "#fff",
  "@media print": {
    overflow: "visible",
    height: "auto",
    minHeight: "auto",
  },
} as const;

/**
 * Panorama público: sem menu lateral. Com sessão ativa: MainAppShell como o resto do programa.
 */
function PanoramaPublicTopBar() {
  return (
    <Box
      className="no-print panorama-public-topbar"
      sx={{
        px: { xs: 2, md: 3 },
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <MuiLink
        component={Link}
        href="/"
        underline="hover"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "text.primary",
        }}
      >
        <Image src="/logo_p.png" alt="" width={22} height={22} />
        FPSI — página inicial
      </MuiLink>
    </Box>
  );
}

export function PanoramaPageChrome({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetIdentity<IUser>();

  const documentArea = (
    <Box sx={documentBoxSx} className="panorama-page-chrome">
      {children}
    </Box>
  );

  if (isLoading || !user) {
    return (
      <Box sx={publicShellSx}>
        {!isLoading && !user ? <PanoramaPublicTopBar /> : null}
        {documentArea}
      </Box>
    );
  }

  return (
    <MainAppShell>
      {documentArea}
    </MainAppShell>
  );
}