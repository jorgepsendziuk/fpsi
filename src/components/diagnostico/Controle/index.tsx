import React from 'react';
import {
  Typography,
  Select,
  MenuItem,
  Box,
  Chip,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PolicyIcon from '@mui/icons-material/Policy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Controle, Medida, Diagnostico, Responsavel, ProgramaControle } from '../../../lib/types/types';
import MaturityChip from '../MaturityChip';
import { ResourceLastUpdateLine } from '@/components/common/ResourceLastUpdateLine';
import { formatDateTimePtBr } from '@/components/common/LastUpdateInfo';
import { incc } from '../../../lib/utils/utils';
import { getDiagnosticoTheme } from '@/lib/utils/diagnosticoThemes';
import {
  diagnosticoGlassPanel,
  diagnosticoHeaderBand,
  diagnosticoHeaderBadge,
  diagnosticoInfoSection,
} from '@/lib/utils/diagnosticoSurfaceStyles';
import { labelGrupoGi, normalizeGrupoImpleCode } from '@/lib/utils/grupoImplementacao';

export interface ControleProps {
  controle: Controle;
  programaControle?: ProgramaControle;
  diagnostico: Diagnostico;
  medidas: Medida[];
  programaId: number;
  programaPathSegment?: string;
  responsaveis: Responsavel[];
  handleINCCChange: (controleId: number, value: number) => void;
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  calculateMaturityIndex: (controle: Controle) => number;
  onMedidaNavigate?: (medidaId: number, controleId: number) => void;
}

type InfoType =
  | 'texto'
  | 'por_que_implementar'
  | 'procedimentos_e_ferramentas'
  | 'fique_atento'
  | 'aplicabilidade_privacidade';

const INFO_SECTION_ORDER: InfoType[] = [
  'texto',
  'por_que_implementar',
  'procedimentos_e_ferramentas',
  'fique_atento',
  'aplicabilidade_privacidade',
];

const infoLabels: Record<InfoType, string> = {
  texto: 'Visão geral',
  por_que_implementar: 'Por que este controle é crítico',
  procedimentos_e_ferramentas: 'Procedimentos e ferramentas',
  fique_atento: 'Fique atento',
  aplicabilidade_privacidade: 'Aplicabilidade em privacidade',
};

const tabIcons: Record<InfoType, React.ReactElement> = {
  texto: <DescriptionOutlinedIcon fontSize="small" />,
  por_que_implementar: <HelpOutlineOutlinedIcon fontSize="small" />,
  procedimentos_e_ferramentas: <BuildOutlinedIcon fontSize="small" />,
  fique_atento: <ErrorOutlineOutlinedIcon fontSize="small" />,
  aplicabilidade_privacidade: <SecurityOutlinedIcon fontSize="small" />,
};

function getStatusColor(diagnosticoId: number, respostaNum: number | undefined, hasResponse: boolean): string {
  if (!hasResponse || respostaNum === undefined || Number.isNaN(respostaNum)) return '#9E9E9E';
  if (diagnosticoId === 1) return respostaNum === 1 ? '#4CAF50' : '#FF5252';
  switch (respostaNum) {
    case 1: return '#4CAF50';
    case 2: return '#8BC34A';
    case 3: return '#FFC107';
    case 4: return '#FF9800';
    case 5: return '#FF5252';
    case 6: return '#9E9E9E';
    default: return '#9E9E9E';
  }
}

function getStatusLabel(diagnosticoId: number, respostaNum: number | undefined, hasResponse: boolean): string {
  if (!hasResponse || respostaNum === undefined || Number.isNaN(respostaNum)) return 'Não respondida';
  if (diagnosticoId === 1) return respostaNum === 1 ? 'Sim' : 'Não';
  switch (respostaNum) {
    case 1: return 'Adota totalmente';
    case 2: return 'Adota em menor parte';
    case 3: return 'Adota parcialmente';
    case 4: return 'Há plano aprovado';
    case 5: return 'Não adota';
    case 6: return 'Não se aplica';
    default: return 'Não respondida';
  }
}

const ControleComponent: React.FC<ControleProps> = ({
  controle,
  programaControle,
  diagnostico,
  medidas,
  programaId,
  programaPathSegment,
  handleINCCChange,
  onMedidaNavigate,
  calculateMaturityIndex,
}) => {
  const theme = useTheme();
  const diagTheme = getDiagnosticoTheme(diagnostico.id);
  const maturityScore = calculateMaturityIndex(controle);

  return (
    <Box sx={{ mb: 2 }}>
      {/* Cabeçalho do controle */}
      <Box sx={diagnosticoHeaderBand(diagTheme)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box sx={diagnosticoHeaderBadge()}>{controle.numero}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: 1, lineHeight: 1.2 }}>
                Controle
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', lineHeight: 1.3, mt: 0.25 }}>
                {controle.nome}
              </Typography>
              {controle.programa_controle_id ? (
                <ResourceLastUpdateLine
                  programaId={programaId}
                  programaPathSegment={programaPathSegment}
                  resourceType="controle"
                  resourceId={controle.programa_controle_id}
                  dbUpdatedAt={controle.programa_controle_updated_at ?? null}
                  sx={{ mt: 0.75, '& .MuiTypography-root': { color: alpha('#fff', 0.88) } }}
                />
              ) : null}
            </Box>
          </Box>

          <Box
            sx={{
              ...diagnosticoGlassPanel(theme),
              px: 2,
              py: 1.25,
              minWidth: { md: 180 },
              textAlign: 'center',
              bgcolor: alpha('#fff', 0.12),
              border: `1px solid ${alpha('#fff', 0.22)}`,
              alignSelf: { xs: 'stretch', md: 'center' },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.9, letterSpacing: 0.5 }}>
              Índice de maturidade
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.2, my: 0.5 }}>
              {maturityScore.toFixed(2)}
            </Typography>
            <MaturityChip
              score={maturityScore}
              size="small"
              showLabel
              controleId={controle.id}
              controleNome={controle.nome}
            />
          </Box>
        </Box>
      </Box>

      {/* INCC */}
      <Box sx={{ ...diagnosticoGlassPanel(theme, diagTheme.color), p: 2, mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
          Nível de Capacidade do Controle (INCC)
        </Typography>
        <Select
          fullWidth
          size="small"
          value={programaControle?.nivel || ''}
          onChange={(event) => {
            handleINCCChange(controle.id, parseInt(event.target.value.toString(), 10));
          }}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          {incc.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              <Box sx={{ py: 0.25 }}>
                <Typography variant="body2" fontWeight={700}>
                  Nível {item.nivel} — {item.indice}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'normal', display: 'block' }}>
                  {item.label}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Orientações do controle */}
      <Box sx={{ mt: 2 }}>
        {INFO_SECTION_ORDER.map((info) => {
          const content = controle[info];
          if (!content || String(content).trim() === '') return null;

          return (
            <Box key={info} sx={{ ...diagnosticoInfoSection(theme, diagTheme.accent), mb: 1.5 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ color: diagTheme.color, display: 'flex' }}>{tabIcons[info]}</Box>
                <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  {infoLabels[info]}
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.65, color: 'text.primary' }}>
                  {content}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Lista de medidas */}
      <Box sx={{ mt: 2.5 }}>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: diagTheme.color }}
        >
          <PolicyIcon fontSize="small" />
          Medidas ({medidas.length})
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {medidas.map((medida) => {
            const respostaRaw = medida.programa_medida?.resposta;
            const respostaNum =
              typeof respostaRaw === 'string' ? parseInt(respostaRaw, 10) : respostaRaw;
            const hasResponse =
              respostaNum !== undefined && respostaNum !== null && !Number.isNaN(respostaNum);
            const statusColor = getStatusColor(diagnostico.id, respostaNum, hasResponse);
            const giCode = normalizeGrupoImpleCode(medida.grupo_imple);

            return (
              <Box
                key={medida.id}
                onClick={() => onMedidaNavigate?.(medida.id, controle.id)}
                sx={{
                  ...diagnosticoGlassPanel(theme, statusColor),
                  p: 1.5,
                  cursor: onMedidaNavigate ? 'pointer' : 'default',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  bgcolor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                  ...(onMedidaNavigate && {
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(statusColor, 0.18)}`,
                    },
                  }),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: statusColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    {medida.id_medida || medida.id}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {medida.medida}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75, alignItems: 'center' }}>
                      <Chip
                        label={getStatusLabel(diagnostico.id, respostaNum, hasResponse)}
                        size="small"
                        sx={{
                          height: 24,
                          bgcolor: statusColor,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                        }}
                      />
                      {giCode && (
                        <Chip
                          label={labelGrupoGi(giCode as 'G1' | 'G2' | 'G3')}
                          size="small"
                          variant="outlined"
                          sx={{ height: 24, fontSize: '0.6875rem', fontWeight: 700 }}
                        />
                      )}
                      {medida.programa_medida?.updated_at && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTimePtBr(medida.programa_medida.updated_at)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {onMedidaNavigate && (
                    <IconButton size="small" sx={{ color: diagTheme.color, flexShrink: 0 }} aria-label="Abrir medida">
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default ControleComponent;
