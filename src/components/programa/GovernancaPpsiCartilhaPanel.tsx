"use client";

import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import {
  CARTILHA_REFERENCIA_BIBLIOGRAFICA,
  TEXTO_NORMATIVO_ALTA_ADMINISTRACAO,
  getOrientacaoCampo,
  type CampoResponsavelProgramaId,
  type OrientacaoCampoResponsavel,
} from "@/content/governancaOrientacaoPrograma";

function ListaCompacta({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {titulo}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, typography: "body2", color: "text.secondary" }}>
        {itens.map((item, idx) => (
          <Box component="li" key={idx} sx={{ mb: 0.35 }}>
            {item}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Diálogo com fundamentação e referências do papel (botão ? na tela de governança). */
export function GovernancaPapelHintDialog({
  campoId,
  open,
  onClose,
}: {
  campoId: CampoResponsavelProgramaId | null;
  open: boolean;
  onClose: () => void;
}) {
  const o: OrientacaoCampoResponsavel | undefined = campoId ? getOrientacaoCampo(campoId) : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>{o?.rotulo ?? "Orientação"}</DialogTitle>
      <DialogContent dividers>
        {!o ? (
          <Typography variant="body2" color="text.secondary">
            Sem texto de apoio para este campo.
          </Typography>
        ) : (
          <>
            {campoId === "representante_alta_administracao" && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" gutterBottom>
                  Fundamentação (alta administração)
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {TEXTO_NORMATIVO_ALTA_ADMINISTRACAO}
                </Typography>
              </Paper>
            )}
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              {o.instrucao}
            </Typography>
            <ListaCompacta titulo="Fundamentação normativa" itens={o.fundamentacao} />
            <ListaCompacta titulo="Sugestões de implementação (cartilha PPSI 2.0)" itens={o.dicasCartilha} />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, fontStyle: "italic" }}>
              Referência: {CARTILHA_REFERENCIA_BIBLIOGRAFICA}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
