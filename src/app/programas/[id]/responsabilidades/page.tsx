"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Container, Typography, Paper, Box, Button, Snackbar, Alert, Grid, FormControl, InputLabel, Select, MenuItem, Breadcrumbs, Link } from "@mui/material";
import { DataGrid, GridColDef, GridRowModesModel, GridRowModes, GridActionsCellItem } from "@mui/x-data-grid";
import * as dataService from "@/app/diagnostico/services/dataService";
import { Add, Edit, Delete, Save, Cancel, ArrowBack } from "@mui/icons-material";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export default function ProgramaResponsaveisCRUDPage() {
  const params = useParams();
  const programaId = Number(params.id);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string, severity: "success" | "error" } | null>(null);
  const [controleInterno, setControleInterno] = useState("");
  const [si, setSI] = useState("");
  const [privacidade, setPrivacidade] = useState("");
  const [ti, setTI] = useState("");
  const isMounted = useRef(true);

  // Buscar responsáveis do programa
  const fetchResponsaveis = async () => {
    setLoading(true);
    const data = await dataService.fetchResponsaveis(programaId);
    if (!isMounted.current) return;
    setResponsaveis(data);
    setLoading(false);
  };

  // Buscar dados do programa para os campos principais
  const fetchProgramaCamposPrincipais = async () => {
    const programa = await dataService.fetchProgramaById(programaId);
    if (!isMounted.current) return;
    setControleInterno(programa.responsavel_controle_interno ? String(programa.responsavel_controle_interno) : "");
    setSI(programa.responsavel_si ? String(programa.responsavel_si) : "");
    setPrivacidade(programa.responsavel_privacidade ? String(programa.responsavel_privacidade) : "");
    setTI(programa.responsavel_ti ? String(programa.responsavel_ti) : "");
  };

  useEffect(() => {
    isMounted.current = true;
    fetchResponsaveis();
    fetchProgramaCamposPrincipais();
    return () => { isMounted.current = false; };
  }, [programaId]);

  // Salvar campo de responsável principal
  const handleSaveResponsavel = async (field: string, value: string) => {
    setLoading(true);
    await dataService.updateProgramaField(programaId, field, value);
    if (!isMounted.current) return;
    setSnackbar({ message: "Responsável atualizado!", severity: "success" });
    setLoading(false);
  };

  // Handlers dos combos
  const handleChangeCombo = (setter: any, field: string) => async (e: any) => {
    const value = e.target.value;
    setter(value);
    await handleSaveResponsavel(field, value);
  };

  // DataGrid handlers
  const handleRowEditStart = (params: any, event: any) => { event.defaultMuiPrevented = true; };
  const handleRowEditStop = (params: any, event: any) => { event.defaultMuiPrevented = true; };
  const handleEditClick = (id: any) => () => { setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } }); };
  const handleSaveClick = (id: any) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    await fetchResponsaveis();
    if (!isMounted.current) return;
    setSnackbar({ message: "Responsável salvo!", severity: "success" });
  };
  const handleCancelClick = (id: any) => () => { setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } }); };
  const handleDeleteClick = (id: any) => async () => {
    setLoading(true);
    await supabaseBrowserClient.from("responsavel").delete().eq("id", id);
    if (!isMounted.current) return;
    await fetchResponsaveis();
    if (!isMounted.current) return;
    setSnackbar({ message: "Responsável removido!", severity: "success" });
    setLoading(false);
  };
  const handleAddClick = async () => {
    setLoading(true);
    await supabaseBrowserClient.from("responsavel").insert({ programa: programaId, nome: "", email: "", departamento: "" });
    if (!isMounted.current) return;
    await fetchResponsaveis();
    if (!isMounted.current) return;
    setLoading(false);
  };
  const handleProcessRowUpdate = async (newRow: any) => {
    setLoading(true);
    await supabaseBrowserClient.from("responsavel").update(newRow).eq("id", newRow.id);
    if (!isMounted.current) return newRow;
    await fetchResponsaveis();
    if (!isMounted.current) return newRow;
    setSnackbar({ message: "Responsável atualizado!", severity: "success" });
    setLoading(false);
    return newRow;
  };

  const columns: GridColDef[] = [
    { field: "nome", headerName: "Nome", flex: 1, editable: true },
    { field: "email", headerName: "Email", flex: 1, editable: true },
    { field: "departamento", headerName: "Departamento", flex: 1, editable: true },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem key={params.id} icon={<Edit />} label="Editar" onClick={handleEditClick(params.id)} />,
        <GridActionsCellItem key={params.id} icon={<Save />} label="Salvar" onClick={handleSaveClick(params.id)} />,
        <GridActionsCellItem key={params.id} icon={<Cancel />} label="Cancelar" onClick={handleCancelClick(params.id)} />,
        <GridActionsCellItem key={params.id} icon={<Delete />} label="Excluir" onClick={handleDeleteClick(params.id)} />,
      ],
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link href="/programas" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
            Programas
          </Link>
          <Typography color="text.primary">Responsáveis</Typography>
        </Breadcrumbs>
        <Typography
          variant="h4"
          fontWeight="bold"
          align="left"
          sx={{
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}
        >
          Responsáveis do Programa
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
          Responsáveis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável Controle Interno</InputLabel>
              <Select value={controleInterno} label="Responsável Controle Interno" onChange={handleChangeCombo(setControleInterno, "responsavel_controle_interno") }>
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável SI</InputLabel>
              <Select value={si} label="Responsável SI" onChange={handleChangeCombo(setSI, "responsavel_si") }>
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável Privacidade</InputLabel>
              <Select value={privacidade} label="Responsável Privacidade" onChange={handleChangeCombo(setPrivacidade, "responsavel_privacidade") }>
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável TI</InputLabel>
              <Select value={ti} label="Responsável TI" onChange={handleChangeCombo(setTI, "responsavel_ti") }>
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ height: 400, width: '100%', background: '#fafbfc', borderRadius: 2, border: '1px solid #eee', p: 1 }}>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddClick} sx={{ mb: 2 }}>
            Adicionar Responsável
          </Button>
          <DataGrid
            rows={responsaveis}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={handleProcessRowUpdate}
            autoHeight
            disableRowSelectionOnClick
            density="comfortable"
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
            getRowHeight={() => 'auto'}
            getEstimatedRowHeight={() => 50}
            loading={loading}
          />
        </Box>
      </Paper>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.severity || "success"} sx={{ width: '100%' }}>
          {snackbar?.message || ""}
        </Alert>
      </Snackbar>
    </Container>
  );
} 