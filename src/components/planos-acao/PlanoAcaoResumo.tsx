import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  IconButton,
  Tooltip
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
  Print as PrintIcon,
  PictureAsPdf as PdfIcon
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

  useEffect(() => {
    loadPlanoAcaoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaId]);

  // Otimização: usar useMemo para cálculos pesados
  const { totalMedidas, medidasComResposta, medidasConcluidas, medidasEmAndamento, medidasAtrasadas, allMedidas } = useMemo(() => {
    const allMedidas: MedidaPlanoAcao[] = [];
    diagnosticos.forEach(diagnostico => {
      diagnostico.controles.forEach(controle => {
        allMedidas.push(...controle.medidas);
      });
    });

    return {
      totalMedidas: allMedidas.length,
      medidasComResposta: allMedidas.filter(m => m.resposta),
      medidasConcluidas: allMedidas.filter(m => m.status_plano_acao === 2),
      medidasEmAndamento: allMedidas.filter(m => m.status_plano_acao === 4),
      medidasAtrasadas: allMedidas.filter(m => m.status_plano_acao === 5),
      allMedidas
    };
  }, [diagnosticos]);

  const loadPlanoAcaoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar responsáveis primeiro
      const responsaveisData = await dataService.fetchResponsaveis(programaId);
      setResponsaveis(responsaveisData);

      // Carregar dados otimizado - sem múltiplas chamadas sequenciais
      if (shouldUseDemoData(programaId)) {
        const diagnosticosDemo = await loadDemoData();
        setDiagnosticos(diagnosticosDemo);
      } else {
        const diagnosticosReais = await loadRealDataOptimized();
        setDiagnosticos(diagnosticosReais);
      }
    } catch (err) {
      console.error('Erro ao carregar plano de trabalho:', err);
      setError('Erro ao carregar dados do plano de trabalho');
    } finally {
      setLoading(false);
    }
  };

  // Otimização: uma chamada por diagnóstico (controles) e uma por controle (medidas já com programa_medida)
  const loadRealDataOptimized = async (): Promise<DiagnosticoGroup[]> => {
    try {
      const diagnosticosData = await dataService.fetchDiagnosticos();
      const diagnosticoNome = (d: any) => d.descricao || d.diagnostico || d.nome;
      const controleNome = (c: any) => c.controle || c.nome;

      const diagnosticosPromises = diagnosticosData.map(async (diagnostico: any) => {
        try {
          const controlesData = await dataService.fetchControles(diagnostico.id, programaId);
          const controlesPromises = controlesData.map(async (controle: any) => {
            try {
              // fetchMedidas já retorna medidas com programa_medida mergeado — evita N chamadas fetchProgramaMedida
              const medidasData = await dataService.fetchMedidas(controle.id, programaId);
              const medidasResult: MedidaPlanoAcao[] = medidasData.map((medida: any) => {
                const pm = medida.programa_medida;
                return {
                  id: medida.id,
                  id_medida: medida.id_medida,
                  medida: medida.medida,
                  controle_id: controle.id,
                  controle_nome: controleNome(controle),
                  diagnostico_id: diagnostico.id,
                  diagnostico_nome: diagnosticoNome(diagnostico),
                  resposta: pm?.resposta,
                  responsavel: pm?.responsavel,
                  previsao_inicio: pm?.previsao_inicio,
                  previsao_fim: pm?.previsao_fim,
                  status_medida: pm?.status_medida,
                  status_plano_acao: pm?.status_plano_acao,
                  justificativa: pm?.justificativa,
                  programa_medida: pm
                } as MedidaPlanoAcao;
              });

              if (medidasResult.length > 0) {
                return {
                  id: controle.id,
                  nome: controleNome(controle),
                  medidas: medidasResult
                } as ControleGroup;
              }
              return null;
            } catch (error) {
              console.warn(`Erro ao carregar medidas do controle ${controle.id}:`, error);
              return null;
            }
          });

          const controlesResult = (await Promise.all(controlesPromises)).filter(Boolean) as ControleGroup[];
          if (controlesResult.length > 0) {
            return {
              id: diagnostico.id,
              nome: diagnosticoNome(diagnostico),
              controles: controlesResult
            } as DiagnosticoGroup;
          }
          return null;
        } catch (error) {
          console.warn(`Erro ao carregar controles do diagnóstico ${diagnostico.id}:`, error);
          return null;
        }
      });

      const resultados = await Promise.all(diagnosticosPromises);
      return resultados.filter(Boolean) as DiagnosticoGroup[];
    } catch (error) {
      console.error('Erro ao carregar dados reais:', error);
      throw error;
    }
  };

  const loadDemoData = async (): Promise<DiagnosticoGroup[]> => {
    // Dados demo simples para demonstração
    return [
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
    <Box sx={{ 
      // Estilos printer-friendly
      '@media print': {
        '& .no-print': { display: 'none !important' },
        '& .MuiAccordion-root': { 
          boxShadow: 'none !important',
          border: '1px solid #ddd !important'
        },
        '& .MuiTableContainer-root': {
          boxShadow: 'none !important'
        },
        '& .MuiChip-root': {
          border: '1px solid #ddd !important'
        }
      }
    }}>
      {/* Header */}
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
        
        {/* Botão PDF */}
        <Box className="no-print">
          <Tooltip title="Gerar PDF / Imprimir">
            <IconButton 
              onClick={handleGeneratePDF}
              color="primary"
              size="large"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Resumo Estatístico - Mais compacto */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        gap: 1.5, 
        flexWrap: 'wrap',
        '@media print': { mb: 1 }
      }}>
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem' }}>
              {totalMedidas}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Total de Medidas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="info.main" sx={{ fontSize: '1.1rem' }}>
              {medidasComResposta.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Com Resposta
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="success.main" sx={{ fontSize: '1.1rem' }}>
              {medidasConcluidas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Concluídas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="warning.main" sx={{ fontSize: '1.1rem' }}>
              {medidasEmAndamento.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Em Andamento
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: 160, flex: 1 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="error.main" sx={{ fontSize: '1.1rem' }}>
              {medidasAtrasadas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Atrasadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Accordions por Diagnóstico - Mais compactos */}
      {diagnosticos.map((diagnostico) => (
        <Accordion key={diagnostico.id} sx={{ mb: 1.5 }}>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ py: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DiagnosticoIcon color="primary" />
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
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
          <AccordionDetails sx={{ p: 1 }}>
            {/* Accordions por Controle - Mais compactos */}
            {diagnostico.controles.map((controle) => (
              <Accordion key={controle.id} sx={{ mb: 0.5 }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ py: 0.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ControleIcon color="secondary" />
                    <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
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
                <AccordionDetails sx={{ p: 0.5 }}>
                  {/* Tabela de Medidas do Controle - Mais compacta */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small" sx={{ 
                      '& .MuiTableCell-root': { 
                        py: 0.5, 
                        fontSize: '0.8rem',
                        '@media print': { fontSize: '0.7rem' }
                      }
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Medida</strong></TableCell>
                          <TableCell><strong>Resposta</strong></TableCell>
                          <TableCell><strong>Plano de Trabalho</strong></TableCell>
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
                                  <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                                    {medida.id_medida}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {medida.medida}
                                  </Typography>
                                </Box>
                              </TableCell>
                              
                              <TableCell>
                                <Chip
                                  label={getRespostaLabel(medida.resposta || 0, diagnostico.id)}
                                  color={getRespostaColor(medida.resposta || 0, diagnostico.id) as any}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 24 }}
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
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {formatDate(medida.previsao_inicio)}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {formatDate(medida.previsao_fim)}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Chip
                                  label={statusMedidaInfo.label}
                                  sx={{
                                    backgroundColor: statusMedidaInfo.color || '#9e9e9e',
                                    color: theme.palette.getContrastText(statusMedidaInfo.color || '#9e9e9e'),
                                    fontSize: '0.7rem',
                                    height: 24
                                  }}
                                  size="small"
                                />
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
                </AccordionDetails>
              </Accordion>
            ))}
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