"use client";

import { useEffect } from "react";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useOfficePointerHandlers } from "./OfficePointerContext";

type Props = {
  position: [number, number, number];
  /** Rotação Y da seta (rad): 0 = +Z, Math.PI/2 = +X, etc. */
  rotationY?: number;
  label?: string;
  onActivate: (e: ThreeEvent<MouseEvent>) => void;
};

const matProps = { roughness: 0.82, metalness: 0.06, flatShading: true as const };

/** Seta grande no chão indicando direção de navegação. */
export function FloorNavArrow({ position, rotationY = 0, label, onActivate }: Props) {
  const interact = useOfficePointerHandlers();

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={1.35}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0.42]}
        renderOrder={1}
        onClick={(e) => {
          e.stopPropagation();
          onActivate(e);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          interact.onPointerOver(e);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          interact.onPointerOut(e);
        }}
      >
        <planeGeometry args={[1.05, 0.72]} />
        <meshStandardMaterial
          color="#6d4c41"
          emissive="#4e342e"
          emissiveIntensity={0.22}
          transparent
          opacity={0.55}
          {...matProps}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0.08]} renderOrder={2}>
        <coneGeometry args={[0.34, 0.62, 3, 1]} />
        <meshStandardMaterial color="#a1887f" emissive="#8d6e63" emissiveIntensity={0.28} {...matProps} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, -0.28]} renderOrder={2}>
        <boxGeometry args={[0.22, 0.55, 0.08]} />
        <meshStandardMaterial color="#8d6e63" emissive="#5d4037" emissiveIntensity={0.15} {...matProps} />
      </mesh>
      {label ? (
        <Text
          position={[0, 0.08, -0.42]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.078}
          anchorX="center"
          anchorY="middle"
          color="#fff8e8"
          outlineWidth={0.028}
          outlineColor="#3e2723"
          maxWidth={1.65}
        >
          {label}
        </Text>
      ) : null}
    </group>
  );
}
