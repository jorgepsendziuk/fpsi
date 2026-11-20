"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  GlobalStyles,
  Link as MuiLink,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  alpha,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BlockIcon from "@mui/icons-material/Block";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { sanitizePanoramaResponsavelNome } from "@/lib/panorama/sanitizePanoramaEncarregado";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import PanoramaDocumentHeader from "@/components/diagnostico/panorama/PanoramaDocumentHeader";
import PanoramaIntroducao from "@/components/diagnostico/panorama/PanoramaIntroducao";
import {
  PANORAMA_CELULA_ESTREITA,
  PanoramaNivelCelulaComIcone,
  panoramaNivelFromPlano,
  panoramaNivelFromRisco,
  panoramaNivelRowSx,
  PanoramaNivelIcon,
} from "@/components/diagnostico/panorama/panoramaNivelVisual";
import { getPrioridadeDisplayName, PrioridadePlano } from "@/lib/types/planoAcao";
import { RiscoHeatmap } from "@/components/riscos/RiscoHeatmap";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { useProgramaAccess } from "@/hooks/useProgramaAccess";
import * as dataService from "@/lib/services/dataService";
import type { ProgramaRiscoRow } from "@/lib/services/dataService";
import type { PanoramaSnapshot } from "@/lib/panorama/buildPanoramaSnapshot";
import type { PoliticaProgramaDados } from "@/lib/utils/politicaPlaceholders";
import { getDiagnosticoTheme } from "@/lib/utils/diagnosticoThemes";

const DOC_TITLE = "Panorama inicial de privacidade";

type ApiResponse = { snapshot: PanoramaSnapshot };

/** Data ISO (YYYY-MM-DD ou timestamp) → dd/mm/aaaa */
function formatDataBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const s = String(iso).trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return String(iso);
  }
}

function formatIndiceExemplos(exemplos: string[]): string {
  return exemplos.join(" · ");
}

function IndiceItemIcon({ chave }: { chave: string }) {
  const isPendencia = chave === "encarregado";
  const Icon = isPendencia ? ScheduleOutlinedIcon : TaskAltOutlinedIcon;
  return (
    <Icon
      aria-hidden
      sx={{
        fontSize: { xs: 17, print: 13 },
        color: isPendencia ? "warning.main" : "success.main",
        mt: { xs: 0.2, print: 0.1 },
        flexShrink: 0,
        "@media print": { color: isPendencia ? "#b26a00" : "#2e7d32" },
      }}
    />
  );
}

export default function PanoramaInicialPage() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const { isFull, loading: accessLoading } = useProgramaAccess(programaId ?? undefined);

  const [snapshot, setSnapshot] = useState<PanoramaSnapshot | null>(null);
  const [programa, setPrograma] = useState<PoliticaProgramaDados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Oculta a fita global “Beta” (layout) neste relatório — tela e impressão. */
  useEffect(() => {
    document.body.classList.add("panorama-document");
    return () => document.body.classList.remove("panorama-document");
  }, []);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const [res, prog] = await Promise.all([
        fetch(`/api/programas/${programaId}/panorama`),
        dataService.fetchProgramaById(programaId),
      ]);
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao carregar panorama");
      const data = (await res.json()) as ApiResponse;
      setSnapshot(data.snapshot);
      setPrograma((prog as PoliticaProgramaDados) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const riscosHeatmap: ProgramaRiscoRow[] = useMemo(() => {
    if (!snapshot || !programaId) return [];
    return snapshot.riscos.map((r) => ({
      id: r.id,
      programa_id: programaId,
      titulo: r.titulo,
      descricao: r.descricao,
      categoria: r.categoria || "conformidade",
      origem_tipo: null,
      origem_id: null,
      probabilidade: r.probabilidade,
      impacto: r.impacto,
      score_inerente: r.score_inerente,
      score_residual: r.score_residual,
      status: r.status,
      estrategia_mitigacao: r.estrategia_mitigacao,
      responsavel: null,
      data_revisao: null,
      created_at: "",
      updated_at: "",
    }));
  }, [snapshot, programaId]);

  const indiceEntregas = snapshot?.indiceEntregas ?? [];

  if (idLoading || accessLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isFull) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">O Panorama inicial está disponível para gestores do programa.</Alert>
      </Box>
    );
  }

  const b = snapshot?.badges;

  const totalMedidas = b?.totalMedidas ?? snapshot?.existencias.medidasTotal ?? 0;

  return (
    <>
      <GlobalStyles
        styles={{
          "body.panorama-document > div:has(> span[style*='vertical-rl'])": {
            display: "none !important",
          },
          "#panorama-print-root.panorama-document-root": {
            textAlign: "justify",
          },
          "#panorama-print-root.panorama-document-root .MuiTypography-root": {
            textAlign: "justify !important",
          },
          "#panorama-print-root.panorama-document-root .MuiTableCell-root": {
            textAlign: "justify !important",
          },
          "#panorama-print-root.panorama-document-root .MuiLink-root": {
            textAlign: "justify !important",
          },
          "#panorama-print-root.panorama-document-root li": {
            textAlign: "justify",
          },
          "#panorama-print-root.panorama-document-root .panorama-text-center, #panorama-print-root.panorama-document-root .panorama-text-center .MuiTypography-root":
            {
              textAlign: "center !important",
            },
          "#panorama-print-root.panorama-document-root .panorama-text-left, #panorama-print-root.panorama-document-root .panorama-text-left .MuiTypography-root, #panorama-print-root.panorama-document-root .panorama-text-left .MuiLink-root":
            {
              textAlign: "left !important",
            },
          "#panorama-print-root.panorama-document-root .panorama-intro, #panorama-print-root.panorama-document-root .panorama-intro .MuiTypography-root":
            {
              textAlign: "left !important",
            },
          "#panorama-print-root.panorama-document-root .MuiTableCell-alignCenter": {
            textAlign: "center !important",
          },
          "#panorama-print-root.panorama-document-root .MuiTypography-alignCenter": {
            textAlign: "center !important",
          },
          "#panorama-print-root.panorama-document-root .MuiChip-label": {
            textAlign: "center !important",
          },
          "#panorama-sec-riscos .panorama-celula-estreita, #panorama-sec-planos .panorama-celula-estreita, #panorama-sec-sistemas .panorama-celula-estreita, #panorama-sec-decisao .panorama-celula-estreita":
            {
              textAlign: "left !important",
            },
          "@media print": {
            ".MuiAppBar-root": { display: "none !important" },
            ".no-print": { display: "none !important" },
            ".panorama-screen-only": { display: "none !important" },
            body: { background: "#fff !important", fontSize: "11pt" },
            "#panorama-print-root": {
              maxWidth: "100% !important",
              padding: "0 !important",
            },
            "#panorama-print-root .panorama-doc-header-cols": {
              display: "grid !important",
              gridTemplateColumns: "minmax(0, 7fr) minmax(0, 3fr) !important",
              width: "100% !important",
              maxWidth: "100% !important",
            },
            "#panorama-print-root .panorama-doc-header-col-programa, #panorama-print-root .panorama-doc-header-col-fpsi":
              {
                minWidth: "0 !important",
                maxWidth: "100% !important",
              },
            "#panorama-print-root .MuiPaper-outlined": {
              border: "1px solid #ccc !important",
              boxShadow: "none !important",
            },
            "#panorama-print-root .MuiTableCell-root": {
              whiteSpace: "normal !important",
              wordBreak: "break-word",
              overflow: "visible !important",
              textOverflow: "clip !important",
            },
            "#panorama-fold-one": {
              fontSize: "9.5pt",
            },
            "#panorama-fold-one .panorama-resumo-section": {
              padding: "6px 10px !important",
              marginBottom: "0 !important",
            },
            "#panorama-fold-one .panorama-resumo-section .MuiTypography-h6": {
              fontSize: "11pt !important",
              marginBottom: "4px !important",
            },
            "#panorama-fold-one .panorama-resumo-lead": {
              fontSize: "9pt !important",
              lineHeight: "1.35 !important",
              marginBottom: "4px !important",
            },
            "#panorama-fold-one .panorama-resumo-linhas": {
              display: "grid !important",
              gridTemplateColumns: "1fr 1fr",
              columnGap: "10px",
              rowGap: "3px",
            },
            "#panorama-fold-one .panorama-resumo-linha .MuiTypography-body1": {
              fontSize: "8.5pt !important",
              lineHeight: "1.25 !important",
            },
            "#panorama-fold-one .panorama-resumo-linha .MuiTypography-body2": {
              fontSize: "8pt !important",
              lineHeight: "1.3 !important",
            },
            "#panorama-fold-one .panorama-urgencias-box": {
              marginTop: "6px !important",
              padding: "6px 8px !important",
            },
            "#panorama-fold-one .panorama-urgencias-box .MuiTypography-subtitle2": {
              fontSize: "8.5pt !important",
            },
            "#panorama-fold-one .panorama-urgencias-box .MuiTypography-body2": {
              fontSize: "8pt !important",
              lineHeight: "1.3 !important",
            },
            "#panorama-print-root .panorama-indice-section": {
              padding: "8px 10px !important",
              marginBottom: "8px !important",
            },
            "#panorama-print-root .panorama-indice-lista": {
              fontSize: "8pt !important",
            },
          },
        }}
      />

      <Box
        id="panorama-print-root"
        className="panorama-document-root"
        sx={{
          p: { xs: 2, md: 3 },
          maxWidth: 980,
          mx: "auto",
          fontSize: { xs: "0.95rem", md: "1rem", print: "11pt" },
        }}
      >
        <Box className="no-print">
          <PageHeroHeader
            title="Panorama inicial"
            description="Documento de situação para entrega ao cliente"
          />
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Imprimir / PDF
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} className="no-print">
            {error}
          </Alert>
        )}

        <Box id="panorama-fold-one" sx={{ breakInside: "avoid" }}>
          <PanoramaDocumentHeader
            programa={programa}
            docTitle={DOC_TITLE}
            geradoEm={snapshot?.geradoEm}
          />

          <PanoramaIntroducao />

          {b && (
            <Section title="Resumo do diagnóstico (perguntas do PPSI)" className="panorama-resumo-section">
            <Typography variant="body1" paragraph className="panorama-resumo-lead" sx={{ lineHeight: { xs: 1.6, print: 1.4 }, mb: { print: 0.75 } }}>
              O diagnóstico deste programa tem <strong>{totalMedidas} perguntas</strong> do framework (governança,
              segurança, privacidade e, quando ativo, IA). Cada pergunta recebe uma nota ou fica em branco. Os números
              abaixo contam <strong>perguntas</strong>, não riscos nem planos — exceto o último bloco, que mistura
              riscos e planos urgentes.
            </Typography>
            <Stack spacing={1.25} className="panorama-resumo-linhas" sx={{ mb: 0 }}>
              <ResumoLinha
                icon={<CheckCircleOutlineIcon color="success" fontSize="small" />}
                titulo={`Já registrado: ${b.jaRegistrado}`}
                texto="Resposta indica que o requisito está atendido (Sim no eixo governança, ou níveis 1–2 de maturidade nos demais eixos)."
              />
              <ResumoLinha
                icon={<WarningAmberIcon color="warning" fontSize="small" />}
                titulo={`Atenção: ${b.atencao}`}
                texto="Adoção parcial (nível 3): há algo registrado, mas ainda falta confirmação ou completar."
              />
              <ResumoLinha
                icon={<PriorityHighIcon color="error" fontSize="small" />}
                titulo={`Lacuna: ${b.lacunas}`}
                texto="Resposta indica que o requisito não está atendido (Não no binário, ou níveis 4–5 de maturidade)."
              />
              <ResumoLinha
                icon={<HelpOutlineIcon fontSize="small" />}
                titulo={`Ainda não avaliado: ${b.naoAvaliado}`}
                texto="Pergunta sem resposta neste programa — não significa que o partido não faz; só que ainda não foi notada aqui."
              />
              <ResumoLinha
                icon={<BlockIcon fontSize="small" />}
                titulo={`Não se aplica: ${b.naoSeAplica}`}
                texto="Marcada como fora do escopo (por exemplo, requisitos típicos de órgão público)."
              />
            </Stack>
            <Box
              className="panorama-urgencias-box"
              sx={{
                mt: { xs: 2, print: 1 },
                p: { xs: 1.5, print: 1 },
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.error.main, 0.06),
                border: 1,
                borderColor: (t) => alpha(t.palette.error.main, 0.2),
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                Urgências fora do quadro acima: {b.prioridadeAlta}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
                Não são perguntas do diagnóstico. São{" "}
                <strong>{b.riscosPrioridadeAlta} risco(s)</strong> em aberto com pontuação alta (≥ 12) e{" "}
                <strong>{b.planosCriticos} plano(s)</strong> com prioridade crítica já cadastrados.
              </Typography>
            </Box>
          </Section>
          )}
        </Box>

        <Section
          title="O que já existe"
          sectionId="panorama-sec-entregas"
          className="panorama-indice-section"
          titleIcon={<PlaylistAddCheckOutlinedIcon fontSize="inherit" />}
        >
          {indiceEntregas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
              Ainda não há entregas cadastradas que alimentem as seções deste relatório.
            </Typography>
          ) : (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.45, mb: { xs: 1.25, print: 0.5 }, fontSize: { print: "8.5pt" } }}
              >
                Índice do que já está mapeado no FPSI — cada item remete ao detalhe nas páginas seguintes.
              </Typography>
              <Stack
                component="ul"
                spacing={{ xs: 1, print: 0.35 }}
                className="panorama-indice-lista"
                sx={{ m: 0, p: 0, listStyle: "none", fontSize: { xs: "0.92rem", print: "8.5pt" } }}
              >
                {indiceEntregas.map((item) => (
                  <Box
                    component="li"
                    key={item.chave}
                    sx={{ display: "flex", gap: { xs: 0.75, print: 0.5 }, alignItems: "flex-start" }}
                  >
                    <IndiceItemIcon chave={item.chave} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography component="span" fontWeight={700} sx={{ fontSize: "inherit" }}>
                      {item.titulo}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: "inherit" }}>
                      {" — "}
                      {item.jaEntregue}
                    </Typography>
                    {item.secaoAnchor ? (
                      <>
                        {" "}
                        <MuiLink
                          href={`#${item.secaoAnchor}`}
                          underline="hover"
                          className="panorama-screen-only"
                          sx={{ fontSize: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                          Ir à seção
                        </MuiLink>
                        <Typography
                          component="span"
                          color="text.secondary"
                          sx={{ display: { xs: "none", print: "inline" }, fontSize: "inherit" }}
                        >
                          {" "}
                          (seção abaixo:{" "}
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {item.titulo}
                          </Box>
                          )
                        </Typography>
                      </>
                    ) : null}
                    {item.exemplos && item.exemplos.length > 0 ? (
                      <Typography
                        component="div"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: { xs: 0.2, print: 0.1 },
                          lineHeight: { xs: 1.4, print: 1.3 },
                          fontSize: { print: "8pt" },
                        }}
                      >
                        {formatIndiceExemplos(item.exemplos)}
                      </Typography>
                    ) : null}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Section>

        {snapshot && snapshot.sistemasInventario.length > 0 && (
          <Section
            title="Inventário de sistemas"
            sectionId="panorama-sec-sistemas"
            className="panorama-sistemas-section"
            titleIcon={<StorageOutlinedIcon fontSize="inherit" />}
          >
            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.55, fontSize: "0.95rem" }}>
              Itens cadastrados em Ativos → Sistemas neste programa. Inclui o que foi observado no site público, serviços
              de terceiros e entradas em aberto (A VALIDAR) para o partido confirmar — não são necessariamente quinze
              aplicativos internos distintos.
            </Typography>
            <Stack spacing={{ xs: 1.5, print: 1 }} className="panorama-sistemas-lista">
              {snapshot.sistemasInventario.map((s) => (
                <Box
                  key={s.id}
                  className="panorama-sistema-bloco"
                  sx={{
                    p: { xs: 1.5, print: 1 },
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    breakInside: "avoid",
                    "@media print": { borderColor: "#ccc" },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1.35fr 1fr 0.7fr" },
                      columnGap: { xs: 1, print: 1.25 },
                      rowGap: { xs: 1, print: 0.5 },
                      alignItems: "start",
                    }}
                  >
                    <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        display="block"
                        sx={{ mb: 0.25 }}
                      >
                        Sistema / ativo
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <ComputerOutlinedIcon
                          aria-hidden
                          sx={{
                            fontSize: { xs: 18, print: 14 },
                            color: "primary.main",
                            mt: 0.15,
                            flexShrink: 0,
                            opacity: 0.85,
                            "@media print": { color: "#1565c0" },
                          }}
                        />
                        <Typography fontWeight={600} sx={{ lineHeight: 1.45, wordBreak: "break-word", fontSize: "inherit" }}>
                          {s.nome}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        display="block"
                        sx={{ mb: 0.25 }}
                      >
                        Tipo
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                        {formatTipoSistema(s.tipo)}
                      </Typography>
                    </Box>
                    <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        display="block"
                        sx={{ mb: 0.25 }}
                      >
                        Crítico
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                        {s.critico ? "Sim" : "Não"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      mt: { xs: 1.25, print: 0.75 },
                      pt: { xs: 1, print: 0.5 },
                      borderTop: 1,
                      borderColor: "divider",
                      "@media print": { borderColor: "#ddd" },
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      display="block"
                      sx={{ mb: 0.35 }}
                    >
                      Observação
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "0.92rem", print: "8.5pt" },
                        lineHeight: 1.5,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {s.descricao?.trim() || "—"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Section>
        )}

        {snapshot && (snapshot.lacunas.length > 0 || snapshot.atencoes.length > 0) && (
          <Section title="O que precisa de decisão" sectionId="panorama-sec-decisao">
            {snapshot.lacunas.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: "1rem" }}>
                  Lacunas no diagnóstico
                </Typography>
                <GapTable rows={snapshot.lacunas} variant="lacuna" />
              </>
            )}
            {snapshot.atencoes.length > 0 && (
              <Box sx={{ mt: snapshot.lacunas.length ? 2.5 : 0 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: "1rem" }}>
                  Adoção parcial
                </Typography>
                <GapTable rows={snapshot.atencoes} variant="atencao" />
              </Box>
            )}
          </Section>
        )}

        {snapshot && snapshot.riscos.length > 0 && (
          <Section title="Matriz de risco" sectionId="panorama-sec-riscos">
            <Box sx={{ maxWidth: 520, mx: { xs: 0, md: "auto" }, mb: 2 }}>
              <RiscoHeatmap riscos={riscosHeatmap} embedded relaxed hideChrome />
            </Box>
            <Stack spacing={{ xs: 1.5, print: 1 }} className="panorama-riscos-lista">
              {snapshot.riscos.map((r) => {
                const nivel = panoramaNivelFromRisco(r);
                return (
                  <Box
                    key={r.id}
                    className="panorama-risco-bloco panorama-riscos-tabela"
                    sx={{
                      ...panoramaNivelRowSx(nivel),
                      p: { xs: 1.5, print: 1 },
                      borderRadius: 1,
                      breakInside: "avoid",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1.5fr) minmax(120px, 0.75fr)" },
                        columnGap: { xs: 1, print: 1.25 },
                        rowGap: { xs: 1, print: 0.5 },
                        alignItems: "start",
                      }}
                    >
                      <Box sx={{ minWidth: 0, textAlign: "left" }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={700}
                          display="block"
                          sx={{ mb: 0.35 }}
                        >
                          Risco
                        </Typography>
                        <PanoramaNivelCelulaComIcone visual={nivel}>
                          <Typography fontWeight={600} sx={{ fontSize: "inherit" }}>
                            {r.titulo}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.2, lineHeight: 1.3 }}
                          >
                            {nivel.legenda}
                          </Typography>
                        </PanoramaNivelCelulaComIcone>
                      </Box>
                      <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={700}
                          display="block"
                          sx={{ mb: 0.35 }}
                        >
                          Status
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PanoramaNivelIcon visual={nivel} size="compact" />
                          <Typography variant="body2" sx={{ fontSize: "inherit", textTransform: "capitalize" }}>
                            {r.status.replace(/_/g, " ")}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        mt: { xs: 1.25, print: 0.75 },
                        pt: { xs: 1, print: 0.5 },
                        borderTop: 1,
                        borderColor: (t) => alpha(nivel.color, 0.25),
                        "@media print": { borderColor: "#ddd" },
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        display="block"
                        sx={{ mb: 0.35 }}
                      >
                        O que fazer
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.92rem", lineHeight: 1.5, whiteSpace: "normal", wordBreak: "break-word" }}
                      >
                        {r.estrategia_mitigacao?.trim() || "—"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Section>
        )}

        {snapshot && snapshot.exposicao.length > 0 && (
          <Section title="Se continuar assim" sectionId="panorama-sec-exposicao">
            <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: "0.95rem" }}>
              Cenários com base nos riscos de maior prioridade já cadastrados.
            </Typography>
            <Stack spacing={1.5}>
              {snapshot.exposicao.map((item) => (
                <Paper
                  key={item.titulo}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderLeft: 4,
                    borderColor: "warning.main",
                    bgcolor: (t) => alpha(t.palette.warning.main, 0.06),
                    "@media print": { bgcolor: "transparent" },
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.titulo}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, lineHeight: 1.55, whiteSpace: "normal", wordBreak: "break-word" }}>
                    {item.texto}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Section>
        )}

        {snapshot && snapshot.planos.length > 0 && (
          <Section title="Por onde começar" sectionId="panorama-sec-planos">
            <Stack spacing={{ xs: 1.5, print: 1 }} className="panorama-planos-lista">
              {snapshot.planos.map((p) => {
                const nivel = panoramaNivelFromPlano(p.prioridade);
                const prioridadeLabel = p.prioridade
                  ? getPrioridadeDisplayName(p.prioridade as PrioridadePlano)
                  : "Média";
                return (
                  <Box
                    key={p.id}
                    className="panorama-plano-bloco panorama-planos-tabela"
                    sx={{
                      ...panoramaNivelRowSx(nivel),
                      p: { xs: 1.5, print: 1 },
                      borderRadius: 1,
                      breakInside: "avoid",
                    }}
                  >
                    <Box sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                      <PanoramaNivelCelulaComIcone visual={nivel}>
                        <Typography fontWeight={600} sx={{ fontSize: "inherit" }}>
                          {p.titulo}
                        </Typography>
                        {p.descricao ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.25, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.5 }}
                          >
                            {p.descricao}
                          </Typography>
                        ) : null}
                      </PanoramaNivelCelulaComIcone>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                        columnGap: { xs: 1, print: 1.25 },
                        rowGap: { xs: 1, print: 0.5 },
                        mt: { xs: 1.25, print: 0.75 },
                        pt: { xs: 1, print: 0.5 },
                        borderTop: 1,
                        borderColor: (t) => alpha(nivel.color, 0.25),
                        "@media print": { borderColor: "#ddd" },
                      }}
                    >
                      <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.25 }}>
                          Prioridade
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PanoramaNivelIcon visual={nivel} size="compact" />
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: "inherit" }}>
                            {prioridadeLabel}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.25 }}>
                          Prazo
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                          {formatDataBr(p.data_fim_prevista)}
                        </Typography>
                      </Box>
                      <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.25 }}>
                          Responsável
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "inherit", wordBreak: "break-word" }}>
                          {sanitizePanoramaResponsavelNome(p.responsavel) ?? "A definir"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Section>
        )}
      </Box>
    </>
  );
}

function Section({
  title,
  children,
  className,
  sectionId,
  titleIcon,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  sectionId?: string;
  titleIcon?: React.ReactNode;
}) {
  const titleSx = {
    fontSize: { xs: "1.15rem", md: "1.22rem", print: "13pt" },
    fontWeight: 800,
    mb: 0,
    lineHeight: 1.2,
  } as const;

  return (
    <Paper
      id={sectionId}
      variant="outlined"
      className={className}
      sx={{
        p: { xs: 2, md: 2.75, print: 1.25 },
        mb: { xs: 2.5, print: 2 },
        breakInside: "avoid",
        scrollMarginTop: { xs: 72, md: 80 },
      }}
    >
      {titleIcon ? (
        <Stack
          direction="row"
          spacing={{ xs: 1.25, print: 0.75 }}
          alignItems="center"
          sx={{ mb: { xs: 1.5, print: 0.75 } }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 40, print: 28 },
              height: { xs: 40, print: 28 },
              borderRadius: 1.25,
              flexShrink: 0,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              color: "primary.main",
              fontSize: { xs: 22, print: 16 },
              "@media print": { bgcolor: "transparent", border: "1px solid #ccc" },
            }}
          >
            {titleIcon}
          </Box>
          <Typography variant="h6" sx={titleSx}>
            {title}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6" gutterBottom sx={{ ...titleSx, mb: { print: 0.75 } }}>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

type GapRow = PanoramaSnapshot["lacunas"][number];

function DiagnosticoBadge({ row }: { row: GapRow }) {
  const dId = row.diagnosticoId;
  if (dId == null) return <Typography variant="caption">—</Typography>;
  const theme = getDiagnosticoTheme(dId);
  return (
    <Stack spacing={0.25} alignItems="flex-start">
      <Chip
        size="small"
        label={row.diagnosticoIndice || `D${dId}`}
        sx={{
          fontWeight: 800,
          fontSize: "0.75rem",
          bgcolor: theme.softBg,
          color: theme.color,
          border: `1px solid ${alpha(theme.color, 0.35)}`,
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, whiteSpace: "normal", wordBreak: "break-word" }}>
        {row.diagnosticoNome}
      </Typography>
      {row.controleNome ? (
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ lineHeight: 1.35, whiteSpace: "normal", wordBreak: "break-word" }}
        >
          {row.controleNome}
        </Typography>
      ) : null}
    </Stack>
  );
}

function formatTipoSistema(tipo: string | null | undefined): string {
  if (!tipo) return "—";
  const map: Record<string, string> = {
    aplicacao: "Aplicação",
    banco: "Banco de dados",
    infra: "Infraestrutura",
    saas: "SaaS / terceiro",
    outro: "Outro",
  };
  return map[tipo.toLowerCase()] ?? tipo;
}

function ResumoLinha({
  icon,
  titulo,
  texto,
}: {
  icon: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <Stack direction="row" spacing={{ xs: 1.25, print: 0.75 }} alignItems="flex-start" className="panorama-resumo-linha">
      <Box sx={{ pt: 0.25, "& svg": { fontSize: { print: "1rem" } } }}>{icon}</Box>
      <Box>
        <Typography variant="body1" fontWeight={700}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {texto}
        </Typography>
      </Box>
    </Stack>
  );
}

function GapTable({ rows, variant }: { rows: GapRow[]; variant: "lacuna" | "atencao" }) {
  return (
    <Stack spacing={{ xs: 1.5, print: 1 }} className="panorama-decisao-lista">
      {rows.map((row) => (
        <Box
          key={`${variant}-${row.idMedida}-${row.titulo}`}
          className="panorama-decisao-bloco"
          sx={{
            p: { xs: 1.5, print: 1 },
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            breakInside: "avoid",
            "@media print": { borderColor: "#ccc" },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "minmax(140px, 1.1fr) minmax(72px, 0.65fr) minmax(0, 1.4fr)" },
              columnGap: { xs: 1, print: 1.25 },
              rowGap: { xs: 1, print: 0.5 },
              alignItems: "start",
            }}
          >
            <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                display="block"
                sx={{ mb: 0.35 }}
              >
                Eixo
              </Typography>
              <DiagnosticoBadge row={row} />
            </Box>
            <Box className={PANORAMA_CELULA_ESTREITA} sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                display="block"
                sx={{ mb: 0.35 }}
              >
                Medida
              </Typography>
              <Chip
                size="small"
                label={row.idMedida || "—"}
                color={variant === "lacuna" ? "error" : "warning"}
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Box sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                display="block"
                sx={{ mb: 0.35 }}
              >
                Pergunta
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.92rem", lineHeight: 1.45, whiteSpace: "normal", wordBreak: "break-word" }}
              >
                {row.titulo}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              mt: { xs: 1.25, print: 0.75 },
              pt: { xs: 1, print: 0.5 },
              borderTop: 1,
              borderColor: "divider",
              "@media print": { borderColor: "#ddd" },
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              display="block"
              sx={{ mb: 0.35 }}
            >
              Por quê
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.92rem", lineHeight: 1.45, whiteSpace: "normal", wordBreak: "break-word" }}
            >
              {row.justificativa?.trim() || "Sem justificativa no diagnóstico."}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}