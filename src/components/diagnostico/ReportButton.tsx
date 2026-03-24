"use client";

import React from "react";
import { Button, Tooltip } from "@mui/material";
import { Assessment as AssessmentIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
  /** Segmento da URL do programa (`id` numérico ou `slug`), igual a `programas/[id]`. */
  programaPathSegment: string;
}

export default function ReportButton({ programaPathSegment }: ReportButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/programas/${encodeURIComponent(programaPathSegment)}/diagnostico/relatorio`);
  };

  return (
    <Tooltip title="Abrir relatório de todos os controles (imprimível / PDF)" enterDelay={300}>
      <Button
        type="button"
        variant="contained"
        disableElevation={false}
        startIcon={<AssessmentIcon sx={{ fontSize: 22 }} />}
        onClick={handleClick}
        aria-label="Relatório de todos os controles"
        sx={{
          ml: { xs: 0, sm: 1 },
          px: { xs: 2, sm: 2.75 },
          py: 1.1,
          borderRadius: 2.5,
          textTransform: "none",
          fontWeight: 800,
          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
          letterSpacing: 0.02,
          color: "#fff",
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 14px rgba(102, 126, 234, 0.45)",
          border: "1px solid rgba(255,255,255,0.2)",
          "&:hover": {
            background: "linear-gradient(90deg, #5a6fd6 0%, #6a4190 100%)",
            boxShadow: "0 6px 20px rgba(118, 75, 162, 0.5)",
          },
        }}
      >
        Relatório
      </Button>
    </Tooltip>
  );
}
