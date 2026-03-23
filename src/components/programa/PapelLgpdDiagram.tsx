"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Paper, Typography, Button, Skeleton, Alert } from "@mui/material";
import { AccountTree as AccountTreeIcon, Settings as SettingsIcon } from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";

const PAPEIS = [
  { key: "controlador" as const, label: "Controlador(es)", sublabel: "Determina finalidades e meios" },
  { key: "contratante" as const, label: "Contratante(s)", sublabel: "Contratante administrativa" },
  { key: "operador" as const, label: "Operador(es)", sublabel: "Executa conforme instruções" },
] as const;

/** Alinhado aos cartões em PapelLgpdManager */
const PAPEL_CORES: Record<
  "controlador" | "contratante" | "operador" | "titulares",
  { main: string; soft: string; border: string }
> = {
  controlador: { main: "#1976d2", soft: "rgba(25, 118, 210, 0.12)", border: "#1976d2" },
  contratante: { main: "#2e7d32", soft: "rgba(46, 125, 50, 0.12)", border: "#2e7d32" },
  operador: { main: "#ed6c02", soft: "rgba(237, 108, 2, 0.12)", border: "#ed6c02" },
  titulares: { main: "#616161", soft: "rgba(97, 97, 97, 0.1)", border: "#757575" },
};

function resolvePapelCor(tipo: string): (typeof PAPEL_CORES)["controlador"] {
  if (tipo === "controlador" || tipo === "contratante" || tipo === "operador") return PAPEL_CORES[tipo];
  return PAPEL_CORES.titulares;
}

function labelPapelPorTipo(tipo: string): string {
  const p = PAPEIS.find((x) => x.key === tipo);
  if (p) return p.label;
  if (tipo === "titulares") return "Titulares de dados";
  return tipo;
}

const NODE_WIDTH = 172;
/** Altura aproximada para layout em grade (instituição: faixa de papel + nome) */
const NODE_HEIGHT = 72;
const VIRTUAL_NODE_HEIGHT = 48;
const H_SPACING = 80;
const V_SPACING = 108;

type PapelInstNodeData = {
  nome: string;
  tipoPapel: string;
  /** Nó sintético (ex.: destino “papel” ou titulares) — só legenda, sem faixa duplicada */
  isVirtual?: boolean;
};

function PapelInstNode({ data }: { data: PapelInstNodeData }) {
  const c = resolvePapelCor(data.tipoPapel);
  const papelLegenda = labelPapelPorTipo(data.tipoPapel);

  if (data.isVirtual) {
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <Box
          sx={{
            width: NODE_WIDTH,
            minHeight: VIRTUAL_NODE_HEIGHT - 8,
            px: 1,
            py: 0.75,
            borderRadius: 1,
            border: `2px dashed ${c.border}`,
            background: c.soft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: c.main,
              fontSize: 11,
              textAlign: "center",
              lineHeight: 1.25,
            }}
          >
            {data.nome}
          </Typography>
        </Box>
        <Handle type="source" position={Position.Bottom} />
      </>
    );
  }

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Box
        sx={{
          width: NODE_WIDTH,
          borderRadius: 1,
          border: `2px solid ${c.border}`,
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            px: 0.75,
            py: 0.45,
            background: c.soft,
            borderBottom: `1px solid ${c.border}40`,
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{
              fontWeight: 800,
              color: c.main,
              fontSize: 10,
              letterSpacing: "0.04em",
              textAlign: "center",
              lineHeight: 1.2,
              textTransform: "uppercase",
            }}
          >
            {papelLegenda}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            px: 1,
            py: 1,
            fontWeight: 600,
            fontSize: 12.5,
            textAlign: "center",
            lineHeight: 1.35,
            color: "text.primary",
            wordBreak: "break-word",
          }}
        >
          {data.nome}
        </Typography>
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

const nodeTypes = { papelInst: PapelInstNode };

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
        type: "papelInst",
        position: { x, y },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: {
          nome: i.nome,
          tipoPapel: p.key,
          isVirtual: false,
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
            ? "Controlador(es)"
            : v.destino_tipo_papel === "contratante"
              ? "Contratante(s)"
              : v.destino_tipo_papel === "operador"
                ? "Operador(es)"
                : v.destino_tipo_papel === "titulares"
                  ? "Titulares de dados"
                  : String(v.destino_tipo_papel);
        const tipoVirt =
          v.destino_tipo_papel === "controlador" ||
          v.destino_tipo_papel === "contratante" ||
          v.destino_tipo_papel === "operador"
            ? v.destino_tipo_papel
            : "titulares";
        nodes.push({
          id: targetId,
          type: "papelInst",
          position: { x: 0, y },
          width: NODE_WIDTH,
          height: VIRTUAL_NODE_HEIGHT,
          data: {
            nome: label,
            tipoPapel: tipoVirt,
            isVirtual: true,
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
  /** Exibe o botão Gerenciar e o atalho no estado vazio (padrão: true). Na página inicial do programa costuma ser false. */
  showManageButton?: boolean;
  /** Ao clicar em nó (instituição) — só em modo embedded */
  onNodeClick?: (inst: dataService.PapelLgpdInstituicao) => void;
  /** Ao clicar em aresta (vínculo) — só em modo embedded */
  onEdgeClick?: (vinculo: dataService.PapelLgpdVinculo) => void;
}

export function PapelLgpdDiagram({
  programaId,
  idOrSlug,
  isDemoMode,
  data: dataProp,
  embedded,
  showManageButton = true,
  onNodeClick,
  onEdgeClick,
}: PapelLgpdDiagramProps) {
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
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  const hasData = data && (data.instituicoes?.length ?? 0) > 0;

  const diagramContent = (
    <Box sx={{ flex: 1, minHeight: embedded ? 200 : 400, width: "100%", height: "100%" }}>
      {hasData ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
            minHeight: embedded ? 180 : 300,
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
              ? "Cadastre instituições como controlador(es), contratante(s) e operador(es) abaixo para exibir o diagrama."
              : showManageButton
                ? "Cadastre instituições como controlador(es), contratante(s) e operador(es) em Responsabilidades para exibir o diagrama."
                : "Cadastre ou edite instituições e vínculos no card Responsabilidades (Módulos ao lado)."}
          </Typography>
          {!embedded && !isDemoMode && showManageButton && (
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
        minHeight: 460,
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
        {!isDemoMode && showManageButton && (
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
