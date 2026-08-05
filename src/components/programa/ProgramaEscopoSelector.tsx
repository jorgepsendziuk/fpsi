"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  ALL_COMITE_KEYS,
  ALL_DIAGNOSTICO_IDS,
  PERFIL_ESCOPO_PRESETS,
  detectPresetFromEscopo,
  escoposEquivalentes,
  isComiteAtivo,
  isDiagnosticoAtivo,
  type ModuloKey,
  type PerfilEscopoPreset,
  type ProgramaEscopoV1,
} from "@/lib/programa/perfilEscopo";

const DIAG_SHORT: Record<number, string> = {
  1: "Estrutura",
  2: "Segurança",
  3: "Privacidade",
  4: "Gov. de IA",
};

const COMITE_SHORT: Record<string, string> = {
  si: "CSI",
  priva: "CPDP",
  etir: "ETIR",
  ia: "IA",
};

const chipSx = {
  height: 22,
  fontSize: "0.68rem",
  fontWeight: 600,
  borderRadius: 1,
} as const;

function SegmentLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 700,
        color: "text.secondary",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontSize: "0.62rem",
        flexShrink: 0,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
  );
}

function SegmentDivider() {
  return (
    <Box
      aria-hidden
      sx={{
        // MUI sx: número 0–1 vira % — usar px para traço vertical de 1px
        width: "1px",
        alignSelf: "stretch",
        minHeight: 20,
        bgcolor: "divider",
        flexShrink: 0,
      }}
    />
  );
}

type Props = {
  savedPreset: PerfilEscopoPreset;
  savedEscopo: ProgramaEscopoV1;
  /** Escopo efetivo para exibir chips (após aplicar = salvo) */
  displayEscopo: ProgramaEscopoV1;
  canEdit: boolean;
  applying?: boolean;
  onApply: (preset: PerfilEscopoPreset) => Promise<void>;
  onAtivarDiagnostico?: (id: 1 | 2 | 3 | 4) => void;
  onToggleComite?: (key: string, ativo: boolean) => void;
  /** Mantido por compatibilidade — módulos fora do escopo não são mais listados na barra */
  onAtivarModulo?: (key: ModuloKey) => void;
  onPreviewChange?: (preset: PerfilEscopoPreset, escopo: ProgramaEscopoV1) => void;
  onDiscardPreview?: () => void;
};

export function ProgramaEscopoBar({
  savedPreset,
  displayEscopo,
  canEdit,
  applying = false,
  onApply,
  onAtivarDiagnostico,
  onToggleComite,
}: Props) {
  const theme = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);

  const activePreset = savedPreset;

  const handlePresetClick = async (_: React.MouseEvent<HTMLElement>, value: PerfilEscopoPreset | null) => {
    if (!value || value === "custom" || !canEdit || applying) return;
    if (value === savedPreset) return;
    await onApply(value);
  };

  return (
    <Box
      sx={{
        mb: 1.25,
        py: 0.65,
        maxWidth: "100%",
        minWidth: 0,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        spacing={1}
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          rowGap: 0.75,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <SegmentLabel>Escopo</SegmentLabel>
          <Tooltip title="O que é cada escopo?">
            <IconButton
              size="small"
              onClick={() => setHelpOpen(true)}
              aria-label="Explicar escopos"
              sx={{ p: 0.25, color: "text.secondary" }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={activePreset === "custom" ? false : activePreset}
            onChange={handlePresetClick}
            disabled={!canEdit || applying}
            sx={{
              "& .MuiToggleButton-root": {
                py: 0.2,
                px: 0.9,
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "none",
                lineHeight: 1.3,
                borderColor: alpha(theme.palette.divider, 0.9),
                whiteSpace: "nowrap",
              },
            }}
          >
            {PERFIL_ESCOPO_PRESETS.map((p) => (
              <ToggleButton key={p.id} value={p.id}>
                {p.shortLabel}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {activePreset === "custom" && (
            <Chip label="Personalizado" size="small" variant="outlined" sx={chipSx} />
          )}
        </Stack>

        <SegmentDivider />

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <SegmentLabel>Diagnóstico</SegmentLabel>
          {ALL_DIAGNOSTICO_IDS.map((id) => {
            const ativo = isDiagnosticoAtivo(displayEscopo, id);
            return (
              <Chip
                key={id}
                label={DIAG_SHORT[id]}
                size="small"
                color={ativo ? "success" : "default"}
                variant={ativo ? "filled" : "outlined"}
                onClick={
                  canEdit && !ativo && onAtivarDiagnostico ? () => onAtivarDiagnostico(id) : undefined
                }
                sx={{
                  ...chipSx,
                  cursor: canEdit && !ativo ? "pointer" : "default",
                  opacity: ativo ? 1 : 0.72,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </Stack>

        <SegmentDivider />

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <SegmentLabel>Comitês</SegmentLabel>
          {ALL_COMITE_KEYS.map((key) => {
            const ativo = isComiteAtivo(displayEscopo, key);
            return (
              <Chip
                key={key}
                label={COMITE_SHORT[key]}
                size="small"
                color={ativo ? "primary" : "default"}
                variant={ativo ? "filled" : "outlined"}
                onClick={canEdit && onToggleComite ? () => onToggleComite(key, !ativo) : undefined}
                sx={{
                  ...chipSx,
                  cursor: canEdit ? "pointer" : "default",
                  opacity: ativo ? 1 : 0.7,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </Stack>
      </Stack>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Escopos do programa</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.55 }}>
            O escopo define quais <strong>diagnósticos</strong> entram no score de maturidade e quais{" "}
            <strong>módulos/comitês</strong> ficam ativos. Clique em um plano na barra para aplicar na hora —
            você pode ampliar depois sem perder o trabalho já feito.
          </Typography>
          <Stack spacing={2}>
            {PERFIL_ESCOPO_PRESETS.map((p) => (
              <Box
                key={p.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: (t) => (t.palette.mode === "dark" ? "grey.900" : "grey.50"),
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                  {p.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
                  {p.description}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main" display="block" sx={{ mb: 0.35 }}>
                  Ideal para: {p.idealFor}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                  Inclui
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.25, mb: p.excludes.length ? 0.75 : 0 }}>
                  {p.includes.map((item) => (
                    <Typography key={item} component="li" variant="caption" sx={{ lineHeight: 1.45 }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
                {p.excludes.length > 0 && (
                  <>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                      Fica de fora (ativável depois)
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                      {p.excludes.map((item) => (
                        <Typography key={item} component="li" variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setHelpOpen(false)} variant="contained">
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function useEscopoPreviewState(savedPreset: PerfilEscopoPreset, savedEscopo: ProgramaEscopoV1) {
  const [preview, setPreview] = useState<{ preset: PerfilEscopoPreset; escopo: ProgramaEscopoV1 } | null>(null);
  const effectivePreset = preview?.preset ?? savedPreset;
  const effectiveEscopo = preview?.escopo ?? savedEscopo;
  const isPreview = preview != null && !escoposEquivalentes(preview.escopo, savedEscopo);
  return {
    effectivePreset,
    effectiveEscopo,
    isPreview,
    setPreview,
    clearPreview: () => setPreview(null),
  };
}

/** @deprecated Use ProgramaEscopoBar */
export function ProgramaEscopoSelector(props: Omit<Props, "displayEscopo"> & { savedEscopo: ProgramaEscopoV1 }) {
  return <ProgramaEscopoBar {...props} displayEscopo={props.savedEscopo} />;
}

export { detectPresetFromEscopo };
