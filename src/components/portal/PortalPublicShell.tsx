"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography, alpha, Link as MuiLink } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import { AppAtmosphere } from "@/components/layout/AppAtmosphere";
import { SkipToMainLink } from "@/components/a11y/SkipToMainLink";
import { landing, featureAccents } from "@/components/landing/landingTokens";
import {
  PortalPublicHeaderProvider,
  usePortalPublicHeader,
  type PortalPublicHeaderOrgDetails,
} from "@/components/portal/PortalPublicHeaderContext";
import { PortalPublicSeloLink } from "@/components/portal/PortalPublicSeloLink";
import { formatCnpjBrasil } from "@/lib/utils/politicaPlaceholders";

function hasBasicInfo(d: PortalPublicHeaderOrgDetails) {
  return Boolean(d.razao_social || (d.cnpj != null && String(d.cnpj).trim() !== ""));
}

function hasContactInfo(d: PortalPublicHeaderOrgDetails) {
  return Boolean(
    d.dpo_nome ||
      d.dpo_email ||
      d.atendimento_fone ||
      d.atendimento_email ||
      d.atendimento_site
  );
}

function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function whatsappHref(phone: string): string | null {
  const digits = phoneDigits(phone);
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

function WhatsAppGlyph({ size = 16 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: size, height: size, display: "block", fill: "currentColor" }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </Box>
  );
}

function HeaderIconTile({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.25,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: featureAccents["portal-privacidade"],
        color: "#fff",
        boxShadow: `0 4px 12px ${alpha(landing.blue, 0.35)}`,
        "& .MuiSvgIcon-root": { fontSize: 18 },
      }}
    >
      {children}
    </Box>
  );
}

function HeaderFact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, minWidth: 0 }}>
      <HeaderIconTile>{icon}</HeaderIconTile>
      <Box sx={{ minWidth: 0, pt: 0.15 }}>
        <Typography
          component="span"
          sx={{
            display: "block",
            color: alpha(landing.heroText, 0.72),
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: landing.heroText,
            lineHeight: 1.4,
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            fontWeight: 600,
            wordBreak: "break-word",
          }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

function HeaderAction({
  href,
  icon,
  children,
  accent,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: "whatsapp" | "default";
  external?: boolean;
}) {
  const isWa = accent === "whatsapp";
  return (
    <Box
      component={MuiLink}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.1,
        py: 0.55,
        borderRadius: 2,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: "0.78rem",
        lineHeight: 1.2,
        color: isWa ? "#fff" : landing.heroText,
        bgcolor: isWa ? landing.shield : alpha("#fff", 0.1),
        border: `1px solid ${isWa ? alpha("#fff", 0.18) : alpha("#fff", 0.2)}`,
        boxShadow: isWa ? `0 6px 16px ${alpha(landing.shieldDeep, 0.4)}` : "none",
        "&:hover": {
          bgcolor: isWa ? landing.shieldDeep : alpha("#fff", 0.18),
          color: "#fff",
        },
      }}
    >
      {icon}
      {children}
    </Box>
  );
}

function PortalTopBar() {
  const pathname = usePathname();
  const { header } = usePortalPublicHeader();
  const slugFromPath = pathname?.split("/").filter(Boolean)[0];
  const slug = header.slug ?? slugFromPath;
  const homeHref = slug ? `/${encodeURIComponent(slug)}` : "/";
  const orgName = header.orgName?.trim();
  const hasOrg = Boolean(orgName);
  const details = header.orgDetails ?? null;
  const showBasic = Boolean(details && hasBasicInfo(details));
  const showContact = Boolean(details && hasContactInfo(details));
  const showDetails = showBasic || showContact;
  const wa = details?.atendimento_fone ? whatsappHref(details.atendimento_fone) : null;
  const telHref = details?.atendimento_fone
    ? `tel:+${phoneDigits(details.atendimento_fone).startsWith("55") ? phoneDigits(details.atendimento_fone) : `55${phoneDigits(details.atendimento_fone)}`}`
    : null;

  const dpoLabel = [details?.dpo_nome, details?.dpo_pessoa_natural_nome].filter(Boolean).join(" · ");

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        color: landing.heroText,
        overflow: "hidden",
        background: `linear-gradient(118deg, ${landing.ink} 0%, ${landing.navy} 46%, #0D3D6E 78%, #01579B 100%)`,
        boxShadow: `0 8px 32px ${alpha(landing.ink, 0.45)}`,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 120% at 92% 10%, ${alpha(landing.blueBright, 0.28)} 0%, transparent 58%)`,
        },
        "&::after": {
          content: '""',
          display: "block",
          height: 4,
          background: featureAccents["portal-privacidade"],
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 1.25, sm: 1.5 },
          display: "grid",
          gridTemplateColumns: showDetails
            ? { xs: "1fr auto", sm: "minmax(120px, auto) minmax(0, 1fr) auto" }
            : "1fr auto",
          gridTemplateAreas: showDetails
            ? { xs: `"brand selo" "facts facts"`, sm: `"brand facts selo"` }
            : `"brand selo"`,
          alignItems: "start",
          columnGap: { xs: 1.25, sm: 2, lg: 3 },
          rowGap: { xs: 1.25, sm: 1.5 },
        }}
      >
        <Box
          component={Link}
          href={homeHref}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
            minWidth: 0,
            gridArea: "brand",
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
                width: { xs: 88, sm: 104 },
                height: { xs: 88, sm: 104 },
                borderRadius: 2,
                objectFit: "contain",
                bgcolor: "#fff",
                p: 0.6,
                border: `1px solid ${alpha("#fff", 0.35)}`,
                boxShadow: `0 8px 22px ${alpha(landing.ink, 0.35)}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: { xs: 88, sm: 104 },
                height: { xs: 88, sm: 104 },
                borderRadius: 2,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: featureAccents["portal-privacidade"],
                boxShadow: `0 8px 22px ${alpha(landing.blue, 0.4)}`,
              }}
            >
              <ShieldOutlinedIcon sx={{ fontSize: 44 }} aria-hidden />
            </Box>
          )}
          <Typography
            variant="h6"
            fontWeight={800}
            letterSpacing="-0.03em"
            lineHeight={1.2}
            sx={{ fontSize: { xs: "1.15rem", sm: "1.45rem" }, minWidth: 0, display: { xs: "block", sm: showDetails ? "none" : "block" } }}
          >
            {hasOrg ? orgName : "Portal do titular"}
          </Typography>
        </Box>

        {showDetails && details ? (
          <Box sx={{ gridArea: "facts", minWidth: 0, width: "100%" }}>
              <Typography
                variant="h6"
                fontWeight={800}
                letterSpacing="-0.03em"
                lineHeight={1.2}
                sx={{ fontSize: { xs: "1.1rem", sm: "1.3rem", lg: "1.4rem" }, mb: 1, display: { xs: "none", sm: "block" } }}
              >
                {hasOrg ? orgName : "Portal do titular"}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: { xs: 1, sm: 1.25 },
                  mb: 1,
                }}
              >
                {details.razao_social ? (
                  <HeaderFact icon={<BusinessIcon />} label="Razão social">
                    {details.razao_social}
                  </HeaderFact>
                ) : null}
                {details.cnpj != null && String(details.cnpj).trim() !== "" ? (
                  <HeaderFact icon={<BadgeIcon />} label="CNPJ">
                    {formatCnpjBrasil(details.cnpj)}
                  </HeaderFact>
                ) : null}
                {dpoLabel ? (
                  <HeaderFact icon={<PersonIcon />} label="Encarregado / DPO">
                    {dpoLabel}
                  </HeaderFact>
                ) : null}
                {details.atendimento_fone ? (
                  <HeaderFact icon={<PhoneIcon />} label="Telefone">
                    {details.atendimento_fone}
                  </HeaderFact>
                ) : null}
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {wa ? (
                  <HeaderAction href={wa} accent="whatsapp" external icon={<WhatsAppGlyph />}>
                    WhatsApp
                  </HeaderAction>
                ) : null}
                {telHref ? (
                  <HeaderAction href={telHref} icon={<PhoneIcon sx={{ fontSize: 16 }} />}>
                    Ligar
                  </HeaderAction>
                ) : null}
                {details.atendimento_email ? (
                  <HeaderAction href={`mailto:${details.atendimento_email}`} icon={<EmailIcon sx={{ fontSize: 16 }} />}>
                    {details.atendimento_email}
                  </HeaderAction>
                ) : null}
                {details.dpo_email && details.dpo_email !== details.atendimento_email ? (
                  <HeaderAction href={`mailto:${details.dpo_email}`} icon={<EmailIcon sx={{ fontSize: 16 }} />}>
                    DPO
                  </HeaderAction>
                ) : null}
                {details.atendimento_site ? (
                  <HeaderAction href={details.atendimento_site} external icon={<LanguageIcon sx={{ fontSize: 16 }} />}>
                    Site
                  </HeaderAction>
                ) : null}
              </Box>
          </Box>
        ) : null}

        {slug ? (
          <Box sx={{ gridArea: "selo", alignSelf: { xs: "start", sm: "center" }, pt: { xs: 0, sm: 0.5 } }}>
            <PortalPublicSeloLink slug={slug} size={128} />
          </Box>
        ) : null}
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
