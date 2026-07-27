"use client";

import { useMemo } from "react";
import { Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { alpha, useTheme } from "@mui/material/styles";
import { useOfficeExperience } from "./OfficeExperienceContext";
import { buildFocusCatalog, findFocusNavIndex } from "./officeFocusCatalog";
import { rpgPixelFont } from "./rpgGameFont";

/** Painel central ao focar mesa ou sala no escritório 3D. */
export function OfficeFocusPanelOverlay() {
  const theme = useTheme();
  const x = useOfficeExperience();
  const panel = x.focusPanel;
  const nav = useMemo(() => {
    if (!panel) return null;
    const catalog = buildFocusCatalog(
      {
        gruposDept: x.gruposDept,
        committeesAll: x.committeesAll,
        mesaSlots: x.mesaSlots,
        equipeHref: x.equipeHref,
        nomePorResponsavelId: x.nomePorResponsavelId,
        responsaveis: x.responsaveis,
      },
      x.room,
    );
    const idx = findFocusNavIndex(catalog, panel.navId);
    return { catalog, idx, total: catalog.length };
  }, [panel, x.gruposDept, x.committeesAll, x.mesaSlots, x.equipeHref, x.nomePorResponsavelId, x.responsaveis, x.room]);

  if (!panel) return null;

  const canPrev = nav != null && nav.idx > 0;
  const canNext = nav != null && nav.idx >= 0 && nav.idx < nav.total - 1;
  const navLabel =
    nav != null && nav.idx >= 0 ? `${nav.idx + 1} / ${nav.total}` : null;

  return (
    <Paper
      elevation={8}
      className={rpgPixelFont.className}
      sx={{
        position: "absolute",
        left: "50%",
        top: { xs: 12, sm: 20 },
        transform: "translateX(-50%)",
        zIndex: 6,
        pointerEvents: "auto",
        width: { xs: "min(94vw, 420px)", sm: 440 },
        maxHeight: "min(52vh, 420px)",
        overflow: "auto",
        borderRadius: 3,
        border: "2px solid",
        borderColor: alpha(theme.palette.primary.main, 0.35),
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
      }}
    >
      <Stack spacing={1.25} sx={{ p: 2, pt: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ flexShrink: 0 }}>
            <IconButton
              size="small"
              aria-label="Espaço anterior"
              disabled={!canPrev}
              onClick={() => x.navigateFocusPanel(-1)}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            {navLabel ? (
              <Typography variant="caption" sx={{ fontSize: 10, minWidth: 36, textAlign: "center" }}>
                {navLabel}
              </Typography>
            ) : null}
            <IconButton
              size="small"
              aria-label="Próximo espaço"
              disabled={!canNext}
              onClick={() => x.navigateFocusPanel(1)}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: 10,
                letterSpacing: 0.14,
                fontWeight: 600,
                color: panel.kind === "sector" ? "info.dark" : "warning.dark",
                lineHeight: 1.3,
              }}
            >
              {panel.badge}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>
              {panel.title}
            </Typography>
            {panel.subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, lineHeight: 1.45 }}>
                {panel.subtitle}
              </Typography>
            ) : null}
          </Stack>
          <IconButton size="small" aria-label="Fechar" onClick={() => x.closeFocusPanel()} sx={{ mt: -0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {panel.people.length > 0 ? (
          <Stack
            spacing={0.75}
            sx={{
              py: 0.5,
              px: 0.25,
              borderTop: "1px solid",
              borderBottom: "1px solid",
              borderColor: alpha(theme.palette.divider, 0.7),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 0.08 }}>
              Quem está alocado
            </Typography>
            {panel.people.map((p, i) => (
              <Stack key={`${p.name}-${i}`} spacing={0.15}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</Typography>
                {p.detail ? (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.35 }}>
                    {p.detail}
                  </Typography>
                ) : null}
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
            Ninguém cadastrado ainda neste espaço.
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UndoIcon />}
            onClick={() => x.closeFocusPanel()}
            sx={{ flex: { sm: 1 }, minWidth: 0 }}
          >
            Voltar à visão anterior
          </Button>
          {panel.enterRoom ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<MeetingRoomIcon />}
              onClick={() => {
                const er = panel.enterRoom!;
                x.closeFocusPanelWithoutRestore();
                x.enterSectorRoom(er.deptName, er.people);
              }}
              sx={{ flex: { sm: 1 }, minWidth: 0 }}
            >
              Entrar na sala
            </Button>
          ) : null}
          {panel.href ? (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<OpenInNewIcon />}
              onClick={() => {
                x.openIframe(panel.href!, panel.hrefLabel ?? panel.title);
              }}
              sx={{ flex: { sm: 1 }, minWidth: 0 }}
            >
              {panel.hrefLabel ?? "Abrir cadastro"}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
