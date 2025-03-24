import { Theme } from '@mui/material/styles';

/**
 * Styles for the Medida component
 */
export const medidaStyles = {
  accordion: {
    border: '1px solid #ccc',
    marginBottom: 2,
  },
  accordionSummary: {
    minHeight: 64,
    width: '100%',
  },
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
    opacity: 0.9,
    padding: '0 10px',
    width: '100%',
    maxWidth: '160px',
    fontWeight: 'bold',
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