"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography, alpha } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import GppGoodIcon from "@mui/icons-material/GppGood";
import { AppAtmosphere } from "@/components/layout/AppAtmosphere";
import { SkipToMainLink } from "@/components/a11y/SkipToMainLink";
import { landing, featureAccents } from "@/components/landing/landingTokens";
import {
  PortalPublicHeaderProvider,
  usePortalPublicHeader,
} from "@/components/portal/PortalPublicHeaderContext";

function PortalTopBar() {
  const pathname = usePathname();
  const { header } = usePortalPublicHeader();
  const slugFromPath = pathname?.split("/").filter(Boolean)[0];
  const slug = header.slug ?? slugFromPath;
  const homeHref = slug ? `/${encodeURIComponent(slug)}` : "/";
  const orgName = header.orgName?.trim();
  const hasOrg = Boolean(orgName);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        color: landing.heroText,
        backdropFilter: "blur(14px)",
        bgcolor: alpha(landing.navy, 0.92),
        boxShadow: `0 4px 24px ${alpha(landing.ink, 0.35)}`,
        "&::after": {
          content: '""',
          display: "block",
          height: 3,
          background: featureAccents["portal-privacidade"],
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.15 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          component={Link}
          href={homeHref}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            textDecoration: "none",
            color: "inherit",
            minWidth: 0,
            flex: 1,
            "&:focus-visible": {
              outline: `2px solid ${landing.blueBright}`,
              outlineOffset: 3,
              borderRadius: 1,
            },
          }}
        >
          {header.logoUrl ? (
            <Box
              component="img"
              src={header.logoUrl}
              alt=""
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.25,
                objectFit: "contain",
                bgcolor: alpha("#fff", 0.12),
                p: 0.35,
                border: `1px solid ${alpha("#fff", 0.14)}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.25,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: featureAccents["portal-privacidade"],
                boxShadow: `0 4px 14px ${alpha(landing.navy, 0.45)}`,
              }}
            >
              <ShieldOutlinedIcon sx={{ fontSize: 22 }} aria-hidden />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              letterSpacing="-0.02em"
              lineHeight={1.2}
              noWrap={hasOrg}
              sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" } }}
            >
              {hasOrg ? orgName : "Portal do titular"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: landing.heroMuted,
                fontSize: "0.8125rem",
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {hasOrg ? "Privacidade e proteção de dados pessoais" : "Canal oficial da organização"}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexShrink: 0,
            px: { xs: 0, sm: 1.25 },
            py: { xs: 0, sm: 0.5 },
            borderRadius: 1,
            bgcolor: { xs: "transparent", sm: alpha("#fff", 0.08) },
            border: { xs: "none", sm: `1px solid ${alpha("#fff", 0.12)}` },
          }}
        >
          <GppGoodIcon sx={{ fontSize: 20, color: landing.blueBright }} aria-hidden />
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: landing.heroMuted,
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Portal de Privacidade
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function PortalPublicShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalPublicHeaderProvider>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        <SkipToMainLink />
        <AppAtmosphere />
        <PortalTopBar />
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, position: "relative", zIndex: 1 }}>
          {children}
        </Box>
        <Box
          component="footer"
          sx={{
            position: "relative",
            zIndex: 1,
            py: 2,
            px: 2,
            textAlign: "center",
            borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
            bgcolor: (t) => alpha(t.palette.background.paper, t.palette.mode === "dark" ? 0.5 : 0.75),
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
            Direitos do titular (LGPD) · canal de transparência da organização
          </Typography>
        </Box>
      </Box>
    </PortalPublicHeaderProvider>
  );
}
