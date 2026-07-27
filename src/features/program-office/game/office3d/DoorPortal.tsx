"use client";

import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

const mat = { roughness: 0.9, metalness: 0.04, flatShading: true as const };

type Interact = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
};

function DoorLeaf({
  width,
  height,
  depth,
  x,
  woodMain,
  woodAccent,
}: {
  width: number;
  height: number;
  depth: number;
  x: number;
  woodMain: string;
  woodAccent: string;
}) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, height / 2, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={woodMain} {...mat} />
      </mesh>
      <mesh position={[width * 0.28, height * 0.38, depth * 0.51]} castShadow>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color="#c9a227" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, height * 0.08, depth * 0.52]} castShadow>
        <boxGeometry args={[width * 0.72, height * 0.06, 0.025]} />
        <meshStandardMaterial color={woodAccent} {...mat} />
      </mesh>
    </group>
  );
}

type Props = {
  position: [number, number, number];
  rotationY?: number;
  openingWidth?: number;
  openingHeight?: number;
  /** Espessura das folhas (volume visível). */
  leafDepth?: number;
  /** Profundidade do batente na parede. */
  frameDepth?: number;
  /** Só vão (sem folhas nem batente volumoso); placa continua acima da abertura. */
  doorwayOnly?: boolean;
  label?: string;
  /** Faixa superior (ex.: MESA DE COMITÊ / SALA DE SETOR). */
  badge?: string;
  /**
   * Inclinação suave da placa (pitch). Não use rotação em Y aqui: o `rotationY` do grupo já orienta a fachada.
   */
  labelRotation?: [number, number, number];
  labelOffset?: [number, number, number];
  interact: Interact;
  onActivate: (e: ThreeEvent<MouseEvent>) => void;
};

/**
 * Vão clicável com placa opcional; ou porta dupla completa quando `doorwayOnly={false}`.
 */
export function DoubleDoorPortal({
  position,
  rotationY = 0,
  openingWidth = 1.35,
  openingHeight = 1.05,
  leafDepth = 0.1,
  frameDepth = 0.17,
  doorwayOnly = true,
  label,
  badge,
  labelRotation = [0.12, 0, 0],
  labelOffset = [0, openingHeight + 0.14, 0.06],
  interact,
  onActivate,
}: Props) {
  const gap = 0.045;
  const leafW = (openingWidth - gap) / 2;
  const ow = openingWidth;
  const oh = openingHeight;
  const jambW = 0.11;

  const clickZ = doorwayOnly ? Math.max(0.04, frameDepth * 0.35) : leafDepth + 0.06;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {!doorwayOnly ? (
        <>
          <mesh position={[0, oh + 0.09, frameDepth / 2]} castShadow receiveShadow>
            <boxGeometry args={[ow + jambW * 2 + 0.06, 0.16, frameDepth]} />
            <meshStandardMaterial color="#5d4037" {...mat} />
          </mesh>
          <mesh position={[-(ow / 2 + jambW / 2), oh / 2, frameDepth / 2]} castShadow receiveShadow>
            <boxGeometry args={[jambW, oh + 0.12, frameDepth]} />
            <meshStandardMaterial color="#6d4c41" {...mat} />
          </mesh>
          <mesh position={[ow / 2 + jambW / 2, oh / 2, frameDepth / 2]} castShadow receiveShadow>
            <boxGeometry args={[jambW, oh + 0.12, frameDepth]} />
            <meshStandardMaterial color="#6d4c41" {...mat} />
          </mesh>
          <mesh position={[0, 0.05, frameDepth / 2]} castShadow receiveShadow>
            <boxGeometry args={[ow + jambW * 2 + 0.04, 0.1, frameDepth + 0.06]} />
            <meshStandardMaterial color="#4e342e" {...mat} />
          </mesh>
          <group position={[0, 0.02, leafDepth * 0.5 + 0.015]}>
            <DoorLeaf width={leafW} height={oh} depth={leafDepth} x={-(leafW / 2 + gap / 4)} woodMain="#5d4037" woodAccent="#3e2723" />
            <DoorLeaf width={leafW} height={oh} depth={leafDepth} x={leafW / 2 + gap / 4} woodMain="#4e342e" woodAccent="#2e1f18" />
          </group>
        </>
      ) : null}

      <mesh
        position={[0, oh / 2 + 0.02, clickZ]}
        onClick={(e) => {
          e.stopPropagation();
          onActivate(e);
        }}
        {...interact}
      >
        <planeGeometry args={[openingWidth + 0.15, openingHeight + 0.12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {label || badge ? (
        <group position={labelOffset} rotation={labelRotation}>
          <mesh
            position={[0, badge ? 0.08 : 0, 0.01]}
            onClick={(e) => {
              e.stopPropagation();
              onActivate(e);
            }}
            {...interact}
          >
            <planeGeometry args={[Math.min(openingWidth + 0.72, 1.95), badge ? 0.52 : 0.42]} />
            <meshStandardMaterial
              color="#fffdf7"
              emissive="#fff8e8"
              emissiveIntensity={0.14}
              roughness={0.72}
              metalness={0.02}
            />
          </mesh>
          {badge ? (
            <>
              <mesh position={[0, 0.2, 0.014]}>
                <planeGeometry args={[Math.min(openingWidth + 0.72, 1.95), 0.16]} />
                <meshStandardMaterial color="#4e342e" emissive="#3e2723" emissiveIntensity={0.18} roughness={0.9} />
              </mesh>
              <Text
                position={[0, 0.2, 0.028]}
                fontSize={0.052}
                maxWidth={1.75}
                anchorX="center"
                anchorY="middle"
                color="#fffef8"
                outlineWidth={0.016}
                outlineColor="#1a120c"
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate(e);
                }}
                {...interact}
              >
                {badge}
              </Text>
            </>
          ) : null}
          {label ? (
            <Text
              position={[0, badge ? -0.02 : 0, 0.028]}
              fontSize={0.098}
              maxWidth={1.75}
              anchorX="center"
              anchorY="middle"
              color="#0a0705"
              outlineWidth={0.032}
              outlineColor="#fffef8"
              onClick={(e) => {
                e.stopPropagation();
                onActivate(e);
              }}
              {...interact}
            >
              {label}
            </Text>
          ) : null}
        </group>
      ) : null}
    </group>
  );
}
