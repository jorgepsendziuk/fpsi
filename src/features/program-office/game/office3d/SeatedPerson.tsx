"use client";

import type { OfficePersonSheetPayload } from "../OfficeExperienceContext";
import { pantsColorFromSeed, shirtColorFromSeed } from "./minifigColors";
import { PlumbobIndicator } from "./PlumbobIndicator";

type Props = {
  facingY: number;
  variant?: "office" | "officeChefe";
  colorSeed?: string;
  /** Resumo ao passar o rato no plumbob. */
  sheet: OfficePersonSheetPayload;
  /** Clique opcional (ações futuras). */
  onPlumbobClick?: () => void;
  /** Cor do indicador (futuro: avisos = amarelo/vermelho). */
  indicatorColor?: string;
  indicatorEmissive?: string;
};

const SKIN = "#f3c08c";
const TIE = "#c9a227";
const SHOES = "#1a1a1a";

const DEFAULT_PLUMBOB = { color: "#52d87a", emissive: "#1b5e20" };
const CHEFE_PLUMBOB = { color: "#69f0ae", emissive: "#00695c" };

export function SeatedPerson({
  facingY,
  variant = "office",
  sheet,
  onPlumbobClick,
  colorSeed,
  indicatorColor,
  indicatorEmissive,
}: Props) {
  const seed = colorSeed ?? "fig";
  const shirt = shirtColorFromSeed(variant === "officeChefe" ? `chefe:${seed}` : seed);
  const pants = pantsColorFromSeed(`${seed}:p`);
  const plumbob =
    indicatorColor != null
      ? { color: indicatorColor, emissive: indicatorEmissive ?? indicatorColor }
      : variant === "officeChefe"
        ? CHEFE_PLUMBOB
        : DEFAULT_PLUMBOB;

  return (
    <group rotation={[0, facingY, 0]}>
      <mesh position={[0, 0.16, -0.14]} castShadow>
        <boxGeometry args={[0.36, 0.2, 0.3]} />
        <meshStandardMaterial color="#4e3423" flatShading roughness={0.9} />
      </mesh>

      <mesh position={[-0.06, 0.22, 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.16, 0.12]} />
        <meshStandardMaterial color={pants} flatShading roughness={0.88} />
      </mesh>
      <mesh position={[0.06, 0.22, 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.16, 0.12]} />
        <meshStandardMaterial color={pants} flatShading roughness={0.88} />
      </mesh>
      <mesh position={[-0.06, 0.08, 0.06]} castShadow>
        <boxGeometry args={[0.11, 0.06, 0.14]} />
        <meshStandardMaterial color={SHOES} flatShading />
      </mesh>
      <mesh position={[0.06, 0.08, 0.06]} castShadow>
        <boxGeometry args={[0.11, 0.06, 0.14]} />
        <meshStandardMaterial color={SHOES} flatShading />
      </mesh>

      <mesh position={[0, 0.38, 0.06]} castShadow>
        <boxGeometry args={[0.28, 0.22, 0.16]} />
        <meshStandardMaterial color={shirt} flatShading roughness={0.78} />
      </mesh>
      {variant === "officeChefe" ? (
        <mesh position={[0, 0.4, 0.14]} castShadow>
          <boxGeometry args={[0.06, 0.14, 0.02]} />
          <meshStandardMaterial color={TIE} flatShading roughness={0.6} />
        </mesh>
      ) : null}

      <mesh position={[-0.19, 0.38, 0.06]} castShadow rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.08, 0.16, 0.1]} />
        <meshStandardMaterial color={shirt} flatShading roughness={0.78} />
      </mesh>
      <mesh position={[0.19, 0.38, 0.06]} castShadow rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.08, 0.16, 0.1]} />
        <meshStandardMaterial color={shirt} flatShading roughness={0.78} />
      </mesh>
      <mesh position={[-0.24, 0.32, 0.08]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color={SKIN} flatShading />
      </mesh>
      <mesh position={[0.24, 0.32, 0.08]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color={SKIN} flatShading />
      </mesh>

      <mesh position={[0, 0.58, 0.06]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.14, 12]} />
        <meshStandardMaterial color={SKIN} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.68, 0.06]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.05, 12]} />
        <meshStandardMaterial color="#2c2c2c" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[-0.035, 0.57, 0.145]} castShadow>
        <boxGeometry args={[0.028, 0.028, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      <mesh position={[0.035, 0.57, 0.145]} castShadow>
        <boxGeometry args={[0.028, 0.028, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>

      <PlumbobIndicator
        position={[0, 1.06, 0.06]}
        color={plumbob.color}
        emissive={plumbob.emissive}
        opacity={0.55}
        emissiveIntensity={0.4}
        hoverSheet={sheet}
        onClick={
          onPlumbobClick
            ? (e) => {
                e.stopPropagation();
                onPlumbobClick();
              }
            : undefined
        }
      />
    </group>
  );
}
