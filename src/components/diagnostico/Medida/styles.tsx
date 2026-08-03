import { Theme, alpha } from '@mui/material/styles';
import type { DiagnosticoTheme } from '@/lib/utils/diagnosticoThemes';
import { diagnosticoGlassPanel } from '@/lib/utils/diagnosticoSurfaceStyles';

/**
 * Styles for the Medida component — glass / pill alinhado ao diagnóstico novo.
 */
export const medidaStyles = {
  container: (theme: Theme, diagTheme?: DiagnosticoTheme) => ({
    ...diagnosticoGlassPanel(theme, diagTheme?.color),
    p: { xs: 2, sm: 2.5 },
    mb: 2,
    position: 'relative' as const,
    overflow: 'hidden',
  }),

  headerBand: (_theme: Theme, diagTheme: DiagnosticoTheme) => ({
    px: 2,
    py: 1.5,
    mb: 2,
    borderRadius: 2,
    background: diagTheme.gradient,
    color: '#fff',
    boxShadow: `0 6px 20px ${alpha(diagTheme.color, 0.2)}`,
  }),

  headerTitle: {
    fontWeight: 800,
    fontSize: '1rem',
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  },

  headerMeta: {
    opacity: 0.88,
    fontWeight: 600,
    fontSize: '0.8125rem',
    mt: 0.5,
  },

  responseCard: (theme: Theme, accentColor: string) => ({
    ...diagnosticoGlassPanel(theme, accentColor),
    p: 2,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
  }),

  responseTitle: (theme: Theme) => ({
    color: theme.palette.text.secondary,
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    mb: 1,
    textAlign: 'center' as const,
  }),

  actionPlanCard: (theme: Theme, statusColor?: string) => ({
    ...diagnosticoGlassPanel(theme, statusColor ?? theme.palette.warning.main),
    p: 2,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    ...(statusColor
      ? {
          bgcolor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.12 : 0.08),
        }
      : {}),
  }),

  actionPlanTitle: (theme: Theme) => ({
    color: theme.palette.text.secondary,
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    mb: 1,
    textAlign: 'center' as const,
  }),

  descriptionSection: (theme: Theme, accentColor: string) => ({
    ...diagnosticoGlassPanel(theme, accentColor),
    p: 2,
    my: 2,
    bgcolor: alpha(accentColor, theme.palette.mode === 'dark' ? 0.06 : 0.04),
  }),

  descriptionText: (theme: Theme) => ({
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 1.65,
    color: theme.palette.text.secondary,
    fontSize: '0.9375rem',
  }),

  infoCallout: (theme: Theme, accentColor: string) => ({
    ...diagnosticoGlassPanel(theme, accentColor),
    p: 1.75,
    mb: 2,
    bgcolor: alpha(accentColor, theme.palette.mode === 'dark' ? 0.1 : 0.06),
  }),

  formSection: (theme: Theme, accentColor: string) => ({
    ...diagnosticoGlassPanel(theme, accentColor),
    p: { xs: 2, sm: 2.5 },
    mt: 2,
  }),

  selectContainer: {
    width: '100%',
    mb: 2,
  },
  textFieldContainer: {
    display: 'flex',
    gap: 1,
  },
  textField: {
    width: '100%',
  },
  saveButton: {
    minWidth: 'auto',
  },
  datePicker: {
    width: '100%',
    mb: 2,
  },
};
