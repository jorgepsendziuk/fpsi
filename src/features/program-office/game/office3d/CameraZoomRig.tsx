"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { OfficeCameraApiRef, OfficeCameraControlsApi } from "../officeCameraApi";
import { useOfficeOrbitCursor } from "./OfficePointerContext";

type Props = {
  lookAt?: [number, number, number];
  direction?: [number, number, number];
  initialDistance?: number;
  minDistance?: number;
  maxDistance?: number;
  overviewDirection?: [number, number, number];
  overviewDistance?: number;
  /** Centro mundial Z do corredor (para pan / visão geral / foco). */
  annexMidZ?: number;
  cameraApiRef?: OfficeCameraApiRef;
};

/**
 * Orbit + pan + zoom (drei OrbitControls).
 * Expõe API opcional para HUD: zoom, reset, visão geral.
 */
export function CameraZoomRig({
  lookAt = [0, 0.35, 0],
  direction = [0.65, 0.78, 0.65],
  initialDistance = 17,
  minDistance = 8,
  maxDistance = 30,
  overviewDirection = [0.38, 0.84, 0.35],
  overviewDistance,
  annexMidZ,
  cameraApiRef,
}: Props) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const setGrabbing = useOfficeOrbitCursor();

  const snapshotRef = useRef<{ target: Vector3; position: Vector3 } | null>(null);
  const bookmarkStack = useRef<Array<{ target: Vector3; position: Vector3 }>>([]);
  const smoothAnimRef = useRef<{
    fromTarget: Vector3;
    fromPos: Vector3;
    toTarget: Vector3;
    toPos: Vector3;
    elapsedMs: number;
    durationMs: number;
  } | null>(null);

  const [lx, ly, lz] = lookAt;
  const [dx, dy, dz] = direction;
  const [ox, oy, oz] = overviewDirection;

  useLayoutEffect(() => {
    const ctrl = controlsRef.current;
    const target = new Vector3(lx, ly, lz);
    const offset = new Vector3(dx, dy, dz).normalize().multiplyScalar(initialDistance);
    const position = target.clone().add(offset);
    camera.position.copy(position);
    snapshotRef.current = { target: target.clone(), position: position.clone() };
    if (ctrl) {
      ctrl.target.copy(target);
      ctrl.update();
    }
  }, [camera, lx, ly, lz, dx, dy, dz, initialDistance]);

  useFrame((_, delta) => {
    const anim = smoothAnimRef.current;
    const c = controlsRef.current;
    if (!anim || !c) return;
    anim.elapsedMs += delta * 1000;
    const u = Math.min(1, anim.elapsedMs / anim.durationMs);
    const ease = u * u * (3 - 2 * u);
    c.target.lerpVectors(anim.fromTarget, anim.toTarget, ease);
    camera.position.lerpVectors(anim.fromPos, anim.toPos, ease);
    c.update();
    if (u >= 1) smoothAnimRef.current = null;
  });

  const startSmoothMoveRef = useRef(
    (toTarget: Vector3, toPos: Vector3, durationMs: number) => {
      const c = controlsRef.current;
      if (!c) return;
      smoothAnimRef.current = {
        fromTarget: c.target.clone(),
        fromPos: camera.position.clone(),
        toTarget,
        toPos,
        elapsedMs: 0,
        durationMs: Math.max(200, durationMs),
      };
    },
  );
  startSmoothMoveRef.current = (toTarget, toPos, durationMs) => {
    const c = controlsRef.current;
    if (!c) return;
    smoothAnimRef.current = {
      fromTarget: c.target.clone(),
      fromPos: camera.position.clone(),
      toTarget,
      toPos,
      elapsedMs: 0,
      durationMs: Math.max(200, durationMs),
    };
  };

  useEffect(() => {
    if (!cameraApiRef) return;

    const api: OfficeCameraControlsApi = {
      zoomIn: () => {
        const c = controlsRef.current;
        if (!c) return;
        c.dollyIn(0.92);
        c.update();
      },
      zoomOut: () => {
        const c = controlsRef.current;
        if (!c) return;
        c.dollyOut(0.92);
        c.update();
      },
      resetView: () => {
        const c = controlsRef.current;
        const s = snapshotRef.current;
        if (!c || !s) return;
        camera.position.copy(s.position);
        c.target.copy(s.target);
        c.update();
      },
      overviewView: () => {
        const c = controlsRef.current;
        if (!c) return;
        const target =
          annexMidZ != null
            ? new Vector3(0, 0.58, annexMidZ * 0.34)
            : new Vector3(lx, ly, lz);
        const dist = overviewDistance ?? maxDistance * 0.92;
        const off = new Vector3(ox, oy, oz).normalize().multiplyScalar(dist);
        camera.position.copy(target).add(off);
        c.target.copy(target);
        c.update();
      },
      rotateScene: (deltaAzimuthRad: number) => {
        const c = controlsRef.current;
        if (!c) return;
        const next = c.getAzimuthalAngle() + deltaAzimuthRad;
        c.setAzimuthalAngle(next);
        c.update();
      },
      panBy: (worldDx: number, worldDz: number) => {
        const c = controlsRef.current;
        if (!c) return;
        smoothAnimRef.current = null;
        const pan = new Vector3(worldDx, 0, worldDz);
        camera.position.add(pan);
        c.target.add(pan);
        c.update();
      },
      smoothPanBy: (worldDx: number, worldDz: number, durationMs = 520) => {
        const c = controlsRef.current;
        if (!c) return;
        const pan = new Vector3(worldDx, 0, worldDz);
        startSmoothMoveRef.current(
          c.target.clone().add(pan),
          camera.position.clone().add(pan),
          durationMs,
        );
      },
      bookmarkView: () => {
        const c = controlsRef.current;
        if (!c) return;
        bookmarkStack.current.push({
          target: c.target.clone(),
          position: camera.position.clone(),
        });
      },
      restoreBookmark: () => {
        const prev = bookmarkStack.current.pop();
        const c = controlsRef.current;
        if (!prev || !c) return false;
        startSmoothMoveRef.current(prev.target, prev.position, 560);
        return true;
      },
      hasBookmark: () => bookmarkStack.current.length > 0,
      smoothFocusOn: (world: [number, number, number], distance = 8.5, durationMs = 620) => {
        const c = controlsRef.current;
        if (!c) return;
        const target = new Vector3(world[0], world[1], world[2]);
        const off = new Vector3(0.32, 0.52, 0.48).normalize().multiplyScalar(distance);
        startSmoothMoveRef.current(target, target.clone().add(off), durationMs);
      },
      focusAnnex: () => {
        const c = controlsRef.current;
        if (!c || annexMidZ == null) return;
        const target = new Vector3(0, 0.42, annexMidZ);
        const off = new Vector3(0.24, 0.52, 0.62).normalize().multiplyScalar(15.5);
        c.target.copy(target);
        camera.position.copy(target).add(off);
        c.update();
      },
    };

    cameraApiRef.current = api;
    return () => {
      if (cameraApiRef.current === api) cameraApiRef.current = null;
    };
  }, [camera, cameraApiRef, lx, ly, lz, ox, oy, oz, overviewDistance, maxDistance, annexMidZ]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2 - 0.03}
      enablePan
      enableRotate
      enableZoom
      enableDamping
      dampingFactor={0.06}
      panSpeed={1.18}
      rotateSpeed={0.82}
      zoomSpeed={0.92}
      screenSpacePanning
      onStart={() => setGrabbing(true)}
      onEnd={() => setGrabbing(false)}
    />
  );
}
