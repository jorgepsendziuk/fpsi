"use client";

import { Text } from "@react-three/drei";
import type { Responsavel } from "@/lib/types/types";
import type { AnnexSectorSide } from "./worldConfig";
import { AnnexDeptOccupants } from "./AnnexRoomOccupants";
import { DoubleDoorPortal } from "./DoorPortal";
import { useOfficePointerHandlers } from "./OfficePointerContext";
import { doorLabelForSector, ZoneSign } from "./ZoneSign";

const mat = { roughness: 0.88, metalness: 0.04, flatShading: true as const };

type JambProps = {
  xFace: number;
  z0: number;
  z1: number;
  doorZ: number;
  doorW: number;
  doorH: number;
  wallH: number;
  wallT: number;
  wallColor: string;
};

function CorridorJamb({ xFace, z0, z1, doorZ, doorW, doorH, wallH, wallT, wallColor }: JambProps) {
  const zLo = Math.min(z0, z1);
  const zHi = Math.max(z0, z1);
  const d0 = doorZ - doorW / 2;
  const d1 = doorZ + doorW / 2;
  const segs: Array<{ cz: number; dz: number }> = [];
  if (d0 - zLo > 0.06) segs.push({ cz: (zLo + d0) / 2, dz: d0 - zLo });
  if (zHi - d1 > 0.06) segs.push({ cz: (d1 + zHi) / 2, dz: zHi - d1 });
  return (
    <group>
      {segs.map((s) => (
        <mesh key={s.cz} position={[xFace, wallH / 2, s.cz]} castShadow receiveShadow>
          <boxGeometry args={[wallT, wallH, s.dz]} />
          <meshStandardMaterial color={wallColor} {...mat} />
        </mesh>
      ))}
      {doorH < wallH - 0.04 ? (
        <mesh position={[xFace, (wallH + doorH) / 2, doorZ]} castShadow receiveShadow>
          <boxGeometry args={[wallT, wallH - doorH, doorW]} />
          <meshStandardMaterial color={wallColor} {...mat} />
        </mesh>
      ) : null}
    </group>
  );
}

export type SectorAnnexRoomProps = {
  deptIndex: number;
  nome: string;
  pessoas: Responsavel[];
  side: AnnexSectorSide;
  roomS: number;
  cz: number;
  platCx: number;
  doorX: number;
  corridorHalf: number;
  outerWallX: number;
  accent: string;
  wallH?: number;
  doorH?: number;
  onOpen: () => void;
};

/**
 * Sala de setor legível: piso claro, moldura colorida, placa grande na parede de fundo e porta marcada.
 */
export function SectorAnnexRoom({
  deptIndex,
  nome,
  pessoas,
  side,
  roomS,
  cz,
  platCx,
  doorX,
  corridorHalf,
  outerWallX,
  accent,
  wallH = 1.52,
  doorH = 1.02,
  onOpen,
}: SectorAnnexRoomProps) {
  const interact = useOfficePointerHandlers();
  const half = roomS / 2;
  const z0 = cz - half;
  const z1 = cz + half;
  const doorW = Math.min(1.02, roomS * 0.52);
  const wallT = 0.1;
  const xJamb = side === "east" ? corridorHalf + wallT / 2 : -corridorHalf - wallT / 2;
  const portalRotY = side === "east" ? -Math.PI / 2 : Math.PI / 2;
  const signRotY = side === "east" ? -Math.PI / 2 : Math.PI / 2;
  const trim = 0.07;
  const shortName = nome.length > 22 ? `${nome.slice(0, 20)}…` : nome;
  const deptNum = String(deptIndex + 1).padStart(2, "0");

  return (
    <group>
      <group position={[platCx, 0, cz]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} receiveShadow>
          <planeGeometry args={[roomS - 0.06, roomS - 0.06]} />
          <meshStandardMaterial color="#f5f7fa" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.019, 0]} receiveShadow>
          <planeGeometry args={[roomS - 0.06, roomS - 0.06]} />
          <meshStandardMaterial color={accent} transparent opacity={0.12} roughness={1} />
        </mesh>

        {[
          [0, -half + trim / 2, roomS - trim, trim],
          [0, half - trim / 2, roomS - trim, trim],
          [-half + trim / 2, 0, trim, roomS - trim],
          [half - trim / 2, 0, trim, roomS - trim],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.022, z]} receiveShadow>
            <planeGeometry args={[w, d]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} roughness={0.85} />
          </mesh>
        ))}

        <Text
          rotation={[-Math.PI / 2, 0, 0]}
          position={[side === "east" ? half * 0.55 : -half * 0.55, 0.028, 0]}
          fontSize={0.11}
          color={accent}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#fff"
        >
          {deptNum}
        </Text>

        <mesh position={[side === "east" ? half - wallT / 2 : -half + wallT / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[wallT, wallH, roomS - 0.08]} />
          <meshStandardMaterial color="#eceff1" {...mat} />
        </mesh>
        <mesh
          position={[side === "east" ? half - wallT * 0.6 : -half + wallT * 0.6, wallH / 2, 0]}
          castShadow
        >
          <boxGeometry args={[0.04, wallH * 0.92, roomS - 0.12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} {...mat} />
        </mesh>

        <mesh position={[0, wallH / 2, half - wallT / 2]} castShadow receiveShadow>
          <boxGeometry args={[roomS - 0.1, wallH, wallT]} />
          <meshStandardMaterial color="#eceff1" {...mat} />
        </mesh>
        <mesh position={[0, wallH / 2, -half + wallT / 2]} castShadow receiveShadow>
          <boxGeometry args={[roomS - 0.1, wallH, wallT]} />
          <meshStandardMaterial color="#eceff1" {...mat} />
        </mesh>

        <mesh position={[0, 0.38, side === "east" ? -half * 0.35 : half * 0.35]} castShadow receiveShadow>
          <boxGeometry args={[roomS * 0.42, 0.06, 0.55]} />
          <meshStandardMaterial color="#78909c" {...mat} />
        </mesh>

        <AnnexDeptOccupants
          people={pessoas}
          deptName={nome}
          max={3}
          ringRadius={Math.min(0.55, roomS * 0.2)}
        />
      </group>

      <ZoneSign
        kind="sector"
        title={shortName}
        subtitle={`${pessoas.length} responsável(is) · Setor ${deptNum}`}
        position={[outerWallX, 1.22, cz]}
        rotation={[0, signRotY, 0]}
        width={Math.min(roomS + 0.5, 3.1)}
        height={0.88}
      />

      <mesh position={[doorX, doorH + 0.06, cz]} castShadow>
        <boxGeometry args={[doorW + 0.14, 0.1, 0.12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} {...mat} />
      </mesh>

      <CorridorJamb
        xFace={xJamb}
        z0={z0}
        z1={z1}
        doorZ={cz}
        doorW={doorW}
        doorH={doorH}
        wallH={wallH}
        wallT={wallT}
        wallColor="#cfd8dc"
      />

      <DoubleDoorPortal
        position={[doorX, 0, cz]}
        rotationY={portalRotY}
        openingWidth={doorW}
        openingHeight={doorH}
        badge="SALA DE SETOR"
        label={doorLabelForSector(nome)}
        labelRotation={[0.08, 0, 0]}
        labelOffset={[side === "east" ? -0.08 : 0.08, doorH + 0.32, 0]}
        interact={interact}
        onActivate={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      />
    </group>
  );
}
