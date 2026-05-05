"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Avatar, Box, Card, CardActionArea, Stack, Tooltip, Typography } from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { Programa } from "@/lib/types/types";
import type { CampoResponsavelProgramaId } from "@/content/governancaOrientacaoPrograma";
import { hrefEstruturaGovernanca } from "@/lib/governanca/abaGovernanca";
import { MESA_PAPéis_ORDER, idResponsavelPapel } from "./governancaPapeis";

type Props = {
  idOrSlug: string;
  programa: Programa;
  nomePorResponsavelId: Map<number, string>;
};

/**
 * Mesa de reunião: cinco cadeiras obrigatórios PPSI; vazio = acinzentado + alerta.
 */
export function OfficeMesaCentral({ idOrSlug, programa, nomePorResponsavelId }: Props) {
  const theme = useTheme();
  const equipeHref = hrefEstruturaGovernanca(idOrSlug, "equipe");
  const wood = theme.palette.mode === "dark" ? "#4e342e" : "#8d6e63";
  const woodLight = theme.palette.mode === "dark" ? "#5d4037" : "#a1887f";

  return (
    <Box sx={{ position: "relative" }}>
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.12, mb: 1 }}>
        Mesa central — papéis obrigatórios (PPSI 2.0)
      </Typography>
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 1.5, sm: 2.5 },
          background: `linear-gradient(180deg, ${alpha(wood, 0.35)} 0%, ${alpha(woodLight, 0.2)} 100%)`,
          border: `1px solid ${alpha(wood, 0.5)}`,
          boxShadow: (t) => (t.palette.mode === "dark" ? "0 8px 32px rgba(0,0,0,0.35)" : "0 10px 28px rgba(62,39,35,0.18)"),
        }}
      >
        {/* Superfície da mesa */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "stretch",
            gap: { xs: 1.5, md: 1 },
            minHeight: { md: 132 },
          }}
        >
          {MESA_PAPéis_ORDER.map(({ campo, rotulo, chefe }) => {
            const rid = idResponsavelPapel(programa, campo as CampoResponsavelProgramaId);
            const nome = rid != null ? nomePorResponsavelId.get(rid) : null;
            const definido = rid != null && Boolean(nome?.trim());

            return (
              <Card
                key={campo}
                elevation={0}
                sx={{
                  flex: chefe ? { md: 1.15 } : { md: 1 },
                  minWidth: 0,
                  borderRadius: 2,
                  bgcolor: definido
                    ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.08)
                    : alpha(theme.palette.grey[500], theme.palette.mode === "dark" ? 0.15 : 0.12),
                  border: `1px solid ${
                    definido ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.grey[600], 0.25)
                  }`,
                  opacity: definido ? 1 : 0.72,
                }}
              >
                <CardActionArea
                  component={NextLink}
                  href={equipeHref}
                  aria-label={`Definir ${rotulo}: ir para Estrutura de Governança`}
                  sx={{
                    height: "100%",
                    alignItems: "stretch",
                    py: 1.5,
                    px: 1.25,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: "100%" }}>
                    <Tooltip title={definido ? nome : "Papel a designar — clique para cadastrar"}>
                      <Avatar
                        sx={{
                          width: chefe ? 52 : 44,
                          height: chefe ? 52 : 44,
                          bgcolor: definido ? "primary.main" : "grey.500",
                          opacity: definido ? 1 : 0.55,
                        }}
                      >
                        {definido ? (
                          <Typography fontWeight={800} fontSize="0.85rem" aria-hidden>
                            {(nome || "?")
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </Typography>
                        ) : (
                          <PersonOutlineIcon />
                        )}
                      </Avatar>
                    </Tooltip>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" noWrap>
                        {chefe ? "Cabeceira" : "Membro"}
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.25 }} color="text.primary">
                        {rotulo}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={definido ? "text.primary" : "warning.main"}
                        sx={{ mt: 0.5, fontWeight: definido ? 600 : 500 }}
                        noWrap
                      >
                        {definido ? nome : "A designar"}
                      </Typography>
                      {!definido && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                          <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: "warning.main" }} />
                          <Typography variant="caption" color="warning.main">
                            Definir em Papéis no programa
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, px: 0.5 }}>
          Clique num lugar para abrir <strong>Estrutura de Governança</strong> ({equipeHref}) e associar o responsável.
        </Typography>
      </Box>
    </Box>
  );
}
