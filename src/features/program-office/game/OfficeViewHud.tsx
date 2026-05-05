"use client";

import type { ReactNode } from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, Divider, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { OfficeCameraApiRef } from "./officeCameraApi";
import { useOfficeExperience } from "./OfficeExperienceContext";

const ROT_STEP = 0.32;
const PAN_STEP = 1.35;

type Props = { cameraApiRef: OfficeCameraApiRef };

function HudIconBtn({
  title,
  onClick,
  disabled,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
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
            width: 42,
            height: 42,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: active ? "primary.main" : alpha(theme.palette.divider, 0.35),
            bgcolor: active
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.common.white, 0.42),
            color: active ? "primary.dark" : alpha(theme.palette.text.primary, 0.82),
            transition: "transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease, background-color 0.14s ease",
            boxShadow: active
              ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.28)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.06)}`
              : `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.65)}`,
            "& .MuiSvgIcon-root": { fontSize: 22 },
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.45),
              transform: "translateY(-2px)",
              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.1)}`,
            },
            "&.Mui-disabled": {
              borderColor: alpha(theme.palette.divider, 0.2),
              bgcolor: alpha(theme.palette.grey[200], 0.35),
              color: alpha(theme.palette.text.disabled, 0.6),
              boxShadow: "none",
            },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function OfficeViewHud({ cameraApiRef }: Props) {
  const theme = useTheme();
  const x = useOfficeExperience();
  const room = x.room.kind;

  return (
    <Box
      sx={{
        position: "absolute",
        right: 12,
        bottom: 12,
        zIndex: 4,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.75,
          px: 1.25,
          py: 1,
          maxWidth: { xs: "calc(100vw - 24px)", sm: 520 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.9),
          backgroundColor: alpha(theme.palette.background.paper, 0.88),
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.6) inset",
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <HudIconBtn title="Aproximar" onClick={() => cameraApiRef.current?.zoomIn()}>
            <ZoomInIcon />
          </HudIconBtn>
          <HudIconBtn title="Afastar" onClick={() => cameraApiRef.current?.zoomOut()}>
            <ZoomOutIcon />
          </HudIconBtn>
          <HudIconBtn title="Girar à esquerda" onClick={() => cameraApiRef.current?.rotateScene(ROT_STEP)}>
            <RotateLeftIcon />
          </HudIconBtn>
          <HudIconBtn title="Girar à direita" onClick={() => cameraApiRef.current?.rotateScene(-ROT_STEP)}>
            <RotateRightIcon />
          </HudIconBtn>
          <HudIconBtn title="Cena inicial (zoom e ângulo)" onClick={() => cameraApiRef.current?.resetView()}>
            <RestartAltIcon />
          </HudIconBtn>
          <HudIconBtn title="Visão geral (mesa + corredor)" onClick={() => cameraApiRef.current?.overviewView()}>
            <ViewInArIcon />
          </HudIconBtn>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, alignSelf: "stretch", borderColor: alpha(theme.palette.divider, 0.6) }} />

        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <HudIconBtn title="Deslocar visão para o corredor (+Z)" onClick={() => cameraApiRef.current?.panBy(0, PAN_STEP)}>
            <KeyboardArrowUpIcon />
          </HudIconBtn>
          <HudIconBtn title="Deslocar visão para a mesa (-Z)" onClick={() => cameraApiRef.current?.panBy(0, -PAN_STEP)}>
            <KeyboardArrowDownIcon />
          </HudIconBtn>
          <HudIconBtn title="Deslocar visão para a esquerda (-X)" onClick={() => cameraApiRef.current?.panBy(-PAN_STEP, 0)}>
            <KeyboardArrowLeftIcon />
          </HudIconBtn>
          <HudIconBtn title="Deslocar visão para a direita (+X)" onClick={() => cameraApiRef.current?.panBy(PAN_STEP, 0)}>
            <KeyboardArrowRightIcon />
          </HudIconBtn>
          <HudIconBtn title="Enquadrar corredor e portas" onClick={() => cameraApiRef.current?.focusAnnex()}>
            <CenterFocusStrongIcon />
          </HudIconBtn>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, alignSelf: "stretch", borderColor: alpha(theme.palette.divider, 0.6) }} />

        <Stack direction="row" spacing={0.5} alignItems="center">
          <HudIconBtn
            title="Escritório principal"
            active={room === "main"}
            disabled={room === "main" || room === "sector"}
            onClick={() => {
              if (room === "corridor") x.exitCorridorToMain();
            }}
          >
            <AccountBalanceIcon />
          </HudIconBtn>
          <HudIconBtn
            title="Corredor e salas"
            active={room === "corridor"}
            disabled={room === "corridor"}
            onClick={() => {
              if (room === "main") x.enterCorridor();
              if (room === "sector") x.backFromSectorToCorridor();
            }}
          >
            <MeetingRoomIcon />
          </HudIconBtn>
        </Stack>
      </Paper>
    </Box>
  );
}
