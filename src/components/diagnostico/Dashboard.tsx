import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Stack,
  Paper,
  Chip,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import MaturityChip from './MaturityChip';
import { type GrupoImpleFilter } from '../../lib/utils/grupoImplementacao';
import { formatMaturityIndex, getMaturityColorHex } from '../../lib/utils/maturity';

interface DashboardProps {
  diagnosticos: any[];
  controles: { [key: number]: any[] };
  medidas: { [key: number]: any[] };
  programaMedidas: { [key: string]: any };
  getControleMaturity: (controle: any, medidas: any[], programaControle: any, programaMedidas?: { [key: string]: any }) => any;
  getDiagnosticoMaturity: (diagnosticoId: number) => any;
  programaId: number;
  grupoImpleFilter?: GrupoImpleFilter;
  onDiagnosticoClick?: (diagnosticoId: number) => void;
  dataLoading?: boolean;
}

const INDICE_DIAG: Record<number, string> = {
  1: 'iMC₀',
  2: 'iSeg',
  3: 'iPriv',
  4: 'iAIGP',
};

/** Diagnósticos com escala 1–6 (incl. “Não se aplica” = 6). */
function usesEscalaRespostas(diagnosticoId: number): boolean {
  return diagnosticoId !== 1;
}

function diagnosticoIcon(id: number, color: string) {
  const sx = { color, fontSize: 28 };
  switch (id) {
    case 1:
      return <AccountBalanceIcon sx={sx} />;
    case 2:
      return <LockIcon sx={sx} />;
    case 3:
      return <PersonIcon sx={sx} />;
    case 4:
      return <PsychologyIcon sx={sx} />;
    default:
      return <AssessmentIcon sx={sx} />;
  }
}

function countMedidasForDiagnostico(
  diagnosticoId: number,
  diagnosticoControles: any[],
  medidas: { [key: number]: any[] },
  programaMedidas: { [key: string]: any },
  programaId: number,
) {
  let total = 0;
  let respondidas = 0;

  diagnosticoControles.forEach((controle) => {
    const controleMedidas = medidas[controle.id] || [];
    controleMedidas.forEach((medida: any) => {
      const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
      const respostaId = programaMedida?.resposta;

      if (usesEscalaRespostas(diagnosticoId) && respostaId === 6) return;

      total++;
      if (respostaId !== undefined && respostaId !== null) {
        respondidas++;
      }
    });
  });

  return { total, respondidas };
}

function DiagnosticoStatCell({
  value,
  label,
  color,
  loaded,
}: {
  value: number | string;
  label: string;
  color: string;
  loaded: boolean;
}) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 0, px: 0.25 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ color, lineHeight: 1.2 }}>
        {loaded ? value : '—'}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mt: 0.35, lineHeight: 1.25, fontSize: '0.6875rem' }}
      >
        {label}
      </Typography>
    </Box>
  );
}

const Dashboard: React.FC<DashboardProps> = ({
  diagnosticos,
  controles,
  medidas,
  programaMedidas,
  getDiagnosticoMaturity,
  programaId,
  grupoImpleFilter = 'all',
  onDiagnosticoClick,
  dataLoading = false,
}) => {
  const theme = useTheme();

  const stats = useMemo(() => {
    let totalControles = 0;
    let totalMedidas = 0;
    let medidasRespondidas = 0;
    let somaMaturityDiagnosticos = 0;
    let diagnosticosComIndice = 0;

    diagnosticos.forEach((diagnostico) => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      totalControles += diagnosticoControles.length;

      const maturityData = getDiagnosticoMaturity(diagnostico.id);
      if (diagnosticoControles.length > 0) {
        somaMaturityDiagnosticos += maturityData.score;
        diagnosticosComIndice++;
      }

      const { total, respondidas } = countMedidasForDiagnostico(
        diagnostico.id,
        diagnosticoControles,
        medidas,
        programaMedidas,
        programaId,
      );
      totalMedidas += total;
      medidasRespondidas += respondidas;
    });

    const avgMaturity =
      diagnosticosComIndice > 0 ? somaMaturityDiagnosticos / diagnosticosComIndice : 0;
    const pctRespondidas = totalMedidas > 0 ? (medidasRespondidas / totalMedidas) * 100 : 0;

    return {
      totalDiagnosticos: diagnosticos.length,
      totalControles,
      totalMedidas,
      medidasRespondidas,
      avgMaturity,
      pctRespondidas,
    };
  }, [diagnosticos, controles, medidas, programaMedidas, getDiagnosticoMaturity, programaId, grupoImpleFilter]);

  const maturityOverview = formatMaturityIndex(stats.avgMaturity);
  const heroColor = maturityOverview?.color ?? theme.palette.primary.main;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {dataLoading && (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} aria-label="Carregando dados do diagnóstico" />
      )}

      <Grid container spacing={2.5}>
        {/* Hero — índice consolidado */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(heroColor, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 55%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              borderLeft: `4px solid ${heroColor}`,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', lg: 'center' }}
                justifyContent="space-between"
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(heroColor, 0.14),
                      color: heroColor,
                      flexShrink: 0,
                      boxShadow: `0 4px 14px ${alpha(heroColor, 0.2)}`,
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 30 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        fontSize: { xs: '1.25rem', sm: '1.45rem' },
                        mb: 1,
                      }}
                    >
                      {maturityOverview ? (
                        <>
                          Índice médio{' '}
                          <Box component="span" sx={{ color: heroColor }}>
                            {maturityOverview.indexText}
                          </Box>
                          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {' '}
                            · {maturityOverview.label}
                          </Box>
                        </>
                      ) : (
                        'Índice de maturidade'
                      )}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip
                        label="Visão geral"
                        size="small"
                        sx={{
                          height: 24,
                          fontWeight: 800,
                          fontSize: '0.6875rem',
                          letterSpacing: 0.3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                        }}
                      />
                      <Chip
                        label="PPSI 2.0"
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontWeight: 700, fontSize: '0.6875rem' }}
                      />
                      <Chip
                        label="AIGP"
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontWeight: 700, fontSize: '0.6875rem' }}
                      />
                    </Stack>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 1.25,
                    width: '100%',
                    maxWidth: { lg: 480 },
                    flexShrink: 0,
                  }}
                >
                {[
                  {
                    label: 'Medidas respondidas',
                    value: stats.medidasRespondidas,
                    sub: `${stats.pctRespondidas.toFixed(0)}% de ${stats.totalMedidas}`,
                    color: theme.palette.success.main,
                  },
                  {
                    label: 'Pendentes',
                    value: stats.totalMedidas - stats.medidasRespondidas,
                    sub: 'aguardando avaliação',
                    color: theme.palette.warning.main,
                  },
                  {
                    label: 'Diagnósticos',
                    value: stats.totalDiagnosticos,
                    sub: '4 eixos',
                    color: theme.palette.info.main,
                  },
                ].map((kpi) => (
                  <Box
                    key={kpi.label}
                    sx={{
                      textAlign: 'center',
                      px: 1,
                      py: 1.35,
                      borderRadius: 1.5,
                      bgcolor: alpha(kpi.color, 0.08),
                      border: `1px solid ${alpha(kpi.color, 0.2)}`,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                      sx={{ lineHeight: 1.2, fontSize: '0.6875rem', mb: 0.35 }}
                    >
                      {kpi.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: kpi.color, lineHeight: 1.15 }}>
                      {dataLoading && stats.totalMedidas === 0 ? '…' : kpi.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: '0.65rem', lineHeight: 1.2, mt: 0.25 }}
                    >
                      {kpi.sub}
                    </Typography>
                  </Box>
                ))}
                </Box>
              </Stack>

              <Box sx={{ mt: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Progresso de respostas (todos os diagnósticos)
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: heroColor }}>
                    {stats.pctRespondidas.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, stats.pctRespondidas)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.divider, 0.35),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: heroColor,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Cards por diagnóstico */}
        {diagnosticos.map((diagnostico) => {
          const diagnosticoControles = controles[diagnostico.id];
          const controlesLoaded = diagnosticoControles !== undefined;
          const diagnosticoControlesList = diagnosticoControles || [];
          const controlesComMedidasNoFiltro = diagnosticoControlesList.filter(
            (c) => (medidas[c.id] || []).length > 0,
          );

          const { total: totalMedidasDiag, respondidas: medidasRespondidasDiag } =
            countMedidasForDiagnostico(
              diagnostico.id,
              diagnosticoControlesList,
              medidas,
              programaMedidas,
              programaId,
            );

          const maturityData = getDiagnosticoMaturity(diagnostico.id);
          const maturityColor = getMaturityColorHex(maturityData.score);
          const indiceLabel =
            (typeof diagnostico.indice === 'string' && diagnostico.indice) ||
            INDICE_DIAG[diagnostico.id] ||
            `D${diagnostico.id}`;

          return (
            <Grid item xs={12} sm={6} lg={3} key={diagnostico.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: onDiagnosticoClick ? 'pointer' : 'default',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  borderTop: `3px solid ${maturityColor}`,
                  boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.06)}`,
                  '&:hover': onDiagnosticoClick
                    ? {
                        boxShadow: `0 8px 24px ${alpha(maturityColor, 0.18)}`,
                        transform: 'translateY(-2px)',
                      }
                    : undefined,
                }}
                onClick={() => onDiagnosticoClick?.(diagnostico.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
                    {diagnosticoIcon(diagnostico.id, maturityColor)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="overline"
                        sx={{ fontWeight: 800, color: 'text.secondary', lineHeight: 1.1, fontSize: '0.65rem' }}
                      >
                        {indiceLabel}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.25,
                          fontSize: '0.95rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {diagnostico.descricao}
                      </Typography>
                    </Box>
                  </Box>

                  {!controlesLoaded ? (
                    <Skeleton variant="rounded" height={36} sx={{ mb: 1.5 }} />
                  ) : (
                    <Box sx={{ textAlign: 'center', mb: 1.5 }}>
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
                  )}

                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1.5 }}>
                    {controlesLoaded ? (
                      <>
                        <strong>{medidasRespondidasDiag}</strong> de {totalMedidasDiag} medidas respondidas
                      </>
                    ) : (
                      'Carregando controles…'
                    )}
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      pt: 1.5,
                    }}
                  >
                    <DiagnosticoStatCell
                      loaded={controlesLoaded}
                      value={controlesComMedidasNoFiltro.length}
                      label="Controles"
                      color={theme.palette.primary.main}
                    />
                    <DiagnosticoStatCell
                      loaded={controlesLoaded}
                      value={totalMedidasDiag}
                      label="Medidas"
                      color={theme.palette.success.main}
                    />
                    <DiagnosticoStatCell
                      loaded={controlesLoaded}
                      value={medidasRespondidasDiag}
                      label="Respondidas"
                      color={maturityColor}
                    />
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
