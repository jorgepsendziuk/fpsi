// React and hooks
import React, { useState, useEffect } from 'react';

// Types
import { Medida, Controle, Responsavel, MedidaTextField } from '../types';

// Components
import MedidaComponent from '../components/Medida';

// Utils
import dayjs from 'dayjs';

/**
 * Props for the MedidaContainer component
 */
export interface MedidaContainerProps {
  /** The measure data */
  medida: Medida;
  /** The parent control */
  controle: Controle;
  /** Function to handle changes to the measure */
  handleMedidaChange: (medidaId: number, controleId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: Responsavel[];
}

/**
 * Container component for Medida that manages state and logic
 */
const MedidaContainer: React.FC<MedidaContainerProps> = ({
  medida,
  controle,
  handleMedidaChange,
  responsaveis,
}) => {
  // Local state for form values
  const [localValues, setLocalValues] = useState({
    justificativa: medida.justificativa || "",
    encaminhamento_interno: medida.encaminhamento_interno || "",
    observacao_orgao: medida.observacao_orgao || "",
    nova_resposta: medida.nova_resposta || ""
  });

  // Update local values when medida prop changes
  useEffect(() => {
    setLocalValues({
      justificativa: medida.justificativa || "",
      encaminhamento_interno: medida.encaminhamento_interno || "",
      observacao_orgao: medida.observacao_orgao || "",
      nova_resposta: medida.nova_resposta || ""
    });
  }, [medida]);

  /**
   * Determines the status_plano_acao based on dates and status_medida
   */
  const determineStatusPlanoAcao = () => {
    const today = dayjs();
    const inicioDate = medida.previsao_inicio ? dayjs(medida.previsao_inicio) : null;
    const fimDate = medida.previsao_fim ? dayjs(medida.previsao_fim) : null;
    
    // If both dates are defined, check if start date is after end date
    if (inicioDate && fimDate && inicioDate.isAfter(fimDate)) {
      return 1; // Datas inválidas
    }
    
    // If status_medida is "Finalizado" (1)
    if (medida.status_medida === 1) {
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
  };

  // Update status_plano_acao whenever relevant fields change
  useEffect(() => {
    const newStatus = determineStatusPlanoAcao();
    if (newStatus !== medida.status_plano_acao) {
      handleMedidaChange(medida.id, controle.id, "status_plano_acao", newStatus);
    }
  }, [medida.previsao_inicio, medida.previsao_fim, medida.status_medida]);

  /**
   * Handles changes to text fields by updating local state
   */
  const handleTextChange = (field: MedidaTextField, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handles saving a field value by calling the parent handler
   */
  const handleSaveField = (field: MedidaTextField) => {
    handleMedidaChange(medida.id, controle.id, field, localValues[field]);
  };

  return (
    <MedidaComponent
      medida={medida}
      controle={controle}
      handleMedidaChange={handleMedidaChange}
      responsaveis={responsaveis}
      localValues={localValues} 
      handleTextChange={handleTextChange}
      handleSaveField={handleSaveField}
    />
  );
};

export default MedidaContainer; 