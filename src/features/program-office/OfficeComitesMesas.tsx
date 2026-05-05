"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { hrefEstruturaGovernanca } from "@/lib/governanca/abaGovernanca";
import type { GovernancaGruposMembros } from "@/lib/services/dataService";
import { COMITES } from "./governancaPapeis";

type Props = {
  idOrSlug: string;
  membros: GovernancaGruposMembros;
  nomePorResponsavelId: Map<number, string>;
};

export function OfficeComitesMesas({ idOrSlug, membros, nomePorResponsavelId }: Props) {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.12, mb: 1 }}>
        Mesas dos comitês
      </Typography>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{
          alignItems: "stretch",
        }}
      >
        {COMITES.map(({ tipo, titulo, subtitulo, aba }) => {
          const ids = membros[tipo] || [];
          const href = hrefEstruturaGovernanca(idOrSlug, aba);

          return (
            <Card
              key={tipo}
              variant="outlined"
              component={NextLink}
              href={href}
              sx={{
                flex: 1,
                minWidth: 0,
                p: 2,
                textDecoration: "none",
                borderRadius: 2,
                bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.08 : 0.06),
                borderColor: alpha(theme.palette.secondary.main, 0.35),
                display: "block",
                color: "inherit",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                  boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.2)}`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                <GroupsOutlinedIcon color="secondary" sx={{ mt: 0.25 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="secondary.dark">
                    {titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {subtitulo}
                  </Typography>
                </Box>
              </Stack>
              {ids.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sem membros definidos — clique para gerir.
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                  {ids.map((id) => (
                    <Chip
                      key={id}
                      size="small"
                      label={nomePorResponsavelId.get(id) || `Responsável #${id}`}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
