// React and hooks
import React, { useEffect, useState, useCallback } from 'react';

// Types
import { Responsavel } from '../../../lib/types/types';

// Components
import ResponsavelComponent from '../../../components/diagnostico/ResponsavelComponent';

// Database
import { supabaseBrowserClient } from "@utils/supabase/client";
import { GridRowModes, GridRowModesModel } from '@mui/x-data-grid';

/**
 * Props for the ResponsavelContainer component
 */
export interface ResponsavelContainerProps {
  /** The program ID */
  programa: number;
  /** Optional callback when responsavel list is updated */
  onUpdate?: () => void;
}

/**
 * Container component for Responsavel that manages state and database operations
 */
const ResponsavelContainer: React.FC<ResponsavelContainerProps> = ({
  programa,
  onUpdate,
}) => {
  const [rows, setRows] = useState<Responsavel[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  /**
   * Fetch responsaveis from the database
   */
  const fetchResponsaveis = useCallback(async () => {
    const { data } = await supabaseBrowserClient
      .from("responsavel")
      .select("*")
      .eq("programa", programa)
      .order("id", { ascending: true });
    setRows(data || []);
  }, [programa]);

  // Load responsaveis when the component mounts or programa changes
  useEffect(() => {
    fetchResponsaveis();
  }, [fetchResponsaveis]);

  // Call onUpdate when rows change, but only if we have data
  useEffect(() => {
    if (rows.length > 0 && onUpdate) {
      onUpdate();
    }
  }, [rows, onUpdate]);

  /**
   * Handle row edit start event
   */
  const handleRowEditStart = (params: any, event: any) => {
    event.defaultMuiPrevented = true;
  };

  /**
   * Handle row edit stop event
   */
  const handleRowEditStop = (params: any, event: any) => {
    event.defaultMuiPrevented = true;
  };

  /**
   * Switch a row to edit mode
   */
  const handleEditClick = (id: any) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  /**
   * Save changes to a row
   */
  const handleSaveClick = (id: any) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    const row = rows.find((row) => row.id === id);
    
    if (!row) {
      console.error("Não foi possível encontrar a linha para salvar");
      return;
    }
    
    const updatedRow = {
      ...row,
      programa: programa
    };
    
    try {
      const { error } = await supabaseBrowserClient
        .from("responsavel")
        .update(updatedRow)
        .eq("id", id);
        
      if (error) {
        console.error("Erro ao salvar responsável:", error);
        return;
      }
      
      // Don't call onUpdate here - it will be called when rows change
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  /**
   * Cancel editing a row
   */
  const handleCancelClick = (id: any) => () => {
    setRowModesModel({ 
      ...rowModesModel, 
      [id]: { mode: GridRowModes.View, ignoreModifications: true } 
    });
    
    fetchResponsaveis(); // Reload the data to discard changes
  };

  /**
   * Delete a row
   */
  const handleDeleteClick = (id: any) => async () => {
    await supabaseBrowserClient
      .from("responsavel")
      .delete()
      .eq("id", id);
    setRows(rows.filter((row) => row.id !== id));
    // Don't call onUpdate here - it will be called when rows change
  };

  /**
   * Add a new row
   */
  const handleAddClick = async () => {
    // Cria um novo responsável com valores iniciais vazios
    const newResponsavel = {
      programa,
      nome: "",
      email: "",
      departamento: ""
    };

    const { data, error } = await supabaseBrowserClient
      .from("responsavel")
      .insert([newResponsavel])
      .select();
    
    if (error) {
      console.error("Erro ao adicionar responsável:", error);
      return;
    }
    
    if (data && data.length > 0) {
      const newRow = data[0];
      setRows((oldRows) => [...oldRows, newRow]);
      setRowModesModel({ ...rowModesModel, [newRow.id]: { mode: GridRowModes.Edit } });
    }
  };

  /**
   * Process row update
   */
  const handleProcessRowUpdate = async (newRow: Responsavel) => {
    // Certifique-se de que os campos numéricos sejam números válidos
    const updatedRow = { 
      ...newRow,
      programa: programa  // Garante que o programa sempre seja definido corretamente
    };
    
    // Atualiza a linha localmente
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    
    // Você pode decidir adicionar uma validação adicional aqui antes de enviar para o Supabase
    try {
      const { error } = await supabaseBrowserClient
        .from("responsavel")
        .update(updatedRow)
        .eq("id", updatedRow.id);
        
      if (error) {
        console.error("Erro ao atualizar responsável:", error);
        // Você pode adicionar um tratamento de erro aqui
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
    
    return updatedRow;
  };

  return (
    <ResponsavelComponent
      rows={rows}
      rowModesModel={rowModesModel}
      handleRowEditStart={handleRowEditStart}
      handleRowEditStop={handleRowEditStop}
      handleEditClick={handleEditClick}
      handleSaveClick={handleSaveClick}
      handleCancelClick={handleCancelClick}
      handleDeleteClick={handleDeleteClick}
      handleAddClick={handleAddClick}
      handleProcessRowUpdate={handleProcessRowUpdate}
    />
  );
};

// Named export for tests
export { ResponsavelContainer };

export default ResponsavelContainer; 