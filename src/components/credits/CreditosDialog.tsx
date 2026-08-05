"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  CREDIT_DISCLAIMER,
  CREDIT_FONTES_LEGAIS,
  CREDIT_FRAMEWORKS,
  FPSI_AUTHORSHIP,
  JORGE_GITHUB_URL,
  JORGE_LINKEDIN_URL,
  JORGE_PORTFOLIO_URL,
  type CreditSource,
} from "@/lib/credits/fpsiCredits";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Tom escuro alinhado à landing; padrão claro para o shell autenticado. */
  variant?: "light" | "dark";
};

function SourceBlock({ source, muted }: { source: CreditSource; muted: string }) {
  return (
    <Box
      component="article"
      sx={{
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: 0 },
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.01em" }}>
        {source.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.5 }}>
        {source.role}
      </Typography>
      {source.note ? (
        <Typography variant="caption" display="block" sx={{ mt: 0.75, color: muted, lineHeight: 1.45 }}>
          {source.note}
        </Typography>
      ) : null}
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1 }}>
        {source.links.map((l) => (
          <Link
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="body2"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.4,
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            {l.label}
            <OpenInNewIcon sx={{ fontSize: 13, opacity: 0.7 }} />
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="overline"
      component="h3"
      sx={{
        display: "block",
        mt: 2.5,
        mb: 0.5,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}

export function CreditosDialog({ open, onClose, variant = "light" }: Props) {
  const dark = variant === "dark";
  const muted = dark ? "rgba(244,248,252,0.62)" : "text.secondary";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="creditos-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          maxHeight: "min(88vh, 840px)",
          ...(dark
            ? {
                bgcolor: "#0A2744",
                color: "#F4F8FC",
                backgroundImage: "linear-gradient(165deg, #0A2744 0%, #061525 100%)",
              }
            : {}),
        },
      }}
    >
      <DialogTitle
        id="creditos-dialog-title"
        component="div"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pr: 1,
          pb: 1.5,
        }}
      >
        <Box>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
            Créditos e fontes
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.4, color: muted, maxWidth: 520, lineHeight: 1.45 }}>
            Autoria do projeto e atribuição das leis, guias e frameworks que embasam o FPSI.
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Fechar créditos"
          size="small"
          sx={dark ? { color: "rgba(244,248,252,0.7)" } : undefined}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers={!dark} sx={{ pt: 2, borderColor: dark ? "rgba(244,248,252,0.12)" : undefined }}>
        {/* Autoria */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: dark ? "rgba(244,248,252,0.06)" : "action.hover",
            border: "1px solid",
            borderColor: dark ? "rgba(244,248,252,0.1)" : "divider",
          }}
        >
          <Link
            href={FPSI_AUTHORSHIP.orgUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            aria-label="GeoApps — site"
            sx={{
              display: "block",
              lineHeight: 0,
              borderRadius: 1.5,
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.35)" : "0 4px 16px rgba(10,39,68,0.12)",
            }}
          >
            <Image
              src={FPSI_AUTHORSHIP.logoSrc}
              alt="Logo GeoApps"
              width={168}
              height={77}
              style={{ display: "block", width: 168, height: "auto" }}
            />
          </Link>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {FPSI_AUTHORSHIP.projectName}
            </Typography>
            <Typography variant="body2" sx={{ color: muted, mt: 0.25, lineHeight: 1.45 }}>
              {FPSI_AUTHORSHIP.projectFullName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.25, lineHeight: 1.5 }}>
              Desenvolvido por{" "}
              <Link
                href={JORGE_PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                fontWeight={700}
                color={dark ? "#90CAF9" : "primary"}
              >
                {FPSI_AUTHORSHIP.authorShort}
              </Link>
              {" · "}
              <Link
                href={FPSI_AUTHORSHIP.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                fontWeight={700}
                color={dark ? "#90CAF9" : "primary"}
              >
                {FPSI_AUTHORSHIP.orgName}
              </Link>
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.75, color: muted }}>
              Licença {FPSI_AUTHORSHIP.license} · © {FPSI_AUTHORSHIP.year} {FPSI_AUTHORSHIP.authorName}
            </Typography>
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant={dark ? "outlined" : "contained"}
                startIcon={<GitHubIcon />}
                href={FPSI_AUTHORSHIP.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={
                  dark
                    ? {
                        borderColor: "rgba(244,248,252,0.35)",
                        color: "#F4F8FC",
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": { borderColor: "#F4F8FC", bgcolor: "rgba(244,248,252,0.06)" },
                      }
                    : { textTransform: "none", fontWeight: 700 }
                }
              >
                Repositório no GitHub
              </Button>
              <Button
                size="small"
                variant="text"
                href={JORGE_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", fontWeight: 600, color: muted }}
              >
                Perfil GitHub
              </Button>
              <Button
                size="small"
                variant="text"
                href={JORGE_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", fontWeight: 600, color: muted }}
              >
                LinkedIn
              </Button>
            </Stack>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mt: 2.5,
            p: 1.75,
            borderRadius: 1.5,
            lineHeight: 1.55,
            color: muted,
            bgcolor: dark ? "rgba(249,168,37,0.08)" : "rgba(10,39,68,0.04)",
            borderLeft: "3px solid",
            borderColor: dark ? "#F9A825" : "primary.main",
          }}
        >
          {CREDIT_DISCLAIMER}
        </Typography>

        <SectionHeading>Fontes legais e institucionais</SectionHeading>
        <Box>
          {CREDIT_FONTES_LEGAIS.map((s) => (
            <SourceBlock key={s.id} source={s} muted={typeof muted === "string" ? muted : "text.secondary"} />
          ))}
        </Box>

        <SectionHeading>Frameworks e padrões de referência</SectionHeading>
        <Typography variant="caption" display="block" sx={{ mb: 0.5, color: muted, lineHeight: 1.45 }}>
          Citados no alinhamento metodológico do catálogo PPSI 2.0 e do domínio de governança de IA (AIGP).
        </Typography>
        <Box>
          {CREDIT_FRAMEWORKS.map((s) => (
            <SourceBlock key={s.id} source={s} muted={typeof muted === "string" ? muted : "text.secondary"} />
          ))}
        </Box>

        <Divider sx={{ my: 2.5, borderColor: dark ? "rgba(244,248,252,0.12)" : undefined }} />
        <Typography variant="caption" display="block" sx={{ color: muted, lineHeight: 1.5 }}>
          Sempre confira o texto oficial atualizado nos portais indicados. Em caso de divergência entre o FPSI e a
          fonte normativa, prevalece a fonte oficial.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
