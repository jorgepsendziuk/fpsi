"use client";

import { useState, type ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useOfficePointerHandlers } from "./OfficePointerContext";

type Props = {
  children: ReactNode;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  hoverScale?: number;
  disabled?: boolean;
};

/** Hover: leve zoom + cursor pointer (via OfficePointerProvider). */
export function Clickable3D({ children, onClick, hoverScale = 1.045, disabled }: Props) {
  const interact = useOfficePointerHandlers();
  const [hovered, setHovered] = useState(false);

  if (disabled) return <group>{children}</group>;

  return (
    <group
      scale={hovered ? hoverScale : 1}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick(e);
            }
          : undefined
      }
      onPointerOver={(e) => {
        e.stopPropagation();
        interact.onPointerOver(e);
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        interact.onPointerOut(e);
        setHovered(false);
      }}
    >
      {children}
    </group>
  );
}
