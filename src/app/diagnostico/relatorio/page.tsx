"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { PictureAsPdf as PictureAsPdfIcon } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useMediaQuery } from "@mui/material";
import { useSearchParams } from "next/navigation";

interface ReportData {
  diagnostico: string;
  controle: string;
  medida: string;
  status: string;
  responsavel: string;
  previsao: string;
}

export default function RelatorioPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("diagnostico");
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const searchParams = useSearchParams();
  const programaId = searchParams.get("programaId");

  const { data: diagnosticosData } = useList({
    resource: "diagnostico",
  });

  const { data: controlesData } = useList({
    resource: "controle",
    filters: [
      {
        field: "programa",
        operator: "eq",
        value: programaId,
      },
    ],
  });

  const { data: medidasData } = useList({
    resource: "medida",
  });

  useEffect(() => {
    if (diagnosticosData?.data && controlesData?.data && medidasData?.data) {
      const diagnosticos = diagnosticosData.data;
      const controles = controlesData.data;
      const medidas = medidasData.data;
      
      const data: ReportData[] = [];
      
      diagnosticos.forEach((diagnostico: any) => {
        const diagnosticoControles = controles.filter(
          (controle: any) => controle.diagnostico === diagnostico.id
        );

        diagnosticoControles.forEach((controle: any) => {
          const controleMedidas = medidas.filter(
            (medida: any) => medida.id_controle === controle.id
          );

          controleMedidas.forEach((medida: any) => {
            data.push({
              diagnostico: diagnostico.descricao,
              controle: controle.nome,
              medida: medida.medida,
              status: medida.status_medida?.toString() || "Não definido",
              responsavel: medida.responsavel?.toString() || "Não definido",
              previsao: medida.previsao_fim || "Não definido",
            });
          });
        });
      });

      setReportData(data);
    }
  }, [diagnosticosData, controlesData, medidasData]);

  const columns = useMemo<ColumnDef<ReportData>[]>(
    () => [
      {
        id: "diagnostico",
        header: "Diagnóstico",
        accessorKey: "diagnostico",
      },
      {
        id: "controle",
        header: "Controle",
        accessorKey: "controle",
      },
      {
        id: "medida",
        header: "Medida",
        accessorKey: "medida",
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
      },
      {
        id: "responsavel",
        header: "Responsável",
        accessorKey: "responsavel",
      },
      {
        id: "previsao",
        header: "Previsão",
        accessorKey: "previsao",
      },
    ],
    []
  );

  const table = useTable({
    columns,
    data: reportData,
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = table.getRowModel().rows.map((row) => {
      return [
        row.original.diagnostico,
        row.original.controle,
        row.original.medida,
        row.original.status,
        row.original.responsavel,
        row.original.previsao,
      ];
    });

    doc.autoTable({
      head: [["Diagnóstico", "Controle", "Medida", "Status", "Responsável", "Previsão"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      margin: { top: 20 },
    });

    doc.save("relatorio-diagnosticos.pdf");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Relatório de Diagnósticos
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={category}
              label="Categoria"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="estrutura">Estrutura</MenuItem>
              <MenuItem value="seguranca">Segurança</MenuItem>
              <MenuItem value="privacidade">Privacidade</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="diagnostico">Diagnóstico</MenuItem>
              <MenuItem value="controle">Controle</MenuItem>
              <MenuItem value="medida">Medida</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Exportar PDF">
            <IconButton
              onClick={handleExportPDF}
              sx={{ 
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <PictureAsPdfIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 