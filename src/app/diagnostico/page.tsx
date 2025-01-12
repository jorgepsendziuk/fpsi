"use client";
import React, { useReducer, useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Paper,
  TableContainer,
  Chip,
  Box,
  Select,
  ListItemText,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { initialState, reducer, State, Action } from "./state";
import { calculateSumOfResponsesForDiagnostico, getMaturityLabel, incc, respostas, respostasimnao, calculateMaturityIndexForControle } from "./utils";

const DiagnosticoPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
  };

  const handleJustificativaChange = async (medidaId: number, controleId: number, newValue: string): Promise<void> => {
    await supabaseBrowserClient
      .from("medida")
      .update({ justificativa: newValue })
      .eq("id", medidaId);
    dispatch({
      type: "UPDATE_MEDIDA",
      medidaId,
      controleId,
      field: "justificativa",
      value: newValue,
    });
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
  };

  return (
    <div>
      {state.diagnosticos.map((diagnostico: any) => (
        <Accordion
          slotProps={{ transition: { unmountOnExit: true } }}
          style={{ backgroundColor: diagnostico.cor }}
          key={diagnostico.id}
          onChange={() => handleControleFetch(diagnostico.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box style={{ width: "70%" }}>
              <Typography
                variant="h6"
                style={{ width: "80%", fontWeight: "800", padding: "10px" }}
              >
                {diagnostico.descricao}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 130,
                padding: 3,
                borderRadius: 2,
                bgcolor: "#ffffff",
              }}
            >
              <Typography align="center" style={{ fontWeight: "400" }}>
                MATURIDADE
              </Typography>
              <Typography
                align="center"
                variant="h5"
                style={{ fontWeight: "800", padding: "" }}
              >
                {diagnostico.indice}
              </Typography>
            </Box>
            <Box
              sx={{
                width: "auto",
                minWidth: 200,
                padding: 2,
                borderRadius: 2,
                bgcolor: "#ffffff",
              }}
            >
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
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer
              component={Paper}
              elevation={10}
              style={{ backgroundColor: "#dadada", margin: "0px" }}
            >
              <Table>
                <TableBody>
                  {state.controles[diagnostico.id]?.map((controle) => (
                    <TableRow key={controle.id}>
                      <TableCell
                        align="center"
                        style={{ verticalAlign: "top", padding: 10 }}
                      >
                        <Typography variant="caption" align="center">
                          ID
                        </Typography>
                        <Typography variant="h5" align="center">
                          {controle.numero}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Accordion
                          slotProps={{ transition: { unmountOnExit: true } }}
                          key={controle.id}
                          onChange={() => handleMedidaFetch(controle.id)}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box style={{ width: "50%" }}>
                              <Typography
                                style={{ fontWeight: "600", padding: "10px" }}
                              >
                                {controle.nome}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                width: "50%",
                                padding: 1,
                                borderRadius: 2,
                                bgcolor: "#cccccc50",
                              }}
                            >
                              <Box sx={{}}>
                                <Box sx={{}}>
                                  <Typography
                                    variant="caption"
                                    style={{ fontWeight: "800", padding: "" }}
                                  >
                                    NCC - NÍVEIS DE CAPACIDADE DO CONTROLE
                                  </Typography>
                                </Box>
                                <Box sx={{}}>
                                  <Typography variant="caption">
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
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                width: "10%",
                                padding: 1,
                                borderRadius: 2,
                                bgcolor: "#cccccc50",
                              }}
                            >
                              <Typography
                                variant="caption"
                                align="center"
                                style={{ fontWeight: "800", padding: "" }}
                              >
                                Índice de Maturidade
                              </Typography>
                              <Typography variant="h6" align="center">
                                {calculateMaturityIndexForControle(controle, state)}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {state.medidas[controle.id]?.map((medida) => (
                              <Accordion
                                slotProps={{
                                  transition: { unmountOnExit: true },
                                }}
                                key={medida.id}
                                component={Paper}
                                elevation={10}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-label={medida.id_medida}
                                  aria-controls={medida.id_medida}
                                  id={medida.id_medida}
                                >
                                  <Typography
                                    sx={{
                                      marginTop: 2,
                                      width: "5%",
                                    }}
                                    variant="h6"
                                    align="center"
                                  >
                                    {medida.id_medida}
                                  </Typography>

                                  <Typography sx={{ width: "40%", padding: 1 }}>
                                    {medida.medida}
                                  </Typography>

                                  <Select
                                    sx={{
                                      width: "40%",
                                      margin: 1
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
                                          whiteSpace: "normal"
                                        }}/>
                                      </MenuItem>
                                    ))}
                                  </Select>

                                  <Typography sx={{ width: 50, color: "#999" }}>
                                    <br />
                                    {(controle.diagnostico === 1 ? respostasimnao : respostas).find(
                                      (resposta) =>
                                        resposta.id === medida.resposta
                                    )?.peso || "-"}
                                  </Typography>
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
                                      width: "15%",
                                      padding: 1,
                                      verticalAlign: "center",
                                      align: "center",
                                    }}
                                    label="ATRASADO"
                                  />
                                </AccordionSummary>
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

                                  <TextField
                                    style={{ width: "100%", padding: 10 }}
                                    label="Justificativa"
                                    color="primary"
                                    value={medida.justificativa || ""}
                                    multiline
                                    focused
                                    onChange={(event) =>
                                      handleJustificativaChange(
                                        medida.id,
                                        controle.id,
                                        event.target.value
                                      )
                                    }
                                  />
                                  <TextField
                                    style={{ width: "40%", padding: 10 }}
                                    label="Encaminhamento interno (para uso do órgão )"
                                    color="primary"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "30%", padding: 10 }}
                                    label="Observação do Órgão para SGD"
                                    color="primary"
                                    multiline
                                    focused
                                  />

                                  <TextField
                                    style={{ width: "30%", padding: 10 }}
                                    color="primary"
                                    //select
                                    focused
                                    label="Responsável"
                                  />

                                  <TextField
                                    style={{ width: "20%", padding: 10 }}
                                    label="Previsão de Inicio"
                                    color="primary"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "20%", padding: 10 }}
                                    label="Previsão de Fim"
                                    color="primary"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "20%", padding: 10 }}
                                    label="Status Medida"
                                    color="primary"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "40%", padding: 10 }}
                                    label="Nova resposta"
                                    color="primary"
                                    multiline
                                    focused
                                  />
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default DiagnosticoPage;
