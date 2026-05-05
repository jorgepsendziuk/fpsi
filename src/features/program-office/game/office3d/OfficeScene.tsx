"use client";

import type { OfficeCameraApiRef } from "../officeCameraApi";
import { useOfficeExperience } from "../OfficeExperienceContext";
import { MainOfficeScene } from "./MainOfficeScene";
import { SectorOfficeScene } from "./SectorOfficeScene";
import { CorridorScene } from "./CorridorScene";

export function OfficeScene({ cameraApiRef }: { cameraApiRef?: OfficeCameraApiRef }) {
  const { room } = useOfficeExperience();
  if (room.kind === "sector") {
    return (
      <SectorOfficeScene
        key={`sector-${room.deptName}`}
        cameraApiRef={cameraApiRef}
        deptName={room.deptName}
        people={room.people}
      />
    );
  }
  if (room.kind === "corridor") {
    return <CorridorScene key="corridor" cameraApiRef={cameraApiRef} />;
  }
  return <MainOfficeScene key="main" cameraApiRef={cameraApiRef} />;
}
