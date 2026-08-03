"use client";

import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export function AdminStatusChip({
  status,
}: {
  status: "complete" | "pending" | "warning" | "error";
}) {
  if (status === "complete") {
    return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="OK" />;
  }
  if (status === "warning") {
    return <Chip size="small" color="warning" icon={<WarningAmberIcon />} label="Parcial" />;
  }
  if (status === "error") {
    return <Chip size="small" color="error" icon={<ErrorOutlineIcon />} label="Erro" />;
  }
  return <Chip size="small" color="default" label="Pendente" />;
}
