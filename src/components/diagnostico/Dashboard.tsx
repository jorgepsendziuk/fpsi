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
  getControleMaturity: (controle: any, medidas: any[], programaControle: any, programaMedidas?: { [key: string]: any }) => any;
  getDiagnosticoMaturity: (diagnosticoId: number) => any;
  programaId: number;
  onDiagnosticoClick?: (diagnosticoId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  diagnosticos,
  controles,
  medidas,
  programaMedidas,
  getControleMaturity,
  getDiagnosticoMaturity,
  programaId,
  onDiagnosticoClick
}) => {
  const theme = useTheme();

  // Calcular estatísticas consolidadas
  const stats = useMemo(() => {
    const totalDiagnosticos = diagnosticos.length;
    let totalControles = 0;
    let totalMedidas = 0;
    let medidasRespondidas = 0;
    let medidasImplementadas = 0; // Nova métrica: medidas com peso > 0
    let somaMaturityDiagnosticos = 0;

    diagnosticos.forEach(diagnostico => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      totalControles += diagnosticoControles.length;
      
      // Calcular maturidade do diagnóstico
      const maturityData = getDiagnosticoMaturity(diagnostico.id);
      somaMaturityDiagnosticos += maturityData.score;

      diagnosticoControles.forEach(controle => {
        const controleMedidas = medidas[controle.id] || [];
        
        controleMedidas.forEach(medida => {
          const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
          const respostaId = programaMedida?.resposta;
          
          // Para diagnóstico 1, não existe "Não se aplica" - só ignorar se for diagnóstico 2 ou 3
          if (diagnostico.id !== 1 && respostaId === 6) return; // Ignorar "Não se aplica" apenas para diagnósticos 2 e 3
          
          totalMedidas++; // Contar todas as medidas aplicáveis
          
          if (respostaId !== undefined && respostaId !== null) {
            medidasRespondidas++; // Contar respondidas
            
            // Buscar o peso correto da resposta
            let peso = 0;
            if (diagnostico.id === 1) {
              // Diagnóstico 1: Sim/Não (IDs 1 e 2)
              peso = respostaId === 1 ? 1 : (respostaId === 2 ? 0 : 0); // Sim = 1, Não = 0
            } else {
              // Diagnósticos 2 e 3: Escala
              const pesos = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.25, 5: 0 };
              peso = pesos[respostaId as keyof typeof pesos] || 0;
            }
            
            // Considerar "implementada" apenas se peso > 0
            if (peso > 0) {
              medidasImplementadas++;
            }
          }
        });
      });
    });

    const avgMaturityDiagnosticos = totalDiagnosticos > 0 ? somaMaturityDiagnosticos / totalDiagnosticos : 0;

    return {
      totalDiagnosticos,
      totalControles,
      totalMedidas,
      medidasRespondidas,
      medidasImplementadas,
      avgMaturityDiagnosticos
    };
  }, [diagnosticos, controles, medidas, programaMedidas, getDiagnosticoMaturity, programaId]);

  // Função para determinar cor baseada no score de maturidade
  const getMaturityColor = (score: number) => {
    if (score < 0.3) return '#FF5252'; // Vermelho
    if (score < 0.5) return '#FF9800'; // Laranja
    if (score < 0.7) return '#FFC107'; // Amarelo
    if (score < 0.9) return '#4CAF50'; // Verde
    return '#2E7D32'; // Verde escuro
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        
        {/* Estatísticas Gerais */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Visão Geral dos Diagnósticos"
              avatar={<DashboardIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: alpha('#2196F3', 0.05), height: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3' }} gutterBottom>
                      Total de Medidas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
                      {stats.totalMedidas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      medidas aplicáveis
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: alpha('#4CAF50', 0.05), height: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50' }} gutterBottom>
                      Medidas Respondidas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                      {stats.medidasRespondidas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.totalMedidas > 0 ? ((stats.medidasRespondidas / stats.totalMedidas) * 100).toFixed(1) : 0}% do total
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: alpha('#FF9800', 0.05), height: '100%' }}>
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

        {/* Cards dos Diagnósticos em 3 Colunas */}
        {diagnosticos.map(diagnostico => {
          const diagnosticoControles = controles[diagnostico.id] || [];
          let totalMedidasDiag = 0;
          let medidasRespondidasDiag = 0;

          diagnosticoControles.forEach(controle => {
            const controleMedidas = medidas[controle.id] || [];
            
            controleMedidas.forEach(medida => {
              const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
              const respostaId = programaMedida?.resposta;
              
              // Para diagnóstico 1, não existe "Não se aplica" - só ignorar se for diagnóstico 2 ou 3
              if (respostaId === 6 && diagnostico.id !== 1) {
                return; // Ignorar "Não se aplica" apenas para diagnósticos 2 e 3
              }
              
              totalMedidasDiag++;
              
              if (respostaId !== null && respostaId !== undefined) {
                medidasRespondidasDiag++;
              }
            });
          });

          const maturityData = getDiagnosticoMaturity(diagnostico.id);

          return (
            <Grid item xs={12} md={4} key={diagnostico.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => {
                  if (onDiagnosticoClick) {
                    onDiagnosticoClick(diagnostico.id);
                  }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header simplificado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                        {diagnostico.descricao}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Chip de Maturidade Centralizado */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <MaturityChip
                      score={maturityData.score}
                      label={maturityData.label}
                      size="medium"
                      showLabel={true}
                      animated={true}
                      calculationData={maturityData.calculationData}
                      controleId={undefined}
                      controleNome={`Diagnóstico ${diagnostico.id}`}
                    />
                  </Box>

                  {/* Informação de Respostas */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {medidasRespondidasDiag} de {totalMedidasDiag} medidas respondidas
                    </Typography>
                  </Box>

                  {/* Estatísticas */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-around',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 2
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>
                        {diagnosticoControles.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Controles
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {totalMedidasDiag}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Medidas
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: getMaturityColor(maturityData.score) }}>
                        {medidasRespondidasDiag}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Respondidas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

      </Grid>
    </Box>
  );
};

export default Dashboard;