// React and hooks
import React, { useEffect, useMemo, useState } from 'react';

// Types
import { Controle, Diagnostico, Medida, ProgramaMedida } from '../../../lib/types/types';

// Components
import ControleComponent from '../Controle';

// Utils
import { calculateMaturityIndexForControle } from '../../../lib/utils/calculations';
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
  handleINCCChange: (controleId: number, value: number) => void;
  /** Function to fetch measures for this control */
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  /** Function to handle changes to a measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: any[];
  /** Optional function to handle navigation to a measure */
  onMedidaNavigate?: (medidaId: number, controleId: number) => void;
  /** Optional: programaMedidas from page state (source of truth for menu maturity) */
  programaMedidas?: { [key: string]: ProgramaMedida };
  /** Optional: use same maturity calculation as sidebar menu so header matches */
  getControleMaturity?: (
    controle: Controle,
    medidas: Medida[],
    programaControle: { id: number; programa: number; controle: number; nivel: number },
    programaMedidas?: { [key: string]: ProgramaMedida }
  ) => { score: number; label: string };
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
  onMedidaNavigate,
  programaMedidas: programaMedidasFromPage,
  getControleMaturity
}) => {
  // Store measures locally
  const [medidas, setMedidas] = useState<Medida[]>([]);

  // Create programaControle object from controle data (used in maturity calculation)
  const programaControle = {
    id: controle.programa_controle_id || 0,
    programa: programaId,
    controle: controle.id,
    nivel: controle.nivel || 1
  };

  // Update medidas when state.medidas or controle changes
  useEffect(() => {
    if (state.medidas && state.medidas[controle.id]) {
      setMedidas(state.medidas[controle.id]);
    } else {
      setMedidas([]);
    }
  }, [state.medidas, controle.id]);

  // Usar programaMedidas do estado da página como fonte da verdade para cores/respostas na lista.
  // Assim a lista reflete o mesmo que o menu e atualiza após handleMedidaChange.
  const medidasParaExibir = useMemo(() => {
    if (!programaMedidasFromPage || medidas.length === 0) return medidas;
    return medidas.map((m) => {
      const key = `${m.id}-${controle.id}-${programaId}`;
      const atual = programaMedidasFromPage[key];
      return atual
        ? { ...m, programa_medida: atual, resposta: atual.resposta }
        : m;
    });
  }, [medidas, programaMedidasFromPage, controle.id, programaId]);

  // Load measures when the component mounts
  useEffect(() => {
    handleMedidaFetch(controle.id, programaId);
  }, [controle, controle.id, programaId, handleMedidaFetch]);

  /**
   * Use page's getControleMaturity when provided so header index matches sidebar menu.
   * Otherwise fall back to local calculation (e.g. when container used outside diagnóstico page).
   */
  const calculateMaturityIndexForHeader = (controle: Controle): number => {
    if (getControleMaturity && programaMedidasFromPage) {
      const maturity = getControleMaturity(controle, medidasParaExibir, programaControle, programaMedidasFromPage);
      return maturity.score;
    }
    return calculateMaturityIndexLocal(controle);
  };

  /**
   * Calculate the maturity index for this control using the correct formula (fallback when getControleMaturity not provided)
   */
  const calculateMaturityIndexLocal = (controle: Controle): number => {
    const programaMedidasArray = medidas
      .filter(medida => medida.programa_medida)
      .map(medida => medida.programa_medida!)
      .filter((pm): pm is ProgramaMedida => pm !== undefined);

    if (programaMedidasArray.length > 0) {
      const result = calculateMaturityIndexForControle(controle, programaControle, programaMedidasArray);
      return parseFloat(result);
    }

    let totalResponses = 0;
    let totalMedidas = 0;
    medidas.forEach((medida: any) => {
      if (medida.resposta === 6) return;
      totalMedidas++;
      if (medida.resposta && typeof medida.resposta === 'number') {
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
    });
    const baseScore = totalMedidas > 0 ? totalResponses / totalMedidas : 0;
    const inccLevel = incc.find((i) => i.id === programaControle.nivel);
    const inccMultiplier = 1 + ((inccLevel?.nivel || 0) * 1 / 5);
    return (baseScore / 2) * inccMultiplier;
  };

  return (
    <ControleComponent
      controle={controle}
      programaControle={programaControle}
      diagnostico={diagnostico}
      medidas={medidasParaExibir}
      programaId={programaId}
      responsaveis={responsaveis}
      handleINCCChange={handleINCCChange}
      handleMedidaChange={handleMedidaChange}
      calculateMaturityIndex={calculateMaturityIndexForHeader}
      onMedidaNavigate={onMedidaNavigate}
    />
  );
};

// Named export for tests
export { ControleContainer };

export default ControleContainer; 