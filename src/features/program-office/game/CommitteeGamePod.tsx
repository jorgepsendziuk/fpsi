"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { GAME_SCENE } from "./gameTheme";

type Props = {
  title: string;
  subtitle: string;
  href: string;
  count: number;
  names: string[];
};

export function CommitteeGamePod({ title, subtitle, href, count, names }: Props) {
  const theme = useTheme();
  return (
    <Tooltip title={names.length ? names.join(" · ") : "Sem membros — clique para gerir"}>
      <Box
        component={NextLink}
        href={href}
        sx={{
          p: 1.25,
          borderRadius: "50%",
          width: { xs: 152, sm: 168 },
          height: { xs: 152, sm: 168 },
          mx: { xs: "auto", lg: 0 },
          flexShrink: 0,
          background: `radial-gradient(circle at 30% 25%, ${alpha("#fff", 0.25)}, transparent 45%), ${GAME_SCENE.table}`,
          border: `3px solid ${alpha("#fff", 0.2)}`,
          boxShadow: GAME_SCENE.shadowLift,
          textDecoration: "none",
          color: "inherit",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.03)" },
        }}
      >
        <GroupsOutlinedIcon sx={{ fontSize: 26, color: alpha("#fff", 0.9), mb: 0.5 }} />
        <Typography
          variant="caption"
          fontWeight={900}
          color="common.white"
          sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6rem",
            color: alpha("#fff", 0.85),
            px: 0.5,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {subtitle}
        </Typography>
        <Chip
          size="small"
          label={`${count} membro(s)`}
          sx={{
            mt: 0.75,
            height: 22,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: alpha(theme.palette.common.white, 0.92),
            color: "secondary.dark",
          }}
        />
      </Box>
    </Tooltip>
  );
}
