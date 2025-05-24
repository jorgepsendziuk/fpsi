// React and hooks
import React, { useEffect, useState } from 'react';

// Types
import { Diagnostico, Programa } from '../types';

// Components
import DiagnosticoComponent from '../components/Diagnostico';

// Utils
import { calculateSumOfResponsesForDiagnostico, getMaturityLabel } from '../utils';

/**
 * Props for the DiagnosticoContainer component
 */
export interface DiagnosticoContainerProps {
  /** The diagnostic data */
  diagnostico: Diagnostico;
  /** The program this diagnostic belongs to */
  programa: Programa;
  /** Application state */
  state: any;
  /** Controls for this diagnostic, if already filtered by parent */
  controles?: any[];
  /** The calculated maturity score */
  maturityScore?: string | number;
  /** The maturity label text */
  maturityLabel?: string;
  /** Function to fetch controls for this diagnostic */
  handleControleFetch: (diagnosticoId: number, programaId: number) => Promise<void>;
  /** Function to handle changes to the NCC level */
  handleINCCChange: (controleId: number, diagnosticoId: number, value: number) => void;
  /** Function to fetch measures for a control */
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  /** Function to handle changes to a measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: any[];
}

/**
 * Container component for Diagnostico that manages state and logic
 */
const DiagnosticoContainer: React.FC<DiagnosticoContainerProps> = ({
  diagnostico,
  programa,
  state,
  controles: propControles,
  maturityScore: propMaturityScore,
  maturityLabel: propMaturityLabel,
  handleControleFetch,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  const [controles, setControles] = useState<any[]>(propControles || []);

  // Update controles when state.controles changes, but only if propControles is not provided
  useEffect(() => {
    // If controles are provided as a prop, don't try to filter from state
    if (propControles) {
      setControles(propControles);
      return;
    }

    // Otherwise, filter from state
    if (state.controles && state.controles[diagnostico.id]) {
      const filteredControles = state.controles[diagnostico.id]
        .filter((controle: any) => controle.programa === programa.id);
      setControles(filteredControles);
    }
  }, [state.controles, diagnostico.id, programa.id, propControles]);

  /**
   * Calculate the maturity score for this diagnostic
   */
  const calculateMaturityScore = () => {
    return propMaturityScore || calculateSumOfResponsesForDiagnostico(diagnostico.id, state);
  };

  /**
   * Get the maturity label for the calculated score
   */
  const getMaturityLabelText = () => {
    return propMaturityLabel || getMaturityLabel(Number(calculateMaturityScore()));
  };

  return (
    <DiagnosticoComponent
      diagnostico={diagnostico}
      programa={programa}
      controles={controles}
      maturityScore={calculateMaturityScore()}
      maturityLabel={getMaturityLabelText()}
      state={state}
      handleControleFetch={handleControleFetch}
      handleINCCChange={handleINCCChange}
      handleMedidaFetch={handleMedidaFetch}
      handleMedidaChange={handleMedidaChange}
      responsaveis={responsaveis}
    />
  );
};

export default DiagnosticoContainer; 