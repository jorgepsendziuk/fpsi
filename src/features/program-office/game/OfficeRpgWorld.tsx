"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { OfficeCameraControlsApi } from "./officeCameraApi";
import { OfficeViewHud } from "./OfficeViewHud";
import { GAME_RPG_FRAME } from "./gameTheme";
import { rpgPixelFont } from "./rpgGameFont";

const Office3DCanvas = dynamic(
  () => import("./office3d/Office3DCanvas").then((m) => m.Office3DCanvas),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.300",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    ),
  },
);

/** Vista imersiva WebGL — requer `OfficeExperienceProvider` acima na árvore. */
export function OfficeRpgWorld() {
  const cameraApiRef = useRef<OfficeCameraControlsApi | null>(null);

  return (
    <Box
      className={rpgPixelFont.className}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 0,
        border: GAME_RPG_FRAME.border,
        boxShadow: GAME_RPG_FRAME.boxShadow,
        bgcolor: "#ded8cf",
      }}
    >
      <Office3DCanvas cameraApiRef={cameraApiRef} />
      <OfficeViewHud cameraApiRef={cameraApiRef} />
    </Box>
  );
}
