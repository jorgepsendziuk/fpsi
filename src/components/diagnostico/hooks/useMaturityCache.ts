import { useState, useCallback, useMemo } from 'react';
import { Diagnostico, Controle, Medida } from '../../../lib/types/types';

interface MaturityData {
  score: number;
  label: string;
  color: string;
  level: 'inicial' | 'basico' | 'intermediario' | 'aprimoramento' | 'aprimorado';
  calculationData?: {
    medidas: {
      total: number;
      respondidas: number;
      naoSeAplica: number;
      somaRespostas: number;
    };
    incc: {
      nivel: number;
      multiplicador: number;
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

  // Cores da maturidade
  const MATURITY_COLORS = useMemo(() => ({
    inicial: '#FF5252',
    basico: '#FF9800',
    intermediario: '#FFC107',
    aprimoramento: '#4CAF50',
    aprimorado: '#2E7D32'
  }), []);

  const getControleMaturity = useCallback((
    controle: Controle,
    medidas: Medida[],
    programaControle: any,
    programaMedidas?: { [key: string]: any }
  ): MaturityData => {
    // ✅ USAR FÓRMULA OFICIAL DO FRAMEWORK
    let somaRespostas = 0;
    let totalMedidas = 0;

    medidas.forEach((medida, index) => {
      // Buscar a resposta nos programaMedidas se fornecido
      let respostaMedida = medida.resposta;
      
      if (programaMedidas) {
        const key = `${medida.id}-${controle.id}-${programaId}`;
        const programaMedida = programaMedidas[key];
        if (programaMedida?.resposta !== undefined) {
          respostaMedida = programaMedida.resposta;
        }
      }
      
      // Ignorar "Não se aplica" (resposta 6)
      const respostaNumCheck = typeof respostaMedida === 'string' ? parseInt(respostaMedida, 10) : respostaMedida;
      if (respostaNumCheck === 6) return;
      
      totalMedidas++; // Contar todas as medidas (respondidas e não respondidas)
      
      if (respostaMedida) {
        // Converter resposta para number para comparação
        const respostaId = typeof respostaMedida === 'string' ? parseInt(respostaMedida, 10) : respostaMedida;
        
        // Buscar o peso correto da resposta
        let resposta: any;
        if (controle.diagnostico === 1) {
          // Diagnóstico 1: respostasimnao
          resposta = [
            { id: 1, peso: 1 }, // Sim
            { id: 2, peso: 0 }  // Não
          ].find(r => r.id === respostaId);
        } else {
          // Outros diagnósticos: respostas com escala
          resposta = [
            { id: 1, peso: 1 },    // Adota totalmente
            { id: 2, peso: 0.75 }, // Adota em menor parte
            { id: 3, peso: 0.5 },  // Adota parcialmente
            { id: 4, peso: 0.25 }, // Há plano
            { id: 5, peso: 0 }     // Não adota
          ].find(r => r.id === respostaId);
        }
        
        if (resposta && resposta.peso !== null) {
          somaRespostas += resposta.peso;
        }
      }
      // Se não tem resposta, contribui com 0 (peso 0)
    });

    // ✅ APLICAR FÓRMULA OFICIAL DO FRAMEWORK
    const baseIndex = totalMedidas > 0 ? somaRespostas / totalMedidas : 0;
    
    // ✅ APLICAR MULTIPLICADOR INCC CORRETO
    const inccLevel = [
      { id: 1, nivel: 0 }, // Nível 0
      { id: 2, nivel: 1 }, // Nível 1 
      { id: 3, nivel: 2 }, // Nível 2
      { id: 4, nivel: 3 }, // Nível 3
      { id: 5, nivel: 4 }, // Nível 4
      { id: 6, nivel: 5 }  // Nível 5
    ].find(incc => incc.id === programaControle.nivel);
    
    const inccNivel = inccLevel?.nivel || 0;
    const inccMultiplier = 1 + (inccNivel * 1 / 5);
    
    // ✅ FÓRMULA OFICIAL: (baseIndex / 2) * multiplicador_incc
    const finalScore = (baseIndex / 2) * inccMultiplier;
    
    // ✅ USAR FAIXAS OFICIAIS DO FRAMEWORK
    let level: MaturityData['level'] = 'inicial';
    let label = 'Inicial';
    let color = MATURITY_COLORS.inicial;
    
    if (finalScore >= 0.9) {
      level = 'aprimorado';
      label = 'Aprimorado';
      color = MATURITY_COLORS.aprimorado;
    } else if (finalScore >= 0.7) {
      level = 'aprimoramento';
      label = 'Em Aprimoramento';
      color = MATURITY_COLORS.aprimoramento;
    } else if (finalScore >= 0.5) {
      level = 'intermediario';
      label = 'Intermediário';
      color = MATURITY_COLORS.intermediario;
    } else if (finalScore >= 0.3) {
      level = 'basico';
      label = 'Básico';
      color = MATURITY_COLORS.basico;
    }

    // Contar medidas respondidas e não se aplica para dados de cálculo
    let medidasRespondidas = 0;
    let medidasNaoSeAplica = 0;
    
    medidas.forEach(medida => {
      let respostaMedida = medida.resposta;
      
      if (programaMedidas) {
        const key = `${medida.id}-${controle.id}-${programaId}`;
        const programaMedida = programaMedidas[key];
        if (programaMedida?.resposta !== undefined) {
          respostaMedida = programaMedida.resposta;
        }
      }
      
      const respostaNumCheck = typeof respostaMedida === 'string' ? parseInt(respostaMedida, 10) : respostaMedida;
      if (respostaNumCheck === 6) {
        medidasNaoSeAplica++;
      } else if (respostaMedida !== null && respostaMedida !== undefined) {
        medidasRespondidas++;
      }
    });
    
    return {
      score: finalScore,
      label,
      color,
      level,
      calculationData: {
        medidas: {
          total: totalMedidas,
          respondidas: medidasRespondidas,
          naoSeAplica: medidasNaoSeAplica,
          somaRespostas
        },
        incc: {
          nivel: inccNivel,
          multiplicador: inccMultiplier
        },
        calculo: {
          baseIndex,
          finalScore,
          formula: 'iMC = (∑PMC / (QMC - QMNAC)) / 2 × (1 + iNCC/100)'
        },
        resultado: {
          score: finalScore,
          label,
          color
        }
      }
    };
  }, [MATURITY_COLORS, programaId]);

  const getDiagnosticoMaturity = useCallback((
    diagnostico: Diagnostico,
    controles: Controle[],
    medidasMap: { [key: number]: Medida[] }
  ): MaturityData => {
    if (controles.length === 0) {
      return {
        score: 0,
        label: 'Inicial',
        color: MATURITY_COLORS.inicial,
        level: 'inicial'
      };
    }

    // ✅ APLICAR FÓRMULAS OFICIAIS iSeg e iPriv conforme documentação
    let iMC0 = 0; // Controle 0 (Estrutura Básica)
    let somaControles = 0;
    let controlesComDados = 0;

    controles.forEach(controle => {
      const medidas = medidasMap[controle.id] || [];
      if (medidas.length > 0) {
        const programaControle = {
          id: controle.programa_controle_id || 0,
          programa: programaId,
          controle: controle.id,
          nivel: controle.nivel || 1
        };
        const controleMaturity = getControleMaturity(controle, medidas, programaControle, programaMedidas);
        
        // Identificar se é o Controle 0 (Estrutura Básica)
        if (controle.numero === 0) {
          iMC0 = controleMaturity.score;
        } else {
          somaControles += controleMaturity.score;
          controlesComDados++;
        }
      }
    });

    // Calcular maturidade do diagnóstico usando fórmulas oficiais
    let averageScore = 0;
    
    if (diagnostico.id === 1) {
      // Diagnóstico 1: Estrutura Básica - apenas iMC0
      averageScore = iMC0;
    } else if (diagnostico.id === 2) {
      // Diagnóstico 2: Segurança - usar fórmula iSeg
      // iSeg = ((iMC₀ × 4) + ∑ᵢ₌₁¹⁸ iMCᵢ) / 22
      if (controlesComDados > 0) {
        averageScore = ((iMC0 * 4) + somaControles) / (4 + controlesComDados);
      }
    } else if (diagnostico.id === 3) {
      // Diagnóstico 3: Privacidade - usar fórmula iPriv
      // iPriv = ((iMC₀ × 4) + ∑ᵢ₌₁₉³¹ iMCᵢ) / 17
      if (controlesComDados > 0) {
        averageScore = ((iMC0 * 4) + somaControles) / (4 + controlesComDados);
      }
    } else {
      // Fallback: média simples
      averageScore = controlesComDados > 0 ? somaControles / controlesComDados : 0;
    }
    
    // ✅ USAR FAIXAS OFICIAIS DO FRAMEWORK
    let level: MaturityData['level'] = 'inicial';
    let label = 'Inicial';
    let color = MATURITY_COLORS.inicial;
    
    if (averageScore >= 0.9) {
      level = 'aprimorado';
      label = 'Aprimorado';
      color = MATURITY_COLORS.aprimorado;
    } else if (averageScore >= 0.7) {
      level = 'aprimoramento';
      label = 'Em Aprimoramento';
      color = MATURITY_COLORS.aprimoramento;
    } else if (averageScore >= 0.5) {
      level = 'intermediario';
      label = 'Intermediário';
      color = MATURITY_COLORS.intermediario;
    } else if (averageScore >= 0.3) {
      level = 'basico';
      label = 'Básico';
      color = MATURITY_COLORS.basico;
    }

    return {
      score: averageScore,
      label,
      color,
      level
    };
  }, [getControleMaturity, programaId, MATURITY_COLORS, programaMedidas]);

  const invalidateCache = useCallback((type?: string, id?: number) => {
    // Cache simples - apenas reset dos contadores
    setCacheHits(0);
    setCacheMisses(0);
  }, []);

  const preloadMaturity = useCallback(async (
    controles: Controle[],
    medidasMap: { [key: number]: Medida[] }
  ) => {
    // Preload simples - não faz nada por enquanto
  }, []);

  const clearOldCache = useCallback(() => {
    // Cache simples - não faz nada
  }, []);

  const cacheStats = useMemo(() => ({
    size: 0,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0
  }), [cacheHits, cacheMisses]);

  return {
    getControleMaturity,
    getDiagnosticoMaturity,
    invalidateCache,
    preloadMaturity,
    clearOldCache,
    cacheStats,
    MATURITY_COLORS
  };
};