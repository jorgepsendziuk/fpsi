"use client";

import React from "react";
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Skeleton,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Tune as TuneIcon,
  Description as DescriptionIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import MaturityChip from "./MaturityChip";
import { getDiagnosticoTheme } from "@/lib/utils/diagnosticoThemes";

export interface DiagnosticoTreeNode {
  id: string;
  type: "dashboard" | "diagnostico" | "controle" | "medida";
  label: string;
  badge?: string;
  indiceLabel?: string;
  description?: string;
  data: any;
  children?: DiagnosticoTreeNode[];
  maturityScore?: number;
  maturityLabel?: string;
  diagnosticoId?: number;
  responseColor?: string;
}

type Props = {
  nodes: DiagnosticoTreeNode[];
  selectedNodeId: string | null;
  expandedNodes: Set<string>;
  loadingControles: Set<number>;
  loadingMedidas: Set<number>;
  loading?: boolean;
  onSelect: (node: DiagnosticoTreeNode) => void | Promise<void>;
  onToggle: (nodeId: string, node: DiagnosticoTreeNode) => void | Promise<void>;
};

const GUIDE_STEP = 16;
const EXPAND_SIZE = 22;

function DiagnosticoIcon({ id, size = 18 }: { id: number; size?: number }) {
  const sx = { fontSize: size };
  switch (id) {
    case 1:
      return <AccountBalanceIcon sx={sx} />;
    case 2:
      return <LockIcon sx={sx} />;
    case 3:
      return <PersonIcon sx={sx} />;
    case 4:
      return <PsychologyIcon sx={sx} />;
    default:
      return <AssessmentIcon sx={sx} />;
  }
}

function TreeIcon({ node }: { node: DiagnosticoTreeNode }) {
  const theme = useTheme();
  const responseColor = node.responseColor ?? "#9E9E9E";
  const isAnswered = responseColor !== "#9E9E9E";

  if (node.type === "dashboard") {
    return (
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
        }}
      >
        <DashboardIcon sx={{ fontSize: 18 }} />
      </Box>
    );
  }

  if (node.type === "diagnostico" && node.diagnosticoId) {
    const diagTheme = getDiagnosticoTheme(node.diagnosticoId);
    return (
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(diagTheme.color, 0.14),
          color: diagTheme.color,
        }}
      >
        <DiagnosticoIcon id={node.diagnosticoId} />
      </Box>
    );
  }

  if (node.type === "controle") {
    const diagTheme = node.diagnosticoId ? getDiagnosticoTheme(node.diagnosticoId) : null;
    const color = diagTheme?.color ?? theme.palette.text.secondary;
    return (
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: 0.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(color, 0.1),
          color,
        }}
      >
        <TuneIcon sx={{ fontSize: 16 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        bgcolor: isAnswered ? responseColor : alpha(responseColor, 0.14),
        color: isAnswered ? "#fff" : responseColor,
        boxShadow: isAnswered ? `0 2px 8px ${alpha(responseColor, 0.28)}` : "none",
      }}
    >
      <DescriptionIcon sx={{ fontSize: 20 }} />
    </Box>
  );
}

function TreeGuides({
  depth,
  isLast,
  guides,
  axisColor,
}: {
  depth: number;
  isLast: boolean;
  guides: boolean[];
  axisColor: string;
}) {
  const theme = useTheme();
  const lineColor = alpha(theme.palette.divider, 0.55);
  const accentLine = alpha(axisColor, 0.28);

  if (depth === 0) return null;

  return (
    <Box
      sx={{
        width: depth * GUIDE_STEP,
        flexShrink: 0,
        position: "relative",
        alignSelf: "stretch",
        minHeight: 1,
      }}
      aria-hidden
    >
      {guides.map(
        (continueLine, i) =>
          continueLine && (
            <Box
              key={`v-${i}`}
              sx={{
                position: "absolute",
                left: i * GUIDE_STEP + GUIDE_STEP / 2,
                top: 0,
                bottom: 0,
                width: "1px",
                bgcolor: i === 0 ? accentLine : lineColor,
              }}
            />
          )
      )}
      <Box
        sx={{
          position: "absolute",
          left: (depth - 1) * GUIDE_STEP + GUIDE_STEP / 2,
          top: 0,
          bottom: isLast ? "50%" : 0,
          width: "1px",
          bgcolor: depth === 1 ? accentLine : lineColor,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: (depth - 1) * GUIDE_STEP + GUIDE_STEP / 2,
          top: "50%",
          width: GUIDE_STEP / 2 + 4,
          height: "1px",
          bgcolor: depth === 1 ? accentLine : lineColor,
        }}
      />
    </Box>
  );
}

function TreeRow({
  node,
  depth,
  isLast,
  guides,
  selectedNodeId,
  expandedNodes,
  loadingControles,
  loadingMedidas,
  onSelect,
  onToggle,
}: {
  node: DiagnosticoTreeNode;
  depth: number;
  isLast: boolean;
  guides: boolean[];
  selectedNodeId: string | null;
  expandedNodes: Set<string>;
  loadingControles: Set<number>;
  loadingMedidas: Set<number>;
  onSelect: Props["onSelect"];
  onToggle: Props["onToggle"];
}) {
  const theme = useTheme();
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const canExpand = node.type === "diagnostico" || node.type === "controle";
  const isMedida = node.type === "medida";
  const isLoading =
    (node.type === "diagnostico" && loadingControles.has((node.data as { id?: number })?.id ?? 0)) ||
    (node.type === "controle" && loadingMedidas.has((node.data as { id?: number })?.id ?? 0));

  const axisTheme = node.diagnosticoId ? getDiagnosticoTheme(node.diagnosticoId) : null;
  const axisColor = axisTheme?.color ?? theme.palette.primary.main;

  const selectedBg = (() => {
    if (node.type === "dashboard") return alpha(theme.palette.primary.main, 0.1);
    if (node.type === "diagnostico") return alpha(axisColor, 0.12);
    if (isSelected) return alpha(theme.palette.primary.main, 0.07);
    return "transparent";
  })();

  const hoverBg = (() => {
    if (node.type === "diagnostico") return alpha(axisColor, 0.08);
    return alpha(theme.palette.action.hover, 0.05);
  })();

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          display: "block",
          mb: node.type === "diagnostico" ? 0.35 : 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "stretch", minHeight: isMedida ? 44 : undefined }}>
          <TreeGuides depth={depth} isLast={isLast} guides={guides} axisColor={axisColor} />

          <ListItemButton
            selected={isSelected}
            onClick={() => void onSelect(node)}
            disabled={isLoading}
            sx={{
              flex: 1,
              minWidth: 0,
              py: node.type === "dashboard" ? 0.9 : node.type === "diagnostico" ? 0.75 : isMedida ? 0.45 : 0.55,
              px: 0.75,
              pr: 1,
              mr: 0.5,
              borderRadius: 1,
              minHeight: node.type === "dashboard" ? 48 : node.type === "diagnostico" ? 44 : isMedida ? 44 : 40,
              alignItems: "center",
              bgcolor:
                node.type === "diagnostico"
                  ? isSelected
                    ? selectedBg
                    : alpha(axisColor, 0.05)
                  : isSelected
                    ? selectedBg
                    : "transparent",
              border: "none",
              borderLeft: node.type === "diagnostico" ? `3px solid ${axisColor}` : undefined,
              boxShadow: "none",
              "&.Mui-selected": { bgcolor: selectedBg },
              "&:hover": {
                bgcolor: isSelected ? selectedBg : hoverBg,
              },
            }}
          >
            {canExpand ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  void onToggle(node.id, node);
                }}
                disabled={isLoading}
                aria-label={isExpanded ? "Recolher" : "Expandir"}
                sx={{
                  mr: 0.5,
                  width: EXPAND_SIZE,
                  height: EXPAND_SIZE,
                  p: 0,
                  color: node.type === "diagnostico" ? axisColor : "text.secondary",
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      border: "2px solid",
                      borderColor: "currentColor",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                    }}
                  />
                ) : isExpanded ? (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            ) : (
              <Box sx={{ width: EXPAND_SIZE, mr: 0.5, flexShrink: 0 }} />
            )}

            <Box sx={{ mr: isMedida ? 0.85 : 0.65, flexShrink: 0, display: "flex", alignItems: "center" }}>
              <TreeIcon node={node} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {node.badge && node.type !== "diagnostico" && !isMedida && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        mb: 0.1,
                      }}
                    >
                      {node.badge}
                    </Typography>
                  )}

                  {isMedida ? (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.8125rem",
                        lineHeight: 1.4,
                        fontWeight: isSelected ? 600 : 500,
                        color: "text.primary",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {node.badge && (
                        <Box
                          component="span"
                          sx={{
                            fontWeight: 800,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "-0.01em",
                            mr: 0.6,
                            color: node.responseColor !== "#9E9E9E" ? node.responseColor : "text.secondary",
                          }}
                        >
                          {node.badge}
                        </Box>
                      )}
                      {node.label}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight:
                          node.type === "dashboard" ? 700 : node.type === "diagnostico" ? 700 : 600,
                        fontSize:
                          node.type === "dashboard"
                            ? "0.875rem"
                            : node.type === "diagnostico"
                              ? "0.8125rem"
                              : "0.8rem",
                        lineHeight: 1.35,
                        color: "text.primary",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {node.type === "diagnostico" && node.indiceLabel ? (
                        <>
                          <Box component="span" sx={{ color: axisColor, fontWeight: 800 }}>
                            {node.indiceLabel}
                          </Box>
                          <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, mx: 0.45 }}>
                            ·
                          </Box>
                          {node.label}
                        </>
                      ) : (
                        node.label
                      )}
                    </Typography>
                  )}
                </Box>

                {node.maturityScore !== undefined && (
                  <MaturityChip
                    score={node.maturityScore}
                    label={node.maturityLabel || ""}
                    size="small"
                    variant="outlined"
                    showLabel={false}
                    calculationData={(node.data as { calculationData?: unknown })?.calculationData as never}
                    controleId={node.type === "controle" ? (node.data as { id?: number }).id : undefined}
                    controleNome={node.type === "controle" ? (node.data as { nome?: string }).nome : undefined}
                  />
                )}
              </Box>
            </Box>
          </ListItemButton>
        </Box>
      </ListItem>

      {canExpand && node.children && node.children.length > 0 && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {node.children.map((child, index) => (
              <TreeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={index === node.children!.length - 1}
                guides={[...guides, !isLast]}
                selectedNodeId={selectedNodeId}
                expandedNodes={expandedNodes}
                loadingControles={loadingControles}
                loadingMedidas={loadingMedidas}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export function DiagnosticoTreeNav({
  nodes,
  selectedNodeId,
  expandedNodes,
  loadingControles,
  loadingMedidas,
  loading,
  onSelect,
  onToggle,
}: Props) {
  if (loading) {
    return (
      <Box sx={{ p: 1.25 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={44} sx={{ mb: 0.65, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ py: 0.75, px: 0.25 }}>
      <Typography
        variant="overline"
        sx={{
          display: "block",
          px: 1,
          pb: 0.5,
          color: "text.secondary",
          letterSpacing: "0.1em",
          fontSize: "0.65rem",
          fontWeight: 700,
        }}
      >
        Navegação
      </Typography>
      <List disablePadding dense>
        {nodes.map((node, index) => (
          <TreeRow
            key={node.id}
            node={node}
            depth={0}
            isLast={index === nodes.length - 1}
            guides={[]}
            selectedNodeId={selectedNodeId}
            expandedNodes={expandedNodes}
            loadingControles={loadingControles}
            loadingMedidas={loadingMedidas}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
      </List>
    </Box>
  );
}
