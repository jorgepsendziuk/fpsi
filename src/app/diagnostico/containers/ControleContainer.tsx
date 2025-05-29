// React and hooks
import React, { useEffect, useState } from 'react';

// Types
import { Controle, Diagnostico, Medida } from '../types';

// Components
import ControleComponent from '../components/Controle';

// Utils
import { calculateMaturityIndexForControle } from '../utils/calculations';

/**
 * Props for the ControleContainer component
 */
export interface ControleContainerProps {
  /** The control data */
  controle: Controle;
  /** The diagnostic this control belongs to */
  diagnostico: Diagnostico;
  /** The program ID */
  programaId: number;
  /** Application state */
  state: {
    medidas: { [key: string]: Medida[] };
    loading?: boolean;
    error?: string;
  };
  /** Function to handle changes to the NCC level */
  handleINCCChange: (programaId: number, diagnosticoId: number, value: number) => void;
  /** Function to fetch measures for this control */
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  /** Function to handle changes to a measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: any[];
}

/**
 * Container component for Controle that manages state and logic
 */
const ControleContainer: React.FC<ControleContainerProps> = ({
  controle,
  diagnostico,
  programaId,
  state,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  // Store measures locally
  const [medidas, setMedidas] = useState<Medida[]>([]);

  // Update medidas when state.medidas or controle changes
  useEffect(() => {
    if (state.medidas && state.medidas[controle.id]) {
      setMedidas(state.medidas[controle.id]);
    }
  }, [state.medidas, controle.id]);

  // Load measures when the component mounts
  useEffect(() => {
    handleMedidaFetch(controle.id, programaId);
  }, [controle.id, programaId, handleMedidaFetch]);

  /**
   * Calculate the maturity index for this control
   */
  const calculateMaturityIndex = (controle: Controle) => {
    const result = calculateMaturityIndexForControle(controle, state);
    return result;
  };

  return (
    <ControleComponent
      controle={controle}
      diagnostico={diagnostico}
      medidas={medidas}
      programaId={programaId}
      responsaveis={responsaveis}
      handleINCCChange={handleINCCChange}
      handleMedidaChange={handleMedidaChange}
      calculateMaturityIndex={calculateMaturityIndex}
    />
  );
};

// Named export for tests
export { ControleContainer };

export default ControleContainer; 