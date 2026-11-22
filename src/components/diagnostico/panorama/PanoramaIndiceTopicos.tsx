"use client";

import React from "react";
import { Box, Link as MuiLink, Paper, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { telefoneHref } from "@/lib/panorama/panoramaConsultorPrograma";
import type { PanoramaTopicoIndice } from "@/lib/panorama/panoramaIndiceTopicos";
import type { PanoramaConsultorPrograma } from "@/lib/panorama/panoramaConsultorPrograma";
import {
  panoramaFoldOneCardClass,
  panoramaFoldOneCardSx,
} from "@/lib/panorama/panoramaFoldOneCards";

type Props = {
  topicos: PanoramaTopicoIndice[];
  consultor?: PanoramaConsultorPrograma | null;
};

function ContatoLinkLinha({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={0.65} alignItems="flex-start" sx={{ minWidth: 0 }}>
      <Box sx={{ lineHeight: 0, mt: { xs: 0.2, print: 0.1 }, color: "text.secondary", flexShrink: 0 }} aria-hidden>
        {icon}
      </Box>
      <MuiLink
        href={href}
        underline="hover"
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        sx={{
          fontSize: { xs: "0.86rem", print: "8pt" },
          lineHeight: 1.35,
          wordBreak: "break-all",
          fontWeight: 500,
          "@media print": { color: "#0F2438" },
        }}
      >
        {children}
      </MuiLink>
    </Stack>
  );
}

function ConsultorBox({ consultor }: { consultor: PanoramaConsultorPrograma }) {
  const iconSx = { fontSize: { xs: 17, print: 14 } };

  return (
    <Paper
      variant="outlined"
      className={`panorama-consultor-programa panorama-text-left ${panoramaFoldOneCardClass("consultor")}`}
      sx={[
        panoramaFoldOneCardSx("consultor"),
        {
          p: { xs: 1.5, md: 1.75, print: 0 },
          height: "100%",
          boxSizing: "border-box",
          breakInside: "avoid",
        },
      ]}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: { xs: 1, print: 0.4 } }}>
        <PersonOutlineOutlinedIcon sx={{ fontSize: { xs: 22, print: 17 }, color: "text.secondary" }} aria-hidden />
        <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: { xs: "1rem", print: "9.5pt" } }}>
          Responsável pela implantação
        </Typography>
      </Stack>
      <Typography
        fontWeight={700}
        sx={{ mb: { xs: 1, print: 0.5 }, fontSize: { xs: "0.95rem", print: "9pt" }, lineHeight: 1.3 }}
      >
        {consultor.nome}
      </Typography>
      <Stack spacing={{ xs: 0.7, print: 0.4 }} className="panorama-consultor-dados">
        {consultor.email ? (
          <ContatoLinkLinha href={`mailto:${consultor.email}`} icon={<EmailOutlinedIcon sx={iconSx} />}>
            {consultor.email}
          </ContatoLinkLinha>
        ) : null}
        {consultor.telefone ? (
          <ContatoLinkLinha href={telefoneHref(consultor.telefone)} icon={<PhoneOutlinedIcon sx={iconSx} />}>
            {consultor.telefone}
          </ContatoLinkLinha>
        ) : null}
        <ContatoLinkLinha href={consultor.portfolioUrl} icon={<LinkOutlinedIcon sx={iconSx} />}>
          {consultor.portfolioUrl}
        </ContatoLinkLinha>
      </Stack>
    </Paper>
  );
}

export default function PanoramaIndiceTopicos({ topicos, consultor }: Props) {
  if (topicos.length === 0 && !consultor) return null;

  const indice = (
    <Paper
      variant="outlined"
      className={`panorama-indice-topicos panorama-text-left ${panoramaFoldOneCardClass("indice")}`}
      sx={[
        panoramaFoldOneCardSx("indice"),
        {
          p: { xs: 1.5, md: 2, print: 0 },
          mb: { xs: 0, print: 0 },
          height: "100%",
          boxSizing: "border-box",
          breakInside: "avoid",
          "@media print": {
            breakInside: "auto",
            pageBreakInside: "auto",
          },
        },
      ]}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" className="panorama-indice-header" sx={{ mb: { xs: 1, print: 0.45 } }}>
        <FormatListNumberedOutlinedIcon sx={{ fontSize: { xs: 22, print: 17 }, color: "text.secondary" }} aria-hidden />
        <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: { xs: "1rem", print: "9.5pt" } }}>
          Índice do relatório
        </Typography>
      </Stack>
      <Stack
        component="ol"
        className="panorama-indice-lista"
        spacing={{ xs: 0.55, print: 0.22 }}
        sx={{
          m: 0,
          pl: { xs: 2.25, print: 1.65 },
          fontSize: { xs: "0.92rem", print: "9pt" },
          lineHeight: { print: 1.28 },
        }}
      >
        {topicos.map((t) => (
          <Typography
            key={t.anchor}
            component="li"
            sx={{ lineHeight: { xs: 1.35, print: 1.28 }, fontSize: "inherit", textAlign: "left" }}
          >
            <MuiLink href={`#${t.anchor}`} underline="hover" sx={{ fontWeight: 700, fontSize: "inherit" }}>
              {t.titulo}
            </MuiLink>
          </Typography>
        ))}
      </Stack>
    </Paper>
  );

  if (!consultor) {
    return indice;
  }

  return (
    <Box
      className="panorama-indice-duo"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 2, md: 1.5, print: 0.75 },
        alignItems: "stretch",
        width: "100%",
      }}
    >
      {indice}
      <ConsultorBox consultor={consultor} />
    </Box>
  );
}