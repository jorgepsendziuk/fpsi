"use client";

import React from "react";
import { Box, Checkbox, FormControlLabel, Paper, Stack, Typography, alpha } from "@mui/material";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import {
  PANORAMA_PROGRAMA_PRIVACIDADE_QUESITOS,
  PANORAMA_QUESITOS_GRUPOS_ORDEM,
  type PanoramaProgramaPrivacidadeQuesito,
} from "@/lib/panorama/panoramaProgramaPrivacidadeQuesitos";
import { PanoramaAccordionSection } from "@/components/diagnostico/panorama/PanoramaAccordionSection";

function MarcadorSimNao({ comObs }: { comObs: boolean }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.75, sm: 2 }}
      alignItems={{ xs: "stretch", sm: "center" }}
      className="panorama-checklist-resposta"
      sx={{ mt: { xs: 0.75, print: 0.35 }, width: "100%" }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <FormControlLabel
          className="panorama-screen-only"
          control={<Checkbox size="small" color="primary" sx={{ p: 0.35 }} />}
          label={<Typography variant="caption" fontWeight={600}>Sim</Typography>}
          sx={{ m: 0, mr: 0.5 }}
        />
        <FormControlLabel
          className="panorama-screen-only"
          control={<Checkbox size="small" color="primary" sx={{ p: 0.35 }} />}
          label={<Typography variant="caption" fontWeight={600}>Não</Typography>}
          sx={{ m: 0 }}
        />
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ display: { xs: "none", print: "flex" } }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: { print: 11 },
                height: { print: 11 },
                border: "1px solid",
                borderColor: "text.primary",
                borderRadius: 0.25,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: { print: "7pt" } }}>
              Sim
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: { print: 11 },
                height: { print: 11 },
                border: "1px solid",
                borderColor: "text.primary",
                borderRadius: 0.25,
              }}
            />
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: { print: "7pt" } }}>
              Não
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      {comObs ? (
        <Box
          className="panorama-screen-only"
          sx={{ flex: 1, minWidth: { xs: "100%", sm: 140 } }}
        >
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
            Observação
          </Typography>
          <Box
            className="panorama-checklist-obs-linha"
            sx={{
              borderBottom: "1px solid",
              borderColor: (t) => alpha(t.palette.text.primary, 0.35),
              minHeight: 28,
            }}
          />
        </Box>
      ) : null}
    </Stack>
  );
}

function QuesitoCard({ item }: { item: PanoramaProgramaPrivacidadeQuesito }) {
  const { Icon } = item;
  const comObs = item.resposta === "sim_nao_obs";

  return (
    <Paper
      variant="outlined"
      className="panorama-checklist-item"
      sx={{
        p: { xs: 1.25, print: 0.55 },
        borderRadius: 1,
        borderColor: (t) => alpha(t.palette.primary.main, 0.15),
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
        breakInside: "avoid",
        "@media print": {
          bgcolor: "transparent",
          borderColor: "#ccc",
        },
      }}
    >
      <Stack direction="row" spacing={{ xs: 1, print: 0.65 }} alignItems="flex-start">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 36, print: 24 },
            height: { xs: 36, print: 24 },
            borderRadius: 1,
            flexShrink: 0,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            color: "primary.main",
            "@media print": {
              bgcolor: "transparent",
              border: "1px solid #bbb",
            },
          }}
        >
          <Icon sx={{ fontSize: { xs: 20, print: 14 } }} aria-hidden />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              lineHeight: { xs: 1.35, print: 1.2 },
              fontSize: { xs: "0.88rem", print: "8pt" },
            }}
          >
            {item.pergunta}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
              lineHeight: { xs: 1.45, print: 1.25 },
              fontSize: { xs: "0.82rem", print: "7pt" },
              fontStyle: "italic",
            }}
          >
            {item.mapeamento}
          </Typography>
          {item.obsRotulo ? (
            <Typography
              className="panorama-screen-only"
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.25 }}
            >
              {item.obsRotulo}
            </Typography>
          ) : null}
          <MarcadorSimNao comObs={comObs} />
        </Box>
      </Stack>
    </Paper>
  );
}

export default function PanoramaProgramaPrivacidadeChecklist() {
  const porGrupo = PANORAMA_QUESITOS_GRUPOS_ORDEM.map((grupo) => ({
    grupo,
    itens: PANORAMA_PROGRAMA_PRIVACIDADE_QUESITOS.filter((q) => q.grupo === grupo),
  })).filter((g) => g.itens.length > 0);

  return (
    <PanoramaAccordionSection
      sectionId="panorama-sec-checklist-inicio"
      className="panorama-text-left panorama-checklist-programa"
      accent="checklist"
      title="Quesitos para validar o início do programa"
      titleIcon={<PlaylistAddCheckOutlinedIcon fontSize="inherit" />}
      subtitle={
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: { print: "7.5pt" }, lineHeight: 1.35 }}>
          Checklist alinhado à LGPD e às orientações da ANPD. Confirme o que já existe na organização em relação a este panorama.
        </Typography>
      }
    >
      <Stack spacing={{ xs: 2, print: 1 }} className="panorama-checklist-grupos">
        {porGrupo.map(({ grupo, itens }) => (
          <Box key={grupo}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="primary.main"
              sx={{
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: { xs: 1, print: 0.35 },
                fontSize: { xs: "0.72rem", print: "6.5pt" },
              }}
            >
              {grupo}
            </Typography>
            <Stack spacing={{ xs: 1, print: 0.45 }} className="panorama-checklist-lista">
              {itens.map((item) => (
                <QuesitoCard key={item.id} item={item} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </PanoramaAccordionSection>
  );
}