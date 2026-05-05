"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";

type ProviderCtx = {
  interactiveEnter: () => void;
  interactiveLeave: () => void;
  setGrabbing: (v: boolean) => void;
};

const Ctx = createContext<ProviderCtx | null>(null);

/** Dentro do Canvas: cursores grab / pointer / grabbing conforme hover e orbit. */
export function OfficePointerProvider({ children }: { children: ReactNode }) {
  const { gl } = useThree();
  const hoverRef = useRef(0);
  const grabbingRef = useRef(false);

  const apply = useCallback(() => {
    const el = gl.domElement;
    if (grabbingRef.current) {
      el.style.cursor = "grabbing";
    } else if (hoverRef.current > 0) {
      el.style.cursor = "pointer";
    } else {
      el.style.cursor = "grab";
    }
  }, [gl]);

  const interactiveEnter = useCallback(() => {
    hoverRef.current += 1;
    apply();
  }, [apply]);

  const interactiveLeave = useCallback(() => {
    hoverRef.current = Math.max(0, hoverRef.current - 1);
    apply();
  }, [apply]);

  const setGrabbing = useCallback(
    (v: boolean) => {
      grabbingRef.current = v;
      apply();
    },
    [apply],
  );

  useEffect(() => {
    apply();
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [apply, gl]);

  const value = useMemo(
    () => ({ interactiveEnter, interactiveLeave, setGrabbing }),
    [interactiveEnter, interactiveLeave, setGrabbing],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOfficePointerHandlers() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useOfficePointerHandlers must be used inside OfficePointerProvider");
  }
  return useMemo(
    () => ({
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        ctx.interactiveEnter();
      },
      onPointerOut: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        ctx.interactiveLeave();
      },
    }),
    [ctx],
  );
}

export function useOfficeOrbitCursor() {
  const ctx = useContext(Ctx);
  return ctx?.setGrabbing ?? ((_v: boolean) => {});
}
