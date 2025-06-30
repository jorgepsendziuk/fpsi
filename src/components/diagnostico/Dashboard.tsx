import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import MaturityChip from './MaturityChip';

interface DashboardProps {
  diagnosticos: any[];
  controles: { [key: number]: any[] };
  medidas: { [key: number]: any[] };
  programaMedidas: { [key: string]: any };
  getControleMaturity: (controle: any, medidas: any[], programaControle: any) => any;
  getDiagnosticoMaturity: (diagnosticoId: number) => any;
  programaId: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  diagnosticos,
  controles,
  medidas,
  programaMedidas,
  getControleMaturity,
  getDiagnosticoMaturity,
  programaId
}) => {
  const theme = useTheme();

  // Calcular estatísticas consolidadas
  const stats = useMemo(() => {
    const totalDiagnosticos = diagnosticos.length;
    let totalControles = 0;
    let totalMedidas = 0;
    let medidasRespondidas = 0;
    let somaMaturityDiagnosticos = 0;
    let somaMaturityControles = 0;
    let controlesComDados = 0;

    // Estatísticas por nível de maturidade
    const maturityLevels = {
      inicial: { count: 0, color: '#FF5252', label: 'Inicial' },
      basico: { count: 0, color: '#FF9800', label: 'Básico' },
      intermediario: { count: 0, color: '#FFC107', label: 'Intermediário' },
      aprimoramento: { count: 0, color: '#4CAF50', label: 'Em Aprimoramento' },
      aprimorado: { count: 0, color: '#2E7D32', label: 'Aprimorado' }
    };

    diagnosticos.forEach(diagnostico => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      totalControles += diagnosticoControles.length;

      // Calcular maturidade do diagnóstico
      const diagnosticoMaturity = getDiagnosticoMaturity(diagnostico.id);
      somaMaturityDiagnosticos += diagnosticoMaturity.score;

      // Classificar por nível de maturidade
      if (diagnosticoMaturity.score < 0.3) {
        maturityLevels.inicial.count++;
      } else if (diagnosticoMaturity.score < 0.5) {
        maturityLevels.basico.count++;
      } else if (diagnosticoMaturity.score < 0.7) {
        maturityLevels.intermediario.count++;
      } else if (diagnosticoMaturity.score < 0.9) {
        maturityLevels.aprimoramento.count++;
      } else {
        maturityLevels.aprimorado.count++;
      }

      diagnosticoControles.forEach(controle => {
        const controleMedidas = medidas[controle.id] || [];
        totalMedidas += controleMedidas.length;

        if (controleMedidas.length > 0) {
          controlesComDados++;
          
          // Contar medidas respondidas
          controleMedidas.forEach(medida => {
            const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
            if (programaMedida?.resposta !== undefined && programaMedida?.resposta !== null) {
              medidasRespondidas++;
            }
          });

          // Calcular maturidade do controle
          const programaControle = {
            id: controle.programa_controle_id || 0,
            programa: programaId,
            controle: controle.id,
            nivel: controle.nivel || 1
          };
          
          const controleMaturity = getControleMaturity(controle, controleMedidas, programaControle);
          somaMaturityControles += controleMaturity.score;
        }
      });
    });

    const avgMaturityDiagnosticos = totalDiagnosticos > 0 ? somaMaturityDiagnosticos / totalDiagnosticos : 0;
    const avgMaturityControles = controlesComDados > 0 ? somaMaturityControles / controlesComDados : 0;
    const percentualRespostas = totalMedidas > 0 ? (medidasRespondidas / totalMedidas) * 100 : 0;

    return {
      totalDiagnosticos,
      totalControles,
      totalMedidas,
      medidasRespondidas,
      percentualRespostas,
      avgMaturityDiagnosticos,
      avgMaturityControles,
      maturityLevels
    };
  }, [diagnosticos, controles, medidas, programaMedidas, getDiagnosticoMaturity, getControleMaturity, programaId]);

  // Função para determinar cor baseada no score de maturidade
  const getMaturityColor = (score: number) => {
    if (score < 0.3) return '#FF5252'; // Vermelho
    if (score < 0.5) return '#FF9800'; // Laranja
    if (score < 0.7) return '#FFC107'; // Amarelo
    if (score < 0.9) return '#4CAF50'; // Verde
    return '#2E7D32'; // Verde escuro
  };

  // Função para determinar ícone de status baseado no percentual
  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
    if (percentage >= 60) return <InfoIcon sx={{ color: '#2196F3' }} />;
    if (percentage >= 40) return <WarningIcon sx={{ color: '#FF9800' }} />;
    return <ErrorIcon sx={{ color: '#FF5252' }} />;
  };

  return (
    <Box sx={{ p: 0 }}>
      

      <Grid container spacing={3}>
        {/* Resumo Executivo */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Resumo Executivo"
              subheader="Indicadores chave de performance do programa"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha('#2196F3', 0.05) }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Cobertura de Avaliação
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
                      {stats.percentualRespostas.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      das medidas avaliadas
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha('#4CAF50', 0.05) }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Maturidade Média
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                      {(stats.avgMaturityDiagnosticos * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      nível de conformidade
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha('#FF9800', 0.05) }}>
                    <Typography variant="h6" sx={{ color: '#FF9800' }} gutterBottom>
                      Medidas Pendentes
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                      {stats.totalMedidas - stats.medidasRespondidas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      aguardando avaliação
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Progresso Melhorado */}
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Progresso de Implementação"
              subheader="Status de resposta das medidas por diagnóstico com nível de maturidade"
              avatar={<TrendingUpIcon color="primary" />}
            />
            <CardContent>
              <Stack spacing={4}>
                {diagnosticos.map(diagnostico => {
                  const diagnosticoControles = controles[diagnostico.id] || [];
                  let totalMedidasDiag = 0;
                  let medidasRespondidasDiag = 0;

                  diagnosticoControles.forEach(controle => {
                    const controleMedidas = medidas[controle.id] || [];
                    totalMedidasDiag += controleMedidas.length;
                    
                    controleMedidas.forEach(medida => {
                      const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
                      if (programaMedida?.resposta !== undefined && programaMedida?.resposta !== null) {
                        medidasRespondidasDiag++;
                      }
                    });
                  });

                  const percentualDiag = totalMedidasDiag > 0 ? (medidasRespondidasDiag / totalMedidasDiag) * 100 : 0;
                  const maturityData = getDiagnosticoMaturity(diagnostico.id);

                  return (
                    <Paper key={diagnostico.id} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                      {/* Header com título e nível de maturidade destacado */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: getMaturityColor(maturityData.score),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1rem'
                            }}
                          >
                            {diagnostico.id}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {diagnostico.descricao}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Diagnóstico {diagnostico.id}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <MaturityChip
                            score={maturityData.score}
                            label={maturityData.label}
                            size="medium"
                            showLabel={true}
                            animated={true}
                          />
                        </Box>
                      </Box>

                      {/* Barra de progresso com informações melhoradas */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {medidasRespondidasDiag} de {totalMedidasDiag} medidas implementadas
                            </Typography>
                            <Chip 
                              label={`${percentualDiag.toFixed(1)}%`}
                              size="small"
                              sx={{ 
                                backgroundColor: getMaturityColor(maturityData.score),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(percentualDiag)}
                            <Typography variant="body2" color="text.secondary">
                              Status: {percentualDiag >= 80 ? 'Excelente' : 
                                      percentualDiag >= 60 ? 'Bom' : 
                                      percentualDiag >= 40 ? 'Regular' : 'Crítico'}
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentualDiag} 
                          sx={{ 
                            height: 12, 
                            borderRadius: 6,
                            backgroundColor: alpha(getMaturityColor(maturityData.score), 0.15),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getMaturityColor(maturityData.score),
                              borderRadius: 6,
                            }
                          }}
                        />
                      </Box>

                      {/* Estatísticas adicionais */}
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>
                              {diagnosticoControles.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Controles
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: getMaturityColor(maturityData.score) }}>
                              {(maturityData.score * 100).toFixed(0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Maturidade
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9800' }}>
                              {totalMedidasDiag - medidasRespondidasDiag}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pendentes
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>


      </Grid>
    </Box>
  );
};

export default Dashboard; 