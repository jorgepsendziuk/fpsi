"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import type { OfficeCameraApiRef } from "../officeCameraApi";
import { useOfficeExperience } from "../OfficeExperienceContext";
import type { Responsavel } from "@/lib/types/types";
import { SECTOR_HALF } from "./worldConfig";
import { CameraZoomRig } from "./CameraZoomRig";
import { DoubleDoorPortal } from "./DoorPortal";
import { useOfficePointerHandlers } from "./OfficePointerContext";
import { SeatedPerson } from "./SeatedPerson";

const matProps = { roughness: 0.92, metalness: 0.05, flatShading: true as const };

function SectorRoomMeshes() {
  const hw = SECTOR_HALF;
  const wallT = 0.18;
  const wallH = 2.1;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, hw * 2]} />
        <meshStandardMaterial color="#d2c4b2" {...matProps} />
      </mesh>
      <mesh position={[0, wallH / 2, -hw]} castShadow receiveShadow>
        <boxGeometry args={[hw * 2 + wallT * 2, wallH, wallT]} />
        <meshStandardMaterial color="#a1887f" {...matProps} />
      </mesh>
      <mesh position={[0, wallH / 2, hw]} castShadow receiveShadow>
        <boxGeometry args={[hw * 2 + wallT * 2, wallH, wallT]} />
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
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.24, 20]} />
        <meshStandardMaterial color="#5d4037" {...matProps} />
      </mesh>
    </group>
  );
}

export function SectorOfficeScene({
  cameraApiRef,
  deptName,
  people,
}: {
  cameraApiRef?: OfficeCameraApiRef;
  deptName: string;
  people: Responsavel[];
}) {
  const ctx = useOfficeExperience();
  const interact = useOfficePointerHandlers();
  const show = people.slice(0, 10);
  const n = Math.max(show.length, 1);
  const ringR = 1.28;

  const title = useMemo(() => (deptName.length > 36 ? `${deptName.slice(0, 34)}…` : deptName), [deptName]);

  return (
    <>
      <color attach="background" args={["#e0d8ce"]} />
      <fog attach="fog" args={["#e0d8ce", 10, 38]} />
      <ambientLight intensity={0.6} />
      <directionalLight castShadow position={[6, 12, 7]} intensity={1.05} shadow-mapSize={[768, 768]} />
      <CameraZoomRig
        lookAt={[0, 0.32, 0]}
        direction={[0.55, 0.82, 0.55]}
        initialDistance={11}
        minDistance={6}
        maxDistance={22}
        overviewDirection={[0.42, 0.78, 0.45]}
        overviewDistance={17}
        cameraApiRef={cameraApiRef}
      />
      <SectorRoomMeshes />

      <group position={[0, 1.15, -SECTOR_HALF + 0.14]} rotation={[0.06, 0, 0]}>
        <mesh position={[0, 0, 0.02]} castShadow>
          <planeGeometry args={[2.4, 0.55]} />
          <meshStandardMaterial color="#3e2f26" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0, 0.05]} castShadow>
          <planeGeometry args={[2.2, 0.48]} />
          <meshStandardMaterial color="#faf6ef" roughness={0.85} flatShading />
        </mesh>
        <Text position={[0, 0.02, 0.065]} fontSize={0.11} maxWidth={2.05} anchorX="center" anchorY="middle" color="#1e1410">
          {title}
        </Text>
      </group>

      <DoubleDoorPortal
        position={[0, 0, SECTOR_HALF - 0.15]}
        rotationY={Math.PI}
        openingWidth={1.15}
        openingHeight={1}
        leafDepth={0.095}
        frameDepth={0.17}
        label="← Corredor"
        labelRotation={[0.08, 0, 0]}
        labelOffset={[0, 1.14, 0.12]}
        interact={interact}
        onActivate={(e) => {
          e.stopPropagation();
          ctx.backFromSectorToCorridor();
        }}
      />

      <group position={[-SECTOR_HALF + 0.22, 0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            ctx.openIframe(`${ctx.base}/usuarios`, "Utilizadores e permissões");
          }}
          {...interact}
        >
          <planeGeometry args={[1.45, 0.42]} />
          <meshStandardMaterial color="#fff9ec" roughness={0.86} />
        </mesh>
        <Text
          position={[0, 0.06, 0.025]}
          fontSize={0.058}
          maxWidth={1.35}
          anchorX="center"
          anchorY="middle"
          color="#1e1410"
          onClick={(e) => {
            e.stopPropagation();
            ctx.openIframe(`${ctx.base}/usuarios`, "Utilizadores e permissões");
          }}
          {...interact}
        >
          Gestão de utilizadores
        </Text>
      </group>

      {show.map((p, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(ang) * ringR;
        const z = Math.sin(ang) * ringR;
        const nome = (p.nome && p.nome.trim()) || `#${p.id}`;
        const short = nome.length > 18 ? `${nome.slice(0, 16)}…` : nome;
        const cargo = p.cargo?.trim();
        const setorLinha = p.departamento?.trim() || deptName;
        const linhaCargoSetor = [cargo, setorLinha].filter(Boolean).join(" · ");
        const facingY = Math.atan2(-x, -z);
        return (
          <group key={p.id} position={[x, 0, z]}>
            <SeatedPerson
              facingY={facingY}
              colorSeed={`p-${p.id}`}
              sheet={{
                title: short,
                subtitle: deptName,
                rows: [
                  { label: "Nome", value: nome },
                  { label: "Cargo", value: cargo || "—" },
                  { label: "Departamento", value: setorLinha || "—" },
                ],
              }}
            />
          </group>
        );
      })}
    </>
  );
}
