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

const initialState = {
  diagnosticos: [],
  controles: {},
  medidas: {},
  respostas: [],
};

interface Diagnostico {
  id: number;
  descricao: string;
  cor: string;
  indice: number;
  maturidade: number;
}

interface Controle {
  id: number;
  diagnostico: number;
  numero: number;
  nome: string;
  nivel: number;
}

interface Medida {
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
  grupo_imple: string;
  funcao_nist_csf: string;
  medida: string;
  descricao: string;
  resposta: number;
  justificativa: string;
}

interface Resposta {
  id: number;
  peso: number | null;
  label: string;
}

interface State {
  diagnosticos: Diagnostico[];
  controles: { [key: number]: Controle[] };
  medidas: { [key: number]: Medida[] };
  respostas: Resposta[];
}

interface Action {
  type: string;
  payload?: any;
  diagnosticoId?: number;
  controleId?: number;
  medidaId?: number;
  field?: string;
  value?: any;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DIAGNOSTICOS":
      return { ...state, diagnosticos: action.payload };
    case "SET_CONTROLES":
      return {
        ...state,
        controles: {
          ...state.controles,
          [action.diagnosticoId!]: action.payload,
        },
      };
    case "SET_MEDIDAS":
      return {
        ...state,
        medidas: { ...state.medidas, [action.controleId!]: action.payload },
      };
    case "SET_RESPOSTAS":
      return { ...state, respostas: action.payload };
    case "UPDATE_MEDIDA":
      return {
        ...state,
        medidas: {
          ...state.medidas,
          [action.controleId!]: state.medidas[action.controleId!].map((medida) =>
            medida.id === action.medidaId
              ? { ...medida, [action.field!]: action.value }
              : medida
          ),
        },
      };
    case "UPDATE_CONTROLE":
      return {
        ...state,
        controles: {
          ...state.controles,
          [action.diagnosticoId!]: state.controles[action.diagnosticoId!].map((controle) =>
            controle.id === action.controleId
              ? { ...controle, [action.field!]: action.value }
              : controle
          ),
        },
      };
    default:
      return state;
  }
}

const maturidade = [
  {id: 1, min: 0,   max: 0.29, label: "Inicial"},
  {id: 2, min: 0.3, max: 0.49, label: "Básico"},
  {id: 3, min: 0.5, max: 0.69, label: "Intermediário"},
  {id: 4, min: 0.7, max: 0.89, label: "Em Aprimoramento"},
  {id: 5, min: 0.9, max: 1,    label: "Aprimorado"}
];

const respostas = [
  { id: 1, peso: 1,     label: "Adota em maior parte ou totalmente" },
  { id: 2, peso: 0.75,  label: "Adota em menor parte" },
  { id: 3, peso: 0.5,   label: "Adota parcialmente" },
  { id: 4, peso: 0.25,  label: "Há decisão formal ou plano aprovado para implementar"},
  { id: 5, peso: 0,     label: "A organização não adota essa medida" },
  { id: 6, peso: null,  label: "Não se aplica" },
];

const incc = [
  { id: 1, nivel: 0, indice: 0,   label: "Ausência de capacidade para a implementação das medidas do controle, ou desconhecimento sobre o atendimento das medidas." },
  { id: 2, nivel: 1, indice: 20,  label: "O controle atinge mais ou menos seu objetivo, por meio da aplicação de um conjunto incompleto de atividades que podem ser caracterizadas como iniciais ou intuitivas (pouco organizadas)." },
  { id: 3, nivel: 2, indice: 40,  label: "O controle atinge seu objetivo por meio da aplicação de um conjunto básico, porém completo, de atividades que podem ser caracterizadas como realizadas." },
  { id: 4, nivel: 3, indice: 60,  label: "O controle atinge seu objetivo de forma muito mais organizada utilizando os recursos organizacionais. Além disso, o controle é formalizado por meio de uma política institucional, específica ou como parte de outra maior." },
  { id: 5, nivel: 4, indice: 80,  label: "O controle atinge seu objetivo, é bem definido e suas medidas são implementadas continuamente por meio de um processo decorrente da política formalizada." },
  { id: 6, nivel: 5, indice: 100, label: "O controle atinge seu objetivo, é bem definido, suas medidas são implementadas continuamente por meio de um processo e seu desempenho é mensurado quantitativamente por meio de indicadores." },
];

const respostasimnao = [
  { id: 1, peso: 1,  label: "Sim" },
  { id: 2, peso: 0,  label: "Não" },
];

const calculateSumOfResponses = (medidas: Medida[], diagnostico: number): number => {
  return medidas.reduce((sum, medida) => {
    let resposta: Resposta | undefined;
    if (diagnostico === 1) {
      resposta = respostasimnao.find((resposta) => resposta.id === medida.resposta);
    } else if (diagnostico === 2 || diagnostico === 3) {
      resposta = respostas.find((resposta) => resposta.id === medida.resposta);
    }
    return sum + (resposta?.peso || 0);
  }, 0);
};

const calculateSumOfResponsesForDiagnostico = (diagnosticoId: number, state: State): string | number => {
  const controles = state.controles[diagnosticoId] || [];
  const controleZero: Controle | undefined = controles.find((controle: Controle) => controle.numero === 0);
  const maturityIndexControleZero = controleZero ? parseFloat(calculateMaturityIndexForControle(controleZero, state)) : 0;

  if (diagnosticoId === 1) {
    return maturityIndexControleZero;
  } else if (diagnosticoId === 2 || diagnosticoId === 3) {
    const maturityIndices: number[] = controles
      .filter((controle: Controle) => controle.diagnostico === diagnosticoId)
      .map((controle: Controle) => parseFloat(calculateMaturityIndexForControle(controle, state)));

    const sumOfMaturityIndices = maturityIndices.reduce((sum, index) => sum + index, 0);
    const numberOfControles = maturityIndices.length;

    return numberOfControles > 0
      ? (
          ((maturityIndexControleZero * 4) + sumOfMaturityIndices) / numberOfControles
        ).toFixed(2)
      : 0;
  }
  return 0;
};

const calculateMaturityIndexForControle = (controle: Controle, state: State): string => {
  const medidas = state.medidas[controle.id] || [];
  const sumOfResponses = calculateSumOfResponses(medidas, controle.diagnostico);
  const numberOfMedidas = medidas.length;
  return numberOfMedidas > 0 ? 
    (
      ((sumOfResponses / numberOfMedidas) / 2) *
      (1 + (((incc.find((incc) => incc.id === controle.nivel)?.nivel || 0)) * 1 / 5))
    ).toFixed(2) 
    : "0";
};

const getMaturityLabel = (indice: number): string => {
  const maturity = maturidade.find(m => indice >= m.min && indice <= m.max);
  return maturity ? maturity.label : "";
};

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
    //fetchRespostas();
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

  // const handleJustificativaChange = async (medidaId: number, controleId: number, newValue: string): Promise<void> => {
  //   await supabaseBrowserClient
  //     .from("medida")
  //     .update({ justificativa: newValue })
  //     .eq("id", medidaId);
  //   dispatch({
  //     type: "UPDATE_MEDIDA",
  //     medidaId,
  //     controleId,
  //     field: "justificativa",
  //     value: newValue,
  //   });
  // };

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
          //component={Paper}
          //elevation={10}
          style={{
            backgroundColor: diagnostico.cor,
            //margin: "0px",
            
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
                style={{ fontWeight: "400",  }}
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
                                    //focused
                                    // onChange={(event) =>
                                    //   handleJustificativaChange(
                                    //     medida.id,
                                    //     controle.id,
                                    //     event.target.value
                                    //   )
                                    // }
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
