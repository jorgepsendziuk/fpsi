"use client";

import React, { useMemo } from "react";
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
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box } from "@mui/material";

function DiamondNode({ data }: NodeProps) {
  return (
    <Box
      sx={{
        width: 100,
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        bgcolor: "background.paper",
        border: "2px solid",
        borderColor: "divider",
        boxShadow: 2,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Right} id="sim" />
      <Handle type="source" position={Position.Bottom} id="nao" />
      <Box
        component="span"
        sx={{
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
          px: 1,
          maxWidth: 80,
        }}
      >
        {data.label as string}
      </Box>
    </Box>
  );
}

const nodeTypes = { diamond: DiamondNode };

const NODE_WIDTH = 180;
const NODE_HEIGHT = 40;
const SPACING = 60;

function createNodesAndEdges(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const centerX = 0;

  nodes.push(
    { id: "levantamento", type: "default", position: { x: centerX - NODE_WIDTH / 2, y: 0 }, data: { label: "Levantamento e governança" } },
    { id: "ropa", type: "default", position: { x: centerX - NODE_WIDTH / 2, y: NODE_HEIGHT + SPACING }, data: { label: "ROPA" } },
    { id: "diagnostico", type: "default", position: { x: centerX - NODE_WIDTH / 2, y: 2 * (NODE_HEIGHT + SPACING) }, data: { label: "Diagnóstico maturidade" } },
    { id: "risco", type: "diamond", position: { x: centerX - 50, y: 3 * (NODE_HEIGHT + SPACING) }, data: { label: "Risco alto?" } },
    { id: "ripd", type: "default", position: { x: centerX + 100, y: 3 * (NODE_HEIGHT + SPACING) + 50 }, data: { label: "RIPD" } },
    { id: "plano", type: "default", position: { x: centerX - NODE_WIDTH / 2, y: 4 * (NODE_HEIGHT + SPACING) + 80 }, data: { label: "Plano de trabalho" } },
    { id: "implementacao", type: "default", position: { x: centerX - NODE_WIDTH / 2, y: 5 * (NODE_HEIGHT + SPACING) + 80 }, data: { label: "Implementação" } },
    { id: "canal", type: "default", position: { x: centerX - NODE_WIDTH / 2, y: 6 * (NODE_HEIGHT + SPACING) + 80 }, data: { label: "Canal titulares e ANPD" } }
  );

  const edges: Edge[] = [
    { id: "e1", source: "levantamento", target: "ropa" },
    { id: "e2", source: "ropa", target: "diagnostico" },
    { id: "e3", source: "diagnostico", target: "risco" },
    { id: "e4", source: "risco", sourceHandle: "sim", target: "ripd", label: "Sim", labelStyle: { fontSize: 11 }, labelBgStyle: { fill: "#f5f5f5" }, labelBgPadding: [4, 4] as [number, number], labelBgBorderRadius: 4 },
    { id: "e5", source: "risco", sourceHandle: "nao", target: "plano", label: "Não", labelStyle: { fontSize: 11 }, labelBgStyle: { fill: "#f5f5f5" }, labelBgPadding: [4, 4] as [number, number], labelBgBorderRadius: 4 },
    { id: "e6", source: "ripd", target: "plano" },
    { id: "e7", source: "plano", target: "implementacao" },
    { id: "e8", source: "implementacao", target: "canal" },
  ];

  return { nodes, edges };
}

export function GovernancaRopaDiagram() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(createNodesAndEdges, []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Box sx={{ width: "100%", height: 500, minHeight: 560 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ borderRadius: 8, background: "transparent" }}
      >
        <Background gap={12} size={1} color="#e0e0e0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </Box>
  );
}
