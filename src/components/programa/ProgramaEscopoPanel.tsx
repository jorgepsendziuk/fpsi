"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  Stack,
  Switch,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  ALL_COMITE_KEYS,
  ALL_DIAGNOSTICO_IDS,
  ALL_MODULO_KEYS,
  formatModuloLabel,
  isComiteAtivo,
  isDiagnosticoAtivo,
  isModuloAtivo,
  type ModuloKey,
  type ProgramaEscopoV1,
} from "@/lib/programa/perfilEscopo";
import type { ModuloNavSection } from "@/components/programa/ModuloNavGrid";

const DIAG_NAMES: Record<number, string> = {
  1: "Estrutura",
  2: "Segurança da Informação",
  3: "Privacidade",
  4: "Governança de IA",
};

const COMITE_LABELS: Record<string, string> = {
  si: "Comitê de SI",
  priva: "Comitê de privacidade",
  etir: "ETIR",
  ia: "Governança de IA",
};

type Props = {
  escopo: ProgramaEscopoV1;
  cortadosSections?: ModuloNavSection[];
  canEdit?: boolean;
  onAtivarModulo?: (key: ModuloKey) => void;
  onAtivarDiagnostico?: (id: 1 | 2 | 3 | 4) => void;
  onToggleComite?: (key: string, ativo: boolean) => void;
  compact?: boolean;
};

export function ModulosCortadosStrip({
  sections,
  idOrSlug,
  onAtivar,
}: {
  sections: ModuloNavSection[];
  idOrSlug: string;
  onAtivar?: (key: string) => void;
}) {
  const theme = useTheme();
  if (sections.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
        Fora do escopo atual
      </Typography>
      <Grid container spacing={1}>
        {sections.map((s) => (
          <Grid item xs={12} sm={6} md={4} key={s.key}>
            <Card
              variant="outlined"
              sx={{
                opacity: 0.85,
                borderStyle: "dashed",
                bgcolor: alpha(theme.palette.text.primary, 0.02),
              }}
            >
              <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {s.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {s.description}
                    </Typography>
                  </Box>
                  {onAtivar && (
                    <Button
                      size="small"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => onAtivar(s.key)}
                      sx={{ flexShrink: 0, textTransform: "none" }}
                    >
                      Ativar
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function ProgramaEscopoPanel({
  escopo,
  cortadosSections = [],
  canEdit = false,
  onAtivarModulo,
  onAtivarDiagnostico,
  onToggleComite,
  compact = false,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(!compact);

  const cortadosDiag = ALL_DIAGNOSTICO_IDS.filter((id) => !isDiagnosticoAtivo(escopo, id));
  const cortadosMod = ALL_MODULO_KEYS.filter(
    (k) => !["usuarios", "auditoria"].includes(k) && !isModuloAtivo(escopo, k)
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        size="small"
        endIcon={
          <ExpandMoreIcon sx={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
        }
        onClick={() => setOpen((v) => !v)}
        sx={{ textTransform: "none", mb: open ? 1 : 0 }}
      >
        Detalhes do escopo
      </Button>
      <Collapse in={open}>
        <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Diagnósticos no score
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
              {ALL_DIAGNOSTICO_IDS.map((id) => {
                const ativo = isDiagnosticoAtivo(escopo, id);
                return (
                  <Chip
                    key={id}
                    label={DIAG_NAMES[id]}
                    size="small"
                    color={ativo ? "success" : "default"}
                    variant={ativo ? "filled" : "outlined"}
                    onClick={
                      canEdit && !ativo && onAtivarDiagnostico
                        ? () => onAtivarDiagnostico(id)
                        : undefined
                    }
                    sx={{ cursor: canEdit && !ativo ? "pointer" : "default" }}
                  />
                );
              })}
            </Stack>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Comitês / blocos de governança
            </Typography>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              {ALL_COMITE_KEYS.map((key) => (
                <Stack key={key} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">{COMITE_LABELS[key]}</Typography>
                  <Switch
                    size="small"
                    checked={isComiteAtivo(escopo, key)}
                    disabled={!canEdit || !onToggleComite}
                    onChange={(_, checked) => onToggleComite?.(key, checked)}
                  />
                </Stack>
              ))}
            </Stack>

            {(cortadosMod.length > 0 || cortadosSections.length > 0) && (
              <>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Módulos cortados ({cortadosMod.length})
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {cortadosMod.map((k) => (
                    <Chip
                      key={k}
                      label={formatModuloLabel(k)}
                      size="small"
                      variant="outlined"
                      onClick={canEdit && onAtivarModulo ? () => onAtivarModulo(k) : undefined}
                      sx={{ cursor: canEdit ? "pointer" : "default" }}
                    />
                  ))}
                </Stack>
              </>
            )}

            {escopo.controles_ignorados.length > 0 && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                {escopo.controles_ignorados.length} controle(s) ignorado(s) manualmente no diagnóstico.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {cortadosSections.length > 0 && onAtivarModulo && (
        <ModulosCortadosStrip
          sections={cortadosSections}
          idOrSlug=""
          onAtivar={(key) => onAtivarModulo(key as ModuloKey)}
        />
      )}
    </Box>
  );
}
