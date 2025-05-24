// React and hooks
import React, { useEffect, useState } from 'react';

// Types
import { Controle, Diagnostico, Medida } from '../types';

// Components
import ControleComponent from '../components/Controle';

// Utils
import { calculateMaturityIndexForControle } from '../utils';

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
  state: any;
  /** Function to handle changes to the NCC level */
  handleINCCChange: (controleId: number, diagnosticoId: number, value: number) => void;
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
    const loadMedidas = async () => {
      // Only fetch if we don't already have the data
      if (!state.medidas || !state.medidas[controle.id] || state.medidas[controle.id].length === 0) {
        await handleMedidaFetch(controle.id, programaId);
      }
    };
    
    loadMedidas();
  }, [controle.id, programaId, handleMedidaFetch, state.medidas]);

  /**
   * Calculate the maturity index for this control
   */
  const calculateMaturityIndex = (controle: Controle) => {
    console.log('Chamando cálculo de maturidade para controle', controle.id);
    const result = calculateMaturityIndexForControle(controle, state);
    console.log('Medidas usadas no cálculo para controle', controle.id, state.medidas[controle.id] || []);
    console.log('Maturidade calculada:', result);
    return result;
  };

  // Log na renderização do container
  console.log('Renderizando ControleContainer para controle', controle.id);
  calculateMaturityIndex(controle);

  return (
    <ControleComponent
      controle={controle}
      diagnostico={diagnostico}
      medidas={medidas}
      responsaveis={responsaveis}
      handleINCCChange={handleINCCChange}
      handleMedidaChange={handleMedidaChange}
      calculateMaturityIndex={calculateMaturityIndex}
    />
  );
};

export default ControleContainer; 