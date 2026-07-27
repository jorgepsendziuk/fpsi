import type { MutableRefObject } from "react";

/** API exposta pelo rig da câmara para HUD (zoom / reset / visão geral). */
export type OfficeCameraControlsApi = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  overviewView: () => void;
  /** Roda a câmara em torno do alvo (azimute), em radianos. */
  rotateScene: (deltaAzimuthRad: number) => void;
  /** Desloca alvo e câmara no plano XZ (explorar corredor / alas). */
  panBy: (worldDx: number, worldDz: number) => void;
  /** Pan suave no plano XZ (setas no chão). */
  smoothPanBy: (worldDx: number, worldDz: number, durationMs?: number) => void;
  /** Enquadra o corredor e portas das salas. */
  focusAnnex: () => void;
  /** Guarda posição atual para restaurar depois. */
  bookmarkView: () => void;
  restoreBookmark: () => boolean;
  hasBookmark: () => boolean;
  /** Enquadra suavemente um ponto do mundo (mesa / sala). */
  smoothFocusOn: (world: [number, number, number], distance?: number, durationMs?: number) => void;
};

export type OfficeCameraApiRef = MutableRefObject<OfficeCameraControlsApi | null>;
