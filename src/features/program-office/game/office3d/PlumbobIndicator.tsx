"use client";

import { useEffect, useRef, useState } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import type { OfficePersonSheetPayload } from "../OfficeExperienceContext";
import { PersonHoverCard } from "../PersonHoverCard";
import { useOfficePointerHandlers } from "./OfficePointerContext";

const LEAVE_MS = 160;

type Props = {
  /** Centro base do indicador (antes do movimento vertical de “respiração”). */
  position?: [number, number, number];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  /** Painel ao passar o rato (sem modal). */
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
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];
  const amp = 0.03;

  useEffect(() => {
    return () => {
      if (leaveTimer.current != null) clearTimeout(leaveTimer.current);
    };
  }, []);

  const clearLeaveTimer = () => {
    if (leaveTimer.current != null) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  useFrame((st) => {
    const g = bobRef.current;
    if (!g) return;
    g.position.set(position[0], baseY + Math.sin(st.clock.elapsedTime * 2.15) * amp, position[2]);
  });

  return (
    <group ref={bobRef} position={[position[0], baseY, position[2]]}>
      <Billboard follow>
        <mesh
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
            clearLeaveTimer();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            interact.onPointerOut(e);
            clearLeaveTimer();
            leaveTimer.current = setTimeout(() => setHovered(false), LEAVE_MS);
          }}
          renderOrder={6}
        >
          <octahedronGeometry args={[0.095, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive ?? color}
            emissiveIntensity={emissiveIntensity}
            transparent
            opacity={opacity}
            roughness={0.2}
            metalness={0.14}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
      {hovered ? (
        <Html
          position={[0.26, 0.1, 0]}
          center
          distanceFactor={16}
          style={{ pointerEvents: "none" }}
          zIndexRange={[500, 0]}
        >
          <PersonHoverCard payload={hoverSheet} />
        </Html>
      ) : null}
    </group>
  );
}
