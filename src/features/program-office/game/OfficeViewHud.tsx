"use client";

import type { ReactNode } from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { OfficeCameraApiRef } from "./officeCameraApi";
import { useOfficeExperience } from "./OfficeExperienceContext";

const PAN_STEP = 1.55;

type Props = { cameraApiRef: OfficeCameraApiRef };

function HudIconBtn({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Tooltip title={title} arrow placement="top">
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          aria-label={title}
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.4),
            bgcolor: alpha(theme.palette.common.white, 0.5),
            color: alpha(theme.palette.text.primary, 0.85),
            "& .MuiSvgIcon-root": { fontSize: 20 },
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              borderColor: alpha(theme.palette.primary.main, 0.4),
            },
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function EdgeNavBtn({
  title,
  onClick,
  placement,
  children,
}: {
  title: string;
  onClick: () => void;
  placement: "left" | "right" | "top" | "bottom";
  children: ReactNode;
}) {
  const theme = useTheme();
  const pos =
    placement === "left"
      ? { left: 10, top: "50%", transform: "translateY(-50%)" }
      : placement === "right"
        ? { right: 10, top: "50%", transform: "translateY(-50%)" }
        : placement === "top"
          ? { top: 12, left: "50%", transform: "translateX(-50%)" }
          : { bottom: 64, left: "50%", transform: "translateX(-50%)" };

  return (
    <Tooltip title={title} arrow>
      <IconButton
        onClick={onClick}
        aria-label={title}
        sx={{
          position: "absolute",
          zIndex: 5,
          pointerEvents: "auto",
          ...pos,
          width: { xs: 44, sm: 52 },
          height: { xs: 44, sm: 52 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(theme.palette.common.white, 0.55),
          bgcolor: alpha(theme.palette.grey[900], 0.38),
          color: theme.palette.common.white,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.18)}`,
          "& .MuiSvgIcon-root": { fontSize: { xs: 28, sm: 32 } },
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.72),
            borderColor: alpha(theme.palette.common.white, 0.8),
            transform:
              placement === "left" || placement === "right"
                ? "translateY(-50%) scale(1.06)"
                : "translateX(-50%) scale(1.06)",
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Controles de câmera: setas nas bordas (pan) + barra compacta (home / visão / zoom).
 */
export function OfficeViewHud({ cameraApiRef }: Props) {
  const theme = useTheme();
  const x = useOfficeExperience();

  const pan = (dx: number, dz: number) => {
    cameraApiRef.current?.smoothPanBy(dx, dz, 420);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      <EdgeNavBtn title="Mover visão para a esquerda" placement="left" onClick={() => pan(-PAN_STEP, 0)}>
        <KeyboardArrowLeftIcon />
      </EdgeNavBtn>
      <EdgeNavBtn title="Mover visão para a direita" placement="right" onClick={() => pan(PAN_STEP, 0)}>
        <KeyboardArrowRightIcon />
      </EdgeNavBtn>
      <EdgeNavBtn title="Mover visão para cima (corredor)" placement="top" onClick={() => pan(0, PAN_STEP)}>
        <KeyboardArrowUpIcon />
      </EdgeNavBtn>
      <EdgeNavBtn title="Mover visão para baixo (mesa)" placement="bottom" onClick={() => pan(0, -PAN_STEP)}>
        <KeyboardArrowDownIcon />
      </EdgeNavBtn>

      <Box
        sx={{
          position: "absolute",
          left: "50%",
          bottom: 12,
          transform: "translateX(-50%)",
          pointerEvents: "auto",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.65,
            borderRadius: 999,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.85),
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          }}
        >
          <Stack direction="row" spacing={0.35} alignItems="center">
            {x.canRestoreView ? (
              <HudIconBtn
                title="Voltar à visão anterior"
                onClick={() => {
                  if (x.focusPanel) x.closeFocusPanel();
                  else x.restorePreviousView();
                }}
              >
                <UndoIcon />
              </HudIconBtn>
            ) : null}
            <HudIconBtn
              title="Home — escritório principal e visão inicial"
              onClick={() => {
                x.goHomeMain();
                cameraApiRef.current?.resetView();
              }}
            >
              <HomeOutlinedIcon />
            </HudIconBtn>
            <HudIconBtn title="Visão inicial (zoom e ângulo)" onClick={() => cameraApiRef.current?.resetView()}>
              <RestartAltIcon />
            </HudIconBtn>
            <HudIconBtn title="Visão geral (mesa + corredor)" onClick={() => cameraApiRef.current?.overviewView()}>
              <ViewInArIcon />
            </HudIconBtn>
            <HudIconBtn title="Aproximar" onClick={() => cameraApiRef.current?.zoomIn()}>
              <ZoomInIcon />
            </HudIconBtn>
            <HudIconBtn title="Afastar" onClick={() => cameraApiRef.current?.zoomOut()}>
              <ZoomOutIcon />
            </HudIconBtn>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
