import { calculateSumOfResponsesForDiagnostico, calculateMaturityIndex } from  '../../utils/calculations';
import { State, Controle } from '../../types';

describe('calculations', () => {
  describe('calculateSumOfResponsesForDiagnostico', () => {
    const mockState: State = {
      responsaveis: [],
      programas: [],
      diagnosticos: [],
      controles: {
        1: [
          {
            id: 1,
            nome: 'Controle Teste',
            diagnostico: 1,
            numero: 1,
            texto: 'Controle teste',
            incc: 50,
          } as any,
          {
            id: 2,
            nome: 'Controle Teste 2',
            diagnostico: 1,
            numero: 2,
            texto: 'Controle teste 2',
            incc: 75,
          } as any,
        ],
      },
      medidas: {},
      medidas_programas: [],
      respostas: [],
    };

    it('should calculate sum correctly', () => {
      const result = calculateSumOfResponsesForDiagnostico(1, mockState);
      expect(result).toBe(125);
    });

    it('should handle empty state', () => {
      const emptyState: State = {
        responsaveis: [],
        programas: [],
        diagnosticos: [],
        controles: {},
        medidas: {},
        medidas_programas: [],
        respostas: [],
      };
      const result = calculateSumOfResponsesForDiagnostico(1, emptyState);
      expect(result).toBe(0);
    });

    it('should handle invalid diagnostico', () => {
      const result = calculateSumOfResponsesForDiagnostico(999, mockState);
      expect(result).toBe(0);
    });

    it('should handle controles with different diagnosticos', () => {
      const stateWithMultipleDiagnosticos: State = {
        responsaveis: [],
        programas: [],
        diagnosticos: [],
        controles: {
          1: [
            {
              id: 1,
              nome: 'Controle Teste',
              diagnostico: 1,
              numero: 1,
              texto: 'Controle teste',
              incc: 50,
            } as any,
            {
              id: 2,
              nome: 'Controle Teste 2',
              diagnostico: 2,
              numero: 2,
              texto: 'Controle teste 2',
              incc: 75,
            } as any,
          ],
        },
        medidas: {},
        medidas_programas: [],
        respostas: [],
      };

      const result = calculateSumOfResponsesForDiagnostico(1, stateWithMultipleDiagnosticos);
      expect(result).toBe(50);
    });

    it('should handle controles with inactive status', () => {
      const stateWithInactiveControles: State = {
        responsaveis: [],
        programas: [],
        diagnosticos: [],
        controles: {
          1: [
            {
              id: 1,
              nome: 'Controle Teste',
              diagnostico: 1,
              numero: 1,
              texto: 'Controle teste',
              incc: 50,
              status: 'inativo',
            } as any,
            {
              id: 2,
              nome: 'Controle Teste 2',
              diagnostico: 1,
              numero: 2,
              texto: 'Controle teste 2',
              incc: 75,
              status: 'ativo',
            } as any,
          ],
        },
        medidas: {},
        medidas_programas: [],
        respostas: [],
      };

      const result = calculateSumOfResponsesForDiagnostico(1, stateWithInactiveControles);
      expect(result).toBe(125); // Both should be counted regardless of status
    });
  });

  describe('calculateMaturityIndex', () => {
    const mockControle: Controle = {
      id: 1,
      diagnostico: 1,
      numero: 1,
      nome: 'Controle Teste',
      texto: 'Texto do controle',
    };

    const mockState: State = {
      responsaveis: [],
      programas: [],
      diagnosticos: [],
      controles: {},
      medidas: {
        1: [
          { id: 1, resposta: 75 } as any,
          { id: 2, resposta: 50 } as any,
        ],
      },
      medidas_programas: [],
      respostas: [],
    };

    it('should calculate maturity index correctly', () => {
      const result = calculateMaturityIndex(mockControle, mockState);
      expect(result).toBe(62.5);
    });

    it('should handle zero medidas', () => {
      const emptyMedidasState: State = {
        ...mockState,
        medidas: {},
      };
      const result = calculateMaturityIndex(mockControle, emptyMedidasState);
      expect(result).toBe(0);
    });

    it('should handle medidas without responses', () => {
      const noResponseState: State = {
        ...mockState,
        medidas: {
          1: [
            { id: 1 } as any,
            { id: 2 } as any,
          ],
        },
      };
      const result = calculateMaturityIndex(mockControle, noResponseState);
      expect(result).toBe(0);
    });
  });
}); 