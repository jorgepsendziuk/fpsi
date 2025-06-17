import { useState, useEffect } from 'react';
import { Responsavel } from '../../../app/diagnostico/types';

interface ResponsavelGridData {
  responsaveis: Responsavel[];
  loading: boolean;
  error: string | null;
}

interface ResponsavelGridHandlers {
  onAdd: () => void;
  onEdit: (responsavel: Responsavel) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

export const useResponsavelGrid = (initialResponsaveis: Responsavel[] = []) => {
  const [gridData, setGridData] = useState<ResponsavelGridData>({
    responsaveis: initialResponsaveis,
    loading: false,
    error: null,
  });

  const handlers: ResponsavelGridHandlers = {
    onAdd: () => {
      // Add responsavel logic
      console.log('Adding responsavel');
    },
    onEdit: (responsavel: Responsavel) => {
      // Edit responsavel logic
      console.log('Editing responsavel:', responsavel);
    },
    onDelete: (id: number) => {
      // Delete responsavel logic
      setGridData(prev => ({
        ...prev,
        responsaveis: prev.responsaveis.filter(r => r.id !== id),
      }));
    },
    onRefresh: () => {
      // Refresh responsaveis logic
      setGridData(prev => ({ ...prev, loading: true }));
      // Simulate API call
      setTimeout(() => {
        setGridData(prev => ({ ...prev, loading: false }));
      }, 1000);
    },
  };

  return { gridData, handlers };
}; 