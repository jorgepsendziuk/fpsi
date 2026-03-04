"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Paper, Typography, Button, Skeleton, Alert } from "@mui/material";
import { AccountTree as AccountTreeIcon, Settings as SettingsIcon } from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";

const PAPEIS = [
  { key: "controlador" as const, label: "Controlador", sublabel: "Determina finalidades e meios" },
  { key: "contratante" as const, label: "Contratante", sublabel: "Contratante administrativa" },
  { key: "operador" as const, label: "Operador", sublabel: "Executa conforme instruções" },
] as const;

const NODE_WIDTH = 160;
const NODE_HEIGHT = 44;
const H_SPACING = 80;
const V_SPACING = 100;

function dataToFlow(data: dataService.PapelLgpdData): { nodes: Node[]; edges: Edge[] } {
  const inst = data.instituicoes || [];
  const vinculos = (data.vinculos || []).sort((a, b) => a.ordem - b.ordem);

  const byPapel = {
    controlador: inst.filter((i) => i.tipo_papel === "controlador").sort((a, b) => a.ordem - b.ordem),
    contratante: inst.filter((i) => i.tipo_papel === "contratante").sort((a, b) => a.ordem - b.ordem),
    operador: inst.filter((i) => i.tipo_papel === "operador").sort((a, b) => a.ordem - b.ordem),
  };

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const virtualNodeIds = new Set<string>();

  let y = 0;

  PAPEIS.forEach((p) => {
    const items = byPapel[p.key];
    const count = items.length;
    const totalW = count * NODE_WIDTH + (count - 1) * H_SPACING;
    let x = -totalW / 2 + NODE_WIDTH / 2 + H_SPACING / 2;

    items.forEach((i) => {
      nodes.push({
        id: `inst_${i.id}`,
        type: "default",
        position: { x, y },
        data: {
          label: (
            <Box sx={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>
              {i.nome}
            </Box>
          ),
        },
      });
      x += NODE_WIDTH + H_SPACING;
    });
    y += V_SPACING;
  });

  vinculos.forEach((v) => {
    const origId = `inst_${v.instituicao_origem_id}`;
    let targetId: string;
    if (v.instituicao_destino_id != null) {
      targetId = `inst_${v.instituicao_destino_id}`;
    } else if (v.destino_tipo_papel) {
      targetId = `tipo_${v.destino_tipo_papel}`;
      if (!virtualNodeIds.has(targetId)) {
        virtualNodeIds.add(targetId);
        const label =
          v.destino_tipo_papel === "controlador"
            ? "Controlador"
            : v.destino_tipo_papel === "titulares"
              ? "Titulares de dados"
              : v.destino_tipo_papel;
        nodes.push({
          id: targetId,
          type: "default",
          position: { x: 0, y },
          data: {
            label: (
              <Box sx={{ fontWeight: 500, fontSize: 12, color: "#666", textAlign: "center" }}>
                {label}
              </Box>
            ),
          },
        });
        y += V_SPACING;
      }
    } else return;

    edges.push({
      id: `vinculo_${v.id}`,
      source: origId,
      target: targetId,
      label: v.tipo_vinculo,
      labelStyle: { fontSize: 11 },
      labelBgStyle: { fill: "#f5f5f5", fillOpacity: 0.9 },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 4,
    });
  });

  return { nodes, edges };
}

/** Dados estáticos para modo demonstração */
const DEMO_PAPEL_LGPD: dataService.PapelLgpdData = {
  instituicoes: [
    { id: 1, programa_id: 0, tipo_papel: "controlador", ordem: 0, nome: "Empresa Demo Tech Ltda", descricao: null, contato: null, email: null, site: null },
    { id: 2, programa_id: 0, tipo_papel: "contratante", ordem: 0, nome: "Prestador de Serviços Demo", descricao: null, contato: null, email: null, site: null },
    { id: 3, programa_id: 0, tipo_papel: "operador", ordem: 0, nome: "Operador de Dados Demo", descricao: null, contato: null, email: null, site: null },
  ],
  vinculos: [
    { id: 1, programa_id: 0, instituicao_origem_id: 1, instituicao_destino_id: 2, destino_tipo_papel: null, tipo_vinculo: "Contrato de prestação", ordem: 0 },
    { id: 2, programa_id: 0, instituicao_origem_id: 2, instituicao_destino_id: 3, destino_tipo_papel: null, tipo_vinculo: "Desenvolvimento/hospedagem", ordem: 1 },
    { id: 3, programa_id: 0, instituicao_origem_id: 3, instituicao_destino_id: null, destino_tipo_papel: "controlador", tipo_vinculo: "Processa dados em nome de", ordem: 2 },
  ],
};

interface PapelLgpdDiagramProps {
  programaId: number;
  idOrSlug: string;
  isDemoMode?: boolean;
  /** Quando fornecido, usa em vez de buscar (ex.: no PapelLgpdManager) */
  data?: dataService.PapelLgpdData | null;
  /** Modo embutido: sem header, sem botão Gerenciar, layout compacto */
  embedded?: boolean;
  /** Ao clicar em nó (instituição) — só em modo embedded */
  onNodeClick?: (inst: dataService.PapelLgpdInstituicao) => void;
  /** Ao clicar em aresta (vínculo) — só em modo embedded */
  onEdgeClick?: (vinculo: dataService.PapelLgpdVinculo) => void;
}

export function PapelLgpdDiagram({ programaId, idOrSlug, isDemoMode, data: dataProp, embedded, onNodeClick, onEdgeClick }: PapelLgpdDiagramProps) {
  const router = useRouter();
  const [dataState, setDataState] = useState<dataService.PapelLgpdData | null>(null);
  const [loading, setLoading] = useState(!dataProp);
  const [error, setError] = useState<string | null>(null);

  const data = dataProp ?? dataState;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    const inst = data.instituicoes || [];
    if (inst.length === 0) return { nodes: [], edges: [] };
    return dataToFlow(data);
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const fetchData = useCallback(async () => {
    if (dataProp != null) return;
    if (isDemoMode) {
      setDataState(DEMO_PAPEL_LGPD);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const d = await dataService.fetchPapelLgpd(programaId);
      setDataState(d);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar";
      setError(msg);
      setDataState({ instituicoes: [], vinculos: [] });
    } finally {
      setLoading(false);
    }
  }, [programaId, isDemoMode, dataProp]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!onNodeClick || !data) return;
      const m = node.id.match(/^inst_(\d+)$/);
      if (!m) return;
      const inst = data.instituicoes?.find((i) => i.id === Number(m[1]));
      if (inst) onNodeClick(inst);
    },
    [onNodeClick, data]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (!onEdgeClick || !data) return;
      const m = edge.id.match(/^vinculo_(\d+)$/);
      if (!m) return;
      const vinculo = data.vinculos?.find((v) => v.id === Number(m[1]));
      if (vinculo) onEdgeClick(vinculo);
    },
    [onEdgeClick, data]
  );

  if (loading && !dataProp) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  const hasData = data && (data.instituicoes?.length ?? 0) > 0;

  const diagramContent = (
    <Box sx={{ flex: 1, minHeight: embedded ? 200 : 300, width: "100%", height: "100%" }}>
      {hasData ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick ? handleNodeClick : undefined}
          onEdgeClick={onEdgeClick ? handleEdgeClick : undefined}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          style={{ borderRadius: 8, background: "#fafafa" }}
        >
          <Background gap={12} size={1} color="#e0e0e0" />
          <Controls showInteractive={false} />
        </ReactFlow>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: embedded ? 180 : 280,
            color: "#666",
            fontSize: 14,
            textAlign: "center",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Typography variant="body2">
            Nenhuma instituição cadastrada.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 260 }}>
            {embedded
              ? "Cadastre controladores, contratantes e operadores abaixo para exibir o diagrama."
              : "Cadastre controladores, contratantes e operadores em Responsabilidades para exibir o diagrama."}
          </Typography>
          {!embedded && !isDemoMode && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => router.push(`/programas/${idOrSlug}/responsabilidades`)}
              sx={{ mt: 1, borderRadius: 2, textTransform: "none" }}
            >
              Ir para Responsabilidades
            </Button>
          )}
        </Box>
      )}
    </Box>
  );

  if (embedded) {
    return (
      <Box sx={{ height: "100%", minHeight: 200, display: "flex", flexDirection: "column" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {diagramContent}
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        minHeight: 360,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountTreeIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Estrutura de Tratamento
          </Typography>
        </Box>
        {!isDemoMode && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => router.push(`/programas/${idOrSlug}/responsabilidades`)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Gerenciar
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
          {(error.includes("403") || error.includes("negado")) && (
            <Typography variant="caption" component="span" display="block" sx={{ mt: 1 }}>
              Verifique se você está atribuído a este programa em Usuários e Permissões.
            </Typography>
          )}
        </Alert>
      )}


      {diagramContent}
    </Paper>
  );
}
