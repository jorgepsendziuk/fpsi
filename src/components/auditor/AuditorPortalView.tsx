"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { landing } from "@/components/landing/landingTokens";
import { PORTAL_AUDITOR_INTRO } from "@/content/governancaAvancadaOrientacao";
import { AUDITOR_SECOES, type AuditorSecaoId } from "@/lib/auditor/auditorPortalSecoes";
import type {
  AuditorDiagnostico,
  AuditorListaItem,
  AuditorPortalPayload,
} from "@/lib/auditor/auditorPortal";
import { formatMaturityIndex } from "@/lib/utils/maturity";

const SECAO_ICON: Record<AuditorSecaoId, React.ReactNode> = {
  evidencias: <FolderSpecialOutlinedIcon fontSize="small" />,
  politicas: <PolicyOutlinedIcon fontSize="small" />,
  ropa: <Inventory2OutlinedIcon fontSize="small" />,
  ripds: <AssessmentOutlinedIcon fontSize="small" />,
  riscos: <WarningAmberOutlinedIcon fontSize="small" />,
  incidentes: <ReportOutlinedIcon fontSize="small" />,
  decisoes: <GavelOutlinedIcon fontSize="small" />,
  timeline: <TimelineOutlinedIcon fontSize="small" />,
  planos: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  ciencias: <FactCheckOutlinedIcon fontSize="small" />,
};

/** Data estável (UTC) para não divergir SSR/cliente. */
function fmtData(iso?: string | null) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return String(iso).slice(0, 10);
  const [, y, mo, d, hh, mm] = m;
  return hh ? `${d}/${mo}/${y} ${hh}:${mm}` : `${d}/${mo}/${y}`;
}

function AuditorChrome({
  children,
  validade,
}: {
  children: React.ReactNode;
  validade?: string | null;
}) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: landing.paper, color: landing.text }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: landing.navy,
          color: landing.heroText,
          borderBottom: `1px solid ${alpha("#fff", 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 64,
            px: { xs: 1.5, md: 3 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Box
              component="img"
              src="/logo_p.png"
              alt="FPSI"
              sx={{ width: 32, height: 32, display: "block" }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} letterSpacing="-0.03em" lineHeight={1.1} suppressHydrationWarning>
                FPSI
              </Typography>
              <Typography variant="caption" sx={{ color: landing.heroMuted, display: "block", lineHeight: 1.2 }}>
                Portal do auditor
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip
            size="small"
            icon={<LockOutlinedIcon sx={{ fontSize: "16px !important", color: "inherit" }} />}
            label="Somente leitura"
            sx={{
              bgcolor: alpha(landing.lock, 0.2),
              color: landing.heroText,
              border: `1px solid ${alpha(landing.lock, 0.45)}`,
              fontWeight: 600,
            }}
          />
          {validade ? (
            <Typography variant="caption" sx={{ color: landing.heroMuted, display: { xs: "none", sm: "block" } }}>
              Acesso até {fmtData(validade)}
            </Typography>
          ) : null}
        </Box>
      </Box>
      {children}
    </Box>
  );
}

export function AuditorPortalLoading() {
  return (
    <AuditorChrome>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    </AuditorChrome>
  );
}

export function AuditorPortalError({ message }: { message: string }) {
  return (
    <AuditorChrome>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{message}</Alert>
      </Container>
    </AuditorChrome>
  );
}

function MaturityCard({ d }: { d: AuditorDiagnostico }) {
  const fmt = formatMaturityIndex(d.score);
  const color = fmt?.color ?? landing.muted;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${landing.line}`,
        borderLeft: `4px solid ${color}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, #fff 62%)`,
      }}
    >
      <Typography variant="overline" sx={{ color: landing.muted, letterSpacing: "0.06em", fontWeight: 700 }}>
        {d.indice}
      </Typography>
      <Typography fontWeight={700} sx={{ lineHeight: 1.25, mb: 0.75 }}>
        {d.nome}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
        {fmt?.indexText ?? "—"}
        <Box component="span" sx={{ color: landing.muted, fontWeight: 600, fontSize: "0.45em", ml: 0.75 }}>
          · {fmt?.label || d.nivel}
        </Box>
      </Typography>
      {fmt ? (
        <Typography variant="caption" sx={{ color: landing.muted }}>
          Nível {fmt.levelId} de 5
        </Typography>
      ) : (
        <Typography variant="caption" sx={{ color: landing.muted }}>
          Sem diagnóstico respondido neste eixo
        </Typography>
      )}
    </Paper>
  );
}

function KpiCard({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  color: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${landing.line}`,
        borderTop: `3px solid ${color}`,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ color: landing.muted }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ color, letterSpacing: "-0.03em", my: 0.25 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: landing.muted, display: "block", lineHeight: 1.35 }}>
        {hint}
      </Typography>
    </Paper>
  );
}

function downloadHref(token: string, id: string | number) {
  return `/api/auditor/${encodeURIComponent(token)}/evidencias/${encodeURIComponent(String(id))}`;
}

function ItemCard({
  item,
  evidencias,
  token,
  onDetalhe,
}: {
  item: AuditorListaItem;
  evidencias?: boolean;
  token: string;
  onDetalhe: () => void;
}) {
  const data = fmtData(item.data);
  const baixar = evidencias && item.baixavel && token;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 2,
        border: `1px solid ${landing.line}`,
        bgcolor: landing.mist,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
        <Typography fontWeight={700} sx={{ flex: 1, minWidth: 160 }}>
          {item.titulo}
        </Typography>
        {item.status ? <Chip size="small" label={item.status} sx={{ height: 22 }} /> : null}
        {data ? (
          <Typography variant="caption" sx={{ color: landing.muted }}>
            {data}
          </Typography>
        ) : null}
      </Stack>
      {item.descricao && !evidencias ? (
        <Typography variant="body2" sx={{ mt: 0.75, color: landing.text }}>
          {item.descricao.length > 220 ? `${item.descricao.slice(0, 219)}…` : item.descricao}
        </Typography>
      ) : null}
      {item.detalhe && !evidencias ? (
        <Typography variant="body2" sx={{ mt: 0.5, color: landing.muted }}>
          {item.detalhe}
        </Typography>
      ) : null}
      {item.tags?.length ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {item.tags.map((t) => (
            <Chip key={t} size="small" variant="outlined" label={t} sx={{ height: 22, bgcolor: "#fff" }} />
          ))}
        </Stack>
      ) : null}
      {evidencias ? (
        item.vinculos?.length ? (
          <Stack spacing={0.75} sx={{ mt: 1.25 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: landing.navy }}>
              Esta evidência demonstra
            </Typography>
            {item.vinculos.slice(0, 2).map((v, i) => (
              <Box
                key={`${v.tipo}-${i}`}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "#fff",
                  border: `1px solid ${landing.line}`,
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {v.rotulo}
                </Typography>
                {v.contexto ? (
                  <Typography variant="caption" display="block" sx={{ color: landing.muted, mt: 0.25 }}>
                    {v.contexto}
                  </Typography>
                ) : null}
                {v.norma ? (
                  <Chip
                    size="small"
                    label={v.norma}
                    sx={{ mt: 0.5, height: 20, fontSize: "0.7rem", bgcolor: alpha(landing.blue, 0.1) }}
                  />
                ) : null}
              </Box>
            ))}
            {item.vinculos.length > 2 ? (
              <Typography variant="caption" sx={{ color: landing.muted }}>
                +{item.vinculos.length - 2} vínculo(s) — abra os detalhes
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ mt: 1.25, py: 0 }}>
            Ainda não há vínculo com medida, controle ou norma. O arquivo pode ser baixado; peça o
            contexto ao responsável.
          </Alert>
        )
      ) : null}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
        {baixar ? (
          <Button
            size="small"
            variant="contained"
            startIcon={item.arquivoTipo === "link" ? <OpenInNewOutlinedIcon /> : <DownloadOutlinedIcon />}
            href={downloadHref(token, item.id)}
            target="_blank"
            rel="noopener"
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: landing.navy }}
          >
            {item.arquivoTipo === "link" ? "Abrir evidência" : "Baixar evidência"}
          </Button>
        ) : null}
        <Button
          size="small"
          variant="outlined"
          startIcon={<InfoOutlinedIcon />}
          onClick={onDetalhe}
          sx={{ textTransform: "none", fontWeight: 700, borderColor: landing.navy, color: landing.navy }}
        >
          Ver detalhes
        </Button>
      </Stack>
    </Paper>
  );
}

function ItemDetalheDialog({
  item,
  token,
  onClose,
}: {
  item: AuditorListaItem | null;
  token: string;
  onClose: () => void;
}) {
  if (!item) return null;
  const data = fmtData(item.data);
  const baixar = item.baixavel && token;
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, pr: 2 }}>{item.titulo}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          {item.status ? <Chip size="small" label={item.status} /> : null}
          {data ? <Chip size="small" variant="outlined" label={data} /> : null}
          {item.categoria ? <Chip size="small" variant="outlined" label={item.categoria} /> : null}
        </Stack>
        {item.tags?.length ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {item.tags.map((t) => (
              <Chip key={t} size="small" variant="outlined" label={t} />
            ))}
          </Stack>
        ) : null}
        {item.descricao ? (
          <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}>
            {item.descricao}
          </Typography>
        ) : null}
        {item.detalhe ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {item.detalhe}
          </Typography>
        ) : null}
        {item.campos?.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
              gap: 0.75,
              mb: 1.5,
            }}
          >
            {item.campos.map((c) => (
              <React.Fragment key={c.rotulo}>
                <Typography variant="caption" fontWeight={700} sx={{ color: landing.muted }}>
                  {c.rotulo}
                </Typography>
                <Typography variant="body2">{c.valor}</Typography>
              </React.Fragment>
            ))}
          </Box>
        ) : null}
        {item.vinculos?.length ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={800}>
              O que esta evidência demonstra
            </Typography>
            {item.vinculos.map((v, i) => (
              <Box
                key={`${v.tipo}-${i}`}
                sx={{ p: 1.25, borderRadius: 1.5, border: `1px solid ${landing.line}`, bgcolor: landing.mist }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {v.rotulo}
                </Typography>
                {v.contexto ? (
                  <Typography variant="body2" sx={{ mt: 0.5, color: landing.muted }}>
                    {v.contexto}
                  </Typography>
                ) : null}
                {v.norma ? <Chip size="small" label={v.norma} sx={{ mt: 0.75, height: 22 }} /> : null}
              </Box>
            ))}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, gap: 1, justifyContent: "space-between" }}>
        {baixar ? (
          <Button
            variant="contained"
            startIcon={item.arquivoTipo === "link" ? <OpenInNewOutlinedIcon /> : <DownloadOutlinedIcon />}
            href={downloadHref(token, item.id)}
            target="_blank"
            rel="noopener"
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: landing.navy }}
          >
            {item.arquivoTipo === "link" ? "Abrir evidência" : "Baixar evidência"}
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AuditorPortalView({ data, token }: { data: AuditorPortalPayload; token: string }) {
  const [itemAberto, setItemAberto] = useState<AuditorListaItem | null>(null);
  const r = data.resumo;
  const mediaFmt = formatMaturityIndex(r.maturidadeMedia);
  const byId: Record<AuditorSecaoId, AuditorListaItem[]> = {
    evidencias: data.evidencias,
    politicas: data.politicas,
    ropa: data.ropa,
    ripds: data.ripds,
    riscos: data.riscos,
    incidentes: data.incidentes,
    decisoes: data.decisoes,
    timeline: data.timeline,
    planos: data.planos,
    ciencias: data.ciencias,
  };

  return (
    <AuditorChrome validade={data.expires_at}>
      <Box
        sx={{
          bgcolor: landing.navy,
          color: landing.heroText,
          pt: { xs: 3, md: 5 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <VerifiedUserOutlinedIcon sx={{ color: landing.lock }} />
            <Typography variant="overline" sx={{ letterSpacing: "0.12em", color: landing.heroMuted }}>
              {PORTAL_AUDITOR_INTRO.titulo} · due diligence · somente leitura
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.03em" sx={{ mb: 1 }}>
            {data.programa.nome}
          </Typography>
          <Typography sx={{ color: landing.heroMuted, maxWidth: 760, mb: 2 }}>
            {PORTAL_AUDITOR_INTRO.lead}
          </Typography>
          {(data.programa.dpoNome || data.programa.dpoEmail) && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <PersonOutlineIcon fontSize="small" />
              <Typography variant="body2">
                Encarregado (art. 41 LGPD): <strong>{data.programa.dpoNome || "—"}</strong>
                {data.programa.dpoEmail ? ` · ${data.programa.dpoEmail}` : ""}
              </Typography>
            </Stack>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -6 }, pb: 8 }}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: `1px solid ${landing.line}`, mb: 2.5 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                Maturidade por diagnóstico
              </Typography>
              <Typography variant="body2" sx={{ color: landing.muted }}>
                A média resume os quatro eixos PPSI (iMC₀, iSeg, iPriv, iAIGP). Cada card é o índice daquele
                diagnóstico — não um percentual.
              </Typography>
            </Box>
            <Chip
              label={mediaFmt ? `Média ${mediaFmt.indexText} · ${mediaFmt.label}` : "Média indisponível"}
              sx={{
                fontWeight: 700,
                bgcolor: alpha(mediaFmt?.color || landing.blue, 0.12),
                color: mediaFmt?.color || landing.navy,
                border: `1px solid ${alpha(mediaFmt?.color || landing.blue, 0.3)}`,
              }}
            />
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 1.5,
            }}
          >
            {(data.diagnosticos || []).map((d) => (
              <MaturityCard key={d.diagnosticoId} d={d} />
            ))}
          </Box>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <KpiCard
            label="Riscos críticos"
            value={r.riscosCriticos}
            hint="Score residual ≥ 12 ainda abertos"
            color="#C62828"
          />
          <KpiCard
            label="Incidentes"
            value={r.incidentesAbertos}
            hint="Em análise ou comunicados à ANPD/titulares"
            color="#EF6C00"
          />
          <KpiCard
            label="Evidências"
            value={r.evidencias}
            hint="Provas ativas vinculadas a controles e medidas"
            color={landing.blue}
          />
          <KpiCard
            label="Decisões"
            value={r.decisoes}
            hint="Decision log formal (não é clique no sistema)"
            color={landing.navy}
          />
          <KpiCard
            label="Políticas"
            value={r.politicasPublicadas}
            hint="Documentos publicados (PPSI 0.9–0.12)"
            color="#00897B"
          />
          <KpiCard
            label="ROPA / mapeamento"
            value={r.ropaOperacoes || r.mapeamentos}
            hint="Operações de tratamento (LGPD art. 37)"
            color={landing.blueBright}
          />
          <KpiCard
            label="Planos abertos"
            value={r.planosAbertos}
            hint="Ações do plano de trabalho ainda não concluídas"
            color="#1565C0"
          />
          <KpiCard
            label="Pedidos de titulares"
            value={r.pedidosTitularesAbertos}
            hint="Só a quantidade — identidade e conteúdo não entram neste link"
            color={landing.lock}
          />
        </Box>

        {AUDITOR_SECOES.map((s) => {
          const items = byId[s.id] || [];
          return (
            <Accordion
              key={s.id}
              defaultExpanded={s.id === "evidencias" && items.length > 0}
              disableGutters
              sx={{
                mb: 1.5,
                borderRadius: "12px !important",
                overflow: "hidden",
                border: `1px solid ${landing.line}`,
                borderLeft: `4px solid ${s.cor}`,
                boxShadow: "none",
                "&:before": { display: "none" },
                bgcolor: "#fff",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, py: 0.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%", pr: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(s.cor, 0.12),
                      color: s.cor,
                      flexShrink: 0,
                    }}
                  >
                    {SECAO_ICON[s.id]}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography fontWeight={800}>{s.titulo}</Typography>
                      <Chip size="small" label={items.length} sx={{ height: 20, fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: landing.muted }}>
                      {s.norma}
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Alert
                  severity="info"
                  icon={false}
                  sx={{ mb: 1.5, bgcolor: alpha(s.cor, 0.06), border: `1px solid ${alpha(s.cor, 0.18)}` }}
                >
                  <Typography variant="body2">{s.paraQueServe}</Typography>
                </Alert>
                {items.length === 0 ? (
                  <Typography variant="body2" sx={{ color: landing.muted, px: 0.5 }}>
                    Nenhum registro neste recorte.
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {items.map((it) => (
                      <ItemCard
                        key={String(it.id)}
                        item={it}
                        evidencias={s.id === "evidencias"}
                        token={token}
                        onDetalhe={() => setItemAberto(it)}
                      />
                    ))}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Alert severity="warning" sx={{ mt: 2 }}>
          Este portal não permite alterações. Solicite evidências adicionais ao responsável do programa.
          Pedidos de titulares aparecem só como quantidade — o conteúdo e a identidade não são expostos.
        </Alert>
      </Container>
      <ItemDetalheDialog item={itemAberto} token={token} onClose={() => setItemAberto(null)} />
    </AuditorChrome>
  );
}
