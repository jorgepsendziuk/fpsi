"use client";

import { Text } from "@react-three/drei";
import type { OfficeCameraApiRef } from "../officeCameraApi";
import { useOfficeExperience } from "../OfficeExperienceContext";
import { buildSectorFocusPanel } from "../officeFocusHelpers";
import { sheetForSectorPerson } from "../officePersonSheets";
import { CameraZoomRig } from "./CameraZoomRig";
import { DoubleDoorPortal } from "./DoorPortal";
import { useOfficePointerHandlers } from "./OfficePointerContext";
import { doorLabelForSector } from "./ZoneSign";
import { firstNameHeadTag } from "./HeadTagLabel";
import { PlumbobIndicator } from "./PlumbobIndicator";
import { SeatedPerson } from "./SeatedPerson";

const LEN = 20;
const W = 3.4;
const WALL_H = 2.45;
const matProps = { roughness: 0.92, metalness: 0.05, flatShading: true as const };

export function CorridorScene({ cameraApiRef }: { cameraApiRef?: OfficeCameraApiRef }) {
  const ctx = useOfficeExperience();
  const interact = useOfficePointerHandlers();
  const grupos = ctx.gruposDept;
  const spacing = grupos.length <= 1 ? 0 : Math.min(2.85, LEN / Math.max(grupos.length + 1, 2));
  const zStart = 2.6;

  return (
    <>
      <color attach="background" args={["#e8eef5"]} />
      <fog attach="fog" args={["#e8eef5", 8, 48]} />
      <ambientLight intensity={0.52} />
      <directionalLight castShadow position={[4, 14, 10]} intensity={1.02} shadow-mapSize={[768, 768]} />
      <CameraZoomRig
        lookAt={[0, 0.85, LEN * 0.38]}
        direction={[0.38, 0.65, 0.42]}
        initialDistance={14}
        minDistance={7}
        maxDistance={28}
        overviewDirection={[0.35, 0.72, 0.45]}
        overviewDistance={22}
        cameraApiRef={cameraApiRef}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, LEN / 2]} receiveShadow>
        <planeGeometry args={[W, LEN]} />
        <meshStandardMaterial color="#cfd8dc" {...matProps} />
      </mesh>

      <mesh position={[-W / 2, WALL_H / 2, LEN / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.18, WALL_H, LEN + 0.4]} />
        <meshStandardMaterial color="#9e8f82" {...matProps} />
      </mesh>
      <mesh position={[W / 2, WALL_H / 2, LEN / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.18, WALL_H, LEN + 0.4]} />
        <meshStandardMaterial color="#a08f82" {...matProps} />
      </mesh>

      <mesh position={[0, WALL_H / 2, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.2, WALL_H, 0.18]} />
        <meshStandardMaterial color="#8d7b6f" {...matProps} />
      </mesh>
      <mesh position={[0, WALL_H / 2, LEN + 0.08]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.2, WALL_H, 0.18]} />
        <meshStandardMaterial color="#8d7b6f" {...matProps} />
      </mesh>

      <DoubleDoorPortal
        position={[0, 0, 0.44]}
        rotationY={0}
        openingWidth={1.22}
        openingHeight={1.02}
        leafDepth={0.1}
        frameDepth={0.17}
        label="Escritório principal"
        labelRotation={[-0.1, 0, 0]}
        labelOffset={[0, 1.18, 0.11]}
        interact={interact}
        onActivate={(e) => {
          e.stopPropagation();
          ctx.exitCorridorToMain();
        }}
      />

      <Text
        position={[0, 1.95, LEN * 0.35]}
        rotation={[0, 0, 0]}
        fontSize={0.125}
        anchorX="center"
        color="#0a0705"
        outlineWidth={0.028}
        outlineColor="#f5f0e8"
      >
        Corredor — salas de setor (arraste para explorar)
      </Text>

      {grupos.map(([nome, pessoas], i) => {
        const z = grupos.length <= 1 ? LEN * 0.45 : zStart + spacing * i;
        const label = nome.length > 22 ? `${nome.slice(0, 20)}…` : nome;
        const lead = pessoas[0];
        return (
          <group key={nome}>
            <group position={[W / 2 - 0.12, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
              <DoubleDoorPortal
                position={[0, 0, 0]}
                rotationY={0}
                openingWidth={0.82}
                openingHeight={1}
                leafDepth={0.09}
                frameDepth={0.16}
                badge="SALA DE SETOR"
                label={doorLabelForSector(label)}
                labelRotation={[0, 0, 0]}
                labelOffset={[0, 1.28, 0.14]}
                interact={interact}
                onActivate={(e) => {
                  e.stopPropagation();
                  ctx.openFocusPanel(
                    buildSectorFocusPanel(ctx, nome, pessoas, [W / 2 - 0.55, 0.42, z]),
                  );
                }}
              />
            </group>
            {lead ? (
              <group position={[W / 2 - 0.62, 0, z]} scale={0.92}>
                <SeatedPerson
                  facingY={Math.PI / 2}
                  colorSeed={`corr-${lead.id}`}
                  headTag={firstNameHeadTag(lead.nome ?? `#${lead.id}`)}
                  sheet={sheetForSectorPerson(lead, nome)}
                />
              </group>
            ) : (
              <group position={[W / 2 - 0.62, 0, z]}>
                <PlumbobIndicator
                  position={[0, 0.88, 0]}
                  color="#bdbdbd"
                  emissive="#757575"
                  emissiveIntensity={0.2}
                  opacity={0.42}
                  hoverSheet={{
                    title: nome,
                    subtitle: "Setor vazio",
                    rows: [{ label: "Estado", value: "Nenhum responsável neste departamento." }],
                  }}
                />
              </group>
            )}
          </group>
        );
      })}
    </>
  );
}
