// React and hooks
import React, { useState, useEffect } from 'react';

// Types
import { Medida, Controle, Responsavel, MedidaTextField } from '../types';

// Components
import MedidaComponent from '../components/Medida';

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