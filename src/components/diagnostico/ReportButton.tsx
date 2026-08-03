"use client";

import React from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
  /** Segmento da URL do programa (`id` numérico ou `slug`), igual a `programas/[id]`. */
  programaPathSegment: string;
  /** Botão discreto só com ícone PDF (para cabeçalhos compactos). */
  iconOnly?: boolean;
}

export default function ReportButton({ programaPathSegment, iconOnly = false }: ReportButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/programas/${encodeURIComponent(programaPathSegment)}/diagnostico/relatorio`);
  };

  const tooltipTitle = "Relatório PDF — todos os controles (imprimível)";

  if (iconOnly) {
    return (
      <Tooltip title={tooltipTitle} enterDelay={300}>
        <IconButton
          type="button"
          size="small"
          onClick={handleClick}
          aria-label="Relatório PDF de todos os controles"
          sx={{
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            "&:hover": {
              color: "error.main",
              borderColor: "error.light",
              bgcolor: (t) => t.palette.mode === "dark" ? "rgba(239, 83, 80, 0.12)" : "rgba(211, 47, 47, 0.06)",
            },
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipTitle} enterDelay={300}>
      <Button
        type="button"
        variant="outlined"
        size="small"
        disableElevation
        startIcon={<PictureAsPdfIcon sx={{ fontSize: 18 }} />}
        onClick={handleClick}
        aria-label="Relatório PDF de todos os controles"
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.8125rem",
          borderColor: "divider",
          color: "text.secondary",
          "&:hover": {
            borderColor: "error.light",
            color: "error.main",
            bgcolor: (t) => t.palette.mode === "dark" ? "rgba(239, 83, 80, 0.1)" : "rgba(211, 47, 47, 0.05)",
          },
        }}
      >
        PDF
      </Button>
    </Tooltip>
  );
}
