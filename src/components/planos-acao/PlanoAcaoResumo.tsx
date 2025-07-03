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
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as DiagnosticoIcon,
  Security as ControleIcon
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
  justificativa?: string;
  programa_medida?: any;
}

interface DiagnosticoGroup {
  id: number;
  nome: string;
  controles: ControleGroup[];
}

interface ControleGroup {
  id: number;
  nome: string;
  medidas: MedidaPlanoAcao[];
}

const PlanoAcaoResumo: React.FC<PlanoAcaoResumoProps> = ({
  programaId,
  programaName
}) => {
  const theme = useTheme();
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [totalMedidas, setTotalMedidas] = useState(0);

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
        const diagnosticosDemo = await loadDemoData();
        setDiagnosticos(diagnosticosDemo);
      } else {
        // Carregar dados reais
        const diagnosticosReais = await loadRealData();
        setDiagnosticos(diagnosticosReais);
      }
    } catch (err) {
      console.error('Erro ao carregar plano de ação:', err);
      setError('Erro ao carregar dados do plano de ação');
    } finally {
      setLoading(false);
    }
  };

  const loadRealData = async (): Promise<DiagnosticoGroup[]> => {
    try {
      // 1. Carregar todos os diagnósticos
      const diagnosticosData = await dataService.fetchDiagnosticos();
      console.log('Diagnósticos carregados:', diagnosticosData);

      const diagnosticosResult: DiagnosticoGroup[] = [];
      let totalMedidasCount = 0;

      for (const diagnostico of diagnosticosData) {
        // 2. Carregar controles do diagnóstico
        const controlesData = await dataService.fetchControles(diagnostico.id, programaId);
        console.log(`Controles do diagnóstico ${diagnostico.id}:`, controlesData);

        const controlesResult: ControleGroup[] = [];

        for (const controle of controlesData) {
          // 3. Carregar medidas do controle
          const medidasData = await dataService.fetchMedidas(controle.id, programaId);
          console.log(`Medidas do controle ${controle.id}:`, medidasData);

          const medidasResult: MedidaPlanoAcao[] = [];

          for (const medida of medidasData) {
            // 4. Carregar programa_medida para cada medida
            try {
              const programaMedida = await dataService.fetchProgramaMedida(medida.id, controle.id, programaId);
              console.log(`ProgramaMedida para medida ${medida.id}:`, programaMedida);

              const medidaCompleta: MedidaPlanoAcao = {
                id: medida.id,
                id_medida: medida.id_medida,
                medida: medida.medida,
                controle_id: controle.id,
                controle_nome: controle.controle,
                diagnostico_id: diagnostico.id,
                diagnostico_nome: diagnostico.diagnostico,
                resposta: programaMedida?.resposta,
                responsavel: programaMedida?.responsavel,
                previsao_inicio: programaMedida?.previsao_inicio,
                previsao_fim: programaMedida?.previsao_fim,
                status_medida: programaMedida?.status_medida,
                status_plano_acao: programaMedida?.status_plano_acao,
                justificativa: programaMedida?.justificativa,
                programa_medida: programaMedida
              };

              medidasResult.push(medidaCompleta);
              totalMedidasCount++;
            } catch (error) {
              console.warn(`Erro ao carregar programa_medida para medida ${medida.id}:`, error);
              // Adicionar medida mesmo sem programa_medida
              const medidaCompleta: MedidaPlanoAcao = {
                id: medida.id,
                id_medida: medida.id_medida,
                medida: medida.medida,
                controle_id: controle.id,
                controle_nome: controle.controle,
                diagnostico_id: diagnostico.id,
                diagnostico_nome: diagnostico.diagnostico
              };
              medidasResult.push(medidaCompleta);
              totalMedidasCount++;
            }
          }

          if (medidasResult.length > 0) {
            controlesResult.push({
              id: controle.id,
              nome: controle.controle,
              medidas: medidasResult
            });
          }
        }

        if (controlesResult.length > 0) {
          diagnosticosResult.push({
            id: diagnostico.id,
            nome: diagnostico.diagnostico,
            controles: controlesResult
          });
        }
      }

      setTotalMedidas(totalMedidasCount);
      return diagnosticosResult;
    } catch (error) {
      console.error('Erro ao carregar dados reais:', error);
      throw error;
    }
  };

  const loadDemoData = async (): Promise<DiagnosticoGroup[]> => {
    // Dados demo organizados por diagnóstico e controle
    const demoData: DiagnosticoGroup[] = [
      {
        id: 1,
        nome: 'Diagnóstico de Segurança Básica',
        controles: [
          {
            id: 1,
            nome: 'Controle de Acesso',
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
                justificativa: 'Implementação necessária para melhorar a segurança de acesso'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        nome: 'Diagnóstico de Continuidade',
        controles: [
          {
            id: 2,
            nome: 'Backup e Recuperação',
            medidas: [
              {
                id: 2,
                id_medida: '2.1',
                medida: 'Realizar backup diário dos dados críticos',
                controle_id: 2,
                controle_nome: 'Backup e Recuperação',
                diagnostico_id: 2,
                diagnostico_nome: 'Diagnóstico de Continuidade',
                resposta: 2,
                responsavel: 2,
                responsavel_nome: 'Maria Santos (Operações)',
                previsao_inicio: '2024-02-01',
                previsao_fim: '2024-02-28',
                status_medida: 1,
                status_plano_acao: 2,
                justificativa: 'Backup automatizado implementado com sucesso'
              }
            ]
          }
        ]
      }
    ];

    setTotalMedidas(2);
    return demoData;
  };

  const getAllMedidas = (): MedidaPlanoAcao[] => {
    const allMedidas: MedidaPlanoAcao[] = [];
    diagnosticos.forEach(diagnostico => {
      diagnostico.controles.forEach(controle => {
        allMedidas.push(...controle.medidas);
      });
    });
    return allMedidas;
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

  const allMedidas = getAllMedidas();
  const medidasComResposta = allMedidas.filter(m => m.resposta);
  const medidasConcluidas = allMedidas.filter(m => m.status_plano_acao === 2);
  const medidasEmAndamento = allMedidas.filter(m => m.status_plano_acao === 4);
  const medidasAtrasadas = allMedidas.filter(m => m.status_plano_acao === 5);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Plano de Ação
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {programaName} • Acompanhamento resumido das medidas por diagnóstico e controle
        </Typography>
      </Box>

      {/* Resumo Estatístico */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {totalMedidas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Medidas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              {medidasComResposta.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Com Resposta
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {medidasConcluidas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Concluídas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {medidasEmAndamento.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Em Andamento
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="error.main">
              {medidasAtrasadas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atrasadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Accordions por Diagnóstico */}
      {diagnosticos.map((diagnostico) => (
        <Accordion key={diagnostico.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DiagnosticoIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {diagnostico.nome}
              </Typography>
              <Chip 
                label={`${diagnostico.controles.reduce((total, controle) => total + controle.medidas.length, 0)} medidas`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* Accordions por Controle */}
            {diagnostico.controles.map((controle) => (
              <Accordion key={controle.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ControleIcon color="secondary" />
                    <Typography variant="subtitle1" fontWeight="600">
                      {controle.nome}
                    </Typography>
                    <Chip 
                      label={`${controle.medidas.length} medidas`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Tabela de Medidas do Controle */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Medida</strong></TableCell>
                          <TableCell><strong>Resposta</strong></TableCell>
                          <TableCell><strong>Plano de Ação</strong></TableCell>
                          <TableCell><strong>Responsável</strong></TableCell>
                          <TableCell><strong>Início</strong></TableCell>
                          <TableCell><strong>Conclusão</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Justificativa</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {controle.medidas.map((medida) => {
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
                                </Box>
                              </TableCell>
                              
                              <TableCell>
                                <Chip
                                  label={getRespostaLabel(medida.resposta || 0, diagnostico.id)}
                                  color={getRespostaColor(medida.resposta || 0, diagnostico.id) as any}
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
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      {diagnosticos.length === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
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