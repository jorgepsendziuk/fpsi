"use client";

import { Alert, Link, Typography } from "@mui/material";
import {
  attributionLabel,
  type ContentPackMeta,
  CONTENT_PACK_UI,
} from "@/lib/packages/contentPackMeta";

export type ContentPackAttributionProps = {
  packId: keyof typeof CONTENT_PACK_UI | string;
  variant?: "inline" | "alert";
  dense?: boolean;
};

export function ContentPackAttribution({
  packId,
  variant = "alert",
  dense = false,
}: ContentPackAttributionProps) {
  const meta: ContentPackMeta | undefined = CONTENT_PACK_UI[packId];
  if (!meta) return null;

  const body = (
    <>
      <Typography variant={dense ? "caption" : "body2"} component="span" fontWeight={600}>
        {meta.nome}
      </Typography>
      <Typography variant={dense ? "caption" : "body2"} component="span" sx={{ ml: 0.5 }}>
        — Fonte: {meta.origem === "terceiro" ? "terceiro (SGD/MGI)" : "FPSI"} — Licença:{" "}
        {meta.licenca}
      </Typography>
      {meta.notaUi ? (
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: dense ? 0.25 : 0.5 }}
        >
          {meta.notaUi}
        </Typography>
      ) : null}
      {meta.url_fonte ? (
        <Link href={meta.url_fonte} target="_blank" rel="noopener noreferrer" variant="caption">
          Fonte oficial
        </Link>
      ) : null}
    </>
  );

  if (variant === "inline") {
    return (
      <Typography variant="caption" color="text.secondary" role="note">
        {attributionLabel(meta)}
      </Typography>
    );
  }

  return (
    <Alert severity={meta.origem === "terceiro" ? "info" : "success"} sx={{ mb: 2 }}>
      {body}
    </Alert>
  );
}

export function ContentPackAttributionByDiagnostico({
  diagnosticoId,
  variant = "alert",
}: {
  diagnosticoId: number;
  variant?: "inline" | "alert";
}) {
  const packId =
    diagnosticoId >= 1 && diagnosticoId <= 3
      ? "ppsi-2.0"
      : diagnosticoId === 4
        ? "governanca-ia"
        : null;
  if (!packId) return null;
  return <ContentPackAttribution packId={packId} variant={variant} />;
}