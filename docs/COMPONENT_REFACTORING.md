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

  return (
    <ControleComponent
      controle={controle}
      diagnostico={diagnostico}
      medidas={medidas}
      programaId={programaId}
      responsaveis={responsaveis}
      handleINCCChange={handleINCCChange}
      handleMedidaChange={handleMedidaChange}
      calculateMaturityIndex={() => maturityIndex}
    />
  );
};
```

## 3. ResponsavelComponent

### Estado Atual
- Usa `any` em props e eventos
- Falta tipagem para ações do grid
- Duplicação de lógica de manipulação de linhas
- Falta validação de dados

### Mudanças Necessárias
1. **Tipagem**
```typescript
interface GridEvent {
  id: number;
  field: string;
  value: any;
}

interface ResponsavelComponentProps {
  rows: Responsavel[];
  rowModesModel: GridRowModesModel;
  handleRowEditStart: (params: GridEvent, event: React.MouseEvent) => void;
  handleRowEditStop: (params: GridEvent, event: React.MouseEvent) => void;
  handleEditClick: (id: number) => () => void;
  handleSaveClick: (id: number) => () => Promise<void>;
  handleCancelClick: (id: number) => () => void;
  handleDeleteClick: (id: number) => () => Promise<void>;
  handleAddClick: () => Promise<void>;
  handleProcessRowUpdate: (newRow: Responsavel) => Promise<Responsavel>;
}
```

2. **Custom Hook para Grid**
```typescript
const useResponsavelGrid = (
  rows: Responsavel[],
  onSave: (row: Responsavel) => Promise<void>,
  onDelete: (id: number) => Promise<void>
) => {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handleRowEditStart = (params: GridEvent, event: React.MouseEvent) => {
    event.defaultMuiPrevented = true;
    setRowModesModel({ ...rowModesModel, [params.id]: { mode: GridRowModes.Edit } });
  };

  const handleRowEditStop = (params: GridEvent, event: React.MouseEvent) => {
    event.defaultMuiPrevented = true;
    setRowModesModel({ ...rowModesModel, [params.id]: { mode: GridRowModes.View } });
  };

  const handleEditClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: number) => async () => {
    const row = rows.find(r => r.id === id);
    if (row) {
      await onSave(row);
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleDeleteClick = (id: number) => async () => {
    await onDelete(id);
  };

  return {
    rowModesModel,
    handleRowEditStart,
    handleRowEditStop,
    handleEditClick,
    handleSaveClick,
    handleDeleteClick
  };
};
```

3. **Validação de Dados**
```typescript
const validateResponsavel = (responsavel: Responsavel): string[] => {
  const errors: string[] = [];
  
  if (!responsavel.nome?.trim()) {
    errors.push('Nome é obrigatório');
  }
  
  if (!responsavel.email?.trim()) {
    errors.push('Email é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavel.email)) {
    errors.push('Email inválido');
  }
  
  return errors;
};
```

### Implementação
```typescript
const ResponsavelComponent: React.FC<ResponsavelComponentProps> = ({
  rows,
  handleProcessRowUpdate,
  handleAddClick,
  handleDeleteClick
}) => {
  const {
    rowModesModel,
    handleRowEditStart,
    handleRowEditStop,
    handleEditClick,
    handleSaveClick,
    handleDeleteClick: handleGridDeleteClick
  } = useResponsavelGrid(rows, handleProcessRowUpdate, handleDeleteClick);

  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', width: 200, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Save />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<Cancel />}
              label="Cancel"
              onClick={handleCancelClick(id)}
            />
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Edit"
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            icon={<Delete />}
            label="Delete"
            onClick={handleGridDeleteClick(id)}
          />
        ];
      }
    }
  ];

  return (
    <Box sx={responsavelStyles.container}>
      <Button
        startIcon={<Add />}
        onClick={handleAddClick}
        sx={responsavelStyles.addButton}
      >
        Adicionar Responsável
      </Button>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={handleProcessRowUpdate}
        sx={responsavelStyles.grid}
      />
    </Box>
  );
};
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