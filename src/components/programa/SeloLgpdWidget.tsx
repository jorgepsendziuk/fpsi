"use client";

import { useId, useState } from "react";
import { Box, Tooltip, alpha } from "@mui/material";
import type { PerfilEscopoPreset } from "@/lib/programa/perfilEscopo";
import { resolveSeloLgpd } from "@/lib/programa/seloLgpd";
import { SeloLgpdBadge } from "@/components/programa/SeloLgpdBadge";
import { SeloLgpdDialog } from "@/components/programa/SeloLgpdDialog";
import { landing } from "@/components/landing/landingTokens";

type Props = {
  preset: PerfilEscopoPreset | string | null | undefined;
  maturidadeMedia: number | null | undefined;
  size?: number;
};

/**
 * Selo LGPD no dashboard — greyed se média 0 (hover revela bronze); click abre modal.
 */
export function SeloLgpdWidget({ preset, maturidadeMedia, size = 99 }: Props) {
  const reactId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);

  const selo = resolveSeloLgpd({ preset, maturidadeMedia });
  const reveal = selo.greyed && (hovered || open);

  const tooltip = selo.greyed
    ? "Selo LGPD Compliance — ainda sem pontuação. Passe o mouse para ver o Bronze; clique para saber mais."
    : `Selo LGPD ${selo.planoDef.label} · ${selo.metalPalette.label}${
        selo.score != null ? ` (média ${selo.score.toFixed(2)})` : ""
      }. Clique para detalhes.`;

  return (
    <>
      <Tooltip title={open ? "" : tooltip} arrow enterDelay={400}>
        <Box
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-label={tooltip}
          aria-haspopup="dialog"
          aria-expanded={open}
          sx={{
            appearance: "none",
            border: "none",
            background: "transparent",
            p: 0,
            m: 0,
            cursor: "pointer",
            borderRadius: 0,
            lineHeight: 0,
            outline: "none",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
            "&:focus-visible": {
              outline: `2px solid ${alpha(landing.blue, 0.55)}`,
              outlineOffset: 3,
            },
          }}
        >
          <SeloLgpdBadge
            plano={selo.plano}
            palette={selo.displayPalette}
            greyed={selo.greyed}
            revealColors={reveal}
            size={size}
            uid={`dash-${reactId}`}
          />
        </Box>
      </Tooltip>

      <SeloLgpdDialog
        open={open}
        onClose={() => setOpen(false)}
        activePlano={selo.plano}
        activeMetal={selo.displayMetal}
        greyed={selo.greyed}
        score={selo.score}
      />
    </>
  );
}
