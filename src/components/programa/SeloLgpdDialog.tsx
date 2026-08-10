"use client";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  SELO_METAIS,
  SELO_PLANOS,
  faixaMetalDescricao,
  type SeloMetalId,
  type SeloPlanoId,
} from "@/lib/programa/seloLgpd";
import { SeloLgpdBadge } from "@/components/programa/SeloLgpdBadge";
import { landing } from "@/components/landing/landingTokens";

type Props = {
  open: boolean;
  onClose: () => void;
  activePlano: SeloPlanoId;
  activeMetal: SeloMetalId;
  greyed: boolean;
  score: number | null;
};

export function SeloLgpdDialog({ open, onClose, activePlano, activeMetal, greyed, score }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: isDark ? alpha(landing.ink, 0.96) : "#F7FAFD",
          backgroundImage: isDark
            ? `radial-gradient(120% 80% at 0% 0%, ${alpha(landing.blue, 0.22)} 0%, transparent 55%),
               radial-gradient(90% 60% at 100% 0%, ${alpha(landing.shield, 0.12)} 0%, transparent 50%)`
            : `radial-gradient(120% 80% at 0% 0%, ${alpha(landing.mist, 0.95)} 0%, transparent 55%),
               radial-gradient(90% 60% at 100% 0%, ${alpha(landing.lock, 0.12)} 0%, transparent 50%)`,
          border: `1px solid ${alpha(landing.navy, isDark ? 0.35 : 0.1)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          pr: 6,
          pt: 2.5,
          pb: 1.25,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: isDark ? landing.heroText : landing.text,
        }}
      >
        Selos LGPD Compliance
        <Typography
          component="span"
          display="block"
          variant="body2"
          sx={{ mt: 0.6, fontWeight: 500, color: isDark ? landing.heroMuted : landing.muted, lineHeight: 1.5 }}
        >
          Reconhecimento do FPSI pela maturidade média dos diagnósticos ativos no plano do seu programa.
        </Typography>
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 3 }}>
        {/* Status atual */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2.5,
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            border: `1px solid ${alpha(landing.navy, isDark ? 0.35 : 0.1)}`,
            bgcolor: alpha(isDark ? "#fff" : landing.navy, isDark ? 0.04 : 0.03),
          }}
        >
          <SeloLgpdBadge
            plano={activePlano}
            palette={SELO_METAIS.find((m) => m.id === activeMetal)!}
            greyed={greyed}
            revealColors={!greyed}
            size={146}
            uid="dlg-active"
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ fontWeight: 700, letterSpacing: "0.14em", color: landing.blue }}
            >
              Seu programa agora
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mt: 0.25 }}>
              {SELO_PLANOS.find((p) => p.id === activePlano)?.label} ·{" "}
              {SELO_METAIS.find((m) => m.id === activeMetal)?.label}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary", lineHeight: 1.55 }}>
              {greyed
                ? "Ainda sem pontuação nos diagnósticos ativos — o selo aparece cinza. Ao passar o mouse, revela o Bronze: o primeiro nível ao começar o diagnóstico."
                : `Média atual dos diagnósticos ativos no plano: ${score != null ? score.toFixed(2) : "—"}. O metal evolui com a maturidade; o tipo do selo acompanha o plano (Essencial, Completo ou IA+).`}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="overline"
          sx={{ fontWeight: 700, letterSpacing: "0.12em", color: "text.secondary" }}
        >
          Planos
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary", lineHeight: 1.5 }}>
          O selo acompanha o plano/escopo do programa de privacidade.
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          sx={{ mb: 3 }}
        >
          {SELO_PLANOS.map((plano) => {
            const isActive = plano.id === activePlano;
            return (
              <Box
                key={plano.id}
                sx={{
                  flex: 1,
                  p: 1.75,
                  borderRadius: 2,
                  border: `1px solid ${
                    isActive
                      ? alpha(landing.blue, 0.55)
                      : alpha(landing.navy, isDark ? 0.3 : 0.1)
                  }`,
                  bgcolor: isActive ? alpha(landing.blue, isDark ? 0.16 : 0.06) : "transparent",
                  textAlign: "center",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <SeloLgpdBadge
                    plano={plano.id}
                    palette={SELO_METAIS.find((m) => m.id === (isActive ? activeMetal : "prata"))!}
                    greyed={false}
                    size={125}
                    uid={`dlg-plano-${plano.id}`}
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {plano.label}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5, color: "text.secondary", lineHeight: 1.45 }}>
                  {plano.description}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Typography
          variant="overline"
          sx={{ fontWeight: 700, letterSpacing: "0.12em", color: "text.secondary" }}
        >
          Maturidade
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary", lineHeight: 1.5 }}>
          Bronze, prata e ouro refletem a média dos diagnósticos ativos no escopo do plano.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap>
          {SELO_METAIS.map((metal) => {
            const isActive = !greyed && metal.id === activeMetal;
            return (
              <Box
                key={metal.id}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${
                    isActive ? metal.metal : alpha(landing.navy, isDark ? 0.3 : 0.1)
                  }`,
                  bgcolor: isActive ? alpha(metal.metal, isDark ? 0.18 : 0.08) : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SeloLgpdBadge
                  plano={activePlano}
                  palette={metal}
                  greyed={false}
                  size={104}
                  uid={`dlg-metal-${metal.id}`}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: metal.metalDeep }}>
                  {metal.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", textAlign: "center", lineHeight: 1.45 }}
                >
                  {faixaMetalDescricao(metal.id)}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Box
          sx={{
            mt: 3,
            p: 1.75,
            borderRadius: 1.5,
            border: `1px dashed ${alpha(landing.navy, isDark ? 0.35 : 0.16)}`,
            bgcolor: alpha(landing.shield, isDark ? 0.08 : 0.05),
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.55 }}>
            O selo FPSI é um indicador interno de evolução do programa — não substitui certificação
            oficial da ANPD nem auditoria externa. Evolui com o plano escolhido e com a média dos
            diagnósticos ativos.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
