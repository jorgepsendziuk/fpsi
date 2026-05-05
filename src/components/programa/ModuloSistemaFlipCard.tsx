"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Typography,
  useTheme,
  alpha,
  Skeleton,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import type { ModulosResumoApi } from "@/lib/services/dataService";

function maturityColor(score: number): string {
  if (score >= 0.9) return "#2E7D32";
  if (score >= 0.7) return "#388E3C";
  if (score >= 0.5) return "#F9A825";
  if (score >= 0.3) return "#EF6C00";
  return "#C62828";
}

/** Largura da faixa lateral (ícone flip). Exportado para alinhar marcadores externos (ex.: portal). */
export const MODULO_FLIP_STRIP_WIDTH_PX = 44;

/** Altura mínima do conteúdo (frente/verso); evita cortar título e descrição nos breakpoints estreitos */
const CARD_CONTENT_MIN_HEIGHT_PX = 280;

/** Texto do verso (resumo) — um pouco maior que body2 padrão para leitura confortável */
const backBodySx = { fontSize: "0.9375rem", lineHeight: 1.45, m: 0 } as const;
const backHeadingSx = {
  fontSize: "0.8125rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase" as const,
  color: "text.secondary",
  m: 0,
};

function formatActivityLine(a: ModulosResumoApi["auditoria"][0]): string {
  const t = new Date(a.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const act = a.action || "ação";
  const rt = a.resourceType || "";
  return `${t} · ${act}${rt ? ` (${rt})` : ""}`;
}

export type ModuloSection = {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  color: string;
  gradient: string;
};

type Props = {
  section: ModuloSection;
  idOrSlug: string;
  highlight?: boolean;
  resumo: ModulosResumoApi | null;
  resumoLoading: boolean;
  resumoError?: boolean;
  prefersReducedMotion: boolean;
  canHover: boolean;
};

export function ModuloSistemaFlipCard({
  section,
  idOrSlug,
  highlight = false,
  resumo,
  resumoLoading,
  resumoError = false,
  prefersReducedMotion,
  canHover,
}: Props) {
  const theme = useTheme();
  /** Hover só na faixa lateral (ícone), não no card inteiro */
  const [stripHovered, setStripHovered] = useState(false);
  /** Clique no ícone alterna resumo fixo até novo clique */
  const [pinned, setPinned] = useState(false);

  const showBack = (canHover && stripHovered) || pinned;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPinned((p) => !p);
  }, []);

  const handleStripEnter = () => {
    if (canHover) setStripHovered(true);
  };

  const handleStripLeave = () => {
    setStripHovered(false);
  };

  const navigateHref = `/programas/${idOrSlug}/${section.path}`;

  const renderBack = () => {
    if (resumoLoading) {
      return (
        <Stack spacing={0.75} sx={{ width: "100%" }}>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="80%" />
        </Stack>
      );
    }
    if (!resumo) {
      if (resumoError) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ ...backBodySx }}>
            Não foi possível carregar o resumo.
          </Typography>
        );
      }
      return null;
    }

    const { planoAcao, conformidade, responsabilidades, maturidade, politicas, portal, auditoria } = resumo;

    switch (section.key) {
      case "escritorio-governanca":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Camada visual
            </Typography>
            <Typography component="div" sx={backBodySx}>
              A mesma aplicação em outro desenho: sala, corredor e (em breve) personagens dos papéis
              PPSI 2.0. Sem dados extra — só navegação.
            </Typography>
          </Stack>
        );
      case "conformidade-tratamento":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Resumo
            </Typography>
            <Typography component="div" sx={backBodySx}>Mapeamento de dados: {conformidade.mapeamentoDados}</Typography>
            <Typography component="div" sx={backBodySx}>Operações ROPA: {conformidade.ropaOperacoes}</Typography>
            <Typography component="div" sx={backBodySx}>RIPD: {conformidade.ripd}</Typography>
            <Typography component="div" sx={backBodySx}>Incidentes: {conformidade.incidentes}</Typography>
          </Stack>
        );
      case "responsabilidades":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Estrutura de Governança
            </Typography>
            <Typography component="div" sx={backBodySx}>Responsáveis no programa: {responsabilidades.usuarios}</Typography>
            <Typography component="div" sx={backBodySx}>Papéis (instituições): {responsabilidades.papeisInstituicoes}</Typography>
            <Typography component="div" sx={backBodySx}>Conexões: {responsabilidades.conexoes}</Typography>
          </Stack>
        );
      case "diagnostico":
        return (
          <Stack spacing={1.25} sx={{ width: "100%" }}>
            <Stack spacing={0.5}>
              <Typography component="div" sx={backBodySx}>Medidas (plano): {planoAcao.total}</Typography>
              <Typography component="div" sx={backBodySx}>Com resposta: {planoAcao.comResposta}</Typography>
            </Stack>
            <Typography component="div" sx={{ ...backHeadingSx, mt: 0.5 }}>
              Maturidade por diagnóstico
            </Typography>
            <Stack spacing={0.65}>
              {maturidade.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={backBodySx}>
                  Sem índices ainda.
                </Typography>
              ) : (
                maturidade.map((m) => {
                  const pct = Math.round(Number(m.score) * 100);
                  const col = maturityColor(Number(m.score));
                  return (
                    <Box
                      key={m.diagnostico_id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        py: 0.35,
                        px: 0.85,
                        borderRadius: 1,
                        bgcolor: alpha(col, 0.08),
                        borderLeft: `3px solid ${col}`,
                      }}
                    >
                      <Typography noWrap sx={{ flex: 1, ...backBodySx, fontWeight: 500 }} title={m.nome}>
                        {m.nome}
                      </Typography>
                      <Typography fontWeight={800} sx={{ color: col, fontSize: "0.9rem", flexShrink: 0 }}>
                        {pct}%
                      </Typography>
                      <Chip size="small" label={m.label} sx={{ height: 26, fontSize: "0.75rem", fontWeight: 600 }} />
                    </Box>
                  );
                })
              )}
            </Stack>
          </Stack>
        );
      case "planos-acao":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Plano de trabalho
            </Typography>
            <Typography component="div" sx={backBodySx}>Concluídas: {planoAcao.concluidas}</Typography>
            <Typography component="div" sx={backBodySx}>Em andamento: {planoAcao.emAndamento}</Typography>
            <Typography component="div" sx={backBodySx}>Atrasadas: {planoAcao.atrasadas}</Typography>
            <Typography component="div" sx={backBodySx}>Com prioridade: {planoAcao.comPrioridade}</Typography>
          </Stack>
        );
      case "politicas":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Políticas e documentos (catálogo)
            </Typography>
            <Typography component="div" sx={backBodySx}>Implementadas: {politicas.implementadas}</Typography>
            <Typography component="div" sx={backBodySx}>Não implementadas: {politicas.naoImplementadas}</Typography>
            <Typography component="div" sx={{ ...backBodySx, color: "text.secondary", mt: 0.25 }}>
              Tipos no catálogo: {politicas.catalogoTipos}
            </Typography>
          </Stack>
        );
      case "portal-privacidade":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Titulares e público
            </Typography>
            <Typography component="div" sx={backBodySx}>Pedidos titulares: {portal.pedidosTitulares}</Typography>
            <Typography component="div" sx={backBodySx}>Reportes: {portal.reportes}</Typography>
            <Typography component="div" sx={backBodySx}>Contato: {portal.contato}</Typography>
          </Stack>
        );
      case "usuarios":
        return (
          <Stack spacing={0.75}>
            <Typography component="div" sx={backHeadingSx}>
              Acesso
            </Typography>
            <Typography component="div" sx={backBodySx}>Utilizadores: {responsabilidades.usuarios}</Typography>
          </Stack>
        );
      case "auditoria":
        return (
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Typography component="div" sx={backHeadingSx}>
              Últimas atividades
            </Typography>
            {auditoria.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={backBodySx}>
                Nenhum registo recente.
              </Typography>
            ) : (
              auditoria.map((a) => (
                <Typography key={a.id} sx={{ ...backBodySx, fontSize: "0.875rem", lineHeight: 1.4 }}>
                  {formatActivityLine(a)}
                </Typography>
              ))
            )}
          </Stack>
        );
      default:
        return null;
    }
  };

  const faceSx = {
    position: "absolute" as const,
    inset: 0,
    backfaceVisibility: "hidden" as const,
    WebkitBackfaceVisibility: "hidden" as const,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between" as const,
    p: 3,
    pt: 3.5,
  };

  const flipTransform = showBack ? "rotateY(180deg)" : "rotateY(0deg)";
  const innerMotion = prefersReducedMotion
    ? { opacity: showBack ? 0 : 1, transition: "opacity 0.2s ease" }
    : { transform: flipTransform, transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)" };

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s",
        ...(highlight && {
          transform: "translateY(-8px)",
          boxShadow: `0 14px 32px ${alpha(section.color, 0.45)}`,
          outline: `2px solid ${alpha(section.color, 0.65)}`,
          outlineOffset: 2,
          zIndex: 1,
        }),
        ...(!highlight &&
          canHover && {
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: `0 12px 24px ${alpha(section.color, 0.3)}`,
            },
          }),
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: section.gradient,
          zIndex: 2,
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={navigateHref}
        sx={{
          flex: 1,
          minWidth: 0,
          alignItems: "stretch",
          justifyContent: "flex-start",
          display: "block",
        }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: CARD_CONTENT_MIN_HEIGHT_PX,
            perspective: prefersReducedMotion ? "none" : "1000px",
          }}
        >
          {prefersReducedMotion ? (
            <Box sx={{ position: "relative", minHeight: CARD_CONTENT_MIN_HEIGHT_PX }}>
              <Box
                sx={{
                  ...innerMotion,
                  position: "relative",
                  minHeight: CARD_CONTENT_MIN_HEIGHT_PX,
                  opacity: showBack ? 0 : 1,
                  pointerEvents: showBack ? "none" : "auto",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    py: 3,
                    px: 3,
                    minHeight: CARD_CONTENT_MIN_HEIGHT_PX,
                    justifyContent: "space-between",
                    "&:last-child": { pb: 3 },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, color: section.color }}>
                      {section.icon}
                      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.25 }}>
                        {section.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6, wordBreak: "break-word" }}
                    >
                      {section.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", color: section.color, fontWeight: "bold", mt: 2 }}>
                    <Typography variant="button" sx={{ fontWeight: "bold" }}>
                      Acessar
                    </Typography>
                    <Box sx={{ ml: 1 }}>→</Box>
                  </Box>
                </CardContent>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: showBack ? 1 : 0,
                  pointerEvents: showBack ? "auto" : "none",
                  transition: "opacity 0.2s ease",
                  p: 3,
                  pt: 3.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  overflow: "auto",
                }}
              >
                {renderBack()}
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                minHeight: CARD_CONTENT_MIN_HEIGHT_PX,
                transformStyle: "preserve-3d",
                ...innerMotion,
              }}
            >
              <Box sx={{ ...faceSx, transform: "rotateY(0deg)" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, color: section.color }}>
                    {section.icon}
                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.25 }}>
                      {section.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6, wordBreak: "break-word" }}
                  >
                    {section.description}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", color: section.color, fontWeight: "bold", mt: 2 }}>
                  <Typography variant="button" sx={{ fontWeight: "bold" }}>
                    Acessar
                  </Typography>
                  <Box sx={{ ml: 1 }}>→</Box>
                </Box>
              </Box>
              <Box
                sx={{
                  ...faceSx,
                  transform: "rotateY(180deg)",
                  overflow: "auto",
                }}
              >
                {renderBack()}
              </Box>
            </Box>
          )}
        </Box>
      </CardActionArea>

      <Tooltip title={showBack ? "Clique para fixar o verso ou voltar" : "Passe o mouse na faixa ou clique para o resumo"} placement="left">
        <Box
          component="div"
          onMouseEnter={handleStripEnter}
          onMouseLeave={handleStripLeave}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
            width: MODULO_FLIP_STRIP_WIDTH_PX,
            alignSelf: "stretch",
            bgcolor: stripHovered ? alpha(theme.palette.action.hover, 0.12) : alpha(theme.palette.action.hover, 0.06),
            transition: "background-color 0.2s ease",
          }}
        >
          <IconButton
            size="small"
            aria-pressed={showBack}
            aria-label={
              showBack
                ? "Ocultar resumo e mostrar descrição do módulo"
                : "Mostrar resumo do módulo (passe o mouse na faixa ou clique)"
            }
            onClick={handleToggle}
            sx={{ borderRadius: 1 }}
          >
            <ReplyIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>
    </Card>
  );
}
