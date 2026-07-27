"use client";

import { useLayoutEffect, useMemo } from "react";
import { Billboard, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import type { OfficeCameraApiRef } from "../officeCameraApi";
import { useOfficeExperience, type OfficeChip, type OfficeCommitteeSlot, type OfficeMesaSlot, type OfficePersonSheetPayload } from "../OfficeExperienceContext";
import {
  WORLD_HALF,
  ANNEX_CORRIDOR_LEN,
  ANNEX_START_GAP,
  annexCorridorWorldZCenter,
  annexSectorDoorX,
  annexSectorSide,
  annexSquareRoomSlots,
  annexWingCenterX,
  CORRIDOR_HALF_WIDTH,
  mainSouthOpeningHalf,
} from "./worldConfig";
import { Clickable3D } from "./Clickable3d";
import { CameraZoomRig } from "./CameraZoomRig";
import { DiagnosticMaturityWall } from "./DiagnosticMaturityWall";
import { DoubleDoorPortal } from "./DoorPortal";
import { OfficeWorldDecor } from "./OfficeWorldDecor";
import { SectorAnnexRoom } from "./SectorAnnexRoom";
import { useOfficePointerHandlers } from "./OfficePointerContext";
import { firstNameHeadTag, HeadTagLabel } from "./HeadTagLabel";
import { PlumbobIndicator } from "./PlumbobIndicator";
import { SeatedPerson } from "./SeatedPerson";
import { ZoneSign } from "./ZoneSign";
import { FloorOverviewLabel } from "./FloorOverviewLabel";
import {
  buildCommitteeFocusPanel,
  buildGovernanceFocusPanel,
  buildSectorFocusPanel,
} from "../officeFocusHelpers";

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

/**
 * Corredor central + salas de setor (componente SectorAnnexRoom).
 */
function MainOfficeAnnexPlan() {
  const ctx = useOfficeExperience();
  const hw = WORLD_HALF;
  const ch = CORRIDOR_HALF_WIDTH;
  const stubMat = { roughness: 0.88, metalness: 0.06, flatShading: true as const };
  const grupos = ctx.gruposDept;
  const deptColors = ["#7986cb", "#4db6ac", "#9575cd", "#4fc3f7", "#ffb74d", "#81c784", "#90a4ae"];

  const xMin = -hw;
  const xMax = hw;
  const len = ANNEX_CORRIDOR_LEN;
  const startGap = ANNEX_START_GAP;
  const zCenter = hw + startGap + len / 2;
  const wallH = 2.05;
  const outerT = 0.14;
  const openingHalf = mainSouthOpeningHalf(ch);

  const nDept = Math.min(grupos.length, 8);
  const { size: roomS, centers: deptCenters } = annexSquareRoomSlots(nDept, len, hw);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, hw + startGap * 0.35]} receiveShadow>
        <planeGeometry args={[openingHalf * 2 + 0.08, startGap + 0.55]} />
        <meshStandardMaterial color="#90a4ae" roughness={0.92} />
      </mesh>

      <group position={[0, 0.002, zCenter]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
          <planeGeometry args={[ch * 2 - 0.06, len - 0.1]} />
          <meshStandardMaterial color="#78909c" roughness={0.93} />
        </mesh>
        {Array.from({ length: Math.floor(len / 1.1) }, (_, i) => {
          const lz = -len / 2 + 0.55 + i * 1.1;
          return (
            <mesh key={`cor-tile-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, lz]} receiveShadow>
              <planeGeometry args={[ch * 2 - 0.2, 0.48]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#90a4ae" : "#607d8b"} roughness={0.94} />
            </mesh>
          );
        })}

        <mesh position={[xMin - outerT / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[outerT, wallH, len + outerT]} />
          <meshStandardMaterial color="#90a4ae" {...stubMat} />
        </mesh>
        <mesh position={[xMax + outerT / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[outerT, wallH, len + outerT]} />
          <meshStandardMaterial color="#90a4ae" {...stubMat} />
        </mesh>
        <mesh position={[0, wallH / 2, len / 2 + outerT / 2]} castShadow receiveShadow>
          <boxGeometry args={[xMax - xMin + outerT * 2, wallH, outerT]} />
          <meshStandardMaterial color="#90a4ae" {...stubMat} />
        </mesh>
        <mesh position={[0, wallH / 2, -len / 2 - outerT / 2]} castShadow receiveShadow>
          <boxGeometry args={[xMax - xMin + outerT * 2, wallH, outerT]} />
          <meshStandardMaterial color="#90a4ae" {...stubMat} />
        </mesh>

        <Text position={[0, wallH + 0.14, -len * 0.44]} fontSize={0.075} color="#eceff1" anchorX="center" outlineWidth={0.02} outlineColor="#37474f">
          Corredor de setores
        </Text>

        {grupos.slice(0, 8).map(([nome, pessoas], i) => {
          const side = annexSectorSide(i);
          const platCx = annexWingCenterX(side, hw);
          const cz = deptCenters[i] ?? 0;
          const doorX = annexSectorDoorX(i, hw);
          const outerWallX = side === "east" ? xMax - 0.2 : xMin + 0.2;
          const accent = deptColors[i % deptColors.length]!;

          return (
            <SectorAnnexRoom
              key={nome}
              deptIndex={i}
              nome={nome}
              pessoas={pessoas}
              side={side}
              roomS={roomS}
              cz={cz}
              platCx={platCx}
              doorX={doorX}
              corridorHalf={ch}
              outerWallX={outerWallX}
              accent={accent}
              onOpen={() => {
                const worldZ = zCenter + cz;
                ctx.openFocusPanel(buildSectorFocusPanel(ctx, nome, pessoas, [doorX, 0.45, worldZ]));
              }}
            />
          );
        })}

        {deptCenters.map((cz, i) => (
          <pointLight
            key={`room-light-${i}`}
            position={[annexWingCenterX(annexSectorSide(i), hw), 1.85, cz]}
            intensity={0.28}
            distance={5}
            decay={2}
          />
        ))}
      </group>
    </group>
  );
}

function GovernanceCentralTable() {
  const ctx = useOfficeExperience();
  const openFocus = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    ctx.openFocusPanel(buildGovernanceFocusPanel(ctx.mesaSlots, ctx.equipeHref, [0, 0.38, 0]));
  };
  return (
    <Clickable3D onClick={openFocus} hoverScale={1.03}>
      <mesh castShadow receiveShadow position={[0, 0.11, 0]}>
        <boxGeometry args={[2.75, 0.22, 1.65]} />
        <meshStandardMaterial color="#546e7a" {...matProps} emissive="#37474f" emissiveIntensity={0.06} />
      </mesh>
    </Clickable3D>
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
        <meshStandardMaterial color="#dce4f0" {...matProps} />
      </mesh>

      <mesh position={[0, wallH / 2, -hw]} castShadow receiveShadow>
        <boxGeometry args={[hw * 2 + wallT * 2, wallH, wallT]} />
        <meshStandardMaterial color="#b0bec5" {...matProps} />
      </mesh>
      <ZoneSign
        kind="governance"
        title="Papéis PPSI 2.0"
        subtitle="5 lugares na mesa central"
        position={[0, 1.42, -hw + 0.28]}
        rotation={[0.1, 0, 0]}
        width={2.55}
        height={0.74}
      />
      <mesh position={[-(southXHalf + openingHalf) / 2, wallH / 2, hw]} castShadow receiveShadow>
        <boxGeometry args={[southSegW, wallH, wallT]} />
        <meshStandardMaterial color="#b0bec5" {...matProps} />
      </mesh>
      <mesh position={[(southXHalf + openingHalf) / 2, wallH / 2, hw]} castShadow receiveShadow>
        <boxGeometry args={[southSegW, wallH, wallT]} />
        <meshStandardMaterial color="#b0bec5" {...matProps} />
      </mesh>
      <mesh position={[-hw, wallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, hw * 2]} />
        <meshStandardMaterial color="#cfd8dc" {...matProps} />
      </mesh>
      <mesh position={[hw, wallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, hw * 2]} />
        <meshStandardMaterial color="#cfd8dc" {...matProps} />
      </mesh>

      <GovernanceCentralTable />
    </group>
  );
}

function SideWallPosters() {
  const ctx = useOfficeExperience();
  const hw = WORLD_HALF;
  const sides = ctx.boardPosters.slice(0, 2);

  return (
    <>
      {sides.map((b, i) => {
        const x = i === 0 ? -hw + 0.12 : hw - 0.12;
        const rotY = i === 0 ? Math.PI / 2 : -Math.PI / 2;
        return (
          <Clickable3D key={b.key} onClick={() => ctx.openIframe(b.href, b.title)} hoverScale={1.04}>
            <group position={[x, 1.18, i === 0 ? -1.2 : 1.1]} rotation={[0.05, rotY, 0]}>
              <mesh position={[0, 0, 0.015]}>
                <planeGeometry args={[1.35, 0.88]} />
                <meshStandardMaterial color="#e8eaf6" roughness={0.85} />
              </mesh>
              <Text position={[0, 0.18, 0.04]} fontSize={0.078} maxWidth={1.2} anchorX="center" color="#1a237e">
                {b.title}
              </Text>
              <Text position={[0, -0.12, 0.04]} fontSize={0.055} maxWidth={1.2} anchorX="center" color="#3949ab">
                {b.line}
              </Text>
            </group>
          </Clickable3D>
        );
      })}
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
        <meshStandardMaterial color="#78909c" flatShading roughness={0.92} />
      </mesh>
      <HeadTagLabel text="Vago" color="#757575" y={1.12} />
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
      <ZoneSign
        kind="governance"
        title="Mesa central"
        subtitle="Representante, integridade, SI, DPO e TIC"
        position={[0, 1.05, -1.55]}
        rotation={[0.14, 0, 0]}
        width={2.35}
        height={0.62}
      />
      {layout.map(({ slot, pos, facingY }) => (
        <group key={slot.campo} position={pos}>
          {slot.empty ? (
            <EmptyMesaSeat facingY={facingY} slot={slot} />
          ) : (
            <SeatedPerson
              facingY={facingY}
              variant={slot.chefe ? "officeChefe" : "office"}
              colorSeed={slot.chefe ? `mesa-chefe:${slot.campo}` : `mesa:${slot.campo}`}
              headTag={slot.empty ? undefined : slot.siglaMesa}
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
  accentColor: string;
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

  const w = 0.42 + u(6) * 0.05;
  const d = 0.52 + u(7) * 0.05;
  const y = 0.22 + 0.006 + index * 0.004;

  const paperColor = u(8) > 0.55 ? "#ffffff" : "#f5f9ff";
  const lineColor = u(9) > 0.5 ? "#c5cae9" : "#b3e5fc";
  const accentColor = u(10) > 0.5 ? "#3949ab" : "#00838f";

  return { x, y, z, rx, ry, rz, w, d, paperColor, lineColor, accentColor };
}

/** Folhas finas sobre a mesa principal; posição/rotação “bagunçada” mas estável por atalho. */
function DeskPaperSheet({ chip, layout }: { chip: OfficeChip; layout: PaperLayout }) {
  const ctx = useOfficeExperience();
  const { x, y, z, rx, ry, rz, w, d, paperColor, lineColor, accentColor } = layout;
  const thick = 0.009;
  const topY = thick / 2 + 0.001;

  const open = () => ctx.openIframe(chip.href, chip.label);

  return (
    <Clickable3D onClick={open} hoverScale={1.06}>
      <group position={[x, y, z]} rotation={[rx, ry, rz]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, thick, d]} />
          <meshStandardMaterial color={paperColor} roughness={0.88} metalness={0.02} flatShading />
        </mesh>
        <mesh position={[-w * 0.38, topY + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, d * 0.92]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} />
        </mesh>
        {[0.14, 0.02, -0.1].map((lz, i) => (
          <mesh key={i} position={[0, topY + 0.0012, lz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w * 0.65, 0.004]} />
            <meshStandardMaterial color={lineColor} roughness={1} metalness={0} />
          </mesh>
        ))}
        <Text
          position={[0, topY + 0.008, -0.12]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.052}
          maxWidth={w * 0.82}
          anchorX="center"
          anchorY="middle"
          color="#1a237e"
          outlineWidth={0.006}
          outlineColor="#fff"
        >
          {chip.label}
        </Text>
        <Text
          position={[0, topY + 0.008, 0.12]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.038}
          maxWidth={w * 0.82}
          anchorX="center"
          anchorY="middle"
          color="#37474f"
          outlineWidth={0.005}
          outlineColor="#fff"
        >
          {chip.detail}
        </Text>
        <Text
          position={[0, topY + 0.008, 0.22]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.028}
          maxWidth={w * 0.82}
          anchorX="center"
          anchorY="middle"
          color={accentColor}
          outlineWidth={0.004}
          outlineColor="#fff"
        >
          Abrir →
        </Text>
      </group>
    </Clickable3D>
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
  const tableTopY = 0.22;
  const labelY = tableTopY + 0.005;
  const textRot: [number, number, number] = [-Math.PI / 2, 0, 0];
  const focusPoint: [number, number, number] = [layout.pos[0], 0.35, layout.pos[2]];
  const openFocus = () => {
    ctx.openFocusPanel(buildCommitteeFocusPanel(ctx, slot, focusPoint));
  };

  return (
    <group position={[layout.pos[0], 0, layout.pos[2]]} rotation={[0, layout.groupRotY, 0]}>
      <Billboard position={[0, 1.62, 0]}>
        <Text
          fontSize={0.088}
          anchorX="center"
          anchorY="middle"
          color="#fff8e8"
          outlineWidth={0.032}
          outlineColor="#1a120c"
          maxWidth={1.35}
        >
          MESA DE COMITÊ
        </Text>
        <Text
          position={[0, -0.14, 0]}
          fontSize={0.065}
          anchorX="center"
          anchorY="middle"
          color="#d7ccc8"
          outlineWidth={0.024}
          outlineColor="#1a120c"
          maxWidth={1.35}
        >
          {slot.subtitle}
        </Text>
      </Billboard>
      <Clickable3D onClick={openFocus} hoverScale={1.03}>
        <mesh castShadow receiveShadow position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.72, 0.78, 0.22, 18]} />
          <meshStandardMaterial color="#607d8b" {...matProps} emissive="#455a64" emissiveIntensity={0.05} />
        </mesh>
      </Clickable3D>

      <Text
        position={[0, labelY, 0.05]}
        rotation={textRot}
        fontSize={0.088}
        maxWidth={1.12}
        anchorX="center"
        anchorY="middle"
        color="#e8eaf6"
        outlineWidth={0.028}
        outlineColor="#1a237e"
        onClick={(e) => {
          e.stopPropagation();
          openFocus();
        }}
        {...interact}
      >
        {slot.title}
      </Text>
      <Text
        position={[0, labelY, -0.065]}
        rotation={textRot}
        fontSize={0.052}
        maxWidth={1.12}
        anchorX="center"
        anchorY="middle"
        color="#eceff1"
        outlineWidth={0.022}
        outlineColor="#1a237e"
        onClick={(e) => {
          e.stopPropagation();
          openFocus();
        }}
        {...interact}
      >
        {ids.length === 0 ? "Sem membros" : `${slot.subtitle} · ${slot.count} membro(s)`}
      </Text>

      <FloorOverviewLabel position={[0, 0.03, 0]} title={`MESA · ${slot.subtitle}`} titleSize={0.17} />

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
                headTag={firstNameHeadTag(nome)}
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

  return (
    <>
      <MainOfficeFov />
      <color attach="background" args={["#d8e8f5"]} />
      <fog attach="fog" args={["#d8e8f5", 38, 115]} />
      <ambientLight intensity={0.58} />
      <directionalLight castShadow position={[9, 17, 8]} intensity={1.08} shadow-mapSize={[768, 768]} />
      <OfficeWorldDecor />
      <CameraZoomRig
        lookAt={[0, 0.32, -0.08]}
        direction={[0.22, 0.55, 0.62]}
        initialDistance={15.8}
        minDistance={5.5}
        maxDistance={52}
        overviewDirection={[0.4, 0.82, 0.36]}
        overviewDistance={40}
        annexMidZ={annexCorridorWorldZCenter(WORLD_HALF)}
        cameraApiRef={cameraApiRef}
      />
      <RoomMeshes />
      <FloorOverviewLabel
        position={[0, 0.04, 0.15]}
        title="MESA DE GOVERNANÇA"
        subtitle="Clique na mesa central · 5 papéis PPSI"
        titleSize={0.26}
      />
      <MainOfficeAnnexPlan />
      <DiagnosticMaturityWall />
      <SideWallPosters />
      <MesaSeatsRing />
      <ChipRow />
      {committees.slice(0, COMMITTEE_LAYOUT.length).map((slot, i) => (
        <CommitteeRoundTable key={slot.tipo} slot={slot} layout={COMMITTEE_LAYOUT[i]!} />
      ))}
      <MainSouthDoor />
    </>
  );
}
