"use client";

import { Typography } from "@mui/material";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";

export interface LastUpdateInfoProps {
  /** Data/hora da última atualização (ISO string ou Date) */
  updatedAt?: string | Date | null;
  /** Nome do usuário que fez a alteração */
  userName?: string | null;
  /** Exibição compacta (menos detalhes) */
  compact?: boolean;
  /** Prefixo customizado (default: "Atualizado em") */
  prefix?: string;
}

function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LastUpdateInfo({
  updatedAt,
  userName,
  compact = false,
  prefix = "Atualizado em",
}: LastUpdateInfoProps) {
  if (!updatedAt) return null;

  const formatted = formatDateTime(updatedAt);
  if (!formatted) return null;

  const byUser = userName?.trim();
  const text = byUser
    ? `${prefix} ${formatted} por ${byUser}`
    : `${prefix} ${formatted}`;

  return (
    <Typography
      variant={compact ? "caption" : "body2"}
      color="text.secondary"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
      }}
    >
      <AccessTimeIcon sx={{ fontSize: compact ? 12 : 14, opacity: 0.7 }} />
      {text}
    </Typography>
  );
}
