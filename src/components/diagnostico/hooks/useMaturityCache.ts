import { useState, useCallback, useMemo } from 'react';
import { Diagnostico, Controle, Medida } from '../../../lib/types/types';
import {
  calculateIndicadorFromControles,
  calculateNacFromMedidas,
  getIndicadorMaturityBandId,
  getIndicadorMaturityColor,
  getIndicadorMaturityLabel,
  getNacAdoptionLabel,
  parseRespostaId,
  type MaturityBandId,
  type MedidaResposta,
} from '../../../lib/utils/ppsiScoring';

interface MaturityData {
  score: number;
  label: string;
  color: string;
  level: MaturityBandId;
  calculationData?: {
    medidas: {
      total: number;
      respondidas: number;
      naoSeAplica: number;
      somaRespostas: number;
    };
    nac: {
      valor: number;
      nivelAdocao: string;
    };
    calculo: {
      baseIndex: number;
      finalScore: number;
      formula: string;
    };
    resultado: {
      score: number;
      label: string;
      color: string;
    };
  };
}

export const useMaturityCache = (programaId: number, programaMedidas?: { [key: string]: any }) => {
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);

  const MATURITY_COLORS = useMemo(
    () => ({
      inicial: '#C62828',
      intermediario: '#F9A825',
      aprimoramento: '#388E3C',
      aprimorado: '#2E7D32',
    }),
    []
  );

  const resolveMedidaResposta = useCallback(
    (medida: MedidaResposta, controleId: number) => {
      let respostaMedida = medida.resposta;
      if (programaMedidas && medida.id != null) {
        const key = `${medida.id}-${controleId}-${programaId}`;
        const programaMedida = programaMedidas[key];
        if (programaMedida?.resposta !== undefined) {
          respostaMedida = programaMedida.resposta;
        }
      }
      return respostaMedida;
    },
    [programaId, programaMedidas]
  );

  const getControleMaturity = useCallback(
    (
      controle: Controle,
      medidas: Medida[],
      _programaControle: unknown,
      _programaMedidasArg?: { [key: string]: any }
    ): MaturityData => {
      const { nac, soma, totalAplicavel, respondidas, naoSeAplica } = calculateNacFromMedidas(
        medidas,
        controle.diagnostico,
        (medida) => resolveMedidaResposta(medida, controle.id)
      );

      const label = getIndicadorMaturityLabel(nac);
      const level = getIndicadorMaturityBandId(nac);
      const color = getIndicadorMaturityColor(nac);
      const nivelAdocao = getNacAdoptionLabel(nac);

      return {
        score: nac,
        label,
        color,
        level,
        calculationData: {
          medidas: {
            total: totalAplicavel,
            respondidas,
            naoSeAplica,
            somaRespostas: soma,
          },
          nac: {
            valor: nac,
            nivelAdocao,
          },
          calculo: {
            baseIndex: nac,
            finalScore: nac,
            formula: 'NAC = média das pontuações NIM das medidas aplicáveis do controle',
          },
          resultado: {
            score: nac,
            label: nivelAdocao,
            color,
          },
        },
      };
    },
    [resolveMedidaResposta]
  );

  const getDiagnosticoMaturity = useCallback(
    (
      diagnostico: Diagnostico,
      controles: Controle[],
      medidasMap: { [key: number]: Medida[] }
    ): MaturityData => {
      if (controles.length === 0) {
        return {
          score: 0,
          label: 'Inicial',
          color: MATURITY_COLORS.inicial,
          level: 'inicial',
        };
      }

      const medidasByControle = controles.map((controle) => medidasMap[controle.id] || []);

      const averageScore = calculateIndicadorFromControles(
        diagnostico.id,
        medidasByControle,
        (controleIndex, medida) => {
          const controle = controles[controleIndex];
          return resolveMedidaResposta(medida, controle.id);
        }
      );

      const label = getIndicadorMaturityLabel(averageScore);
      const level = getIndicadorMaturityBandId(averageScore);
      const color = getIndicadorMaturityColor(averageScore);

      return {
        score: averageScore,
        label,
        color,
        level,
      };
    },
    [MATURITY_COLORS, resolveMedidaResposta]
  );

  const invalidateCache = useCallback(() => {
    setCacheHits(0);
    setCacheMisses(0);
  }, []);

  const preloadMaturity = useCallback(async () => {}, []);

  const clearOldCache = useCallback(() => {}, []);

  const cacheStats = useMemo(
    () => ({
      size: 0,
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0,
    }),
    [cacheHits, cacheMisses]
  );

  return {
    getControleMaturity,
    getDiagnosticoMaturity,
    invalidateCache,
    preloadMaturity,
    clearOldCache,
    cacheStats,
    MATURITY_COLORS,
    parseRespostaId,
  };
};