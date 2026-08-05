"use client";

import React, { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SecurityIcon from "@mui/icons-material/Security";
import {
  PPSI_FRAMEWORKS,
  findPpsiFrameworkById,
  type PpsiFrameworkRef,
} from "@/lib/normas/ppsiRefs";

export type PpsiReferenciaPanelProps = {
  initialId?: string | null;
  embedded?: boolean;
};

function FrameworkDetail({ fw }: { fw: PpsiFrameworkRef }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
        {fw.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
        {fw.summary}
      </Typography>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Pontos-chave
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.25, mb: 2 }}>
        {fw.bullets.map((b) => (
          <Typography key={b} component="li" variant="body2" sx={{ mb: 0.75, lineHeight: 1.55 }}>
            {b}
          </Typography>
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        No FPSI
      </Typography>
      <Typography variant="body2" sx={{ mb: 2.5, lineHeight: 1.7 }}>
        {fw.usoNoFpsi}
      </Typography>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Fontes oficiais / hubs
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {fw.links.map((link) => {
          const internal = link.url.startsWith("/");
          if (internal) {
            return (
              <Button
                key={link.url}
                component={NextLink}
                href={link.url}
                size="small"
                variant="outlined"
                sx={{ textTransform: "none" }}
              >
                {link.label}
              </Button>
            );
          }
          return (
            <Button
              key={link.url}
              component="a"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="contained"
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: "none" }}
            >
              {link.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}

export function PpsiReferenciaPanel({ initialId = null, embedded = false }: PpsiReferenciaPanelProps) {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down("md"));
  const frameworks = useMemo(() => PPSI_FRAMEWORKS, []);
  const [selectedId, setSelectedId] = useState(initialId ?? frameworks[0]?.id ?? "ppsi-2");

  useEffect(() => {
    if (initialId && findPpsiFrameworkById(initialId)) {
      setSelectedId(initialId);
    }
  }, [initialId]);

  const selected = findPpsiFrameworkById(selectedId) ?? frameworks[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: narrow ? "column" : "row",
        minHeight: embedded ? "100%" : { xs: "auto", md: "min(70vh, 720px)" },
        gap: 0,
      }}
    >
      <Box
        sx={{
          width: narrow ? "100%" : 280,
          flexShrink: 0,
          borderRight: narrow ? 0 : 1,
          borderBottom: narrow ? 1 : 0,
          borderColor: "divider",
          bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          p: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, mb: 1 }}>
          <SecurityIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            PPSI
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 1, mb: 1.5 }}>
          Resumos e links oficiais — complementar à LGPD e à Governança de IA.
        </Typography>
        {narrow ? (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ px: 0.5, mb: 1 }}>
            {frameworks.map((fw) => (
              <Chip
                key={fw.id}
                size="small"
                label={fw.label}
                color={fw.id === selectedId ? "primary" : "default"}
                variant={fw.id === selectedId ? "filled" : "outlined"}
                onClick={() => setSelectedId(fw.id)}
              />
            ))}
          </Stack>
        ) : (
          <List dense disablePadding>
            {frameworks.map((fw) => (
              <ListItemButton
                key={fw.id}
                selected={fw.id === selectedId}
                onClick={() => setSelectedId(fw.id)}
                sx={{ borderRadius: 1, mb: 0.25 }}
              >
                <ListItemText
                  primary={fw.label}
                  primaryTypographyProps={{ variant: "body2", fontWeight: fw.id === selectedId ? 700 : 500 }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: "auto" }}>
        {selected ? <FrameworkDetail fw={selected} /> : null}
        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.6 }}>
          Aviso: o FPSI não substitui o Guia oficial do PPSI 2.0 nem a legislação vigente. Aqui oferecemos
          orientação e atalhos para fontes oficiais. Confira sempre a versão publicada no portal do Governo
          Digital.
        </Typography>
      </Box>
    </Box>
  );
}
