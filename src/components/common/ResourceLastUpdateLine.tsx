"use client";

import { useEffect, useRef } from "react";
import NextLink from "next/link";
import { Box, Link } from "@mui/material";
import { LastUpdateInfo } from "./LastUpdateInfo";
import { useLastActivity } from "@/hooks/useLastActivity";

export type ResourceLastUpdateLineProps = {
  programaId: number;
  /** Segmento da URL para o link «Histórico completo». */
  programaPathSegment?: string;
  /** Tipo na trilha `user_activities` (ex.: medida, controle, ropa). */
  resourceType?: string;
  /** ID do recurso na trilha (ex.: programa_medida.id, programa_controle.id). */
  resourceId?: number | null;
  /** Última alteração persistida no banco (ex.: `updated_at` da linha). */
  dbUpdatedAt?: string | null;
  compact?: boolean;
  showHistoricoLink?: boolean;
  sx?: object;
};

/**
 * Combina `updated_at` do registro com a última entrada de auditoria do mesmo recurso (quem/quando).
 * Se `resourceType`/`resourceId` não forem passados, exibe só `dbUpdatedAt` (sem chamada à API de auditoria).
 */
export function ResourceLastUpdateLine({
  programaId,
  programaPathSegment,
  resourceType,
  resourceId,
  dbUpdatedAt,
  compact = true,
  showHistoricoLink = true,
  sx,
}: ResourceLastUpdateLineProps) {
  const auditEnabled = Boolean(
    programaId && resourceType && resourceId != null && resourceId > 0
  );

  const { lastActivity, refetch } = useLastActivity(
    programaId,
    auditEnabled ? resourceType : undefined,
    auditEnabled ? resourceId : undefined,
    auditEnabled
  );

  const skipFirstAuditRefetch = useRef(false);
  useEffect(() => {
    if (!auditEnabled) return;
    if (!skipFirstAuditRefetch.current) {
      skipFirstAuditRefetch.current = true;
      return;
    }
    void refetch();
  }, [auditEnabled, dbUpdatedAt, refetch]);

  const updatedAt = dbUpdatedAt ?? lastActivity?.created_at ?? null;
  const userName = lastActivity?.user_name ?? null;

  const historicoHref =
    showHistoricoLink && programaPathSegment
      ? `/programas/${programaPathSegment}/auditoria`
      : null;

  if (!updatedAt && !historicoHref) return null;

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
      {updatedAt ? (
        <LastUpdateInfo updatedAt={updatedAt} userName={userName} compact={compact} />
      ) : null}
      {historicoHref ? (
        <Link component={NextLink} href={historicoHref} variant="caption" underline="hover" color="primary">
          Histórico completo
        </Link>
      ) : null}
    </Box>
  );
}
