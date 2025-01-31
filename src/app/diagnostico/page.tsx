"use client";
import React, { useReducer, useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Paper,
  Chip,
  Select,
  ListItemText,
  MenuItem,
  Snackbar,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import Grid from '@mui/material/Grid2';

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { initialState, reducer, State, Action } from "./state";
import { calculateSumOfResponsesForDiagnostico, getMaturityLabel, incc, respostas, respostasimnao, calculateMaturityIndexForControle } from "./utils";
import SaveIcon from "@mui/icons-material/Save";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';

const DiagnosticoPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiagnosticos = async () => {
      const { data } = await supabaseBrowserClient
        .from("diagnostico")
        .select("*")
        .order("id", { ascending: true });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: data });
    };

    const fetchRespostas = async () => {
      const { data } = await supabaseBrowserClient
        .from("resposta")
        .select("*")
        .order("id", { ascending: true });
      dispatch({ type: "SET_RESPOSTAS", payload: data });
    };

    const fetchResponsaveis = async () => {
      const { data } = await supabaseBrowserClient
        .from("responsavel")
        .select("id, nome, departamento, email")
        .order("nome", { ascending: true });
      setResponsaveis(data || []);
    };

    const fetchControlesAndMedidas = async () => {
      const diagnosticos = await supabaseBrowserClient
        .from("diagnostico")
        .select("id")
        .order("id", { ascending: true });
      for (const diagnostico of diagnosticos.data || []) {
        const controles = await supabaseBrowserClient
          .from("controle")
          .select("id")
          .eq("diagnostico", diagnostico.id)
          .order("numero", { ascending: true });
        for (const controle of controles.data || []) {
          await handleMedidaFetch(controle.id);
        }
        await handleControleFetch(diagnostico.id);
      }
    };

    fetchDiagnosticos();
    fetchRespostas();
    fetchResponsaveis();
    fetchControlesAndMedidas();
  }, []);

  const handleControleFetch = async (diagnosticoId: number): Promise<void> => {
    const { data } = await supabaseBrowserClient
      .from("controle")
      .select("*")
      .eq("diagnostico", diagnosticoId)
      .order("id", { ascending: true });
    dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
  };

  const handleMedidaFetch = async (controleId: number): Promise<void> => {
    const { data } = await supabaseBrowserClient
      .from("medida")
      .select("*")
      .eq("id_controle", controleId)
      .order("id_medida", { ascending: true });
    dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
  };

  const handleRespostaChange = async (medidaId: number, controleId: number, newValue: number): Promise<void> => {
    await supabaseBrowserClient
      .from("medida")
      .update({ resposta: newValue })
      .eq("id", medidaId);
    dispatch({
      type: "UPDATE_MEDIDA",
      medidaId,
      controleId,
      field: "resposta",
      value: newValue,
    });
    setToastMessage("Field updated successfully");
  };

  const handleINCCChange = async (controleId: number, diagnosticoId: number, newValue: number): Promise<void> => {
    await supabaseBrowserClient
      .from("controle")
      .update({ nivel: newValue })
      .eq("id", controleId);
    dispatch({
      type: "UPDATE_CONTROLE",
      diagnosticoId,
      controleId,
      field: "nivel",
      value: newValue,
    });
    setToastMessage("Field updated successfully");
  };

  const handleSaveField = async (medidaId: number, controleId: number, field: string, value: any) => {
    const updatePayload = { [field]: value };
    const { error } = await supabaseBrowserClient
      .from("medida")
      .update(updatePayload)
      .eq("id", medidaId);

    if (!error) {
      dispatch({
        type: "UPDATE_MEDIDA",
        medidaId,
        controleId,
        field,
        value,
      });
      setToastMessage("Field updated successfully");
    } else {
      setToastMessage(`Error updating field: ${error.message}`);
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
    
      {state.diagnosticos.map((diagnostico: any) => (
        <Accordion
          slotProps={{ transition: { unmountOnExit: true } }}
          style={{ backgroundColor: diagnostico.cor, 
            color: "black", 
            width: "100%" }}
          key={diagnostico.id}
          onChange={() => handleControleFetch(diagnostico.id)}
        >
          
          <AccordionSummary   expandIcon={<ExpandMoreIcon />}>
            
          <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={0} >
            <Grid  size={{ xs: 12, sm: 12, md: 8 }}
              style={{ textAlign: "center"  }}>
            <Typography
                variant="h5"
                style={{ fontWeight: "200" }}
              >
                DIAGNÓSTICO DE
              </Typography>
              <Typography
                variant="h4"
                style={{ fontWeight: "800", padding: "0" }}
              >
                {diagnostico.descricao}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}
            style={{ textAlign: "center"  }}>
              
                <Typography style={{ fontWeight: "400" }}>
                  MATURIDADE
                </Typography>
                <Typography variant="h5"
                  style={{ fontWeight: "800" }}
                >
                  {diagnostico.indice}
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}
             style={{ textAlign: "center"  }}>
              
                <Typography
                  variant="h4"
                  align="center"
                  style={{ color: "red", fontWeight: "800", padding: "" }}
                >
                  {calculateSumOfResponsesForDiagnostico(diagnostico.id, state)}
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  style={{ fontWeight: "800", padding: "" }}
                >
                  {diagnostico.maturidade}
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  style={{ fontWeight: "800", padding: "" }}
                >
                  {getMaturityLabel(Number(calculateSumOfResponsesForDiagnostico(diagnostico.id, state)))}
                </Typography>
            </Grid>
          </Grid>
          </Box>
          
            </AccordionSummary>
          <AccordionDetails>
            {state.controles[diagnostico.id]?.map((controle) => (
              <Accordion style={{ border: "1px solid grey" }}
                slotProps={{ transition: { unmountOnExit: true } }}
                key={controle.id}
                onChange={() => handleMedidaFetch(controle.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container spacing={2} >
                    <Grid size={{ md: 4 }} alignItems="center">
                    <Typography
                          variant="caption"
                          style={{ fontWeight: "800", padding: "" }}
                        >
                          CONTROLE
                        </Typography>
                        <Typography
                        style={{ fontWeight: "600", padding: "10px" }}
                      >
                        ID {controle.numero} - {controle.nome}
                      </Typography>
                    </Grid>
                    <Grid size={{ md: 6 }}>
                      
                        <Typography
                          variant="caption"
                          style={{ fontWeight: "800", padding: "" }}
                        >
                          NCC - NÍVEIS DE CAPACIDADE DO CONTROLE
                        </Typography>
                        <Select
                          value={controle.nivel || ""}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            handleINCCChange(controle.id, diagnostico.id, parseInt(event.target.value.toString(), 10))
                          }
                        >
                          {incc.map((incc) => (
                            <MenuItem key={incc.id} value={incc.id}>
                              <Typography sx={{ whiteSpace: "normal" }}>
                                <b>{incc.nivel}</b> - {incc.label}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                    </Grid>
                    <Grid size={{ md: 2 }}
                    alignItems="center" style={{ textAlign: "center" }}>
                      
                        <Typography
                          variant="caption"
                          align="center"
                          style={{ fontWeight: "800", padding: "" }}
                        >
                          ÍNDICE DE MATURIDADE DO CONTROLE
                        </Typography>
                        <Typography variant="h6" align="center"
                        style={{ fontWeight: "800", padding: "" }}>
                          {calculateMaturityIndexForControle(controle, state)}
                        </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  {state.medidas[controle.id]?.map((medida) => (
                    <Accordion
                    style={{ border: "1px solid #ccc" }}
                      slotProps={{ transition: { unmountOnExit: true } }}
                      key={medida.id}
                      // component={Paper}
                      // elevation={1}
                    >
                      <Grid container spacing={0} >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-label={medida.id_medida}
                        aria-controls={medida.id_medida}
                        id={medida.id_medida}
                      >
                            <Grid size={{ md: 1, sm: 2, xs:1 }}>
                            <Typography
                              sx={{
                                marginTop: 2,
                              }}
                              variant="h6"
                              align="center"
                            >
                              {medida.id_medida}
                            </Typography>
                            </Grid>
                            <Grid size={{ md: 4, sm: 4, xs:5 }}>
                              <Typography sx={{ padding: 1 }}>
                                {medida.medida}
                              </Typography>
                            </Grid>
                            <Grid size={{ md: 5, sm: 4, xs:3 }}>
                              <Select
                                sx={{
                                  width: "90%",
                                  //margin: 1,
                                }}
                                value={medida.resposta || ""}
                                aria-label={medida.id_medida}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event, newValue) =>
                                  handleRespostaChange(
                                    medida.id,
                                    controle.id,
                                    parseInt(event.target.value.toString(), 10)
                                  )
                                }
                              >
                                {(controle.diagnostico === 1 ? respostasimnao : respostas).map((respostas) => (
                                  <MenuItem key={respostas.id} value={respostas.id}>
                                    <ListItemText
                                      primary={respostas.label}
                                      sx={{
                                        whiteSpace: "normal",
                                      }}
                                    />
                                  </MenuItem>
                                ))}
                              </Select>
                            </Grid>
                            <Grid size={{ md: 2, sm: 2, xs:3 }}>
                              
                              <Chip
                                color="error"
                                sx={{
                                  height: 40,
                                  marginTop: 2,
                                  opacity: 0.9,
                                  "& .MuiChip-label": {
                                    display: "block",
                                    whiteSpace: "normal",
                                  },
                                  //width: "100%",
                                  padding: 1,
                                  verticalAlign: "center",
                                  align: "center",
                                }}
                                label="ATRASADO"
                              />
                            </Grid>
                          
                        
                      </AccordionSummary></Grid>
                      <AccordionDetails>
                        <Typography
                          align="justify"
                          style={{
                            fontWeight: "60",
                            paddingBottom: 20,
                            paddingTop: 0,
                          }}
                        >
                          <i>&quot;{medida.descricao}&quot;</i>
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ md: 6 , sm: 12}}>
                            <TextField
                              id={`justificativa-${medida.id}`}
                              style={{ width: "100%"}}
                              label="Justificativa / Observação"
                              value={medida.justificativa || ""}
                              multiline
                              onChange={(event) =>
                                dispatch({
                                  type: "UPDATE_MEDIDA",
                                  medidaId: medida.id,
                                  controleId: controle.id,
                                  field: "justificativa",
                                  value: event.target.value,
                                })
                              }
                              slotProps={{
                                input: {
                                  endAdornment: (
                                    <SaveIcon
                                      onClick={() => handleSaveField(medida.id, controle.id, "justificativa", medida.justificativa)}
                                      style={{ cursor: "pointer", color: "grey" }}
                                    />
                                  ),
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6 , sm: 12}}>
                            <TextField
                              id={`encaminhamento_interno-${medida.id}`}
                              style={{ width: "100%"}}
                              value={medida.encaminhamento_interno || ""}
                              multiline
                              label="Encaminhamento interno (para uso do órgão)"
                              onChange={(event) =>
                                dispatch({
                                  type: "UPDATE_MEDIDA",
                                  medidaId: medida.id,
                                  controleId: controle.id,
                                  field: "encaminhamento_interno",
                                  value: event.target.value,
                                })
                              }
                              slotProps={{
                                input: {
                                  endAdornment: (
                                    <SaveIcon
                                      onClick={() => handleSaveField(medida.id, controle.id, "encaminhamento_interno", medida.encaminhamento_interno)}
                                      style={{ cursor: "pointer", color: "grey" }}
                                    />
                                  ),
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6 , sm: 12}}>
                            <TextField
                              id={`observacao_orgao-${medida.id}`}
                              style={{ width: "100%"}}
                              label="Observação do Órgão para SGD"
                              value={medida.observacao_orgao || ""}
                              multiline
                              onChange={(event) =>
                                dispatch({
                                  type: "UPDATE_MEDIDA",
                                  medidaId: medida.id,
                                  controleId: controle.id,
                                  field: "observacao_orgao",
                                  value: event.target.value,
                                })
                              }
                              slotProps={{
                                input: {
                                  endAdornment: (
                                    <SaveIcon
                                      onClick={() => handleSaveField(medida.id, controle.id, "observacao_orgao", medida.observacao_orgao)}
                                      style={{ cursor: "pointer", color: "grey" }}
                                    />
                                  ),
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6 , sm: 12}}>
                            <TextField
                              id={`nova_resposta-${medida.id}`}
                              style={{ width: "100%"}}
                              label="Nova resposta"
                              value={medida.nova_resposta || ""}
                              multiline
                              onChange={(event) =>
                                dispatch({
                                  type: "UPDATE_MEDIDA",
                                  medidaId: medida.id,
                                  controleId: controle.id,
                                  field: "nova_resposta",
                                  value: event.target.value,
                                })
                              }
                              slotProps={{
                                input: {
                                  endAdornment: (
                                    <SaveIcon
                                      onClick={() => handleSaveField(medida.id, controle.id, "nova_resposta", medida.nova_resposta)}
                                      style={{ cursor: "pointer", color: "grey" }}
                                    />
                                  ),
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6 , sm: 12}}>
                          <InputLabel id={`responsavel-label-${medida.id}`}>Responsável</InputLabel>
                              <Select 
                                labelId={`responsavel-label-${medida.id}`}
                                id={`responsavel-${medida.id}`}
                                size="small"
                                style={{ width: "100%"}}
                                value={medida.responsavel || "Responsável"}
                                label="Responsável<aa>"
                                onChange={(event,newValue) =>
                                  handleSaveField(medida.id, controle.id, "responsavel", event.target.value)
                                }
                              >
                                {responsaveis.map((responsavel) => (
                                  <MenuItem key={responsavel.id} value={responsavel.id}>
                                    {responsavel.nome} ({responsavel.departamento}) [{responsavel.email}]
                                  </MenuItem>
                                ))}
                              </Select>
                          </Grid>
                          <Grid size={{ md: 3 , sm: 12}}>
                          <DatePicker 
                            name={`previsao_inicio-${medida.id}`}
                            label="Previsão de Inicio" 
                            value={dayjs(medida.previsao_inicio) || null}
                            onChange={(newValue) =>
                              handleSaveField(medida.id, controle.id, "previsao_inicio", newValue)
                            }
                            />
                          </Grid>
                          <Grid size={{ md: 3 , sm: 12}}>
                          <DatePicker 
                            name={`previsao_fim-${medida.id}`}
                            label="Previsão de Fim" 
                            value={dayjs(medida.previsao_fim) || null}
                            onChange={(newValue) =>
                              handleSaveField(medida.id, controle.id, "previsao_fim", newValue)
                            }
                            />
                            
                          </Grid>
                          
                          
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={6000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
      </LocalizationProvider>
    </div>
  );
};

export default DiagnosticoPage;
