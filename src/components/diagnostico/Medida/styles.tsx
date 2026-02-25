import { Theme } from '@mui/material/styles';

/**
 * Styles for the Medida component
 */
export const medidaStyles = {
  // Container principal com gradient
  container: (theme: Theme) => ({
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #3c3c5a 100%)'
      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
    borderRadius: '16px',
    padding: 3,
    marginBottom: 3,
    border: theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  }),

  // Header da medida
  header: (theme: Theme) => ({
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    borderRadius: '12px',
    padding: 2,
    marginBottom: 2,
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
  }),

  // Título do header
  headerTitle: (theme: Theme) => ({
    color: 'white',
    fontWeight: 700,
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  }),

  // ID da medida em destaque
  idBadge: (theme: Theme) => ({
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontWeight: 700,
    fontSize: '1rem',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
  }),

  // Card de resposta em destaque
  responseCard: (theme: Theme, hasResponse: boolean) => ({
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    padding: 2,
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }),

  // Título da seção de resposta
  responseTitle: (theme: Theme, hasResponse: boolean) => ({
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: '0.875rem',
    marginBottom: 1,
    textAlign: 'center',
    flex: '0 0 auto',
  }),

  // Card do plano de trabalho
  actionPlanCard: (theme: Theme, statusColor?: string) => ({
    background: statusColor 
      ? theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${statusColor}20 0%, ${statusColor}10 100%)`
        : `linear-gradient(135deg, ${statusColor}40 0%, ${statusColor}20 100%)`
      : theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    padding: 2,
    border: statusColor
      ? `1px solid ${statusColor}60`
      : theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }),

  // Título da seção de plano de trabalho
  actionPlanTitle: (theme: Theme) => ({
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: '0.875rem',
    marginBottom: 1,
    textAlign: 'center',
    flex: '0 0 auto',
  }),

  // Seção de descrição
  descriptionSection: (theme: Theme) => ({
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    padding: 2,
    marginTop: 2,
    marginBottom: 2,
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)',
  }),

  // Texto da descrição
  descriptionText: (theme: Theme) => ({
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 1.6,
    color: theme.palette.text.secondary,
  }),

  // Seções de formulário
  formSection: (theme: Theme) => ({
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    padding: 3,
    marginTop: 2,
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)',
  }),

  // Estilos para medidas em layout direto (sem accordion)
  idSection: (theme: Theme) => ({
    marginTop: 2, 
    textAlign: 'center',
  }),
  titleSection: {
    padding: 1,
    width: '100%',
  },
  selectSection: {
    width: '100%',
  },
  selectContainer: {
    width: '100%',
    marginBottom: 2,
  },
  selectItem: {
    whiteSpace: 'normal',
  },
  statusChip: {
    height: 44,
    marginTop: 0.5,
    opacity: 1,
    padding: '0 10px',
    width: '100%',
    maxWidth: '200px',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
    '& .MuiChip-label': {
      overflow: 'visible',
      whiteSpace: 'normal',
      textAlign: 'center',
      lineHeight: '1.2',
      padding: '6px 0',
      fontSize: '0.95rem',
    }
  },
  description: {
    fontWeight: '60', 
    paddingBottom: 3, 
    paddingTop: 0,
    fontStyle: 'italic',
    marginBottom: 3,
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
    marginBottom: 2,
  },
}; 