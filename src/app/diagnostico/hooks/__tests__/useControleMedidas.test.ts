import { renderHook, act } from '@testing-library/react-hooks';
import { useControleMedidas } from '../../hooks/useControleMedidas';

describe('useControleMedidas', () => {
  const mockState = {
    medidas: {
      1: [
        {
          id: 1,
          nome: 'Medida Teste',
          controle: 1,
          programa: 1,
          status: 'ativo',
          data_criacao: '2024-01-01',
          data_atualizacao: '2024-01-01',
        },
      ],
    },
  };

  const mockHandleMedidaFetch = jest.fn();
  const mockHandleMedidaChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return medidas for a given controle', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(result.current).toEqual(mockState.medidas[1]);
  });

  it('should fetch medidas on mount', () => {
    renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(mockHandleMedidaFetch).toHaveBeenCalledWith(1, 1);
  });

  it('should handle medida changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('nome', 'Nova Medida');
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'nome', 'Nova Medida');
  });

  it('should handle empty medidas', () => {
    const emptyState = {
      medidas: {},
    };

    const { result } = renderHook(() =>
      useControleMedidas(1, emptyState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(result.current).toEqual([]);
  });

  it('should handle multiple medidas', () => {
    const multipleMedidasState = {
      medidas: {
        1: [
          {
            id: 1,
            nome: 'Medida 1',
            controle: 1,
            programa: 1,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
          {
            id: 2,
            nome: 'Medida 2',
            controle: 1,
            programa: 1,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
        ],
      },
    };

    const { result } = renderHook(() =>
      useControleMedidas(1, multipleMedidasState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0].nome).toBe('Medida 1');
    expect(result.current[1].nome).toBe('Medida 2');
  });

  it('should handle medida status changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('status', 'inativo');
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'status', 'inativo');
  });

  it('should handle medida program changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('programa', 2);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'programa', 2);
  });

  it('should handle medida creation date changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    const newDate = '2024-02-01';
    act(() => {
      result.current[0].handleChange('data_criacao', newDate);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'data_criacao', newDate);
  });

  it('should handle medida update date changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    const newDate = '2024-02-01';
    act(() => {
      result.current[0].handleChange('data_atualizacao', newDate);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'data_atualizacao', newDate);
  });

  it('should handle multiple changes in sequence', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('nome', 'Nova Medida');
      result.current[0].handleChange('status', 'inativo');
      result.current[0].handleChange('programa', 2);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledTimes(3);
    expect(mockHandleMedidaChange).toHaveBeenNthCalledWith(1, 1, 1, 1, 'nome', 'Nova Medida');
    expect(mockHandleMedidaChange).toHaveBeenNthCalledWith(2, 1, 1, 1, 'status', 'inativo');
    expect(mockHandleMedidaChange).toHaveBeenNthCalledWith(3, 1, 1, 1, 'programa', 2);
  });

  it('should handle state updates', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useControleMedidas(1, state, mockHandleMedidaFetch, mockHandleMedidaChange),
      {
        initialProps: { state: mockState },
      }
    );

    const updatedState = {
      medidas: {
        1: [
          {
            ...mockState.medidas[1][0],
            nome: 'Medida Atualizada',
          },
        ],
      },
    };

    rerender({ state: updatedState });

    expect(result.current[0].nome).toBe('Medida Atualizada');
  });
}); 