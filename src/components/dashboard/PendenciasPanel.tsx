"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { PendenciasResumo } from "@/lib/types/pendencias";
import { landing } from "@/components/landing/landingTokens";
import dayjs from "dayjs";

type Props = {
  pendencias: PendenciasResumo | null | undefined;
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
  dense?: boolean;
  /** Itens iniciais (e passo do “carregar mais”). Default 5. */
  maxItems?: number;
  /** Mostra uma faixa do próximo item com fade (útil com maxItems=1). */
  peekNext?: boolean;
  /**
   * Preenche a altura disponível do container com quantos itens couberem
   * (ResizeObserver). Combina com maxItems como mínimo e passo do “carregar mais”.
   */
  fillAvailable?: boolean;
  /** @deprecated Sem rolagem — ignorado. Mantido por compat. */
  maxHeight?: number | string;
  /** Conteúdo sem card (em painel combinado). */
  bare?: boolean;
};

const DEFAULT_PAGE = 5;
const ROW_DENSE = 48;
const ROW_NORMAL = 62;

function severidadeIcon(sev: string) {
  if (sev === "critical") return <ErrorOutlineIcon color="error" fontSize="small" />;
  if (sev === "warning") return <WarningAmberIcon color="warning" fontSize="small" />;
  return <InfoOutlinedIcon color="info" fontSize="small" />;
}

export function PendenciasPanel({
  pendencias,
  loading,
  title = "Pendências",
  emptyMessage = "Nenhuma pendência no momento.",
  dense,
  maxItems = DEFAULT_PAGE,
  peekNext,
  fillAvailable,
  bare,
}: Props) {
  const theme = useTheme();
  const pageSize = Math.max(1, maxItems);
  const itens = pendencias?.itens ?? [];
  const [shown, setShown] = useState(pageSize);
  const [fitCount, setFitCount] = useState(pageSize);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!fillAvailable) return;
    const el = fillRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.clientHeight;
      const row = dense ? ROW_DENSE : ROW_NORMAL;
      // título + chips + peek + botão
      const usable = Math.max(0, h - 80);
      const byBox = Math.floor(usable / row);
      // teto duro pela viewport — evita estourar a tela
      const byViewport = typeof window !== "undefined"
        ? Math.max(1, Math.floor((window.innerHeight - 460) / row))
        : 6;
      const n = Math.max(pageSize, Math.min(byBox, byViewport));
      setFitCount(n);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fillAvailable, dense, pageSize, title, itens.length]);

  useEffect(() => {
    setShown(pageSize);
  }, [pageSize, pendencias?.itens?.length, title]);

  useEffect(() => {
    if (!fillAvailable) return;
    setShown((prev) => Math.max(prev, fitCount));
  }, [fillAvailable, fitCount]);

  const visible = itens.slice(0, shown);
  const baseline = fillAvailable ? Math.max(pageSize, fitCount) : pageSize;
  const peekItem = peekNext && shown <= baseline && itens.length > visible.length ? itens[visible.length] : null;
  const remaining = Math.max(0, itens.length - shown);
  const hasMore = remaining > 0;

  const renderItem = (item: (typeof itens)[number], opts?: { peek?: boolean }) => (
    <ListItem key={item.id} disablePadding sx={{ mb: dense ? 0.3 : 0.5 }}>
      <ListItemButton
        component={Link}
        href={item.href}
        tabIndex={opts?.peek ? -1 : undefined}
        sx={{
          borderRadius: 1,
          py: dense ? 0.45 : 1,
          pointerEvents: opts?.peek ? "none" : undefined,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          bgcolor:
            item.severidade === "critical"
              ? alpha(theme.palette.error.main, 0.06)
              : item.severidade === "warning"
                ? alpha(theme.palette.warning.main, 0.06)
                : "transparent",
        }}
      >
        <Box sx={{ mr: 0.75, display: "flex", alignItems: "center" }}>
          {severidadeIcon(item.severidade)}
        </Box>
        <ListItemText
          primary={item.titulo}
          secondary={
            dense ? (
              item.dataLimite
                ? `Prazo: ${dayjs(item.dataLimite).format("DD/MM/YYYY")}`
                : item.subtitulo
            ) : (
              <>
                {item.programaNome && item.subtitulo
                  ? `${item.programaNome} · ${item.subtitulo}`
                  : item.subtitulo || item.programaNome}
                {item.dataLimite && (
                  <> · Prazo: {dayjs(item.dataLimite).format("DD/MM/YYYY")}</>
                )}
              </>
            )
          }
          primaryTypographyProps={{
            fontWeight: 600,
            fontSize: dense ? "0.8125rem" : "0.9rem",
            noWrap: Boolean(dense),
          }}
          secondaryTypographyProps={{ fontSize: dense ? "0.75rem" : "0.8125rem" }}
        />
      </ListItemButton>
    </ListItem>
  );

  const body = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: dense ? 0.5 : 1.5,
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant={dense ? "subtitle2" : "subtitle1"} fontWeight={700}>
          {title}
        </Typography>
        {pendencias && pendencias.total > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {pendencias.atrasados > 0 && (
              <Chip size="small" color="error" label={`${pendencias.atrasados} atras.`} />
            )}
            {pendencias.vencendo7d > 0 && (
              <Chip size="small" color="warning" label={`${pendencias.vencendo7d} em 7d`} />
            )}
            {pendencias.novos > 0 && (
              <Chip size="small" color="info" label={`${pendencias.novos} novo`} />
            )}
          </Box>
        )}
      </Box>

      {loading && (
        <Typography variant="body2" color="text.secondary">
          Carregando…
        </Typography>
      )}

      {!loading && (!pendencias || pendencias.itens.length === 0) && (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: dense ? "0.8rem" : undefined }}>
          {emptyMessage}
        </Typography>
      )}

      {!loading && visible.length > 0 && (
        <Box sx={{ position: "relative", flex: fillAvailable ? 1 : undefined, minHeight: 0 }}>
          <List dense disablePadding sx={{ overflow: "visible" }}>
            {visible.map((item) => renderItem(item))}
          </List>

          {peekItem && (
            <Box
              sx={{
                position: "relative",
                mt: -0.15,
                maxHeight: dense ? 38 : 44,
                overflow: "hidden",
              }}
            >
              <List dense disablePadding>
                {renderItem(peekItem, { peek: true })}
              </List>
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "70%",
                  pointerEvents: "none",
                  background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0)} 0%, ${theme.palette.background.paper} 88%)`,
                }}
              />
            </Box>
          )}

          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: peekItem ? 0.25 : 0.5 }}>
              <Button
                size="small"
                onClick={() => setShown((n) => n + pageSize)}
                endIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                sx={{
                  fontWeight: 700,
                  borderRadius: 1,
                  textTransform: "none",
                  color: landing.blue,
                  fontSize: dense ? "0.75rem" : undefined,
                  py: dense ? 0.35 : undefined,
                  "&:hover": {
                    bgcolor: alpha(landing.blue, 0.08),
                  },
                }}
              >
                Carregar mais · {remaining}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </>
  );

  if (bare) {
    return (
      <Box
        ref={fillAvailable ? fillRef : undefined}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: fillAvailable ? 1 : undefined,
          minHeight: fillAvailable ? 0 : undefined,
          height: fillAvailable ? "100%" : undefined,
        }}
      >
        {body}
      </Box>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        "&::before": {
          content: '""',
          display: "block",
          height: 3,
          background: `linear-gradient(90deg, ${landing.blue} 0%, ${landing.shield} 55%, ${landing.lock} 100%)`,
        },
      }}
    >
      <CardContent
        ref={fillAvailable ? fillRef : undefined}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          py: dense ? 1.5 : 2,
          px: dense ? 1.75 : 2.25,
          "&:last-child": { pb: dense ? 1.25 : 1.75 },
          minHeight: fillAvailable ? 0 : undefined,
        }}
      >
        {body}
      </CardContent>
    </Card>
  );
}
