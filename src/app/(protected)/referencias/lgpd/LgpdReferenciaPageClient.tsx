"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  TextField,
  Typography,
  Paper,
  Link,
  Tooltip,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { LgpdArtigoViewer } from "@/components/normas/LgpdArtigoViewer";
import { LgpdNavTree } from "@/components/normas/LgpdNavTree";
import {
  filterLgpdOutlineByQuery,
  pruneLgpdOutline,
} from "@/lib/normas/lgpdOutline";
import {
  collectArtigosNumerosMatchingBody,
  normalizeLgpdQuery,
} from "@/lib/normas/lgpdTextSearch";
import type { LgpdArtigosPayload } from "@/lib/normas/lgpdArtigosTypes";
import { LGPD_PLANALTO_COMPILADO_URL } from "@/lib/normas/lgpdRefs";

const LGPD_DATA_URL = "/data/lgpd_artigos.json";
const LGPD_TREE_WIDTH_KEY = "fpsi-lgpd-nav-width";
const TREE_MIN = 280;
const TREE_MAX = 640;
const TREE_DEFAULT = 420;

export default function LgpdReferenciaPageClient() {
  const [payload, setPayload] = useState<LgpdArtigosPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(LGPD_DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<LgpdArtigosPayload>;
      })
      .then((j) => {
        if (!cancelled) setPayload(j);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Não foi possível carregar o texto da LGPD. Atualize a página ou rode o script de extração.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const numeros = useMemo(() => {
    if (!payload) return [];
    return Object.keys(payload.artigos)
      .map((k) => parseInt(k, 10))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
  }, [payload]);

  const numerosSet = useMemo(() => new Set(numeros), [numeros]);

  const arvoreBase = useMemo(() => {
    if (!payload) return [];
    const a = payload.arvore;
    if (a?.length) return a;
    return [{ id: "lgpd-flat", titulo: "Artigos", artigos: numeros }];
  }, [payload, numeros]);

  const [artigo, setArtigo] = useState(1);
  const [filtro, setFiltro] = useState("");
  const [treeWidth, setTreeWidth] = useState(TREE_DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LGPD_TREE_WIDTH_KEY);
      if (!raw) return;
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n >= TREE_MIN && n <= TREE_MAX) setTreeWidth(n);
    } catch {
      /* ignore */
    }
  }, []);

  const onResizeTreeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = treeWidth;
      let last = startW;
      const clamp = (w: number) => Math.min(TREE_MAX, Math.max(TREE_MIN, w));
      const onMove = (ev: MouseEvent) => {
        last = clamp(startW + (ev.clientX - startX));
        setTreeWidth(last);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        try {
          localStorage.setItem(LGPD_TREE_WIDTH_KEY, String(last));
        } catch {
          /* ignore */
        }
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [treeWidth],
  );

  const prunedOutline = useMemo(
    () => pruneLgpdOutline(arvoreBase, numerosSet),
    [arvoreBase, numerosSet],
  );

  const bodyMatchingNumeros = useMemo(() => {
    if (!payload?.artigos) return new Set<number>();
    return collectArtigosNumerosMatchingBody(payload.artigos, filtro);
  }, [payload, filtro]);

  const outlineVisivel = useMemo(
    () => filterLgpdOutlineByQuery(prunedOutline, filtro, { bodyMatchingNumeros }),
    [prunedOutline, filtro, bodyMatchingNumeros],
  );
  const expandAllTree = filtro.trim().length > 0;

  const filtrados = useMemo(() => {
    const q = normalizeLgpdQuery(filtro);
    if (!q) return numeros;
    return numeros.filter(
      (n) =>
        normalizeLgpdQuery(String(n)).includes(q) ||
        normalizeLgpdQuery(`artigo ${n}`).includes(q) ||
        bodyMatchingNumeros.has(n),
    );
  }, [numeros, filtro, bodyMatchingNumeros]);

  useEffect(() => {
    if (numeros.length === 0) return;
    if (!numeros.includes(artigo)) setArtigo(numeros[0]);
  }, [numeros, artigo]);

  /** Com filtro ativo, manter artigo visível dentro do conjunto que corresponde à busca. */
  useEffect(() => {
    if (filtro.trim() === "") return;
    if (filtrados.length === 0) return;
    if (!filtrados.includes(artigo)) setArtigo(filtrados[0]);
  }, [filtro, filtrados, artigo]);

  const texto = useMemo(() => {
    if (!payload) return "";
    const t = payload.artigos[String(artigo)];
    return t && t.trim() ? t : "";
  }, [payload, artigo]);

  const idxAtual = filtrados.indexOf(artigo);
  const podeAnterior = idxAtual > 0;
  const podeProximo = idxAtual >= 0 && idxAtual < filtrados.length - 1;
  const semResultados = filtrados.length === 0;

  if (loadError) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h6" gutterBottom>
          LGPD
        </Typography>
        <Typography color="error">{loadError}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Confirme que existe o ficheiro <code>public/data/lgpd_artigos.json</code> (cópia de{" "}
          <code>src/data/lgpd_artigos.json</code>) e que correu <code>npm run dev:fresh</code> se o erro persistir.
        </Typography>
      </Container>
    );
  }

  if (!payload) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress aria-label="A carregar LGPD" />
      </Box>
    );
  }

  const meta = payload.meta;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeroHeader
        title="LGPD"
        icon={<MenuBookIcon sx={{ fontSize: 30 }} aria-hidden />}
        description={
          <>
            Lei nº 13.709/2018 — ({meta.total_artigos} artigos mapeados).{" "}
            <Link href={LGPD_PLANALTO_COMPILADO_URL} target="_blank" rel="noopener noreferrer">
              Referência oficial — Planalto
            </Link>
            .
          </>
        }
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          flexDirection: { xs: "column", md: "row" },
          gap: 0,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            width: { xs: "100%", md: treeWidth },
            minWidth: { md: TREE_MIN },
            maxWidth: { md: TREE_MAX },
            flexShrink: 0,
            position: { md: "sticky" },
            top: { md: 88 },
            maxHeight: { md: "calc(100vh - 120px)" },
            overflow: "auto",
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="Filtrar"
            placeholder="Artigo, título do sumário ou texto do artigo"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            sx={{ mb: 1, px: 0.5 }}
          />
          {outlineVisivel.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2 }}>
              Nenhum trecho corresponde ao filtro.
            </Typography>
          ) : (
            <LgpdNavTree
              outline={outlineVisivel}
              selectedArtigo={artigo}
              onSelectArtigo={setArtigo}
              expandAll={expandAllTree}
            />
          )}
        </Paper>

        <Box
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar painel da árvore"
          onMouseDown={onResizeTreeStart}
          sx={{
            display: { xs: "none", md: "flex" },
            width: 10,
            flexShrink: 0,
            alignSelf: "stretch",
            minHeight: 120,
            cursor: "col-resize",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            touchAction: "none",
            "&:hover .lgpd-resize-grip": { bgcolor: "primary.main", opacity: 0.45 },
          }}
        >
          <Box
            className="lgpd-resize-grip"
            sx={{
              width: 4,
              borderRadius: 2,
              alignSelf: "stretch",
              my: 2,
              bgcolor: "divider",
              opacity: 0.9,
              transition: (t) => t.transitions.create(["background-color", "opacity"], { duration: 120 }),
            }}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            flex: 1,
            minWidth: 0,
          }}
        >
            {semResultados ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                Nenhum artigo corresponde ao filtro. Limpe o campo de busca para ver a lei completa.
              </Typography>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                    {artigo === 10 ? "Art. 10" : `Art. ${artigo}º`}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Tooltip title="Artigo anterior">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!podeAnterior}
                          onClick={() => podeAnterior && setArtigo(filtrados[idxAtual - 1])}
                          aria-label="Artigo anterior"
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Próximo artigo">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!podeProximo}
                          onClick={() => podeProximo && setArtigo(filtrados[idxAtual + 1])}
                          aria-label="Próximo artigo"
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                <LgpdArtigoViewer texto={texto} />
              </>
            )}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Link href={LGPD_PLANALTO_COMPILADO_URL} target="_blank" rel="noopener noreferrer" variant="body2">
                Referência oficial — texto compilado no Planalto
              </Link>
            </Box>
          </Paper>
      </Box>
    </Container>
  );
}
