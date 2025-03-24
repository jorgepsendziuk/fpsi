// React and hooks
import React, { useState, useEffect } from 'react';

// Types
import { Medida, Controle, Responsavel } from '../types';

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
  const handleTextChange = (field: keyof typeof localValues, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handles saving a field value by calling the parent handler
   */
  const handleSaveField = (field: keyof typeof localValues) => {
    handleMedidaChange(medida.id, controle.id, field, localValues[field]);
  };

  return (
    <MedidaComponent
      medida={medida}
      controle={controle}
      handleMedidaChange={handleMedidaChange}
      responsaveis={responsaveis}
      localValues={localValues} 
      handleTextChange={(field: "justificativa" | "encaminhamento_interno" | "observacao_orgao" | "nova_resposta", value: string) => handleTextChange(field, value)}
      handleSaveField={(field: "justificativa" | "encaminhamento_interno" | "observacao_orgao" | "nova_resposta") => handleSaveField(field)}
    />
  );
};

export default MedidaContainer; 