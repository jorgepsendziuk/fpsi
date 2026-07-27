"use client";

import { Text } from "@react-three/drei";

export type ZoneSignKind = "committee" | "sector" | "governance";

const STYLE: Record<
  ZoneSignKind,
  { badge: string; plate: string; badgeBar: string; title: string; subtitle: string }
> = {
  committee: {
    badge: "MESA DE COMITÊ",
    plate: "#fff8f0",
    badgeBar: "#4e342e",
    title: "#1a120c",
    subtitle: "#5d4037",
  },
  sector: {
    badge: "SALA DE SETOR",
    plate: "#f1f8fc",
    badgeBar: "#37474f",
    title: "#0d1619",
    subtitle: "#455a64",
  },
  governance: {
    badge: "MESA DE GOVERNANÇA",
    plate: "#fff9ec",
    badgeBar: "#3e2723",
    title: "#1a120c",
    subtitle: "#5d4037",
  },
};

type Props = {
  kind: ZoneSignKind;
  title: string;
  subtitle?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
};

/** Placa grande na parede — distingue mesa de comité vs sala de setor. */
export function ZoneSign({
  kind,
  title,
  subtitle,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 2.45,
  height = 0.92,
}: Props) {
  const s = STYLE[kind];
  const badgeH = 0.24;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.015]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={s.plate}
          emissive={s.plate}
          emissiveIntensity={0.12}
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>
      <mesh position={[0, height / 2 - badgeH / 2, 0.022]} receiveShadow>
        <planeGeometry args={[width, badgeH]} />
        <meshStandardMaterial
          color={s.badgeBar}
          emissive={s.badgeBar}
          emissiveIntensity={0.22}
          roughness={0.88}
        />
      </mesh>
      <Text
        position={[0, height / 2 - badgeH / 2, 0.038]}
        fontSize={0.078}
        anchorX="center"
        anchorY="middle"
        color="#fffef8"
        outlineWidth={0.018}
        outlineColor="#1a120c"
        maxWidth={width - 0.12}
        letterSpacing={0.02}
      >
        {s.badge}
      </Text>
      <Text
        position={[0, 0.04, 0.038]}
        fontSize={0.095}
        anchorX="center"
        anchorY="middle"
        color={s.title}
        outlineWidth={0.028}
        outlineColor="#fffef8"
        maxWidth={width - 0.14}
        textAlign="center"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          position={[0, -0.22, 0.038]}
          fontSize={0.058}
          anchorX="center"
          anchorY="middle"
          color={s.subtitle}
          outlineWidth={0.02}
          outlineColor="#fffef8"
          maxWidth={width - 0.14}
          textAlign="center"
        >
          {subtitle}
        </Text>
      ) : null}
    </group>
  );
}

/** Rótulo curto para portas: Mesa · CSI / Sala · TI */
export function doorLabelForCommittee(subtitle: string, title?: string): string {
  const short = subtitle.trim() || (title && title.length > 16 ? `${title.slice(0, 14)}…` : title) || "Comité";
  return `Mesa · ${short}`;
}

export function doorLabelForSector(deptName: string): string {
  const n = deptName.trim();
  const short = n.length > 18 ? `${n.slice(0, 16)}…` : n;
  return `Sala · ${short}`;
}
