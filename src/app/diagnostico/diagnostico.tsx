// React
import React from 'react';

// Types
import { Diagnostico, Programa } from './types';

// Container
import DiagnosticoContainer from './containers/DiagnosticoContainer';

/**
 * Props for the Diagnostico module
 */
interface DiagnosticoProps {
  diagnostico: Diagnostico;
  programa: Programa;
  state: any;
  controles: any[];
  maturityScore: string | number;
  maturityLabel: string;
  handleControleFetch: (diagnosticoId: number, programaId: number) => Promise<void>;
  handleINCCChange: (controleId: number, diagnosticoId: number, value: number) => void;
  handleMedidaFetch: (controleId: number) => Promise<void>;
  handleMedidaProgramaFetch: (programaId: number) => Promise<void>;
  handleMedidaChange: (medidaId: number, controleId: number, field: string, value: any) => void;
  handleProgramaControleFetch: (programaId: number) => Promise<void>;
  responsaveis: any[];
}

/**
 * Diagnostico module that re-exports the DiagnosticoContainer
 */
const DiagnosticoModule = (props: DiagnosticoProps) => {
  // Return the container component with all props
  return <DiagnosticoContainer {...props} />;
};

export default DiagnosticoModule; 