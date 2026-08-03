import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Tune as TuneIcon,
  FactCheck as FactCheckIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';
import { MaturityLevelIndicator } from './MaturityLevelIndicator';
import { GrupoImplementacaoFilter } from './GrupoImplementacaoFilter';
import { CoberturaRespostasIndicator } from './CoberturaRespostasIndicator';
import { type GrupoImpleFilter, DIAGNOSTICO_SEGURANCA_ID, isDiagnosticoSeguranca, matchesGrupoFilter } from '../../lib/utils/grupoImplementacao';
import { getDiagnosticoTheme } from '../../lib/utils/diagnosticoThemes';
import { DIAGNOSTICO_INDICE_LABELS } from '../../lib/utils/diagnosticoTreeLabels';
import { getMaturityColorHex } from '../../lib/utils/maturity';
import { escopoGreyedSx, ESCOPO_CHIP_LABEL } from '@/lib/programa/escopoVisual';

interface DashboardProps {
  diagnosticos: any[];
  controles: { [key: number]: any[] };
  medidas: { [key: number]: any[] };
  programaMedidas: { [key: string]: any };
  getControleMaturity: (controle: any, medidas: any[], programaControle: any, programaMedidas?: { [key: string]: any }) => any;
  getDiagnosticoMaturity: (diagnosticoId: number) => any;
  programaId: number;
  grupoImpleFilter?: GrupoImpleFilter;
  onGrupoImpleFilterChange?: (value: GrupoImpleFilter) => void;
  onDiagnosticoClick?: (diagnosticoId: number) => void;
  dataLoading?: boolean;
  /** IDs de eixos fora do escopo — cards cinza, consultáveis, não contam no score */
  diagnosticosOutOfScopeIds?: number[];
  onAtivarDiagnostico?: (diagnosticoId: number) => void;
}

const INDICE_DIAG = DIAGNOSTICO_INDICE_LABELS;

function usesEscalaRespostas(diagnosticoId: number): boolean {
  return diagnosticoId !== 1;
}

function diagnosticoIcon(id: number) {
  const sx = { fontSize: 26 };
  switch (id) {
    case 1: return <AccountBalanceIcon sx={sx} />;
    case 2: return <LockIcon sx={sx} />;
    case 3: return <PersonIcon sx={sx} />;
    case 4: return <PsychologyIcon sx={sx} />;
    default: return <AssessmentIcon sx={sx} />;
  }
}

function countMedidasForDiagnostico(
  diagnosticoId: number,
  diagnosticoControles: any[],
  medidas: { [key: number]: any[] },
  programaMedidas: { [key: string]: any },
  programaId: number,
  grupoImpleFilter: GrupoImpleFilter = "all",
) {
  let total = 0;
  let respondidas = 0;

  diagnosticoControles.forEach((controle) => {
    const controleMedidas = (medidas[controle.id] || []).filter((medida: any) =>
      isDiagnosticoSeguranca(diagnosticoId)
        ? matchesGrupoFilter(medida.grupo_imple, grupoImpleFilter)
        : true
    );
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
  icon,
}: {
  value: number | string;
  label: string;
  color: string;
  loaded: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        minWidth: 0,
        px: 0.75,
        py: 0.65,
        borderRadius: 1.5,
        bgcolor: alpha(color, 0.06),
        border: `1px solid ${alpha(color, 0.12)}`,
      }}
    >
      <Box sx={{ color, opacity: 0.85, mb: 0.35, '& svg': { fontSize: 18 } }}>{icon}</Box>
      <Typography variant="h6" fontWeight={800} sx={{ color, lineHeight: 1.1, fontSize: '1.1rem' }}>
        {loaded ? value : '—'}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        display="block"
        sx={{ mt: 0.25, lineHeight: 1.2, fontSize: '0.8125rem', fontWeight: 600 }}
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
  onGrupoImpleFilterChange,
  onDiagnosticoClick,
  dataLoading = false,
  diagnosticosOutOfScopeIds = [],
  onAtivarDiagnostico,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const outOfScopeSet = useMemo(() => new Set(diagnosticosOutOfScopeIds), [diagnosticosOutOfScopeIds]);
  const diagnosticosNoScore = useMemo(
    () => diagnosticos.filter((d) => !outOfScopeSet.has(d.id)),
    [diagnosticos, outOfScopeSet]
  );

  const stats = useMemo(() => {
    let totalMedidas = 0;
    let medidasRespondidas = 0;

    diagnosticosNoScore.forEach((diagnostico) => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      const { total, respondidas } = countMedidasForDiagnostico(
        diagnostico.id,
        diagnosticoControles,
        medidas,
        programaMedidas,
        programaId,
        grupoImpleFilter,
      );
      totalMedidas += total;
      medidasRespondidas += respondidas;
    });

    return {
      totalMedidas,
      medidasRespondidas,
    };
  }, [diagnosticosNoScore, controles, medidas, programaMedidas, programaId, grupoImpleFilter]);

  return (
    <Box sx={{ p: { xs: 1.25, md: 1.5 } }}>
      {dataLoading && (
        <LinearProgress sx={{ mb: 1.25, borderRadius: 1 }} aria-label="Carregando dados do diagnóstico" />
      )}

      <Grid container spacing={1.75}>
        {/* Resumo discreto de cobertura */}
        <Grid item xs={12}>
          <CoberturaRespostasIndicator
            respondidas={stats.medidasRespondidas}
            total={stats.totalMedidas}
            loading={dataLoading}
          />
        </Grid>

        {/* Cards por eixo */}
        {diagnosticos.map((diagnostico) => {
          const outOfScope = outOfScopeSet.has(diagnostico.id);
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
              grupoImpleFilter,
            );

          const maturityData = getDiagnosticoMaturity(diagnostico.id);
          const maturityColor = getMaturityColorHex(maturityData.score);
          const diagTheme = getDiagnosticoTheme(diagnostico.id);
          const indiceLabel =
            (typeof diagnostico.indice === 'string' && diagnostico.indice) ||
            INDICE_DIAG[diagnostico.id] ||
            `D${diagnostico.id}`;
          const clickable = Boolean(onDiagnosticoClick);

          return (
            <Grid item xs={12} sm={6} key={diagnostico.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  cursor: clickable ? 'pointer' : 'default',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.5 : 0.95),
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, opacity 0.22s ease',
                  ...(outOfScope ? escopoGreyedSx(theme) : {}),
                  ...(clickable && !outOfScope && {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 16px 40px ${alpha(diagTheme.color, 0.2)}`,
                      borderColor: alpha(diagTheme.color, 0.35),
                      '& .diag-card-cta': {
                        opacity: 1,
                        transform: 'translateX(0)',
                      },
                      '& .diag-card-header': {
                        filter: 'brightness(1.05)',
                      },
                    },
                  }),
                }}
                onClick={() => onDiagnosticoClick?.(diagnostico.id)}
              >
                {/* Faixa gradiente */}
                <Box
                  className="diag-card-header"
                  sx={{
                    px: 1.75,
                    py: 1.15,
                    background: outOfScope ? alpha(theme.palette.text.primary, 0.15) : diagTheme.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'filter 0.22s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha('#fff', 0.18),
                      color: '#fff',
                      border: `1px solid ${alpha('#fff', 0.22)}`,
                      flexShrink: 0,
                    }}
                  >
                    {diagnosticoIcon(diagnostico.id)}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      color: '#fff',
                      fontWeight: 800,
                      lineHeight: 1.25,
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    <Box component="span" sx={{ opacity: 0.92 }}>{indiceLabel}</Box>
                    <Box component="span" sx={{ mx: 0.75, opacity: 0.55, fontWeight: 600 }}>·</Box>
                    {diagnostico.descricao}
                  </Typography>
                  {clickable && (
                    <ArrowForwardIcon
                      className="diag-card-cta"
                      sx={{
                        color: alpha('#fff', 0.9),
                        fontSize: 20,
                        opacity: 0.6,
                        transform: 'translateX(-4px)',
                        transition: 'opacity 0.22s ease, transform 0.22s ease',
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ px: 1.75, py: 1.25, '&:last-child': { pb: 1.25 } }}>
                  {outOfScope && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                      <Chip size="small" label={ESCOPO_CHIP_LABEL} sx={{ height: 22, fontSize: '0.68rem' }} />
                      {onAtivarDiagnostico && (
                        <Chip
                          size="small"
                          icon={<AddCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                          label="Incluir no escopo"
                          clickable
                          onClick={(e) => {
                            e.stopPropagation();
                            onAtivarDiagnostico(diagnostico.id);
                          }}
                          sx={{ height: 22, fontSize: '0.68rem' }}
                        />
                      )}
                    </Stack>
                  )}
                  <Box sx={{ mb: 1 }}>
                    {!controlesLoaded ? (
                      <Skeleton variant="rounded" height={28} sx={{ maxWidth: 240, mx: 'auto' }} />
                    ) : (
                      <MaturityLevelIndicator
                        score={maturityData.score}
                        label={maturityData.label}
                        calculationData={maturityData.calculationData}
                        controleNome={`Diagnóstico ${diagnostico.id}`}
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    {controlesLoaded ? (
                      <CoberturaRespostasIndicator
                        compact
                        respondidas={medidasRespondidasDiag}
                        total={totalMedidasDiag}
                        loading={dataLoading}
                        barColor={diagTheme.color}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ fontWeight: 600 }}>
                        Carregando controles…
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 0.65,
                    }}
                  >
                    <DiagnosticoStatCell
                      loaded={controlesLoaded}
                      value={controlesComMedidasNoFiltro.length}
                      label="Controles"
                      color={diagTheme.color}
                      icon={<TuneIcon />}
                    />
                    <DiagnosticoStatCell
                      loaded={controlesLoaded}
                      value={totalMedidasDiag}
                      label="Medidas"
                      color={theme.palette.info.main}
                      icon={<FactCheckIcon />}
                    />
                    <DiagnosticoStatCell
                      loaded={controlesLoaded}
                      value={medidasRespondidasDiag}
                      label="Respondidas"
                      color={maturityColor}
                      icon={<CheckCircleOutlineIcon />}
                    />
                  </Box>

                  {diagnostico.id === DIAGNOSTICO_SEGURANCA_ID && onGrupoImpleFilterChange && (
                    <GrupoImplementacaoFilter
                      compact
                      stopClickPropagation
                      value={grupoImpleFilter}
                      onChange={onGrupoImpleFilterChange}
                    />
                  )}
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
