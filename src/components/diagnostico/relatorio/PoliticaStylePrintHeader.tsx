"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import {
  formatCnpjBrasil,
  getPoliticaPdfCabecalhoLinhasMetadados,
  getPoliticaPdfCabecalhoTitulo,
  type PoliticaProgramaDados,
} from "@/lib/utils/politicaPlaceholders";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";

function resolvePortalPrivacidadeUrl(programa: PoliticaProgramaDados): string | null {
  if (!programa || typeof programa !== "object") return null;
  const slug = typeof programa.slug === "string" ? programa.slug.trim() : "";
  if (!slug) return null;
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/${encodeURIComponent(slug)}`;
}

export type PoliticaStylePrintHeaderProps = {
  programa: PoliticaProgramaDados | null;
  docTitle: string;
};

/**
 * Cabeçalho visual alinhado ao PDF das políticas (logo, metadados, título, linha).
 */
export default function PoliticaStylePrintHeader({ programa, docTitle }: PoliticaStylePrintHeaderProps) {
  const nome =
    getPoliticaPdfCabecalhoTitulo(programa) ||
    (typeof programa === "object" && programa && String((programa as { nome_fantasia?: string }).nome_fantasia ?? "").trim()) ||
    "Programa";

  const linhasMetadados = programa ? getPoliticaPdfCabecalhoLinhasMetadados(programa) : [];
  const cnpj = programa && typeof programa === "object" ? formatCnpjBrasil(programa.cnpj) : "";
  const email =
    programa && typeof programa === "object" && typeof programa.atendimento_email === "string"
      ? programa.atendimento_email.trim()
      : "";
  const fone =
    programa && typeof programa === "object" && typeof programa.atendimento_fone === "string"
      ? programa.atendimento_fone.trim()
      : "";
  const site =
    programa && typeof programa === "object" && typeof programa.atendimento_site === "string"
      ? programa.atendimento_site.trim()
      : "";
  const contato = [email, fone, site].filter(Boolean).join(" · ");

  const logoSrc = programa ? getProgramaLogoDisplayUrl(programa as Parameters<typeof getProgramaLogoDisplayUrl>[0]) : null;
  const portalUrl = resolvePortalPrivacidadeUrl(programa);

  return (
    <Box
      sx={{
        mb: 3,
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        "@media print": {
          borderBottom: "none",
          pb: 0,
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        {logoSrc ? (
          <Box
            component="img"
            src={logoSrc}
            alt=""
            sx={{
              maxWidth: 108,
              maxHeight: 52,
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
        ) : null}
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 11, color: "text.primary", lineHeight: 1.35 }}>
            {nome}
          </Typography>
          {linhasMetadados.map((linha, idx) => (
            <Typography key={`${idx}-${linha.slice(0, 24)}`} sx={{ fontSize: 9, color: "text.secondary", mt: 0.25 }}>
              {linha}
            </Typography>
          ))}
          {cnpj ? (
            <Typography sx={{ fontSize: 9, color: "text.secondary", mt: 0.25 }}>CNPJ: {cnpj}</Typography>
          ) : null}
          {contato ? (
            <Typography sx={{ fontSize: 9, color: "text.secondary", mt: 0.25 }}>{contato}</Typography>
          ) : null}
          {portalUrl ? (
            <Typography sx={{ fontSize: 9, mt: 0.75, wordBreak: "break-all", lineHeight: 1.45 }}>
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                Portal de privacidade:
              </Box>{" "}
              <Box
                component="a"
                href={portalUrl}
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                }}
              >
                {portalUrl}
              </Box>
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Typography
        component="h1"
        sx={{
          mt: 3,
          fontSize: 17,
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1.35,
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        {docTitle.trim() || "Relatório"}
      </Typography>
      <Box
        sx={{
          mt: 1.5,
          height: "1px",
          bgcolor: "grey.300",
          "@media print": { bgcolor: "#c7c7c7" },
        }}
      />
    </Box>
  );
}
