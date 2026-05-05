"use client";

import type { JSX } from "react";

type Props = {
  rows: readonly string[] | string[];
  palette: Record<string, string>;
  pixelSize?: number;
};

/**
 * Sprite pixel-art via SVG — RPG 2D overworld (pixels nítidos).
 */
export function PixelSprite({ rows, palette, pixelSize = 3 }: Props) {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const rects: JSX.Element[] = [];
  let k = 0;
  for (let y = 0; y < h; y++) {
    const row = rows[y] || "";
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === "." || ch === " " || ch === undefined) continue;
      const fill = palette[ch];
      if (!fill) continue;
      rects.push(
        <rect
          key={k++}
          x={x * pixelSize}
          y={y * pixelSize}
          width={pixelSize}
          height={pixelSize}
          fill={fill}
        />
      );
    }
  }

  const svgW = w * pixelSize;
  const svgH = h * pixelSize;

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{
        display: "block",
        overflow: "visible",
        shapeRendering: "crispEdges",
        imageRendering: "pixelated",
      }}
      aria-hidden
    >
      {rects}
    </svg>
  );
}
