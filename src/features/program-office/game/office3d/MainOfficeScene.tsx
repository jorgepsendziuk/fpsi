"use client";

import { useLayoutEffect, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import type { OfficeCameraApiRef } from "../officeCameraApi";
import { useOfficeExperience, type OfficeChip, type OfficeCommitteeSlot, type OfficeMesaSlot, type OfficePersonSheetPayload } from "../OfficeExperienceContext";
import {
  WORLD_HALF,
  ANNEX_CORRIDOR_LEN,
  ANNEX_START_GAP,
  annexCorridorWorldZCenter,
  CORRIDOR_HALF_WIDTH,
  mainSouthOpeningHalf,
} from "./worldConfig";
import { CameraZoomRig } from "./CameraZoomRig";
import { DoubleDoorPortal } from "./DoorPortal";
import { useOfficePointerHandlers } from "./OfficePointerContext";
import { PlumbobIndicator } from "./PlumbobIndicator";
import { SeatedPerson } from "./SeatedPerson";

const matProps = { roughness: 0.92, metalness: 0.05, flatShading: true as const };

const COMMITTEE_LAYOUT: Array<{ pos: readonly [number, number, number]; groupRotY: number }> = [
  { pos: [-3.35, 0, -1.82], groupRotY: 0.22 },
  { pos: [-3.35, 0, 2.05], groupRotY: -0.28 },
  { pos: [3.62, 0, 0.38], groupRotY: Math.PI * 0.92 },
];

type SeatItem = { slot: OfficeMesaSlot; pos: [number, number, number]; facingY: number };

function buildCentralMesaLayout(slots: OfficeMesaSlot[]): SeatItem[] {
  const chefe = slots.find((s) => s.chefe);
  const others = slots.filter((s) => !s.chefe);
  const n = slots.length;
  if (!chefe || others.length !== 4) {
    const xs =
      n <= 1
        ? [0]
        : Array.from({ length: n }, (_, i) => -2.05 + (4.1 * i) / Math.max(1, n - 1));
    const z = -1.2;
    return slots.map((slot, i) => {
      const x = xs[i] ?? 0;
      return { slot, pos: [x, 0, z] as [number, number, number], facingY: Math.atan2(-x, -z) };
    });
  }

  /**
   * Mesa retangular no XZ: 2,75 (eixo X) × 1,65 (eixo Z).
   * Arestas mais curtas (≈1,65 m) estão em x = ±… → pontas leste/oeste.
   * Arestas mais longas (≈2,75 m) estão em z = ±… → lados norte/sul.
   * Chefe (alta administração) numa ponta menor; os outros 4: dois em cada lado maior.
   */
  const halfXShort = 2.75 / 2 + 0.14;
  const halfZLong = 1.65 / 2 + 0.14;
  const xAlongLong = [-0.62, 0.62] as const;
  const north = others.slice(0, 2);
  const south = others.slice(2, 4);
  const out: SeatItem[] = [];

  out.push({ slot: chefe, pos: [-halfXShort, 0, 0], facingY: Math.atan2(halfXShort, 0) });
  north.forEach((slot, i) => {
    const px = xAlongLong[i] ?? 0;
    out.push({ slot, pos: [px, 0, halfZLong], facingY: Math.atan2(-px, -halfZLong) });
  });
  south.forEach((slot, i) => {
    const px = xAlongLong[i] ?? 0;
    out.push({ slot, pos: [px, 0, -halfZLong], facingY: Math.atan2(-px, halfZLong) });
  });

  return out;
}

function MainOfficeFov() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 52;
      camera.updateProjectionMatrix();
    }
  }, [camera]);
  return null;
}

/** Paredes no limite com o corredor, com vão de porta (sem caixa fechada). */
function CorridorJambWall({
  xFace,
  z0,
  z1,
  doorZ,
  doorW,
  doorH,
  wallH,
  wallT,
  mat,
}: {
  xFace: number;
  z0: number;
  z1: number;
  doorZ: number;
  doorW: number;
  doorH: number;
  wallH: number;
  wallT: number;
  mat: typeof matProps;
}) {
  const zLo = Math.min(z0, z1);
  const zHi = Math.max(z0, z1);
  const d0 = doorZ - doorW / 2;
  const d1 = doorZ + doorW / 2;
  const segs: Array<{ cz: number; dz: number }> = [];
  if (d0 - zLo > 0.07) segs.push({ cz: (zLo + d0) / 2, dz: d0 - zLo });
  if (zHi - d1 > 0.07) segs.push({ cz: (d1 + zHi) / 2, dz: zHi - d1 });
  return (
    <group>
      {segs.map((s) => (
        <mesh key={`${s.cz}`} position={[xFace, wallH / 2, s.cz]} castShadow receiveShadow>
          <boxGeometry args={[wallT, wallH, s.dz]} />
          <meshStandardMaterial color="#8c7d72" {...mat} />
        </mesh>
      ))}
      {doorH < wallH - 0.04 ? (
        <mesh position={[xFace, (wallH + doorH) / 2, doorZ]} castShadow receiveShadow>
          <boxGeometry args={[wallT, wallH - doorH, doorW]} />
          <meshStandardMaterial color="#8c7d72" {...mat} />
        </mesh>
      ) : null}
    </group>
  );
}

/**
 * Corredor fino (ligação à sala principal) + salas em planta 3D aberta (sem teto), com portas para o corredor.
 */
function MainOfficeAnnexPlan() {
  const ctx = useOfficeExperience();
  const interact = useOfficePointerHandlers();
  const hw = WORLD_HALF;
  const stubMat = { roughness: 0.88, metalness: 0.06, flatShading: true as const };
  const grupos = ctx.gruposDept;
  const committees = ctx.committeesAll.slice(0, 3);
  const deptColors = ["#78909c", "#8d6e63", "#9575cd", "#4db6ac", "#ffb74d", "#90a4ae", "#7e8c9d"];
  const comColors = ["#6d5a4e", "#5d4e42", "#4e4038"];

  const xMin = -hw;
  const xMax = hw;
  const corHalfW = CORRIDOR_HALF_WIDTH;
  const len = ANNEX_CORRIDOR_LEN;
  const startGap = ANNEX_START_GAP;
  const zCenter = hw + startGap + len / 2;
  const wallH = 2.2;
  const wallT = 0.08;
  const outerT = 0.14;
  const partT = 0.1;
  const doorH = 1.05;

  const platCx = 0;
  const platW = hw * 2 + 0.12;
  const corW = corHalfW * 2;
  const southWestW = -corHalfW - xMin + outerT;
  const southEastW = xMax - corHalfW + outerT;

  const zPad = 0.5;
  const usableZ = len - 2 * zPad;
  const nCom = committees.length;
  const comCenters =
    nCom > 0 ? committees.map((_, i) => -len / 2 + zPad + (usableZ / nCom) * (i + 0.5)) : [];
  const comDz = nCom > 0 ? (usableZ / nCom) * 0.86 : 0;

  const nDept = Math.min(grupos.length, 7);
  const deptCenters =
    nDept > 0 ? Array.from({ length: nDept }, (_, i) => -len / 2 + zPad + (usableZ / nDept) * (i + 0.5)) : [];
  const deptDz = nDept > 0 ? (usableZ / nDept) * 0.86 : 0;

  const westWingW = -corHalfW - xMin;
  const eastWingW = xMax - corHalfW;
  const westPlatCx = (xMin - corHalfW) / 2;
  const eastPlatCx = (xMax + corHalfW) / 2;

  return (
    <group>
      {/* Ligação estreita à sala principal: só largura do corredor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, hw + startGap * 0.35]} receiveShadow>
        <planeGeometry args={[corW + 0.06, startGap + 0.55]} />
        <meshStandardMaterial color="#7d7064" roughness={0.92} />
      </mesh>

      <group position={[0, 0.002, zCenter]}>
        {/* Piso geral (alas); corredor como faixa central */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[platCx, 0, 0]} receiveShadow>
          <planeGeometry args={[platW, len + 0.28]} />
          <meshStandardMaterial color="#9c8d7c" roughness={0.9} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
          <planeGeometry args={[corW - 0.04, len - 0.2]} />
          <meshStandardMaterial color="#6e6158" roughness={0.93} />
        </mesh>

        <mesh position={[platCx, wallH / 2, len / 2 + outerT / 2]} castShadow receiveShadow>
          <boxGeometry args={[platW + outerT * 2, wallH, outerT]} />
          <meshStandardMaterial color="#7d6f64" {...stubMat} />
        </mesh>

        <mesh position={[xMin - outerT / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[outerT, wallH, len + outerT]} />
          <meshStandardMaterial color="#8a7b6f" {...stubMat} />
        </mesh>
        <mesh position={[xMax + outerT / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[outerT, wallH, len + outerT]} />
          <meshStandardMaterial color="#8a7b6f" {...stubMat} />
        </mesh>

        <mesh position={[(xMin - corHalfW) / 2, wallH / 2, -len / 2 - outerT / 2]} castShadow receiveShadow>
          <boxGeometry args={[southWestW, wallH, outerT]} />
          <meshStandardMaterial color="#8a7b6f" {...stubMat} />
        </mesh>
        <mesh position={[(xMax + corHalfW) / 2, wallH / 2, -len / 2 - outerT / 2]} castShadow receiveShadow>
          <boxGeometry args={[southEastW, wallH, outerT]} />
          <meshStandardMaterial color="#8a7b6f" {...stubMat} />
        </mesh>

        {committees.slice(0, -1).map((c, i) => {
          const zMid = (comCenters[i]! + comCenters[i + 1]!) / 2;
          return (
            <mesh
              key={`com-part-${c.tipo}`}
              position={[westPlatCx, wallH / 2, zMid]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[westWingW, wallH, partT]} />
              <meshStandardMaterial color="#6d6258" {...stubMat} />
            </mesh>
          );
        })}

        {Array.from({ length: Math.max(nDept - 1, 0) }, (_, i) => {
          const zMid = (deptCenters[i]! + deptCenters[i + 1]!) / 2;
          return (
            <mesh key={`dept-part-${i}`} position={[eastPlatCx, wallH / 2, zMid]} castShadow receiveShadow>
              <boxGeometry args={[eastWingW, wallH, partT]} />
              <meshStandardMaterial color="#6d6258" {...stubMat} />
            </mesh>
          );
        })}

        <pointLight position={[0, wallH * 0.95, -len * 0.12]} intensity={0.38} distance={17} decay={2} />
        <pointLight position={[0, wallH * 0.92, len * 0.2]} intensity={0.48} distance={20} decay={2} />

        <Text position={[0, wallH + 0.08, -len * 0.32]} fontSize={0.088} color="#120d0a" anchorX="center" outlineWidth={0.018} outlineColor="#fffef5">
          Corredor
        </Text>

        {committees.map((c, i) => {
          const cz = comCenters[i] ?? 0;
          const z0 = cz - comDz / 2;
          const z1 = cz + comDz / 2;
          const doorW = Math.min(1.05, comDz * 0.62);
          const xJamb = -corHalfW - wallT / 2;
          const innerMat = { color: comColors[i % comColors.length]! };

          return (
            <group key={c.tipo}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[westPlatCx, 0.006, cz]} receiveShadow>
                <planeGeometry args={[westWingW - 0.06, comDz - 0.08]} />
                <meshStandardMaterial color="#d7cec4" roughness={0.91} />
              </mesh>

              <mesh position={[xMin + wallT / 2, wallH / 2, cz]} castShadow receiveShadow>
                <boxGeometry args={[wallT, wallH, comDz - 0.06]} />
                <meshStandardMaterial {...innerMat} {...stubMat} />
              </mesh>
              <mesh position={[westPlatCx, wallH / 2, z1 - wallT / 2]} castShadow receiveShadow>
                <boxGeometry args={[westWingW - wallT * 0.5, wallH, wallT]} />
                <meshStandardMaterial {...innerMat} {...stubMat} />
              </mesh>
              <mesh position={[westPlatCx, wallH / 2, z0 + wallT / 2]} castShadow receiveShadow>
                <boxGeometry args={[westWingW - wallT * 0.5, wallH, wallT]} />
                <meshStandardMaterial {...innerMat} {...stubMat} />
              </mesh>

              <CorridorJambWall
                xFace={xJamb}
                z0={z0}
                z1={z1}
                doorZ={cz}
                doorW={doorW}
                doorH={doorH}
                wallH={wallH}
                wallT={wallT}
                mat={stubMat}
              />

              <DoubleDoorPortal
                position={[-corHalfW + 0.05, 0, cz]}
                rotationY={Math.PI / 2}
                openingWidth={doorW}
                openingHeight={doorH}
                label={c.title.length > 20 ? `${c.title.slice(0, 18)}…` : c.title}
                labelRotation={[0.1, 0, 0]}
                labelOffset={[0.1, doorH + 0.2, 0]}
                interact={interact}
                onActivate={(e) => {
                  e.stopPropagation();
                  ctx.openIframe(c.href, c.title);
                }}
              />

              <mesh position={[xMin + westWingW * 0.35, wallT * 1.2, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[Math.min(comDz * 0.45, 1.15), 0.55]} />
                <meshStandardMaterial color="#efebe9" emissive="#4e342e" emissiveIntensity={0.08} roughness={0.82} />
              </mesh>
            </group>
          );
        })}

        {grupos.slice(0, 7).map(([nome, pessoas], i) => {
          const cz = deptCenters[i] ?? 0;
          const z0 = cz - deptDz / 2;
          const z1 = cz + deptDz / 2;
          const doorW = Math.min(0.98, deptDz * 0.6);
          const xJamb = corHalfW + wallT / 2;
          const shortName = nome.length > 14 ? `${nome.slice(0, 12)}…` : nome;
          const innerMat = { color: deptColors[i % deptColors.length]! };

          return (
            <group key={nome}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[eastPlatCx, 0.006, cz]} receiveShadow>
                <planeGeometry args={[eastWingW - 0.06, deptDz - 0.08]} />
                <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
              </mesh>

              <mesh position={[xMax - wallT / 2, wallH / 2, cz]} castShadow receiveShadow>
                <boxGeometry args={[wallT, wallH, deptDz - 0.06]} />
                <meshStandardMaterial {...innerMat} {...stubMat} />
              </mesh>
              <mesh position={[eastPlatCx, wallH / 2, z1 - wallT / 2]} castShadow receiveShadow>
                <boxGeometry args={[eastWingW - wallT * 0.5, wallH, wallT]} />
                <meshStandardMaterial {...innerMat} {...stubMat} />
              </mesh>
              <mesh position={[eastPlatCx, wallH / 2, z0 + wallT / 2]} castShadow receiveShadow>
                <boxGeometry args={[eastWingW - wallT * 0.5, wallH, wallT]} />
                <meshStandardMaterial {...innerMat} {...stubMat} />
              </mesh>

              <CorridorJambWall
                xFace={xJamb}
                z0={z0}
                z1={z1}
                doorZ={cz}
                doorW={doorW}
                doorH={doorH}
                wallH={wallH}
                wallT={wallT}
                mat={stubMat}
              />

              <DoubleDoorPortal
                position={[corHalfW - 0.05, 0, cz]}
                rotationY={-Math.PI / 2}
                openingWidth={doorW}
                openingHeight={doorH}
                label={shortName}
                labelRotation={[0.1, 0, 0]}
                labelOffset={[-0.1, doorH + 0.18, 0]}
                interact={interact}
                onActivate={(e) => {
                  e.stopPropagation();
                  ctx.enterSectorRoom(nome, pessoas);
                }}
              />

              <mesh position={[xMax - eastWingW * 0.35, wallT * 1.2, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[Math.min(deptDz * 0.42, 0.95), 0.5]} />
                <meshStandardMaterial color="#eceff1" emissive="#37474f" emissiveIntensity={0.1} roughness={0.78} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function RoomMeshes() {
  const hw = WORLD_HALF;
  const wallT = 0.22;
  const wallH = 2.35;
  const southXHalf = hw + wallT;
  const openingHalf = mainSouthOpeningHalf(CORRIDOR_HALF_WIDTH);
  const southSegW = southXHalf - openingHalf;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, hw * 2]} />
        <meshStandardMaterial color="#c9b18d" {...matProps} />
      </mesh>

      <mesh position={[0, wallH / 2, -hw]} castShadow receiveShadow>
        <boxGeometry args={[hw * 2 + wallT * 2, wallH, wallT]} />
        <meshStandardMaterial color="#a1887f" {...matProps} />
      </mesh>
      <mesh position={[-(southXHalf + openingHalf) / 2, wallH / 2, hw]} castShadow receiveShadow>
        <boxGeometry args={[southSegW, wallH, wallT]} />
        <meshStandardMaterial color="#a1887f" {...matProps} />
      </mesh>
      <mesh position={[(southXHalf + openingHalf) / 2, wallH / 2, hw]} castShadow receiveShadow>
        <boxGeometry args={[southSegW, wallH, wallT]} />
        <meshStandardMaterial color="#a1887f" {...matProps} />
      </mesh>
      <mesh position={[-hw, wallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, hw * 2]} />
        <meshStandardMaterial color="#bcaaa4" {...matProps} />
      </mesh>
      <mesh position={[hw, wallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, hw * 2]} />
        <meshStandardMaterial color="#bcaaa4" {...matProps} />
      </mesh>

      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.75, 0.22, 1.65]} />
        <meshStandardMaterial color="#4e342e" {...matProps} />
      </mesh>
    </group>
  );
}

function WallPosters() {
  const ctx = useOfficeExperience();
  const hw = WORLD_HALF;
  const xs = [-2.35, 0, 2.35];
  const interact = useOfficePointerHandlers();

  return (
    <>
      {ctx.boardPosters.slice(0, 3).map((b, i) => (
        <group key={b.key} position={[xs[i] ?? 0, 1.22, -hw + 0.12]} rotation={[0.07, 0, 0]}>
          <mesh position={[0, 0, 0.015]} castShadow>
            <planeGeometry args={[1.52, 0.95]} />
            <meshStandardMaterial color="#3e2f26" roughness={0.9} flatShading />
          </mesh>
          <mesh
            position={[0, 0, 0.04]}
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              ctx.openIframe(b.href, b.title);
            }}
            {...interact}
          >
            <planeGeometry args={[1.38, 0.86]} />
            <meshStandardMaterial color="#faf6ef" roughness={0.85} flatShading />
          </mesh>
          <Text
            position={[0, 0.22, 0.055]}
            fontSize={0.096}
            maxWidth={1.28}
            anchorX="center"
            anchorY="middle"
            color="#140f0c"
            outlineWidth={0.02}
            outlineColor="#fffef8"
            onClick={(e) => {
              e.stopPropagation();
              ctx.openIframe(b.href, b.title);
            }}
            {...interact}
          >
            {b.title}
          </Text>
          <Text
            position={[0, -0.2, 0.056]}
            fontSize={0.058}
            maxWidth={1.28}
            anchorX="center"
            anchorY="middle"
            color="#3d2e26"
            outlineWidth={0.014}
            outlineColor="#fffef8"
            onClick={(e) => {
              e.stopPropagation();
              ctx.openIframe(b.href, b.title);
            }}
            {...interact}
          >
            {b.line}
          </Text>
        </group>
      ))}
    </>
  );
}

function EmptyMesaSeat({ facingY, slot }: { facingY: number; slot: OfficeMesaSlot }) {
  const sheet: OfficePersonSheetPayload = {
    title: slot.rotulo,
    subtitle: "Lugar vago",
    rows: [
      { label: "Papel", value: slot.rotulo },
      { label: "Estado", value: "A designar" },
      {
        label: "Como preencher",
        value: "Defina o responsável na estrutura de governança (Equipa).",
      },
    ],
  };
  return (
    <group rotation={[0, facingY, 0]}>
      <mesh position={[0, 0.18, -0.16]} castShadow>
        <boxGeometry args={[0.34, 0.22, 0.28]} />
        <meshStandardMaterial color="#4a3728" flatShading roughness={0.92} />
      </mesh>
      <PlumbobIndicator
        position={[0, 0.98, 0.06]}
        color="#9e9e9e"
        emissive="#757575"
        emissiveIntensity={0.22}
        opacity={0.45}
        hoverSheet={sheet}
      />
    </group>
  );
}

function MesaSeatsRing() {
  const ctx = useOfficeExperience();
  const layout = useMemo(() => buildCentralMesaLayout(ctx.mesaSlots), [ctx.mesaSlots]);

  return (
    <>
      {layout.map(({ slot, pos, facingY }) => (
        <group key={slot.campo} position={pos}>
          {slot.empty ? (
            <EmptyMesaSeat facingY={facingY} slot={slot} />
          ) : (
            <SeatedPerson
              facingY={facingY}
              variant={slot.chefe ? "officeChefe" : "office"}
              colorSeed={slot.chefe ? `mesa-chefe:${slot.campo}` : `mesa:${slot.campo}`}
              sheet={{
                title: slot.label,
                subtitle: slot.rotulo,
                rows: [
                  { label: "Papel", value: slot.rotulo },
                  { label: "Cargo / setor", value: slot.cargoSetorLine.trim() || "—" },
                  { label: "Nome", value: slot.label },
                ],
              }}
            />
          )}
        </group>
      ))}
    </>
  );
}

function hashChipKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function stable01(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

type PaperLayout = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  w: number;
  d: number;
  paperColor: string;
  lineColor: string;
};

function paperLayoutForChip(chipKey: string, index: number, total: number): PaperLayout {
  const base = index * 19.127 + hashChipKey(chipKey);
  const u = (k: number) => stable01(base + k * 2.718);

  /** Espaçamento entre centros (largura ~0,4–0,44). */
  const spacingX = 0.54;
  const perRow = 4;
  const row = Math.floor(index / perRow);
  const col = index % perRow;
  const remaining = total - row * perRow;
  const nInRow = Math.min(perRow, remaining);
  const rowStartX = nInRow <= 1 ? 0 : (-(nInRow - 1) * spacingX) / 2;

  const xBase = nInRow === 1 ? 0 : rowStartX + col * spacingX;
  const x = Math.max(-1.02, Math.min(1.02, xBase + (u(1) - 0.5) * 0.05));
  const z = Math.max(
    -0.55,
    Math.min(0.55, 0.12 - row * 0.44 + (u(2) - 0.5) * 0.04),
  );

  const ry = (u(3) - 0.5) * 0.38;
  const rx = (u(4) - 0.5) * 0.1;
  const rz = (u(5) - 0.5) * 0.16;

  const w = 0.37 + u(6) * 0.04;
  const d = 0.48 + u(7) * 0.04;
  const y = 0.22 + 0.006 + index * 0.004;

  const paperColor = u(8) > 0.55 ? "#faf6ef" : "#f3ede3";
  const lineColor = u(9) > 0.5 ? "#e8e0d4" : "#ded5c8";

  return { x, y, z, rx, ry, rz, w, d, paperColor, lineColor };
}

/** Folhas finas sobre a mesa principal; posição/rotação “bagunçada” mas estável por atalho. */
function DeskPaperSheet({ chip, layout }: { chip: OfficeChip; layout: PaperLayout }) {
  const ctx = useOfficeExperience();
  const interact = useOfficePointerHandlers();
  const { x, y, z, rx, ry, rz, w, d, paperColor, lineColor } = layout;
  const thick = 0.009;
  const topY = thick / 2 + 0.001;

  const open = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    ctx.openIframe(chip.href, chip.label);
  };

  return (
    <group position={[x, y, z]} rotation={[rx, ry, rz]}>
      <mesh castShadow receiveShadow onClick={open} {...interact}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={paperColor} roughness={0.91} metalness={0.02} flatShading />
      </mesh>
      {[0.12, 0.02, -0.08].map((lz, i) => (
        <mesh key={i} position={[0, topY + 0.0012, lz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w * 0.72, 0.004]} />
          <meshStandardMaterial color={lineColor} roughness={1} metalness={0} />
        </mesh>
      ))}
      <Text
        position={[0, topY + 0.008, -0.14]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.044}
        maxWidth={w * 0.88}
        anchorX="center"
        anchorY="middle"
        color="#2a1f14"
        outlineWidth={0.005}
        outlineColor="#faf6ef"
        onClick={open}
        {...interact}
      >
        {chip.label}
      </Text>
      <Text
        position={[0, topY + 0.008, 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        maxWidth={w * 0.88}
        anchorX="center"
        anchorY="middle"
        color="#5d4037"
        outlineWidth={0.004}
        outlineColor="#faf6ef"
        onClick={open}
        {...interact}
      >
        {chip.detail}
      </Text>
    </group>
  );
}

function ChipRow() {
  const ctx = useOfficeExperience();
  const chips = ctx.chips;
  const n = chips.length;
  const layouts = useMemo(() => chips.map((c, i) => paperLayoutForChip(c.key, i, n)), [chips, n]);

  if (n === 0) return null;

  return (
    <>
      {chips.map((c, i) => (
        <DeskPaperSheet key={c.key} chip={c} layout={layouts[i]!} />
      ))}
    </>
  );
}

function CommitteeRoundTable({ slot, layout }: { slot: OfficeCommitteeSlot; layout: (typeof COMMITTEE_LAYOUT)[number] }) {
  const ctx = useOfficeExperience();
  const interact = useOfficePointerHandlers();
  const ids = slot.memberIds.slice(0, 8);
  const r = 0.95;
  /** Tampo do cilindro (centro 0.11, altura 0.22). */
  const tableTopY = 0.22;
  const labelY = tableTopY + 0.005;
  const textRot: [number, number, number] = [-Math.PI / 2, 0, 0];

  return (
    <group position={[layout.pos[0], 0, layout.pos[2]]} rotation={[0, layout.groupRotY, 0]}>
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.11, 0]}
        onClick={(e) => {
          e.stopPropagation();
          ctx.openIframe(slot.href, slot.title);
        }}
        {...interact}
      >
        <cylinderGeometry args={[0.72, 0.78, 0.22, 18]} />
        <meshStandardMaterial color="#5d4037" {...matProps} />
      </mesh>

      <Text
        position={[0, labelY, 0.05]}
        rotation={textRot}
        fontSize={0.072}
        maxWidth={1.12}
        anchorX="center"
        anchorY="middle"
        color="#f5efe4"
        outlineWidth={0.02}
        outlineColor="#1a120c"
        onClick={(e) => {
          e.stopPropagation();
          ctx.openIframe(slot.href, slot.title);
        }}
        {...interact}
      >
        {slot.title}
      </Text>
      <Text
        position={[0, labelY, -0.065]}
        rotation={textRot}
        fontSize={0.042}
        maxWidth={1.12}
        anchorX="center"
        anchorY="middle"
        color="#d7ccc8"
        outlineWidth={0.014}
        outlineColor="#1a120c"
        onClick={(e) => {
          e.stopPropagation();
          ctx.openIframe(slot.href, slot.title);
        }}
        {...interact}
      >
        {ids.length === 0 ? "Sem membros" : `${slot.subtitle} · ${slot.count} membro(s)`}
      </Text>

      {ids.length === 0 ? null : (
        ids.map((id, i) => {
          const a = (i / Math.max(ids.length, 1)) * Math.PI * 2;
          const px = Math.sin(a) * r;
          const pz = Math.cos(a) * r;
          const nome = ctx.nomePorResponsavelId.get(id)?.trim() || `#${id}`;
          const shortNome = nome.length > 18 ? `${nome.slice(0, 16)}…` : nome;
          const resp = ctx.responsaveis.find((x) => x.id === id);
          const cargoSetor = [resp?.cargo?.trim(), resp?.departamento?.trim()].filter(Boolean).join(" · ");
          const facingY = Math.atan2(-px, -pz);
          return (
            <group key={id} position={[px, 0, pz]}>
              <SeatedPerson
                facingY={facingY}
                colorSeed={`mem-${id}`}
                sheet={{
                  title: shortNome,
                  subtitle: slot.title,
                  rows: [
                    { label: "Comité", value: slot.title },
                    { label: "Função", value: slot.subtitle },
                    { label: "Nome", value: nome },
                    { label: "Cargo / setor", value: cargoSetor || "—" },
                  ],
                }}
              />
            </group>
          );
        })
      )}
    </group>
  );
}

function MainSouthDoor() {
  const ctx = useOfficeExperience();
  const hw = WORLD_HALF;
  const interact = useOfficePointerHandlers();
  const openingW = mainSouthOpeningHalf(CORRIDOR_HALF_WIDTH) * 2;

  return (
    <DoubleDoorPortal
      position={[0, 0, hw - 0.14]}
      rotationY={0}
      openingWidth={openingW}
      openingHeight={1.02}
      label="Corredor"
      labelRotation={[0.1, 0, 0]}
      labelOffset={[0, 1.22, 0.12]}
      interact={interact}
      onActivate={(e) => {
        e.stopPropagation();
        ctx.enterCorridor();
      }}
    />
  );
}

export function MainOfficeScene({ cameraApiRef }: { cameraApiRef?: OfficeCameraApiRef }) {
  const { committeesAll: committees } = useOfficeExperience();
  const annexMidZ = annexCorridorWorldZCenter(WORLD_HALF);

  return (
    <>
      <MainOfficeFov />
      <color attach="background" args={["#ded8cf"]} />
      <fog attach="fog" args={["#ded8cf", 28, 96]} />
      <ambientLight intensity={0.58} />
      <directionalLight castShadow position={[9, 17, 8]} intensity={1.08} shadow-mapSize={[768, 768]} />
      <CameraZoomRig
        lookAt={[0, 0.32, -0.08]}
        direction={[0.22, 0.55, 0.62]}
        initialDistance={15.8}
        minDistance={5.5}
        maxDistance={52}
        overviewDirection={[0.4, 0.82, 0.36]}
        overviewDistance={40}
        annexMidZ={annexMidZ}
        cameraApiRef={cameraApiRef}
      />
      <RoomMeshes />
      <MainOfficeAnnexPlan />
      <WallPosters />
      <MesaSeatsRing />
      <ChipRow />
      {committees.slice(0, COMMITTEE_LAYOUT.length).map((slot, i) => (
        <CommitteeRoundTable key={slot.tipo} slot={slot} layout={COMMITTEE_LAYOUT[i]!} />
      ))}
      <MainSouthDoor />
    </>
  );
}
