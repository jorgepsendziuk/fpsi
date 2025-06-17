import { Diagnostico } from '../../../app/diagnostico/types';

interface GridData {
  diagnosticos: Diagnostico[];
  loading: boolean;
  error: string | null;
}

interface Handlers {
  onAdd: () => void;
  onEdit: (diagnostico: Diagnostico) => void;
  onDelete: (id: number) => void;
}

export const useDiagnosticoGrid = (): { gridData: GridData; handlers: Handlers } => {
  // Implementation will be added later
  return {
    gridData: {
      diagnosticos: [],
      loading: false,
      error: null,
    },
    handlers: {
      onAdd: () => {},
      onEdit: () => {},
      onDelete: () => {},
    },
  };
}; 