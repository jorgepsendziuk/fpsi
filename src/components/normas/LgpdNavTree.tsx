"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Collapse,
  IconButton,
  Typography,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import type { LgpdOutlineEntry } from "@/lib/normas/lgpdOutline";
import { collectExpandableIds } from "@/lib/normas/lgpdOutline";

const RAIL = 22;
const TOGGLE_COL = 34;

function formatArtigoLabel(n: number): string {
  return n === 10 ? `Art. 10` : `Art. ${n}º`;
}

type BranchProps = {
  node: LgpdOutlineEntry;
  depth: number;
  selectedArtigo: number;
  onSelectArtigo: (n: number) => void;
  expanded: Set<string>;
  toggle: (id: string) => void;
};

function TreeRails({ depth }: { depth: number }) {
  if (depth <= 0) return null;
  return (
    <Box sx={{ display: "flex", flexShrink: 0, height: "100%", alignSelf: "stretch" }}>
      {Array.from({ length: depth }, (_, d) => (
        <Box
          key={d}
          sx={{
            width: RAIL,
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={(theme) => ({
              width: 1,
              flex: 1,
              minHeight: "100%",
              bgcolor: alpha(theme.palette.text.primary, 0.12),
              borderRadius: 1,
            })}
          />
        </Box>
      ))}
    </Box>
  );
}

/** Todo capítulo/seção com filhos e/ou artigos usa o mesmo bloco expansível (inclui Cap. I só com artigos). */
function LgpdOutlineBranch({ node, depth, selectedArtigo, onSelectArtigo, expanded, toggle }: BranchProps) {
  const theme = useTheme();
  const hasFilhos = (node.filhos?.length ?? 0) > 0;
  const arts = node.artigos ?? [];
  if (!hasFilhos && arts.length === 0) return null;

  const isOpen = expanded.has(node.id);
  const isCap = depth === 0;

  return (
    <Box component="li" sx={{ listStyle: "none", position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          minHeight: 40,
          borderRadius: 1.5,
          transition: theme.transitions.create(["background-color"], { duration: 120 }),
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <TreeRails depth={depth} />
        <Box
          sx={{
            width: TOGGLE_COL,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => toggle(node.id)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Recolher" : "Expandir"}
            sx={{
              p: 0.35,
              color: "primary.main",
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.35),
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                borderColor: alpha(theme.palette.primary.main, 0.55),
              },
            }}
          >
            <ExpandMoreIcon
              fontSize="small"
              sx={{
                transition: theme.transitions.create("transform", { duration: 200 }),
                transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            />
          </IconButton>
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => toggle(node.id)}
          sx={{
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            border: "none",
            background: "none",
            cursor: "pointer",
            py: 1,
            pr: 1,
            pl: 0.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            font: "inherit",
            color: "inherit",
          }}
        >
          <Box sx={{ mt: 0.15, color: isCap ? "primary.main" : "text.secondary", display: "flex" }}>
            {isCap ? (
              <LibraryBooksOutlinedIcon sx={{ fontSize: 22 }} />
            ) : isOpen ? (
              <FolderOpenOutlinedIcon sx={{ fontSize: 20 }} />
            ) : (
              <FolderOutlinedIcon sx={{ fontSize: 20 }} />
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isCap ? 700 : 600,
              lineHeight: 1.4,
              color: "text.primary",
              letterSpacing: isCap ? 0.01 : 0,
            }}
          >
            {node.titulo}
          </Typography>
        </Box>
      </Box>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box
          component="ul"
          sx={(t) => ({
            m: 0,
            p: 0,
            pt: 0.25,
            pb: 0.75,
            pl: 1.25,
            ml: `${TOGGLE_COL / 2 + RAIL * Math.max(0, depth)}px`,
            borderLeft: `2px solid ${alpha(t.palette.divider, 0.85)}`,
          })}
        >
          {hasFilhos &&
            node.filhos!.map((child) => (
              <LgpdOutlineBranch
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedArtigo={selectedArtigo}
                onSelectArtigo={onSelectArtigo}
                expanded={expanded}
                toggle={toggle}
              />
            ))}
          {arts.map((n) => (
            <ArtigoRow
              key={`${node.id}-art-${n}`}
              depth={depth + 1}
              n={n}
              selected={selectedArtigo === n}
              onSelect={() => onSelectArtigo(n)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function ArtigoRow({
  depth,
  n,
  selected,
  onSelect,
}: {
  depth: number;
  n: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <Box component="li" sx={{ listStyle: "none" }}>
      <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 36 }}>
        <TreeRails depth={depth} />
        <Box sx={{ width: TOGGLE_COL, flexShrink: 0 }} />
        <Box
          component="button"
          type="button"
          onClick={onSelect}
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 0.65,
            px: 1,
            ml: 0.5,
            mb: 0.25,
            borderRadius: 1,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
            color: "inherit",
            bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : "transparent",
            borderLeft: selected ? `3px solid ${theme.palette.primary.main}` : "3px solid transparent",
            boxShadow: selected ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}` : "none",
            transition: theme.transitions.create(["background-color", "box-shadow"], { duration: 120 }),
            "&:hover": {
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.action.hover, 0.5),
            },
          }}
        >
          <ArticleOutlinedIcon sx={{ fontSize: 18, color: selected ? "primary.main" : "text.secondary", flexShrink: 0 }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8125rem",
              fontWeight: selected ? 700 : 500,
              fontFeatureSettings: '"tnum"',
              color: selected ? "primary.dark" : "text.secondary",
            }}
          >
            {formatArtigoLabel(n)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export type LgpdNavTreeProps = {
  outline: LgpdOutlineEntry[];
  selectedArtigo: number;
  onSelectArtigo: (n: number) => void;
  expandAll?: boolean;
  sx?: SxProps<Theme>;
};

export function LgpdNavTree({ outline, selectedArtigo, onSelectArtigo, expandAll = false, sx }: LgpdNavTreeProps) {
  const theme = useTheme();
  const allExpandableIds = useMemo(() => collectExpandableIds(outline), [outline]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (expandAll) setExpanded(new Set(allExpandableIds));
    else setExpanded(new Set());
  }, [outline, expandAll, allExpandableIds]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <Box
      component="nav"
      aria-label="Estrutura da LGPD"
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.6 : 1),
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box sx={{ px: 0.75, py: 1 }}>
        <Box component="ul" sx={{ m: 0, p: 0 }}>
          {outline.map((node) => (
            <LgpdOutlineBranch
              key={node.id}
              node={node}
              depth={0}
              selectedArtigo={selectedArtigo}
              onSelectArtigo={onSelectArtigo}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
