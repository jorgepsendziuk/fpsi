"use client";

import React, { useMemo } from "react";
import { Box, Link, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { LGPD_PLANALTO_COMPILADO_URL } from "@/lib/normas/lgpdRefs";

function formatBlocks(text: string): React.ReactNode[] {
  const parts = text.split(/\n\n+/).filter((p) => p.trim());
  return parts.map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const isHeading =
      /^Art\.\s*\d+/i.test(lines[0] || "") ||
      /^CAPÍTULO\s+/i.test(lines[0] || "") ||
      /^Seção\s+/i.test(lines[0] || "");
    return (
      <Box
        key={i}
        component="section"
        sx={{
          mb: 2,
          pl: isHeading ? 0 : 2,
          borderLeft: isHeading ? "none" : "3px solid",
          borderColor: "divider",
        }}
      >
        {lines.map((line, j) => (
          <Typography
            key={j}
            component="p"
            variant="body2"
            sx={{
              mb: 0.75,
              fontWeight: /^Art\.|^§|^Parágrafo|^[IVX]+\s*[-–]/.test(line) ? 500 : 400,
              color: "text.primary",
              lineHeight: 1.7,
              "&:last-child": { mb: 0 },
            }}
          >
            {line}
          </Typography>
        ))}
      </Box>
    );
  });
}

type Props = {
  /** Texto integral do artigo (do JSON). */
  texto: string;
  /** Rótulo curto opcional (citação do guia). */
  citacao?: string;
};

export function LgpdArtigoViewer({ texto, citacao }: Props) {
  const theme = useTheme();
  const body = useMemo(() => formatBlocks(texto), [texto]);

  return (
    <Box>
      {citacao && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          Referência no PPSI: {citacao}
        </Typography>
      )}
      <Box
        sx={{
          fontFamily: theme.typography.fontFamily,
          "& section": { ml: 0 },
        }}
      >
        {body}
      </Box>
    </Box>
  );
}

type MultiProps = {
  artigos: number[];
  textos: Map<number, string>;
  citacao?: string;
};

export function LgpdMultiArtigoViewer({ artigos, textos, citacao }: MultiProps) {
  const [tab, setTab] = React.useState(0);
  const theme = useTheme();

  React.useEffect(() => {
    setTab(0);
  }, [artigos.join(",")]);

  if (artigos.length === 0) return null;
  const current = artigos[tab] ?? artigos[0];
  const texto = textos.get(current) ?? "";

  return (
    <Box>
      {citacao && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          Citação no PPSI: {citacao}
        </Typography>
      )}
      {artigos.length > 1 && (
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          {artigos.map((n) => (
            <Tab key={n} label={`Art. ${n}º`} />
          ))}
        </Tabs>
      )}
      <Typography variant="overline" color="primary" sx={{ display: "block", mb: 1, letterSpacing: 0.5 }}>
        Lei nº 13.709/2018 — Art. {current}º
      </Typography>
      <LgpdArtigoViewer texto={texto} />
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
        <Link href={LGPD_PLANALTO_COMPILADO_URL} target="_blank" rel="noopener noreferrer" variant="body2">
          Referência oficial — texto compilado no Planalto
        </Link>
      </Box>
    </Box>
  );
}
