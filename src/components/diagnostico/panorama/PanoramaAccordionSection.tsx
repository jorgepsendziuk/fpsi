"use client";

import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  getPanoramaSectionPalette,
  type PanoramaSectionAccent,
} from "@/components/diagnostico/panorama/panoramaSectionAccent";

const titleSx = {
  fontSize: { xs: "1.15rem", md: "1.22rem", print: "13pt" },
  fontWeight: 800,
  mb: 0,
  lineHeight: 1.2,
} as const;

export type PanoramaAccordionSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  sectionId?: string;
  titleIcon?: React.ReactNode;
  accent?: PanoramaSectionAccent;
  /** Texto opcional abaixo do título (só no sumário). */
  subtitle?: React.ReactNode;
};

export function PanoramaAccordionSection({
  title,
  children,
  className,
  sectionId,
  titleIcon,
  accent,
  subtitle,
}: PanoramaAccordionSectionProps) {
  return (
    <Paper
      id={sectionId}
      variant="outlined"
      className={[className, "panorama-section-shell"].filter(Boolean).join(" ")}
      sx={(theme) => {
        const pal = getPanoramaSectionPalette(theme, accent);
        return {
          position: "relative",
          overflow: "hidden",
          p: { xs: 0, print: 0 },
          mb: { xs: 2.5, print: 2 },
          breakInside: "auto",
          scrollMarginTop: { xs: 72, md: 80 },
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          ...(accent
            ? {
                bgcolor: pal.tint,
                borderColor: pal.border,
                borderLeft: `4px solid ${pal.main}`,
                "@media print": {
                  bgcolor: pal.tintPrint,
                  borderColor: "#ccc",
                  borderLeftColor: pal.main,
                },
              }
            : {}),
        };
      }}
    >
      {accent && titleIcon ? (
        <Box
          aria-hidden
          sx={(theme) => {
            const pal = getPanoramaSectionPalette(theme, accent);
            return {
              position: "absolute",
              right: { xs: 4, md: 12 },
              top: { xs: 4, md: 8 },
              lineHeight: 0,
              fontSize: { xs: 88, md: 112, print: 72 },
              color: pal.main,
              opacity: 0.12,
              pointerEvents: "none",
              "& .MuiSvgIcon-root": { fontSize: "inherit" },
              "@media print": { opacity: 0.1, fontSize: 64 },
            };
          }}
        >
          {titleIcon}
        </Box>
      ) : null}

      <Accordion
        defaultExpanded={false}
        disableGutters
        elevation={0}
        className="panorama-section-accordion"
        sx={{
          bgcolor: "transparent",
          backgroundImage: "none",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: 0 },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: 28, print: 20 } }} />}
          sx={{
            px: { xs: 2, md: 2.75, print: 1.25 },
            py: { xs: 1.25, md: 1.5, print: 0.75 },
            minHeight: 0,
            position: "relative",
            zIndex: 1,
            "& .MuiAccordionSummary-content": { my: 0.5, mr: 1 },
            "@media print": {
              cursor: "default",
              "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
            },
          }}
        >
          {titleIcon ? (
            <Stack direction="row" spacing={{ xs: 1.25, print: 0.75 }} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={(theme) => {
                  const pal = accent ? getPanoramaSectionPalette(theme, accent) : null;
                  return {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: { xs: 40, print: 28 },
                    height: { xs: 40, print: 28 },
                    borderRadius: 1.25,
                    flexShrink: 0,
                    bgcolor: pal ? pal.iconBg : alpha(theme.palette.primary.main, 0.1),
                    color: pal?.main ?? theme.palette.primary.main,
                    fontSize: { xs: 22, print: 16 },
                    border: accent ? `1px solid ${pal?.border}` : undefined,
                    "@media print": {
                      bgcolor: pal ? alpha(pal.main, 0.08) : "transparent",
                      border: "1px solid #ccc",
                    },
                  };
                }}
              >
                {titleIcon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={titleSx}>
                  {title}
                </Typography>
                {subtitle}
              </Box>
            </Stack>
          ) : (
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" sx={titleSx}>
                {title}
              </Typography>
              {subtitle}
            </Box>
          )}
        </AccordionSummary>
        <AccordionDetails
          sx={{
            px: { xs: 2, md: 2.75, print: 1.25 },
            pt: 0,
            pb: { xs: 2, md: 2.75, print: 1.25 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}