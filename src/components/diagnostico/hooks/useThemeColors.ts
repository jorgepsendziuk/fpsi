import { useTheme } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/material';

/**
 * Custom hook to provide theme-aware colors and styles for components
 */
export function useThemeColors() {
  const theme = useTheme();
  
  const getContrastTextColor = () => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };
  
  const getBackgroundContrastColor = () => {
    // For shield icon, always return white
    return '#FFFFFF'; // White text on primary color background always
  };

  const getAccordionBackgroundColor = () => {
    return theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper';
  };

  const getAccordionSummaryBackgroundColor = () => {
    return theme.palette.mode === 'dark' ? 'rgba(80, 80, 80, 0.9)' : 'grey.100'; 
  };

  const getAccordionHoverBackgroundColor = () => {
    return theme.palette.mode === 'dark' ? 'rgba(90, 90, 90, 0.9)' : 'action.hover';
  };

  const getAccordionBorderColor = () => {
    return theme.palette.mode === 'dark' ? 'rgba(120, 120, 120, 0.3)' : 'grey.300';
  };

  // Estilos padrão para todos os accordions
  const accordionStyles: SxProps<Theme> = {
    width: '100%', // Força largura total em todos os accordions
    mb: 2, // Margem inferior reduzida
    borderRadius: 2,
    '&:before': {
      display: 'none',
    },
    backgroundColor: getAccordionBackgroundColor(),
    '& .MuiAccordionSummary-root': {
      borderRadius: 2,
      backgroundColor: getAccordionBackgroundColor(),
      transition: 'all 0.2s ease-in-out',
      padding: 2, // Padding padrão para todos os AccordionSummary
      minHeight: 72, // Altura mínima padrão
      '&:hover': {
        backgroundColor: getAccordionHoverBackgroundColor(),
      },
      '& .MuiAccordionSummary-content': {
        margin: '16px 0',
        gap: 2, // Gap padrão para elementos dentro do content
      },
    },
    boxShadow: 2,
    border: 'none',
    '&.Mui-expanded': {
      margin: '0 0 16px 0', // Margem inferior reduzida para accordions expandidos
      boxShadow: 4,
      backgroundColor: getAccordionBackgroundColor(),
      '& .MuiAccordionSummary-root': {
        backgroundColor: getAccordionSummaryBackgroundColor(),
        borderBottom: '1px solid',
        borderColor: getAccordionBorderColor(),
      },
    },
    '& .MuiTypography-root': {
      color: getContrastTextColor(),
    },
    '& .MuiAccordionDetails-root': {
      backgroundColor: getAccordionBackgroundColor(),
      p: 3, // Padding padrão para todos os AccordionDetails
    },
  };

  return {
    getContrastTextColor,
    getBackgroundContrastColor,
    getAccordionBackgroundColor,
    getAccordionSummaryBackgroundColor,
    getAccordionHoverBackgroundColor,
    getAccordionBorderColor,
    accordionStyles,
    theme,
  };
}
