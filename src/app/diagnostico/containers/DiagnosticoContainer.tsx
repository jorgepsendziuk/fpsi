// React and hooks
import React, { useEffect } from 'react';

// Types
import { Diagnostico, Programa, Controle, State } from '../../../lib/types/types';

// Components
import DiagnosticoComponent from '../../../components/diagnostico/DiagnosticoComponent';

// Utils
import { calculateDiagnosticoMaturity } from '../utils/maturity';

/**
 * Props for the DiagnosticoContainer component
 */
export interface DiagnosticoContainerProps {
  /** The diagnostic data */
  diagnostico: Diagnostico;
  /** The program this diagnostic belongs to */
  programa: Programa;
  /** Application state */
  state: State;
  /** Function to fetch controls for this diagnostic */
  handleControleFetch: (programaId: number, diagnosticoId: number) => Promise<void>;
  /** Function to handle changes to the NCC level */
  handleINCCChange: (programaId: number, diagnosticoId: number, value: number) => void;
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
  handleControleFetch,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  useEffect(() => {
    handleControleFetch(programa.id, diagnostico.id);
  }, [programa.id, diagnostico.id, handleControleFetch]);

  const controles = state.controles[diagnostico.id] || [];
  // Calculate maturity score for this diagnostic using the correct formula
  const maturityResult = calculateDiagnosticoMaturity(diagnostico.id, programa.id, state);
  const maturityScore = maturityResult.score;
  const maturityLabel = maturityResult.label;

  return (
    <DiagnosticoComponent
      diagnostico={diagnostico}
      controles={controles}
      onControleClick={(id) => handleMedidaFetch(id, programa.id)}
      onAddControle={() => {}}
      onEditDiagnostico={() => {}}
      onDeleteDiagnostico={() => {}}
    />
  );
};

// Named export for tests
export { DiagnosticoContainer };

export default DiagnosticoContainer; 