"use client";
import React, { useReducer, useEffect, useState } from "react";
import {
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Alert,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { initialState, reducer } from "./state";
import Diagnostico from "./diagnostico";
import Programa from "./programa";
import Responsavel from "./responsavel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import dayjs from "dayjs";

const DiagnosticoPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [expanded, setExpanded] = useState<string | false>(false);

  const fetchResponsaveis = async (programaId: number) => {
    const { data } = await supabaseBrowserClient
      .from("responsavel")
      .select("id, nome, departamento, email")
      .eq("programa", programaId)
      .order("nome", { ascending: true });
    return data || [];
  };

  useEffect(() => {
    const fetchProgramas = async () => {
      const { data } = await supabaseBrowserClient
        .from("programa")
        .select("*")
        .order("id", { ascending: true });
      dispatch({ type: "SET_PROGRAMAS", payload: data });
    };

    const fetchDiagnosticos = async () => {
      const { data } = await supabaseBrowserClient
        .from("diagnostico")
        .select("*") 
        .order("id", { ascending: true });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: data });
    };

    

    fetchProgramas();
    fetchDiagnosticos();
    // fetchControlesAndMedidas();
  }, []);
  
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

  const handleControleFetch = async (diagnosticoId: number): Promise<void> => {
    const { data } = await supabaseBrowserClient
      .from("controle")
      .select("*")
      .eq("diagnostico", diagnosticoId)
      //.eq("programa", programaId)
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
    setToastMessage("Resposta atualizada");
    setToastSeverity("success");
  };

  const handleMedidaChange = async (medidaId: number, controleId: number, field: string, value: any) => {
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
      setToastMessage("Resposta atualizada");
      setToastSeverity("success");
    } else {
      setToastMessage(`Erro ao atualizar: ${error.message}`);
      setToastSeverity("error");
    }
  };

  const handleProgramaFetch = async (programaId: number) => {
    const responsaveis = await fetchResponsaveis(programaId);
    dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

    if (expanded !== programaId.toString()) {
      const { data: diagnosticos } = await supabaseBrowserClient
        .from("diagnostico")
        .select("*")
        //.eq("programa", programaId)
        .order("id", { ascending: true });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticos });
    }

    setExpanded(expanded === programaId.toString() ? false : programaId.toString());
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        {state.programas.map((programa: any) => (
          <Accordion
            key={programa.id}
            expanded={expanded === programa.id.toString()}
            onChange={() => handleProgramaFetch(programa.id)}
            slotProps={{ transition: { unmountOnExit: true } }}
            style={{ border: "2px solid grey" }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              
          <Grid container spacing={2}>
        
          <Grid size={{ md: 6, sm: 6, xs: 12}}>
          <Typography variant="h5" style={{ fontWeight: "400" }}>
                Programa n.º {programa.id}
          </Typography>
          </Grid>
          <Grid size={{ md: 3, sm: 3, xs: 12}}>
            <TextField
              id={programa.id}
              name="orgao"
              fullWidth
              label="Órgão"
              value={programa?.orgao || ""}
              //onChange={handleChange("orgao")}
            />
          </Grid>
          
        </Grid>
            </AccordionSummary>
            <AccordionDetails>
              
                  <Programa key={programa.id} programaId={programa.id} /> 
                
              <Accordion style={{ border: "1px solid grey" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h5" style={{ fontWeight: "400" }}>Responsáveis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {state.responsaveis.map((responsavel: any) => (
                    <Responsavel 
                      key={responsavel.id} 
                      id={responsavel.id} 
                      nome={responsavel.nome}
                      programa={responsavel.programa} 
                      departamento={responsavel.departamento} 
                      numero={responsavel.numero} 
                      email={responsavel.email} 
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
              <Accordion
                style={{ border: "1px solid grey" }}
                onChange={() => fetchControlesAndMedidas()}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h5" style={{ fontWeight: "400" }}>Diagnóstico</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {state.diagnosticos.map((diagnostico: any) => (
                    
                    <Diagnostico
                      key={diagnostico.id}
                      programa={programa}
                      diagnostico={diagnostico}
                      state={state}
                      handleControleFetch={handleControleFetch}
                      handleINCCChange={handleINCCChange}
                      handleMedidaFetch={handleMedidaFetch}
                      handleMedidaChange={handleMedidaChange}
                      responsaveis={state.responsaveis}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        ))}
      </LocalizationProvider>
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={6000}
        onClose={() => setToastMessage(null)}
      >
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DiagnosticoPage;
