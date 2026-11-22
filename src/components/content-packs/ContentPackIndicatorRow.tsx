"use client";

import type { ReactNode } from "react";
import { Stack, Tooltip, IconButton, Typography, Link, Box } from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import {
  CONTENT_PACK_UI,
  type ContentPackMeta,
  attributionLabel,
} from "@/lib/packages/contentPackMeta";
import {
  operationalPackIdForPrograma,
  type ProgramaPackContext,
} from "@/lib/packages/programaContentPack";

function PackTooltipBody({ meta }: { meta: ContentPackMeta }) {
  return (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={700}>
        {meta.nome}
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 0.5, lineHeight: 1.45 }}>
        {attributionLabel(meta)}
      </Typography>
      {meta.notaUi ? (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.45 }}>
          {meta.notaUi}
        </Typography>
      ) : null}
      {meta.url_fonte ? (
        <Link href={meta.url_fonte} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ mt: 0.5, display: "block" }}>
          Fonte oficial
        </Link>
      ) : null}
    </Box>
  );
}

function PackIconButton({ meta, icon }: { meta: ContentPackMeta; icon: ReactNode }) {
  return (
    <Tooltip title={<PackTooltipBody meta={meta} />} arrow placement="bottom" describeChild>
      <IconButton
        size="small"
        aria-label={`Proveniência: ${meta.nome}`}
        sx={{
          border: 1,
          borderColor: meta.origem === "terceiro" ? "info.light" : "success.light",
          bgcolor: meta.origem === "terceiro" ? "info.50" : "success.50",
          width: 34,
          height: 34,
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

export type ContentPackIndicatorRowProps = {
  /** Contexto do programa para resolver pack (setor + escopo). */
  programa?: ProgramaPackContext | null;
  /** @deprecated Prefira `programa` — só setor, sem escolha PPSI em empresa. */
  programaSetor?: number | null;
  /** Exibir indicador de Governança de IA (eixo 4 ativo). */
  showGovernancaIa?: boolean;
};

export function ContentPackIndicatorRow({
  programa,
  programaSetor,
  showGovernancaIa = true,
}: ContentPackIndicatorRowProps) {
  const ctx: ProgramaPackContext = programa ?? { setor: programaSetor };
  const opPackId = operationalPackIdForPrograma(ctx);
  const opMeta = CONTENT_PACK_UI[opPackId];
  const iaMeta = CONTENT_PACK_UI["governanca-ia"];

  if (!opMeta) return null;

  const opIcon =
    opPackId === "ppsi-2.0" ? (
      <AccountBalanceOutlinedIcon fontSize="small" color="info" />
    ) : (
      <BusinessOutlinedIcon fontSize="small" color="success" />
    );

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" role="note">
      <PackIconButton meta={opMeta} icon={opIcon} />
      {showGovernancaIa && iaMeta ? (
        <PackIconButton meta={iaMeta} icon={<AutoAwesomeOutlinedIcon fontSize="small" color="secondary" />} />
      ) : null}
    </Stack>
  );
}