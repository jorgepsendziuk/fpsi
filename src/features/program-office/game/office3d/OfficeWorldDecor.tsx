"use client";

import { ANNEX_CORRIDOR_LEN, ANNEX_START_GAP, annexCorridorWorldZCenter, WORLD_HALF } from "./worldConfig";
import { OfficeBrandingTotems } from "./OfficeBrandingTotems";

const flat = { roughness: 0.92, metalness: 0.03, flatShading: true as const };

function PlantPot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.24, 10]} />
        <meshStandardMaterial color="#8d6e63" {...flat} />
      </mesh>
      <mesh castShadow position={[0, 0.42, 0]}>
        <coneGeometry args={[0.38, 0.55, 8]} />
        <meshStandardMaterial color="#43a047" emissive="#2e7d32" emissiveIntensity={0.15} {...flat} />
      </mesh>
      <mesh castShadow position={[0.12, 0.48, 0.08]}>
        <coneGeometry args={[0.22, 0.35, 7]} />
        <meshStandardMaterial color="#66bb6a" {...flat} />
      </mesh>
    </group>
  );
}

function WaterCooler({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.35, 0.9, 0.32]} />
        <meshStandardMaterial color="#eceff1" {...flat} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
        <meshStandardMaterial color="#29b6f6" emissive="#0288d1" emissiveIntensity={0.2} {...flat} />
      </mesh>
    </group>
  );
}

function FilingCabinet({ position, color = "#546e7a" }: { position: [number, number, number]; color?: string }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={[0.42, 0.95, 0.38]} />
      <meshStandardMaterial color={color} {...flat} />
    </mesh>
  );
}

function PathStripe({
  from,
  to,
  width,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  width: number;
  color: string;
}) {
  const mx = (from[0] + to[0]) / 2;
  const mz = (from[2] + to[2]) / 2;
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const rotY = Math.atan2(dx, dz);
  return (
    <mesh rotation={[-Math.PI / 2, rotY, 0]} position={[mx, 0.002, mz]} receiveShadow>
      <planeGeometry args={[width, len]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

/** Paisagem temática ao redor do escritório de governança (PPSI). */
export function OfficeWorldDecor() {
  const hw = WORLD_HALF;
  const annexMid = annexCorridorWorldZCenter(hw);
  const ground = 36;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, annexMid * 0.45]} receiveShadow>
        <planeGeometry args={[ground, ground * 1.35]} />
        <meshStandardMaterial color="#dce775" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, annexMid * 0.45]} receiveShadow>
        <planeGeometry args={[ground * 0.55, ground * 0.55]} />
        <meshStandardMaterial color="#e8eaf6" roughness={0.96} />
      </mesh>

      <PathStripe from={[0, 0, hw - 0.5]} to={[0, 0, annexMid + ANNEX_CORRIDOR_LEN * 0.35]} width={2.4} color="#b0bec5" />
      <PathStripe from={[-hw - 0.5, 0, 0]} to={[hw + 0.5, 0, 0]} width={1.8} color="#c5cae9" />

      <PlantPot position={[-hw - 1.1, 0, -hw - 0.6]} />
      <PlantPot position={[hw + 1.05, 0, -hw - 0.5]} />
      <PlantPot position={[-hw - 0.9, 0, hw + 0.7]} />
      <PlantPot position={[hw + 1.15, 0, hw + 0.65]} />
      <PlantPot position={[-hw - 1.3, 0, annexMid + 2]} />
      <PlantPot position={[hw + 1.2, 0, annexMid + 1.5]} />

      <group position={[-6.5, 0, -2]}>
        <mesh castShadow position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 1.8, 8]} />
          <meshStandardMaterial color="#6d4c41" {...flat} />
        </mesh>
        <mesh castShadow position={[0, 2.1, 0]}>
          <coneGeometry args={[0.95, 1.35, 8]} />
          <meshStandardMaterial color="#388e3c" {...flat} />
        </mesh>
      </group>
      <group position={[7.2, 0, 1]}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 1.65, 8]} />
          <meshStandardMaterial color="#6d4c41" {...flat} />
        </mesh>
        <mesh castShadow position={[0, 1.95, 0]}>
          <coneGeometry args={[0.82, 1.2, 8]} />
          <meshStandardMaterial color="#2e7d32" {...flat} />
        </mesh>
      </group>

      <OfficeBrandingTotems />

      <WaterCooler position={[-hw + 0.85, 0, hw - 1.2]} />
      <WaterCooler position={[hw - 0.9, 0, -hw + 1.1]} />
      <FilingCabinet position={[-hw + 0.75, 0.48, -hw + 0.85]} color="#455a64" />
      <FilingCabinet position={[hw - 0.78, 0.48, hw - 0.9]} color="#5c6bc0" />

      <hemisphereLight args={["#e3f2fd", "#c8e6c9", 0.35]} />
    </group>
  );
}
