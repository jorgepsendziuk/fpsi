/**
 * UTILITÁRIOS DE CÁLCULO DE MATURIDADE
 * 
 * Este módulo contém todas as funções relacionadas ao cálculo de maturidade
 * do sistema, organizadas de forma estável e documentada.
 */

import { State } from '../types';

// Definição das faixas de maturidade
export const MATURITY_LEVELS = [
  { id: 1, min: 0, max: 0.29, label: "Inicial" },
  { id: 2, min: 0.3, max: 0.49, label: "Básico" },
  { id: 3, min: 0.5, max: 0.69, label: "Intermediário" },
  { id: 4, min: 0.7, max: 0.89, label: "Em Aprimoramento" },
  { id: 5, min: 0.9, max: 1, label: "Aprimorado" },
];

/**
 * Converte um score numérico para um label de maturidade
 * @param score Score normalizado (0-1)
 * @returns Label de maturidade correspondente
 */
export const getMaturityLabel = (score: number): string => {
  const maturity = MATURITY_LEVELS.find(m => score >= m.min && score <= m.max);
  return maturity ? maturity.label : "Inicial";
};

/**
 * Calcula a maturidade de uma medida individual
 * @param resposta Resposta da medida (0-100)
 * @returns Score normalizado (0-1)
 */
export const calculateMedidaMaturity = (resposta: number): number => {
  return Math.max(0, Math.min(1, resposta / 100));
};

/**
 * Calcula a maturidade de um controle baseado em suas medidas
 * @param medidas Array de medidas do controle
 * @param inccLevel Nível INCC do controle (1-5)
 * @returns Score normalizado (0-1)
 */
export const calculateControleMaturity = (medidas: any[], inccLevel: number = 1): number => {
  if (!medidas || medidas.length === 0) return 0;

  // Filtrar apenas medidas com respostas válidas
  const validMedidas = medidas.filter(m => 
    m.resposta !== null && 
    m.resposta !== undefined && 
    typeof m.resposta === 'number'
  );

  if (validMedidas.length === 0) return 0;

  // Calcular média das respostas
  const mediaSemPeso = validMedidas.reduce((sum, medida) => 
    sum + calculateMedidaMaturity(medida.resposta), 0
  ) / validMedidas.length;

  // Aplicar fator INCC (quanto maior o INCC, maior o peso)
  const fatorINCC = 1 + (inccLevel - 1) * 0.1; // 1.0 a 1.4
  
  return Math.min(1, mediaSemPeso * fatorINCC);
};

/**
 * Calcula a maturidade de um diagnóstico baseado em seus controles
 * @param diagnosticoId ID do diagnóstico
 * @param programaId ID do programa
 * @param state Estado da aplicação
 * @returns Objeto com score e label de maturidade
 */
export const calculateDiagnosticoMaturity = (
  diagnosticoId: number, 
  programaId: number, 
  state: State
): { score: number; label: string } => {
  const controles = state.controles?.[diagnosticoId] || [];
  
  // Filtrar controles do programa específico
  const controlesDoPrograma = controles.filter((controle: any) => 
    controle.programa === programaId
  );

  if (controlesDoPrograma.length === 0) {
    return { score: 0, label: "Inicial" };
  }

  let totalScore = 0;
  let totalWeight = 0;

  controlesDoPrograma.forEach((controle: any) => {
    const medidas = state.medidas?.[controle.id] || [];
    const controleScore = calculateControleMaturity(medidas, controle.incc || 1);
    const peso = controle.incc || 1;
    
    totalScore += controleScore * peso;
    totalWeight += peso;
  });

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  const maturityLabel = getMaturityLabel(finalScore);

  return { score: finalScore, label: maturityLabel };
};

/**
 * Calcula a maturidade geral de um programa
 * @param programaId ID do programa
 * @param state Estado da aplicação
 * @returns Objeto com score e label de maturidade
 */
export const calculateProgramaMaturity = (
  programaId: number, 
  state: State
): { score: number; label: string } => {
  const diagnosticos = state.diagnosticos || [];
  
  if (diagnosticos.length === 0) {
    return { score: 0, label: "Inicial" };
  }

  let totalScore = 0;
  let diagnosticoCount = 0;

  diagnosticos.forEach((diagnostico: any) => {
    const diagnosticoMaturity = calculateDiagnosticoMaturity(
      diagnostico.id, 
      programaId, 
      state
    );
    
    if (diagnosticoMaturity.score > 0) {
      totalScore += diagnosticoMaturity.score;
      diagnosticoCount++;
    }
  });

  const finalScore = diagnosticoCount > 0 ? totalScore / diagnosticoCount : 0;
  const maturityLabel = getMaturityLabel(finalScore);

  return { score: finalScore, label: maturityLabel };
};

/**
 * Cache para evitar recálculos desnecessários
 */
const maturityCache = new Map<string, { score: number; label: string; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 segundos

/**
 * Versão com cache do cálculo de maturidade do programa
 * @param programaId ID do programa
 * @param state Estado da aplicação
 * @returns Objeto com score e label de maturidade (pode vir do cache)
 */
export const calculateProgramaMaturityCached = (
  programaId: number, 
  state: State
): { score: number; label: string } => {
  const cacheKey = `programa-${programaId}`;
  const now = Date.now();
  
  // Verificar se existe no cache e ainda é válido
  const cached = maturityCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return { score: cached.score, label: cached.label };
  }

  // Calcular novo valor
  const result = calculateProgramaMaturity(programaId, state);
  
  // Salvar no cache
  maturityCache.set(cacheKey, {
    ...result,
    timestamp: now
  });

  return result;
};

/**
 * Limpa o cache de maturidade para um programa específico
 * @param programaId ID do programa
 */
export const clearMaturityCache = (programaId?: number) => {
  if (programaId) {
    maturityCache.delete(`programa-${programaId}`);
  } else {
    maturityCache.clear();
  }
}; 