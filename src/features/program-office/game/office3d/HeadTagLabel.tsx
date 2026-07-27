"use client";

import { Billboard, Text } from "@react-three/drei";

type Props = {
  text: string;
  y?: number;
  color?: string;
  fontSize?: number;
};

/** Etiqueta discreta acima da cabeça (billboard). */
export function HeadTagLabel({ text, y = 1.24, color = "#1a120c", fontSize = 0.062 }: Props) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const display = trimmed.length > 14 ? `${trimmed.slice(0, 12)}…` : trimmed;

  return (
    <Billboard follow position={[0, y, 0.06]}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.032}
        outlineColor="#fffef5"
        maxWidth={1.2}
      >
        {display}
      </Text>
    </Billboard>
  );
}

import { formatResponsavelNome } from "@/lib/utils/responsavelDisplay";

/** Primeiro token útil do nome (ignora prefixos demo). */
export function firstNameHeadTag(fullName: string): string {
  const cleaned = formatResponsavelNome(fullName);
  const part = cleaned.split(/\s+/)[0] ?? cleaned;
  return part.length > 14 ? `${part.slice(0, 12)}…` : part;
}
