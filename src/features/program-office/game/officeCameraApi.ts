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
  /** Enquadra o corredor e portas das salas. */
  focusAnnex: () => void;
};

export type OfficeCameraApiRef = MutableRefObject<OfficeCameraControlsApi | null>;
