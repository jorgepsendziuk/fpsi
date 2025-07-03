import React, { useState, useEffect } from 'react';
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
  alpha
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
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
  controle_nome: string;
  diagnostico_nome: string;
  resposta: number;
  responsavel: number;
  responsavel_nome?: string;
  previsao_inicio: string;
  previsao_fim: string;
  status_medida: number;
  status_plano_acao: number;
  justificativa: string;
}

const PlanoAcaoResumo: React.FC<PlanoAcaoResumoProps> = ({
  programaId,
  programaName
}) => {
  const theme = useTheme();
  const [medidas, setMedidas] = useState<MedidaPlanoAcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);

  useEffect(() => {
    loadPlanoAcaoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaId]);

  const loadPlanoAcaoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar responsáveis
      const responsaveisData = await dataService.fetchResponsaveis(programaId);
      setResponsaveis(responsaveisData);

      // Se for modo demo, usar dados sintéticos
      if (shouldUseDemoData(programaId)) {
        const medidasDemoData = await loadDemoMedidas();
        setMedidas(medidasDemoData);
      } else {
        // Carregar medidas reais
        const medidasData = await loadMedidasReais();
        setMedidas(medidasData);
      }
    } catch (err) {
      console.error('Erro ao carregar plano de ação:', err);
      setError('Erro ao carregar dados do plano de ação');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoMedidas = async (): Promise<MedidaPlanoAcao[]> => {
    // Simular dados para o modo demo
    return [
      {
        id: 1,
        id_medida: 'M001',
        medida: 'Implementar política de senhas seguras',
        controle_nome: 'Controle de Acesso',
        diagnostico_nome: 'Diagnóstico de Segurança Básica',
        resposta: 4,
        responsavel: 1,
        responsavel_nome: 'João Silva (TI)',
        previsao_inicio: '2024-01-15',
        previsao_fim: '2024-03-15',
        status_medida: 2,
        status_plano_acao: 4,
        justificativa: 'Implementação necessária para melhorar a segurança de acesso'
      },
      {
        id: 2,
        id_medida: 'M002',
        medida: 'Realizar backup diário dos dados críticos',
        controle_nome: 'Backup e Recuperação',
        diagnostico_nome: 'Diagnóstico de Continuidade',
        resposta: 2,
        responsavel: 2,
        responsavel_nome: 'Maria Santos (Operações)',
        previsao_inicio: '2024-02-01',
        previsao_fim: '2024-02-28',
        status_medida: 1,
        status_plano_acao: 2,
        justificativa: 'Backup automatizado implementado com sucesso'
      },
      {
        id: 3,
        id_medida: 'M003',
        medida: 'Treinar usuários em segurança da informação',
        controle_nome: 'Conscientização',
        diagnostico_nome: 'Diagnóstico de Recursos Humanos',
        resposta: 5,
        responsavel: 3,
        responsavel_nome: 'Pedro Costa (RH)',
        previsao_inicio: '2024-03-01',
        previsao_fim: '2024-06-30',
        status_medida: 3,
        status_plano_acao: 5,
        justificativa: 'Treinamento em andamento, com previsão de conclusão no prazo'
      }
    ];
  };

  const loadMedidasReais = async (): Promise<MedidaPlanoAcao[]> => {
    // Implementar carregamento de dados reais
    // Por enquanto, retornar array vazio
    return [];
  };

  const getRespostaLabel = (resposta: number, diagnosticoId: number = 2) => {
    const respostasArray = diagnosticoId === 1 ? respostasimnao : respostas;
    const respostaObj = respostasArray.find(r => r.id === resposta);
    return respostaObj?.label || 'Não definido';
  };

  const getRespostaColor = (resposta: number, diagnosticoId: number = 2) => {
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

  const getStatusMedidaInfo = (statusId: number) => {
    const status = status_medida.find(s => s.id === statusId);
    return status ? { label: status.label, color: (status as any).color || '#9e9e9e' } : { label: 'Não definido', color: '#9e9e9e' };
  };

  const getStatusPlanoAcaoInfo = (statusId: number) => {
    const status = status_plano_acao.find(s => s.id === statusId);
    return status ? { label: status.label, color: (status as any).color || '#9e9e9e' } : { label: 'Não definido', color: '#9e9e9e' };
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 1: return <WarningIcon fontSize="small" />;
      case 2: return <CheckCircleIcon fontSize="small" />;
      case 3: return <ScheduleIcon fontSize="small" />;
      case 4: return <PlayArrowIcon fontSize="small" />;
      case 5: return <WarningIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getResponsavelDisplay = (responsavelId: number, responsavelNome?: string) => {
    if (responsavelNome) return responsavelNome;
    
    const responsavel = responsaveis.find(r => r.id === responsavelId);
    if (responsavel) {
      return `${responsavel.nome} (${responsavel.departamento || 'Sem setor'})`;
    }
    return 'Não definido';
  };

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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Plano de Ação
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {programaName} • Acompanhamento resumido das medidas
        </Typography>
      </Box>

      {/* Resumo Estatístico */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {medidas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Medidas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {medidas.filter(m => m.status_plano_acao === 2).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Concluídas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {medidas.filter(m => m.status_plano_acao === 4).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Em Andamento
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="error.main">
              {medidas.filter(m => m.status_plano_acao === 5).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atrasadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabela de Medidas */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Acompanhamento das Medidas
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Medida</strong></TableCell>
                  <TableCell><strong>Resposta</strong></TableCell>
                  <TableCell><strong>Plano de Ação</strong></TableCell>
                  <TableCell><strong>Responsável</strong></TableCell>
                  <TableCell><strong>Data Início</strong></TableCell>
                  <TableCell><strong>Data Conclusão</strong></TableCell>
                  <TableCell><strong>Status da Medida</strong></TableCell>
                  <TableCell><strong>Justificativa</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medidas.map((medida) => {
                  const statusPlanoInfo = getStatusPlanoAcaoInfo(medida.status_plano_acao);
                  const statusMedidaInfo = getStatusMedidaInfo(medida.status_medida);
                  
                  return (
                    <TableRow 
                      key={medida.id}
                      sx={{
                        backgroundColor: alpha(statusPlanoInfo.color || '#9e9e9e', 0.1),
                        '&:hover': {
                          backgroundColor: alpha(statusPlanoInfo.color || '#9e9e9e', 0.2),
                        }
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {medida.id_medida}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {medida.medida}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {medida.controle_nome}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={getRespostaLabel(medida.resposta)}
                          color={getRespostaColor(medida.resposta) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(medida.status_plano_acao)}
                          label={statusPlanoInfo.label}
                                                     sx={{
                             backgroundColor: statusPlanoInfo.color || '#9e9e9e',
                             color: theme.palette.getContrastText(statusPlanoInfo.color || '#9e9e9e'),
                             fontWeight: 'bold'
                           }}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {getResponsavelDisplay(medida.responsavel, medida.responsavel_nome)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(medida.previsao_inicio)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(medida.previsao_fim)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                                                 <Chip
                           label={statusMedidaInfo.label}
                           sx={{
                             backgroundColor: statusMedidaInfo.color || '#9e9e9e',
                             color: theme.palette.getContrastText(statusMedidaInfo.color || '#9e9e9e')
                           }}
                           size="small"
                         />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {medida.justificativa || 'Não informado'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {medidas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma medida encontrada para este programa.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlanoAcaoResumo;