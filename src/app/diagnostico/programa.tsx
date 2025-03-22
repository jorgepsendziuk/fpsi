"use client";
import React, { useEffect, useState } from "react";
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps, TextFieldVariants } from "@mui/material";
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
import GroupIcon from '@mui/icons-material/Group';

const Programa = ({ programaId }: { programaId: number }) => {
  const [programa, setPrograma] = useState<Programa>({} as Programa);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);

  useEffect(() => {
    const fetchProgramas = async () => {
      const { data } = await supabaseBrowserClient
        .from("programa")
        .select("*")
        .eq("id", programaId)
        .order("id", { ascending: true });
      setPrograma(data ? data[0] : undefined);
    };

    const fetchResponsaveis = async () => {
      const { data } = await supabaseBrowserClient
        .from("responsavel")
        .select("*")
        .order("nome", { ascending: true });
      setResponsaveis(data || []);
    };

    fetchProgramas();
    fetchResponsaveis();
  }, [programaId]);

  const handleChange = (field: string) => (event: any) => {
    setPrograma({ ...programa, [field]: event.target.value });
  };

  const handleDateChange = (field: string) => (date: any) => {
    setPrograma({ ...programa, [field]: date });
  };

  const handleSave = async () => {
    await supabaseBrowserClient
      .from("programa")
      .update(programa)
      .eq("id", programaId);
  };

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
      <Grid container spacing={2}> 
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="responsabilidades-content"
            id="responsabilidades-header"
          >
            <GroupIcon />
            <Box sx={{ ml: 2 }}>RESPONSABILIDADES</Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ md: 3, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel id="responsavel-controle-interno-label" >Responsável Controle Interno</InputLabel>
                  <Select
                    label="responsavel-controle-interno-label"
                    id="responsavel-controle-interno"
                    name="responsavel_controle_interno"
                    value={programa?.responsavel_controle_interno || ""}
                    onChange={handleChange("responsavel_controle_interno")}
                  >
                    {responsaveis.map((responsavel: any) => (
                      <MenuItem key={responsavel.id} value={responsavel.id}>
                        {responsavel.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ md: 3, sm: 6, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel id="responsavel-si-label" >Responsável SI</InputLabel>
                  <Select
                    label="responsavel-si-label"
                    id="responsavel-si"
                    name="responsavel_si"
                    value={programa?.responsavel_si || ""}
                    onChange={handleChange("responsavel_si")}
                  >
                    {responsaveis.map((responsavel: any) => (
                      <MenuItem key={responsavel.id} value={responsavel.id}>
                        {responsavel.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ md: 3, sm: 6, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel id="responsavel-privacidade-label" >Responsável Privacidade</InputLabel>
                  <Select
                    label="responsavel-privacidade-label"
                    id="responsavel-privacidade"
                    name="responsavel_privacidade"
                    value={programa?.responsavel_privacidade || ""}
                    onChange={handleChange("responsavel_privacidade")}
                  >
                    {responsaveis.map((responsavel: any) => (
                      <MenuItem key={responsavel.id} value={responsavel.id}>
                        {responsavel.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ md: 3, sm: 6, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel >Responsável TI</InputLabel>
                  <Select
                    label="responsavel-ti-label"
                    id="responsavel-ti"
                    name="responsavel_ti"
                    value={programa?.responsavel_ti || ""}
                    onChange={handleChange("responsavel_ti")}
                  >
                    {responsaveis.map((responsavel: any) => (
                      <MenuItem key={responsavel.id} value={responsavel.id}>
                        {responsavel.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {programa?.setor === 1 && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="uso-da-sgd-content"
              id="uso-da-sgd-header"
            >
              <AccountBalanceIcon />
              <Box sx={{ ml: 2 }}>USO DA SGD</Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ md: 3, sm: 3, xs: 12}}>
                  <TextField
                    id="programa-sgd-numero-documento-nota-tecnica"
                    name="sgd_numero_documento_nota_tecnica"
                    fullWidth
                    label="Número Documento Nota Técnica"
                    value={programa?.sgd_numero_documento_nota_tecnica || ""}
                    onChange={handleChange("sgd_numero_documento_nota_tecnica")}
                  />
                </Grid>
                <Grid size={{ md: 3, sm: 3, xs: 12}}>
                  <TextField
                    id="programa-sgd-versao-diagnostico-enviado"
                    name="sgd_versao_diagnostico_enviado"
                    fullWidth
                    label="Versão Diagnóstico Enviado"
                    value={programa?.sgd_versao_diagnostico_enviado || ""}
                    onChange={handleChange("sgd_versao_diagnostico_enviado")}
                  />
                </Grid> 
                <Grid size={{ md: 3, sm: 3, xs: 12}}>
                  <TextField
                    id="programa-sgd-versao-diagnostico"
                    name="sgd_versao_diagnostico"
                    fullWidth
                    label="Versão Diagnóstico"
                    value={programa?.sgd_versao_diagnostico || ""}
                    onChange={handleChange("sgd_versao_diagnostico")}
                  />
                </Grid> 
                <Grid size={{ md: 3, sm: 3, xs: 12}}>
                  <DatePicker
                    label="Data Limite Retorno"
                    value={dayjs(programa?.sgd_data_limite_retorno) || null}
                    onChange={handleDateChange("sgd_data_limite_retorno")}
                    slotProps={{ textField: { id: "programa-sgd-data-limite-retorno", name: "sgd_data_limite_retorno", fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ md: 3, sm: 3, xs: 12}}>
                  <DatePicker
                    label="Retorno Data"
                    value={dayjs(programa?.sgd_retorno_data) || null}
                    onChange={handleDateChange("sgd_retorno_data")}
                    slotProps={{ textField: { id: "programa-sgd-retorno-data", name: "sgd_retorno_data", fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      </Grid>
    </Box>
  );
};

export default Programa;
