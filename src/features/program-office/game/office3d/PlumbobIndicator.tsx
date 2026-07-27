"use client";

import { useEffect, useRef, useState } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import type { OfficePersonSheetPayload } from "../OfficeExperienceContext";
import { PersonHoverCard } from "../PersonHoverCard";
import { useOfficePointerHandlers } from "./OfficePointerContext";

const SHEET_WIDTH_PX = 280;

type Props = {
  /** Centro base do indicador (antes do movimento vertical de “respiração”). */
  position?: [number, number, number];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  /** Ficha exibida ao clicar no plumbob (tamanho fixo em ecrã). */
  hoverSheet: OfficePersonSheetPayload;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

/**
 * Indicador translúcido acima da cabeça (estilo plumbob); cor pode mudar no futuro (avisos).
 */
export function PlumbobIndicator({
  position = [0, 1.06, 0.06],
  color,
  emissive,
  emissiveIntensity = 0.42,
  opacity = 0.56,
  hoverSheet,
  onClick,
}: Props) {
  const interact = useOfficePointerHandlers();
  const bobRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const baseY = position[1];
  const amp = 0.03;

  useEffect(() => {
    setPinned(false);
  }, [hoverSheet.title, hoverSheet.subtitle]);

  useFrame((st) => {
    const g = bobRef.current;
    if (!g) return;
    g.position.set(position[0], baseY + Math.sin(st.clock.elapsedTime * 2.15) * amp, position[2]);
  });

  const showSheet = pinned;
  const glow = hovered || pinned;

  return (
    <group ref={bobRef} position={[position[0], baseY, position[2]]}>
      <Billboard follow>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            setPinned((p) => !p);
            onClick?.(e);
          }}
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
          renderOrder={6}
        >
          <octahedronGeometry args={[0.095, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive ?? color}
            emissiveIntensity={glow ? emissiveIntensity * 1.35 : emissiveIntensity}
            transparent
            opacity={glow ? Math.min(opacity + 0.12, 0.92) : opacity}
            roughness={0.2}
            metalness={0.14}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
      {showSheet ? (
        <Html
          position={[0.26, 0.1, 0]}
          center
          transform={false}
          style={{
            pointerEvents: "none",
            width: SHEET_WIDTH_PX,
            maxWidth: SHEET_WIDTH_PX,
          }}
          zIndexRange={[900, 0]}
        >
          <PersonHoverCard payload={hoverSheet} />
        </Html>
      ) : null}
    </group>
  );
}
