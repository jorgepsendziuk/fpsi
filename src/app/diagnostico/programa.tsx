"use client";
import React, { useEffect, useState } from "react";
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps, TextFieldVariants, Typography, Tabs, Tab, IconButton, Tooltip } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { supabaseBrowserClient } from "@utils/supabase/client";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { Programa } from "./types";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import Responsavel from './responsavel';
import * as dataService from './services/dataService';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useThemeColors } from "./hooks/useThemeColors";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

const Programa = ({ programaId }: { programaId: number }) => {
  const [programa, setPrograma] = useState<Programa>({} as Programa);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [editedFields, setEditedFields] = useState<{[key: string]: any}>({});
  const router = useRouter();
  const { 
    getContrastTextColor, 
    getAccordionBackgroundColor,
    getAccordionHoverBackgroundColor,
    getAccordionSummaryBackgroundColor,
    getAccordionBorderColor,
    accordionStyles
  } = useThemeColors();

  const fetchResponsaveis = async () => {
    const data = await dataService.fetchResponsaveis(programaId);
    setResponsaveis(data);
  };

  useEffect(() => {
    const fetchProgramas = async () => {
      const { data } = await supabaseBrowserClient
        .from("programa")
        .select("*")
        .eq("id", programaId)
        .order("id", { ascending: true });
      setPrograma(data ? data[0] : undefined);
    };

    fetchProgramas();
    fetchResponsaveis();
  }, [programaId]);

  const handleChange = (field: string) => (event: any) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (field: string) => (date: any) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSave = async (field: string) => {
    const { error } = await supabaseBrowserClient
      .from("programa")
      .update({ [field]: editedFields[field] })
      .eq("id", programaId);
    
    if (!error) {
      setPrograma(prev => ({ ...prev, [field]: editedFields[field] }));
      setEditedFields(prev => {
        const newFields = { ...prev };
        delete newFields[field];
        return newFields;
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este programa?")) {
      const { error } = await supabaseBrowserClient
        .from("programa")
        .delete()
        .eq("id", programaId);
      
      if (!error) {
        router.push("/diagnostico");
      }
    }
  };

  const handleReport = () => {
    router.push(`/diagnostico/relatorio?programaId=${programaId}`);
  };

  const handleGeneratePDF = async () => {
    // Primeiro navega para a página de relatório para buscar os dados
    const response = await fetch(`/api/relatorio?programaId=${programaId}`);
    const data = await response.json();
    
    const doc = new jsPDF();
    const tableData = data.map((item: any) => [
      item.diagnostico,
      item.controle,
      item.medida,
      item.status,
      item.responsavel,
      item.previsao,
    ]);

    doc.autoTable({
      head: [["Diagnóstico", "Controle", "Medida", "Status", "Responsável", "Previsão"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      margin: { top: 20 },
    });

    doc.save(`relatorio-programa-${programaId}.pdf`);
  };

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 0.5,
        mb: -1,
        "& .MuiIconButton-root": {
          borderRadius: '4px 4px 0 0',
          height: '40px',
          width: '40px',
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          '&.delete': {
            backgroundColor: 'error.main',
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }
        }
      }}>
        <Tooltip title="Relatório">
          <IconButton onClick={handleReport}>
            <AssessmentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Exportar PDF">
          <IconButton onClick={handleGeneratePDF}>
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Salvar">
          <IconButton onClick={() => handleSave('all')}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton onClick={handleDelete} className="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={0} direction="column"> 
        <Grid>
          <Accordion sx={accordionStyles}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon fontSize="large" color="primary" sx={{ ml: 1 }} />
                <Typography variant="h5" style={{ fontWeight: "500" }}>Dados da Instituição</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ md: 4, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      id="programa-atendimento-fone"
                      name="atendimento_fone"
                      fullWidth
                      label="Telefone de Atendimento"
                      value={editedFields.atendimento_fone !== undefined ? editedFields.atendimento_fone : (programa?.atendimento_fone || "")}
                      onChange={handleChange("atendimento_fone")}
                    />
                  </Box>
                </Grid>
                <Grid size={{ md: 4, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      id="programa-atendimento-email"
                      name="atendimento_email"
                      fullWidth
                      label="Email de Atendimento"
                      value={editedFields.atendimento_email !== undefined ? editedFields.atendimento_email : (programa?.atendimento_email || "")}
                      onChange={handleChange("atendimento_email")}
                    />
                  </Box>
                </Grid>
                <Grid size={{ md: 4, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      id="programa-atendimento-site"
                      name="atendimento_site"
                      fullWidth
                      label="Site de Atendimento"
                      value={editedFields.atendimento_site !== undefined ? editedFields.atendimento_site : (programa?.atendimento_site || "")}
                      onChange={handleChange("atendimento_site")}
                    />
                  </Box>
                </Grid>
                <Grid size={{ md: 6, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DatePicker
                      label="Início da Vigência da Política"
                      value={editedFields.politica_inicio_vigencia !== undefined ? editedFields.politica_inicio_vigencia : (programa?.politica_inicio_vigencia ? dayjs(programa.politica_inicio_vigencia) : null)}
                      onChange={handleDateChange("politica_inicio_vigencia")}
                      slotProps={{ textField: { id: "programa-politica-inicio-vigencia", name: "politica_inicio_vigencia", fullWidth: true } }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ md: 6, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DatePicker
                      label="Prazo de Revisão da Política"
                      value={editedFields.politica_prazo_revisao !== undefined ? editedFields.politica_prazo_revisao : (programa?.politica_prazo_revisao ? dayjs(programa.politica_prazo_revisao) : null)}
                      onChange={handleDateChange("politica_prazo_revisao")}
                      slotProps={{ textField: { id: "programa-politica-prazo-revisao", name: "politica_prazo_revisao", fullWidth: true } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        <Grid>
          <Accordion sx={accordionStyles}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon fontSize="large" color="primary" sx={{ ml: 1 }} />
                <Typography variant="h5" style={{ fontWeight: "500" }}>Responsabilidades</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ md: 3, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="responsavel-controle-interno-label">Responsável Controle Interno</InputLabel>
                      <Select
                        label="responsavel-controle-interno-label"
                        id="responsavel-controle-interno"
                        name="responsavel_controle_interno"
                        value={editedFields.responsavel_controle_interno !== undefined ? editedFields.responsavel_controle_interno : (programa?.responsavel_controle_interno || "")}
                        onChange={handleChange("responsavel_controle_interno")}
                      >
                        {responsaveis.map((responsavel: any) => (
                          <MenuItem key={responsavel.id} value={responsavel.id}>
                            {responsavel.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ md: 3, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="responsavel-si-label">Responsável SI</InputLabel>
                      <Select
                        label="responsavel-si-label"
                        id="responsavel-si"
                        name="responsavel_si"
                        value={editedFields.responsavel_si !== undefined ? editedFields.responsavel_si : (programa?.responsavel_si || "")}
                        onChange={handleChange("responsavel_si")}
                      >
                        {responsaveis.map((responsavel: any) => (
                          <MenuItem key={responsavel.id} value={responsavel.id}>
                            {responsavel.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ md: 3, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="responsavel-privacidade-label">Responsável Privacidade</InputLabel>
                      <Select
                        label="responsavel-privacidade-label"
                        id="responsavel-privacidade"
                        name="responsavel_privacidade"
                        value={editedFields.responsavel_privacidade !== undefined ? editedFields.responsavel_privacidade : (programa?.responsavel_privacidade || "")}
                        onChange={handleChange("responsavel_privacidade")}
                      >
                        {responsaveis.map((responsavel: any) => (
                          <MenuItem key={responsavel.id} value={responsavel.id}>
                            {responsavel.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ md: 3, sm: 6, xs: 12}}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel>Responsável TI</InputLabel>
                      <Select
                        label="responsavel-ti-label"
                        id="responsavel-ti"
                        name="responsavel_ti"
                        value={editedFields.responsavel_ti !== undefined ? editedFields.responsavel_ti : (programa?.responsavel_ti || "")}
                        onChange={handleChange("responsavel_ti")}
                      >
                        {responsaveis.map((responsavel: any) => (
                          <MenuItem key={responsavel.id} value={responsavel.id}>
                            {responsavel.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
                  <Responsavel programa={programaId} onUpdate={fetchResponsaveis} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {programa?.setor === 1 && (
          <Grid>
            <Accordion sx={accordionStyles}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalanceIcon fontSize="large" color="primary" sx={{ ml: 1 }} />
                  <Typography variant="h5" style={{ fontWeight: "500" }}>Uso da SGD</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid size={{ md: 3, sm: 6, xs: 12}}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        id="programa-sgd-numero-documento-nota-tecnica"
                        name="sgd_numero_documento_nota_tecnica"
                        fullWidth
                        label="Número Documento Nota Técnica"
                        value={editedFields.sgd_numero_documento_nota_tecnica !== undefined ? editedFields.sgd_numero_documento_nota_tecnica : (programa?.sgd_numero_documento_nota_tecnica || "")}
                        onChange={handleChange("sgd_numero_documento_nota_tecnica")}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ md: 3, sm: 6, xs: 12}}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        id="programa-sgd-versao-diagnostico-enviado"
                        name="sgd_versao_diagnostico_enviado"
                        fullWidth
                        label="Versão Diagnóstico Enviado"
                        value={editedFields.sgd_versao_diagnostico_enviado !== undefined ? editedFields.sgd_versao_diagnostico_enviado : (programa?.sgd_versao_diagnostico_enviado || "")}
                        onChange={handleChange("sgd_versao_diagnostico_enviado")}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ md: 3, sm: 6, xs: 12}}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        id="programa-sgd-versao-diagnostico"
                        name="sgd_versao_diagnostico"
                        fullWidth
                        label="Versão Diagnóstico"
                        value={editedFields.sgd_versao_diagnostico !== undefined ? editedFields.sgd_versao_diagnostico : (programa?.sgd_versao_diagnostico || "")}
                        onChange={handleChange("sgd_versao_diagnostico")}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ md: 3, sm: 6, xs: 12}}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <DatePicker
                        label="Data Limite Retorno"
                        value={editedFields.sgd_data_limite_retorno !== undefined ? editedFields.sgd_data_limite_retorno : (programa?.sgd_data_limite_retorno ? dayjs(programa.sgd_data_limite_retorno) : null)}
                        onChange={handleDateChange("sgd_data_limite_retorno")}
                        slotProps={{ textField: { id: "programa-sgd-data-limite-retorno", name: "sgd_data_limite_retorno", fullWidth: true } }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ md: 3, sm: 6, xs: 12}}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <DatePicker
                        label="Retorno Data"
                        value={editedFields.sgd_retorno_data !== undefined ? editedFields.sgd_retorno_data : (programa?.sgd_retorno_data ? dayjs(programa.sgd_retorno_data) : null)}
                        onChange={handleDateChange("sgd_retorno_data")}
                        slotProps={{ textField: { id: "programa-sgd-retorno-data", name: "sgd_retorno_data", fullWidth: true } }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Programa;
