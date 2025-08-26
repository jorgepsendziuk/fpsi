'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import {
  PlanoAcao,
  Marco,
  Atividade,
  RiscoPlano,
  StatusPlanoAcao,
  PrioridadePlano,
  DashboardPlanos,
  getStatusDisplayName,
  getPrioridadeDisplayName,
  getStatusColor,
  getPrioridadeColor,
  formatarMoeda,
  formatarData,
  verificarAtraso,
  diasParaVencimento
} from '../../lib/types/planoAcao';
import { useUserPermissions } from '../../hooks/useUserPermissions';

interface DashboardPlanosAcaoProps {
  programaId: number;
  programaName: string;
}

export const DashboardPlanosAcao: React.FC<DashboardPlanosAcaoProps> = ({
  programaId,
  programaName
}) => {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardPlanos | null>(null);
  const [planos, setPlanos] = useState<PlanoAcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { canViewResource, canEditResource, hasPermission } = useUserPermissions(programaId);

  useEffect(() => {
    if (canViewResource('planos')) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaId, canViewResource]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, planosResponse] = await Promise.all([
        fetch(`/api/programas/${programaId}/planos-acao/dashboard`),
        fetch(`/api/programas/${programaId}/planos-acao`)
      ]);

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboard(dashboardData);
      }

      if (planosResponse.ok) {
        const planosData = await planosResponse.json();
        setPlanos(planosData);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard de planos:', err);
      setError('Erro ao carregar dados do plano de trabalho');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: StatusPlanoAcao) => {
    switch (status) {
      case StatusPlanoAcao.CONCLUIDO:
        return <CheckCircleIcon color="success" />;
      case StatusPlanoAcao.EM_ANDAMENTO:
        return <PlayArrowIcon color="primary" />;
      case StatusPlanoAcao.PAUSADO:
        return <PauseIcon color="secondary" />;
      case StatusPlanoAcao.ATRASADO:
        return <ErrorIcon color="error" />;
      case StatusPlanoAcao.AGUARDANDO_APROVACAO:
        return <ScheduleIcon color="warning" />;
      default:
        return <AssignmentIcon color="action" />;
    }
  };

  const getPrioridadeIcon = (prioridade: PrioridadePlano) => {
    const color = getPrioridadeColor(prioridade);
    return <FlagIcon color={color === 'default' ? 'action' : color} />;
  };

  if (!canViewResource('planos')) {
    return (
      <Alert severity="warning">
        Você não tem permissão para visualizar o plano de trabalho deste programa.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Carregando dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
                {programaName}
              </Typography>
            </Box>
            {hasPermission('can_edit_planos') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
              >
                Novo Plano
              </Button>
            )}
          </Box>
        </Grid>

        {/* Cards de Resumo */}
        {dashboard && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboard.total_planos}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total de Planos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboard.progresso_medio}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Progresso Médio
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboard.planos_atrasados}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Planos Atrasados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {formatarMoeda(dashboard.orcamento_utilizado)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Orçamento Utilizado
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Gráficos de Status e Prioridade */}
        {dashboard && (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Planos por Status
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(dashboard.planos_por_status).map(([status, count]) => (
                      <Box key={status} display="flex" alignItems="center" gap={2}>
                        {getStatusIcon(status as StatusPlanoAcao)}
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {getStatusDisplayName(status as StatusPlanoAcao)}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {count}
                            </Typography>
                          </Box>
                                                                                <LinearProgress
                             variant="determinate"
                             value={(count / dashboard.total_planos) * 100}
                             color={getStatusColor(status as StatusPlanoAcao) === 'default' ? 'primary' : getStatusColor(status as StatusPlanoAcao) as any}
                             sx={{ mt: 0.5 }}
                           />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Planos por Prioridade
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(dashboard.planos_por_prioridade).map(([prioridade, count]) => (
                      <Box key={prioridade} display="flex" alignItems="center" gap={2}>
                        {getPrioridadeIcon(prioridade as PrioridadePlano)}
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {getPrioridadeDisplayName(prioridade as PrioridadePlano)}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {count}
                            </Typography>
                          </Box>
                                                     <LinearProgress
                             variant="determinate"
                             value={(count / dashboard.total_planos) * 100}
                             color={getPrioridadeColor(prioridade as PrioridadePlano) === 'default' ? 'primary' : getPrioridadeColor(prioridade as PrioridadePlano) as any}
                             sx={{ mt: 0.5 }}
                           />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Marcos Próximos */}
        {dashboard && dashboard.marcos_proximos.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Marcos Próximos
                </Typography>
                <List dense>
                  {dashboard.marcos_proximos.map((marco) => (
                    <ListItem key={marco.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <ScheduleIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={marco.titulo}
                        secondary={`Previsto para ${formatarData(marco.data_prevista)}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={`${marco.percentual_conclusao}%`}
                          color={marco.percentual_conclusao === 100 ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Riscos Altos */}
        {dashboard && dashboard.riscos_altos.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Riscos de Alta Prioridade
                </Typography>
                <List dense>
                  {dashboard.riscos_altos.map((risco) => (
                    <ListItem key={risco.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={risco.titulo}
                        secondary={risco.descricao}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={risco.nivel_risco.toUpperCase()}
                          color="error"
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Lista de Planos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Lista do Plano de Trabalho
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button startIcon={<TimelineIcon />} size="small">
                    Visualização Gantt
                  </Button>
                  <Button startIcon={<AssessmentIcon />} size="small">
                    Relatórios
                  </Button>
                </Stack>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plano</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Prioridade</TableCell>
                      <TableCell>Progresso</TableCell>
                      <TableCell>Responsável</TableCell>
                      <TableCell>Prazo</TableCell>
                      <TableCell>Orçamento</TableCell>
                      <TableCell width="120">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {planos.map((plano) => {
                      const atrasado = verificarAtraso(plano);
                      const diasRestantes = diasParaVencimento(plano.data_fim_prevista);

                      return (
                        <TableRow key={plano.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {plano.titulo}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {plano.objetivo}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={getStatusIcon(plano.status)}
                              label={getStatusDisplayName(plano.status)}
                              color={getStatusColor(plano.status)}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={getPrioridadeIcon(plano.prioridade)}
                              label={getPrioridadeDisplayName(plano.prioridade)}
                              color={getPrioridadeColor(plano.prioridade)}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            <Box width="100px">
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="caption">
                                  {plano.progresso_percentual}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={plano.progresso_percentual}
                                color={plano.progresso_percentual === 100 ? 'success' : 'primary'}
                              />
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {plano.responsavel_principal}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography 
                                variant="body2" 
                                color={atrasado ? 'error' : 'text.primary'}
                              >
                                {formatarData(plano.data_fim_prevista)}
                              </Typography>
                              {diasRestantes <= 7 && diasRestantes > 0 && (
                                <Typography variant="caption" color="warning.main">
                                  {diasRestantes} dias restantes
                                </Typography>
                              )}
                              {atrasado && (
                                <Typography variant="caption" color="error">
                                  Atrasado
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box>
                              {plano.orcamento_previsto && (
                                <Typography variant="body2">
                                  {formatarMoeda(plano.orcamento_utilizado || 0)} /
                                  {formatarMoeda(plano.orcamento_previsto)}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Visualizar">
                                <IconButton size="small">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              {canEditResource('planos') && (
                                <Tooltip title="Editar">
                                  <IconButton size="small">
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};