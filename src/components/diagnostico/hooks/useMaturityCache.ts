import { useState, useCallback, useMemo } from 'react';
import { Diagnostico, Controle, Medida } from '../../../lib/types/types';

interface MaturityData {
  score: number;
  label: string;
  color: string;
  level: 'inicial' | 'basico' | 'intermediario' | 'aprimoramento' | 'aprimorado';
}

export const useMaturityCache = (programaId: number) => {
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
    programaControle: any
  ): MaturityData => {
    // ✅ CORREÇÃO: Calcular baseado nos PESOS das respostas, não quantidade
    let somaRespostas = 0;
    let totalMedidas = 0;

    medidas.forEach(medida => {
      // Ignorar "Não se aplica" (resposta 6)
      if (medida.resposta === 6) return;
      
      totalMedidas++; // Contar todas as medidas (respondidas e não respondidas)
      
      if (medida.resposta) {
        // Buscar o peso correto da resposta
        let resposta: any;
        if (controle.diagnostico === 1) {
          // Diagnóstico 1: respostasimnao
          resposta = [
            { id: 1, peso: 1 }, // Sim
            { id: 2, peso: 0 }  // Não
          ].find(r => r.id === medida.resposta);
        } else {
          // Outros diagnósticos: respostas com escala
          resposta = [
            { id: 1, peso: 1 },    // Adota totalmente
            { id: 2, peso: 0.75 }, // Adota em maior parte
            { id: 3, peso: 0.5 },  // Adota parcialmente
            { id: 4, peso: 0.25 }, // Há plano
            { id: 5, peso: 0 }     // Não adota
          ].find(r => r.id === medida.resposta);
        }
        
        if (resposta && resposta.peso !== null) {
          somaRespostas += resposta.peso;
        }
      }
      // Se não tem resposta, contribui com 0 (peso 0)
    });

    const percentual = totalMedidas > 0 ? somaRespostas / totalMedidas : 0;
    
    console.log(`useMaturityCache - Controle ${controle.id}:`);
    console.log('- Total medidas:', totalMedidas);
    console.log('- Soma respostas:', somaRespostas);
    console.log('- Percentual calculado:', percentual);
    
    let level: MaturityData['level'] = 'inicial';
    let label = 'Inicial';
    let color = MATURITY_COLORS.inicial;
    
    if (percentual >= 0.8) {
      level = 'aprimorado';
      label = 'Aprimorado';
      color = MATURITY_COLORS.aprimorado;
    } else if (percentual >= 0.6) {
      level = 'aprimoramento';
      label = 'Em Aprimoramento';
      color = MATURITY_COLORS.aprimoramento;
    } else if (percentual >= 0.4) {
      level = 'intermediario';
      label = 'Intermediário';
      color = MATURITY_COLORS.intermediario;
    } else if (percentual >= 0.2) {
      level = 'basico';
      label = 'Básico';
      color = MATURITY_COLORS.basico;
    }

    console.log(`- Nível determinado: ${level} (${label})`);
    console.log(`- Cor: ${color}`);
    
    return {
      score: percentual,
      label,
      color,
      level
    };
  }, [MATURITY_COLORS]);

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

    // Calcular média dos controles
    let totalScore = 0;
    let controlesComMedidas = 0;

    controles.forEach(controle => {
      const medidas = medidasMap[controle.id] || [];
      if (medidas.length > 0) {
        const programaControle = {
          id: controle.programa_controle_id || 0,
          programa: programaId,
          controle: controle.id,
          nivel: controle.nivel || 1
        };
        const controleMaturity = getControleMaturity(controle, medidas, programaControle);
        totalScore += controleMaturity.score;
        controlesComMedidas++;
      }
    });

    const averageScore = controlesComMedidas > 0 ? totalScore / controlesComMedidas : 0;
    
    let level: MaturityData['level'] = 'inicial';
    let label = 'Inicial';
    let color = MATURITY_COLORS.inicial;
    
    if (averageScore >= 0.8) {
      level = 'aprimorado';
      label = 'Aprimorado';
      color = MATURITY_COLORS.aprimorado;
    } else if (averageScore >= 0.6) {
      level = 'aprimoramento';
      label = 'Em Aprimoramento';
      color = MATURITY_COLORS.aprimoramento;
    } else if (averageScore >= 0.4) {
      level = 'intermediario';
      label = 'Intermediário';
      color = MATURITY_COLORS.intermediario;
    } else if (averageScore >= 0.2) {
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
  }, [getControleMaturity, programaId, MATURITY_COLORS]);

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