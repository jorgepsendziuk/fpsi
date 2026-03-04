import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  Button
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as DiagnosticoIcon,
  Security as ControleIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import * as dataService from '../../lib/services/dataService';
import { shouldUseDemoData } from '../../lib/services/demoDataService';
import { status_medida, status_plano_acao, respostas, respostasimnao } from '../../lib/utils/utils';

interface PlanoAcaoResumoProps {
  programaId: number;
  programaName: string;
}

interface MedidaPlanoAcao {
  id: number;
  id_medida: string;
  medida: string;
  controle_id: number;
  controle_nome: string;
  diagnostico_id: number;
  diagnostico_nome: string;
  resposta?: number;
  responsavel?: number;
  responsavel_nome?: string;
  previsao_inicio?: string;
  previsao_fim?: string;
  status_medida?: number;
  status_plano_acao?: number;
  prioridade?: boolean;
  justificativa?: string;
  programa_medida?: any;
}

interface ControleGroup {
  id: number;
  nome: string;
  qtdMedidas: number;
  medidas: MedidaPlanoAcao[];
}

interface DiagnosticoGroup {
  id: number;
  nome: string;
  qtdMedidas: number;
  controles: ControleGroup[];
}

const PlanoAcaoResumo: React.FC<PlanoAcaoResumoProps> = ({
  programaId,
  programaName
}) => {
  const theme = useTheme();
  const [resumo, setResumo] = useState<{
    total: number;
    comResposta: number;
    concluidas: number;
    emAndamento: number;
    atrasadas: number;
    comPrioridade?: number;
    diagnosticos: Array<{
      id: number;
      nome: string;
      qtdControles: number;
      qtdMedidas: number;
      controles: Array<{ id: number; nome: string; qtdMedidas: number }>;
    }>;
  } | null>(null);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoGroup[]>([]);
  const [medidasByControle, setMedidasByControle] = useState<Record<number, MedidaPlanoAcao[]>>({});
  const [loadingControles, setLoadingControles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [filtroPrioridade, setFiltroPrioridade] = useState<'todos' | 'prioritarias'>('todos');
  const [filtroResposta, setFiltroResposta] = useState<'todos' | 'respondidas' | 'nao_respondidas'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<number | 'todos'>('todos');
  const [selectedMedidas, setSelectedMedidas] = useState<Set<string>>(new Set());

  const loadMedidasForControle = useCallback(
    async (controleId: number, controleNome: string, diagnosticoId: number, diagnosticoNome: string) => {
      if (medidasByControle[controleId]?.length !== undefined) return;
      setLoadingControles((prev) => new Set(prev).add(controleId));
      try {
        const medidasData = await dataService.fetchMedidas(controleId, programaId);
        const controleNomeFn = (c: any) => c.controle || c.nome;
        const medidasResult: MedidaPlanoAcao[] = medidasData.map((medida: any) => {
          const pm = medida.programa_medida;
          return {
            id: medida.id,
            id_medida: medida.id_medida,
            medida: medida.medida,
            controle_id: controleId,
            controle_nome: controleNome,
            diagnostico_id: diagnosticoId,
            diagnostico_nome: diagnosticoNome,
            resposta: pm?.resposta != null ? (typeof pm.resposta === 'string' ? parseInt(pm.resposta, 10) : pm.resposta) : undefined,
            responsavel: pm?.responsavel,
            previsao_inicio: pm?.previsao_inicio,
            previsao_fim: pm?.previsao_fim,
            status_medida: pm?.status_medida,
            status_plano_acao: pm?.status_plano_acao,
            prioridade: pm?.prioridade ?? false,
            justificativa: pm?.justificativa,
            programa_medida: pm
          } as MedidaPlanoAcao;
        });
        setMedidasByControle((prev) => ({ ...prev, [controleId]: medidasResult }));
      } catch (err) {
        console.warn(`Erro ao carregar medidas do controle ${controleId}:`, err);
        setMedidasByControle((prev) => ({ ...prev, [controleId]: [] }));
      } finally {
        setLoadingControles((prev) => {
          const next = new Set(prev);
          next.delete(controleId);
          return next;
        });
      }
    },
    [programaId, medidasByControle]
  );

  const handleControleExpand = useCallback(
    (controleId: number, controleNome: string, diagnosticoId: number, diagnosticoNome: string) => {
      loadMedidasForControle(controleId, controleNome, diagnosticoId, diagnosticoNome);
    },
    [loadMedidasForControle]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [responsaveisData] = await Promise.all([
          dataService.fetchResponsaveis(programaId)
        ]);
        setResponsaveis(responsaveisData);

        if (shouldUseDemoData(programaId)) {
          const diagnosticosDemo = await loadDemoData();
          setDiagnosticos(diagnosticosDemo);
          setResumo({
            total: diagnosticosDemo.reduce((s, d) => s + d.controles.reduce((t, c) => t + c.medidas.length, 0), 0),
            comResposta: diagnosticosDemo.reduce((s, d) => s + d.controles.reduce((t, c) => t + c.medidas.filter((m) => m.resposta).length, 0), 0),
            concluidas: diagnosticosDemo.reduce((s, d) => s + d.controles.reduce((t, c) => t + c.medidas.filter((m) => m.status_plano_acao === 2).length, 0), 0),
            emAndamento: diagnosticosDemo.reduce((s, d) => s + d.controles.reduce((t, c) => t + c.medidas.filter((m) => m.status_plano_acao === 4).length, 0), 0),
            atrasadas: diagnosticosDemo.reduce((s, d) => s + d.controles.reduce((t, c) => t + c.medidas.filter((m) => m.status_plano_acao === 5).length, 0), 0),
            comPrioridade: diagnosticosDemo.reduce((s, d) => s + d.controles.reduce((t, c) => t + c.medidas.filter((m) => m.prioridade).length, 0), 0),
            diagnosticos: diagnosticosDemo.map((d) => ({
              id: d.id,
              nome: d.nome,
              qtdControles: d.controles.length,
              qtdMedidas: d.controles.reduce((t, c) => t + c.medidas.length, 0),
              controles: d.controles.map((c) => ({ id: c.id, nome: c.nome, qtdMedidas: c.medidas.length }))
            }))
          });
        } else {
          await dataService.ensureProgramaMedidaRecords(programaId);
          const resumoData = await dataService.fetchPlanoAcaoResumo(programaId);
          setResumo(resumoData);
          setDiagnosticos(
            resumoData.diagnosticos.map((d) => ({
              id: d.id,
              nome: d.nome,
              qtdMedidas: d.qtdMedidas,
              controles: d.controles.map((c) => ({
                id: c.id,
                nome: c.nome,
                qtdMedidas: c.qtdMedidas,
                medidas: [] as MedidaPlanoAcao[]
              }))
            }))
          );
        }
      } catch (err) {
        console.error('Erro ao carregar plano de trabalho:', err);
        setError('Erro ao carregar dados do plano de trabalho');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [programaId]);

  const loadDemoData = async (): Promise<DiagnosticoGroup[]> => {
    return [
      {
        id: 1,
        nome: 'Diagnóstico de Segurança Básica',
        qtdMedidas: 1,
        controles: [
          {
            id: 1,
            nome: 'Controle de Acesso',
            qtdMedidas: 1,
            medidas: [
              {
                id: 1,
                id_medida: '1.1',
                medida: 'Implementar política de senhas seguras',
                controle_id: 1,
                controle_nome: 'Controle de Acesso',
                diagnostico_id: 1,
                diagnostico_nome: 'Diagnóstico de Segurança Básica',
                resposta: 4,
                responsavel: 1,
                responsavel_nome: 'João Silva (TI)',
                previsao_inicio: '2024-01-15',
                previsao_fim: '2024-03-15',
                status_medida: 2,
                status_plano_acao: 4,
                prioridade: true,
                justificativa: 'Implementação necessária para melhorar a segurança de acesso'
              }
            ]
          }
        ]
      }
    ];
  };

  const getRespostaLabel = (resposta: number, diagnosticoId: number = 2) => {
    if (!resposta) return 'Não respondida';
    const respostasArray = diagnosticoId === 1 ? respostasimnao : respostas;
    const respostaObj = respostasArray.find(r => r.id === resposta);
    return respostaObj?.label || 'Não definido';
  };

  const getRespostaColor = (resposta: number, diagnosticoId: number = 2) => {
    if (!resposta) return 'default';
    if (diagnosticoId === 1) {
      return resposta === 1 ? 'success' : 'error';
    } else {
      switch (resposta) {
        case 1: return 'success';
        case 2: return 'info';
        case 3: return 'warning';
        case 4: return 'secondary';
        case 5: return 'error';
        default: return 'default';
      }
    }
  };

  const getStatusMedidaInfo = (statusId?: number) => {
    if (!statusId) return { label: 'Não definido', color: '#9e9e9e' };
    const status = status_medida.find(s => s.id === statusId);
    return status ? { label: status.label, color: (status as any).color || '#9e9e9e' } : { label: 'Não definido', color: '#9e9e9e' };
  };

  const getStatusPlanoAcaoInfo = (statusId?: number) => {
    if (!statusId) return { label: 'Não definido', color: '#9e9e9e' };
    const status = status_plano_acao.find(s => s.id === statusId);
    return status ? { label: status.label, color: (status as any).color || '#9e9e9e' } : { label: 'Não definido', color: '#9e9e9e' };
  };

  const getStatusIcon = (statusId?: number) => {
    if (!statusId) return <ScheduleIcon fontSize="small" />;
    switch (statusId) {
      case 1: return <WarningIcon fontSize="small" />;
      case 2: return <CheckCircleIcon fontSize="small" />;
      case 3: return <ScheduleIcon fontSize="small" />;
      case 4: return <PlayArrowIcon fontSize="small" />;
      case 5: return <WarningIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getResponsavelDisplay = (responsavelId?: number, responsavelNome?: string) => {
    if (responsavelNome) return responsavelNome;
    if (!responsavelId) return 'Não definido';
    const responsavel = responsaveis.find(r => r.id === responsavelId);
    if (responsavel) {
      return `${responsavel.nome} (${responsavel.departamento || 'Sem setor'})`;
    }
    return 'Não definido';
  };

  const handleGeneratePDF = () => {
    window.print();
  };

  const getMedidaKey = (medidaId: number, controleId: number) => `${controleId}-${medidaId}`;

  const toggleMedidaSelection = (medidaId: number, controleId: number) => {
    const key = getMedidaKey(medidaId, controleId);
    setSelectedMedidas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllMedidasInControle = (medidas: MedidaPlanoAcao[], controleId: number) => {
    const allSelected = medidas.every((m) => selectedMedidas.has(getMedidaKey(m.id, controleId)));
    setSelectedMedidas((prev) => {
      const next = new Set(prev);
      medidas.forEach((m) => {
        const key = getMedidaKey(m.id, controleId);
        if (allSelected) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  };

  const handleBulkPrioridade = async (prioridade: boolean) => {
    const toUpdate = Array.from(selectedMedidas).map((key) => {
      const [controleId, medidaId] = key.split('-').map(Number);
      return { medidaId, controleId };
    });
    for (const { medidaId, controleId } of toUpdate) {
      await handleUpdateMedida(medidaId, controleId, 'prioridade', prioridade);
    }
    setSelectedMedidas(new Set());
  };

  const handleBulkStatusMedida = async (status: number) => {
    const toUpdate = Array.from(selectedMedidas).map((key) => {
      const [controleId, medidaId] = key.split('-').map(Number);
      return { medidaId, controleId };
    });
    for (const { medidaId, controleId } of toUpdate) {
      await handleUpdateMedida(medidaId, controleId, 'status_medida', status);
    }
    setSelectedMedidas(new Set());
  };

  const handleUpdateMedida = useCallback(
    async (medidaId: number, controleId: number, field: 'prioridade' | 'status_medida', value: boolean | number) => {
      if (shouldUseDemoData(programaId)) {
        setDiagnosticos((prev) =>
          prev.map((d) => ({
            ...d,
            controles: d.controles.map((c) =>
              c.id === controleId
                ? {
                    ...c,
                    medidas: c.medidas.map((m) =>
                      m.id === medidaId ? { ...m, [field]: value } : m
                    )
                  }
                : c
            )
          }))
        );
        return;
      }
      try {
        await dataService.updateProgramaMedida(medidaId, controleId, programaId, { [field]: value });
        setMedidasByControle((prev) => {
          const list = prev[controleId] ?? [];
          return {
            ...prev,
            [controleId]: list.map((m) =>
              m.id === medidaId ? { ...m, [field]: value } : m
            )
          };
        });
      } catch (err) {
        console.error('Erro ao atualizar medida:', err);
      }
    },
    [programaId]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const totalMedidas = resumo?.total ?? 0;
  const medidasComResposta = resumo?.comResposta ?? 0;
  const medidasConcluidas = resumo?.concluidas ?? 0;
  const medidasEmAndamento = resumo?.emAndamento ?? 0;
  const medidasAtrasadas = resumo?.atrasadas ?? 0;
  const medidasComPrioridade = resumo?.comPrioridade ?? 0;

  return (
    <Box sx={{
      '@media print': {
        '& .no-print': { display: 'none !important' },
        '& .MuiAccordion-root': { boxShadow: 'none !important', border: '1px solid #ddd !important' },
        '& .MuiTableContainer-root': { boxShadow: 'none !important' },
        '& .MuiChip-root': { border: '1px solid #ddd !important' }
      }
    }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AssignmentIcon sx={{ mr: 1, color: '#667eea' }} />
            Plano de Trabalho
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {programaName} • Acompanhamento resumido das medidas por diagnóstico e controle
          </Typography>
        </Box>
        <Box className="no-print">
          <Tooltip title="Gerar PDF / Imprimir">
            <IconButton
              onClick={handleGeneratePDF}
              color="primary"
              size="large"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', '@media print': { mb: 1 } }}>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem' }}>{totalMedidas}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Total de Medidas</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="info.main" sx={{ fontSize: '1.1rem' }}>{medidasComResposta}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Com Resposta</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="success.main" sx={{ fontSize: '1.1rem' }}>{medidasConcluidas}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Concluídas</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="warning.main" sx={{ fontSize: '1.1rem' }}>{medidasEmAndamento}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Em Andamento</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="error.main" sx={{ fontSize: '1.1rem' }}>{medidasAtrasadas}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Atrasadas</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', color: '#9c27b0' }}>{medidasComPrioridade}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Com Prioridade</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box className="no-print" sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Prioridade:</Typography>
        <Chip label="Todas" onClick={() => setFiltroPrioridade('todos')} color={filtroPrioridade === 'todos' ? 'primary' : 'default'} variant={filtroPrioridade === 'todos' ? 'filled' : 'outlined'} size="small" />
        <Chip label="Prioritárias" onClick={() => setFiltroPrioridade('prioritarias')} color={filtroPrioridade === 'prioritarias' ? 'primary' : 'default'} variant={filtroPrioridade === 'prioritarias' ? 'filled' : 'outlined'} size="small" />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>Resposta:</Typography>
        <Chip label="Todas" onClick={() => setFiltroResposta('todos')} color={filtroResposta === 'todos' ? 'primary' : 'default'} variant={filtroResposta === 'todos' ? 'filled' : 'outlined'} size="small" />
        <Chip label="Respondidas" onClick={() => setFiltroResposta('respondidas')} color={filtroResposta === 'respondidas' ? 'primary' : 'default'} variant={filtroResposta === 'respondidas' ? 'filled' : 'outlined'} size="small" />
        <Chip label="Não respondidas" onClick={() => setFiltroResposta('nao_respondidas')} color={filtroResposta === 'nao_respondidas' ? 'primary' : 'default'} variant={filtroResposta === 'nao_respondidas' ? 'filled' : 'outlined'} size="small" />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>Status:</Typography>
        <Chip label="Todos" onClick={() => setFiltroStatus('todos')} color={filtroStatus === 'todos' ? 'primary' : 'default'} variant={filtroStatus === 'todos' ? 'filled' : 'outlined'} size="small" />
        {status_plano_acao.filter((s) => s.id !== 1).map((s) => (
          <Chip key={s.id} label={s.label} onClick={() => setFiltroStatus(s.id)} color={filtroStatus === s.id ? 'primary' : 'default'} variant={filtroStatus === s.id ? 'filled' : 'outlined'} size="small" />
        ))}
      </Box>

      {selectedMedidas.size > 0 && (
        <Box className="no-print" sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" fontWeight="600">{selectedMedidas.size} selecionada(s)</Typography>
          <Button size="small" variant="outlined" onClick={() => handleBulkPrioridade(true)}>Marcar prioridade</Button>
          <Button size="small" variant="outlined" onClick={() => handleBulkPrioridade(false)}>Remover prioridade</Button>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              displayEmpty
              value=""
              onChange={(e) => { const v = e.target.value; if (v !== '') handleBulkStatusMedida(Number(v)); }}
              sx={{ fontSize: '0.8rem', height: 32 }}
            >
              <MenuItem value="" disabled>Status da medida</MenuItem>
              {status_medida.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button size="small" onClick={() => setSelectedMedidas(new Set())}>Limpar</Button>
        </Box>
      )}

      {diagnosticos.map((diagnostico) => (
        <Accordion key={diagnostico.id} sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DiagnosticoIcon color="primary" />
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>{diagnostico.nome}</Typography>
              <Chip label={`${diagnostico.qtdMedidas} medidas`} size="small" color="primary" variant="outlined" />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1 }}>
            {diagnostico.controles.map((controle) => {
              const medidasRaw = shouldUseDemoData(programaId)
                ? controle.medidas
                : (medidasByControle[controle.id] ?? []);
              let medidas = medidasRaw;
              if (filtroPrioridade === 'prioritarias') medidas = medidas.filter((m) => m.prioridade);
              if (filtroResposta === 'respondidas') medidas = medidas.filter((m) => m.resposta != null && String(m.resposta).trim() !== '');
              if (filtroResposta === 'nao_respondidas') medidas = medidas.filter((m) => m.resposta == null || String(m.resposta).trim() === '');
              if (filtroStatus !== 'todos') medidas = medidas.filter((m) => m.status_plano_acao === filtroStatus);
              const isLoading = loadingControles.has(controle.id);

              return (
                <Accordion
                  key={controle.id}
                  sx={{ mb: 0.5 }}
                  onChange={(_e, expanded) => {
                    if (expanded && !shouldUseDemoData(programaId)) {
                      handleControleExpand(controle.id, controle.nome, diagnostico.id, diagnostico.nome);
                    }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        className="no-print"
                        indeterminate={medidas.some((m) => selectedMedidas.has(getMedidaKey(m.id, controle.id))) && !medidas.every((m) => selectedMedidas.has(getMedidaKey(m.id, controle.id)))}
                        checked={medidas.length > 0 && medidas.every((m) => selectedMedidas.has(getMedidaKey(m.id, controle.id)))}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleAllMedidasInControle(medidas, controle.id)}
                      />
                      <ControleIcon color="secondary" />
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>{controle.nome}</Typography>
                      <Chip label={`${controle.qtdMedidas} medidas`} size="small" color="secondary" variant="outlined" />
                      {isLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0.5 }}>
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : medidas.length === 0 ? (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {filtroPrioridade === 'prioritarias' ? 'Nenhuma medida prioritária neste controle' : 'Nenhuma medida'}
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, fontSize: '0.8rem', '@media print': { fontSize: '0.7rem' } } }}>
                          <TableHead>
                            <TableRow>
                              <TableCell padding="checkbox" className="no-print">
                                <Checkbox
                                  indeterminate={medidas.some((m) => selectedMedidas.has(getMedidaKey(m.id, controle.id))) && !medidas.every((m) => selectedMedidas.has(getMedidaKey(m.id, controle.id)))}
                                  checked={medidas.length > 0 && medidas.every((m) => selectedMedidas.has(getMedidaKey(m.id, controle.id)))}
                                  onChange={() => toggleAllMedidasInControle(medidas, controle.id)}
                                />
                              </TableCell>
                              <TableCell><strong>Medida</strong></TableCell>
                              <TableCell><strong>Resposta</strong></TableCell>
                              <TableCell><strong>Prioridade</strong></TableCell>
                              <TableCell><strong>Plano de Trabalho</strong></TableCell>
                              <TableCell><strong>Responsável</strong></TableCell>
                              <TableCell><strong>Início</strong></TableCell>
                              <TableCell><strong>Conclusão</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Justificativa</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {medidas.map((medida) => {
                              const statusPlanoInfo = getStatusPlanoAcaoInfo(medida.status_plano_acao);
                              const statusMedidaInfo = getStatusMedidaInfo(medida.status_medida);
                              const respostaNum = typeof medida.resposta === 'string' ? parseInt(medida.resposta, 10) : medida.resposta;
                              return (
                                <TableRow
                                  key={medida.id}
                                  sx={{
                                    backgroundColor: alpha(statusPlanoInfo.color || '#9e9e9e', 0.1),
                                    '&:hover': { backgroundColor: alpha(statusPlanoInfo.color || '#9e9e9e', 0.2) }
                                  }}
                                >
                                  <TableCell padding="checkbox" className="no-print">
                                    <Checkbox
                                      checked={selectedMedidas.has(getMedidaKey(medida.id, controle.id))}
                                      onChange={() => toggleMedidaSelection(medida.id, controle.id)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>{medida.id_medida}</Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{medida.medida}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={getRespostaLabel(respostaNum || 0, diagnostico.id)}
                                      color={getRespostaColor(respostaNum || 0, diagnostico.id) as any}
                                      size="small"
                                      sx={{ fontSize: '0.7rem', height: 24 }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={medida.prioridade ? 'Sim' : 'Não'}
                                      size="small"
                                      color={medida.prioridade ? 'secondary' : 'default'}
                                      variant="outlined"
                                      onClick={() => handleUpdateMedida(medida.id, controle.id, 'prioridade', !medida.prioridade)}
                                      sx={{ fontSize: '0.7rem', height: 24, cursor: 'pointer' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      icon={getStatusIcon(medida.status_plano_acao)}
                                      label={statusPlanoInfo.label}
                                      sx={{
                                        backgroundColor: statusPlanoInfo.color || '#9e9e9e',
                                        color: theme.palette.getContrastText(statusPlanoInfo.color || '#9e9e9e'),
                                        fontWeight: 'bold',
                                        fontSize: '0.7rem',
                                        height: 24
                                      }}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                      {getResponsavelDisplay(medida.responsavel, medida.responsavel_nome)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{formatDate(medida.previsao_inicio)}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{formatDate(medida.previsao_fim)}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                      <Select
                                        value={medida.status_medida ?? ''}
                                        onChange={(e) => handleUpdateMedida(medida.id, controle.id, 'status_medida', Number(e.target.value))}
                                        displayEmpty
                                        sx={{ fontSize: '0.75rem', height: 28 }}
                                      >
                                        {status_medida.map((s) => (
                                          <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.75rem' }}>
                                            {s.label}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 150, fontSize: '0.8rem' }}>
                                      {medida.justificativa || 'Não informado'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </AccordionDetails>
        </Accordion>
      ))}

      {diagnosticos.length === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma medida encontrada para este programa.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PlanoAcaoResumo;
