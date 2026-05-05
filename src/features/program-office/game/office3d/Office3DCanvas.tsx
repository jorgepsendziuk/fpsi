"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { OfficeCameraApiRef } from "../officeCameraApi";
import { useOfficeExperience } from "../OfficeExperienceContext";
import { OfficePointerProvider } from "./OfficePointerContext";
import { OfficeScene } from "./OfficeScene";

function Fallback() {
  return null;
}

/**
 * Vista 3D leve (WebGL): primitivas + sombras simples.
 * Consome `OfficeExperienceProvider` (modais + troca de sala).
 */
export function Office3DCanvas({ cameraApiRef }: { cameraApiRef?: OfficeCameraApiRef }) {
  const ctx = useOfficeExperience();
  const canvasKey = useMemo(() => {
    if (ctx.room.kind === "sector") return `sector-${ctx.room.deptName}`;
    return ctx.room.kind;
  }, [ctx.room]);

  return (
    <Canvas
      key={canvasKey}
      shadows
      dpr={[1, 1.35]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{ position: [11, 13, 11], fov: 44, near: 0.12, far: 90 }}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: "none",
      }}
    >
      <Suspense fallback={<Fallback />}>
        <OfficePointerProvider>
          <OfficeScene cameraApiRef={cameraApiRef} />
        </OfficePointerProvider>
      </Suspense>
    </Canvas>
  );
}
