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
  Divider,
  Paper,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Policy as PolicyIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
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
      {/* Header da Dashboard */}
      <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
        <CardHeader
          avatar={<DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
          title={
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Dashboard de Diagnósticos
            </Typography>
          }
          subheader={
            <Typography variant="h6" color="text.secondary">
              Visão geral consolidada do programa de conformidade
            </Typography>
          }
        />
      </Card>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas Principais */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha('#2196F3', 0.1)} 0%, ${alpha('#2196F3', 0.05)} 100%)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
                    {stats.totalDiagnosticos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Diagnósticos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.1)} 0%, ${alpha('#4CAF50', 0.05)} 100%)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    {stats.totalControles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Controles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha('#FF9800', 0.1)} 0%, ${alpha('#FF9800', 0.05)} 100%)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PolicyIcon sx={{ fontSize: 40, color: '#FF9800' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    {stats.totalMedidas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medidas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.1)} 0%, ${alpha('#9C27B0', 0.05)} 100%)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BarChartIcon sx={{ fontSize: 40, color: '#9C27B0' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                    {stats.percentualRespostas.toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completude
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Progresso */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Progresso de Implementação"
              subheader="Status de resposta das medidas por diagnóstico"
              avatar={<TrendingUpIcon color="primary" />}
            />
            <CardContent>
              <Stack spacing={3}>
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
                    <Box key={diagnostico.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {diagnostico.descricao}
                          </Typography>
                          <MaturityChip
                            score={maturityData.score}
                            label={maturityData.label}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(percentualDiag)}
                          <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'right' }}>
                            {percentualDiag.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentualDiag} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(getMaturityColor(maturityData.score), 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getMaturityColor(maturityData.score),
                            borderRadius: 4,
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {medidasRespondidasDiag} de {totalMedidasDiag} medidas implementadas
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição de Maturidade */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Distribuição de Maturidade"
              subheader="Níveis de maturidade dos diagnósticos"
              avatar={<AssessmentIcon color="primary" />}
            />
            <CardContent>
              <Stack spacing={2}>
                {Object.entries(stats.maturityLevels).map(([level, data]) => (
                  <Box key={level} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: data.color,
                        }}
                      />
                      <Typography variant="body2">{data.label}</Typography>
                    </Box>
                    <Chip 
                      label={data.count} 
                      size="small" 
                      sx={{ 
                        backgroundColor: alpha(data.color, 0.1),
                        color: data.color,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                ))}
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Métricas de Maturidade Média */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Maturidade Média Geral
                </Typography>
                <MaturityChip
                  score={stats.avgMaturityDiagnosticos}
                  label={stats.avgMaturityDiagnosticos >= 0.9 ? 'Aprimorado' : 
                         stats.avgMaturityDiagnosticos >= 0.7 ? 'Em Aprimoramento' :
                         stats.avgMaturityDiagnosticos >= 0.5 ? 'Intermediário' :
                         stats.avgMaturityDiagnosticos >= 0.3 ? 'Básico' : 'Inicial'}
                  size="medium"
                  showLabel={true}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumo Executivo */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Resumo Executivo"
              subheader="Indicadores chave de performance do programa"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
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
                
                <Grid item xs={12} sm={6} md={3}>
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
                
                <Grid item xs={12} sm={6} md={3}>
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
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha('#9C27B0', 0.05) }}>
                    <Typography variant="h6" sx={{ color: '#9C27B0' }} gutterBottom>
                      Controles Ativos
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                      {stats.totalControles}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      em implementação
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 