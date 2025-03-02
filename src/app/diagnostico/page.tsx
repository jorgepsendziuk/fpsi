"use client";
import React, { useReducer, useEffect, useState } from "react";
import {
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import { initialState, reducer } from "./state";
import * as dataService from "./services/dataService";
import ProgramHeader from "./components/ProgramHeader";
import ProgramCard from "./components/ProgramCard";
import { useMediaQuery } from '@mui/material';

const DiagnosticoPage = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [orgaos, setOrgaos] = useState<any[]>([]);
  const [editedValues, setEditedValues] = useState<{[key: number]: {cnpj?: string, razao_social?: string}}>({});

  useEffect(() => {
    const loadInitialData = async () => {
      const programasData = await dataService.fetchProgramas();
      dispatch({ type: "SET_PROGRAMAS", payload: programasData });

      const diagnosticosData = await dataService.fetchDiagnosticos();
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticosData });

      const orgaosData = await dataService.fetchOrgaos();
      setOrgaos(orgaosData);
    };

    loadInitialData();
  }, []);

  const fetchControlesAndMedidas = async (programaId: number) => {
    const diagnosticos = await dataService.fetchDiagnosticos();
    for (const diagnostico of diagnosticos) {
      const controles = await dataService.fetchControles(diagnostico.id, programaId);
      for (const controle of controles) {
        await handleMedidaFetch(controle.id);
      }
      await handleControleFetch(diagnostico.id, programaId);
    }
  };

  const handleControleFetch = async (diagnosticoId: number, programaId: number): Promise<void> => {
    const data = await dataService.fetchControles(diagnosticoId, programaId);
    dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
  };

  const handleMedidaFetch = async (controleId: number): Promise<void> => {
    const data = await dataService.fetchMedidas(controleId);
    dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
  };

  const handleINCCChange = async (controleId: number, diagnosticoId: number, newValue: number): Promise<void> => {
    await dataService.updateControleNivel(controleId, newValue);
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
    const { error } = await dataService.updateMedida(medidaId, field, value);

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
    const responsaveis = await dataService.fetchResponsaveis(programaId);
    dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

    if (expanded !== programaId.toString()) {
      const diagnosticos = await dataService.fetchDiagnosticos();
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticos });
    }

    setExpanded(expanded === programaId.toString() ? false : programaId.toString());
  };

  const handleCreatePrograma = async () => {
    const { data, error } = await dataService.createPrograma();

    if (!error && data) {
      dispatch({ type: "SET_PROGRAMAS", payload: [...state.programas, data] });
      setToastMessage("Programa criado com sucesso");
      setToastSeverity("success");
    } else {
      setToastMessage("Erro ao criar programa");
      setToastSeverity("error");
    }
  };

  const handleDeletePrograma = async (programaId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      const { error } = await dataService.deletePrograma(programaId);

      if (!error) {
        const updatedProgramas = state.programas.filter(p => p.id !== programaId);
        dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
        setToastMessage("Programa excluído com sucesso");
        setToastSeverity("success");
        setExpanded(false);
      } else {
        setToastMessage("Erro ao excluir programa");
        setToastSeverity("error");
      }
    }
  };

  const handleSaveCompanyDetails = async (programaId: number) => {
    if (!editedValues[programaId]) return;
    
    const { error } = await dataService.updateProgramaDetails(programaId, {
      cnpj: editedValues[programaId].cnpj,
      razao_social: editedValues[programaId].razao_social
    });
      
    if (!error) {
      // Update the programas array with the new values after successful save
      const updatedProgramas = state.programas.map(p => 
        p.id === programaId ? { ...p, ...editedValues[programaId] } : p
      );
      dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
      
      // Clear edited values for this program
      setEditedValues(prev => {
        const newValues = {...prev};
        delete newValues[programaId];
        return newValues;
      });
      
      setToastMessage("Dados da empresa salvos com sucesso");
      setToastSeverity("success");
    } else {
      setToastMessage("Erro ao salvar dados da empresa");
      setToastSeverity("error");
    }
  };

  return (
    <div>
      <ProgramHeader handleCreatePrograma={handleCreatePrograma} />
      
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        {state.programas.map((programa: any) => (
          <ProgramCard
            key={programa.id}
            programa={programa}
            expanded={expanded}
            orgaos={orgaos}
            editedValues={editedValues}
            state={state}
            setExpanded={setExpanded}
            setEditedValues={setEditedValues}
            dispatch={dispatch}
            handleSaveCompanyDetails={handleSaveCompanyDetails}
            handleDeletePrograma={handleDeletePrograma}
            handleProgramaFetch={handleProgramaFetch}
            fetchControlesAndMedidas={fetchControlesAndMedidas}
            handleControleFetch={handleControleFetch}
            handleINCCChange={handleINCCChange}
            handleMedidaFetch={handleMedidaFetch}
            handleMedidaChange={handleMedidaChange}
            setToastMessage={setToastMessage}
            setToastSeverity={setToastSeverity}
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
