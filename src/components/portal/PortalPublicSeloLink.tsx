"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Skeleton, alpha } from "@mui/material";
import { SeloLgpdBadge } from "@/components/programa/SeloLgpdBadge";
import { getSeloMetal, type SeloMetalId, type SeloPlanoId } from "@/lib/programa/seloLgpd";
import { portalSeloHref } from "@/lib/portal/portalPublicPaths";
import { landing } from "@/components/landing/landingTokens";

type SeloJson = {
  plano: SeloPlanoId;
  metal: SeloMetalId;
  greyed: boolean;
};

type Props = {
  slug: string;
  size?: number;
};

/** Selo LGPD no cabeçalho — mesmo componente visual do sistema (SeloLgpdBadge). */
export function PortalPublicSeloLink({ slug, size = 118 }: Props) {
  const [data, setData] = useState<SeloJson | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/portal/${encodeURIComponent(slug)}/selo?format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setData({ plano: json.plano, metal: json.metal, greyed: json.greyed });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <Box
      component={Link}
      href={portalSeloHref(slug)}
      title="Selo LGPD"
      aria-label="Selo LGPD — ver página pública"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        lineHeight: 0,
        filter: `drop-shadow(0 10px 20px ${alpha(landing.ink, 0.45)})`,
        transition: "transform 0.2s ease",
        "&:hover": { transform: "scale(1.03)" },
        "&:focus-visible": {
          outline: `2px solid ${landing.blueBright}`,
          outlineOffset: 4,
          borderRadius: 1,
        },
      }}
    >
      {data ? (
        <SeloLgpdBadge
          plano={data.plano}
          palette={getSeloMetal(data.metal)}
          greyed={data.greyed}
          size={size}
          uid={`hdr-${slug.replace(/[^a-z0-9]/gi, "")}`}
        />
      ) : (
        <Skeleton
          variant="rounded"
          width={size}
          height={Math.round(size * 1.12)}
          sx={{ bgcolor: alpha("#fff", 0.12) }}
        />
      )}
    </Box>
  );
}
