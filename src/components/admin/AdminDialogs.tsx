"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  loading = false,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? "Aguarde..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminPageAlert({
  error,
  success,
  onClearError,
  onClearSuccess,
}: {
  error: string | null;
  success: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}) {
  if (!error && !success) return null;
  return (
    <Box sx={{ mb: 2 }}>
      {error && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: success ? 1 : 0 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={onClearSuccess}>
          {success}
        </Alert>
      )}
    </Box>
  );
}
