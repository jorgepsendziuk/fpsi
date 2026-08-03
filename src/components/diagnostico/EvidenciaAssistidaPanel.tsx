"use client";

import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NextLink from "next/link";
import type { EvidenciaSugestao } from "@/lib/medidas/evidenciaRules";
import { labelRespostaSugerida, respostaAtualIgualSugestao } from "@/lib/medidas/evidenciaRules";
import { hrefEstruturaGovernanca } from "@/lib/governanca/abaGovernanca";
import { RequisitoIaLabel } from "@/components/aigp/RequisitoIaLabel";
import { AIGP_ACCENT, getAigpDiagnosticoTheme } from "@/lib/aigp/aigpVisualTokens";
import { getDiagnosticoTheme } from "@/lib/utils/diagnosticoThemes";

export type EvidenciaAssistidaPanelProps = {
  sugestao: EvidenciaSugestao | null;
  loading?: boolean;
  respostaAtual?: unknown;
  diagnosticoId?: number;
  programaPathSegment?: string;
  onAplicar?: () => void | Promise<void>;
  /** Medida 0.x sem regra — mensagem informativa */
  showSemRegraHint?: boolean;
  idMedida?: string;
};

export function EvidenciaAssistidaPanel({
  sugestao,
  loading = false,
  respostaAtual,
  diagnosticoId = 1,
  programaPathSegment,
  onAplicar,
  showSemRegraHint = false,
  idMedida = "",
}: EvidenciaAssistidaPanelProps) {
  const theme = useTheme();
  const isAigp = diagnosticoId === 4;
  const accent = isAigp ? getAigpDiagnosticoTheme().color : getDiagnosticoTheme(diagnosticoId).color;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          px: 2,
          py: 1.25,
          borderRadius: 2.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.5 : 0.85),
        }}
      >
        <CircularProgress size={18} sx={{ color: accent }} />
        <Typography variant="body2" color="text.secondary">
          Carregando sugestão do sistema…
        </Typography>
      </Box>
    );
  }

  if (
    showSemRegraHint &&
    sugestao &&
    !sugestao.regraDefinida &&
    (idMedida.startsWith("0.") || isAigp)
  ) {
    return (
      <Box
        sx={{
          mb: 2,
          px: 2,
          py: 1.5,
          borderRadius: 2.5,
          border: `1px solid ${alpha(accent, 0.2)}`,
          bgcolor: alpha(accent, 0.05),
        }}
      >
        {isAigp ? (
          <RequisitoIaLabel variant="inline" sx={{ mb: 0.5, display: "flex" }}>
            Avaliação assistida
          </RequisitoIaLabel>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          {sugestao.motivo}
        </Typography>
      </Box>
    );
  }

  if (!sugestao?.regraDefinida || sugestao.respostaSugerida == null) {
    return null;
  }

  const aplicada = respostaAtualIgualSugestao(respostaAtual, sugestao.respostaSugerida);

  return (
    <Box
      sx={{
        mb: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "flex-start" },
        gap: 1.5,
        border: `1px solid ${alpha(isAigp ? AIGP_ACCENT : accent, 0.28)}`,
        bgcolor: alpha(isAigp ? AIGP_ACCENT : accent, theme.palette.mode === "dark" ? 0.1 : 0.06),
        backdropFilter: "blur(8px)",
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
      }}
    >
      <AutoAwesomeIcon
        sx={{
          fontSize: 22,
          color: isAigp ? AIGP_ACCENT : accent,
          mt: 0.25,
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isAigp ? (
          <RequisitoIaLabel variant="inline" sx={{ mb: 0.5, display: "flex" }} showIcon={false}>
            Sugestão do sistema (AIGP)
          </RequisitoIaLabel>
        ) : (
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 0.35 }}>
            Sugestão do sistema
          </Typography>
        )}
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          <strong>{labelRespostaSugerida(sugestao)}</strong>
          {" — "}
          {sugestao.motivo}
        </Typography>
        {sugestao.governancaContexto && programaPathSegment ? (
          <Box sx={{ mt: 1 }}>
            <Link
              component={NextLink}
              href={hrefEstruturaGovernanca(programaPathSegment, sugestao.governancaContexto.aba)}
              underline="hover"
              fontWeight={600}
              sx={{ color: isAigp ? AIGP_ACCENT : "primary.main" }}
            >
              Abrir Estrutura de Governança
            </Link>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.35 }}>
              {sugestao.governancaContexto.detalhe}
            </Typography>
          </Box>
        ) : null}
        {sugestao.acaoModulo && programaPathSegment ? (
          <Box sx={{ mt: sugestao.governancaContexto ? 0.75 : 1 }}>
            <Link
              component={NextLink}
              href={`/programas/${programaPathSegment}/${sugestao.acaoModulo.path}`}
              underline="hover"
              fontWeight={600}
              sx={{ color: isAigp ? AIGP_ACCENT : "primary.main" }}
            >
              {sugestao.acaoModulo.label}
            </Link>
            {sugestao.acaoModulo.detalhe ? (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.35 }}>
                {sugestao.acaoModulo.detalhe}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>
      <Button
        size="small"
        variant="outlined"
        disabled={aplicada}
        onClick={() => void onAplicar?.()}
        sx={{
          flexShrink: 0,
          alignSelf: { xs: "flex-start", sm: "center" },
          borderColor: alpha(isAigp ? AIGP_ACCENT : accent, 0.45),
          color: isAigp ? AIGP_ACCENT : accent,
          "&:hover": {
            borderColor: isAigp ? AIGP_ACCENT : accent,
            bgcolor: alpha(isAigp ? AIGP_ACCENT : accent, 0.08),
          },
        }}
      >
        {aplicada ? "Aplicada" : "Aplicar"}
      </Button>
    </Box>
  );
}
