// React and hooks
import React, { useEffect, useState } from 'react';

// Types
import { Controle, Diagnostico, Medida } from '../../../lib/types/types';

// Components
import ControleComponent from '../Controle';

// Utils
import { calculateMaturityIndexForControle, calculateMaturityIndex } from '../../../lib/utils/calculations';
import { respostas, respostasimnao, incc } from '../../../lib/utils/utils';

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
      console.log(`ControleContainer: Setting medidas for controle ${controle.id}:`, state.medidas[controle.id]);
      console.log(`ControleContainer: Sample medida with programa_medida:`, state.medidas[controle.id][0]);
      setMedidas(state.medidas[controle.id]);
    } else {
      console.log(`ControleContainer: No medidas found for controle ${controle.id}`);
    }
  }, [state.medidas, controle.id]);

  // Load measures when the component mounts
  useEffect(() => {
    console.log(`ControleContainer: Controle data:`, controle);
    console.log(`ControleContainer: Controle nivel:`, controle.nivel);
    console.log(`ControleContainer: Controle programa_controle_id:`, controle.programa_controle_id);
    handleMedidaFetch(controle.id, programaId);
  }, [controle, controle.id, programaId, handleMedidaFetch]);

  /**
   * Calculate the maturity index for this control using the correct formula
   */
  const calculateMaturityIndexLocal = (controle: Controle): number => {
    // Construir programaMedidas a partir dos dados disponíveis
    const programaMedidas = medidas
      .filter(medida => medida.programa_medida)
      .map(medida => medida.programa_medida!)
      .filter(pm => pm !== undefined);

    if (programaMedidas.length > 0) {
      // Usar a fórmula correta com os dados completos
      const result = calculateMaturityIndexForControle(controle, programaControle, programaMedidas);
      console.log(`ControleContainer: Maturity calculated for controle ${controle.id}: ${result}`);
      return parseFloat(result);
    } else {
      // Fallback: usar cálculo simplificado baseado apenas nas respostas disponíveis
      console.log(`ControleContainer: Using fallback calculation for controle ${controle.id}`);
      
      let totalResponses = 0;
      let totalMedidas = 0;

      medidas.forEach((medida: any) => {
        // ✅ CORREÇÃO: Incluir todas as medidas no denominador, exceto "Não se aplica"
        if (medida.resposta === 6) return; // Ignorar "Não se aplica"
        
        totalMedidas++; // Contar todas as medidas (respondidas e não respondidas)
        
        if (medida.resposta && typeof medida.resposta === 'number') {
          // Buscar o peso correto da resposta
          let resposta: any;
          if (controle.diagnostico === 1) {
            resposta = respostasimnao.find((r) => r.id === medida.resposta);
          } else {
            resposta = respostas.find((r) => r.id === medida.resposta);
          }
          
          if (resposta && resposta.peso !== null) {
            totalResponses += resposta.peso;
          }
        }
        // Se não tem resposta, contribui com 0 (já incluído em totalMedidas)
      });

      const baseScore = totalMedidas > 0 ? totalResponses / totalMedidas : 0;
      const inccLevel = incc.find((i) => i.id === programaControle.nivel);
      const inccMultiplier = 1 + ((inccLevel?.nivel || 0) * 1 / 5);
      const finalScore = (baseScore / 2) * inccMultiplier;
      
      return finalScore;
    }
  };

  // Create programaControle object from controle data
  const programaControle = {
    id: controle.programa_controle_id || 0,
    programa: programaId,
    controle: controle.id,
    nivel: controle.nivel || 1
  };

  console.log(`ControleContainer: ProgramaControle object:`, programaControle);

  return (
    <ControleComponent
      controle={controle}
      programaControle={programaControle}
      diagnostico={diagnostico}
      medidas={medidas}
      programaId={programaId}
      responsaveis={responsaveis}
      handleINCCChange={handleINCCChange}
      handleMedidaChange={handleMedidaChange}
      calculateMaturityIndex={calculateMaturityIndexLocal}
    />
  );
};

// Named export for tests
export { ControleContainer };

export default ControleContainer; 