# Plano de Refatoração de Componentes - FPSI

## 1. DiagnosticoContainer

### Estado Atual
- Usa `any` em várias props e estados
- Mistura lógica de negócio com gerenciamento de estado
- Falta tipagem adequada para controles
- Duplicação de lógica de cálculo
- Prop drilling excessivo

### Mudanças Necessárias
1. **Tipagem**
```typescript
interface DiagnosticoState {
  controles: Record<number, Controle[]>;
  medidas: Record<number, Medida[]>;
}

interface DiagnosticoContainerProps {
  diagnostico: Diagnostico;
  programa: Programa;
  state: DiagnosticoState;
  controles?: Controle[];
  maturityScore?: number;
  maturityLabel?: string;
  handleControleFetch: (diagnosticoId: number, programaId: number) => Promise<void>;
  handleINCCChange: (programaControleId: number, diagnosticoId: number, value: number) => void;
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: keyof Medida, value: Medida[keyof Medida]) => void;
  responsaveis: Responsavel[];
}
```

2. **Custom Hooks**
```typescript
const useDiagnosticoControles = (
  diagnosticoId: number,
  programaId: number,
  state: DiagnosticoState,
  propControles?: Controle[]
) => {
  const [controles, setControles] = useState<Controle[]>(propControles || []);

  useEffect(() => {
    if (propControles) {
      setControles(propControles);
      return;
    }

    if (state.controles?.[diagnosticoId]) {
      const filteredControles = state.controles[diagnosticoId]
        .filter(controle => controle.programa === programaId);
      setControles(filteredControles);
    }
  }, [state.controles, diagnosticoId, programaId, propControles]);

  return controles;
};
```

3. **Memoização**
```typescript
const calculateMaturityScore = useMemo(() => {
  return propMaturityScore || calculateSumOfResponsesForDiagnostico(diagnostico.id, state);
}, [propMaturityScore, diagnostico.id, state]);

const maturityLabel = useMemo(() => {
  return propMaturityLabel || getMaturityLabel(Number(calculateMaturityScore));
}, [propMaturityLabel, calculateMaturityScore]);
```

### Implementação
```typescript
const DiagnosticoContainer: React.FC<DiagnosticoContainerProps> = ({
  diagnostico,
  programa,
  state,
  controles: propControles,
  maturityScore: propMaturityScore,
  maturityLabel: propMaturityLabel,
  handleControleFetch,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  const controles = useDiagnosticoControles(
    diagnostico.id,
    programa.id,
    state,
    propControles
  );

  const maturityScore = useMemo(() => {
    return propMaturityScore || calculateSumOfResponsesForDiagnostico(diagnostico.id, state);
  }, [propMaturityScore, diagnostico.id, state]);

  const maturityLabel = useMemo(() => {
    return propMaturityLabel || getMaturityLabel(Number(maturityScore));
  }, [propMaturityLabel, maturityScore]);

  return (
    <DiagnosticoComponent
      diagnostico={diagnostico}
      programa={programa}
      controles={controles}
      maturityScore={maturityScore}
      maturityLabel={maturityLabel}
      state={state}
      handleControleFetch={handleControleFetch}
      handleINCCChange={handleINCCChange}
      handleMedidaFetch={handleMedidaFetch}
      handleMedidaChange={handleMedidaChange}
      responsaveis={responsaveis}
    />
  );
};
```

## 2. ControleContainer

### Estado Atual
- Usa `any` em props e estados
- Lógica de carregamento de medidas duplicada
- Falta tipagem para medidas
- Prop drilling para funções de manipulação

### Mudanças Necessárias
1. **Tipagem**
```typescript
interface ControleState {
  medidas: Record<number, Medida[]>;
}

interface ControleContainerProps {
  controle: Controle;
  diagnostico: Diagnostico;
  programaId: number;
  state: ControleState;
  handleINCCChange: (programaControleId: number, diagnosticoId: number, value: number) => void;
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: keyof Medida, value: Medida[keyof Medida]) => void;
  responsaveis: Responsavel[];
}
```

2. **Custom Hook para Medidas**
```typescript
const useControleMedidas = (
  controleId: number,
  programaId: number,
  state: ControleState,
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>
) => {
  const [medidas, setMedidas] = useState<Medida[]>([]);

  useEffect(() => {
    if (state.medidas?.[controleId]) {
      setMedidas(state.medidas[controleId]);
    }
  }, [state.medidas, controleId]);

  useEffect(() => {
    const loadMedidas = async () => {
      if (!state.medidas?.[controleId]?.length) {
        await handleMedidaFetch(controleId, programaId);
      }
    };
    
    loadMedidas();
  }, [controleId, programaId, handleMedidaFetch, state.medidas]);

  return medidas;
};
```

3. **Memoização do Cálculo de Maturidade**
```typescript
const maturityIndex = useMemo(() => {
  return calculateMaturityIndexForControle(controle, state);
}, [controle, state]);
```

### Implementação
```typescript
const ControleContainer: React.FC<ControleContainerProps> = ({
  controle,
  diagnostico,
  programaId,
  state,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  const medidas = useControleMedidas(
    controle.id,
    programaId,
    state,
    handleMedidaFetch
  );

  const maturityIndex = useMemo(() => {
    return calculateMaturityIndexForControle(controle, state);
  }, [controle, state]);

  /**
   * Calculate the maturity index for this control
   */
  const calculateMaturityIndex = (controle: Controle) => {
    const result = calculateMaturityIndexForControle(controle, state);
    return result;
  };

  return (
    <ControleComponent
      controle={controle}
      diagnostico={diagnostico}
      medidas={medidas}
      programaId={programaId}
      responsaveis={responsaveis}
      handleINCCChange={handleINCCChange}
      handleMedidaChange={handleMedidaChange}
      calculateMaturityIndex={calculateMaturityIndex}
    />
  );
};
```

## 3. ResponsavelComponent

### Problema Original
- Interface indefinida/não padronizada
- Falta de integração com containers
- Ausência de funcionalidades de edição em grid

### Nova Interface
```typescript
interface ResponsavelComponentProps {
  rows: Responsavel[];
  rowModesModel: GridRowModesModel;
  handleRowEditStart: (params: any, event: any) => void;
  handleRowEditStop: (params: any, event: any) => void;
  handleEditClick: (id: any) => () => void;
  handleSaveClick: (id: any) => () => void;
  handleCancelClick: (id: any) => () => void;
  handleDeleteClick: (id: any) => () => void;
  handleAddClick: () => void;
  handleProcessRowUpdate: (newRow: any) => any;
}
```

### Nova Implementação
```typescript
// src/app/diagnostico/components/ResponsavelComponent.tsx
import React from 'react';
import { DataGrid, GridColDef, GridRowModesModel, GridActionsCellItem } from '@mui/x-data-grid';
import { Save, Cancel, Edit, Delete, Add } from '@mui/icons-material';
import { Button, Box } from '@mui/material';
import type { Responsavel } from '../types';

const ResponsavelComponent: React.FC<ResponsavelComponentProps> = ({
  rows,
  rowModesModel,
  handleRowEditStart,
  handleRowEditStop,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  handleDeleteClick,
  handleAddClick,
  handleProcessRowUpdate,
}) => {
  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', width: 200, editable: true },
    { field: 'email', headerName: 'Email', width: 250, editable: true },
    { field: 'departamento', headerName: 'Departamento', width: 200, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === 'edit';

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<Save />}
              label="Salvar"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<Cancel />}
              label="Cancelar"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<Edit />}
            label="Editar"
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Delete />}
            label="Excluir"
            onClick={handleDeleteClick(id)}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
        >
          Adicionar Responsável
        </Button>
      </Box>
      
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={handleProcessRowUpdate}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </Box>
  );
};

export default ResponsavelComponent;
```

## 4. Decisões Técnicas

### 4.1 Tipagem
- Remoção completa de `any`
- Interfaces específicas para cada componente
- Tipagem estrita para eventos e callbacks
- Validação de dados com TypeScript

### 4.2 Performance
- Memoização de cálculos pesados
- Custom hooks para lógica reutilizável
- Otimização de re-renders
- Lazy loading de componentes

### 4.3 Manutenibilidade
- Separação clara de responsabilidades
- Documentação com JSDoc
- Testes unitários
- Código limpo e organizado

### 4.4 Segurança
- Validação de inputs
- Sanitização de dados
- Tratamento de erros
- Proteção contra XSS

## 5. Próximos Passos

1. Implementar testes unitários para cada componente
2. Adicionar documentação JSDoc
3. Configurar CI/CD
4. Implementar monitoramento de performance
5. Adicionar logs de erro
6. Implementar feedback de loading
7. Melhorar tratamento de erros
8. Adicionar animações de transição 