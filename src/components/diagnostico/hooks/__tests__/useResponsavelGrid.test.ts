import { renderHook, act } from '@testing-library/react-hooks';
import { useResponsavelGrid } from '../../hooks/useResponsavelGrid';
import { Responsavel } from '../../types';

describe('useResponsavelGrid', () => {
  const mockResponsaveis: Responsavel[] = [
    {
      id: 1,
      programa: 1,
      nome: 'Responsável Teste',
      email: 'teste@exemplo.com',
      departamento: 'Departamento Teste',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return grid data and handlers', () => {
    const { result } = renderHook(() => useResponsavelGrid(mockResponsaveis));

    expect(result.current.gridData.responsaveis).toEqual(mockResponsaveis);
    expect(result.current.gridData.loading).toBe(false);
    expect(result.current.gridData.error).toBeNull();
    expect(result.current.handlers.onAdd).toBeDefined();
    expect(result.current.handlers.onEdit).toBeDefined();
    expect(result.current.handlers.onDelete).toBeDefined();
    expect(result.current.handlers.onRefresh).toBeDefined();
  });

  it('should handle responsavel add', () => {
    const { result } = renderHook(() => useResponsavelGrid(mockResponsaveis));

    act(() => {
      result.current.handlers.onAdd();
    });

    // Should not throw error
    expect(result.current.handlers.onAdd).toBeDefined();
  });

  it('should handle responsavel edit', () => {
    const { result } = renderHook(() => useResponsavelGrid(mockResponsaveis));

    act(() => {
      result.current.handlers.onEdit(mockResponsaveis[0]);
    });

    // Should not throw error
    expect(result.current.handlers.onEdit).toBeDefined();
  });

  it('should handle responsavel delete', () => {
    const { result } = renderHook(() => useResponsavelGrid(mockResponsaveis));

    act(() => {
      result.current.handlers.onDelete(1);
    });

    // After delete, the responsavel should be removed
    expect(result.current.gridData.responsaveis).toHaveLength(0);
  });

  it('should handle empty responsaveis', () => {
    const { result } = renderHook(() => useResponsavelGrid([]));

    expect(result.current.gridData.responsaveis).toEqual([]);
  });

  it('should handle multiple responsaveis', () => {
    const multipleResponsaveis: Responsavel[] = [
      ...mockResponsaveis,
      {
        id: 2,
        programa: 1,
        nome: 'Responsável 2',
        email: 'teste2@exemplo.com',
        departamento: 'Departamento 2',
      },
    ];

    const { result } = renderHook(() => useResponsavelGrid(multipleResponsaveis));

    expect(result.current.gridData.responsaveis).toHaveLength(2);
    expect(result.current.gridData.responsaveis[0].nome).toBe('Responsável Teste');
    expect(result.current.gridData.responsaveis[1].nome).toBe('Responsável 2');
  });

  it('should handle refresh', () => {
    const { result } = renderHook(() => useResponsavelGrid(mockResponsaveis));

    act(() => {
      result.current.handlers.onRefresh();
    });

    // Should set loading to true initially
    expect(result.current.gridData.loading).toBe(true);
  });

  it('should handle multiple operations in sequence', () => {
    const { result } = renderHook(() => useResponsavelGrid(mockResponsaveis));

    act(() => {
      result.current.handlers.onAdd();
      result.current.handlers.onEdit(mockResponsaveis[0]);
      result.current.handlers.onDelete(1);
    });

    // All handlers should work without errors
    expect(result.current.gridData.responsaveis).toHaveLength(0);
  });

  it('should handle responsaveis updates', () => {
    const { result, rerender } = renderHook(
      ({ responsaveis }: { responsaveis: Responsavel[] }) => useResponsavelGrid(responsaveis),
      {
        initialProps: { responsaveis: mockResponsaveis },
      }
    );

    const updatedResponsaveis: Responsavel[] = [
      {
        ...mockResponsaveis[0],
        nome: 'Responsável Atualizado',
      },
    ];

    rerender({ responsaveis: updatedResponsaveis });

    expect(result.current.gridData.responsaveis[0].nome).toBe('Responsável Atualizado');
  });
}); 