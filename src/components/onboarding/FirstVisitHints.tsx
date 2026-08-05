"use client";

/**
 * Hints discretos de primeiro uso no painel.
 * Persistidos em localStorage — fáceis de dispensar, não bloqueiam a UI.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  Fade,
  IconButton,
  Paper,
  Portal,
  Stack,
  Typography,
  keyframes,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

const STORAGE_KEY = "fpsi-onboarding-hints-v1";

export type HintId =
  | "nav-geral"
  | "nav-inicio"
  | "nav-referencias"
  | "nav-novo-programa"
  | "dash-programas";

type HintDef = {
  id: HintId;
  /** Seletor CSS do âncora (data-hint-anchor) */
  anchor: string;
  title: string;
  body: string;
  placement?: "right" | "bottom" | "left";
};

const HINTS: HintDef[] = [
  {
    id: "nav-geral",
    anchor: '[data-hint-anchor="nav-geral"]',
    title: "Menu Geral",
    body: "Aqui ficam Início, Perfil e as referências (LGPD, PPSI, Governança de IA).",
    placement: "right",
  },
  {
    id: "nav-inicio",
    anchor: '[data-hint-anchor="nav-inicio"]',
    title: "Seu painel",
    body: "Volte sempre ao Início para ver programas, empresas e o resumo operacional.",
    placement: "right",
  },
  {
    id: "nav-referencias",
    anchor: '[data-hint-anchor="nav-referencias"]',
    title: "Consultas rápidas",
    body: "LGPD, PPSI e Governança de IA — textos e links oficiais sem sair do fluxo.",
    placement: "right",
  },
  {
    id: "nav-novo-programa",
    anchor: '[data-hint-anchor="nav-novo-programa"]',
    title: "Criar programa",
    body: "Um programa agrupa diagnóstico, políticas, conformidade e equipe da organização.",
    placement: "right",
  },
  {
    id: "dash-programas",
    anchor: '[data-hint-anchor="dash-programas"]',
    title: "Comece por aqui",
    body: "Crie um programa ou uma empresa. Depois abra o programa para o diagnóstico PPSI.",
    placement: "bottom",
  },
];

type StoredState = {
  dismissedAll: boolean;
  dismissed: HintId[];
};

function readStored(): StoredState {
  if (typeof window === "undefined") return { dismissedAll: false, dismissed: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissedAll: false, dismissed: [] };
    const parsed = JSON.parse(raw) as StoredState;
    return {
      dismissedAll: Boolean(parsed.dismissedAll),
      dismissed: Array.isArray(parsed.dismissed) ? parsed.dismissed : [],
    };
  } catch {
    return { dismissedAll: false, dismissed: [] };
  }
}

function writeStored(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.85; box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.45); }
  70% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 0 8px rgba(25, 118, 210, 0); }
  100% { transform: scale(1); opacity: 0.85; box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

function HintBubble({
  hint,
  onDismiss,
  onDismissAll,
}: {
  hint: HintDef;
  onDismiss: () => void;
  onDismissAll: () => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePos = useCallback(() => {
    const el = document.querySelector(hint.anchor) as HTMLElement | null;
    if (!el) {
      setPos(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const placement = hint.placement ?? "right";
    if (placement === "bottom") {
      setPos({ top: r.bottom + 10, left: Math.min(r.left, window.innerWidth - 300) });
    } else if (placement === "left") {
      setPos({ top: r.top + r.height / 2 - 20, left: Math.max(8, r.left - 280) });
    } else {
      setPos({ top: r.top + r.height / 2 - 12, left: r.right + 10 });
    }
  }, [hint.anchor, hint.placement]);

  useEffect(() => {
    updatePos();
    const t = window.setTimeout(updatePos, 400);
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [updatePos]);

  if (!pos) return null;

  return (
    <Portal>
      <Box
        sx={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          zIndex: theme.zIndex.tooltip + 2,
          pointerEvents: "auto",
        }}
      >
        <Box
          component="button"
          type="button"
          aria-label={`Dica: ${hint.title}`}
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: `2px solid ${theme.palette.primary.main}`,
            bgcolor: alpha(theme.palette.primary.main, 0.35),
            cursor: "pointer",
            p: 0,
            animation: `${pulse} 2.2s ease-out infinite`,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.55) },
          }}
        />
        {open && (
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Fade in>
              <Paper
                elevation={6}
                sx={{
                  position: "absolute",
                  top: 22,
                  left: 0,
                  width: 260,
                  p: 1.25,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="flex-start" spacing={0.5} sx={{ mb: 0.5 }}>
                  <LightbulbOutlinedIcon color="primary" sx={{ fontSize: 18, mt: 0.15 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, lineHeight: 1.3 }}>
                    {hint.title}
                  </Typography>
                  <IconButton size="small" aria-label="Fechar dica" onClick={onDismiss} sx={{ mt: -0.5 }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5, mb: 1 }}>
                  {hint.body}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={onDismissAll} sx={{ textTransform: "none", fontSize: "0.7rem" }}>
                    Dispensar todas
                  </Button>
                  <Button size="small" variant="text" onClick={onDismiss} sx={{ textTransform: "none", fontSize: "0.7rem" }}>
                    Entendi
                  </Button>
                </Stack>
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Box>
    </Portal>
  );
}

export type FirstVisitHintsProps = {
  /** Só mostra se o usuário acabou de criar conta nesta sessão (sessionStorage) ou nunca viu */
  forceShow?: boolean;
};

export function FirstVisitHints({ forceShow = false }: FirstVisitHintsProps) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<StoredState>({ dismissedAll: false, dismissed: [] });

  useEffect(() => {
    const stored = readStored();
    const justRegistered =
      typeof sessionStorage !== "undefined" && sessionStorage.getItem("fpsi-just-registered") === "1";
    if (justRegistered) {
      sessionStorage.removeItem("fpsi-just-registered");
      // Reabre hints após novo cadastro mesmo se já tinha dispensado em outra conta neste browser
      const fresh = { dismissedAll: false, dismissed: [] as HintId[] };
      writeStored(fresh);
      setState(fresh);
    } else {
      setState(stored);
    }
    setReady(true);
  }, [forceShow]);

  const dismissOne = useCallback((id: HintId) => {
    setState((prev) => {
      const next = {
        ...prev,
        dismissed: prev.dismissed.includes(id) ? prev.dismissed : [...prev.dismissed, id],
      };
      writeStored(next);
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    const next = { dismissedAll: true, dismissed: HINTS.map((h) => h.id) };
    writeStored(next);
    setState(next);
  }, []);

  if (!ready || state.dismissedAll) return null;

  const visible = HINTS.filter((h) => !state.dismissed.includes(h.id));
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((hint) => (
        <HintBubble
          key={hint.id}
          hint={hint}
          onDismiss={() => dismissOne(hint.id)}
          onDismissAll={dismissAll}
        />
      ))}
    </>
  );
}
