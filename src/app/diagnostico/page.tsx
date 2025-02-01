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

const DiagnosticoPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [responsaveis, setResponsaveis] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiagnosticos = async () => {
      const { data } = await supabaseBrowserClient
        .from("diagnostico")
        .select("*")
        .order("id", { ascending: true });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: data });
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

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Programa </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Programa />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Responsável</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Responsavel />
          </AccordionDetails>
        </Accordion>
        {state.diagnosticos.map((diagnostico: any) => (
          <Diagnostico
            key={diagnostico.id}
            diagnostico={diagnostico}
            state={state}
            handleControleFetch={handleControleFetch}
            handleINCCChange={handleINCCChange}
            handleMedidaFetch={handleMedidaFetch}
            handleMedidaChange={handleMedidaChange}
            responsaveis={responsaveis}
          />
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
