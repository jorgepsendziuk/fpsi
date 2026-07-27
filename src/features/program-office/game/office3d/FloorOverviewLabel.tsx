"use client";

import { Text } from "@react-three/drei";

type Props = {
  title: string;
  subtitle?: string;
  position: [number, number, number];
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: number;
};

/** Rótulo grande no chão — legível na visão geral (overview). */
export function FloorOverviewLabel({
  title,
  subtitle,
  position,
  titleColor = "#1a120c",
  subtitleColor = "#4e342e",
  titleSize = 0.28,
}: Props) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} receiveShadow>
        <planeGeometry args={[3.6, subtitle ? 1.35 : 0.85]} />
        <meshStandardMaterial
          color="#fffef8"
          emissive="#fff8e8"
          emissiveIntensity={0.18}
          transparent
          opacity={0.72}
          roughness={0.9}
        />
      </mesh>
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.032, subtitle ? 0.22 : 0]}
        fontSize={titleSize}
        anchorX="center"
        anchorY="middle"
        color={titleColor}
        outlineWidth={0.038}
        outlineColor="#fffef5"
        maxWidth={3.2}
        textAlign="center"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.032, -0.38]}
          fontSize={titleSize * 0.48}
          anchorX="center"
          anchorY="middle"
          color={subtitleColor}
          outlineWidth={0.024}
          outlineColor="#fffef5"
          maxWidth={3.2}
          textAlign="center"
        >
          {subtitle}
        </Text>
      ) : null}
    </group>
  );
}
