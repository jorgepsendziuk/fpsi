"use client";
import React, { useReducer, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Autocomplete,
  Typography,
  TableHead,
  Paper,
  TableContainer,
  Chip,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabaseBrowserClient } from "@utils/supabase/client";

const initialState = {
  diagnosticos: [],
  controles: {},
  medidas: {},
  respostas: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_DIAGNOSTICOS":
      return { ...state, diagnosticos: action.payload };
    case "SET_CONTROLES":
      return {
        ...state,
        controles: {
          ...state.controles,
          [action.diagnosticoId]: action.payload,
        },
      };
    case "SET_MEDIDAS":
      return {
        ...state,
        medidas: { ...state.medidas, [action.controleId]: action.payload },
      };
    case "SET_RESPOSTAS":
      return { ...state, respostas: action.payload };
    case "UPDATE_MEDIDA":
      return {
        ...state,
        medidas: {
          ...state.medidas,
          [action.controleId]: state.medidas[action.controleId].map((medida) =>
            medida.id === action.medidaId
              ? { ...medida, [action.field]: action.value }
              : medida
          ),
        },
      };
    default:
      return state;
  }
}

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

    fetchDiagnosticos();
    fetchRespostas();
  }, []);

  const handleControleFetch = async (diagnosticoId) => {
    const { data } = await supabaseBrowserClient
      .from("controle")
      .select("*")
      .eq("diagnostico", diagnosticoId)
      .order("id", { ascending: true });
    dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
  };

  const handleMedidaFetch = async (controleId) => {
    const { data } = await supabaseBrowserClient
      .from("medida")
      .select("*")
      .eq("id_controle", controleId)
      .order("id", { ascending: true });
    dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
  };

  const handleRespostaChange = async (medidaId, controleId, newValue) => {
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

  const handleJustificativaChange = async (medidaId, controleId, newValue) => {
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

  const respostas = [
    { id: 1, peso: 1,     label: "Adota em maior parte ou totalmente" },
    { id: 2, peso: 0.75,  label: "Adota em menor parte" },
    { id: 3, peso: 0.5,   label: "Adota parcialmente" },
    { id: 4, peso: 0.25,  label: "Há decisão formal ou plano aprovado para implementar"},
    { id: 5, peso: 0,     label: "A organização não adota essa medida" },
    { id: 6, peso: null,  label: "Não se aplica" },
  ];

  return (
    <div>

      {state.diagnosticos.map((diagnostico: any) => (
        <Accordion
          slotProps={{ transition: { unmountOnExit: true } }}
          component={Paper}
          elevation={10}
          style={{
            backgroundColor: diagnostico.cor,
            margin: "0px",
            fontWeight: "800",
          }}
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
              <Typography
                align="center"
                variant="caption"
                style={{ fontWeight: "800", padding: "" }}
              >
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
                width: 130,
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
                {diagnostico.indice_valor}
              </Typography>
              <Typography
                variant="h6"
                align="center"
                style={{ fontWeight: "800", padding: "" }}
              >
                {diagnostico.maturidade}
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
                      <TableCell >
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
                                width: "10%",
                                padding: 1,
                                borderRadius: 2,
                                bgcolor: "#cccccc50",
                              }}
                            >
                              <Box sx={{}}>
                                <Typography
                                  variant="caption"
                                  style={{ fontWeight: "800", padding: "" }}
                                >
                                  NCC
                                </Typography>
                              </Box>
                              <Box sx={{}}>
                                <TextField
                                  sx={{
                                    width: "100%",
                                    fontWeight: "800",
                                    padding: "",
                                  }}
                                  select
                                  label={controle.nivel}
                                />
                              </Box>
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
                                    NÍVEIS DE CAPACIDADE DO CONTROLE
                                  </Typography>
                                </Box>
                                <Box sx={{}}>
                                  <Typography variant="caption">
                                    {controle.texto}
                                  </Typography>
                                </Box>
                              </Box>
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

                                  <Autocomplete
                                    sx={{
                                      width: "40%",
                                      padding: 1,
                                      color: "grey",
                                    }}
                                    options={respostas}
                                    getOptionLabel={(option) => option.label}
                                    value={
                                      respostas.find(
                                        (r) => r.id === medida.resposta
                                      ) || null
                                    }
                                    aria-label={medida.id_medida}
                                    onClick={(event) => event.stopPropagation()}
                                    onFocus={(event) => event.stopPropagation()}
                                    onChange={(event, newValue) =>
                                      handleRespostaChange(
                                        medida.id,
                                        controle.id,
                                        newValue?.id
                                      )
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        color="grey"
                                        focused
                                        {...params}
                                        label="Resposta"
                                      />
                                    )}
                                  />

                                  <Typography sx={{ width: 50, color: "#999" }}>
                                    <br />
                                    {respostas.find(
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
                                    <i>"{medida.descricao}"</i>
                                  </Typography>

                                  <TextField
                                    style={{ width: "100%", padding: 10 }}
                                    label="Justificativa"
                                    color="grey"
                                    value={medida.justificativa}
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
                                    color="grey"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "30%", padding: 10 }}
                                    label="Observação do Órgão para SGD"
                                    color="grey"
                                    multiline
                                    focused
                                  />

                                  <TextField
                                    style={{ width: "30%", padding: 10 }}
                                    color="grey"
                                    select
                                    focused
                                    label="Responsável"
                                  />

                                  <TextField
                                    style={{ width: "20%", padding: 10 }}
                                    label="Previsão de Inicio"
                                    color="grey"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "20%", padding: 10 }}
                                    label="Previsão de Fim"
                                    color="grey"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "20%", padding: 10 }}
                                    label="Status Medida"
                                    color="grey"
                                    multiline
                                    focused
                                  />
                                  <TextField
                                    style={{ width: "40%", padding: 10 }}
                                    label="Nova resposta"
                                    color="grey"
                                    multiline
                                    focused
                                  />
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                      {/* <TableCell  align="center" style={{ verticalAlign: "top" }}>
                                <Accordion sx={{ width: 200 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h5"  align="center" style={{ verticalAlign: "top" }}>-</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                <Typography>O controle atinge seu objetivo por meio da aplicação de um conjunto básico, porém completo, de atividades que podem ser caracterizadas como realizadas.</Typography>
                                </AccordionDetails>
                                </Accordion>
                            </TableCell> */}
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
