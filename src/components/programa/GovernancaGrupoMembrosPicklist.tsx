"use client";

import React, { useMemo } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import type { Responsavel } from "@/lib/types/types";

type Props = {
  responsaveis: Responsavel[];
  /** IDs selecionados (ordem preservada no topo da lista). */
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
};

/**
 * Lista com checkbox: integrantes selecionados aparecem primeiro, depois os demais em ordem alfabética.
 */
export function GovernancaGrupoMembrosPicklist({ responsaveis, selectedIds, onChange, disabled }: Props) {
  const ordered = useMemo(() => {
    const set = new Set(selectedIds);
    const byId = new Map(responsaveis.map((r) => [r.id, r]));
    const selected: Responsavel[] = [];
    for (const id of selectedIds) {
      const r = byId.get(id);
      if (r) selected.push(r);
    }
    const rest = responsaveis.filter((r) => !set.has(r.id)).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return [...selected, ...rest];
  }, [responsaveis, selectedIds]);

  const toggle = (id: number) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([id, ...selectedIds]);
    }
  };

  if (responsaveis.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Cadastre pessoas na aba Papéis e equipe para poder indicar membros aqui.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", maxHeight: 420, display: "flex", flexDirection: "column" }}>
      {selectedIds.length > 0 && (
        <Box sx={{ px: 2, py: 1, bgcolor: "action.selected", borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {selectedIds.length} selecionado(s)
          </Typography>
        </Box>
      )}
      <List dense disablePadding sx={{ overflow: "auto", flex: 1 }}>
        {ordered.map((r) => {
          const checked = selectedIds.includes(r.id);
          return (
            <ListItem
              key={r.id}
              disablePadding
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: checked ? "action.hover" : "transparent",
                transition: "background-color 0.15s ease",
              }}
            >
              <FormControlLabel
                sx={{ mx: 0, px: 2, py: 0.75, width: "100%", mr: 0 }}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={() => toggle(r.id)}
                    disabled={disabled}
                    size="small"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={checked ? 600 : 400}>
                      {r.nome}
                    </Typography>
                    {r.email ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {r.email}
                      </Typography>
                    ) : null}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
