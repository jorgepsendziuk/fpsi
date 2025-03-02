import { useTheme } from '@mui/material/styles';

/**
 * Custom hook to provide theme-aware colors for components
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

  return {
    getContrastTextColor,
    getBackgroundContrastColor,
    getAccordionBackgroundColor,
    getAccordionSummaryBackgroundColor,
    getAccordionHoverBackgroundColor,
    getAccordionBorderColor,
    theme,
  };
}
