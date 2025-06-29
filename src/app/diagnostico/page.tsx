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
import * as dataService from "../../lib/services/dataService";
import ProgramHeader from "../../components/diagnostico/ProgramHeader";
import ProgramCard from "../../components/diagnostico/ProgramCard";
import { useMediaQuery } from '@mui/material';
import { Programa } from '../../lib/types/types';

const DiagnosticoPage = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [orgaos, setOrgaos] = useState<any[]>([]);
  const [editedValues, setEditedValues] = useState<{[key: number]: {cnpj?: string, razao_social?: string}}>({});
  const [programa, setPrograma] = useState<Programa | null>(null);

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

  const handleControleFetch = React.useCallback(async (diagnosticoId: number, programaId: number): Promise<void> => {
    const data = await dataService.fetchControles(diagnosticoId, programaId);
    dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
  }, []);

  const handleMedidaFetch = React.useCallback(async (controleId: number, programaId: number): Promise<void> => {
    const data = await dataService.fetchMedidas(controleId, programaId);
    dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
  }, []);

  const fetchControlesAndMedidas = React.useCallback(async (programaId: number) => {
    const diagnosticos = await dataService.fetchDiagnosticos();
    for (const diagnostico of diagnosticos) {
      const controles = await dataService.fetchControles(diagnostico.id, programaId);
      // Remover carregamento automático de medidas - serão carregadas apenas quando selecionadas
      // for (const controle of controles) {
      //   await handleMedidaFetch(controle.id, programaId);
      // }
      await handleControleFetch(diagnostico.id, programaId);
    }
  }, [handleControleFetch]);

  useEffect(() => {
    const fetchData = async () => {
      const programaId = 1; // TODO: Get this from URL or context
      const programas = await dataService.fetchProgramas();
      const programa = programas.find(p => p.id === programaId);
      if (programa) {
        setPrograma(programa);
        await fetchControlesAndMedidas(programaId);
      }
    };
    fetchData();
  }, [fetchControlesAndMedidas]);

  const handleINCCChange = async (programaControleId: number, diagnosticoId: number, newValue: number): Promise<void> => {
    await dataService.updateControleNivel(programaControleId, newValue);
    dispatch({
      type: "UPDATE_CONTROLE",
      diagnosticoId,
      programaControleId,
      field: "nivel",
      value: newValue,
    });
    setToastMessage("Resposta atualizada");
    setToastSeverity("success");
  };

  const handleMedidaChange = async (medidaId: number, controleId: number, programaId: number, field: string, value: any) => {
    const { error } = await dataService.updateMedida(medidaId, programaId, field, value);

    if (!error) {
      // First update the state with the new value
      dispatch({
        type: "UPDATE_MEDIDA",
        medidaId,
        controleId,
        field,
        value,
      });

      // Then refetch measures to ensure we have the latest data
      await handleMedidaFetch(controleId, programaId);

      // Find the diagnosticoId for this controle
      const diagnosticoId = state.controles[Object.keys(state.controles).find(key => 
        state.controles[key].some((c: any) => c.id === controleId)
      ) || '']?.find((c: any) => c.id === controleId)?.diagnostico;

      if (diagnosticoId) {
        // Refetch controles to trigger maturity recalculation
        await handleControleFetch(diagnosticoId, programaId);
      }

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
      // Create programa_controle records for all existing controles
      await dataService.createProgramaControlesForProgram(data.id);
      
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
