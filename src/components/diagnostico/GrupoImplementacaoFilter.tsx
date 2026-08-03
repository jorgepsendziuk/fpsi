"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
  useTheme,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  type GrupoImpleFilter,
  GRUPO_IMPLEMENTACAO_HINT,
  GRUPO_FILTRO_CUMULATIVO_RESUMO,
  GRUPO_GI_PALETTE,
  labelGrupoGi,
} from "@/lib/utils/grupoImplementacao";

interface GrupoImplementacaoFilterProps {
  value: GrupoImpleFilter;
  onChange: (value: GrupoImpleFilter) => void;
  /** Versão compacta — uma linha (card Segurança). */
  compact?: boolean;
  /** Impede propagação de clique (ex.: card clicável por trás). */
  stopClickPropagation?: boolean;
}

const hintContent = (
  <Box sx={{ maxWidth: 520, py: 0.5 }}>
    <Typography variant="body2" component="div" sx={{ whiteSpace: "pre-line", lineHeight: 1.55 }}>
      {GRUPO_IMPLEMENTACAO_HINT}
    </Typography>
    <Typography variant="body2" component="p" sx={{ mt: 2, fontWeight: 600, lineHeight: 1.5 }}>
      {GRUPO_FILTRO_CUMULATIVO_RESUMO}
    </Typography>
    <Typography variant="caption" component="p" sx={{ mt: 1, display: "block", opacity: 0.95 }}>
      Filtra a árvore, as listas e os indicadores deste diagnóstico. Na tela de um controle, o índice de maturidade
      do controle continua considerando todas as medidas.
    </Typography>
  </Box>
);

const toggleButtonSx = (compact: boolean) => ({
  flexShrink: 0,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    mx: 0,
    "&:not(:first-of-type)": { borderRadius: 1.5 },
    "&:first-of-type": { borderRadius: 1.5 },
  },
  "& .MuiToggleButton-root": {
    px: compact ? 0.85 : 1.25,
    py: compact ? 0.25 : 0.4,
    minWidth: compact ? 36 : 44,
    fontSize: compact ? "0.6875rem" : "0.8125rem",
    fontWeight: 700,
    textTransform: "none" as const,
    borderRadius: "8px !important",
    border: "none",
    color: "text.secondary",
    lineHeight: 1.2,
  },
});

function GiToggleButtons({
  value,
  onChange,
  compact,
}: {
  value: GrupoImpleFilter;
  onChange: (v: GrupoImpleFilter) => void;
  compact: boolean;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, v) => v != null && onChange(v)}
      size="small"
      aria-label="Filtrar por grupo de implementação GI1, GI2 ou GI3"
      sx={toggleButtonSx(compact)}
    >
      <ToggleButton
        value="all"
        sx={{
          "&.Mui-selected": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
          },
        }}
      >
        Todos
      </ToggleButton>
      <ToggleButton
        value="G1"
        sx={{
          "&.Mui-selected": {
            bgcolor: GRUPO_GI_PALETTE.G1.main,
            color: GRUPO_GI_PALETTE.G1.contrastText,
            "&:hover": { bgcolor: "#1B5E20" },
          },
        }}
      >
        {labelGrupoGi("G1")}
      </ToggleButton>
      <ToggleButton
        value="G2"
        sx={{
          "&.Mui-selected": {
            bgcolor: GRUPO_GI_PALETTE.G2.main,
            color: GRUPO_GI_PALETTE.G2.contrastText,
            "&:hover": { bgcolor: "#9A3412" },
          },
        }}
      >
        {labelGrupoGi("G2")}
      </ToggleButton>
      <ToggleButton
        value="G3"
        sx={{
          "&.Mui-selected": {
            bgcolor: GRUPO_GI_PALETTE.G3.main,
            color: GRUPO_GI_PALETTE.G3.contrastText,
            "&:hover": { bgcolor: "#004D40" },
          },
        }}
      >
        {labelGrupoGi("G3")}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export function GrupoImplementacaoFilter({
  value,
  onChange,
  compact = false,
  stopClickPropagation = false,
}: GrupoImplementacaoFilterProps) {
  const theme = useTheme();

  const handleContainerClick = stopClickPropagation
    ? (e: React.MouseEvent) => e.stopPropagation()
    : undefined;

  const labelRow = (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, minWidth: 0 }}>
      <FilterListIcon sx={{ fontSize: compact ? 15 : 18, color: "primary.main" }} aria-hidden />
      <Typography
        variant="body2"
        fontWeight={700}
        color="text.secondary"
        noWrap
        sx={{ fontSize: compact ? "0.75rem" : "0.8125rem" }}
      >
        {compact ? "GI (CIS)" : "Grupos de implementação (GI)"}
      </Typography>
      <Tooltip title={hintContent} placement="top" enterDelay={200} slotProps={{ tooltip: { sx: { maxWidth: 560 } } }}>
        <InfoOutlinedIcon
          fontSize="inherit"
          color="primary"
          sx={{ cursor: "help", opacity: 0.85, fontSize: compact ? 14 : 16, flexShrink: 0 }}
          aria-label="Sobre os grupos de implementação GI1, GI2 e GI3"
        />
      </Tooltip>
    </Stack>
  );

  if (compact) {
    return (
      <Box
        onClick={handleContainerClick}
        sx={{
          mt: 1,
          pt: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {labelRow}
        <Box sx={{ flex: 1, minWidth: 8 }} />
        <GiToggleButtons value={value} onChange={onChange} compact />
      </Box>
    );
  }

  return (
    <Box
      onClick={handleContainerClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        px: 1.5,
        py: 0.85,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
        borderLeft: `3px solid ${theme.palette.primary.main}`,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      {labelRow}
      <Box sx={{ flex: 1, minWidth: 12 }} />
      <GiToggleButtons value={value} onChange={onChange} compact={false} />
    </Box>
  );
}
