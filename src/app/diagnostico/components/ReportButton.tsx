"use client";

import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { Assessment as AssessmentIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
  programaId: number;
}

export default function ReportButton({ programaId }: ReportButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique propague para o AccordionSummary
    router.push(`/diagnostico/relatorio?programaId=${programaId}`);
  };

  return (
    <Tooltip title="Relatório">
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          ml: 2,
          p: 1,
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <AssessmentIcon color="primary" />
        <Typography variant="body2" color="primary">
          Relatório
        </Typography>
      </Box>
    </Tooltip>
  );
} 