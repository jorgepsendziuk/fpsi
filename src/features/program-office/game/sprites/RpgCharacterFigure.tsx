"use client";

import {
  DIRECTOR_ROWS,
  PALETTE_SHADOW,
  PALETTE_WORKER,
  SHADOW_ROWS,
  WORKER_ROWS,
} from "./pixelArt";
import { PixelSprite } from "./PixelSprite";

export type RpgFigureVariant = "worker" | "director" | "shadow";

type Props = {
  variant: RpgFigureVariant;
  /** Escala base do pixel (2–4 funciona bem). */
  pixelSize?: number;
};

export function RpgCharacterFigure({ variant, pixelSize = 3 }: Props) {
  if (variant === "shadow") {
    return <PixelSprite rows={SHADOW_ROWS} palette={PALETTE_SHADOW} pixelSize={pixelSize} />;
  }
  if (variant === "director") {
    return <PixelSprite rows={DIRECTOR_ROWS} palette={PALETTE_WORKER} pixelSize={pixelSize} />;
  }
  return <PixelSprite rows={WORKER_ROWS} palette={PALETTE_WORKER} pixelSize={pixelSize} />;
}
