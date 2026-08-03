"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  ALL_COMITE_KEYS,
  ALL_DIAGNOSTICO_IDS,
  ALL_MODULO_KEYS,
  PERFIL_ESCOPO_PRESETS,
  buildEscopoFromPreset,
  detectPresetFromEscopo,
  escoposEquivalentes,
  formatModuloLabel,
  isComiteAtivo,
  isDiagnosticoAtivo,
  isModuloAtivo,
  type ModuloKey,
  type PerfilEscopoPreset,
  type ProgramaEscopoV1,
} from "@/lib/programa/perfilEscopo";

const DIAG_SHORT: Record<number, string> = {
  1: "Estrutura",
  2: "SI",
  3: "Privacidade",
  4: "AIGP",
};

const COMITE_SHORT: Record<string, string> = {
  si: "CSI",
  priva: "CPDP",
  etir: "ETIR",
  ia: "IA",
};

type Props = {
  savedPreset: PerfilEscopoPreset;
  savedEscopo: ProgramaEscopoV1;
  /** Escopo efetivo (preview ou salvo) para exibir detalhes */
  displayEscopo: ProgramaEscopoV1;
  canEdit: boolean;
  applying?: boolean;
  onPreviewChange?: (preset: PerfilEscopoPreset, escopo: ProgramaEscopoV1) => void;
  onApply: (preset: PerfilEscopoPreset) => Promise<void>;
  onDiscardPreview?: () => void;
  onAtivarModulo?: (key: ModuloKey) => void;
  onAtivarDiagnostico?: (id: 1 | 2 | 3 | 4) => void;
  onToggleComite?: (key: string, ativo: boolean) => void;
};

export function ProgramaEscopoBar({
  savedPreset,
  savedEscopo,
  displayEscopo,
  canEdit,
  applying = false,
  onPreviewChange,
  onApply,
  onDiscardPreview,
  onAtivarModulo,
  onAtivarDiagnostico,
  onToggleComite,
}: Props) {
  const theme = useTheme();
  const [previewPreset, setPreviewPreset] = useState<PerfilEscopoPreset | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const activePreset = previewPreset ?? savedPreset;
  const previewEscopo = useMemo(() => {
    if (previewPreset && previewPreset !== "custom") {
      return buildEscopoFromPreset(previewPreset).escopo;
    }
    return savedEscopo;
  }, [previewPreset, savedEscopo]);

  const hasPreviewDiff =
    previewPreset != null &&
    (previewPreset !== savedPreset || !escoposEquivalentes(previewEscopo, savedEscopo));

  const cortadosMod = ALL_MODULO_KEYS.filter(
    (k) => !["usuarios", "auditoria"].includes(k) && !isModuloAtivo(displayEscopo, k)
  );

  const handlePresetClick = (_: React.MouseEvent<HTMLElement>, value: PerfilEscopoPreset | null) => {
    if (!value || value === "custom") return;
    setPreviewPreset(value);
    const built = buildEscopoFromPreset(value);
    onPreviewChange?.(value, built.escopo);
  };

  const handleDiscard = () => {
    setPreviewPreset(null);
    onPreviewChange?.(savedPreset, savedEscopo);
    onDiscardPreview?.();
  };

  const handleApply = async () => {
    const target = previewPreset ?? savedPreset;
    if (target === "custom") return;
    await onApply(target);
    setPreviewPreset(null);
  };

  const presetLabel =
    activePreset === "custom"
      ? "Personalizado"
      : PERFIL_ESCOPO_PRESETS.find((p) => p.id === activePreset)?.shortLabel ?? activePreset;

  return (
    <Box
      sx={{
        mb: 1.25,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.4 : 0.7),
      }}
    >
      {/* Linha principal */}
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={0.75}
        sx={{ minHeight: 32 }}
      >
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0 }}>
          Escopo
        </Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={activePreset === "custom" ? false : activePreset}
          onChange={handlePresetClick}
          disabled={!canEdit || applying}
          sx={{
            flexShrink: 0,
            "& .MuiToggleButton-root": {
              py: 0.25,
              px: 1,
              fontSize: "0.75rem",
              textTransform: "none",
              lineHeight: 1.4,
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
          <Chip label="Personalizado" size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
        )}

        {!detailsOpen && (
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0 }} noWrap>
            {ALL_DIAGNOSTICO_IDS.filter((id) => isDiagnosticoAtivo(displayEscopo, id))
              .map((id) => DIAG_SHORT[id])
              .join(" · ")}
            {cortadosMod.length > 0 && ` · +${cortadosMod.length} fora`}
          </Typography>
        )}

        <Box sx={{ flex: 1, minWidth: 8 }} />

        {hasPreviewDiff && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            <Typography variant="caption" color="info.main" sx={{ display: { xs: "none", sm: "block" } }}>
              Preview
            </Typography>
            <Button size="small" onClick={handleDiscard} disabled={applying} sx={{ minWidth: 0, py: 0.25, fontSize: "0.75rem" }}>
              Descartar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              disabled={!canEdit || applying}
              startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
              sx={{ py: 0.25, fontSize: "0.75rem" }}
            >
              Aplicar
            </Button>
          </Stack>
        )}

        <Tooltip title={detailsOpen ? "Ocultar detalhes" : "Mostrar detalhes"}>
          <IconButton
            size="small"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-label={detailsOpen ? "Ocultar detalhes do escopo" : "Mostrar detalhes do escopo"}
            sx={{ p: 0.35 }}
          >
            <ExpandMoreIcon
              sx={{
                fontSize: 20,
                transform: detailsOpen ? "rotate(180deg)" : "none",
                transition: "0.2s",
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Detalhes — aberto por padrão, uma linha densa */}
      <Collapse in={detailsOpen}>
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={0.5}
          sx={{ pt: 0.75, pb: 0.15 }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.25 }}>
            Score:
          </Typography>
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
                  canEdit && !ativo && onAtivarDiagnostico
                    ? () => onAtivarDiagnostico(id)
                    : undefined
                }
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  cursor: canEdit && !ativo ? "pointer" : "default",
                  opacity: ativo ? 1 : 0.75,
                }}
              />
            );
          })}

          <Typography variant="caption" color="text.disabled" sx={{ mx: 0.25 }}>
            |
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Comitês:
          </Typography>
          {ALL_COMITE_KEYS.map((key) => {
            const ativo = isComiteAtivo(displayEscopo, key);
            return (
              <Chip
                key={key}
                label={COMITE_SHORT[key]}
                size="small"
                color={ativo ? "primary" : "default"}
                variant={ativo ? "filled" : "outlined"}
                onClick={
                  canEdit && onToggleComite
                    ? () => onToggleComite(key, !ativo)
                    : undefined
                }
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  cursor: canEdit ? "pointer" : "default",
                  opacity: ativo ? 1 : 0.7,
                }}
              />
            );
          })}

          {cortadosMod.length > 0 && (
            <>
              <Typography variant="caption" color="text.disabled" sx={{ mx: 0.25 }}>
                |
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Fora:
              </Typography>
              {cortadosMod.map((k) => (
                <Chip
                  key={k}
                  label={formatModuloLabel(k)}
                  size="small"
                  variant="outlined"
                  icon={canEdit && onAtivarModulo ? <AddCircleOutlineIcon sx={{ fontSize: "14px !important" }} /> : undefined}
                  onClick={canEdit && onAtivarModulo ? () => onAtivarModulo(k) : undefined}
                  sx={{
                    height: 22,
                    fontSize: "0.68rem",
                    borderStyle: "dashed",
                    cursor: canEdit ? "pointer" : "default",
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
              ))}
            </>
          )}

          {displayEscopo.controles_ignorados.length > 0 && (
            <>
              <Typography variant="caption" color="text.disabled" sx={{ mx: 0.25 }}>
                |
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {displayEscopo.controles_ignorados.length} ctrl. ignorados
              </Typography>
            </>
          )}

          {!hasPreviewDiff && activePreset !== savedPreset && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              Plano: {presetLabel}
            </Typography>
          )}
        </Stack>
      </Collapse>
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
