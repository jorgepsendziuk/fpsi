"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import type { Responsavel } from "@/lib/types/types";

type Grupo = [string, Responsavel[]];

type Props = {
  base: string;
  grupos: Grupo[];
};

/** Corredor horizontal com “portas” por departamento (metáfora de jogo). */
export function GameCorridorStrip({ base, grupos }: Props) {
  const theme = useTheme();
  const usuariosHref = `${base}/usuarios`;

  if (grupos.length === 0) {
    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Cadastre responsáveis com departamento para ver portas no corredor.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, width: "100%" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
        <MeetingRoomOutlinedIcon sx={{ color: "info.main", fontSize: 22 }} />
        <Typography variant="subtitle2" fontWeight={800} color="info.dark">
          Corredor — salas por departamento
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (clique numa porta · permissões em Utilizadores)
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "flex",
          gap: 1.25,
          overflowX: "auto",
          pb: 1,
          px: 0.5,
          mx: -0.5,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: alpha(theme.palette.primary.main, 0.35),
            borderRadius: 4,
          },
        }}
      >
        {grupos.map(([nomeDept, pessoas]) => {
          const tip = pessoas
            .slice(0, 5)
            .map((p) => p.nome || `#${p.id}`)
            .join(" · ");
          const extra = pessoas.length > 5 ? ` · +${pessoas.length - 5}` : "";

          return (
            <Tooltip key={nomeDept} title={`${tip}${extra}`} placement="top">
              <Box
                component={NextLink}
                href={usuariosHref}
                sx={{
                  flex: "0 0 auto",
                  scrollSnapAlign: "start",
                  width: 118,
                  minHeight: 138,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${alpha("#5d4037", 0.35)} 0%, ${alpha("#3e2723", 0.5)} 100%)`,
                  border: `3px solid ${alpha("#fff", 0.25)}`,
                  boxShadow: "0 10px 22px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.15)",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pt: 1.25,
                  px: 0.75,
                  pb: 1,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 28px rgba(0,0,0,0.35)",
                  },
                }}
              >
                {/* “Porta” */}
                <Box
                  sx={{
                    width: 56,
                    height: 72,
                    borderRadius: "4px 4px 2px 2px",
                    bgcolor: alpha("#8d6e63", 0.95),
                    border: `2px solid ${alpha("#fff", 0.35)}`,
                    boxShadow: "inset -4px 0 8px rgba(0,0,0,0.25)",
                    position: "relative",
                    mb: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "42%",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: alpha("#ffd54f", 0.95),
                      boxShadow: "0 0 6px rgba(255,213,79,0.8)",
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  textAlign="center"
                  sx={{
                    color: "common.white",
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                    lineHeight: 1.2,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {nomeDept}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.6rem", color: alpha("#fff", 0.75), mt: 0.25 }}>
                  {pessoas.length} pessoa(s)
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
