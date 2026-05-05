"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import DoorFrontOutlinedIcon from "@mui/icons-material/DoorFrontOutlined";
import type { Responsavel } from "@/lib/types/types";

type Props = {
  idOrSlug: string;
  responsaveis: Pick<Responsavel, "id" | "nome" | "departamento">[];
};

/** Agrupa responsáveis por texto de departamento (salas genéricas). */
export function OfficeSalasDepartamentos({ idOrSlug, responsaveis }: Props) {
  const theme = useTheme();
  const base = `/programas/${idOrSlug}/usuarios`;

  const grupos = new Map<string, Pick<Responsavel, "id" | "nome" | "departamento">[]>();
  for (const r of responsaveis) {
    const key = (r.departamento && String(r.departamento).trim()) || "Sem departamento";
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(r);
  }
  const entries = Array.from(grupos.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));

  if (entries.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.12, mb: 1 }}>
        Salas por departamento
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Pessoas cadastradas como responsáveis no programa, agrupadas pelo campo departamento. Gerir acesso em{" "}
        <Box component={NextLink} href={base} sx={{ fontWeight: 700, color: "primary.main" }}>
          Usuários e permissões
        </Box>
        .
      </Typography>
      <Stack spacing={2}>
        {entries.map(([dept, pessoas]) => (
          <Card
            key={dept}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.06 : 0.04),
              borderColor: alpha(theme.palette.info.main, 0.25),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
              <DoorFrontOutlinedIcon color="info" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={800} color="info.dark">
                {dept}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({pessoas.length})
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
              {pessoas.map((p) => (
                <Chip key={p.id} size="small" variant="outlined" label={p.nome || `#${p.id}`} sx={{ fontWeight: 500 }} />
              ))}
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
