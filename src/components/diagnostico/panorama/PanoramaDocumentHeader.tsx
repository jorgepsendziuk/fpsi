"use client";

import React from "react";
import { Box, Link as MuiLink, Stack, Typography } from "@mui/material";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import {
  formatCnpjBrasil,
  getPoliticaPdfCabecalhoLinhasMetadados,
  getPoliticaPdfCabecalhoTitulo,
  type PoliticaProgramaDados,
} from "@/lib/utils/politicaPlaceholders";
import { FPSI_AUTHORSHIP } from "@/lib/credits/fpsiCredits";
import { SITE_ORIGIN } from "@/lib/siteMetadata";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";

/** Tipografia da landing (hero) — cópia local para o panorama; a landing não é importada. */
const PANORAMA_BRAND_FF = "var(--font-brand), Montserrat, system-ui, sans-serif";
const PANORAMA_BRAND_INK = "#0F2438";
export type PanoramaDocumentHeaderProps = {
  programa: PoliticaProgramaDados | null;
  docTitle: string;
  geradoEm?: string | null;
  /** URL absoluta deste panorama (tela + impressão/PDF). */
  onlineHref?: string | null;
};

function formatDataBr(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { dateStyle: "long" });
  } catch {
    return "";
  }
}

const META_TYPO = {
  fontSize: { xs: "0.85rem", print: "7.5pt" },
  color: "text.secondary",
  lineHeight: { xs: 1.35, print: 1.25 },
  wordBreak: "break-word",
} as const;

/** Partido 70% / FPSI 30% — mesma linha em tela e impressão. */
const HEADER_IDENTITY_GRID = "minmax(0, 7fr) minmax(0, 3fr)";

/** Ícone + FPSI / framework + GeoApps + link — compacto, legível em P&B na impressão. */
function PanoramaFpsiBrand() {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1.25, md: 1.5, print: 1 }}
      alignItems="flex-start"
      sx={{ width: "100%", minWidth: 0 }}
    >
      <Box
        component="img"
        src="/logo_p.png"
        alt=""
        sx={{
          maxWidth: { xs: 88, md: 92, print: 62 },
          maxHeight: { xs: 72, md: 76, print: 48 },
          minHeight: { xs: 64, md: 72, print: 44 },
          width: "auto",
          height: "auto",
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
        <Typography
          component="p"
          sx={{
            fontFamily: PANORAMA_BRAND_FF,
            fontWeight: 600,
            fontSize: { xs: "0.78rem", md: "0.88rem", print: "7pt" },
            letterSpacing: "0.02em",
            color: "grey.800",
            lineHeight: 1.35,
            mb: { xs: 0.35, print: 0.25 },
            wordBreak: "break-word",
            "@media print": { color: "#333" },
          }}
        >
          {FPSI_AUTHORSHIP.projectFullName}
        </Typography>
        <MuiLink
          href={SITE_ORIGIN}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontFamily: PANORAMA_BRAND_FF,
            fontWeight: 600,
            fontSize: { xs: "0.75rem", print: "6.5pt" },
            display: "inline-block",
            mt: { xs: 0.15, print: 0.05 },
            letterSpacing: "0.01em",
            color: "primary.main",
            "@media print": { color: PANORAMA_BRAND_INK },
          }}
        >
          fpsi.com.br
        </MuiLink>
      </Box>
    </Stack>
  );
}

export default function PanoramaDocumentHeader({ programa, docTitle, geradoEm, onlineHref }: PanoramaDocumentHeaderProps) {
  const nome =
    getPoliticaPdfCabecalhoTitulo(programa) ||
    (typeof programa === "object" && programa && String((programa as { nome_fantasia?: string }).nome_fantasia ?? "").trim()) ||
    "Programa";

  const linhasMetadados = programa ? getPoliticaPdfCabecalhoLinhasMetadados(programa) : [];
  const cnpj = programa && typeof programa === "object" ? formatCnpjBrasil(programa.cnpj) : "";

  const logoOrg = programa ? getProgramaLogoDisplayUrl(programa as Parameters<typeof getProgramaLogoDisplayUrl>[0]) : null;

  const colSharedSx = {
    minWidth: 0,
    px: { xs: 0.25, md: 1.5, print: 0.75 },
    py: { xs: 0, print: 0 },
    boxSizing: "border-box" as const,
  };

  const colProgramaSx = {
    ...colSharedSx,
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
  };

  const colFpsiSx = {
    ...colSharedSx,
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
  };

  return (
    <Box
      className="panorama-doc-header"
      sx={{
        mb: 3,
        "@media print": { mb: 0.5 },
      }}
    >
      <Box
        className="panorama-doc-header-identity panorama-text-left"
        sx={{
          width: "100%",
          minWidth: 0,
          bgcolor: "#fff",
          textAlign: "left",
          "& .MuiTypography-root, & .MuiLink-root": {
            textAlign: "left",
          },
          "@media print": {
            bgcolor: "#fff",
          },
        }}
      >
        <Box
          className="panorama-doc-header-cols"
          sx={{
            display: "grid",
            gridTemplateColumns: HEADER_IDENTITY_GRID,
            alignItems: "stretch",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            py: { xs: 1.5, md: 2.25, print: 1 },
            px: { xs: 1, md: 2, print: 1 },
            gap: 0,
            "@media print": {
              display: "grid",
              gridTemplateColumns: HEADER_IDENTITY_GRID,
            },
          }}
        >
          <Box className="panorama-doc-header-col-programa" sx={colProgramaSx}>
            <Stack direction="row" spacing={{ xs: 1.5, print: 1 }} alignItems="flex-start" sx={{ minWidth: 0 }}>
              {logoOrg ? (
                <Box
                  component="img"
                  src={logoOrg}
                  alt=""
                  sx={{
                    maxWidth: { xs: 88, print: 62 },
                    maxHeight: { xs: 72, print: 48 },
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <Stack spacing={{ xs: 0.35, print: 0.15 }} sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.05rem", md: "1.2rem", print: "10.5pt" },
                    lineHeight: { xs: 1.25, print: 1.15 },
                    wordBreak: "break-word",
                  }}
                >
                  {nome}
                </Typography>
                {linhasMetadados.map((linha, idx) => (
                  <Typography key={idx} sx={META_TYPO}>
                    {linha}
                  </Typography>
                ))}
                {cnpj ? (
                  <Typography sx={META_TYPO}>CNPJ: {cnpj}</Typography>
                ) : null}
                <Typography sx={META_TYPO}>Encarregado de dados: a definir (pendente de indicação)</Typography>
              </Stack>
            </Stack>
          </Box>

          <Box className="panorama-doc-header-col-fpsi" sx={colFpsiSx}>
            <PanoramaFpsiBrand />
          </Box>
        </Box>
      </Box>

      <Box
        className="panorama-doc-header-title panorama-text-center"
        sx={{
          mt: { xs: 2.75, md: 3, print: 1.25 },
          px: { xs: 0.5, md: 2 },
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        <Typography
          component="h1"
          className="panorama-text-center"
          sx={{
            fontSize: { xs: "1.35rem", md: "1.5rem", print: "11pt" },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: { xs: 1.2, print: 1.15 },
            textAlign: "center",
          }}
        >
          {docTitle}
        </Typography>
        {onlineHref ? (
          <Box
            className="panorama-doc-online-link panorama-text-center"
            sx={{
              mt: { xs: 0.5, print: 0.25 },
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              columnGap: 0.5,
              rowGap: 0.25,
              textAlign: "center",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.9rem", print: "8pt" },
                color: "text.secondary",
                lineHeight: 1.35,
              }}
            >
              Veja online em:
            </Typography>
            <MuiLink
              href={onlineHref}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.35,
                fontSize: { xs: "0.9rem", print: "8pt" },
                fontWeight: 600,
                color: "primary.main",
                wordBreak: "break-all",
                maxWidth: "100%",
                "@media print": { color: PANORAMA_BRAND_INK },
              }}
            >
              <LinkOutlinedIcon
                aria-hidden
                sx={{
                  fontSize: { xs: 18, print: 14 },
                  flexShrink: 0,
                  "@media print": { fontSize: 12 },
                }}
              />
              {onlineHref}
            </MuiLink>
          </Box>
        ) : null}
        {geradoEm ? (
          <Typography
            className="panorama-text-center"
            sx={{
              mt: { xs: 0.75, print: 0.35 },
              fontSize: { xs: "0.9rem", print: "7.5pt" },
              color: "text.secondary",
              lineHeight: { print: 1.2 },
              textAlign: "center",
            }}
          >
            Data da leitura: {formatDataBr(geradoEm)}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}