// React and hooks
import React, { useState, useEffect, useCallback } from 'react';

// Types
import { Medida, Controle, Responsavel, MedidaTextField, ProgramaMedida } from '../../../app/diagnostico/types';

// Components
import MedidaComponent from '../Medida';

// Utils
import dayjs from 'dayjs';

/**
 * Props for the MedidaContainer component
 */
export interface MedidaContainerProps {
  /** The measure data */
  medida: Medida;
  /** The programa medida data containing junction table data */
  programaMedida?: ProgramaMedida;
  /** The parent control */
  controle: Controle;
  /** The program ID */
  programaId: number;
  /** Function to handle changes to the measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: Responsavel[];
}

/**
 * Container component for Medida that manages state and logic
 */
const MedidaContainer: React.FC<MedidaContainerProps> = ({
  medida,
  programaMedida,
  controle,
  programaId,
  handleMedidaChange,
  responsaveis,
}) => {
  // Local state for form values
  const [localValues, setLocalValues] = useState({
    justificativa: programaMedida?.justificativa || "",
    encaminhamento_interno: programaMedida?.encaminhamento_interno || "",
    observacao_orgao: programaMedida?.observacao_orgao || "",
    nova_resposta: programaMedida?.nova_resposta || ""
  });

  // Update local values when medida prop changes
  useEffect(() => {
    setLocalValues({
      justificativa: programaMedida?.justificativa || "",
      encaminhamento_interno: programaMedida?.encaminhamento_interno || "",
      observacao_orgao: programaMedida?.observacao_orgao || "",
      nova_resposta: programaMedida?.nova_resposta || ""
    });
  }, [programaMedida]);

  /**
   * Determines the status_plano_acao based on dates and status_medida
   */
  const determineStatusPlanoAcao = useCallback(() => {
    const today = dayjs();
    const inicioDate = programaMedida?.previsao_inicio ? dayjs(programaMedida.previsao_inicio) : null;
    const fimDate = programaMedida?.previsao_fim ? dayjs(programaMedida.previsao_fim) : null;
    
    // If both dates are defined, check if start date is after end date
    if (inicioDate && fimDate && inicioDate.isAfter(fimDate)) {
      return 1; // Datas inválidas
    }
    
    // If status_medida is "Finalizado" (1)
    if (programaMedida?.status_medida === 1) {
      return 2; // Concluído
    }
    
    // If start date is in the future
    if (inicioDate && inicioDate.isAfter(today)) {
      return 3; // Não iniciado
    }
    
    // If start date is today
    if (inicioDate && inicioDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')) {
      return 4; // Em andamento
    }
    
    // If current date is between start and end date
    if (inicioDate && fimDate && 
        today.isAfter(inicioDate) && 
        today.isBefore(fimDate)) {
      return 4; // Em andamento
    }
    
    // If end date is in the past
    if (fimDate && today.isAfter(fimDate)) {
      return 5; // Atrasado
    }
    
    // Default if no condition matches
    return 3; // Default to "Não iniciado"
  }, [programaMedida?.previsao_inicio, programaMedida?.previsao_fim, programaMedida?.status_medida]);

  // Memoized change handler to prevent unnecessary re-renders
  const memoizedHandleMedidaChange = useCallback(handleMedidaChange, [handleMedidaChange]);

  // Update status_plano_acao whenever relevant fields change
  useEffect(() => {
    // Only update if we have programaMedida and the calculation would change
    if (programaMedida) {
      const newStatus = determineStatusPlanoAcao();
      if (newStatus !== programaMedida.status_plano_acao) {
        console.log(`Updating status_plano_acao for medida ${medida.id}: ${programaMedida.status_plano_acao} -> ${newStatus}`);
        memoizedHandleMedidaChange(medida.id, controle.id, programaId, "status_plano_acao", newStatus);
      }
    }
  }, [
    medida.id, 
    controle.id, 
    programaId, 
    programaMedida,
    determineStatusPlanoAcao,
    memoizedHandleMedidaChange
  ]);

  /**
   * Handles changes to text fields by updating local state
   */
  const handleTextChange = useCallback((field: MedidaTextField, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handles saving a field value by calling the parent handler
   */
  const handleSaveField = useCallback((field: MedidaTextField) => {
    memoizedHandleMedidaChange(medida.id, controle.id, programaId, field, localValues[field]);
  }, [medida.id, controle.id, programaId, localValues, memoizedHandleMedidaChange]);

  return (
    <MedidaComponent
      medida={medida}
      programaMedida={programaMedida}
      controle={controle}
      programaId={programaId}
      handleMedidaChange={handleMedidaChange}
      responsaveis={responsaveis}
      localValues={localValues} 
      handleTextChange={handleTextChange}
      handleSaveField={handleSaveField}
    />
  );
};

export default MedidaContainer; 