"use client";

import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export interface SelectOption {
  id: number;
  nome: string;
}

interface SelectWithAddProps {
  label: string;
  value: number | string | "";
  onChange: (value: number | string) => void;
  fetchUrl: string;
  createUrl: string;
  addDialogTitle: string;
  addFieldLabel: string;
  fullWidth?: boolean;
  /** Quando "nome", value/onChange usam o nome (string) em vez do id */
  valueAs?: "id" | "nome";
}

export function SelectWithAdd({
  label,
  value,
  onChange,
  fetchUrl,
  createUrl,
  addDialogTitle,
  addFieldLabel,
  fullWidth = true,
  valueAs = "id",
}: SelectWithAddProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (err) {
      console.error("Erro ao carregar opções:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [fetchUrl]);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: newValue.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setOptions((prev) => [...prev, data]);
        onChange(valueAs === "nome" ? data.nome : data.id);
        setDialogOpen(false);
        setNewValue("");
      } else {
        const msg = data.details ? `${data.error}: ${data.details}` : (data.error || "Erro ao salvar");
        setError(msg);
      }
    } catch (err) {
      setError("Erro ao salvar");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
      <FormControl fullWidth={fullWidth} size="small" sx={{ flex: 1 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={valueAs === "nome" ? (value || "") : (value || "")}
          label={label}
          onChange={(e) => {
            const v = e.target.value;
            if (valueAs === "nome") onChange(typeof v === "string" ? v : "");
            else onChange(Number(v) || 0);
          }}
          disabled={loading}
        >
          <MenuItem value="">
            <em>Selecione</em>
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.id} value={valueAs === "nome" ? opt.nome : opt.id}>
              {opt.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton
        size="small"
        onClick={() => setDialogOpen(true)}
        sx={{ mt: 0.5 }}
        title={`Adicionar ${label.toLowerCase()}`}
      >
        <AddIcon fontSize="small" />
      </IconButton>
      <Dialog open={dialogOpen} onClose={() => !creating && setDialogOpen(false)}>
        <DialogTitle>{addDialogTitle}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={addFieldLabel}
            fullWidth
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            error={!!error}
            helperText={error}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} variant="contained" disabled={creating || !newValue.trim()}>
            {creating ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
