"use client";

import NextLink from "next/link";
import { Box, Link } from "@mui/material";
import { LastUpdateInfo } from "./LastUpdateInfo";
import { useLastActivity } from "@/hooks/useLastActivity";

export type ProgramaLastActivityLineProps = {
  programaId: number | undefined | null;
  /** Segmento da URL (`params.id`) para o link «Histórico completo». */
  programaPathSegment?: string;
  resourceType?: string;
  resourceId?: number | null;
  enabled?: boolean;
  compact?: boolean;
  /** Em `/auditoria`, desligar para não repetir o link. */
  showHistoricoLink?: boolean;
  sx?: object;
};

/**
 * Última alteração registrada na trilha de auditoria do programa (API `/api/audit/last-activity`)
 * + link opcional para a página «Histórico de atividades».
 */
export function ProgramaLastActivityLine({
  programaId,
  programaPathSegment,
  resourceType,
  resourceId,
  enabled = true,
  compact = true,
  showHistoricoLink = true,
  sx,
}: ProgramaLastActivityLineProps) {
  const { lastActivity } = useLastActivity(
    programaId ?? undefined,
    resourceType,
    resourceId ?? undefined,
    Boolean(enabled && programaId)
  );

  if (!programaId) return null;

  const hasUpdate = Boolean(lastActivity?.created_at);
  const historicoHref =
    showHistoricoLink && programaPathSegment
      ? `/programas/${programaPathSegment}/auditoria`
      : null;

  if (!hasUpdate && !historicoHref) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        ...sx,
      }}
    >
      {hasUpdate ? (
        <LastUpdateInfo
          updatedAt={lastActivity?.created_at}
          userName={lastActivity?.user_name}
          compact={compact}
        />
      ) : null}
      {historicoHref ? (
        <Link component={NextLink} href={historicoHref} variant="caption" underline="hover" color="primary">
          Histórico completo
        </Link>
      ) : null}
    </Box>
  );
}
